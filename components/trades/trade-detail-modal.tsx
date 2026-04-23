'use client';

import { X, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import type { TradeWithDetails } from '@/types';
import { formatCurrency, formatPct, formatDateTime, formatDuration, formatLot } from '@/lib/formatters';

interface TradeDetailModalProps {
  trade: TradeWithDetails;
  onClose: () => void;
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < value ? 'var(--cyan)' : 'none'}
          strokeWidth={1.5}
          style={{ color: i < value ? 'var(--cyan)' : '#333' }}
        />
      ))}
    </div>
  );
}

export function TradeDetailModal({ trade, onClose }: TradeDetailModalProps) {
  const win = trade.pnl !== null && trade.pnl > 0;
  const d = trade.details;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel w-full max-w-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="text-[18px] font-bold text-white">{trade.symbol}</div>
            <div className="flex items-center gap-1.5">
              {trade.direction === 'long'
                ? <ArrowUpRight size={15} style={{ color: 'var(--gain)' }} />
                : <ArrowDownRight size={15} style={{ color: 'var(--loss)' }} />}
              <span className="capitalize text-[13px] font-medium"
                    style={{ color: trade.direction === 'long' ? 'var(--gain)' : 'var(--loss)' }}>
                {trade.direction}
              </span>
            </div>
            <span className={win ? 'badge-gain' : 'badge-loss'}>
              {trade.pnl !== null ? formatCurrency(trade.pnl) : '—'}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Entry Price', value: String(trade.entry_price) },
              { label: 'Exit Price', value: trade.exit_price ? String(trade.exit_price) : '—' },
              { label: 'Position Size', value: formatLot(trade.position_size) },
              { label: 'P&L', value: trade.pnl !== null ? formatCurrency(trade.pnl) : '—' },
              { label: 'P&L %', value: trade.pnl_percent !== null ? formatPct(trade.pnl_percent) : '—' },
              { label: 'Duration', value: formatDuration(trade.entry_time, trade.exit_time) },
            ].map(({ label, value }) => (
              <div key={label} className="card p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>
                  {label}
                </div>
                <div className="text-[13px] font-semibold text-white font-mono">{value}</div>
              </div>
            ))}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="label">Entry Time</div>
              <div className="text-[13px] text-white">{formatDateTime(trade.entry_time)}</div>
            </div>
            <div>
              <div className="label">Exit Time</div>
              <div className="text-[13px] text-white">{trade.exit_time ? formatDateTime(trade.exit_time) : '—'}</div>
            </div>
          </div>

          {d && (
            <>
              <hr className="divider" />

              {/* Ratings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="label mb-2">Confidence</div>
                  <Stars value={d.confidence_level} />
                  <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>{d.confidence_level}/5</div>
                </div>
                <div>
                  <div className="label mb-2">Structure Quality</div>
                  <Stars value={d.structure_quality} />
                  <div className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>{d.structure_quality}/5</div>
                </div>
                <div>
                  <div className="label mb-2">Confluence</div>
                  <div className="text-[22px] font-bold" style={{ color: 'var(--cyan)' }}>{d.confluence_count}</div>
                  <div className="text-[11px]" style={{ color: 'var(--muted)' }}>factors</div>
                </div>
              </div>

              <hr className="divider" />

              {/* Notes */}
              <div>
                <div className="label">Entry Reason</div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#bbb' }}>{d.entry_reason}</p>
              </div>
              <div>
                <div className="label">Exit Reason</div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#bbb' }}>{d.exit_reason}</p>
              </div>
              <div>
                <div className="label">Psychological Notes</div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#bbb' }}>{d.psychological_notes}</p>
              </div>

              {d.ai_feedback && (
                <div className="card-cyan p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--cyan)' }}>
                    AI Analysis
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#bbb' }}>{d.ai_feedback}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
