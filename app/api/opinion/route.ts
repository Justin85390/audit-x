import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, speaking_opinion_transcript, speaking_openai_analysis, speaking_speechace_analysis } = await request.json();

    if (!email || !speaking_opinion_transcript) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update user record
    const { data, error } = await supabase
      .from('users')
      .update({
        speaking_opinion_transcript,
        speaking_openai_analysis,
        speaking_speechace_analysis
      })
      .eq('email', email)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 