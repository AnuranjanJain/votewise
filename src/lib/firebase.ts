/**
 * @module lib/firebase
 * @description Firebase client setup providing Firestore database, Auth,
 * and real-time data persistence for quiz results and learning progress.
 */

import type { FirebaseApp } from 'firebase/app';
import { initializeApp, getApps } from 'firebase/app';
import type { Firestore} from 'firebase/firestore';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000:web:000',
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

/** Returns the Firebase App singleton, initializing if necessary */
function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

/** Returns the Firestore database instance */
export function getFirestoreDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

/** Returns the Firebase Auth instance */
export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

/**
 * Signs in anonymously to Firebase Auth.
 * Falls back to a random session ID on failure.
 *
 * @returns The user's unique ID string
 */
export async function signInAnon(): Promise<string> {
  const authInstance = getFirebaseAuth();
  try {
    const result = await signInAnonymously(authInstance);
    return result.user.uid;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    return 'anonymous-' + Math.random().toString(36).substring(2, 9);
  }
}

/**
 * Saves a completed quiz result to the 'quiz_results' Firestore collection.
 * Calculates and stores the percentage score alongside raw data.
 *
 * @param data - The quiz result data including score, total, difficulty, and time
 */
export async function saveQuizResult(data: {
  score: number;
  totalQuestions: number;
  difficulty: string;
  category: string;
  timeTaken: number;
}): Promise<void> {
  try {
    const firestore = getFirestoreDb();
    const ref = collection(firestore, 'quiz_results');
    await addDoc(ref, {
      ...data,
      percentage: Math.round((data.score / data.totalQuestions) * 100),
      timestamp: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('[VoteWise] Failed to save quiz result:', error);
  }
}

/**
 * Retrieves the quiz leaderboard sorted by percentage score (descending).
 *
 * @param maxEntries - Maximum entries to return (defaults to 20)
 * @returns Array of leaderboard entries
 */
export async function getLeaderboard(maxEntries: number = 20): Promise<Record<string, unknown>[]> {
  try {
    const firestore = getFirestoreDb();
    const ref = collection(firestore, 'quiz_results');
    const q = query(ref, orderBy('percentage', 'desc'), limit(maxEntries));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn('[VoteWise] Failed to fetch leaderboard:', error);
    return [];
  }
}

/**
 * Persists a learning progress snapshot to the 'learning_progress' collection.
 *
 * @param data - Arbitrary progress data to save
 */
export async function saveLearningProgress(data: Record<string, unknown>): Promise<void> {
  try {
    const firestore = getFirestoreDb();
    const ref = collection(firestore, 'learning_progress');
    await addDoc(ref, {
      ...data,
      timestamp: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('[VoteWise] Failed to save learning progress:', error);
  }
}
