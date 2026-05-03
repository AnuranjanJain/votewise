import type { NextRequest } from 'next/server';
import { searchNearbyPlaces } from '@/lib/google-cloud';
import { validateCoordinates } from '@/lib/validators';
import { successResponse, errorResponse, validationError, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
import { placesLimiter, getClientId } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!placesLimiter.check(clientId)) {
    return errorResponse('Too many requests. Please wait a moment.', 429);
  }

  const body = await safeParseBody<{ lat?: number; lng?: number; type?: string; radius?: number }>(request);
  if (!body) return errorResponse('Invalid request body', 400);

  try {
    const { lat, lng, type, radius } = body;
    const validation = validateCoordinates(lat, lng);
    if (!validation.valid) return validationError(validation);
    if (!type || typeof type !== 'string') {
      return errorResponse('Place type is required', 400);
    }
    const clampedRadius = Math.max(100, Math.min(5000, radius || 2000));
    const results = await searchNearbyPlaces(lat as number, lng as number, type, clampedRadius);
    return successResponse({ places: results, count: results.length });
  } catch (error) {
    console.error('[VoteWise API] Places error:', error);
    return errorResponse('Places search failed');
  }
}

export async function GET() {
  return serviceInfoResponse('VoteWise Places');
}
