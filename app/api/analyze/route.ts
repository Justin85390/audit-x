export async function POST(req: Request) {
  try {
    const { prompt, type } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'No prompt provided' }, { status: 400 });
    }

    console.log('Received prompt:', prompt);
    console.log('Analysis type:', type);

    const analysisPrompt = type === 'opinion' 
      ? `
            Analyze this English speaking sample and provide short responses for:
            1. Ability to Understand: Assess how well the speaker demonstrates comprehension of the topic, including the use of appropriate responses and relevant vocabulary.
            2. Ability to Communicate: Evaluate the speaker's overall ability to convey their thoughts clearly, including coherence, fluency, and effective use of language.
            3. CEFR level (A1, A2, B1, B2, C1, or C2) with a brief explanation.
            4. Key strengths and areas for improvement.

            Speaking sample: "${prompt}"
          `
      : type === 'writing'
      ? `
            Analyze this English writing sample and provide short responses for:
            1. Task Achievement: Assess how well the writer addresses the task and communicates their ideas.
            2. Coherence & Cohesion: Evaluate the organization, paragraph structure, and use of linking devices.
            3. Vocabulary: Comment on range and accuracy of vocabulary use.
            4. Grammar: Assess grammatical range and accuracy.
            5. CEFR level (A1, A2, B1, B2, C1, or C2) with a brief explanation.
            6. Key strengths and areas for improvement.

            Writing sample: "${prompt}"
          `
      : prompt;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    const analysis = data.choices[0].message.content;
    return new Response(JSON.stringify({ analysis }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to analyze text',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}