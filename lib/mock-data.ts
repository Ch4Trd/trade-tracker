import type { TradeWithDetails, EquityPoint, DayPnl, DashboardStats, RiskRules } from '@/types';

export const MOCK_TRADES: TradeWithDetails[] = [
  {
    id: 'trade-001', user_id: 'user-001',
    symbol: 'NQ1', direction: 'long',
    entry_price: 21456, exit_price: 21471,
    entry_time: '2026-02-15T09:32:00Z', exit_time: '2026-02-15T11:45:00Z',
    position_size: 1, pnl: 300, pnl_percent: 3.00, status: 'closed',
    created_at: '2026-02-15T09:32:00Z',
    details: {
      trade_id: 'trade-001',
      entry_reason: 'Break of structure above 21450 confluence zone, bullish impulse on 5m with strong volume',
      exit_reason: 'Target at previous session high 21472, took 15 pts at 1:2 RR',
      psychological_notes: 'Patient entry, waited for retest before executing',
      confidence_level: 4, structure_quality: 4, confluence_count: 3, ai_feedback: null,
    },
  },
  {
    id: 'trade-002', user_id: 'user-001',
    symbol: 'GBP/USD', direction: 'short',
    entry_price: 1.2956, exit_price: 1.3020,
    entry_time: '2026-02-18T13:10:00Z', exit_time: '2026-02-18T17:45:00Z',
    position_size: 0.10, pnl: -128, pnl_percent: -1.28, status: 'closed',
    created_at: '2026-02-18T13:10:00Z',
    details: {
      trade_id: 'trade-002',
      entry_reason: 'Distribution at HTF resistance, bearish order block rejection on H4',
      exit_reason: 'Stop loss hit, price reversed with unexpected bullish momentum',
      psychological_notes: 'Entered too early, did not wait for full rejection confirmation',
      confidence_level: 3, structure_quality: 3, confluence_count: 2, ai_feedback: null,
    },
  },
  {
    id: 'trade-003', user_id: 'user-001',
    symbol: 'ES1', direction: 'long',
    entry_price: 5234, exit_price: 5240,
    entry_time: '2026-02-22T14:30:00Z', exit_time: '2026-02-22T16:00:00Z',
    position_size: 1, pnl: 300, pnl_percent: 3.00, status: 'closed',
    created_at: '2026-02-22T14:30:00Z',
    details: {
      trade_id: 'trade-003',
      entry_reason: 'Bullish FVG at key support 5230-5235, post-FOMC momentum continuation',
      exit_reason: '1:2 RR target hit, strong resistance overhead at 5245',
      psychological_notes: 'Clean setup, no emotional interference, executed plan perfectly',
      confidence_level: 5, structure_quality: 4, confluence_count: 4, ai_feedback: null,
    },
  },
  {
    id: 'trade-004', user_id: 'user-001',
    symbol: 'XTI/USD', direction: 'long',
    entry_price: 72.35, exit_price: 74.87,
    entry_time: '2026-03-01T08:45:00Z', exit_time: '2026-03-02T14:20:00Z',
    position_size: 0.20, pnl: 504, pnl_percent: 5.04, status: 'closed',
    created_at: '2026-03-01T08:45:00Z',
    details: {
      trade_id: 'trade-004',
      entry_reason: 'WTI accumulation zone, OPEC+ production cut news catalyst, bullish weekly structure',
      exit_reason: 'Extended take profit to 1:3.5 RR as momentum was strong',
      psychological_notes: 'Best trade of the month, let winners run according to plan',
      confidence_level: 5, structure_quality: 5, confluence_count: 4, ai_feedback: null,
    },
  },
  {
    id: 'trade-005', user_id: 'user-001',
    symbol: 'NQ1', direction: 'short',
    entry_price: 21892, exit_price: 21942,
    entry_time: '2026-03-05T11:00:00Z', exit_time: '2026-03-05T13:30:00Z',
    position_size: 1, pnl: -1000, pnl_percent: -1.50, status: 'closed',
    created_at: '2026-03-05T11:00:00Z',
    details: {
      trade_id: 'trade-005',
      entry_reason: 'Overextended rally, SMT divergence with ES, premium zone rejection on 15m',
      exit_reason: 'Stop hit, tech earnings surprise pushed NQ higher aggressively',
      psychological_notes: 'News event risk was known but underestimated the impact',
      confidence_level: 3, structure_quality: 3, confluence_count: 2, ai_feedback: null,
    },
  },
  {
    id: 'trade-006', user_id: 'user-001',
    symbol: 'EUR/USD', direction: 'long',
    entry_price: 1.0744, exit_price: 1.0843,
    entry_time: '2026-03-10T07:15:00Z', exit_time: '2026-03-10T16:00:00Z',
    position_size: 0.10, pnl: 198, pnl_percent: 1.98, status: 'closed',
    created_at: '2026-03-10T07:15:00Z',
    details: {
      trade_id: 'trade-006',
      entry_reason: 'London open breakout, clean FVG fill at 1.0740 with rejection wick on M15',
      exit_reason: 'Closed at New York open when momentum stalled at previous resistance',
      psychological_notes: 'Good discipline, did not overstay welcome in the position',
      confidence_level: 4, structure_quality: 4, confluence_count: 3, ai_feedback: null,
    },
  },
  {
    id: 'trade-007', user_id: 'user-001',
    symbol: 'ES1', direction: 'long',
    entry_price: 5318, exit_price: 5325,
    entry_time: '2026-03-15T14:30:00Z', exit_time: '2026-03-15T16:00:00Z',
    position_size: 1, pnl: 350, pnl_percent: 3.50, status: 'closed',
    created_at: '2026-03-15T14:30:00Z',
    details: {
      trade_id: 'trade-007',
      entry_reason: 'Weekly support held, buying pressure confirmed, NY session continuation play',
      exit_reason: 'Target at previous swing high, closed before end of session',
      psychological_notes: 'Managed risk well, scaled out at 1:2 then held remainder to target',
      confidence_level: 4, structure_quality: 5, confluence_count: 4, ai_feedback: null,
    },
  },
  {
    id: 'trade-008', user_id: 'user-001',
    symbol: 'NQ1', direction: 'short',
    entry_price: 22145, exit_price: 22195,
    entry_time: '2026-03-19T09:00:00Z', exit_time: '2026-03-19T10:15:00Z',
    position_size: 1, pnl: -1000, pnl_percent: -1.34, status: 'closed',
    created_at: '2026-03-19T09:00:00Z',
    details: {
      trade_id: 'trade-008',
      entry_reason: 'Distribution pattern at 22150 resistance, failed to break with volume divergence',
      exit_reason: 'Stop hit, Fed speakers pushed tech sector higher',
      psychological_notes: 'Fundamentals worked against position, accepted loss cleanly',
      confidence_level: 3, structure_quality: 3, confluence_count: 2, ai_feedback: null,
    },
  },
  {
    id: 'trade-009', user_id: 'user-001',
    symbol: 'EUR/USD', direction: 'short',
    entry_price: 1.0895, exit_price: 1.0739,
    entry_time: '2026-03-25T10:00:00Z', exit_time: '2026-03-26T09:30:00Z',
    position_size: 0.10, pnl: 156, pnl_percent: 1.56, status: 'closed',
    created_at: '2026-03-25T10:00:00Z',
    details: {
      trade_id: 'trade-009',
      entry_reason: 'Monthly resistance rejection, bearish daily close below 1.0900',
      exit_reason: 'Target hit at daily demand zone around 1.0740',
      psychological_notes: 'Held overnight with confidence in structure, no tampering',
      confidence_level: 4, structure_quality: 4, confluence_count: 3, ai_feedback: null,
    },
  },
  {
    id: 'trade-010', user_id: 'user-001',
    symbol: 'XTI/USD', direction: 'short',
    entry_price: 78.90, exit_price: 79.38,
    entry_time: '2026-03-28T15:00:00Z', exit_time: '2026-03-28T17:20:00Z',
    position_size: 0.10, pnl: -96, pnl_percent: -0.96, status: 'closed',
    created_at: '2026-03-28T15:00:00Z',
    details: {
      trade_id: 'trade-010',
      entry_reason: 'Overextended rally, bearish divergence on RSI, premium zone rejection',
      exit_reason: 'Stop hit, geopolitical news pushed crude higher sharply',
      psychological_notes: 'Countertrend setup, should have waited for clearer reversal signal',
      confidence_level: 2, structure_quality: 2, confluence_count: 1, ai_feedback: null,
    },
  },
  {
    id: 'trade-011', user_id: 'user-001',
    symbol: 'NQ1', direction: 'long',
    entry_price: 21345, exit_price: 21404,
    entry_time: '2026-04-02T08:00:00Z', exit_time: '2026-04-02T12:30:00Z',
    position_size: 2, pnl: 2360, pnl_percent: 3.89, status: 'closed',
    created_at: '2026-04-02T08:00:00Z',
    details: {
      trade_id: 'trade-011',
      entry_reason: 'NQ sweep of lows at HTF demand 21340, institutional buying confirmed on tape',
      exit_reason: 'Extended to 1:3.5 RR, closed into strong overnight resistance',
      psychological_notes: 'Trusted the setup and let it play out, no early exit temptation',
      confidence_level: 5, structure_quality: 5, confluence_count: 5, ai_feedback: null,
    },
  },
  {
    id: 'trade-012', user_id: 'user-001',
    symbol: 'EUR/USD', direction: 'long',
    entry_price: 1.0812, exit_price: 1.1035,
    entry_time: '2026-04-08T07:30:00Z', exit_time: '2026-04-09T12:00:00Z',
    position_size: 0.10, pnl: 223, pnl_percent: 2.23, status: 'closed',
    created_at: '2026-04-08T07:30:00Z',
    details: {
      trade_id: 'trade-012',
      entry_reason: 'EUR accumulation after CPI data, London breakout with institutional flow',
      exit_reason: 'Closed at previous month high, momentum slowing',
      psychological_notes: 'Used news as confirmation not prediction — good process',
      confidence_level: 4, structure_quality: 4, confluence_count: 3, ai_feedback: null,
    },
  },
  {
    id: 'trade-013', user_id: 'user-001',
    symbol: 'GBP/USD', direction: 'short',
    entry_price: 1.3198, exit_price: 1.2886,
    entry_time: '2026-04-12T13:15:00Z', exit_time: '2026-04-14T09:00:00Z',
    position_size: 0.10, pnl: 312, pnl_percent: 3.12, status: 'closed',
    created_at: '2026-04-12T13:15:00Z',
    details: {
      trade_id: 'trade-013',
      entry_reason: 'HTF distribution at weekly supply zone, bearish order flow alignment confirmed',
      exit_reason: 'Target at 1.2880 weekly demand zone, 1:3.2 RR achieved',
      psychological_notes: 'Best forex setup of April, thesis played out with minimal drawdown',
      confidence_level: 5, structure_quality: 5, confluence_count: 4, ai_feedback: null,
    },
  },
  {
    id: 'trade-014', user_id: 'user-001',
    symbol: 'ES1', direction: 'long',
    entry_price: 5412, exit_price: 5409,
    entry_time: '2026-04-16T09:00:00Z', exit_time: '2026-04-16T10:30:00Z',
    position_size: 1, pnl: -150, pnl_percent: -1.45, status: 'closed',
    created_at: '2026-04-16T09:00:00Z',
    details: {
      trade_id: 'trade-014',
      entry_reason: 'Asian session range breakout, expecting continuation of uptrend at open',
      exit_reason: 'Stop hit, weak US data caused risk-off at open',
      psychological_notes: 'Market conditions changed at open, loss was within plan',
      confidence_level: 3, structure_quality: 3, confluence_count: 2, ai_feedback: null,
    },
  },
  {
    id: 'trade-015', user_id: 'user-001',
    symbol: 'NQ1', direction: 'long',
    entry_price: 21678, exit_price: 21734,
    entry_time: '2026-04-20T09:30:00Z', exit_time: '2026-04-20T13:00:00Z',
    position_size: 2, pnl: 2240, pnl_percent: 5.67, status: 'closed',
    created_at: '2026-04-20T09:30:00Z',
    details: {
      trade_id: 'trade-015',
      entry_reason: 'NQ buying dip to institutional order block 21670, momentum aligned H1+H4',
      exit_reason: 'Scaled out at resistance, closed remainder before weekend',
      psychological_notes: 'Excellent trade management, patience with the full position rewarded',
      confidence_level: 5, structure_quality: 5, confluence_count: 5, ai_feedback: null,
    },
  },
];

