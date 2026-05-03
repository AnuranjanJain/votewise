import type { NextRequest } from 'next/server';
import { getRandomQuestions } from '@/lib/election-data';
import { generateQuizQuestions } from '@/lib/gemini';
import { validateQuizRequest } from '@/lib/validators';
import { successResponse, errorResponse, validationError, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
import { quizLimiter, getClientId } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!quizLimiter.check(clientId)) {
    return errorResponse('Too many requests. Please wait a moment.', 429);
  }

  const body = await safeParseBody<{ topic?: string; difficulty?: string; count?: number; category?: string; useAI?: boolean }>(request);
  if (!body) return errorResponse('Invalid request body', 400);

  try {
    const { topic, difficulty, count, useAI, category } = body;
    const validation = validateQuizRequest(difficulty, category, count, topic, useAI);
    if (!validation.valid) return validationError(validation);

    if (useAI && topic) {
      const aiQuestions = await generateQuizQuestions(topic, difficulty || 'intermediate', count || 5);
      return successResponse({ questions: aiQuestions, source: 'gemini-ai' });
    }

    const questions = getRandomQuestions(count || 10, difficulty, category);
    return successResponse({ questions, source: 'question-bank' });
  } catch (error) {
    console.error('[VoteWise API] Quiz error:', error);
    const fallback = getRandomQuestions(10);
    return successResponse({ questions: fallback, source: 'fallback' });
  }
}

export async function GET() {
  return serviceInfoResponse('VoteWise Quiz Engine', { totalQuestions: 20 });
}
