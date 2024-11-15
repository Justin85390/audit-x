import { NextResponse } from 'next/server';

export interface SpeechaceResponse {
  speech_score: {
    speechace_score: any;  // Replace 'any' with more specific types based on the actual API response
  }
}

export async function POST(request: Request) {
  try {
    const { audio } = await request.json();

    const response = await fetch('https://api4.speechace.com/api/scoring/speech/v0.5/json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SPEECHACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_data: audio,
        // Add other SpeechAce parameters as needed
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from SpeechAce');
    }

    const speechaceData: SpeechaceResponse = await response.json();
    return NextResponse.json({ analysis: speechaceData.speech_score.speechace_score });
  } catch (error) {
    console.error('SpeechAce API Error:', error);
    return NextResponse.json({ error: 'Failed to analyze speech' }, { status: 500 });
  }
}