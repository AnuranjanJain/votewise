/**
 * @module __tests__/lib/gemini
 * @description Tests for the Gemini AI client module.
 */

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: { text: () => 'Gemini says hello' },
        }),
      }),
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => '[{"question":"Generated"}]' },
      }),
    }),
  })),
}));

// Set API key before importing module
const ORIGINAL_ENV = process.env;
beforeAll(() => {
  process.env = { ...ORIGINAL_ENV, GEMINI_API_KEY: 'test-key-123' };
});
afterAll(() => {
  process.env = ORIGINAL_ENV;
});

import {
  chatWithGemini,
  generateQuizQuestions,
  simplifyText,
  translateMessage,
  factCheckClaim,
} from '@/lib/gemini';

describe('Gemini AI Client', () => {
  describe('chatWithGemini', () => {
    it('should return a response for valid input', async () => {
      const result = await chatWithGemini('How do I vote?');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty history', async () => {
      const result = await chatWithGemini('Hello', []);
      expect(typeof result).toBe('string');
    });

    it('should handle conversation with history', async () => {
      const history = [{ role: 'user', parts: [{ text: 'Hi' }] }];
      const result = await chatWithGemini('What is EVM?', history);
      expect(typeof result).toBe('string');
    });
  });

  describe('generateQuizQuestions', () => {
    it('should return quiz JSON for a valid topic', async () => {
      const result = await generateQuizQuestions('voting process', 'beginner', 5);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use default parameters', async () => {
      const result = await generateQuizQuestions('elections');
      expect(typeof result).toBe('string');
    });
  });

  describe('simplifyText', () => {
    it('should simplify text for different reading levels', async () => {
      const result = await simplifyText('Complex election text', 'child');
      expect(typeof result).toBe('string');
    });

    it('should use default level', async () => {
      const result = await simplifyText('Election process details');
      expect(typeof result).toBe('string');
    });
  });

  describe('translateMessage', () => {
    it('should translate text to target language', async () => {
      const result = await translateMessage('Hello', 'Hindi');
      expect(typeof result).toBe('string');
    });
  });

  describe('factCheckClaim', () => {
    it('should return a fact-check result', async () => {
      const result = await factCheckClaim('Voting age is 18');
      expect(typeof result).toBe('string');
    });
  });
});

describe('Gemini Fallback Mode', () => {
  beforeAll(() => {
    process.env = { ...ORIGINAL_ENV, GEMINI_API_KEY: undefined };
    // Clear module cache to re-evaluate without key
    jest.resetModules();
  });

  it('should return fallback for voting questions', async () => {
    // Re-import with cleared key
    const { chatWithGemini: fallbackChat } = await import('@/lib/gemini');
    const result = await fallbackChat('How do I vote?');
    expect(result).toContain('Vote');
  });

  it('should return fallback for EVM questions', async () => {
    const { chatWithGemini: fallbackChat } = await import('@/lib/gemini');
    const result = await fallbackChat('What is EVM?');
    expect(result).toContain('EVM');
  });

  it('should return fallback for NOTA questions', async () => {
    const { chatWithGemini: fallbackChat } = await import('@/lib/gemini');
    const result = await fallbackChat('Explain NOTA');
    expect(result).toContain('NOTA');
  });

  it('should return fallback for registration questions', async () => {
    const { chatWithGemini: fallbackChat } = await import('@/lib/gemini');
    const result = await fallbackChat('How to register for voter id?');
    expect(result).toContain('Register');
  });

  it('should return generic fallback for unknown questions', async () => {
    const { chatWithGemini: fallbackChat } = await import('@/lib/gemini');
    const result = await fallbackChat('xyzabc');
    expect(result).toContain('Election Buddy');
  });

  it('should return fallback quiz JSON', async () => {
    const { generateQuizQuestions: fallbackQuiz } = await import('@/lib/gemini');
    const result = await fallbackQuiz('elections');
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toHaveProperty('question');
  });

  it('should return fallback simplification', async () => {
    const { simplifyText: fallbackSimplify } = await import('@/lib/gemini');
    const result = await fallbackSimplify('Complex text', 'child');
    expect(result).toContain('simple');
  });

  it('should return fallback translation', async () => {
    const { translateMessage: fallbackTranslate } = await import('@/lib/gemini');
    const result = await fallbackTranslate('How to vote?', 'Hindi');
    expect(result).toContain('वोट');
  });

  it('should return fallback fact check', async () => {
    const { factCheckClaim: fallbackFact } = await import('@/lib/gemini');
    const result = await fallbackFact('Some claim');
    expect(result).toContain('Fact Check');
  });
});
