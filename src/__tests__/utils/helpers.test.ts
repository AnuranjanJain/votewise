// ============================================================
// VoteWise — Utility Helpers Test Suite
// ============================================================

import { formatIndianNumber, formatDuration, formatDate, calculateDemocracyScore, generateId, truncateText, getTimeGreeting } from '@/utils/helpers';

describe('Utility Helpers', () => {
  describe('formatIndianNumber', () => {
    it('should format small numbers', () => { expect(formatIndianNumber(999)).toBe('999'); });
    it('should format thousands', () => { expect(formatIndianNumber(1000)).toBe('1,000'); });
    it('should format lakhs (Indian system)', () => { expect(formatIndianNumber(100000)).toBe('1,00,000'); });
    it('should format crores', () => { expect(formatIndianNumber(10000000)).toBe('1,00,00,000'); });
    it('should handle zero', () => { expect(formatIndianNumber(0)).toBe('0'); });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => { expect(formatDuration(30)).toBe('30s'); });
    it('should format minutes', () => { expect(formatDuration(120)).toBe('2m'); });
    it('should format minutes and seconds', () => { expect(formatDuration(90)).toBe('1m 30s'); });
    it('should format hours', () => { expect(formatDuration(3660)).toBe('1h 1m'); });
    it('should handle zero', () => { expect(formatDuration(0)).toBe('0s'); });
  });

  describe('formatDate', () => {
    it('should format a date string', () => {
      const result = formatDate('2024-01-15T00:00:00Z');
      expect(result).toContain('Jan');
      expect(result).toContain('2024');
    });
  });

  describe('calculateDemocracyScore', () => {
    it('should return 0 for no progress', () => {
      expect(calculateDemocracyScore({ topicsCompleted: 0, quizzesTaken: 0, chatMessages: 0, phasesExplored: 0 })).toBe(0);
    });
    it('should cap at 100', () => {
      expect(calculateDemocracyScore({ topicsCompleted: 100, quizzesTaken: 100, chatMessages: 100, phasesExplored: 100 })).toBe(100);
    });
    it('should increase with progress', () => {
      const s1 = calculateDemocracyScore({ topicsCompleted: 1, quizzesTaken: 0, chatMessages: 0, phasesExplored: 0 });
      const s2 = calculateDemocracyScore({ topicsCompleted: 3, quizzesTaken: 2, chatMessages: 5, phasesExplored: 4 });
      expect(s2).toBeGreaterThan(s1);
    });
    it('should weight topics highest', () => {
      const topicHeavy = calculateDemocracyScore({ topicsCompleted: 3, quizzesTaken: 0, chatMessages: 0, phasesExplored: 0 });
      expect(topicHeavy).toBe(30);
    });
  });

  describe('generateId', () => {
    it('should return a non-empty string', () => { expect(generateId()).toBeTruthy(); });
    it('should return unique IDs', () => {
      const ids = new Set(Array.from({ length: 10 }, () => generateId()));
      expect(ids.size).toBe(10);
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => { expect(truncateText('hello', 10)).toBe('hello'); });
    it('should truncate long text', () => {
      const result = truncateText('a very long text string here', 15);
      expect(result.length).toBeLessThanOrEqual(15);
      expect(result).toContain('...');
    });
    it('should handle exact length', () => { expect(truncateText('12345', 5)).toBe('12345'); });
  });

  describe('getTimeGreeting', () => {
    it('should return a string', () => { expect(typeof getTimeGreeting()).toBe('string'); });
    it('should contain Good', () => { expect(getTimeGreeting()).toContain('Good'); });
  });
});
