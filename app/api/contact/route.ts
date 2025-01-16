import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received contact data:', body)

    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error: any) {
    console.error('Error details:', error)
    return NextResponse.json(
      { error: 'Failed to save contact data', details: error.message },
      { status: 500 }
    )
  }
} 