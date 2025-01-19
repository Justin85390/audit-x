export async function GET() {
  try {
    // Just test environment variables first
    return new Response(JSON.stringify({
      success: true,
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 7)
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Test Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 