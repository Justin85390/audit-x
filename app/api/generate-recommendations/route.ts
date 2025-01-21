export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Construct a prompt using all available data
    const prompt = `
      Based on the following English language assessment data, provide 4-5 specific recommendations:
      
      Speaking: ${body.speakingData.cefrLevel} - ${body.speakingData.cefrDetails}
      Learner's Challenges: "${body.speakingData.difficulties_transcript}"
      
      Listening: ${body.listeningData.cefrLevel} - ${body.listeningData.cefrDetails}
      Score: ${body.listeningScore}%
      
      Reading: ${body.readingData.cefrLevel} - ${body.readingData.cefrDetails}
      Score: ${body.readingScore}%
      
      Writing: ${body.writingData.cefrLevel} - ${body.writingData.cefrDetails}
      
      Format each recommendation as a bullet point focusing on specific actions the learner can take.
    `;

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
          content: "You are a professional language learning advisor."
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    const recommendations = data.choices[0].message.content?.trim();

    return new Response(JSON.stringify({ recommendations }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Recommendations error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to generate recommendations'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 