import { NextRequest } from 'next/server';
import { searchElectionVideos } from '@/lib/youtube';
import { successResponse, errorResponse, safeParseBody, serviceInfoResponse } from '@/lib/api-utils';
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
    if (!searchQuery || typeof searchQuery !== 'string') {
      return errorResponse('Query is required', 400);
    }
    const videos = await searchElectionVideos(searchQuery, Math.min(maxResults || 6, 10));
    return successResponse({ videos, count: videos.length });
  } catch (error) {
    console.error('[VoteWise API] YouTube error:', error);
    return errorResponse('Video search failed');
  }
}

export async function GET() {
  return serviceInfoResponse('VoteWise YouTube Search');
}
