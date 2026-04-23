'use client';

import { useMemo } from 'react';
import { Wallet, TrendingUp, Target, Activity } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { EquityCurve } from '@/components/dashboard/equity-curve';
import { MonthlyHeatmap } from '@/components/dashboard/monthly-heatmap';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { PriceTicker } from '@/components/dashboard/price-ticker';
import { useAuth } from '@/contexts/auth';
import { useTrades } from '@/hooks/use-trades';
import { buildDashboardStats, buildEquityCurve, buildMonthPnl } from '@/lib/trade-utils';
import { formatBalance, formatCurrency, formatPct } from '@/lib/formatters';

export default function DashboardPage() {
  const { propAccounts } = useAuth();
  const { trades, loading } = useTrades();

  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  const startBalance = useMemo(() => {
    const active = propAccounts.find(a => a.is_active);
    return active?.account_size ?? 0;
  }, [propAccounts]);

  const stats    = useMemo(() => buildDashboardStats(trades, startBalance), [trades, startBalance]);
  const curve    = useMemo(() => buildEquityCurve(trades, startBalance), [trades, startBalance]);
  const monthPnl = useMemo(() => buildMonthPnl(trades, year, month), [trades, year, month]);

  const recent = useMemo(() =>
    [...trades].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10),
    [trades]
  );

  const hasTrades = trades.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--violet)', marginBottom: 4 }}>
            Trading Journal Pro
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 5 }}>
            {now.getFullYear()} — NQ1 / ES1 / Forex
          </p>
        </div>
        <div style={{ height: 3, width: 120, borderRadius: 2, background: 'linear-gradient(90deg, var(--violet) 0%, rgba(168,85,247,0) 100%)', marginBottom: 8 }} />
      </div>

      {/* Live prices */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-v)', borderRadius: 16, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--violet-dark), var(--violet), rgba(168,85,247,0))' }} />
        <PriceTicker />
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '16px 16px 0 0', background: 'linear-gradient(90deg, #7c3aed, #a855f7)' }} />
          <MetricCard
            label="Account Balance"
            value={startBalance > 0 ? formatBalance(stats.balance) : '—'}
            sub={startBalance > 0 ? `Started at ${formatBalance(startBalance)}` : 'Set up a prop account in Settings'}
            icon={Wallet}
            gradient
          />
        </div>
        <MetricCard
          label="YTD P&L"
          value={hasTrades ? formatCurrency(stats.ytd_pnl) : '—'}
          sub={hasTrades ? formatPct(stats.ytd_pnl_pct) : 'No trades yet'}
          positive={stats.ytd_pnl > 0}
          negative={stats.ytd_pnl < 0}
          icon={TrendingUp}
        />
        <MetricCard
          label="Win Rate"
          value={hasTrades ? `${stats.win_rate.toFixed(1)}%` : '—'}
          sub={hasTrades ? `${stats.total_trades} closed trades` : 'No trades yet'}
          icon={Target}
          positive={hasTrades}
        />
        <MetricCard
          label="Profit Factor"
          value={hasTrades ? stats.profit_factor.toFixed(2) : '—'}
          sub={hasTrades ? `Sharpe ${stats.sharpe_ratio.toFixed(2)}` : 'No trades yet'}
          icon={Activity}
          positive={stats.profit_factor > 1}
        />
      </div>

      {/* Charts */}
      {loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Loading...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '16px 16px 0 0', zIndex: 1, background: 'linear-gradient(90deg, #7c3aed, rgba(168,85,247,0.3), transparent)' }} />
            <EquityCurve data={curve} />
          </div>
          <MonthlyHeatmap data={monthPnl} year={year} month={month} />
        </div>
      )}

      {/* Mini stats */}
      {hasTrades && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Profit Factor', value: stats.profit_factor.toFixed(2), color: 'var(--gain)' },
            { label: 'Max Drawdown',  value: `${stats.max_drawdown.toFixed(2)}%`, color: 'var(--loss)' },
            { label: 'Total Trades',  value: stats.total_trades.toString(), color: 'var(--violet)' },
            { label: 'Sharpe Ratio',  value: stats.sharpe_ratio.toFixed(2), color: stats.sharpe_ratio > 1 ? 'var(--gain)' : 'var(--muted)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: '0 3px 3px 0', background: color }} />
              <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent trades */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '16px 16px 0 0', background: 'linear-gradient(90deg, rgba(139,92,246,0.6), rgba(168,85,247,0.2), transparent)' }} />
        <RecentTrades trades={recent} />
      </div>
    </div>
  );
}
