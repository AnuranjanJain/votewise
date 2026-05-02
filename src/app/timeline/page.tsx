'use client';

import { useState } from 'react';
import { electionTimelinePhases } from '@/lib/election-data';
import styles from './page.module.css';

export default function TimelinePage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>('campaigning');

  const completedCount = electionTimelinePhases.filter(p => p.status === 'completed').length;
  const activeIndex = electionTimelinePhases.findIndex(p => p.status === 'active');
  const fillPercent = ((completedCount + 0.5) / electionTimelinePhases.length) * 100;

  return (
    <div className="page-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📅 Election Process Timeline</h1>
          <p className={styles.subtitle}>
            Follow the complete Indian election journey — from announcement to government formation
          </p>
        </div>

        <div className={styles.timeline}>
          <div className={styles.timelineLine}>
            <div className={styles.timelineLineFill} style={{ height: `${fillPercent}%` }} />
          </div>

          {electionTimelinePhases.map((phase, index) => (
            <div
              key={phase.id}
              className={`${styles.phase} animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
            >
              <div className={`${styles.phaseMarker} ${
                phase.status === 'completed' ? styles.phaseMarkerCompleted :
                phase.status === 'active' ? styles.phaseMarkerActive :
                styles.phaseMarkerUpcoming
              }`}>
                {phase.status === 'completed' ? '✓' : phase.icon}
              </div>

              <div
                className={`${styles.phaseCard} ${phase.status === 'active' ? styles.phaseCardActive : ''}`}
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                role="button"
                tabIndex={0}
                aria-expanded={expandedPhase === phase.id}
                aria-label={`${phase.title} - ${phase.status}`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedPhase(expandedPhase === phase.id ? null : phase.id); }}}
              >
                <div className={styles.phaseHeader}>
                  <div className={styles.phaseTitleContainer}>
                    <h3 className={styles.phaseTitle}>
                      {phase.icon} {phase.title}
                    </h3>
                    {phase.demoDate && (
                      <span className={styles.phaseDate}>
                        📅 {phase.demoDate}
                      </span>
                    )}
                  </div>
                  <span className={`${styles.phaseStatus} ${
                    phase.status === 'completed' ? styles.statusCompleted :
                    phase.status === 'active' ? styles.statusActive :
                    styles.statusUpcoming
                  }`}>
                    {phase.status === 'completed' ? '✅ Done' :
                     phase.status === 'active' ? '🔵 Current' :
                     `Step ${phase.order}`}
                  </span>
                </div>
                <p className={styles.phaseDesc}>{phase.description}</p>
                <div className={styles.phaseDuration}>⏱️ Duration: ~{phase.durationDays} days</div>

                {expandedPhase === phase.id && (
                  <div className={styles.phaseDetails}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.7 }}>
                      {phase.details}
                    </p>

                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel}>🔑 Key Activities</div>
                      <div className={styles.detailList}>
                        {phase.keyActivities.map((activity, i) => (
                          <div key={i} className={styles.detailItem}>{activity}</div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel}>📋 Rules & Regulations</div>
                      <div className={styles.detailList}>
                        {phase.rules.map((rule, i) => (
                          <div key={i} className={styles.detailItem}>{rule}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
