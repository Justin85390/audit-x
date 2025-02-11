export async function GET() {
  try {
    // First test the API key
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: "Say 'API is working!'"
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Full API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: data.choices[0].message.content,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 15),
      fullError: null
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('OpenAI Test Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 15),
      fullError: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 