const START_BALANCE = 10000;

function buildEquityCurve(): EquityPoint[] {
  const sorted = [...MOCK_TRADES]
    .filter(t => t.exit_time && t.pnl !== null)
    .sort((a, b) => new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime());

  const points: EquityPoint[] = [{ date: '2026-01-01', equity: START_BALANCE, pnl: 0 }];
  let equity = START_BALANCE;

  for (const t of sorted) {
    equity += t.pnl!;
    const date = t.exit_time!.slice(0, 10);
    const last = points[points.length - 1];
    if (last.date === date) {
      points[points.length - 1] = { date, equity, pnl: last.pnl + t.pnl! };
    } else {
      points.push({ date, equity, pnl: t.pnl! });
    }
  }
  return points;
}

export const EQUITY_CURVE = buildEquityCurve();

export function buildMonthPnl(year: number, month: number): DayPnl[] {
  const map = new Map<string, DayPnl>();
  for (const t of MOCK_TRADES) {
    if (!t.exit_time || t.pnl === null) continue;
    const d = new Date(t.exit_time);
    if (d.getFullYear() !== year || d.getMonth() + 1 !== month) continue;
    const key = t.exit_time.slice(0, 10);
    const existing = map.get(key) ?? { date: key, pnl: 0, trades: 0 };
    map.set(key, { date: key, pnl: existing.pnl + t.pnl, trades: existing.trades + 1 });
  }
  return Array.from(map.values());
}

