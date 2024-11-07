import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    hasGoogleCloudKey: !!process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY,
  });
}