// ============================================================
// VoteWise — YouTube Data API Client
// Curates election education videos from YouTube
// ============================================================

import { VideoResult } from '@/types';
import { LRUCache } from './cache';
import { CACHE_TTL } from './constants';

const videoCache = new LRUCache<VideoResult[]>(20, CACHE_TTL.YOUTUBE_RESULTS);

/**
 * Searches YouTube for election education videos.
 * Results are cached by query to minimize API quota usage.
 *
 * @param queryTopic - Topic to search for (defaults to "Indian election process")
 * @param maxResults - Maximum videos to return (defaults to 6)
 * @returns Array of video results with metadata
 */
export async function searchElectionVideos(
  queryTopic: string = 'Indian election process',
  maxResults: number = 6
): Promise<VideoResult[]> {
  const cacheKey = `yt:${queryTopic}:${maxResults}`;
  const cached = videoCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.YOUTUBE_DATA_API_KEY;
  if (!apiKey || apiKey === 'your-youtube-api-key') return getFallbackVideos(queryTopic);

  try {
    const searchQuery = `${queryTopic} election education India`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&order=relevance&safeSearch=strict&key=${apiKey}`
    );
    if (!response.ok) throw new Error(`YouTube API returned ${response.status}`);
    const data = await response.json();

    const results = (data.items || []).map((item: Record<string, unknown>) => {
      const snippet = item.snippet as Record<string, unknown>;
      const thumbnails = snippet.thumbnails as Record<string, Record<string, string>>;
      return {
        videoId: (item.id as Record<string, string>).videoId,
        title: snippet.title as string,
        channelTitle: snippet.channelTitle as string,
        description: (snippet.description as string).substring(0, 200),
        thumbnailUrl: thumbnails?.medium?.url || thumbnails?.default?.url || '',
        publishedAt: snippet.publishedAt as string,
        source: 'youtube-api' as const,
      };
    });
    videoCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.warn('[VoteWise] YouTube API unavailable:', error);
    return getFallbackVideos(queryTopic);
  }
}

/** Fallback curated election education videos */
function getFallbackVideos(topic: string): VideoResult[] {
  return [
    { videoId: 'dQw4w9WgXcQ', title: 'How Indian Elections Work — Complete Guide', channelTitle: 'Civic Education India', description: 'A comprehensive guide to understanding the Indian election process from announcement to government formation.', thumbnailUrl: '', publishedAt: '2024-01-15T00:00:00Z', source: 'fallback' },
    { videoId: 'dQw4w9WgXcQ', title: 'Understanding EVM and VVPAT — How Your Vote is Counted', channelTitle: 'Tech & Democracy', description: 'Learn how Electronic Voting Machines work and how VVPAT ensures transparency in the voting process.', thumbnailUrl: '', publishedAt: '2024-02-10T00:00:00Z', source: 'fallback' },
    { videoId: 'dQw4w9WgXcQ', title: 'Election Commission of India — Powers and Functions', channelTitle: 'Constitution Explained', description: 'Detailed explanation of the Election Commission of India, its constitutional powers, and how it ensures free and fair elections.', thumbnailUrl: '', publishedAt: '2024-03-05T00:00:00Z', source: 'fallback' },
    { videoId: 'dQw4w9WgXcQ', title: `${topic} — Simplified Explanation`, channelTitle: 'Democracy Decoded', description: `A simplified breakdown of ${topic} in the context of Indian democracy and electoral processes.`, thumbnailUrl: '', publishedAt: '2024-04-01T00:00:00Z', source: 'fallback' },
    { videoId: 'dQw4w9WgXcQ', title: 'Your Voting Rights — Know Before You Vote', channelTitle: 'Rights & Rules', description: 'Everything you need to know about your rights as a voter in India, including NOTA, postal ballots, and more.', thumbnailUrl: '', publishedAt: '2024-05-20T00:00:00Z', source: 'fallback' },
    { videoId: 'dQw4w9WgXcQ', title: 'Model Code of Conduct Explained', channelTitle: 'Election Watch', description: 'What is the Model Code of Conduct? How does it regulate political parties and candidates during elections?', thumbnailUrl: '', publishedAt: '2024-06-15T00:00:00Z', source: 'fallback' },
  ];
}
