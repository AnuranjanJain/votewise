// ============================================================
// VoteWise - API Route Handler Test Suite
// ============================================================

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status ?? 200,
      headers: {
        get: (key: string) => init?.headers?.[key] ?? null,
      },
      json: async () => data,
    }),
  },
}));

jest.mock('@/lib/gemini', () => ({
  chatWithGemini: jest.fn(async () => 'Election Buddy response'),
  generateQuizQuestions: jest.fn(async () => '[{"question":"Generated"}]'),
}));

jest.mock('@/lib/google-cloud', () => ({
  reverseGeocode: jest.fn(async () => ({ address: 'New Delhi', source: 'mock' })),
  searchNearbyPlaces: jest.fn(async () => [{ name: 'Civic School', address: 'Delhi' }]),
  synthesizeSpeech: jest.fn(async () => ({ audioContent: 'base64-audio', source: 'mock' })),
}));

jest.mock('@/lib/youtube', () => ({
  searchElectionVideos: jest.fn(async () => [{ videoId: 'abc123', title: 'Voting basics' }]),
}));

jest.mock('@/lib/election-data', () => ({
  getRandomQuestions: jest.fn(() => [{ id: 'q1', question: 'Who conducts elections?' }]),
}));

import * as analyticsRoute from '@/app/api/analytics/route';
import * as chatRoute from '@/app/api/chat/route';
import * as geocodeRoute from '@/app/api/geocode/route';
import * as placesRoute from '@/app/api/places/route';
import * as quizRoute from '@/app/api/quiz/route';
import * as ttsRoute from '@/app/api/tts/route';
import * as youtubeRoute from '@/app/api/youtube/route';
import type { NextRequest } from 'next/server';

let clientCounter = 0;

function requestFor(body: unknown): NextRequest {
  clientCounter += 1;
  return {
    headers: new Headers({ 'x-forwarded-for': `203.0.113.${clientCounter}` }),
    json: async () => body,
  } as unknown as NextRequest;
}

describe('API route handlers', () => {
  it('accepts analytics batches', async () => {
    const response = await analyticsRoute.POST(requestFor({
      events: [{ eventType: 'page_view', source: 'home' }],
    }));
    await expect(response.json()).resolves.toMatchObject({ received: 1, status: 'queued' });
    expect(response.status).toBe(200);
  });

  it('rejects invalid analytics payloads', async () => {
    const response = await analyticsRoute.POST(requestFor({ event: { eventType: 'bad', source: 'home' } }));
    expect(response.status).toBe(400);
  });

  it('returns chat responses for sanitized valid input', async () => {
    const response = await chatRoute.POST(requestFor({ message: 'How do I vote?', history: [] }));
    await expect(response.json()).resolves.toMatchObject({ response: 'Election Buddy response' });
    expect(response.status).toBe(200);
  });

  it('rejects malformed chat history', async () => {
    const response = await chatRoute.POST(requestFor({ message: 'Hello', history: [{ role: 'admin', parts: [] }] }));
    expect(response.status).toBe(400);
  });

  it('reverse geocodes valid coordinates', async () => {
    const response = await geocodeRoute.POST(requestFor({ lat: 28.6129, lng: 77.2295 }));
    await expect(response.json()).resolves.toMatchObject({ address: 'New Delhi' });
    expect(response.status).toBe(200);
  });

  it('rejects invalid coordinates', async () => {
    const response = await geocodeRoute.POST(requestFor({ lat: 99, lng: 77.2295 }));
    expect(response.status).toBe(400);
  });

  it('searches supported nearby place types', async () => {
    const response = await placesRoute.POST(requestFor({ lat: 28.6129, lng: 77.2295, type: 'school', radius: 1000 }));
    await expect(response.json()).resolves.toMatchObject({ count: 1 });
    expect(response.status).toBe(200);
  });

  it('rejects unsupported nearby place types', async () => {
    const response = await placesRoute.POST(requestFor({ lat: 28.6129, lng: 77.2295, type: 'restaurant' }));
    expect(response.status).toBe(400);
  });

  it('serves question-bank quizzes by default', async () => {
    const response = await quizRoute.POST(requestFor({ count: 1, difficulty: 'beginner', category: 'process' }));
    await expect(response.json()).resolves.toMatchObject({ source: 'question-bank' });
    expect(response.status).toBe(200);
  });

  it('rejects unsafe quiz generation sizes', async () => {
    const response = await quizRoute.POST(requestFor({ count: 100 }));
    expect(response.status).toBe(400);
  });

  it('synthesizes speech for valid text', async () => {
    const response = await ttsRoute.POST(requestFor({ text: 'Voting is a right.', languageCode: 'en-IN' }));
    await expect(response.json()).resolves.toMatchObject({ audioContent: 'base64-audio' });
    expect(response.status).toBe(200);
  });

  it('rejects unsupported TTS language codes', async () => {
    const response = await ttsRoute.POST(requestFor({ text: 'Hello', languageCode: 'en-US' }));
    expect(response.status).toBe(400);
  });

  it('searches election videos with bounded result limits', async () => {
    const response = await youtubeRoute.POST(requestFor({ query: 'how to vote', maxResults: 50 }));
    await expect(response.json()).resolves.toMatchObject({ count: 1 });
    expect(response.status).toBe(200);
  });

  it('rejects empty video search queries', async () => {
    const response = await youtubeRoute.POST(requestFor({ query: '' }));
    expect(response.status).toBe(400);
  });
});
