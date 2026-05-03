import type { NextRequest } from 'next/server';
import { reverseGeocode } from '@/lib/google-cloud';
import { validateCoordinates } from '@/lib/validators';
import { successResponse, errorResponse, validationError, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
import { geocodeLimiter, getClientId } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!geocodeLimiter.check(clientId)) {
    return errorResponse('Too many requests. Please wait a moment.', 429);
  }

  const body = await safeParseBody<{ lat?: number; lng?: number }>(request);
  if (!body) return errorResponse('Invalid request body', 400);

  try {
    const { lat, lng } = body;
    const validation = validateCoordinates(lat, lng);
    if (!validation.valid) return validationError(validation);
    const result = await reverseGeocode(lat as number, lng as number);
    return successResponse(result);
  } catch (error) {
    console.error('[VoteWise API] Geocode error:', error);
    return errorResponse('Geocoding failed');
  }
}

export async function GET() {
  return serviceInfoResponse('VoteWise Geocoding');
}
