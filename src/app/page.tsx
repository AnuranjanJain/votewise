'use client';

import { useEffect, useRef } from 'react';
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
    desc: 'Find your nearest polling station on an interactive map. Get accessibility info, facilities, and directions.',
    href: '/map', tag: 'Maps',
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
  { icon: '🧠', name: 'Gemini AI' },
  { icon: '🗺️', name: 'Google Maps API' },
  { icon: '📍', name: 'Geocoding & Places' },
  { icon: '🔊', name: 'Cloud Text-to-Speech' },
  { icon: '🌍', name: 'Cloud Translation' },
  { icon: '📺', name: 'YouTube API' },
  { icon: '🔥', name: 'Firebase Platform' },
];

export default function HomePage() {
  const { progress } = useAppContext();
  
  // Custom hook for scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.active);
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll(`.${styles.reveal}`);
    revealElements.forEach((el) => observer.observe(el));

    return () => revealElements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="page-content">
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGlow} />

        <div className={styles.heroContent}>
          <div className={styles.heroEmoji}>🗳️</div>
          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.heroTitleGradient}>VoteWise</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Your friendly, easy-to-understand guide to the Indian election process.
            Explore interactive timelines, chat with our AI guide, take quizzes, and
            become a confident, informed citizen.
          </p>
          <div className={styles.heroCTAs}>
            <Link href="/chat" className="btn btn-primary btn-lg" id="hero-chat-btn">
              🤖 Talk to Election Buddy
            </Link>
            <Link href="/timeline" className="btn btn-secondary btn-lg" id="hero-timeline-btn">
              📅 Explore the Timeline
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
          </div>
        </div>
      </section>

      {/* Democracy Score */}
      <section className={`${styles.progressSection} ${styles.reveal}`}>
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
          <div className="progress-bar" style={{ maxWidth: '400px', margin: '24px auto 0' }}>
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
        <h2 className={`${styles.featuresTitle} ${styles.reveal}`}>Everything You Need to Understand Elections</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, i) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={`${styles.featureCard} ${styles.reveal}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
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

      {/* Softened Google Services */}
      <section className={`${styles.services} ${styles.reveal}`}>
        <h2 className={styles.servicesTitle}>Built securely with</h2>
        <div className={styles.servicesGrid}>
          {googleServices.map((service, i) => (
            <div 
              key={service.name} 
              className={`${styles.servicePill} ${styles.reveal}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <span>{service.icon}</span>
              <span>{service.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
