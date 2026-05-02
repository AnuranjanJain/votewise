'use client';

import { useAppContext } from './AppProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppContext();
  return (
    <button
      onClick={toggleTheme}
      className="btn btn-icon btn-secondary"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      id="theme-toggle"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
