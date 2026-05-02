import { NextRequest, NextResponse } from 'next/server';
import { validateAnalyticsEvent, validateAnalyticsBatch } from '@/lib/validators';

const SECURITY_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, event } = body;

    if (events) {
      const validation = validateAnalyticsBatch(events);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400, headers: SECURITY_HEADERS });
      }
      return NextResponse.json({ received: events.length, status: 'queued' }, { headers: SECURITY_HEADERS });
    }

    if (event) {
      const validation = validateAnalyticsEvent(event);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400, headers: SECURITY_HEADERS });
      }
      return NextResponse.json({ received: 1, status: 'queued' }, { headers: SECURITY_HEADERS });
    }

    return NextResponse.json({ error: 'Must provide event or events' }, { status: 400, headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('[VoteWise API] Analytics error:', error);
    return NextResponse.json({ error: 'Analytics ingestion failed' }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'VoteWise Analytics Pipeline', supportedTypes: ['page_view', 'chat_message', 'quiz_answer', 'quiz_complete', 'timeline_explore', 'map_interaction', 'resource_view', 'theme_toggle', 'accessibility_change', 'video_watch', 'glossary_search', 'fact_check'] },
    { headers: SECURITY_HEADERS }
  );
}
