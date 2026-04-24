'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, ArrowUpRight, ArrowDownRight, ArrowUpDown, Download } from 'lucide-react';
import { useTrades } from '@/hooks/use-trades';
import { TradeDetailModal } from '@/components/trades/trade-detail-modal';
import { AddTradeModal } from '@/components/trades/add-trade-modal';
import { formatCurrency, formatPct, formatDateTime, formatDuration, formatLot } from '@/lib/formatters';
import { exportTradesToCSV } from '@/lib/trade-utils';
import type { TradeWithDetails } from '@/types';

type SortKey = 'date' | 'symbol' | 'pnl' | 'status';
type Filter  = 'all' | 'profit' | 'loss' | 'open';

export default function TradesPage() {
  const { trades, loading, addTrade, deleteTrade } = useTrades();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<Filter>('all');
  const [sort, setSort]       = useState<SortKey>('date');
  const [asc, setAsc]         = useState(false);
  const [selected, setSelected] = useState<TradeWithDetails | null>(null);
  const [adding, setAdding]   = useState(false);

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc(a => !a);
    else { setSort(key); setAsc(false); }
  }

  const filtered = useMemo(() => {
    let result = trades;
    if (search) { const q = search.toLowerCase(); result = result.filter(t => t.symbol.toLowerCase().includes(q)); }
    if (filter === 'profit') result = result.filter(t => (t.pnl ?? 0) > 0);
    if (filter === 'loss')   result = result.filter(t => (t.pnl ?? 0) < 0);
    if (filter === 'open')   result = result.filter(t => t.status === 'open');

    return [...result].sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0;
      if (sort === 'date')   { va = a.entry_time; vb = b.entry_time; }
      if (sort === 'symbol') { va = a.symbol; vb = b.symbol; }
      if (sort === 'pnl')    { va = a.pnl ?? -Infinity; vb = b.pnl ?? -Infinity; }
      if (sort === 'status') { va = a.status; vb = b.status; }
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
  }, [trades, search, filter, sort, asc]);

  const totalPnl = filtered.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const wins     = filtered.filter(t => (t.pnl ?? 0) > 0).length;
  const winRate  = filtered.length ? (wins / filtered.length) * 100 : 0;

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-white transition-colors">
      {label}
      <ArrowUpDown size={10} style={{ color: sort === k ? 'var(--violet)' : undefined }} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white">Trades</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>{trades.length} total trades</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost flex items-center gap-2" onClick={() => exportTradesToCSV(trades)} disabled={trades.length === 0}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => setAdding(true)}>
            <Plus size={15} /> Add Trade
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Filtered Trades', value: `${filtered.length}` },
          { label: 'Win Rate', value: filtered.length ? `${winRate.toFixed(1)}%` : '—' },
          { label: 'Total P&L', value: filtered.length ? formatCurrency(totalPnl) : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 flex items-center justify-between">
            <span className="text-[12px]" style={{ color: 'var(--muted)' }}>{label}</span>
            <span className="text-[15px] font-bold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input className="input-field pl-9" placeholder="Search symbol..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(['all', 'profit', 'loss', 'open'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-lg text-[12px] font-medium transition-all capitalize"
              style={filter === f ? { background: 'rgba(139,92,246,0.15)', color: 'var(--violet)' } : { color: 'var(--muted)' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading trades...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><SortBtn k="symbol" label="Symbol" /></th>
                <th>Direction</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Size</th>
                <th><SortBtn k="pnl" label="P&L" /></th>
                <th>P&L %</th>
                <th>Duration</th>
                <th><SortBtn k="date" label="Date" /></th>
                <th><SortBtn k="status" label="Status" /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 13 }}>
                    {trades.length === 0 ? 'No trades yet — click Add Trade to get started' : 'No trades match this filter'}
                  </td>
                </tr>
              )}
              {filtered.map(t => (
                <tr key={t.id} onClick={() => setSelected(t)} className="cursor-pointer">
                  <td className="font-semibold text-white">{t.symbol}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {t.direction === 'long'
                        ? <ArrowUpRight size={13} style={{ color: 'var(--gain)' }} />
                        : <ArrowDownRight size={13} style={{ color: 'var(--loss)' }} />}
                      <span className="capitalize text-[12px]" style={{ color: t.direction === 'long' ? 'var(--gain)' : 'var(--loss)' }}>
                        {t.direction}
                      </span>
                    </div>
                  </td>
                  <td className="font-mono text-[12px]" style={{ color: 'var(--muted)' }}>{t.entry_price}</td>
                  <td className="font-mono text-[12px]" style={{ color: 'var(--muted)' }}>{t.exit_price ?? '—'}</td>
                  <td className="text-[12px]" style={{ color: 'var(--muted)' }}>{formatLot(t.position_size)}</td>
                  <td>
                    {t.pnl !== null
                      ? <span className={t.pnl >= 0 ? 'badge-gain' : 'badge-loss'}>{formatCurrency(t.pnl)}</span>
                      : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                  <td className="text-[12px]" style={{ color: t.pnl_percent !== null && t.pnl_percent >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                    {t.pnl_percent !== null ? formatPct(t.pnl_percent) : '—'}
                  </td>
                  <td className="text-[12px]" style={{ color: 'var(--muted)' }}>{formatDuration(t.entry_time, t.exit_time)}</td>
                  <td className="text-[12px]" style={{ color: 'var(--muted)' }}>{formatDateTime(t.entry_time)}</td>
                  <td>
                    <span className={t.status === 'open' ? 'badge-violet' : 'badge-neutral'}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <TradeDetailModal
          trade={selected}
          onClose={() => setSelected(null)}
          onDelete={async () => { await deleteTrade(selected.id); setSelected(null); }}
        />
      )}}
      {adding   && <AddTradeModal onClose={() => setAdding(false)} onAdd={addTrade} />}
    </div>
  );
}
