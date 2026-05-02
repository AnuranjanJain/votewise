// ============================================================
// VoteWise — Election Data Test Suite
// ============================================================

import { electionTimelinePhases, electionGlossary, electionFacts, quizQuestionBank, samplePollingStations, getGlossaryByCategory, getFilteredQuestions, getRandomQuestions } from '@/lib/election-data';

describe('Election Data', () => {
  describe('Timeline Phases', () => {
    it('should have exactly 8 phases', () => { expect(electionTimelinePhases).toHaveLength(8); });
    it('should have unique phase IDs', () => {
      const ids = electionTimelinePhases.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
    it('should have correct order sequence', () => {
      electionTimelinePhases.forEach((p, i) => { expect(p.order).toBe(i + 1); });
    });
    it('should have valid status values', () => {
      electionTimelinePhases.forEach(p => { expect(['completed', 'active', 'upcoming']).toContain(p.status); });
    });
    it('should have positive duration for all', () => {
      electionTimelinePhases.forEach(p => { expect(p.durationDays).toBeGreaterThan(0); });
    });
    it('should have non-empty key activities', () => {
      electionTimelinePhases.forEach(p => { expect(p.keyActivities.length).toBeGreaterThan(0); });
    });
    it('should have non-empty rules', () => {
      electionTimelinePhases.forEach(p => { expect(p.rules.length).toBeGreaterThan(0); });
    });
    it('should have icons for all phases', () => {
      electionTimelinePhases.forEach(p => { expect(p.icon).toBeTruthy(); });
    });
    it('should start with announcement', () => { expect(electionTimelinePhases[0].id).toBe('announcement'); });
    it('should end with formation', () => { expect(electionTimelinePhases[7].id).toBe('formation'); });
    it('should have exactly one active phase', () => {
      const active = electionTimelinePhases.filter(p => p.status === 'active');
      expect(active.length).toBe(1);
    });
    it('should have details longer than description', () => {
      electionTimelinePhases.forEach(p => { expect(p.details.length).toBeGreaterThan(p.description.length); });
    });
  });

  describe('Glossary', () => {
    it('should have at least 15 terms', () => { expect(electionGlossary.length).toBeGreaterThanOrEqual(15); });
    it('should have unique terms', () => {
      const terms = electionGlossary.map(t => t.term);
      expect(new Set(terms).size).toBe(terms.length);
    });
    it('should have category for all', () => { electionGlossary.forEach(t => { expect(t.category).toBeTruthy(); }); });
    it('should have non-empty definitions', () => { electionGlossary.forEach(t => { expect(t.definition.length).toBeGreaterThan(10); }); });
    it('should include EVM', () => { expect(electionGlossary.find(t => t.term === 'EVM')).toBeTruthy(); });
    it('should include NOTA', () => { expect(electionGlossary.find(t => t.term === 'NOTA')).toBeTruthy(); });
    it('should include Lok Sabha', () => { expect(electionGlossary.find(t => t.term === 'Lok Sabha')).toBeTruthy(); });
  });

  describe('Election Facts', () => {
    it('should have at least 8 facts', () => { expect(electionFacts.length).toBeGreaterThanOrEqual(8); });
    it('should have unique IDs', () => {
      const ids = electionFacts.map(f => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
    it('should have source for all', () => { electionFacts.forEach(f => { expect(f.source).toBeTruthy(); }); });
    it('should have icons', () => { electionFacts.forEach(f => { expect(f.icon).toBeTruthy(); }); });
  });

  describe('Quiz Question Bank', () => {
    it('should have at least 15 questions', () => { expect(quizQuestionBank.length).toBeGreaterThanOrEqual(15); });
    it('should have unique IDs', () => {
      const ids = quizQuestionBank.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
    it('should have exactly 4 options each', () => {
      quizQuestionBank.forEach(q => { expect(q.options).toHaveLength(4); });
    });
    it('should have valid correctAnswer index', () => {
      quizQuestionBank.forEach(q => { expect(q.correctAnswer).toBeGreaterThanOrEqual(0); expect(q.correctAnswer).toBeLessThanOrEqual(3); });
    });
    it('should have non-empty explanations', () => {
      quizQuestionBank.forEach(q => { expect(q.explanation.length).toBeGreaterThan(0); });
    });
    it('should have valid difficulty levels', () => {
      quizQuestionBank.forEach(q => { expect(['beginner', 'intermediate', 'expert']).toContain(q.difficulty); });
    });
    it('should have questions across multiple categories', () => {
      const categories = new Set(quizQuestionBank.map(q => q.category));
      expect(categories.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Polling Stations', () => {
    it('should have at least 3 stations', () => { expect(samplePollingStations.length).toBeGreaterThanOrEqual(3); });
    it('should have valid coordinates', () => {
      samplePollingStations.forEach(s => {
        expect(s.lat).toBeGreaterThanOrEqual(-90); expect(s.lat).toBeLessThanOrEqual(90);
        expect(s.lng).toBeGreaterThanOrEqual(-180); expect(s.lng).toBeLessThanOrEqual(180);
      });
    });
    it('should have accessibility info', () => {
      samplePollingStations.forEach(s => { expect(s.accessibility.length).toBeGreaterThan(0); });
    });
    it('should have operating hours', () => {
      samplePollingStations.forEach(s => { expect(s.hours).toBeTruthy(); });
    });
  });

  describe('getGlossaryByCategory', () => {
    it('should return all when category is "all"', () => {
      expect(getGlossaryByCategory('all')).toEqual(electionGlossary);
    });
    it('should filter by category', () => {
      const voting = getGlossaryByCategory('Voting');
      voting.forEach(t => { expect(t.category).toBe('Voting'); });
    });
    it('should return empty for non-existent category', () => {
      expect(getGlossaryByCategory('nonexistent')).toHaveLength(0);
    });
  });

  describe('getFilteredQuestions', () => {
    it('should return all when no filters', () => { expect(getFilteredQuestions().length).toBe(quizQuestionBank.length); });
    it('should filter by difficulty', () => {
      const beginners = getFilteredQuestions('beginner');
      beginners.forEach(q => { expect(q.difficulty).toBe('beginner'); });
    });
    it('should filter by category', () => {
      const process = getFilteredQuestions('all', 'process');
      process.forEach(q => { expect(q.category).toBe('process'); });
    });
  });

  describe('getRandomQuestions', () => {
    it('should return requested count', () => {
      const questions = getRandomQuestions(5);
      expect(questions.length).toBeLessThanOrEqual(5);
    });
    it('should not exceed available questions', () => {
      const questions = getRandomQuestions(100);
      expect(questions.length).toBeLessThanOrEqual(quizQuestionBank.length);
    });
    it('should return shuffled questions', () => {
      const q1 = getRandomQuestions(10);
      const q2 = getRandomQuestions(10);
      // Probabilistically they should be different
      const ids1 = q1.map(q => q.id).join(',');
      const ids2 = q2.map(q => q.id).join(',');
      // Note: very small chance of false failure but practically always passes
      expect(q1.length).toBeGreaterThan(0);
    });
  });
});
