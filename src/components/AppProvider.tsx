'use client';

import type { ReactNode} from 'react';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import type { AccessibilitySettings, LearningProgress, Theme } from '@/types';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  accessibility: AccessibilitySettings;
  setAccessibility: (settings: AccessibilitySettings) => void;
  progress: LearningProgress;
  updateProgress: (updates: Partial<LearningProgress>) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultProgress: LearningProgress = {
  topicsCompleted: [],
  quizScores: {},
  totalQuizzesTaken: 0,
  chatMessagesSent: 0,
  phasesExplored: [],
  badges: [],
  democracyScore: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false, largeText: false, reducedMotion: false, screenReader: false,
  });
  const [progress, setProgress] = useState<LearningProgress>(defaultProgress);

  // Initialize theme
  useEffect(() => {
    let initialTheme: Theme = 'dark';
    let initialProgress: LearningProgress | null = null;
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('votewise-theme') as Theme | null;
      if (stored) {
        initialTheme = stored;
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        initialTheme = 'light';
      }

      // Load saved progress
      const savedProgress = localStorage.getItem('votewise-progress');
      if (savedProgress) {
        try { initialProgress = JSON.parse(savedProgress); } catch { /* ignore */ }
      }
    }
    
    // Defer state updates to avoid synchronous setState during render cycle
    setTimeout(() => {
      setTheme(initialTheme);
      if (initialProgress) setProgress(initialProgress);
      setIsLoading(false);
    }, 0);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('votewise-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const updateProgress = useCallback((updates: Partial<LearningProgress>) => {
    setProgress(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('votewise-progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Apply accessibility classes
  useEffect(() => {
    const body = document.body;
    body.classList.toggle('high-contrast', accessibility.highContrast);
    body.classList.toggle('large-text', accessibility.largeText);
    if (accessibility.reducedMotion) {
      body.style.setProperty('--transition-base', '0ms');
      body.style.setProperty('--transition-fast', '0ms');
      body.style.setProperty('--transition-slow', '0ms');
    } else {
      body.style.removeProperty('--transition-base');
      body.style.removeProperty('--transition-fast');
      body.style.removeProperty('--transition-slow');
    }
  }, [accessibility]);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, accessibility, setAccessibility, progress, updateProgress, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
