import type { NextRequest } from 'next/server';
import { chatWithGemini } from '@/lib/gemini';
import { validateChatMessage, validateChatHistory, sanitizeInput } from '@/lib/validators';
import { successResponse, errorResponse, validationError, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
import { chatLimiter, getClientId } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!chatLimiter.check(clientId)) {
    return errorResponse('Too many requests. Please wait a moment.', 429);
  }

  const body = await safeParseBody<{ message: unknown; history?: { role: string; parts: { text: string }[] }[] }>(request);
  if (!body) return errorResponse('Invalid request body', 400);

  try {
    const { message, history } = body;
    const validation = validateChatMessage(message);
    if (!validation.valid) return validationError(validation);
    const historyValidation = validateChatHistory(history);
    if (!historyValidation.valid) return validationError(historyValidation);

    const sanitizedMessage = sanitizeInput(message as string);
    const response = await chatWithGemini(sanitizedMessage, history || []);
    return successResponse({ response });
  } catch (error) {
    console.error('[VoteWise API] Chat error:', error);
    return errorResponse('Failed to process chat message', 500, {
      response: "I'm having trouble right now. Please try again!",
    });
  }
}

export async function GET() {
  return serviceInfoResponse('VoteWise Election Buddy Chat', { model: 'Gemini 2.0 Flash' });
}
