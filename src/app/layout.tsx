import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'VoteWise — AI-Powered Election Process Education',
  description: 'Your personal AI guide to understanding Indian elections. Interactive timeline, quizzes, polling station finder, and Election Buddy AI chatbot.',
  keywords: 'election, voting, India, democracy, election process, voter education, ECI, EVM, Gemini AI, Google Maps',
  authors: [{ name: 'VoteWise Team' }],
  openGraph: {
    title: 'VoteWise — Your AI-Powered Guide to Democracy',
    description: 'Learn about the Indian election process through interactive tools, AI chat, quizzes, and more.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#060d1f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AppProvider>
            <a href="#main-content" className="sr-only">Skip to main content</a>
            <Navbar />
            <main id="main-content" role="main">
              {children}
            </main>
            <BottomNav />
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
