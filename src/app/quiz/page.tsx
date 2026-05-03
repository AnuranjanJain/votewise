'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { QuizSession } from '@/types';
import { createQuizSession, processAnswer, calculateQuizStats, getCurrentQuestion, isQuizComplete } from '@/lib/quiz-engine';
import styles from './page.module.css';

export default function QuizPage() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const firstOptionRef = useRef<HTMLButtonElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  const startQuiz = useCallback(() => {
    setSession(createQuizSession(difficulty, category, 10));
    setSelectedOption(null);
    setShowExplanation(false);
  }, [difficulty, category]);

  // Auto-focus first option when a new question appears
  useEffect(() => {
    if (session && !isQuizComplete(session) && selectedOption === null) {
      // Small delay to ensure DOM update
      const timer = setTimeout(() => firstOptionRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [session?.currentIndex, selectedOption, session]);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (!session || selectedOption !== null) return;
    setSelectedOption(optionIndex);
    setShowExplanation(true);
    const question = getCurrentQuestion(session);
    if (question) {
      const { updatedSession } = processAnswer(session, question.id, optionIndex);
      // Don't advance index yet — wait for "Next"
      setSession({ ...updatedSession, currentIndex: session.currentIndex });
    }
  }, [session, selectedOption]);

  const handleNext = useCallback(() => {
    if (!session) return;
    setSession(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null);
    setSelectedOption(null);
    setShowExplanation(false);
  }, [session]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, optionIndex: number, totalOptions: number) => {
    let targetIndex: number | null = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = (optionIndex + 1) % totalOptions;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIndex = (optionIndex - 1 + totalOptions) % totalOptions;
    }
    if (targetIndex !== null) {
      const target = document.getElementById(`option-${targetIndex}`);
      target?.focus();
    }
  }, []);

  // Setup screen
  if (!session) {
    return (
      <div className="page-content">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>🧠 Election Quiz</h1>
            <p className={styles.subtitle}>Test your knowledge of Indian elections</p>
          </div>
          <div className={styles.setupCard} role="form" aria-label="Quiz configuration">
            <div className={styles.setupTitle}>Configure Your Quiz</div>
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="difficulty-select">Difficulty</label>
                <select id="difficulty-select" className={styles.filterSelect} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="category-select">Category</label>
                <select id="category-select" className={styles.filterSelect} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="process">Election Process</option>
                  <option value="history">History</option>
                  <option value="rights">Voter Rights</option>
                  <option value="constitution">Constitution</option>
                  <option value="institutions">Institutions</option>
                </select>
              </div>
            </div>
            <button className={styles.startBtn} onClick={startQuiz} id="start-quiz-btn">
              🚀 Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (isQuizComplete(session)) {
    const stats = calculateQuizStats(session);
    return (
      <div className="page-content">
        <div className={styles.container}>
          <div className={styles.resultsCard} role="region" aria-label="Quiz results">
            <div className={styles.resultsGrade} aria-label={`Grade: ${stats.grade}`}>{stats.grade}</div>
            <div className={styles.resultsMessage} role="status">{stats.message}</div>
            <div className={styles.scoreBoard} aria-label="Score breakdown">
              <div className={styles.scoreStat}>
                <div className={styles.scoreValue} style={{ color: 'var(--color-success)' }}>{stats.correctAnswers}</div>
                <div className={styles.scoreLabel}>Correct</div>
              </div>
              <div className={styles.scoreStat}>
                <div className={styles.scoreValue} style={{ color: 'var(--color-danger)' }}>{stats.wrongAnswers}</div>
                <div className={styles.scoreLabel}>Wrong</div>
              </div>
              <div className={styles.scoreStat}>
                <div className={styles.scoreValue} style={{ color: 'var(--color-accent)' }}>{stats.percentage}%</div>
                <div className={styles.scoreLabel}>Score</div>
              </div>
              <div className={styles.scoreStat}>
                <div className={styles.scoreValue}>🔥 {stats.bestStreak}</div>
                <div className={styles.scoreLabel}>Best Streak</div>
              </div>
            </div>
            <button className={styles.startBtn} onClick={startQuiz} id="retry-quiz-btn">🔄 Try Again</button>
            <button className={styles.nextBtn} onClick={() => setSession(null)} style={{ background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', marginTop: 'var(--space-sm)' }}>
              ← Back to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  const question = getCurrentQuestion(session);
  if (!question) return null;

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="page-content">
      <div className={styles.container}>
        <div className={styles.scoreBoard} ref={scoreRef} aria-live="polite" aria-atomic="true" aria-label="Current score">
          <div className={styles.scoreStat}>
            <div className={styles.scoreValue}>{session.score}</div>
            <div className={styles.scoreLabel}>Points</div>
          </div>
          <div className={styles.scoreStat}>
            <div className={styles.scoreValue}>{session.currentIndex + 1}/{session.questions.length}</div>
            <div className={styles.scoreLabel}>Question</div>
          </div>
          <div className={styles.scoreStat}>
            <div className={styles.scoreValue}>🔥 {session.streak}</div>
            <div className={styles.scoreLabel}>Streak</div>
          </div>
        </div>

        <div className={styles.questionCard} role="region" aria-label={`Question ${session.currentIndex + 1} of ${session.questions.length}`}>
          <div className={styles.questionHeader}>
            <span className={styles.questionCount}>
              Question {session.currentIndex + 1} of {session.questions.length}
            </span>
            <span className={`${styles.streak} ${session.streak >= 3 ? styles.streakActive : ''}`}>
              {session.streak >= 3 ? `🔥 x${session.streak}` : `📊 ${question.difficulty}`}
            </span>
          </div>

          <h2 className={styles.questionText} id="question-text">{question.question}</h2>

          <div className={styles.options} role="radiogroup" aria-labelledby="question-text" aria-required="true">
            {question.options.map((option, i) => {
              let optionClass = styles.option;
              if (selectedOption !== null) {
                optionClass += ` ${styles.optionDisabled}`;
                if (i === question.correctAnswer) optionClass += ` ${styles.optionCorrect}`;
                else if (i === selectedOption && i !== question.correctAnswer) optionClass += ` ${styles.optionWrong}`;
              }
              return (
                <button
                  key={i}
                  ref={i === 0 ? firstOptionRef : undefined}
                  className={optionClass}
                  onClick={() => handleAnswer(i)}
                  onKeyDown={(e) => handleKeyDown(e, i, question.options.length)}
                  disabled={selectedOption !== null}
                  id={`option-${i}`}
                  role="radio"
                  aria-checked={selectedOption === i}
                  aria-label={`Option ${letters[i]}: ${option}`}
                >
                  <span className={styles.optionLetter} aria-hidden="true">{letters[i]}</span>
                  {option}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={styles.explanation} role="alert" aria-live="assertive">
              <div className={styles.explanationLabel}>
                {selectedOption === question.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              {question.explanation}
              {question.source && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>📖 Source: {question.source}</div>}
            </div>
          )}

          {selectedOption !== null && (
            <button className={styles.nextBtn} onClick={handleNext} id="next-question-btn" autoFocus>
              {session.currentIndex + 1 >= session.questions.length ? '📊 View Results' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
