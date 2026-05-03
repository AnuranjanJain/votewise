// ============================================================
// VoteWise — Centralized Configuration Constants
// All magic numbers and config values in one place
// ============================================================

/** Maximum length for chat messages (characters) */
export const MAX_CHAT_MESSAGE_LENGTH = 2000;

/** Maximum chat history messages accepted by the API */
export const MAX_CHAT_HISTORY_MESSAGES = 12;

/** Maximum text parts accepted in each chat history message */
export const MAX_CHAT_HISTORY_PARTS = 4;

/** Maximum analytics events per batch */
export const MAX_ANALYTICS_BATCH_SIZE = 50;

/** Maximum metadata keys per analytics event */
export const MAX_METADATA_KEYS = 20;

/** Maximum text accepted for text-to-speech synthesis */
export const MAX_TTS_TEXT_LENGTH = 5000;

/** Maximum search query length for public search integrations */
export const MAX_SEARCH_QUERY_LENGTH = 120;

/** Nearby-place search radius bounds in meters */
export const PLACE_SEARCH_RADIUS = {
  MIN_METERS: 100,
  MAX_METERS: 5000,
  DEFAULT_METERS: 2000,
} as const;

/** Place types allowed by the polling station finder proxy */
export const VALID_PLACE_TYPES = [
  'school',
  'local_government_office',
  'city_hall',
  'courthouse',
  'point_of_interest',
] as const;

/** Cloud TTS language codes exposed by the app */
export const SUPPORTED_TTS_LANGUAGE_CODES = [
  'en-IN',
  'hi-IN',
  'ta-IN',
  'te-IN',
  'bn-IN',
  'mr-IN',
  'gu-IN',
  'kn-IN',
] as const;

/** Maximum image upload size (5MB) */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Valid analytics event types */
export const VALID_EVENT_TYPES = [
  'page_view',
  'chat_message',
  'quiz_answer',
  'quiz_complete',
  'timeline_explore',
  'map_interaction',
  'resource_view',
  'theme_toggle',
  'accessibility_change',
  'video_watch',
  'glossary_search',
  'fact_check',
  'performance_metric',
  'error',
] as const;

/** Quiz configuration */
export const QUIZ_CONFIG = {
  QUESTIONS_PER_SESSION: 10,
  MAX_QUESTIONS_PER_REQUEST: 20,
  TIME_PER_QUESTION_SECONDS: 30,
  STREAK_BONUS_THRESHOLD: 3,
  STREAK_BONUS_POINTS: 5,
  BASE_POINTS_CORRECT: 10,
  BASE_POINTS_WRONG: 0,
  MAX_DIFFICULTY_LEVELS: 3,
} as const;

/** Quiz filters accepted by the public quiz API */
export const VALID_QUIZ_DIFFICULTIES = ['beginner', 'intermediate', 'expert', 'all'] as const;
export const VALID_QUIZ_CATEGORIES = [
  'process',
  'history',
  'rights',
  'constitution',
  'current-affairs',
  'institutions',
  'all',
] as const;

/** Election timeline configuration */
export const TIMELINE_CONFIG = {
  TOTAL_PHASES: 8,
  MIN_PHASE_DURATION_DAYS: 1,
  MAX_PHASE_DURATION_DAYS: 60,
} as const;

/** Supported languages for translation */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
] as const;

/** API rate limiting */
export const RATE_LIMITS = {
  CHAT_MESSAGES_PER_MINUTE: 10,
  QUIZ_REQUESTS_PER_MINUTE: 20,
  TTS_REQUESTS_PER_MINUTE: 5,
} as const;

/** Gemini model configuration */
export const GEMINI_CONFIG = {
  MODEL_NAME: 'gemini-2.0-flash',
  MAX_OUTPUT_TOKENS: 2048,
  TEMPERATURE: 0.7,
} as const;

/** Default coordinates — New Delhi (India Gate area) */
export const DEFAULT_COORDINATES = {
  lat: 28.6129,
  lng: 77.2295,
} as const;

/** App metadata */
export const APP_META = {
  NAME: 'VoteWise',
  TAGLINE: 'Your AI-Powered Guide to Democracy',
  VERSION: '1.0.0',
  AUTHOR: 'VoteWise Team',
} as const;

/** Cache TTL constants (milliseconds) */
export const CACHE_TTL = {
  QUIZ_QUESTIONS: 10 * 60 * 1000,
  GEOCODE_RESULTS: 30 * 60 * 1000,
  PLACES_RESULTS: 5 * 60 * 1000,
  YOUTUBE_RESULTS: 15 * 60 * 1000,
  CHAT_RESPONSES: 5 * 60 * 1000,
  TTS_RESULTS: 60 * 60 * 1000,
} as const;

/** Analytics event batch configuration */
export const ANALYTICS_BATCH = {
  MAX_QUEUE_SIZE: 20,
  FLUSH_INTERVAL_MS: 10_000,
} as const;

/** Badge definitions for gamification */
export const BADGES = [
  { id: 'first-chat', name: 'First Question', icon: '💬', description: 'Asked your first question to Election Buddy' },
  { id: 'quiz-starter', name: 'Quiz Starter', icon: '🎯', description: 'Completed your first quiz' },
  { id: 'quiz-master', name: 'Quiz Master', icon: '🏆', description: 'Scored 100% on a quiz' },
  { id: 'explorer', name: 'Timeline Explorer', icon: '🗺️', description: 'Explored all timeline phases' },
  { id: 'voter-ready', name: 'Voter Ready', icon: '✅', description: 'Completed all learning modules' },
  { id: 'streak-3', name: 'Hot Streak', icon: '🔥', description: 'Got 3 quiz answers correct in a row' },
  { id: 'streak-5', name: 'On Fire', icon: '⚡', description: 'Got 5 quiz answers correct in a row' },
  { id: 'multilingual', name: 'Multilingual', icon: '🌐', description: 'Used translation feature' },
] as const;
