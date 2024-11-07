import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, type } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      );
    }

    console.log('Received prompt:', prompt);
    console.log('Analysis type:', type);

    const analysisPrompt = type === 'opinion' 
      ? `Please analyze the following spoken opinion and provide feedback on clarity, structure, and persuasiveness: "${prompt}"`
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
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze text',
        details: error.message 
      },
      { status: 500 }
    );
  }
}