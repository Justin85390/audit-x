import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Use the correct Next.js route segment config type
type RouteSegmentConfig = {
  params: {
    id: string;
  };
};

export async function DELETE(
  request: NextRequest,
  { params }: RouteSegmentConfig  // Use the correct type here
) {
  try {
    const { id } = params;
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