import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// For browser testing
export async function GET(request: Request) {
  try {
    const keyPath = join(process.cwd(), 'test-key.txt');
    const apiKey = readFileSync(keyPath, 'utf8').trim();
    
    // Build URL with query parameters
    const baseUrl = 'https://api4.speechace.com/api/scoring/text/v9/json';
    const queryParams = new URLSearchParams({
      key: apiKey,
      dialect: 'en-us',
      user_id: '81ozow'
    });

    const url = `${baseUrl}?${queryParams.toString()}`;

    // Create form data
    const formData = new FormData();
    formData.append('include_fluency', '1');
    formData.append('text', 'black, dusty, bled, bakery, brick, cartoon, blot, quake, blunt, bern, bird, burn');

    console.log('Making test request without audio');

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      requestInfo: {
        url: url.substring(0, 50) + '...',
        method: 'POST',
        keyLength: apiKey.length
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      error: true,
      message: 'API key test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// For audio testing
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    
    const keyPath = join(process.cwd(), 'test-key.txt');
    const apiKey = readFileSync(keyPath, 'utf8').trim();
    
    const baseUrl = 'https://api4.speechace.com/api/scoring/text/v9/json';
    const queryParams = new URLSearchParams({
      key: apiKey,
      dialect: 'en-us',
      user_id: '81ozow'
    });

    const url = `${baseUrl}?${queryParams.toString()}`;

    const speechAceFormData = new FormData();
    speechAceFormData.append('include_fluency', '1');
    speechAceFormData.append('text', 'black, dusty, bled, bakery, brick, cartoon, blot, quake, blunt, bern, bird, burn');
    speechAceFormData.append('user_audio_file', audioFile, 'audio.wav');

    const response = await fetch(url, {
      method: 'POST',
      body: speechAceFormData
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      requestInfo: {
        url: url.substring(0, 50) + '...',
        method: 'POST',
        hasAudio: !!audioFile
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      error: true,
      message: 'API key test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
