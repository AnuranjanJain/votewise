/**
 * @module types
 * @description Shared TypeScript type definitions for the VoteWise platform.
 * All domain models, component props, and API contracts are defined here.
 */

/** Valid election process phase identifiers */
export type ElectionPhase =
  | 'announcement' | 'nomination' | 'scrutiny' | 'campaigning'
  | 'polling' | 'counting' | 'results' | 'formation';

/** Status of a timeline phase relative to the current point in time */
export type PhaseStatus = 'completed' | 'active' | 'upcoming';

/** Direction of a statistical trend */
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

/** Represents a single phase in the election timeline */
export interface TimelinePhase {
  id: ElectionPhase;
  title: string;
  description: string;
  details: string;
  keyActivities: string[];
  rules: string[];
  durationDays: number;
  icon: string;
  order: number;
  status: PhaseStatus;
  demoDate?: string;
}

/** Represents a quiz question with options and answer metadata */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  category: QuizCategory;
  source?: string;
}

/** Valid quiz topic categories */
export type QuizCategory =
  | 'process' | 'history' | 'rights' | 'constitution'
  | 'current-affairs' | 'institutions';

/** Tracks the state of a quiz session in progress */
export interface QuizSession {
  currentIndex: number;
  questions: QuizQuestion[];
  answers: Record<string, number>;
  score: number;
  streak: number;
  bestStreak: number;
  startedAt: string;
  difficulty: QuizQuestion['difficulty'] | 'all';
  category: QuizCategory | 'all';
}

/** A single chat message in the Election Buddy conversation */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
}

/** A glossary term and its definition */
export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

/** An election-related fact or statistic */
export interface ElectionFact {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  icon: string;
}

/** A polling station with location and accessibility info */
export interface PollingStation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  constituency: string;
  accessibility: string[];
  facilities: string[];
  hours: string;
  isActive: boolean;
}

/** Tracks the user's overall learning progress across the platform */
export interface LearningProgress {
  topicsCompleted: string[];
  quizScores: Record<string, number[]>;
  totalQuizzesTaken: number;
  chatMessagesSent: number;
  phasesExplored: string[];
  badges: string[];
  democracyScore: number;
}

/** User-configurable accessibility preferences */
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

/** A YouTube video search result */
export interface VideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  source: 'youtube-api' | 'fallback';
}

/** Theme mode for the application UI */
export type Theme = 'dark' | 'light';

/** A categorized learning resource collection */
export interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  itemCount: number;
}
