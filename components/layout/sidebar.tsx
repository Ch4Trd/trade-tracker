'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ListOrdered, BookOpen,
  BarChart2, Settings, TrendingUp,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/trades',    label: 'Trades',     icon: ListOrdered },
  { href: '/journal',   label: 'Journal',    icon: BookOpen },
  { href: '/analytics', label: 'Analytics',  icon: BarChart2 },
  { href: '/settings',  label: 'Settings',   icon: Settings },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        width: 68,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 12,
          background: 'var(--violet-grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
        }}>
          <TrendingUp size={18} color="#fff" strokeWidth={2.5} />
        </div>
      </div>

      <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 0', flex: 1 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              data-tooltip={label}
              className={`nav-icon-btn ${active ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {active && (
                <span style={{
                  position: 'absolute',
                  left: -1,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  borderRadius: '0 3px 3px 0',
                  background: 'var(--violet)',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Avatar */}
      <div style={{ paddingBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <div
          data-tooltip="Charles"
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'var(--violet-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
            cursor: 'pointer',
          }}
        >
          C
        </div>
      </div>
    </aside>
  );
}
