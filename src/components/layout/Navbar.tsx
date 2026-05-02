'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '@/components/AppProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import styles from './Navbar.module.css';

const navItems = [
  { href: '/timeline', label: 'Timeline', icon: '📅' },
  { href: '/chat', label: 'Election Buddy', icon: '🤖' },
  { href: '/quiz', label: 'Quiz', icon: '🧠' },
  { href: '/map', label: 'Find Booth', icon: '🗺️' },
  { href: '/learn', label: 'Learn', icon: '📚' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { progress } = useAppContext();
  const [highlightStyle, setHighlightStyle] = useState({ opacity: 0, left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector(`.${styles.active}`) as HTMLElement;
    if (activeLink) {
      setHighlightStyle({
        opacity: 1,
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      });
    } else {
      setHighlightStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [pathname]);

  return (
    <div className={styles.navbarWrapper}>
      <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
        <Link href="/" className={styles.brand} aria-label="VoteWise Home">
          <span className={styles.logo}>🗳️</span>
          <span className={styles.brandName}>VoteWise</span>
        </Link>

        <div className={styles.navLinks} ref={navRef}>
          <div className={styles.navHighlight} style={highlightStyle} aria-hidden="true" />
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div className={styles.scoreChip} aria-label={`Democracy Score: ${progress.democracyScore}`}>
            🏆 {progress.democracyScore}%
          </div>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
