/**
 * @module lib/analytics
 * @description Firebase Analytics helper for VoteWise. Tracks user interactions
 * and page views via Firestore with a batched event queue for performance.
 */

import { getFirestoreDb } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ANALYTICS_BATCH } from './constants';

export type AnalyticsEventType =
  | 'page_view' | 'chat_message' | 'quiz_answer' | 'quiz_complete'
  | 'timeline_explore' | 'map_interaction' | 'resource_view'
  | 'theme_toggle' | 'accessibility_change' | 'video_watch'
  | 'glossary_search' | 'fact_check' | 'performance_metric' | 'error';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  source: string;
  metadata?: Record<string, string | number | boolean>;
  clientTimestamp: string;
  serverTimestamp?: ReturnType<typeof serverTimestamp>;
  sessionId: string;
}

/** Pending event queue for batched writes */
interface QueuedEvent {
  eventType: AnalyticsEventType;
  source: string;
  metadata?: Record<string, string | number | boolean>;
  clientTimestamp: string;
  sessionId: string;
}

let _sessionId: string | null = null;
let _eventQueue: QueuedEvent[] = [];
let _flushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Retrieves or creates a persistent session ID for the current browser session.
 * Stored in `sessionStorage` to persist across page navigations within a tab.
 * @returns The current session identifier string
 */
function getSessionId(): string {
  if (_sessionId) return _sessionId;
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('votewise-session');
    if (stored) { _sessionId = stored; return stored; }
  }
  _sessionId = 'session-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  if (typeof window !== 'undefined') sessionStorage.setItem('votewise-session', _sessionId);
  return _sessionId;
}

/**
 * Flushes the event queue to Firestore in a single batch operation.
 * Called automatically when the queue reaches MAX_QUEUE_SIZE or
 * after FLUSH_INTERVAL_MS.
 */
async function flushEventQueue(): Promise<void> {
  if (_eventQueue.length === 0) return;

  const eventsToFlush = [..._eventQueue];
  _eventQueue = [];

  try {
    const db = getFirestoreDb();
    const analyticsRef = collection(db, 'analytics');
    const writePromises = eventsToFlush.map((event) =>
      addDoc(analyticsRef, {
        ...event,
        serverTimestamp: serverTimestamp(),
      })
    );
    await Promise.allSettled(writePromises);
  } catch (error) {
    console.warn('[VoteWise Analytics] Failed to flush event batch:', error);
  }
}

/** Schedules a flush if one is not already pending. */
function scheduleFlush(): void {
  if (_flushTimer) return;
  _flushTimer = setTimeout(() => {
    _flushTimer = null;
    flushEventQueue();
  }, ANALYTICS_BATCH.FLUSH_INTERVAL_MS);
}

/**
 * Queues an analytics event for batched writing to Firestore.
 * Events are flushed when the queue reaches MAX_QUEUE_SIZE or
 * after FLUSH_INTERVAL_MS, whichever comes first.
 *
 * @param eventType - The type of analytics event
 * @param source - The source component or page
 * @param metadata - Optional key-value metadata
 */
export async function logEvent(
  eventType: AnalyticsEventType,
  source: string,
  metadata?: Record<string, string | number | boolean>
): Promise<void> {
  const event: QueuedEvent = {
    eventType,
    source,
    metadata,
    clientTimestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  _eventQueue.push(event);

  if (_eventQueue.length >= ANALYTICS_BATCH.MAX_QUEUE_SIZE) {
    await flushEventQueue();
  } else {
    scheduleFlush();
  }
}

/**
 * Logs a page view event.
 * @param pageName - The name of the page being viewed
 */
export async function logPageView(pageName: string): Promise<void> {
  await logEvent('page_view', pageName, {
    path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'server',
  });
}

/**
 * Logs a user interaction event.
 * @param feature - The feature being interacted with
 * @param action - The specific action taken
 * @param details - Optional additional details
 */
export async function logInteraction(
  feature: string, action: string,
  details?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('map_interaction', feature, { action, ...details });
}

/**
 * Retrieves recent analytics events from Firestore.
 * @param maxEvents - Maximum number of events to retrieve (defaults to 50)
 * @returns Array of recent analytics events
 */
export async function getRecentEvents(maxEvents: number = 50): Promise<AnalyticsEvent[]> {
  try {
    const db = getFirestoreDb();
    const ref = collection(db, 'analytics');
    const q = query(ref, orderBy('clientTimestamp', 'desc'), limit(maxEvents));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AnalyticsEvent);
  } catch (error) {
    console.warn('[VoteWise Analytics] Failed to fetch events:', error);
    return [];
  }
}

/**
 * Logs a performance metric event.
 * @param metricName - Name of the performance metric
 * @param value - Metric value
 * @param context - Optional context metadata
 */
export async function logPerformanceMetric(
  metricName: string, value: number,
  context?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('performance_metric', 'PerformanceMonitor', { metricName, value, ...context });
}

/**
 * Logs an error event for monitoring.
 * @param category - Error category (e.g., "API", "Render")
 * @param message - Error message (truncated to 500 chars)
 * @param severity - Error severity level
 * @param context - Optional context metadata
 */
export async function logError(
  category: string, message: string,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'error',
  context?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('error', 'ErrorTracker', {
    category, message: message.substring(0, 500), severity, ...context,
  });
}
