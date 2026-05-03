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
        <div className={styles.mapWrapper} role="img" aria-label="Map area — configure Google Maps API key to enable interactive map">
          <div className={styles.mapPlaceholder}>
            <div className={styles.mapPlaceholderIcon} aria-hidden="true">🗺️</div>
            <p className={styles.mapNote}>
              Interactive Google Maps will load here with polling station markers.
              Configure <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</strong> in .env.local to enable the map.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchBar} role="search" aria-label="Search polling stations">
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search by station name, address, or constituency..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search polling stations"
            aria-describedby="search-results-count"
            id="station-search"
          />
          <button className={styles.searchBtn} aria-label="Search" id="station-search-btn" type="button">🔍 Search</button>
        </div>

        {/* Live result count announcement */}
        <div id="search-results-count" aria-live="polite" aria-atomic="true" className="sr-only">
          {searchQuery.trim() ? `${filteredStations.length} polling station${filteredStations.length !== 1 ? 's' : ''} found` : `Showing all ${samplePollingStations.length} polling stations`}
        </div>

        {/* Station Cards */}
        <div className={styles.stationsGrid} role="list" aria-label="Polling stations">
          {filteredStations.map((station, i) => (
            <div key={i} className={`${styles.stationCard} animate-fade-in-up stagger-${Math.min(i + 1, 6)}`} role="listitem">
              <div className={styles.stationHeader}>
                <div className={styles.stationName}>{station.name}</div>
                {station.isActive && <span className={styles.stationActive} role="status">🟢 Active</span>}
              </div>
              <div className={styles.stationAddress}>📍 {station.address}</div>
              <div className={styles.stationConstituency}>🏛️ {station.constituency} Constituency</div>

              <div className={styles.stationSection}>
                <div className={styles.stationLabel}>♿ Accessibility</div>
                <div className={styles.stationTags} role="list" aria-label="Accessibility features">
                  {station.accessibility.map((a, j) => (
                    <span key={j} className={styles.stationTag} role="listitem">{a}</span>
                  ))}
                </div>
              </div>

              <div className={styles.stationSection}>
                <div className={styles.stationLabel}>🏢 Facilities</div>
                <div className={styles.stationTags} role="list" aria-label="Available facilities">
                  {station.facilities.map((f, j) => (
                    <span key={j} className={styles.stationTag} role="listitem">{f}</span>
                  ))}
                </div>
              </div>

              <div className={styles.stationHours}>🕐 {station.hours}</div>
            </div>
          ))}
        </div>

        {filteredStations.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--color-text-muted)' }} role="status">
            No polling stations found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
