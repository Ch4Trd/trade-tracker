export type Direction = 'long' | 'short';
export type TradeStatus = 'open' | 'closed' | 'pending';

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  direction: Direction;
  entry_price: number;
  exit_price: number | null;
  entry_time: string;
  exit_time: string | null;
  position_size: number;
  pnl: number | null;
  pnl_percent: number | null;
  status: TradeStatus;
  created_at: string;
}

export interface TradeDetails {
  trade_id: string;
  entry_reason: string;
  exit_reason: string;
  psychological_notes: string;
  confidence_level: number;
  structure_quality: number;
  confluence_count: number;
  ai_feedback: string | null;
}

export interface TradeWithDetails extends Trade {
  details?: TradeDetails;
}

export interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
}

export interface DayPnl {
  date: string;
  pnl: number;
  trades: number;
}

export interface SymbolStats {
  symbol: string;
  wins: number;
  losses: number;
  total_pnl: number;
  trades: number;
}

export interface RiskRules {
  max_risk_per_trade: number;
  max_daily_loss: number;
  min_rr_ratio: number;
  kelly_percentage: number;
}

export interface DashboardStats {
  balance: number;
  starting_balance: number;
  ytd_pnl: number;
  ytd_pnl_pct: number;
  win_rate: number;
  sharpe_ratio: number;
  total_trades: number;
  profit_factor: number;
  max_drawdown: number;
}
