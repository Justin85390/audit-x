import { Configuration, OpenAIApi } from 'openai';
import { OLIVER_BASE } from '@/app/lib/oliver-instructions';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function getDefaultResponse(text: string): string {
  if (text.includes('how are you')) {
    return "I'm doing well, thank you! I'm here to help you with the language audit. What would you like to know?";
  } 
  if (text.includes('hello') || text.includes('hi ') || text.includes('hey')) {
    return "Hello! I'm Oliver, your language audit assistant. How can I help you today?";
  }
  if (text.includes('audit')) {
    return "The language audit is a comprehensive assessment that helps us understand your English skills and learning needs. Would you like me to explain more about how it works?";
  }
  if (text.includes('explain') || text.includes('tell me more')) {
    return "The audit takes about 15-20 minutes and includes reading, speaking, and listening exercises. We'll assess your current level and identify areas for improvement. Would you like to start?";
  }
  if (text.includes('thank')) {
    return "You're welcome! Is there anything else you'd like to know about the language audit?";
  }
  return "I understand you're interested in the language audit. Could you please clarify what specific information you'd like to know?";
}

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

    // Create new FormData for OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('file', file);
    openAIFormData.append('model', 'whisper-1');
    
    console.log('Sending file:', {
      type: file instanceof File ? file.type : 'not a file',
      size: file instanceof File ? file.size : 'unknown'
    });

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