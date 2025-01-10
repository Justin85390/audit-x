import OpenAI from 'openai';

const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function transcribeWithRetry(openai: OpenAI, formData: FormData, retries = 0): Promise<any> {
  try {
    console.log(`Starting transcription attempt ${retries + 1}`);
    const result = await openai.audio.transcriptions.create({
      file: formData.get('file') as File,
      model: "whisper-1",
      response_format: "json",
      temperature: 0,
    });
    console.log('Transcription successful on attempt', retries + 1);
    return result;
  } catch (error: any) {
    console.error(`Transcription attempt ${retries + 1} failed:`, {
      error: error.message,
      status: error.status,
      response: error.response?.data
    });
    
    if (retries < MAX_RETRIES) {
      console.log(`Waiting ${RETRY_DELAY}ms before retry ${retries + 1}`);
      await wait(RETRY_DELAY);
      return transcribeWithRetry(openai, formData, retries + 1);
    }
    throw error;
  }
}

// Add request counter
let requestCount = 0;

// Simple in-memory cache
const responseCache = new Map();

export async function POST(req: Request) {
  const startTime = new Date().toISOString();
  let body;
  
  requestCount++;
  console.log(`API Request #${requestCount} received`);
  try {
    body = await req.json();
    const cacheKey = JSON.stringify(body);

    // Check cache first
    if (responseCache.has(cacheKey)) {
      console.log('Serving from cache');
      return new Response(responseCache.get(cacheKey), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    console.log('Received request with type:', body.type);
    console.log('Audio data exists:', !!body.audioData);
    
    const { prompt, type, audioData } = body;
    
    if (!prompt && !audioData) {
      return Response.json({ error: 'No prompt or audio data provided' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 8000,
    });

    let transcription;
    if (audioData) {
      try {
        const audioBuffer = Buffer.from(audioData, 'base64');
        console.log('Audio buffer length:', audioBuffer.length);

        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: 'audio/webm' });
        formData.append('file', blob, 'audio.webm');
        
        const transcriptionResponse = await transcribeWithRetry(openai, formData);
        transcription = transcriptionResponse.text;
        console.log('Transcription successful:', transcription);
      } catch (transcriptionError: any) {
        console.error('Transcription error details:', {
          message: transcriptionError.message,
          status: transcriptionError.status,
          response: transcriptionError.response?.data
        });
        throw new Error(`Transcription failed: ${transcriptionError.message}`);
      }
    }

    const analysisPrompt = type === 'opinion' 
      ? `Analyze this English speaking sample...`
      : type === 'transcription'
      ? transcription
      : type === 'writing'
      ? `Analyze this English writing sample...`
      : prompt;

    let analysis = transcription;
    if (type !== 'transcription') {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
          presence_penalty: 0,
          frequency_penalty: 0,
        });
        analysis = completion.choices[0].message.content;
        console.log('Token usage:', {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
          estimatedCost: `$${(completion.usage?.total_tokens || 0) * 0.000002}`
        });
      } catch (analysisError: any) {
        console.error('Analysis error details:', {
          message: analysisError.message,
          status: analysisError.status,
          response: analysisError.response?.data
        });
        throw new Error(`Analysis failed: ${analysisError.message}`);
      }
    }

    // Cache the response
    responseCache.set(cacheKey, JSON.stringify({ analysis, transcription }));

    return new Response(JSON.stringify({ analysis, transcription }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to analyze text',
      details: error.stack,
      name: error.name,
      status: error.status,
      response: error.response?.data
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
export const runtime = 'edge';
