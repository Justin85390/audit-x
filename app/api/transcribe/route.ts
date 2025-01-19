export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Log the content type we're receiving
    console.log('Content-Type:', req.headers.get('content-type'));
    
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.error('No file in request');
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create FormData for OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('file', file);
    openAIFormData.append('model', 'whisper-1');
    
    console.log('Sending file:', {
      type: file instanceof File ? file.type : 'not a file',
      size: file instanceof File ? file.size : 'unknown'
    });

    // Direct fetch to OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: openAIFormData
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI Error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }

    const data = await openaiResponse.json();
    console.log('Transcription successful:', data);
    
    return new Response(JSON.stringify({
      transcription: data.text,
      text: data.text
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Transcribe Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to transcribe audio'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 