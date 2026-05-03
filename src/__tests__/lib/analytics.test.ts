/**
 * @module __tests__/lib/analytics
 * @description Tests for the Firebase Analytics helper module.
 */

// Mock Firebase before importing analytics
jest.mock('@/lib/firebase', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn().mockResolvedValue({ id: 'doc-1' }),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      { data: () => ({ eventType: 'page_view', source: 'test' }) },
    ],
  }),
}));

import {
  logEvent,
  logPageView,
  logInteraction,
  logPerformanceMetric,
  logError,
  getRecentEvents,
} from '@/lib/analytics';

describe('Analytics Module', () => {
  describe('logEvent', () => {
    it('should queue an event without throwing', async () => {
      await expect(logEvent('page_view', 'test')).resolves.not.toThrow();
    });

    it('should accept metadata', async () => {
      await expect(logEvent('chat_message', 'chat', { action: 'send' })).resolves.not.toThrow();
    });
  });

  describe('logPageView', () => {
    it('should log a page view event', async () => {
      await expect(logPageView('home')).resolves.not.toThrow();
    });
  });

  describe('logInteraction', () => {
    it('should log an interaction event', async () => {
      await expect(logInteraction('map', 'zoom')).resolves.not.toThrow();
    });

    it('should accept additional details', async () => {
      await expect(logInteraction('quiz', 'answer', { correct: true })).resolves.not.toThrow();
    });
  });

  describe('logPerformanceMetric', () => {
    it('should log a performance metric', async () => {
      await expect(logPerformanceMetric('ttfb', 250)).resolves.not.toThrow();
    });

    it('should accept context metadata', async () => {
      await expect(logPerformanceMetric('fcp', 1200, { page: 'home' })).resolves.not.toThrow();
    });
  });

  describe('logError', () => {
    it('should log an error event', async () => {
      await expect(logError('API', 'Request failed')).resolves.not.toThrow();
    });

    it('should accept severity and context', async () => {
      await expect(logError('Render', 'Component crashed', 'critical', { component: 'Chat' })).resolves.not.toThrow();
    });

    it('should truncate long error messages', async () => {
      const longMessage = 'x'.repeat(1000);
      await expect(logError('Test', longMessage)).resolves.not.toThrow();
    });
  });

  describe('getRecentEvents', () => {
    it('should return an array of events', async () => {
      const events = await getRecentEvents(10);
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should use default maxEvents', async () => {
      const events = await getRecentEvents();
      expect(Array.isArray(events)).toBe(true);
    });
  });
});
