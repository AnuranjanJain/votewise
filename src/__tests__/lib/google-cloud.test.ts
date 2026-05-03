/**
 * @module __tests__/lib/google-cloud
 * @description Tests for Google Cloud service integrations.
 */

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

import {
  synthesizeSpeech,
  reverseGeocode,
  searchNearbyPlaces,
  cloudTranslate,
  haversineDistance,
} from '@/lib/google-cloud';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  mockFetch.mockReset();
  process.env = { ...ORIGINAL_ENV };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('Google Cloud Services', () => {
  describe('synthesizeSpeech', () => {
    it('should return fallback when no API key is set', async () => {
      process.env.GOOGLE_CLOUD_TTS_API_KEY = undefined;
      const result = await synthesizeSpeech({ text: 'Hello' });
      expect(result.source).toBe('fallback');
      expect(result.audioContent).toBeTruthy();
    });

    it('should return fallback for placeholder API key', async () => {
      process.env.GOOGLE_CLOUD_TTS_API_KEY = 'your-tts-api-key';
      const result = await synthesizeSpeech({ text: 'Test' });
      expect(result.source).toBe('fallback');
    });

    it('should accept valid TTS options', async () => {
      process.env.GOOGLE_CLOUD_TTS_API_KEY = undefined;
      const result = await synthesizeSpeech({
        text: 'Vote today',
        languageCode: 'hi-IN',
        gender: 'FEMALE',
        speakingRate: 1.5,
      });
      expect(result.source).toBe('fallback');
    });
  });

  describe('reverseGeocode', () => {
    it('should return fallback when no API key is set', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;
      const result = await reverseGeocode(28.6129, 77.2295);
      expect(result.source).toBe('fallback');
      expect(result.formattedAddress).toContain('Nirvachan Sadan');
    });

    it('should include coordinate precision in fallback', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;
      const result = await reverseGeocode(28.6129, 77.2295);
      expect(result.formattedAddress).toContain('28.6129');
    });

    it('should return complete address components in fallback', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;
      const result = await reverseGeocode(28.6, 77.2);
      expect(result.components.city).toBe('New Delhi');
      expect(result.components.country).toBe('India');
      expect(result.components.state).toBe('Delhi');
    });
  });

  describe('searchNearbyPlaces', () => {
    it('should return fallback places for government offices', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;
      const results = await searchNearbyPlaces(28.6, 77.2, 'local_government_office');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].source).toBe('fallback');
      expect(results[0].name).toBe('District Election Office');
    });

    it('should return fallback places for post offices', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;
      const results = await searchNearbyPlaces(28.6, 77.2, 'post_office');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return generic fallback for unknown types', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;
      const results = await searchNearbyPlaces(28.6, 77.2, 'museum');
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('museum');
    });

    it('should accept custom radius', async () => {
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = undefined;
      const results = await searchNearbyPlaces(28.6, 77.2, 'library', 3000);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('cloudTranslate', () => {
    it('should return fallback when no API key is set', async () => {
      process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY = undefined;
      const result = await cloudTranslate('Hello', 'hi');
      expect(result.source).toBe('fallback');
      expect(result.translatedText).toContain('[hi]');
    });

    it('should include original text in fallback', async () => {
      process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY = undefined;
      const result = await cloudTranslate('Vote wisely', 'ta');
      expect(result.translatedText).toContain('Vote wisely');
    });
  });

  describe('haversineDistance', () => {
    it('should return 0 for identical coordinates', () => {
      const dist = haversineDistance(28.6, 77.2, 28.6, 77.2);
      expect(dist).toBeCloseTo(0, 0);
    });

    it('should calculate reasonable distances for nearby points', () => {
      // ~1.1 km between these Delhi points
      const dist = haversineDistance(28.6129, 77.2295, 28.6200, 77.2295);
      expect(dist).toBeGreaterThan(500);
      expect(dist).toBeLessThan(2000);
    });

    it('should calculate long distances correctly', () => {
      // Delhi to Mumbai ~1,150 km
      const dist = haversineDistance(28.6, 77.2, 19.0, 72.8);
      expect(dist).toBeGreaterThan(1_000_000);
      expect(dist).toBeLessThan(1_500_000);
    });

    it('should be symmetric', () => {
      const d1 = haversineDistance(28.6, 77.2, 19.0, 72.8);
      const d2 = haversineDistance(19.0, 72.8, 28.6, 77.2);
      expect(d1).toBeCloseTo(d2, 0);
    });
  });
});
