/**
 * @module __tests__/lib/firebase
 * @description Tests for Firebase initialization and persistence helpers.
 */

const mockApp = { name: 'votewise-test-app' };
const mockDb = { name: 'firestore-test-db' };
const mockAuth = { name: 'auth-test-instance' };
const mockCollectionRef = { path: 'collection-ref' };
const mockQueryRef = { path: 'query-ref' };
const mockServerTimestamp = { seconds: 123 };

const initializeApp = jest.fn(() => mockApp);
const getApps = jest.fn(() => []);
const getFirestore = jest.fn(() => mockDb);
const collection = jest.fn(() => mockCollectionRef);
const addDoc = jest.fn(async () => ({ id: 'doc-1' }));
const getDocs = jest.fn(async () => ({
  docs: [
    { id: 'leader-1', data: () => ({ percentage: 95, score: 19 }) },
    { id: 'leader-2', data: () => ({ percentage: 90, score: 18 }) },
  ],
}));
const query = jest.fn(() => mockQueryRef);
const orderBy = jest.fn((field: string, direction: string) => ({ field, direction }));
const limit = jest.fn((count: number) => ({ count }));
const serverTimestamp = jest.fn(() => mockServerTimestamp);
const getAuth = jest.fn(() => mockAuth);
const signInAnonymously = jest.fn(async () => ({ user: { uid: 'anonymous-user-1' } }));

jest.mock('firebase/app', () => ({
  initializeApp,
  getApps,
}));

jest.mock('firebase/firestore', () => ({
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
}));

jest.mock('firebase/auth', () => ({
  getAuth,
  signInAnonymously,
}));

import {
  getFirestoreDb,
  getFirebaseAuth,
  signInAnon,
  saveQuizResult,
  getLeaderboard,
  saveLearningProgress,
} from '@/lib/firebase';

describe('Firebase helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getApps.mockReturnValue([]);
    initializeApp.mockReturnValue(mockApp);
    getFirestore.mockReturnValue(mockDb);
    getAuth.mockReturnValue(mockAuth);
    addDoc.mockResolvedValue({ id: 'doc-1' });
    getDocs.mockResolvedValue({
      docs: [
        { id: 'leader-1', data: () => ({ percentage: 95, score: 19 }) },
        { id: 'leader-2', data: () => ({ percentage: 90, score: 18 }) },
      ],
    });
    signInAnonymously.mockResolvedValue({ user: { uid: 'anonymous-user-1' } });
  });

  it('initializes and returns the Firestore singleton', () => {
    expect(getFirestoreDb()).toBe(mockDb);
    expect(getFirestoreDb()).toBe(mockDb);
    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(getFirestore).toHaveBeenCalledTimes(1);
  });

  it('initializes and returns the Auth singleton', () => {
    expect(getFirebaseAuth()).toBe(mockAuth);
    expect(getFirebaseAuth()).toBe(mockAuth);
    expect(getAuth).toHaveBeenCalledTimes(1);
  });

  it('returns the anonymous Firebase user id on sign-in success', async () => {
    await expect(signInAnon()).resolves.toBe('anonymous-user-1');
    expect(signInAnonymously).toHaveBeenCalledWith(mockAuth);
  });

  it('returns a local anonymous id when sign-in fails', async () => {
    signInAnonymously.mockRejectedValueOnce(new Error('auth unavailable'));
    const warnSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(signInAnon()).resolves.toMatch(/^anonymous-[a-z0-9]+$/);
    warnSpy.mockRestore();
  });

  it('saves quiz results with calculated percentage and timestamps', async () => {
    await saveQuizResult({
      score: 8,
      totalQuestions: 10,
      difficulty: 'beginner',
      category: 'process',
      timeTaken: 42,
    });

    expect(collection).toHaveBeenCalledWith(mockDb, 'quiz_results');
    expect(addDoc).toHaveBeenCalledWith(
      mockCollectionRef,
      expect.objectContaining({
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        timestamp: mockServerTimestamp,
        clientTimestamp: expect.any(String),
      })
    );
  });

  it('swallows quiz result persistence failures', async () => {
    addDoc.mockRejectedValueOnce(new Error('write failed'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(saveQuizResult({
      score: 1,
      totalQuestions: 2,
      difficulty: 'expert',
      category: 'rights',
      timeTaken: 10,
    })).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns leaderboard rows with document ids', async () => {
    const rows = await getLeaderboard(2);
    expect(collection).toHaveBeenCalledWith(mockDb, 'quiz_results');
    expect(orderBy).toHaveBeenCalledWith('percentage', 'desc');
    expect(limit).toHaveBeenCalledWith(2);
    expect(query).toHaveBeenCalledWith(mockCollectionRef, { field: 'percentage', direction: 'desc' }, { count: 2 });
    expect(rows).toEqual([
      { id: 'leader-1', percentage: 95, score: 19 },
      { id: 'leader-2', percentage: 90, score: 18 },
    ]);
  });

  it('returns an empty leaderboard when Firestore reads fail', async () => {
    getDocs.mockRejectedValueOnce(new Error('read failed'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(getLeaderboard()).resolves.toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('saves learning progress snapshots', async () => {
    await saveLearningProgress({ democracyScore: 88, badges: ['quiz-master'] });
    expect(collection).toHaveBeenCalledWith(mockDb, 'learning_progress');
    expect(addDoc).toHaveBeenCalledWith(
      mockCollectionRef,
      expect.objectContaining({
        democracyScore: 88,
        badges: ['quiz-master'],
        timestamp: mockServerTimestamp,
        clientTimestamp: expect.any(String),
      })
    );
  });

  it('swallows learning progress persistence failures', async () => {
    addDoc.mockRejectedValueOnce(new Error('write failed'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(saveLearningProgress({ democracyScore: 10 })).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
