import { NextRequest, NextResponse } from 'next/server';
import { reverseGeocode } from '@/lib/google-cloud';
import { validateCoordinates } from '@/lib/validators';

const SECURITY_HEADERS = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng } = body;
    const validation = validateCoordinates(lat, lng);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400, headers: SECURITY_HEADERS });
    }
    const result = await reverseGeocode(lat, lng);
    return NextResponse.json(result, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('[VoteWise API] Geocode error:', error);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500, headers: SECURITY_HEADERS });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'VoteWise Geocoding' }, { headers: SECURITY_HEADERS });
}
