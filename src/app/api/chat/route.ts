import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini } from '@/lib/gemini';
import { validateChatMessage } from '@/lib/validators';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    const validation = validateChatMessage(message);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400, headers: SECURITY_HEADERS });
    }

    const response = await chatWithGemini(message, history || []);
    return NextResponse.json({ response }, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('[VoteWise API] Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', response: "I'm having trouble right now. Please try again!" },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'VoteWise Election Buddy Chat', model: 'Gemini 2.0 Flash' },
    { headers: SECURITY_HEADERS }
  );
}
