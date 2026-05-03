'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/timeline', label: 'Timeline', icon: '📅' },
  { href: '/chat', label: 'Buddy', icon: '🤖' },
  { href: '/quiz', label: 'Quiz', icon: '🧠' },
  { href: '/learn', label: 'Learn', icon: '📚' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} role="navigation" aria-label="Mobile navigation">
      <div className={styles.navInner}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
            {item.label}
            {pathname === item.href && <span className={styles.activeIndicator} aria-hidden="true" />}
          </Link>
        ))}
      </div>
    </nav>
  );
}
