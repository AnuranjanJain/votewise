'use client';

import { useEffect } from 'react';
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
      {/* Premium Hero */}
      <section className={styles.hero}>
        <div className={styles.meshBg}>
          <div className={`${styles.orb} ${styles.orb1}`} />
          <div className={`${styles.orb} ${styles.orb2}`} />
          <div className={`${styles.orb} ${styles.orb3}`} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.glassPane}>
            <div className={styles.heroIconContainer}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>

            {/* Floating Stats over the glass pane */}
            <div className={`${styles.floatingStat} ${styles.floatingStat1}`}>
              <div className={styles.statVal}>960M+</div>
              <div className={styles.statLab}>Eligible Voters</div>
            </div>
            <div className={`${styles.floatingStat} ${styles.floatingStat2}`}>
              <div className={styles.statVal}>8</div>
              <div className={styles.statLab}>Election Phases</div>
            </div>

            <h1 className={styles.heroTitle}>
              Welcome to <span className={styles.heroTitleGradient}>VoteWise</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Your friendly, easy-to-understand guide to the Indian election process.
              Explore interactive timelines, chat with our AI guide, take quizzes, and
              become a confident, informed citizen.
            </p>
            
            <div className={styles.btnGroup}>
              <Link href="/chat" className={styles.btnPremium} id="hero-chat-btn">
                <span className={styles.btnPremiumInner}></span>
                <span className={styles.btnPremiumText}>🤖 Talk to Election Buddy</span>
              </Link>
              <Link href="/timeline" className={styles.btnOutlinePremium} id="hero-timeline-btn">
                <span>📅 Explore the Timeline</span>
              </Link>
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
