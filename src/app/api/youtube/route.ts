import type { NextRequest } from 'next/server';
import { searchElectionVideos } from '@/lib/youtube';
import { validateSearchQuery } from '@/lib/validators';
import { successResponse, errorResponse, validationError, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
import { youtubeLimiter, getClientId } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  const clientId = getClientId(request);
  if (!youtubeLimiter.check(clientId)) {
    return errorResponse('Too many requests. Please wait a moment.', 429);
  }

  const body = await safeParseBody<{ query?: string; maxResults?: number }>(request);
  if (!body) return errorResponse('Invalid request body', 400);

  try {
    const { query: searchQuery, maxResults } = body;
    const validation = validateSearchQuery(searchQuery);
    if (!validation.valid) return validationError(validation);
    const limit = typeof maxResults === 'number' && Number.isFinite(maxResults)
      ? Math.min(Math.max(Math.floor(maxResults), 1), 10)
      : 6;
    const videos = await searchElectionVideos(searchQuery, limit);
    return successResponse({ videos, count: videos.length });
  } catch (error) {
    console.error('[VoteWise API] YouTube error:', error);
    return errorResponse('Video search failed');
  }
}

export async function GET() {
  return serviceInfoResponse('VoteWise YouTube Search');
}
