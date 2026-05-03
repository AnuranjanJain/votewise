/**
 * @module utils/helpers
 * @description Utility helper functions for formatting, scoring, and common operations.
 */

/**
 * Formats a number with commas using the Indian numbering system.
 * In India, digits are grouped as: last 3 digits, then every 2 digits.
 *
 * @param num - The number to format
 * @returns The formatted number string (e.g., 1,00,000)
 *
 * @example
 * ```ts
 * formatIndianNumber(100000); // '1,00,000'
 * formatIndianNumber(12345);  // '12,345'
 * ```
 */
export function formatIndianNumber(num: number): string {
  const str = num.toString();
  const lastThree = str.substring(str.length - 3);
  const rest = str.substring(0, str.length - 3);
  if (rest !== '') {
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return lastThree;
}

/**
 * Formats a duration in seconds into a human-readable string.
 *
 * @param seconds - The duration in seconds
 * @returns Formatted string (e.g., "5m 30s", "2h 15m")
 *
 * @example
 * ```ts
 * formatDuration(90);   // '1m 30s'
 * formatDuration(3600); // '1h 0m'
 * ```
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h ${remainMins}m`;
}

/**
 * Formats a date string into Indian locale format.
 *
 * @param dateString - An ISO 8601 date string
 * @returns Formatted date (e.g., "3 May 2026")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/**
 * Calculates a democracy score (0–100) based on user learning activity.
 * Weighted formula: topics (30%), quizzes (25%), chat (20%), phases (25%).
 *
 * @param progress - Object containing user engagement metrics
 * @returns Integer score from 0 to 100
 */
export function calculateDemocracyScore(progress: {
  topicsCompleted: number;
  quizzesTaken: number;
  chatMessages: number;
  phasesExplored: number;
}): number {
  const topicScore = Math.min(progress.topicsCompleted * 10, 30);
  const quizScore = Math.min(progress.quizzesTaken * 5, 25);
  const chatScore = Math.min(progress.chatMessages * 2, 20);
  const phaseScore = Math.min(progress.phasesExplored * 3.125, 25);
  return Math.min(Math.round(topicScore + quizScore + chatScore + phaseScore), 100);
}

/**
 * Generates a unique ID using timestamp + random suffix.
 * Not cryptographically secure — suitable for client-side identifiers.
 *
 * @returns A unique string identifier (e.g., "lnq1a2bcd3e")
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Truncates text to a maximum length, appending ellipsis if needed.
 *
 * @param text - The input string to truncate
 * @param maxLength - Maximum output length (including ellipsis)
 * @returns The truncated string, or the original if within bounds
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Creates a debounced version of a function that delays invocation
 * until `wait` milliseconds have elapsed since the last call.
 *
 * @param func - The function to debounce
 * @param wait - The debounce delay in milliseconds
 * @returns A debounced version of `func`
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Returns a contextual greeting based on the current time of day.
 *
 * @returns "Good Morning" (before noon), "Good Afternoon" (noon–5pm), or "Good Evening"
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
