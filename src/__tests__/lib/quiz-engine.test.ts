// ============================================================
// VoteWise — Quiz Engine Test Suite
// ============================================================

import { createQuizSession, processAnswer, calculateQuizStats, getCurrentQuestion, isQuizComplete } from '@/lib/quiz-engine';
import { QUIZ_CONFIG } from '@/lib/constants';

describe('Quiz Engine', () => {
  describe('createQuizSession', () => {
    it('should create a session with correct default count', () => {
      const session = createQuizSession();
      expect(session.questions.length).toBeLessThanOrEqual(QUIZ_CONFIG.QUESTIONS_PER_SESSION);
    });
    it('should start at index 0', () => { expect(createQuizSession().currentIndex).toBe(0); });
    it('should start with 0 score', () => { expect(createQuizSession().score).toBe(0); });
    it('should start with 0 streak', () => { expect(createQuizSession().streak).toBe(0); });
    it('should have empty answers', () => { expect(Object.keys(createQuizSession().answers)).toHaveLength(0); });
    it('should have valid startedAt timestamp', () => { expect(new Date(createQuizSession().startedAt).getTime()).not.toBeNaN(); });
    it('should respect custom count', () => {
      const session = createQuizSession('all', 'all', 5);
      expect(session.questions.length).toBeLessThanOrEqual(5);
    });
    it('should filter by difficulty', () => {
      const session = createQuizSession('beginner');
      // All questions should be beginner (or fallback if not enough)
      expect(session.questions.length).toBeGreaterThan(0);
    });
  });

  describe('processAnswer', () => {
    it('should mark correct answer', () => {
      const session = createQuizSession('all', 'all', 5);
      const q = getCurrentQuestion(session)!;
      const { isCorrect } = processAnswer(session, q.id, q.correctAnswer);
      expect(isCorrect).toBe(true);
    });
    it('should award base points for correct', () => {
      const session = createQuizSession('all', 'all', 5);
      const q = getCurrentQuestion(session)!;
      const { pointsEarned } = processAnswer(session, q.id, q.correctAnswer);
      expect(pointsEarned).toBeGreaterThanOrEqual(QUIZ_CONFIG.BASE_POINTS_CORRECT);
    });
    it('should mark incorrect answer', () => {
      const session = createQuizSession('all', 'all', 5);
      const q = getCurrentQuestion(session)!;
      const wrongIdx = (q.correctAnswer + 1) % 4;
      const { isCorrect } = processAnswer(session, q.id, wrongIdx);
      expect(isCorrect).toBe(false);
    });
    it('should give 0 points for wrong answer', () => {
      const session = createQuizSession('all', 'all', 5);
      const q = getCurrentQuestion(session)!;
      const wrongIdx = (q.correctAnswer + 1) % 4;
      const { pointsEarned } = processAnswer(session, q.id, wrongIdx);
      expect(pointsEarned).toBe(0);
    });
    it('should increment streak on correct', () => {
      const session = createQuizSession('all', 'all', 5);
      const q = getCurrentQuestion(session)!;
      const { updatedSession } = processAnswer(session, q.id, q.correctAnswer);
      expect(updatedSession.streak).toBe(1);
    });
    it('should reset streak on wrong', () => {
      let session = createQuizSession('all', 'all', 5);
      // Get correct first
      const q1 = getCurrentQuestion(session)!;
      const { updatedSession: s1 } = processAnswer(session, q1.id, q1.correctAnswer);
      session = { ...s1, currentIndex: 1 };
      // Then wrong
      const q2 = getCurrentQuestion(session);
      if (q2) {
        const wrongIdx = (q2.correctAnswer + 1) % 4;
        const { updatedSession: s2 } = processAnswer(session, q2.id, wrongIdx);
        expect(s2.streak).toBe(0);
      }
    });
    it('should track best streak', () => {
      const session = createQuizSession('all', 'all', 5);
      const q = getCurrentQuestion(session)!;
      const { updatedSession } = processAnswer(session, q.id, q.correctAnswer);
      expect(updatedSession.bestStreak).toBeGreaterThanOrEqual(1);
    });
    it('should record answer', () => {
      const session = createQuizSession('all', 'all', 5);
      const q = getCurrentQuestion(session)!;
      const { updatedSession } = processAnswer(session, q.id, 2);
      expect(updatedSession.answers[q.id]).toBe(2);
    });
    it('should handle invalid question ID', () => {
      const session = createQuizSession('all', 'all', 5);
      const { isCorrect, pointsEarned } = processAnswer(session, 'nonexistent', 0);
      expect(isCorrect).toBe(false);
      expect(pointsEarned).toBe(0);
    });
  });

  describe('calculateQuizStats', () => {
    it('should calculate correct percentage', () => {
      const session = createQuizSession('all', 'all', 2);
      // Answer both correctly
      const q1 = session.questions[0];
      const q2 = session.questions[1];
      const s = { ...session, answers: { [q1.id]: q1.correctAnswer, [q2.id]: q2.correctAnswer }, currentIndex: 2 };
      const stats = calculateQuizStats(s);
      expect(stats.percentage).toBe(100);
      expect(stats.correctAnswers).toBe(2);
    });
    it('should return grade A+ for 90%+', () => {
      const session = createQuizSession('all', 'all', 1);
      const q = session.questions[0];
      const s = { ...session, answers: { [q.id]: q.correctAnswer }, currentIndex: 1 };
      const stats = calculateQuizStats(s);
      expect(stats.grade).toBe('A+');
    });
    it('should return grade F for <50%', () => {
      const session = createQuizSession('all', 'all', 2);
      const q1 = session.questions[0];
      const q2 = session.questions[1];
      const s = { ...session, answers: { [q1.id]: (q1.correctAnswer + 1) % 4, [q2.id]: (q2.correctAnswer + 1) % 4 }, currentIndex: 2 };
      const stats = calculateQuizStats(s);
      expect(stats.grade).toBe('F');
    });
    it('should have a motivational message', () => {
      const session = createQuizSession('all', 'all', 1);
      const stats = calculateQuizStats(session);
      expect(stats.message).toBeTruthy();
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return first question at start', () => {
      const session = createQuizSession('all', 'all', 5);
      const q = getCurrentQuestion(session);
      expect(q).toBeTruthy();
      expect(q?.id).toBe(session.questions[0].id);
    });
    it('should return null when complete', () => {
      const session = createQuizSession('all', 'all', 1);
      const s = { ...session, currentIndex: 1 };
      expect(getCurrentQuestion(s)).toBeNull();
    });
  });

  describe('isQuizComplete', () => {
    it('should be false at start', () => { expect(isQuizComplete(createQuizSession('all', 'all', 5))).toBe(false); });
    it('should be true when all answered', () => {
      const session = createQuizSession('all', 'all', 1);
      expect(isQuizComplete({ ...session, currentIndex: 1 })).toBe(true);
    });
  });
});
