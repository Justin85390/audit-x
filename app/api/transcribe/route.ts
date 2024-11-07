import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key missing');
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    
    // Handle text input (for chat)
    if (body.text) {
      // Get chat response from OpenAI
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are Olivia, a friendly AI assistant." },
          { role: "user", content: body.text }
        ]
      });

      const responseText = chatResponse.choices[0].message.content ?? "I'm sorry, I couldn't generate a response.";

      // Generate speech from the response
      const speechResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: responseText,
      });

      // Convert the audio to base64
      const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
      const audioBase64 = audioBuffer.toString('base64');
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

      return NextResponse.json({
        response: responseText,
        audioUrl: audioUrl
      });
    }

    // Handle audio input (existing code)
    const { audio } = body;
    console.log('Audio data received:', typeof audio, audio ? audio.substring(0, 100) : 'no audio');

    if (!audio) {
      console.error('No audio data in request');
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
    }

    // Make sure we're getting a proper data URL
    if (!audio.startsWith('data:audio/webm;base64,')) {
      console.error('Invalid audio format - wrong prefix');
      return NextResponse.json({ error: 'Invalid audio format - expected webm' }, { status: 400 });
    }

    // Extract the base64 data
    const base64Data = audio.split('base64,')[1];
    
    if (!base64Data) {
      console.error('Invalid audio format - no base64 data found');
      return NextResponse.json({ error: 'Invalid audio format - no base64 data' }, { status: 400 });
    }

    console.log('Creating audio file for OpenAI');
    const audioBuffer = Buffer.from(base64Data, 'base64');
    const audioFile = {
      buffer: audioBuffer,
      name: 'audio.webm',
      type: 'audio/webm'
    };

    console.log('Sending to OpenAI');
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
    
    const response = await openai.audio.transcriptions.create({
      file: formData.get('file') as any,
      model: 'whisper-1',
      response_format: 'json',
    });

    console.log('Received OpenAI response');
    return NextResponse.json({ transcription: response.text });
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 