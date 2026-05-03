import type { NextRequest } from 'next/server';
import { synthesizeSpeech } from '@/lib/google-cloud';
import { validateTtsRequest } from '@/lib/validators';
import { successResponse, errorResponse, validationError, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
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
    const validation = validateTtsRequest(text, languageCode, gender, speakingRate);
    if (!validation.valid) return validationError(validation);
    const result = await synthesizeSpeech({
      text: text as string,
      languageCode: languageCode || 'en-IN',
      gender: (gender as 'NEUTRAL' | 'MALE' | 'FEMALE') || 'NEUTRAL',
      speakingRate: speakingRate || 1.0,
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
