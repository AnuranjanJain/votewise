import type { NextRequest } from 'next/server';
import { validateAnalyticsEvent, validateAnalyticsBatch } from '@/lib/validators';
import { successResponse, errorResponse, validationError, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
import { analyticsLimiter, getClientId } from '@/lib/rate-limiter';
import { VALID_EVENT_TYPES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!analyticsLimiter.check(clientId)) {
    return errorResponse('Too many requests. Please wait a moment.', 429);
  }

  const body = await safeParseBody<{ events?: unknown; event?: unknown }>(request);
  if (!body) return errorResponse('Invalid request body', 400);

  try {
    const { events, event } = body;

    if (events) {
      const validation = validateAnalyticsBatch(events);
      if (!validation.valid) return validationError(validation);
      return successResponse({ received: (events as unknown[]).length, status: 'queued' });
    }

    if (event) {
      const validation = validateAnalyticsEvent(event);
      if (!validation.valid) return validationError(validation);
      return successResponse({ received: 1, status: 'queued' });
    }

    return errorResponse('Must provide event or events', 400);
  } catch (error) {
    console.error('[VoteWise API] Analytics error:', error);
    return errorResponse('Analytics ingestion failed');
  }
}

export async function GET() {
  return serviceInfoResponse('VoteWise Analytics Pipeline', { supportedTypes: VALID_EVENT_TYPES });
}
