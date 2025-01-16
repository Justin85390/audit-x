import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('users')
      .select(`
        email,
        first_name,
        last_name,
        time_commitment,
        motivation,
        interests,
        writing_submission,
        writing_analysis,
        speaking_difficulties_transcript,
        speaking_opinion_transcript,
        speaking_openai_analysis
      `)
      .eq('email', body.email)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 