import Link from 'next/link';
import type { TradeWithDetails } from '@/types';
import { formatCurrency, formatPct, formatDateTime } from '@/lib/formatters';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RecentTradesProps {
  trades: TradeWithDetails[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
  const recent = trades.slice(0, 10);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <h3 className="text-[13px] font-semibold text-white">Recent Trades</h3>
        <Link href="/trades" className="text-[12px] font-medium" style={{ color: 'var(--cyan)' }}>
          View all
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Direction</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>P&amp;L</th>
            <th>P&amp;L %</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {recent.map(t => (
            <tr key={t.id}>
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
              <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: 12 }}>{t.entry_price}</td>
              <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: 12 }}>{t.exit_price ?? '—'}</td>
              <td>
                <span className={t.pnl! >= 0 ? 'badge-gain' : 'badge-loss'}>
                  {formatCurrency(t.pnl!)}
                </span>
              </td>
              <td style={{ color: t.pnl_percent! >= 0 ? 'var(--gain)' : 'var(--loss)', fontSize: 12 }}>
                {formatPct(t.pnl_percent!)}
              </td>
              <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                {t.exit_time ? formatDateTime(t.exit_time) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
