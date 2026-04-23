'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PriceQuote } from '@/app/api/prices/route';

const SYMBOL_ORDER = ['NQ1', 'ES1', 'EUR/USD', 'GBP/USD', 'XTI/USD'];

function PriceCard({ quote, prev }: { quote: PriceQuote; prev: number | null }) {
  const up = quote.change > 0;
  const dn = quote.change < 0;
  const flash = prev !== null && prev !== quote.price;
  const isOpen = quote.state === 'REGULAR';

  const priceStr = quote.price.toFixed(quote.decimals);
  const changeStr = (up ? '+' : '') + quote.change.toFixed(quote.decimals);
  const pctStr   = (up ? '+' : '') + quote.changePct.toFixed(2) + '%';

  return (
    <div
      style={{
        background: flash
          ? up ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'
          : 'var(--card-bg)',
        border: `1px solid ${up ? 'rgba(34,197,94,0.18)' : dn ? 'rgba(239,68,68,0.18)' : 'var(--card-border)'}`,
        borderRadius: 14,
        padding: '14px 16px',
        flex: 1,
        minWidth: 0,
        transition: 'background 0.4s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 80, height: 80, borderRadius: '50%',
        background: up
          ? 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)'
          : dn
          ? 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          {quote.symbol}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isOpen && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gain)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          )}
          <span style={{ fontSize: 9, fontWeight: 600, color: isOpen ? 'var(--gain)' : 'var(--muted)', letterSpacing: '0.05em' }}>
            {isOpen ? 'LIVE' : quote.state === 'PRE' ? 'PRE' : 'CLOSED'}
          </span>
        </div>
      </div>

      {/* Price */}
      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'monospace', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {priceStr}
      </div>

      {/* Change */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
        {up ? <TrendingUp size={11} style={{ color: 'var(--gain)', flexShrink: 0 }} />
            : dn ? <TrendingDown size={11} style={{ color: 'var(--loss)', flexShrink: 0 }} />
            : <Minus size={11} style={{ color: 'var(--muted)', flexShrink: 0 }} />}
        <span style={{ fontSize: 11, fontWeight: 600, color: up ? 'var(--gain)' : dn ? 'var(--loss)' : 'var(--muted)' }}>
          {changeStr}
        </span>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>({pctStr})</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
      borderRadius: 14, padding: '14px 16px', flex: 1,
    }}>
      <div style={{ width: 40, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', marginBottom: 10 }} />
      <div style={{ width: 90, height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
      <div style={{ width: 60, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

export function PriceTicker() {
  const [quotes, setQuotes]     = useState<PriceQuote[]>([]);
  const [prevPrices, setPrev]   = useState<Record<string, number>>({});
  const [loading, setLoading]   = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError]       = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/prices', { cache: 'no-store' });
      const data = await res.json();
      if (!data.prices?.length) { setError(true); return; }

      setError(false);
      setQuotes(prev => {
        const prevMap: Record<string, number> = {};
        for (const q of prev) prevMap[q.symbol] = q.price;
        setPrev(prevMap);
        return data.prices;
      });
      setLastUpdate(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 5000);
    return () => clearInterval(id);
  }, [fetchPrices]);

  const sorted = SYMBOL_ORDER.map(s => quotes.find(q => q.symbol === s)).filter(Boolean) as PriceQuote[];

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Market Prices</h3>
          {!loading && !error && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px',
              borderRadius: 6, letterSpacing: '0.05em',
              background: 'rgba(34,197,94,0.1)', color: 'var(--gain)',
              border: '1px solid rgba(34,197,94,0.2)',
            }}>
              REAL-TIME
            </span>
          )}
          {error && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px',
              borderRadius: 6, color: 'var(--loss)', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              UNAVAILABLE
            </span>
          )}
        </div>
        {lastUpdate && (
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Updated {lastUpdate}</span>
        )}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: 12 }}>
        {loading
          ? SYMBOL_ORDER.map(s => <SkeletonCard key={s} />)
          : error
          ? (
            <div style={{
              flex: 1, padding: '20px', textAlign: 'center',
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14,
              fontSize: 13, color: 'var(--muted)',
            }}>
              Market data unavailable — check your connection
            </div>
          )
          : sorted.map(q => (
              <PriceCard
                key={q.symbol}
                quote={q}
                prev={prevPrices[q.symbol] ?? null}
              />
            ))
        }
      </div>
    </div>
  );
}
