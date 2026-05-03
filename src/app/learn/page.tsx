'use client';

import { useState, useMemo, useCallback } from 'react';
import { electionGlossary, electionFacts } from '@/lib/election-data';
import styles from './page.module.css';

type Tab = 'facts' | 'glossary' | 'videos';

const fallbackVideos = [
  { title: 'How Indian Elections Work — Complete Guide', channel: 'Civic Education India', icon: '🗳️' },
  { title: 'Understanding EVM and VVPAT', channel: 'Tech & Democracy', icon: '💻' },
  { title: 'Election Commission — Powers & Functions', channel: 'Constitution Explained', icon: '🏛️' },
  { title: 'Your Voting Rights Explained', channel: 'Rights & Rules', icon: '✅' },
  { title: 'Model Code of Conduct', channel: 'Election Watch', icon: '📋' },
  { title: 'History of Indian Elections', channel: 'Democracy Decoded', icon: '📅' },
];

const tabs: { id: Tab; label: string; count: number }[] = [
  { id: 'facts', label: '📊 Election Facts', count: electionFacts.length },
  { id: 'glossary', label: '📖 Glossary', count: electionGlossary.length },
  { id: 'videos', label: '📺 Videos', count: fallbackVideos.length },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<Tab>('facts');
  const [glossarySearch, setGlossarySearch] = useState('');

  const filteredGlossary = useMemo(() => {
    if (!glossarySearch.trim()) return electionGlossary;
    const q = glossarySearch.toLowerCase();
    return electionGlossary.filter(t =>
      t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    );
  }, [glossarySearch]);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent, tabIndex: number) => {
    let targetIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = (tabIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIndex = (tabIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = tabs.length - 1;
    }
    if (targetIndex !== null) {
      setActiveTab(tabs[targetIndex].id);
      const target = document.getElementById(`tab-${tabs[targetIndex].id}`);
      target?.focus();
    }
  }, []);

  return (
    <div className="page-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📚 Learn About Elections</h1>
          <p className={styles.subtitle}>Explore facts, glossary terms, and educational resources</p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Learning content categories">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, i)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Facts Tab */}
        {activeTab === 'facts' && (
          <section role="tabpanel" aria-labelledby="tab-facts" id="panel-facts">
            <h2 className={styles.sectionTitle}>🇮🇳 Did You Know?</h2>
            <div className={styles.factsGrid}>
              {electionFacts.map((fact, i) => (
                <div key={fact.id} className={`${styles.factCard} animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                  <div className={styles.factIcon} aria-hidden="true">{fact.icon}</div>
                  <div className={styles.factTitle}>{fact.title}</div>
                  <div className={styles.factContent}>{fact.content}</div>
                  <div className={styles.factSource}>📖 Source: {fact.source}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <section role="tabpanel" aria-labelledby="tab-glossary" id="panel-glossary">
            <h2 className={styles.sectionTitle}>📖 Election Glossary</h2>
            <div className={styles.glossarySearch} role="search" aria-label="Search glossary terms">
              <input
                className={styles.glossaryInput}
                type="text"
                placeholder="Search terms... (e.g., EVM, NOTA, Lok Sabha)"
                value={glossarySearch}
                onChange={e => setGlossarySearch(e.target.value)}
                aria-label="Search glossary"
                id="glossary-search"
              />
            </div>
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {filteredGlossary.length} terms found
            </div>
            <div className={styles.glossaryGrid}>
              {filteredGlossary.map((term, i) => (
                <div key={term.term} className={`${styles.glossaryCard} animate-fade-in stagger-${Math.min(i + 1, 6)}`}>
                  <div className={styles.glossaryTerm}>{term.term}</div>
                  <div className={styles.glossaryDef}>{term.definition}</div>
                  <div className={styles.glossaryCategory}>{term.category}</div>
                </div>
              ))}
            </div>
            {filteredGlossary.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-muted)' }} role="status">
                No terms found matching &quot;{glossarySearch}&quot;
              </div>
            )}
          </section>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <section role="tabpanel" aria-labelledby="tab-videos" id="panel-videos">
            <h2 className={styles.sectionTitle}>📺 Educational Videos</h2>
            <div className={styles.videosGrid}>
              {fallbackVideos.map((video, i) => (
                <div key={i} className={`${styles.videoCard} animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                  <div className={styles.videoThumbWrapper}>
                    <div className={styles.videoThumb} aria-hidden="true">{video.icon}</div>
                    <div className={styles.videoPlayIcon} aria-hidden="true"></div>
                  </div>
                  <div className={styles.videoInfo}>
                    <div className={styles.videoTitle}>{video.title}</div>
                    <div className={styles.videoChannel}>{video.channel}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Configure <strong>YOUTUBE_DATA_API_KEY</strong> in .env.local for live YouTube video search
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