export function getDashboardStats(): DashboardStats {
  const closed = MOCK_TRADES.filter(t => t.status === 'closed' && t.pnl !== null);
  const wins = closed.filter(t => t.pnl! > 0);
  const losses = closed.filter(t => t.pnl! < 0);
  const totalPnl = closed.reduce((s, t) => s + t.pnl!, 0);
  const grossProfit = wins.reduce((s, t) => s + t.pnl!, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl!, 0));

  const returns = EQUITY_CURVE.slice(1).map((p, i) => {
    const prev = EQUITY_CURVE[i].equity;
    return (p.equity - prev) / prev;
  });
  const meanReturn = returns.reduce((s, r) => s + r, 0) / (returns.length || 1);
  const stdDev = Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - meanReturn, 2), 0) / (returns.length || 1));
  const sharpe = stdDev > 0 ? (meanReturn * 252) / (stdDev * Math.sqrt(252)) : 0;

  let peak = START_BALANCE, maxDd = 0;
  for (const p of EQUITY_CURVE) {
    if (p.equity > peak) peak = p.equity;
    const dd = (peak - p.equity) / peak;
    if (dd > maxDd) maxDd = dd;
  }

  const balance = START_BALANCE + totalPnl;
  return {
    balance,
    starting_balance: START_BALANCE,
    ytd_pnl: totalPnl,
    ytd_pnl_pct: (totalPnl / START_BALANCE) * 100,
    win_rate: (wins.length / (closed.length || 1)) * 100,
    sharpe_ratio: parseFloat(sharpe.toFixed(2)),
    total_trades: closed.length,
    profit_factor: grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : 0,
    max_drawdown: parseFloat((maxDd * 100).toFixed(2)),
  };
}

export const DEFAULT_RISK_RULES: RiskRules = {
  max_risk_per_trade: 1.5,
  max_daily_loss: 500,
  min_rr_ratio: 2.0,
  kelly_percentage: 25,
};
