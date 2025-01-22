export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Direct fetch to OpenAI API
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
          content: "You are a professional language assessor specializing in CEFR (Common European Framework of Reference for Languages) evaluation."
        }, {
          role: "user",
          content: `Please analyze this English speaking sample and provide:

Summary: Start with a clear opening sentence about the speaker's overall fluency and confidence.

Then provide:
1. CEFR level assessment (A1-C2) with brief justification
2. Detailed analysis of:
   - Pronunciation and intonation
   - Fluency and pace
   - Vocabulary use and range
   - Grammar accuracy
   - Communication effectiveness

Speaking sample: "${body.text}"`
        }],
        temperature: 0.7,
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const analysis = data.choices[0].message.content?.trim();

    return new Response(JSON.stringify({ analysis }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to analyze text',
      details: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
