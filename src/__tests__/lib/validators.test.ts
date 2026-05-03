// ============================================================
// VoteWise — Validators Test Suite
// ============================================================

import { validateChatMessage, validateAnalyticsEvent, validateAnalyticsBatch, validateCoordinates, validateImageData, validateQuizAnswer, sanitizeInput, validateUrl } from '@/lib/validators';

describe('Validators', () => {
  describe('validateChatMessage', () => {
    it('should accept a valid message', () => { expect(validateChatMessage('Hello')).toEqual({ valid: true }); });
    it('should reject non-string', () => { expect(validateChatMessage(123).valid).toBe(false); });
    it('should reject null', () => { expect(validateChatMessage(null).valid).toBe(false); });
    it('should reject empty string', () => { expect(validateChatMessage('').valid).toBe(false); });
    it('should reject whitespace-only', () => { expect(validateChatMessage('   ').valid).toBe(false); });
    it('should reject message exceeding max length', () => {
      const longMsg = 'a'.repeat(2001);
      expect(validateChatMessage(longMsg).valid).toBe(false);
    });
    it('should accept message at max length', () => {
      const maxMsg = 'a'.repeat(2000);
      expect(validateChatMessage(maxMsg).valid).toBe(true);
    });
    it('should accept messages with special characters', () => { expect(validateChatMessage('What is EVM? 🗳️').valid).toBe(true); });
  });

  describe('validateAnalyticsEvent', () => {
    const validEvent = { eventType: 'page_view', source: 'Home' };
    it('should accept valid event', () => { expect(validateAnalyticsEvent(validEvent).valid).toBe(true); });
    it('should reject null', () => { expect(validateAnalyticsEvent(null).valid).toBe(false); });
    it('should reject non-object', () => { expect(validateAnalyticsEvent('string').valid).toBe(false); });
    it('should reject missing eventType', () => { expect(validateAnalyticsEvent({ source: 'x' }).valid).toBe(false); });
    it('should reject invalid eventType', () => { expect(validateAnalyticsEvent({ eventType: 'invalid', source: 'x' }).valid).toBe(false); });
    it('should reject missing source', () => { expect(validateAnalyticsEvent({ eventType: 'page_view' }).valid).toBe(false); });
    it('should reject source > 100 chars', () => {
      expect(validateAnalyticsEvent({ eventType: 'page_view', source: 'a'.repeat(101) }).valid).toBe(false);
    });
    it('should accept event with metadata', () => {
      expect(validateAnalyticsEvent({ ...validEvent, metadata: { key: 'val' } }).valid).toBe(true);
    });
    it('should reject null metadata', () => {
      expect(validateAnalyticsEvent({ ...validEvent, metadata: null }).valid).toBe(false);
    });
    it('should reject metadata with too many keys', () => {
      const meta: Record<string, string> = {};
      for (let i = 0; i < 21; i++) meta[`k${i}`] = 'v';
      expect(validateAnalyticsEvent({ ...validEvent, metadata: meta }).valid).toBe(false);
    });
  });

  describe('validateAnalyticsBatch', () => {
    const validEvent = { eventType: 'page_view', source: 'Test' };
    it('should accept valid batch', () => { expect(validateAnalyticsBatch([validEvent]).valid).toBe(true); });
    it('should reject non-array', () => { expect(validateAnalyticsBatch('not-array').valid).toBe(false); });
    it('should reject empty array', () => { expect(validateAnalyticsBatch([]).valid).toBe(false); });
    it('should reject batch > 50 events', () => {
      const events = Array(51).fill(validEvent);
      expect(validateAnalyticsBatch(events).valid).toBe(false);
    });
    it('should reject batch with invalid event', () => {
      expect(validateAnalyticsBatch([validEvent, { bad: true }]).valid).toBe(false);
    });
  });

  describe('validateCoordinates', () => {
    it('should accept valid coordinates', () => { expect(validateCoordinates(28.6, 77.2).valid).toBe(true); });
    it('should reject non-numbers', () => { expect(validateCoordinates('28', '77').valid).toBe(false); });
    it('should reject NaN', () => { expect(validateCoordinates(NaN, 77).valid).toBe(false); });
    it('should reject lat > 90', () => { expect(validateCoordinates(91, 77).valid).toBe(false); });
    it('should reject lat < -90', () => { expect(validateCoordinates(-91, 77).valid).toBe(false); });
    it('should reject lng > 180', () => { expect(validateCoordinates(28, 181).valid).toBe(false); });
    it('should reject lng < -180', () => { expect(validateCoordinates(28, -181).valid).toBe(false); });
    it('should accept boundary values', () => { expect(validateCoordinates(90, 180).valid).toBe(true); expect(validateCoordinates(-90, -180).valid).toBe(true); });
  });

  describe('validateImageData', () => {
    it('should accept valid image data', () => { expect(validateImageData('base64data').valid).toBe(true); });
    it('should reject non-string', () => { expect(validateImageData(123).valid).toBe(false); });
    it('should reject empty string', () => { expect(validateImageData('').valid).toBe(false); });
    it('should reject oversized image', () => {
      const bigData = 'a'.repeat(7 * 1024 * 1024);
      expect(validateImageData(bigData).valid).toBe(false);
    });
  });

  describe('validateQuizAnswer', () => {
    it('should accept valid answer', () => { expect(validateQuizAnswer({ questionId: 'q1', selectedOption: 2 }).valid).toBe(true); });
    it('should reject null', () => { expect(validateQuizAnswer(null).valid).toBe(false); });
    it('should reject missing questionId', () => { expect(validateQuizAnswer({ selectedOption: 0 }).valid).toBe(false); });
    it('should reject empty questionId', () => { expect(validateQuizAnswer({ questionId: '', selectedOption: 0 }).valid).toBe(false); });
    it('should reject selectedOption > 3', () => { expect(validateQuizAnswer({ questionId: 'q1', selectedOption: 4 }).valid).toBe(false); });
    it('should reject negative selectedOption', () => { expect(validateQuizAnswer({ questionId: 'q1', selectedOption: -1 }).valid).toBe(false); });
    it('should reject non-number selectedOption', () => { expect(validateQuizAnswer({ questionId: 'q1', selectedOption: 'a' }).valid).toBe(false); });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML tags', () => { expect(sanitizeInput('<script>')).toBe('&lt;script&gt;'); });
    it('should escape ampersands', () => { expect(sanitizeInput('a&b')).toBe('a&amp;b'); });
    it('should escape quotes', () => { expect(sanitizeInput('"hello"')).toBe('&quot;hello&quot;'); });
    it('should escape single quotes', () => { expect(sanitizeInput("it's")).toBe("it&#x27;s"); });
    it('should leave plain text unchanged', () => { expect(sanitizeInput('hello world')).toBe('hello world'); });
    it('should handle complex XSS', () => {
      const xss = '<img src=x onerror="alert(1)">';
      const result = sanitizeInput(xss);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });

  describe('validateAnalyticsEvent - prototype pollution', () => {
    it('should reject __proto__ key', () => {
      const event = JSON.parse('{"__proto__": {}, "eventType": "page_view", "source": "test"}');
      expect(validateAnalyticsEvent(event).valid).toBe(false);
    });
  });

  describe('validateQuizAnswer - prototype pollution', () => {
    it('should reject __proto__ key', () => {
      const answer = JSON.parse('{"__proto__": {}, "questionId": "q1", "selectedOption": 0}');
      expect(validateQuizAnswer(answer).valid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid HTTP URL', () => { expect(validateUrl('https://example.com').valid).toBe(true); });
    it('should accept valid path', () => { expect(validateUrl('/page').valid).toBe(true); });
    it('should reject non-string', () => { expect(validateUrl(123).valid).toBe(false); });
    it('should reject empty string', () => { expect(validateUrl('').valid).toBe(false); });
    it('should reject javascript: scheme', () => { expect(validateUrl('javascript:alert(1)').valid).toBe(false); });
    it('should reject data: scheme', () => { expect(validateUrl('data:text/html,<h1>hi</h1>').valid).toBe(false); });
    it('should reject vbscript: scheme', () => { expect(validateUrl('vbscript:MsgBox').valid).toBe(false); });
    it('should reject overly long URLs', () => { expect(validateUrl('https://x.com/' + 'a'.repeat(2048)).valid).toBe(false); });
    it('should be case-insensitive for scheme check', () => { expect(validateUrl('JAVASCRIPT:alert(1)').valid).toBe(false); });
  });
});
