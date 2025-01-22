import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'User deleted' })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
} 