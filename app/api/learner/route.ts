import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Learner API received:', body);

    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: body.email,
        time_commitment: body.time_commitment,
        motivation: body.motivation,
        interests: body.interests,
        topics: body.topics,
        device_preferences: body.device_preferences,
        content_type_preferences: body.content_type_preferences,
        classroom_format: body.classroom_format
      })
      .eq('email', body.email)  // Make sure we update the correct user
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Saved to database:', data);
    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Failed to save learner data' },
      { status: 500 }
    )
  }
} 