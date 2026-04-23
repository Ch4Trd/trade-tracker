import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
  icon: LucideIcon;
  gradient?: boolean;
}

export function MetricCard({ label, value, sub, positive, negative, icon: Icon, gradient }: MetricCardProps) {
  const valueColor = positive ? 'var(--gain)' : negative ? 'var(--loss)' : '#fff';

  if (gradient) {
    return (
      <div className="card-gradient p-5" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: 20,
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
            {label}
          </span>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color="#fff" />
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, marginTop: 6, color: 'rgba(255,255,255,0.7)' }}>{sub}</div>}
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          {label}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color: 'var(--violet)' }} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: valueColor }}>{value}</div>
      {sub && <div style={{ fontSize: 12, marginTop: 6, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}
