import { NextResponse } from 'next/server';

export interface PriceQuote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  prevClose: number;
  state: string;
  decimals: number;
}

const SYMBOLS: Record<string, { label: string; decimals: number }> = {
  'NQ=F':     { label: 'NQ1',     decimals: 2 },
  'ES=F':     { label: 'ES1',     decimals: 2 },
  'EURUSD=X': { label: 'EUR/USD', decimals: 5 },
  'GBPUSD=X': { label: 'GBP/USD', decimals: 5 },
  'CL=F':     { label: 'XTI/USD', decimals: 2 },
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Module-level cache — shared across requests in dev
let _crumb   = '';
let _cookies = '';
let _expires = 0;

async function getCrumb(): Promise<{ crumb: string; cookies: string } | null> {
  if (_crumb && Date.now() < _expires) return { crumb: _crumb, cookies: _cookies };

  try {
    // 1. Hit fc.yahoo.com to get the consent cookie
    const fcRes = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA },
      redirect: 'follow',
    });
    const rawCookies: string[] = typeof fcRes.headers.getSetCookie === 'function'
      ? fcRes.headers.getSetCookie()
      : (fcRes.headers.get('set-cookie') ?? '').split(/,(?=[^ ])/);

    _cookies = rawCookies.map(c => c.split(';')[0]).join('; ');

    // 2. Fetch crumb
    const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, 'Cookie': _cookies },
    });

    if (!crumbRes.ok) return null;
    _crumb   = await crumbRes.text();
    _expires = Date.now() + 5 * 60 * 1000; // cache 5 min

    return { crumb: _crumb, cookies: _cookies };
  } catch {
    return null;
  }
}

async function fetchViaV7(crumb: string, cookies: string): Promise<PriceQuote[] | null> {
  const keys = Object.keys(SYMBOLS).join(',');
  const url  = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${keys}&crumb=${encodeURIComponent(crumb)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Cookie': cookies,
      'Accept': 'application/json',
      'Referer': 'https://finance.yahoo.com/',
    },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  const data = await res.json();
  const quotes: Record<string, unknown>[] = data?.quoteResponse?.result ?? [];
  if (!quotes.length) return null;

  return quotes
    .filter(q => SYMBOLS[q.symbol as string])
    .map(q => {
      const info = SYMBOLS[q.symbol as string];
      return {
        symbol:    info.label,
        price:     (q.regularMarketPrice    as number) ?? 0,
        change:    (q.regularMarketChange   as number) ?? 0,
        changePct: (q.regularMarketChangePercent as number) ?? 0,
        prevClose: (q.regularMarketPreviousClose as number) ?? 0,
        state:     (q.marketState           as string) ?? 'CLOSED',
        decimals:  info.decimals,
      };
    });
}

// Per-symbol fallback using v8/chart (no crumb needed on some endpoints)
async function fetchViaChart(ticker: string, info: { label: string; decimals: number }): Promise<PriceQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`;
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json', 'Referer': 'https://finance.yahoo.com/' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price     = (meta.regularMarketPrice      as number) ?? 0;
    const prevClose = (meta.chartPreviousClose       as number) ?? (meta.previousClose as number) ?? price;
    const change    = price - prevClose;
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol:    info.label,
      price,
      change,
      changePct,
      prevClose,
      state:     (meta.marketState as string) ?? 'CLOSED',
      decimals:  info.decimals,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Try v7 with crumb first (most data in one call)
    const session = await getCrumb();
    if (session?.crumb) {
      const quotes = await fetchViaV7(session.crumb, session.cookies);
      if (quotes?.length) {
        return NextResponse.json({ prices: quotes, ts: Date.now(), source: 'v7' });
      }
    }

    // Fallback: v8/chart per symbol
    const results = await Promise.all(
      Object.entries(SYMBOLS).map(([ticker, info]) => fetchViaChart(ticker, info))
    );
    const prices = results.filter(Boolean) as PriceQuote[];

    if (prices.length) {
      return NextResponse.json({ prices, ts: Date.now(), source: 'v8' });
    }

    return NextResponse.json({ prices: [], ts: Date.now(), error: 'all_sources_failed' });
  } catch (err) {
    return NextResponse.json({ prices: [], error: String(err) });
  }
}
