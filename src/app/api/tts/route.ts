import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/google-cloud';

const SECURITY_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, languageCode, gender, speakingRate } = body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400, headers: SECURITY_HEADERS });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text exceeds 5000 character limit' }, { status: 400, headers: SECURITY_HEADERS });
    }
    const result = await synthesizeSpeech({
      text: text.substring(0, 5000), languageCode: languageCode || 'en-IN',
      gender: gender || 'NEUTRAL', speakingRate: Math.max(0.25, Math.min(4.0, speakingRate || 1.0)),
    });
    return NextResponse.json(result, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('[VoteWise API] TTS error:', error);
    return NextResponse.json({ error: 'TTS synthesis failed' }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'VoteWise Cloud TTS' }, { headers: SECURITY_HEADERS });
}
