// REFERENCE FILE - DO NOT USE IN PRODUCTION
// This is a backup of the working Supabase setup from January 2024

// 1. Supabase Client Setup
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dhkdfrhlgcpmxhexbtdx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoa2RmcmhsZ2NwbXhoZXhidGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1MjQ1NjEsImV4cCI6MjA1MjEwMDU2MX0.vE_SfOIjvPLk778iXlyuRiwEpnGrEFqIrLoddJCQeoM'
)

// 2. Working User API Route
export async function userApiExample(req: Request) {
  try {
    const body = await req.json()
    console.log('API received:', body)

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify(data),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 3. Working Learner API Route
export async function learnerApiExample(req: Request) {
  try {
    const body = await req.json()
    console.log('Learner API received:', body)

    const { data, error } = await supabase
      .from('users')
      .update({
        time_commitment: body.time_commitment,
        motivation: body.motivation,
        interests: body.interests,
        topics: body.topics,
        device_preferences: body.device_preferences,
        content_type_preferences: body.content_type_preferences,
        classroom_format: body.classroom_format
      })
      .eq('email', body.email)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify(data),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

/* 
NOTES:
1. This setup worked when environment variables were not loading correctly
2. The Response format with proper headers was crucial
3. The .single() after select() was important for proper data return
4. Error handling with proper headers was key to client-side error handling
*/ 