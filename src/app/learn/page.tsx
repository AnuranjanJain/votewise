'use client';

import { useState, useMemo } from 'react';
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

  return (
    <div className="page-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📚 Learn About Elections</h1>
          <p className={styles.subtitle}>Explore facts, glossary terms, and educational resources</p>
        </div>

        <div className={styles.tabs} role="tablist">
          {[
            { id: 'facts' as Tab, label: '📊 Election Facts', count: electionFacts.length },
            { id: 'glossary' as Tab, label: '📖 Glossary', count: electionGlossary.length },
            { id: 'videos' as Tab, label: '📺 Videos', count: fallbackVideos.length },
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              id={`tab-${tab.id}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Facts Tab */}
        {activeTab === 'facts' && (
          <section role="tabpanel" aria-labelledby="tab-facts">
            <h2 className={styles.sectionTitle}>🇮🇳 Did You Know?</h2>
            <div className={styles.factsGrid}>
              {electionFacts.map((fact, i) => (
                <div key={fact.id} className={`${styles.factCard} animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                  <div className={styles.factIcon}>{fact.icon}</div>
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
          <section role="tabpanel" aria-labelledby="tab-glossary">
            <h2 className={styles.sectionTitle}>📖 Election Glossary</h2>
            <div className={styles.glossarySearch}>
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
              <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-muted)' }}>
                No terms found matching &quot;{glossarySearch}&quot;
              </div>
            )}
          </section>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <section role="tabpanel" aria-labelledby="tab-videos">
            <h2 className={styles.sectionTitle}>📺 Educational Videos</h2>
            <div className={styles.videosGrid}>
              {fallbackVideos.map((video, i) => (
                <div key={i} className={`${styles.videoCard} animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                  <div className={styles.videoThumbWrapper}>
                    <div className={styles.videoThumb}>{video.icon}</div>
                    <div className={styles.videoPlayIcon}></div>
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
