/**
 * @module lib/quiz-engine
 * @description Quiz engine for VoteWise. Manages quiz session lifecycle
 * including question selection, answer processing, streak tracking,
 * and score calculation with gamification mechanics.
 */

import type { QuizQuestion, QuizSession } from '@/types';
import { QUIZ_CONFIG } from './constants';
import { getRandomQuestions, quizQuestionBank } from './election-data';

/**
 * Creates a new quiz session with randomized questions.
 */
export function createQuizSession(
  difficulty: string = 'all',
  category: string = 'all',
  count: number = QUIZ_CONFIG.QUESTIONS_PER_SESSION
): QuizSession {
  const questions = getRandomQuestions(count, difficulty, category);
  return {
    currentIndex: 0,
    questions: questions.length > 0 ? questions : quizQuestionBank.slice(0, count),
    answers: {},
    score: 0,
    streak: 0,
    bestStreak: 0,
    startedAt: new Date().toISOString(),
    difficulty: difficulty as QuizSession['difficulty'],
    category: category as QuizSession['category'],
  };
}

/**
 * Processes a quiz answer and updates the session state.
 */
export function processAnswer(
  session: QuizSession,
  questionId: string,
  selectedOption: number
): { isCorrect: boolean; pointsEarned: number; updatedSession: QuizSession } {
  const question = session.questions.find(q => q.id === questionId);
  if (!question) {
    return { isCorrect: false, pointsEarned: 0, updatedSession: session };
  }

  const isCorrect = selectedOption === question.correctAnswer;
  let pointsEarned = 0;
  let newStreak = session.streak;

  if (isCorrect) {
    pointsEarned = QUIZ_CONFIG.BASE_POINTS_CORRECT;
    newStreak += 1;

    // Streak bonus
    if (newStreak >= QUIZ_CONFIG.STREAK_BONUS_THRESHOLD) {
      pointsEarned += QUIZ_CONFIG.STREAK_BONUS_POINTS;
    }
  } else {
    pointsEarned = QUIZ_CONFIG.BASE_POINTS_WRONG;
    newStreak = 0;
  }

  const updatedSession: QuizSession = {
    ...session,
    answers: { ...session.answers, [questionId]: selectedOption },
    score: session.score + pointsEarned,
    streak: newStreak,
    bestStreak: Math.max(session.bestStreak, newStreak),
    currentIndex: session.currentIndex + 1,
  };

  return { isCorrect, pointsEarned, updatedSession };
}

/**
 * Calculates the final score and statistics for a completed quiz.
 */
export function calculateQuizStats(session: QuizSession): {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  bestStreak: number;
  totalPoints: number;
  timeTaken: number;
  grade: string;
  message: string;
} {
  let correctAnswers = 0;
  for (const question of session.questions) {
    if (session.answers[question.id] === question.correctAnswer) {
      correctAnswers++;
    }
  }

  const totalQuestions = session.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const timeTaken = Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000);

  let grade: string;
  let message: string;
  if (percentage >= 90) { grade = 'A+'; message = '🏆 Outstanding! You\'re an election expert!'; }
  else if (percentage >= 80) { grade = 'A'; message = '🌟 Excellent work! Almost perfect!'; }
  else if (percentage >= 70) { grade = 'B'; message = '👏 Great job! You know your elections well!'; }
  else if (percentage >= 60) { grade = 'C'; message = '📚 Good effort! Keep learning!'; }
  else if (percentage >= 50) { grade = 'D'; message = '💪 Not bad! Review the timeline section for more.'; }
  else { grade = 'F'; message = '📖 Time to study! Check out the Learn section.'; }

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers: totalQuestions - correctAnswers,
    percentage,
    bestStreak: session.bestStreak,
    totalPoints: session.score,
    timeTaken,
    grade,
    message,
  };
}

/**
 * Returns the current question from a session.
 */
export function getCurrentQuestion(session: QuizSession): QuizQuestion | null {
  if (session.currentIndex >= session.questions.length) return null;
  return session.questions[session.currentIndex];
}

/**
 * Checks if a quiz session is complete.
 */
export function isQuizComplete(session: QuizSession): boolean {
  return session.currentIndex >= session.questions.length;
}
