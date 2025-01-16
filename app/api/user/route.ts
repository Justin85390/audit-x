import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { error } = await supabase
      .from('users')
      .upsert(data)

    if (error) throw error
    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to save user data' }, { status: 500 })
  }
} 