import { NextRequest, NextResponse } from 'next/server';
import { searchNearbyPlaces } from '@/lib/google-cloud';
import { validateCoordinates } from '@/lib/validators';

const SECURITY_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, type, radius } = body;
    const validation = validateCoordinates(lat, lng);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400, headers: SECURITY_HEADERS });
    }
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Place type is required' }, { status: 400, headers: SECURITY_HEADERS });
    }
    const clampedRadius = Math.max(100, Math.min(5000, radius || 2000));
    const results = await searchNearbyPlaces(lat, lng, type, clampedRadius);
    return NextResponse.json({ places: results, count: results.length }, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('[VoteWise API] Places error:', error);
    return NextResponse.json({ error: 'Places search failed' }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'VoteWise Places' }, { headers: SECURITY_HEADERS });
}
