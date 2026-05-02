// ============================================================
// VoteWise — Utility Helpers
// ============================================================

/**
 * Formats a number with commas (Indian numbering system).
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
 * Formats seconds into a human-readable duration.
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
 * Formats a date string into a human-readable format.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/**
 * Calculates a "democracy score" based on learning progress.
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
 * Generates a unique ID.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Truncates text to a max length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Debounce function.
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
 * Returns a greeting based on time of day.
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
