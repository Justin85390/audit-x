// This will handle Oliver's audio transcription
// Similar to the original analyze endpoint but Oliver-specific 

export async function POST(req: Request) {
  try {
    // For FormData, we need to handle it differently than JSON
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create FormData for OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('file', file);
    openAIFormData.append('model', 'whisper-1');

    // Make direct fetch call to OpenAI API for audio transcription
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: openAIFormData
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`OpenAI API error: ${transcriptionResponse.status}`);
    }

    const data = await transcriptionResponse.json();
    
    return new Response(JSON.stringify({ 
      transcription: data.text 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process audio',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'edge'; 