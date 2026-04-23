'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, ReferenceLine } from 'recharts';
import { useTrades } from '@/hooks/use-trades';
import { useAuth } from '@/contexts/auth';
import { buildDashboardStats, buildSymbolStats, buildDrawdownSeries } from '@/lib/trade-utils';
import { formatCurrency } from '@/lib/formatters';

function WinLossTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-[12px]" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="font-semibold text-white mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: 'var(--muted)' }}>{p.name}</span>
          <span style={{ color: p.name === 'Wins' ? 'var(--gain)' : 'var(--loss)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function DrawdownTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-[12px]" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="font-semibold" style={{ color: 'var(--loss)' }}>{payload[0].value.toFixed(2)}%</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { propAccounts } = useAuth();
  const { trades, loading } = useTrades();

  const startBalance  = useMemo(() => propAccounts.find(a => a.is_active)?.account_size ?? 0, [propAccounts]);
  const stats         = useMemo(() => buildDashboardStats(trades, startBalance), [trades, startBalance]);
  const symbolStats   = useMemo(() => buildSymbolStats(trades), [trades]);
  const drawdownData  = useMemo(() => buildDrawdownSeries(trades, startBalance), [trades, startBalance]);

  const bestSymbol  = symbolStats[0];
  const worstSymbol = [...symbolStats].sort((a, b) => a.total_pnl - b.total_pnl)[0];
  const hasTrades   = trades.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-white">Analytics</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>Performance breakdown and risk analysis</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Profit Factor', value: hasTrades ? stats.profit_factor.toFixed(2) : '—', positive: stats.profit_factor > 1 },
          { label: 'Max Drawdown',  value: hasTrades ? `${stats.max_drawdown.toFixed(2)}%` : '—', negative: hasTrades },
          { label: 'Total Trades',  value: stats.total_trades.toString() },
          { label: 'Win Rate',      value: hasTrades ? `${stats.win_rate.toFixed(1)}%` : '—', positive: stats.win_rate > 50 },
        ].map(({ label, value, positive, negative }) => (
          <div key={label} className="card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{label}</div>
            <div className="text-[22px] font-bold" style={{ color: positive ? 'var(--gain)' : negative ? 'var(--loss)' : 'white' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading analytics...</div>
      ) : !hasTrades ? (
        <div className="card p-10" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Add your first trade to see performance charts and analytics.
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-[13px] font-semibold text-white mb-4">Performance by Symbol</h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symbolStats} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="symbol" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<WinLossTooltip />} />
                    <Bar dataKey="wins"   name="Wins"   fill="var(--gain)" radius={[3,3,0,0]} />
                    <Bar dataKey="losses" name="Losses" fill="var(--loss)" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-[13px] font-semibold text-white mb-4">Drawdown Analysis</h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={drawdownData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v.toFixed(0)}%`} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                    <Tooltip content={<DrawdownTooltip />} />
                    <Area type="monotone" dataKey="drawdown" stroke="var(--loss)" strokeWidth={1.5} fill="url(#ddGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Symbol table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--card-border)' }}>
              <h3 className="text-[13px] font-semibold text-white">Symbol Breakdown</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th><th>Trades</th><th>Wins</th><th>Losses</th>
                  <th>Win Rate</th><th>Total P&L</th><th>Avg P&L</th>
                </tr>
              </thead>
              <tbody>
                {symbolStats.map(s => (
                  <tr key={s.symbol}>
                    <td className="font-semibold text-white">{s.symbol}</td>
                    <td style={{ color: 'var(--muted)' }}>{s.trades}</td>
                    <td style={{ color: 'var(--gain)' }}>{s.wins}</td>
                    <td style={{ color: 'var(--loss)' }}>{s.losses}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ width: 60, background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${(s.wins/s.trades)*100}%`, background: 'var(--gain)' }} />
                        </div>
                        <span className="text-[12px]" style={{ color: 'var(--gain)' }}>{((s.wins/s.trades)*100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td><span className={s.total_pnl >= 0 ? 'badge-gain' : 'badge-loss'}>{formatCurrency(s.total_pnl)}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{formatCurrency(s.total_pnl / s.trades)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--violet)' }}>Best Performing Symbol</div>
              <div className="text-[20px] font-bold text-white">{bestSymbol?.symbol ?? '—'}</div>
              <div className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
                {bestSymbol ? `${formatCurrency(bestSymbol.total_pnl)} across ${bestSymbol.trades} trades` : 'No data yet'}
              </div>
            </div>
            <div className="card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Needs Improvement</div>
              <div className="text-[20px] font-bold text-white">{worstSymbol?.symbol ?? '—'}</div>
              <div className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
                {worstSymbol ? `${formatCurrency(worstSymbol.total_pnl)} — review your approach` : 'No data yet'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
