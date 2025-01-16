import { supabase } from '@/app/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Needs Analysis API received:', body)

    // First check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select()
      .eq('email', body.email)
      .single()

    if (findError) {
      console.error('Error finding user:', findError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Now update the user
    const { data, error } = await supabase
      .from('users')
      .update({
        needs_analysis: body.needs_analysis
      })
      .eq('email', body.email)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 