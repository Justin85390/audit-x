export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Make direct fetch call to OpenAI API using chat completions
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
          content: "You are a professional language assessor."
        }, {
          role: "user",
          content: `Please analyze the following English speech sample in terms of:

1. Ability to Understand: Evaluate how well the speaker understands and responds to the topic.
2. Ability to Communicate: Assess fluency, clarity, and effectiveness of expression.
3. CEFR level: Determine the speaker's CEFR level (A1-C2) based on vocabulary, grammar, and overall communication.
4. Key strengths and areas for improvement.

Speech sample to analyze: "${body.text}"

Please format your response with these exact headings:
Ability to Understand:
Ability to Communicate:
CEFR level:
Key strengths`
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

export const runtime = 'edge';
