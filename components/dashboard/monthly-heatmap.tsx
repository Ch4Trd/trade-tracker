'use client';

import type { DayPnl } from '@/types';

interface MonthlyHeatmapProps {
  data: DayPnl[];
  year: number;
  month: number;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtPnl(pnl: number): string {
  const abs = Math.abs(Math.round(pnl));
  const sign = pnl >= 0 ? '+' : '-';
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k`;
  return `${sign}${abs}`;
}

export function MonthlyHeatmap({ data, year, month }: MonthlyHeatmapProps) {
  const map = new Map(data.map(d => [d.date, d]));
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay   = new Date(year, month - 1, 1).getDay();

  const cells: (DayPnl | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push(map.get(key) ?? { date: key, pnl: 0, trades: 0 });
  }

  const maxAbs = Math.max(...data.map(d => Math.abs(d.pnl)), 1);

  function dayBg(day: DayPnl | null): string {
    if (!day || day.trades === 0) return 'rgba(255,255,255,0.03)';
    const intensity = Math.min(Math.abs(day.pnl) / maxAbs, 1) * 0.65 + 0.2;
    return day.pnl > 0
      ? `rgba(34,197,94,${intensity})`
      : `rgba(239,68,68,${intensity})`;
  }

  const monthTotal   = data.reduce((s, d) => s + d.pnl, 0);
  const tradingDays  = data.filter(d => d.trades > 0).length;
  const totalSign    = monthTotal >= 0 ? '+' : '';

  return (
    <div className="card p-5 h-full">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {MONTH_NAMES[month - 1]} {year}
          </h3>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            {tradingDays} trading day{tradingDays !== 1 ? 's' : ''}
          </p>
        </div>
        <span className={monthTotal >= 0 ? 'badge-gain' : 'badge-loss'}>
          {totalSign}${Math.abs(Math.round(monthTotal)).toLocaleString('en-US')}
        </span>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dayNum = parseInt(day.date.slice(-2));
          return (
            <div
              key={day.date}
              title={day.trades > 0
                ? `${fmtPnl(day.pnl)} (${day.trades} trade${day.trades > 1 ? 's' : ''})`
                : 'No trades'}
              style={{
                background: dayBg(day),
                borderRadius: 8,
                aspectRatio: '1',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: 30, cursor: 'default',
                border: '1px solid transparent',
              }}
            >
              <span style={{ fontSize: 10, color: day.trades > 0 ? '#fff' : '#2d3748', fontWeight: 600 }}>
                {dayNum}
              </span>
              {day.trades > 0 && (
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>
                  {fmtPnl(day.pnl)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
