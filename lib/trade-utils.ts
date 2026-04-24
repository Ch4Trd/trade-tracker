import type { TradeWithDetails, EquityPoint, DayPnl, SymbolStats, DashboardStats } from '@/types';

export function exportTradesToCSV(trades: TradeWithDetails[]) {
  const headers = ['Date', 'Symbol', 'Direction', 'Entry Price', 'Exit Price', 'Size', 'P&L ($)', 'P&L (%)', 'Status', 'Duration', 'Entry Reason', 'Exit Reason', 'Psychology', 'Confidence', 'Structure', 'Confluence'];
  const rows = trades.map(t => {
    let duration = '';
    if (t.entry_time && t.exit_time) {
      const ms = new Date(t.exit_time).getTime() - new Date(t.entry_time).getTime();
      const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
      duration = h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
    return [
      new Date(t.entry_time).toLocaleDateString('en-CA'),
      t.symbol,
      t.direction,
      t.entry_price,
      t.exit_price ?? '',
      t.position_size,
      t.pnl ?? '',
      t.pnl_percent ?? '',
      t.status,
      duration,
      t.details?.entry_reason ?? '',
      t.details?.exit_reason ?? '',
      t.details?.psychological_notes ?? '',
      t.details?.confidence_level ?? '',
      t.details?.structure_quality ?? '',
      t.details?.confluence_count ?? '',
    ];
  });

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildDashboardStats(trades: TradeWithDetails[], startBalance: number): DashboardStats {
  const closed = trades.filter(t => t.status === 'closed' && t.pnl !== null);
  const wins   = closed.filter(t => (t.pnl ?? 0) > 0);
  const losses = closed.filter(t => (t.pnl ?? 0) < 0);

  const ytd_pnl    = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const balance    = startBalance + ytd_pnl;
  const ytd_pct    = startBalance > 0 ? (ytd_pnl / startBalance) * 100 : 0;
  const win_rate   = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const totalWins  = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const totalLoss  = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const profit_factor = totalLoss > 0 ? parseFloat((totalWins / totalLoss).toFixed(2)) : totalWins > 0 ? 99.99 : 0;

  const pnls    = closed.map(t => t.pnl ?? 0);
  const avg     = pnls.length > 0 ? pnls.reduce((s, v) => s + v, 0) / pnls.length : 0;
  const variance = pnls.length > 1 ? pnls.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / pnls.length : 1;
  const std     = Math.sqrt(variance);
  const sharpe  = std > 0 ? parseFloat((avg / std * Math.sqrt(252)).toFixed(2)) : 0;

  const curve = buildEquityCurve(trades, startBalance);
  let peak = startBalance;
  let max_drawdown = 0;
  for (const p of curve) {
    if (p.equity > peak) peak = p.equity;
    const dd = peak > 0 ? ((peak - p.equity) / peak) * 100 : 0;
    if (dd > max_drawdown) max_drawdown = dd;
  }

  return {
    balance,
    starting_balance: startBalance,
    ytd_pnl,
    ytd_pnl_pct: ytd_pct,
    win_rate,
    sharpe_ratio: sharpe,
    total_trades: closed.length,
    profit_factor,
    max_drawdown: parseFloat(max_drawdown.toFixed(2)),
  };
}

export function buildEquityCurve(trades: TradeWithDetails[], startBalance: number): EquityPoint[] {
  const closed = trades
    .filter(t => t.status === 'closed' && t.pnl !== null && t.exit_time)
    .sort((a, b) => new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime());

  if (closed.length === 0) {
    return [{ date: new Date().toISOString().slice(0, 10), equity: startBalance, pnl: 0 }];
  }

  let equity = startBalance;
  return closed.map(t => {
    equity += t.pnl ?? 0;
    return { date: t.exit_time!.slice(0, 10), equity: parseFloat(equity.toFixed(2)), pnl: t.pnl ?? 0 };
  });
}

export function buildMonthPnl(trades: TradeWithDetails[], year: number, month: number): DayPnl[] {
  const map = new Map<string, DayPnl>();
  for (const t of trades) {
    if (!t.pnl || t.status !== 'closed') continue;
    const dateStr = (t.exit_time ?? t.entry_time).slice(0, 10);
    const [y, m] = dateStr.split('-').map(Number);
    if (y !== year || m !== month) continue;
    const prev = map.get(dateStr) ?? { date: dateStr, pnl: 0, trades: 0 };
    map.set(dateStr, { date: dateStr, pnl: prev.pnl + t.pnl, trades: prev.trades + 1 });
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildSymbolStats(trades: TradeWithDetails[]): SymbolStats[] {
  const map = new Map<string, SymbolStats>();
  for (const t of trades) {
    if (t.pnl === null || t.status !== 'closed') continue;
    const s = map.get(t.symbol) ?? { symbol: t.symbol, wins: 0, losses: 0, total_pnl: 0, trades: 0 };
    if (t.pnl > 0) s.wins++; else s.losses++;
    s.total_pnl += t.pnl;
    s.trades++;
    map.set(t.symbol, s);
  }
  return Array.from(map.values()).sort((a, b) => b.total_pnl - a.total_pnl);
}

export function buildDrawdownSeries(trades: TradeWithDetails[], startBalance: number) {
  const curve = buildEquityCurve(trades, startBalance);
  let peak = startBalance;
  return curve.map(p => {
    if (p.equity > peak) peak = p.equity;
    const dd = peak > 0 ? ((peak - p.equity) / peak) * 100 : 0;
    return {
      date: new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      drawdown: parseFloat((-dd).toFixed(2)),
    };
  });
}
