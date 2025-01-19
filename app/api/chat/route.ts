import { OLIVER_BASE, OLIVER_WEBAPP } from '@/app/lib/oliver-instructions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.transcription) {
      return new Response(JSON.stringify({ error: 'No transcription provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Combine OLIVER_BASE with OLIVER_WEBAPP for complete instructions
    const combinedInstructions = `${OLIVER_BASE}

When discussing the audit process:
${OLIVER_WEBAPP}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: body.transcription
        }],
        temperature: 0.7,
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const response = data.choices[0].message.content?.trim();

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({
      response: "I apologize, but I'm having trouble processing your request. Could you please try again?"
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const runtime = 'edge'; 