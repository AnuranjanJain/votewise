import { NextRequest, NextResponse } from 'next/server';
import { searchElectionVideos } from '@/lib/youtube';

const SECURITY_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, maxResults } = body;
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400, headers: SECURITY_HEADERS });
    }
    const videos = await searchElectionVideos(query, Math.min(maxResults || 6, 10));
    return NextResponse.json({ videos, count: videos.length }, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('[VoteWise API] YouTube error:', error);
    return NextResponse.json({ error: 'Video search failed' }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'VoteWise YouTube Search' }, { headers: SECURITY_HEADERS });
}
