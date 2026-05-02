'use client';

import { useState, useMemo } from 'react';
import { samplePollingStations } from '@/lib/election-data';
import styles from './page.module.css';

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return samplePollingStations;
    const q = searchQuery.toLowerCase();
    return samplePollingStations.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.constituency.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="page-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🗺️ Polling Station Finder</h1>
          <p className={styles.subtitle}>Find your nearest polling booth with accessibility info and facilities</p>
        </div>

        {/* Map Placeholder */}
        <div className={styles.mapWrapper}>
          <div className={styles.mapPlaceholder}>
            <div className={styles.mapPlaceholderIcon}>🗺️</div>
            <p className={styles.mapNote}>
              Interactive Google Maps will load here with polling station markers.
              Configure <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</strong> in .env.local to enable the map.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchBar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by station name, address, or constituency..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search polling stations"
            id="station-search"
          />
          <button className={styles.searchBtn} aria-label="Search" id="station-search-btn">🔍 Search</button>
        </div>

        {/* Station Cards */}
        <div className={styles.stationsGrid}>
          {filteredStations.map((station, i) => (
            <div key={i} className={`${styles.stationCard} animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <div className={styles.stationHeader}>
                <div className={styles.stationName}>{station.name}</div>
                {station.isActive && <span className={styles.stationActive}>🟢 Active</span>}
              </div>
              <div className={styles.stationAddress}>📍 {station.address}</div>
              <div className={styles.stationConstituency}>🏛️ {station.constituency} Constituency</div>

              <div className={styles.stationSection}>
                <div className={styles.stationLabel}>♿ Accessibility</div>
                <div className={styles.stationTags}>
                  {station.accessibility.map((a, j) => (
                    <span key={j} className={styles.stationTag}>{a}</span>
                  ))}
                </div>
              </div>

              <div className={styles.stationSection}>
                <div className={styles.stationLabel}>🏢 Facilities</div>
                <div className={styles.stationTags}>
                  {station.facilities.map((f, j) => (
                    <span key={j} className={styles.stationTag}>{f}</span>
                  ))}
                </div>
              </div>

              <div className={styles.stationHours}>🕐 {station.hours}</div>
            </div>
          ))}
        </div>

        {filteredStations.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-muted)' }}>
            No polling stations found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
