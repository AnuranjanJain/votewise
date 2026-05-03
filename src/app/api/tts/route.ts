import type { NextRequest } from 'next/server';
import { synthesizeSpeech } from '@/lib/google-cloud';
import { successResponse, errorResponse, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
import { ttsLimiter, getClientId } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!ttsLimiter.check(clientId)) {
    return errorResponse('Too many requests. Please wait a moment.', 429);
  }

  const body = await safeParseBody<{ text?: string; languageCode?: string; gender?: string; speakingRate?: number }>(request);
  if (!body) return errorResponse('Invalid request body', 400);

  try {
    const { text, languageCode, gender, speakingRate } = body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return errorResponse('Text is required', 400);
    }
    if (text.length > 5000) {
      return errorResponse('Text exceeds 5000 character limit', 400);
    }
    const result = await synthesizeSpeech({
      text: text.substring(0, 5000), languageCode: languageCode || 'en-IN',
      gender: (gender as 'NEUTRAL' | 'MALE' | 'FEMALE') || 'NEUTRAL',
      speakingRate: Math.max(0.25, Math.min(4.0, speakingRate || 1.0)),
    });
    return successResponse(result);
  } catch (error) {
    console.error('[VoteWise API] TTS error:', error);
    return errorResponse('TTS synthesis failed');
  }
}

export async function GET() {
  return serviceInfoResponse('VoteWise Cloud TTS');
}
