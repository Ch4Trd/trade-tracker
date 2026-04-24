'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import type { TradeWithDetails } from '@/types';

interface AddTradeModalProps {
  onClose: () => void;
  onAdd:   (payload: Omit<TradeWithDetails, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: string | null }>;
}

type InputMode = 'position' | 'pnl';

const SYMBOLS = ['NQ1', 'ES1', 'EUR/USD', 'GBP/USD', 'XTI/USD'];

function calcPnl(symbol: string, direction: string, entry: number, exit: number, size: number): number {
  const diff = direction === 'long' ? exit - entry : entry - exit;
  if (symbol === 'NQ1') return diff * 20 * size;
  if (symbol === 'ES1') return diff * 50 * size;
  return diff * size * 100000;
}

export function AddTradeModal({ onClose, onAdd }: AddTradeModalProps) {
  const { propAccounts } = useAuth();
  const activeAccounts = propAccounts.filter(a => a.is_active);

  const [inputMode, setInputMode] = useState<InputMode>('position');
  const [form, setForm] = useState({
    symbol:              'NQ1',
    direction:           'long',
    entry_price:         '',
    exit_price:          '',
    position_size:       '',
    realized_pnl:        '',
    entry_time:          new Date().toISOString().slice(0, 16),
    exit_time:           '',
    prop_account_id:     activeAccounts[0]?.id ?? '',
    entry_reason:        '',
    exit_reason:         '',
    psychological_notes: '',
    confidence_level:    '3',
    structure_quality:   '3',
    confluence_count:    '2',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isFutures    = form.symbol === 'NQ1' || form.symbol === 'ES1';
  const accountSize  = activeAccounts.find(a => a.id === form.prop_account_id)?.account_size ?? 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    let pnl: number | null         = null;
    let pnl_percent: number | null = null;
    let entry_price                = 0;
    let exit_price: number | null  = null;
    let position_size              = 0;
    let status: 'open' | 'closed' | 'pending' = 'open';

    if (inputMode === 'position') {
      const entry = parseFloat(form.entry_price);
      const exit  = form.exit_price ? parseFloat(form.exit_price) : null;
      const size  = parseFloat(form.position_size);
      if (isNaN(entry) || isNaN(size)) { setError('Entry price and size are required.'); return; }

      entry_price   = entry;
      exit_price    = exit;
      position_size = size;

      if (exit !== null) {
        pnl         = parseFloat(calcPnl(form.symbol, form.direction, entry, exit, size).toFixed(2));
        pnl_percent = accountSize > 0 ? parseFloat(((pnl / accountSize) * 100).toFixed(2)) : null;
        status      = 'closed';
      }
    } else {
      const direct = parseFloat(form.realized_pnl);
      if (isNaN(direct)) { setError('Realized P&L is required.'); return; }
      pnl         = direct;
      pnl_percent = accountSize > 0 ? parseFloat(((direct / accountSize) * 100).toFixed(2)) : null;
      status      = 'closed';
    }

    const payload: Omit<TradeWithDetails, 'id' | 'user_id' | 'created_at'> & { prop_account_id?: string } = {
      symbol:         form.symbol,
      direction:      form.direction as 'long' | 'short',
      entry_price,
      exit_price,
      entry_time:     new Date(form.entry_time).toISOString(),
      exit_time:      form.exit_time ? new Date(form.exit_time).toISOString() : null,
      position_size,
      pnl,
      pnl_percent,
      status,
      prop_account_id: form.prop_account_id || undefined,
      details: {
        trade_id:            '',
        entry_reason:        form.entry_reason,
        exit_reason:         form.exit_reason,
        psychological_notes: form.psychological_notes,
        confidence_level:    parseInt(form.confidence_level),
        structure_quality:   parseInt(form.structure_quality),
        confluence_count:    parseInt(form.confluence_count),
        ai_feedback:         null,
      },
    };

    setLoading(true);
    const { error: err } = await onAdd(payload);
    setLoading(false);
    if (err) { setError(err); return; }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-[15px] font-semibold text-white">Add Trade</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto" style={{ maxHeight: '75vh' }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, gap: 2 }}>
            {(['position', 'pnl'] as InputMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setInputMode(m)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: inputMode === m ? 'rgba(139,92,246,0.2)' : 'transparent',
                  color: inputMode === m ? 'var(--violet)' : 'var(--muted)',
                }}
              >
                {m === 'position' ? 'By Contract / Lot' : 'By Realized P&L'}
              </button>
            ))}
          </div>

          {/* Prop account selector */}
          {activeAccounts.length > 1 && (
            <div>
              <label className="label">Prop Account</label>
              <select className="select-field" value={form.prop_account_id} onChange={e => set('prop_account_id', e.target.value)}>
                {activeAccounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.firm_name} — ${(a.account_size / 1000).toFixed(0)}K{a.account_number ? ` (${a.account_number})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Symbol + Direction */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Symbol</label>
              <select className="select-field" value={form.symbol} onChange={e => set('symbol', e.target.value)}>
                {SYMBOLS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Direction</label>
              <select className="select-field" value={form.direction} onChange={e => set('direction', e.target.value)}>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          {/* Position mode fields */}
          {inputMode === 'position' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Entry Price</label>
                  <input required className="input-field" type="number" step="any"
                    placeholder={form.symbol === 'NQ1' ? '21456' : form.symbol === 'ES1' ? '5234' : '1.0825'}
                    value={form.entry_price} onChange={e => set('entry_price', e.target.value)} />
                </div>
                <div>
                  <label className="label">Exit Price</label>
                  <input className="input-field" type="number" step="any"
                    placeholder={form.symbol === 'NQ1' ? '21471' : form.symbol === 'ES1' ? '5240' : '1.0981'}
                    value={form.exit_price} onChange={e => set('exit_price', e.target.value)} />
                </div>
                <div>
                  <label className="label">{isFutures ? 'Contracts' : 'Lot Size'}</label>
                  <input required className="input-field" type="number" step={isFutures ? '1' : '0.01'}
                    placeholder={isFutures ? '1' : '0.10'}
                    value={form.position_size} onChange={e => set('position_size', e.target.value)} />
                </div>
              </div>
              {isFutures && (
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  {form.symbol === 'NQ1' ? 'NQ1: $20/point per contract' : 'ES1: $50/point per contract'}
                </p>
              )}
            </>
          )}

          {/* P&L mode fields */}
          {inputMode === 'pnl' && (
            <div>
              <label className="label">Realized P&L ($)</label>
              <input
                required
                className="input-field"
                type="number"
                step="0.01"
                placeholder="e.g. 420.00 or -150.00"
                value={form.realized_pnl}
                onChange={e => set('realized_pnl', e.target.value)}
              />
              {accountSize > 0 && form.realized_pnl && !isNaN(parseFloat(form.realized_pnl)) && (
                <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>
                  = {((parseFloat(form.realized_pnl) / accountSize) * 100).toFixed(2)}% of account
                </p>
              )}
            </div>
          )}

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Entry Time</label>
              <input className="input-field" type="datetime-local" value={form.entry_time} onChange={e => set('entry_time', e.target.value)} />
            </div>
            <div>
              <label className="label">Exit Time</label>
              <input className="input-field" type="datetime-local" value={form.exit_time} onChange={e => set('exit_time', e.target.value)} />
            </div>
          </div>

          <hr className="divider" />

          {/* Ratings */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'confidence_level', label: 'Confidence (1-5)' },
              { key: 'structure_quality', label: 'Structure (1-5)' },
              { key: 'confluence_count', label: 'Confluence #' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input-field" type="number" min="1" max="5"
                  value={(form as Record<string, string>)[key]}
                  onChange={e => set(key, e.target.value)} />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Entry Reason</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Why did you enter?"
              value={form.entry_reason} onChange={e => set('entry_reason', e.target.value)} />
          </div>
          <div>
            <label className="label">Exit Reason</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Why did you exit?"
              value={form.exit_reason} onChange={e => set('exit_reason', e.target.value)} />
          </div>
          <div>
            <label className="label">Psychology</label>
            <textarea className="input-field resize-none" rows={2} placeholder="Emotional state, discipline notes..."
              value={form.psychological_notes} onChange={e => set('psychological_notes', e.target.value)} />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#ef4444' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Add Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
