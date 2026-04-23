'use client';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from 'recharts';
import type { EquityPoint } from '@/types';
import { formatBalance } from '@/lib/formatters';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1d2e', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '8px 12px' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 2 }}>{formatBalance(payload[0].value)}</div>
    </div>
  );
}

export function EquityCurve({ data }: { data: EquityPoint[] }) {
  const minEq = Math.min(...data.map(d => d.equity));
  const maxEq = Math.max(...data.map(d => d.equity));
  const domain = [Math.floor(minEq * 0.993), Math.ceil(maxEq * 1.005)];

  const formatted = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Equity Curve</h3>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Account balance over time</p>
        </div>
        <span className="badge-neutral">YTD 2026</span>
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={domain} tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false}
                   tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="equity" stroke="#8b5cf6" strokeWidth={2}
                  fill="url(#equityGrad)" dot={false}
                  activeDot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
