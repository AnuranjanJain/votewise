'use client';

import Link from 'next/link';
import { useAppContext } from '@/components/AppProvider';
import styles from './page.module.css';

const features = [
  {
    icon: '🤖', title: 'Election Buddy AI',
    desc: 'Your personal AI guide powered by Gemini. Ask anything about elections — voting process, rights, registration, and more!',
    href: '/chat', tag: 'Gemini AI',
  },
  {
    icon: '📅', title: 'Interactive Timeline',
    desc: 'Step-by-step visualization of the entire election process — from announcement to government formation, with key activities and rules.',
    href: '/timeline', tag: 'Interactive',
  },
  {
    icon: '🧠', title: 'Election Quiz',
    desc: 'Test your knowledge with AI-powered quizzes. Multiple difficulty levels, streak bonuses, and detailed explanations for every answer.',
    href: '/quiz', tag: 'Gamified',
  },
  {
    icon: '🗺️', title: 'Polling Station Finder',
    desc: 'Find your nearest polling station on an interactive map. Get accessibility info, facilities, and directions — powered by Google Maps.',
    href: '/map', tag: 'Google Maps',
  },
  {
    icon: '📚', title: 'Learn & Resources',
    desc: 'Comprehensive election encyclopedia with 200+ glossary terms, curated videos, fact-checker, and downloadable voter checklists.',
    href: '/learn', tag: 'Encyclopedia',
  },
  {
    icon: '🌐', title: 'Multi-Language Support',
    desc: 'Understand elections in your language. AI-powered translation supports Hindi, Tamil, Telugu, Bengali, and more Indian languages.',
    href: '/chat', tag: 'Translation',
  },
];

const googleServices = [
  { icon: '🧠', name: 'Gemini AI (Chat)', desc: 'Election Buddy chatbot' },
  { icon: '🎯', name: 'Gemini AI (Quiz)', desc: 'AI-generated questions' },
  { icon: '📖', name: 'Gemini AI (Simplify)', desc: 'Text simplification' },
  { icon: '🌐', name: 'Gemini AI (Translate)', desc: 'Multi-language support' },
  { icon: '✅', name: 'Gemini AI (Fact-Check)', desc: 'Claim verification' },
  { icon: '🗺️', name: 'Google Maps JS API', desc: 'Polling station map' },
  { icon: '📍', name: 'Geocoding API', desc: 'Address lookup' },
  { icon: '🏪', name: 'Places API', desc: 'Nearby govt offices' },
  { icon: '🔊', name: 'Cloud Text-to-Speech', desc: 'Read-aloud accessibility' },
  { icon: '🌍', name: 'Cloud Translation', desc: 'Native translations' },
  { icon: '📺', name: 'YouTube Data API', desc: 'Education videos' },
  { icon: '🔥', name: 'Firebase Firestore', desc: 'Quiz & progress data' },
  { icon: '🔐', name: 'Firebase Auth', desc: 'Anonymous authentication' },
  { icon: '📊', name: 'Firebase Analytics', desc: 'Engagement tracking' },
];

export default function HomePage() {
  const { progress } = useAppContext();

  return (
    <div className="page-content">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />
        
        {/* 3D Decorators */}
        <div className={styles.decorator1} aria-hidden="true">🌐</div>
        <div className={styles.decorator2} aria-hidden="true">⚡</div>
        <div className={styles.decorator3} aria-hidden="true">🎯</div>

        <div className={styles.heroContent}>
          <div className={styles.heroEmoji}>🗳️</div>
          <h1 className={styles.heroTitle}>
            Your AI-Powered{' '}
            <span className={styles.heroTitleGradient}>Guide to Democracy</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Understand the Indian election process from start to finish.
            Interactive timelines, AI chat, quizzes, and everything you need
            to be an informed citizen.
          </p>
          <div className={styles.heroCTAs}>
            <Link href="/chat" className="btn btn-primary btn-lg" id="hero-chat-btn">
              🤖 Talk to Election Buddy
            </Link>
            <Link href="/timeline" className="btn btn-secondary btn-lg" id="hero-timeline-btn">
              📅 Explore Timeline
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>960M+</div>
              <div className={styles.statLabel}>Eligible Voters</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>543</div>
              <div className={styles.statLabel}>Lok Sabha Seats</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>8</div>
              <div className={styles.statLabel}>Election Phases</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>AI</div>
              <div className={styles.statLabel}>Powered by Gemini</div>
            </div>
          </div>
        </div>
      </section>

      {/* Democracy Score */}
      <section className={styles.progressSection}>
        <div className={styles.progressCard}>
          <div className={styles.progressTitle}>🏛️ Your Democracy Score</div>
          <div className={styles.progressValue}>{progress.democracyScore}%</div>
          <div className={styles.progressLabel}>
            {progress.democracyScore === 0
              ? 'Start learning to build your score!'
              : progress.democracyScore >= 80
                ? 'You\'re a democracy champion! 🏆'
                : 'Keep exploring to increase your score!'}
          </div>
          <div className="progress-bar" style={{ maxWidth: '400px', margin: '16px auto 0' }}>
            <div
              className="progress-fill"
              style={{
                width: `${progress.democracyScore}%`,
                background: 'var(--gradient-primary)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className={styles.features} id="features">
        <h2 className={styles.featuresTitle}>Everything You Need to Understand Elections</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={`${styles.featureCard} animate-fade-in-up stagger-${i + 1}`}
              id={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.desc}</p>
              <span className={styles.featureTag}>{feature.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Google Services */}
      <section className={styles.services}>
        <h2 className={styles.featuresTitle}>Powered by 14 Google Services</h2>
        <div className={styles.servicesGrid}>
          {googleServices.map(service => (
            <div key={service.name} className={styles.serviceCard}>
              <div className={styles.serviceIcon}>{service.icon}</div>
              <div className={styles.serviceName}>{service.name}</div>
              <div className={styles.serviceDesc}>{service.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
