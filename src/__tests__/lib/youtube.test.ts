/**
 * @module __tests__/lib/youtube
 * @description Tests for the YouTube Data API client module.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

import { searchElectionVideos } from '@/lib/youtube';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  mockFetch.mockReset();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('YouTube Client', () => {
  describe('searchElectionVideos', () => {
    it('should return fallback videos when no API key is set', async () => {
      process.env.YOUTUBE_DATA_API_KEY = undefined;
      const results = await searchElectionVideos('Indian elections');
      expect(results.length).toBe(6);
      expect(results[0].source).toBe('fallback');
      expect(results[0].title).toBeTruthy();
    });

    it('should return fallback for placeholder key', async () => {
      process.env.YOUTUBE_DATA_API_KEY = 'your-youtube-api-key';
      const results = await searchElectionVideos('voting');
      expect(results[0].source).toBe('fallback');
    });

    it('should include topic in fallback results', async () => {
      process.env.YOUTUBE_DATA_API_KEY = undefined;
      const results = await searchElectionVideos('NOTA explained');
      const topicVideo = results.find(v => v.title.includes('NOTA'));
      expect(topicVideo).toBeTruthy();
    });

    it('should return fallback with valid video structure', async () => {
      process.env.YOUTUBE_DATA_API_KEY = undefined;
      const results = await searchElectionVideos('test');
      results.forEach(video => {
        expect(video).toHaveProperty('videoId');
        expect(video).toHaveProperty('title');
        expect(video).toHaveProperty('channelTitle');
        expect(video).toHaveProperty('description');
        expect(video).toHaveProperty('publishedAt');
        expect(video).toHaveProperty('source');
      });
    });

    it('should use default parameters', async () => {
      process.env.YOUTUBE_DATA_API_KEY = undefined;
      const results = await searchElectionVideos();
      expect(results.length).toBe(6);
    });

    it('should handle custom maxResults', async () => {
      process.env.YOUTUBE_DATA_API_KEY = undefined;
      const results = await searchElectionVideos('test', 3);
      // Fallback always returns 6, but maxResults is for API mode
      expect(results.length).toBeGreaterThan(0);
    });
  });
});
