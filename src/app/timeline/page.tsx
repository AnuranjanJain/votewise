'use client';

import { useState, useCallback } from 'react';
import { electionTimelinePhases } from '@/lib/election-data';
import styles from './page.module.css';

export default function TimelinePage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>('campaigning');

  const completedCount = electionTimelinePhases.filter(p => p.status === 'completed').length;
  const fillPercent = ((completedCount + 0.5) / electionTimelinePhases.length) * 100;

  const togglePhase = useCallback((phaseId: string) => {
    setExpandedPhase(prev => prev === phaseId ? null : phaseId);
  }, []);

  return (
    <div className="page-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📅 Election Process Timeline</h1>
          <p className={styles.subtitle}>
            Follow the complete Indian election journey — from announcement to government formation
          </p>
        </div>

        {/* Progress summary for screen readers */}
        <div className="sr-only" role="status" aria-live="polite">
          {completedCount} of {electionTimelinePhases.length} phases completed
        </div>

        <div className={styles.timeline} role="list" aria-label="Election process phases">
          <div className={styles.timelineLine} aria-hidden="true">
            <div className={styles.timelineLineFill} style={{ height: `${fillPercent}%` }} />
          </div>

          {electionTimelinePhases.map((phase, index) => (
            <div
              key={phase.id}
              className={`${styles.phase} animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
              role="listitem"
            >
              <div
                className={`${styles.phaseMarker} ${
                  phase.status === 'completed' ? styles.phaseMarkerCompleted :
                  phase.status === 'active' ? styles.phaseMarkerActive :
                  styles.phaseMarkerUpcoming
                }`}
                aria-hidden="true"
              >
                {phase.status === 'completed' ? '✓' : phase.icon}
              </div>

              <div
                className={`${styles.phaseCard} ${phase.status === 'active' ? styles.phaseCardActive : ''}`}
                onClick={() => togglePhase(phase.id)}
                role="button"
                tabIndex={0}
                aria-expanded={expandedPhase === phase.id}
                aria-label={`${phase.title} — ${phase.status}. ${expandedPhase === phase.id ? 'Press to collapse' : 'Press to expand details'}`}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePhase(phase.id); }}}
                id={`phase-${phase.id}`}
              >
                <div className={styles.phaseHeader}>
                  <div className={styles.phaseTitleContainer}>
                    <h3 className={styles.phaseTitle}>
                      <span aria-hidden="true">{phase.icon}</span> {phase.title}
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
                  <div className={`${styles.phaseDetails} animate-fade-in`} role="region" aria-label={`${phase.title} details`}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.7 }}>
                      {phase.details}
                    </p>

                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel} id={`activities-${phase.id}`}>🔑 Key Activities</div>
                      <div className={styles.detailList} role="list" aria-labelledby={`activities-${phase.id}`}>
                        {phase.keyActivities.map((activity, i) => (
                          <div key={i} className={styles.detailItem} role="listitem">{activity}</div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailSection}>
                      <div className={styles.detailLabel} id={`rules-${phase.id}`}>📋 Rules & Regulations</div>
                      <div className={styles.detailList} role="list" aria-labelledby={`rules-${phase.id}`}>
                        {phase.rules.map((rule, i) => (
                          <div key={i} className={styles.detailItem} role="listitem">{rule}</div>
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
