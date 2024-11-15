import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    // Get audio and text from request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const text = formData.get('text') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Get API key
    const keyPath = join(process.cwd(), 'test-key.txt');
    const apiKey = readFileSync(keyPath, 'utf8').trim();
    
    // Build SpeechAce URL with query parameters
    const baseUrl = 'https://api4.speechace.com/api/scoring/text/v9/json';
    const queryParams = new URLSearchParams({
      key: apiKey,
      dialect: 'en-us',
      user_id: '81ozow'  // We can customize this later
    });

    const url = `${baseUrl}?${queryParams.toString()}`;

    // Create form data for SpeechAce
    const speechAceFormData = new FormData();
    speechAceFormData.append('include_fluency', '1');
    speechAceFormData.append('text', text);
    speechAceFormData.append('user_audio_file', audioFile, 'audio.wav');

    console.log('Making request to SpeechAce:', {
      url: url.substring(0, 50) + '...',
      text: text,
      hasAudio: !!audioFile
    });

    // Make request to SpeechAce
    const response = await fetch(url, {
      method: 'POST',
      body: speechAceFormData
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      analysis: data
    });

  } catch (error) {
    console.error('SpeechAce API Error:', error);
    return NextResponse.json({
      error: true,
      message: 'Speech analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
