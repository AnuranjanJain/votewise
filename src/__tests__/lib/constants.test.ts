// ============================================================
// VoteWise — Constants Test Suite
// ============================================================

import {
  MAX_CHAT_MESSAGE_LENGTH, MAX_ANALYTICS_BATCH_SIZE, MAX_METADATA_KEYS,
  MAX_IMAGE_SIZE_BYTES, VALID_EVENT_TYPES, QUIZ_CONFIG, TIMELINE_CONFIG,
  SUPPORTED_LANGUAGES, RATE_LIMITS, GEMINI_CONFIG, DEFAULT_COORDINATES,
  APP_META, BADGES,
} from '@/lib/constants';

describe('Constants', () => {
  describe('Limits', () => {
    it('should have positive MAX_CHAT_MESSAGE_LENGTH', () => { expect(MAX_CHAT_MESSAGE_LENGTH).toBeGreaterThan(0); });
    it('should have MAX_CHAT_MESSAGE_LENGTH of 2000', () => { expect(MAX_CHAT_MESSAGE_LENGTH).toBe(2000); });
    it('should have positive MAX_ANALYTICS_BATCH_SIZE', () => { expect(MAX_ANALYTICS_BATCH_SIZE).toBeGreaterThan(0); });
    it('should have MAX_ANALYTICS_BATCH_SIZE of 50', () => { expect(MAX_ANALYTICS_BATCH_SIZE).toBe(50); });
    it('should have positive MAX_METADATA_KEYS', () => { expect(MAX_METADATA_KEYS).toBeGreaterThan(0); });
    it('should have MAX_IMAGE_SIZE_BYTES of 5MB', () => { expect(MAX_IMAGE_SIZE_BYTES).toBe(5 * 1024 * 1024); });
  });

  describe('VALID_EVENT_TYPES', () => {
    it('should be a non-empty array', () => { expect(VALID_EVENT_TYPES.length).toBeGreaterThan(0); });
    it('should include page_view', () => { expect(VALID_EVENT_TYPES).toContain('page_view'); });
    it('should include chat_message', () => { expect(VALID_EVENT_TYPES).toContain('chat_message'); });
    it('should include quiz_answer', () => { expect(VALID_EVENT_TYPES).toContain('quiz_answer'); });
    it('should include quiz_complete', () => { expect(VALID_EVENT_TYPES).toContain('quiz_complete'); });
    it('should include timeline_explore', () => { expect(VALID_EVENT_TYPES).toContain('timeline_explore'); });
    it('should include map_interaction', () => { expect(VALID_EVENT_TYPES).toContain('map_interaction'); });
    it('should include theme_toggle', () => { expect(VALID_EVENT_TYPES).toContain('theme_toggle'); });
    it('should include fact_check', () => { expect(VALID_EVENT_TYPES).toContain('fact_check'); });
    it('should have all unique values', () => {
      const unique = new Set(VALID_EVENT_TYPES);
      expect(unique.size).toBe(VALID_EVENT_TYPES.length);
    });
  });

  describe('QUIZ_CONFIG', () => {
    it('should have 10 questions per session', () => { expect(QUIZ_CONFIG.QUESTIONS_PER_SESSION).toBe(10); });
    it('should have positive time per question', () => { expect(QUIZ_CONFIG.TIME_PER_QUESTION_SECONDS).toBeGreaterThan(0); });
    it('should have streak bonus threshold of 3', () => { expect(QUIZ_CONFIG.STREAK_BONUS_THRESHOLD).toBe(3); });
    it('should have positive base points for correct', () => { expect(QUIZ_CONFIG.BASE_POINTS_CORRECT).toBeGreaterThan(0); });
    it('should have 0 points for wrong answer', () => { expect(QUIZ_CONFIG.BASE_POINTS_WRONG).toBe(0); });
  });

  describe('TIMELINE_CONFIG', () => {
    it('should have 8 total phases', () => { expect(TIMELINE_CONFIG.TOTAL_PHASES).toBe(8); });
    it('should have positive min duration', () => { expect(TIMELINE_CONFIG.MIN_PHASE_DURATION_DAYS).toBeGreaterThan(0); });
    it('should have max > min duration', () => { expect(TIMELINE_CONFIG.MAX_PHASE_DURATION_DAYS).toBeGreaterThan(TIMELINE_CONFIG.MIN_PHASE_DURATION_DAYS); });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    it('should have at least 5 languages', () => { expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(5); });
    it('should include English', () => { expect(SUPPORTED_LANGUAGES.find(l => l.code === 'en')).toBeTruthy(); });
    it('should include Hindi', () => { expect(SUPPORTED_LANGUAGES.find(l => l.code === 'hi')).toBeTruthy(); });
    it('should have unique language codes', () => {
      const codes = SUPPORTED_LANGUAGES.map(l => l.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
    it('should have nativeName for all', () => {
      SUPPORTED_LANGUAGES.forEach(l => { expect(l.nativeName).toBeTruthy(); });
    });
  });

  describe('RATE_LIMITS', () => {
    it('should have positive chat limit', () => { expect(RATE_LIMITS.CHAT_MESSAGES_PER_MINUTE).toBeGreaterThan(0); });
    it('should have positive quiz limit', () => { expect(RATE_LIMITS.QUIZ_REQUESTS_PER_MINUTE).toBeGreaterThan(0); });
    it('should have positive TTS limit', () => { expect(RATE_LIMITS.TTS_REQUESTS_PER_MINUTE).toBeGreaterThan(0); });
  });

  describe('GEMINI_CONFIG', () => {
    it('should have model name', () => { expect(GEMINI_CONFIG.MODEL_NAME).toBeTruthy(); });
    it('should use gemini-2.0-flash', () => { expect(GEMINI_CONFIG.MODEL_NAME).toBe('gemini-2.0-flash'); });
    it('should have positive max output tokens', () => { expect(GEMINI_CONFIG.MAX_OUTPUT_TOKENS).toBeGreaterThan(0); });
    it('should have temperature between 0 and 1', () => { expect(GEMINI_CONFIG.TEMPERATURE).toBeGreaterThanOrEqual(0); expect(GEMINI_CONFIG.TEMPERATURE).toBeLessThanOrEqual(1); });
  });

  describe('DEFAULT_COORDINATES', () => {
    it('should have valid latitude', () => { expect(DEFAULT_COORDINATES.lat).toBeGreaterThanOrEqual(-90); expect(DEFAULT_COORDINATES.lat).toBeLessThanOrEqual(90); });
    it('should have valid longitude', () => { expect(DEFAULT_COORDINATES.lng).toBeGreaterThanOrEqual(-180); expect(DEFAULT_COORDINATES.lng).toBeLessThanOrEqual(180); });
  });

  describe('APP_META', () => {
    it('should have name VoteWise', () => { expect(APP_META.NAME).toBe('VoteWise'); });
    it('should have a tagline', () => { expect(APP_META.TAGLINE).toBeTruthy(); });
    it('should have a version', () => { expect(APP_META.VERSION).toMatch(/^\d+\.\d+\.\d+$/); });
  });

  describe('BADGES', () => {
    it('should have at least 5 badges', () => { expect(BADGES.length).toBeGreaterThanOrEqual(5); });
    it('should have unique badge IDs', () => {
      const ids = BADGES.map(b => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
    it('should have icon for every badge', () => { BADGES.forEach(b => { expect(b.icon).toBeTruthy(); }); });
    it('should have description for every badge', () => { BADGES.forEach(b => { expect(b.description).toBeTruthy(); }); });
  });
});
