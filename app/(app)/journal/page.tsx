'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import { useTrades } from '@/hooks/use-trades';
import { buildMonthPnl } from '@/lib/trade-utils';
import { formatCurrency } from '@/lib/formatters';
import type { TradeWithDetails, DayPnl } from '@/types';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function NotePanel({ date, trades, note, onSave, onClose }: {
  date: string; trades: TradeWithDetails[]; note: string;
  onSave: (n: string) => void; onClose: () => void;
}) {
  const [text, setText] = useState(note);
  const dayTrades = trades.filter(t => (t.exit_time ?? t.entry_time).startsWith(date));
  const dayPnl    = dayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div>
          <div className="text-[14px] font-semibold text-white">
            {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          {dayTrades.length > 0 && (
            <div className="text-[12px] mt-0.5" style={{ color: dayPnl >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
              {dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''} — {formatCurrency(dayPnl)}
            </div>
          )}
        </div>
        <button className="btn-icon" onClick={onClose}><X size={15} /></button>
      </div>

      {dayTrades.length > 0 && (
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Trades</div>
          <div className="space-y-1.5">
            {dayTrades.map(t => (
              <div key={t.id} className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-white">{t.symbol}</span>
                <span className="capitalize" style={{ color: 'var(--muted)' }}>{t.direction}</span>
                <span className={t.pnl !== null && t.pnl >= 0 ? 'badge-gain' : 'badge-loss'}>
                  {t.pnl !== null ? formatCurrency(t.pnl) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col p-5">
        <div className="label mb-2">Daily Notes</div>
        <textarea className="input-field flex-1 resize-none" placeholder="Reflections, lessons learned, market observations..."
          value={text} onChange={e => setText(e.target.value)} style={{ minHeight: 120 }} />
        <button className="btn-primary mt-3 flex items-center justify-center gap-2" onClick={() => { onSave(text); onClose(); }}>
          <Save size={14} /> Save Note
        </button>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const { trades } = useTrades();
  const now   = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const monthPnl = useMemo(() => buildMonthPnl(trades, year, month), [trades, year, month]);
  const pnlMap   = useMemo(() => new Map<string, DayPnl>(monthPnl.map(d => [d.date, d])), [monthPnl]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay    = new Date(year, month - 1, 1).getDay();

  function prev() { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDate(null); }
  function next() { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDate(null); }

  const cells: string[] = Array(firstDay).fill('');
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
  }

  function dayColor(date: string): string {
    const d = pnlMap.get(date);
    if (!d || d.trades === 0) return 'rgba(255,255,255,0.03)';
    return d.pnl > 0 ? 'rgba(34,197,94,0.55)' : 'rgba(239,68,68,0.55)';
  }

  const todayStr = now.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-white">Journal</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>Daily trading notes and trade log</p>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: selectedDate ? '1fr 360px' : '1fr' }}>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-semibold text-white">{MONTHS[month - 1]} {year}</h2>
            <div className="flex items-center gap-1">
              <button className="btn-icon" onClick={prev}><ChevronLeft size={16} /></button>
              <button className="btn-icon" onClick={next}><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase" style={{ color: 'var(--muted)' }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((date, i) => {
              if (!date) return <div key={`e-${i}`} />;
              const dayNum    = parseInt(date.slice(-2));
              const d         = pnlMap.get(date);
              const isSelected = date === selectedDate;
              const isToday   = date === todayStr;
              const hasNote   = !!notes[date];

              return (
                <button key={date} onClick={() => setSelectedDate(isSelected ? null : date)}
                  className="rounded-xl flex flex-col items-center justify-center transition-all relative"
                  style={{
                    background: isSelected ? 'var(--violet)' : dayColor(date),
                    border: isSelected ? '1px solid var(--violet)' : isToday ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
                    aspectRatio: '1', minHeight: 52, cursor: 'pointer',
                  }}
                >
                  <span className="text-[13px] font-semibold" style={{ color: isSelected ? '#fff' : '#ddd' }}>{dayNum}</span>
                  {d && d.trades > 0 && (
                    <span className="text-[9px]" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.6)' }}>
                      {d.pnl >= 0 ? '+' : ''}{Math.round(d.pnl)}
                    </span>
                  )}
                  {hasNote && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? '#fff' : 'var(--violet)' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <NotePanel date={selectedDate} trades={trades}
            note={notes[selectedDate] ?? ''}
            onSave={text => setNotes(prev => ({ ...prev, [selectedDate]: text }))}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>

      {Object.keys(notes).length > 0 && (
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-white mb-4">Saved Notes</h3>
          <div className="space-y-3">
            {Object.entries(notes).filter(([, v]) => v.trim()).sort(([a], [b]) => b.localeCompare(a)).map(([date, text]) => (
              <div key={date} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--violet)' }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#bbb' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
