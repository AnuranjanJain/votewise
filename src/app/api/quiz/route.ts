import { NextRequest, NextResponse } from 'next/server';
import { getRandomQuestions } from '@/lib/election-data';
import { generateQuizQuestions } from '@/lib/gemini';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, difficulty, count, useAI } = body;

    if (useAI && topic) {
      const aiQuestions = await generateQuizQuestions(topic, difficulty || 'intermediate', count || 5);
      return NextResponse.json({ questions: aiQuestions, source: 'gemini-ai' }, { headers: SECURITY_HEADERS });
    }

    const questions = getRandomQuestions(count || 10, difficulty, body.category);
    return NextResponse.json({ questions, source: 'question-bank' }, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('[VoteWise API] Quiz error:', error);
    const fallback = getRandomQuestions(10);
    return NextResponse.json({ questions: fallback, source: 'fallback' }, { status: 200, headers: SECURITY_HEADERS });
  }
}

export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'VoteWise Quiz Engine', totalQuestions: 20 },
    { headers: SECURITY_HEADERS }
  );
}
