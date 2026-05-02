// ============================================================
// VoteWise — Firebase Analytics Helper
// Tracks user interactions and page views via Firestore
// ============================================================

import { getFirestoreDb } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

export type AnalyticsEventType =
  | 'page_view' | 'chat_message' | 'quiz_answer' | 'quiz_complete'
  | 'timeline_explore' | 'map_interaction' | 'resource_view'
  | 'theme_toggle' | 'accessibility_change' | 'video_watch'
  | 'glossary_search' | 'fact_check';

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  source: string;
  metadata?: Record<string, string | number | boolean>;
  clientTimestamp: string;
  serverTimestamp?: ReturnType<typeof serverTimestamp>;
  sessionId: string;
}

let _sessionId: string | null = null;

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
 * Logs an analytics event to Firestore.
 */
export async function logEvent(
  eventType: AnalyticsEventType,
  source: string,
  metadata?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    const db = getFirestoreDb();
    const analyticsRef = collection(db, 'analytics');
    await addDoc(analyticsRef, {
      eventType, source, metadata,
      clientTimestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      sessionId: getSessionId(),
    });
  } catch (error) {
    console.warn('[VoteWise Analytics] Failed to log event:', error);
  }
}

/** Log a page view */
export async function logPageView(pageName: string): Promise<void> {
  await logEvent('page_view', pageName, {
    path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'server',
  });
}

/** Log a user interaction */
export async function logInteraction(
  feature: string, action: string,
  details?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('map_interaction', feature, { action, ...details });
}

/** Retrieve recent analytics events */
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

/** Log performance metric */
export async function logPerformanceMetric(
  metricName: string, value: number,
  context?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('page_view' as AnalyticsEventType, 'PerformanceMonitor', { metricName, value, ...context });
}

/** Log error event */
export async function logError(
  category: string, message: string,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'error',
  context?: Record<string, string | number | boolean>
): Promise<void> {
  await logEvent('page_view' as AnalyticsEventType, 'ErrorTracker', {
    category, message: message.substring(0, 500), severity, ...context,
  });
}
