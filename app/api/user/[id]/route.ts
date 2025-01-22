import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Use Next.js's exact type structure
type Context = {
  params: {
    id: string;
  };
};

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = context.params;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
} 