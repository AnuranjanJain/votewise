// ============================================================
// VoteWise — TypeScript Type Definitions
// ============================================================

export type ElectionPhase =
  | 'announcement' | 'nomination' | 'scrutiny' | 'campaigning'
  | 'polling' | 'counting' | 'results' | 'formation';

export type PhaseStatus = 'completed' | 'active' | 'upcoming';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

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
}

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

export type QuizCategory =
  | 'process' | 'history' | 'rights' | 'constitution'
  | 'current-affairs' | 'institutions';

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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

export interface ElectionFact {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  icon: string;
}

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

export interface LearningProgress {
  topicsCompleted: string[];
  quizScores: Record<string, number[]>;
  totalQuizzesTaken: number;
  chatMessagesSent: number;
  phasesExplored: string[];
  badges: string[];
  democracyScore: number;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

export interface VideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  source: 'youtube-api' | 'fallback';
}

export type Theme = 'dark' | 'light';

export interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  itemCount: number;
}
