export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Construct a more detailed prompt
    const prompt = `
      Based on this comprehensive assessment data:
      
      Speaking: ${body.speakingData.cefrLevel} - ${body.speakingData.cefrDetails}
      Learner's Challenges: "${body.speakingData.difficulties_transcript}"
      
      Listening: ${body.listeningData.cefrLevel}
      Score: ${body.listeningScore}%
      
      Reading: ${body.readingData.cefrLevel}
      Score: ${body.readingScore}%
      
      Writing: ${body.writingData.cefrLevel}
      
      Learner Preferences:
      - Time commitment: ${body.preferencesData.timeCommitment}
      - Devices: ${body.preferencesData.devicePreferences.join(', ')}
      - Content types: ${body.preferencesData.contentPreferences.join(', ')}
      
      Provide 5-6 specific, actionable recommendations that:
      1. Address their identified challenges
      2. Match their learning preferences
      3. Target their current CEFR levels
      4. Include specific activities and resources
      
      Format each recommendation as a bullet point.
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