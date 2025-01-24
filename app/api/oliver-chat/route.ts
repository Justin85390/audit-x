// This will handle Oliver's responses with TTS
// Similar to the original transcribe endpoint but Oliver-specific 

import { OLIVER_BASE, OLIVER_WEBAPP } from '@/app/lib/oliver-instructions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Combine OLIVER_BASE with OLIVER_WEBAPP for complete instructions
    const combinedInstructions = `${OLIVER_BASE}

${OLIVER_WEBAPP}`;

    // First get Oliver's response using chat completions
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: combinedInstructions
        }, {
          role: "user",
          content: body.text
        }],
        temperature: 0.7,
      })
    });

    if (!chatResponse.ok) {
      throw new Error(`OpenAI API error: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    const response = chatData.choices[0].message.content?.trim();

    // Then get TTS audio for the response
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'onyx',
        input: response
      })
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      console.error('TTS API error details:', errorData);
      throw new Error(`TTS API error: ${ttsResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    return new Response(JSON.stringify({ 
      response,
      audioUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process chat',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'edge'; 