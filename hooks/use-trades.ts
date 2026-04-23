'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { TradeWithDetails } from '@/types';

export function useTrades() {
  const { user } = useAuth();
  const [trades, setTrades]   = useState<TradeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setTrades([]); setLoading(false); return; }
    setLoading(true);

    const { data } = await supabase
      .from('trades')
      .select(`*, trade_details ( entry_reason, exit_reason, psychological_notes, confidence_level, structure_quality, confluence_count, ai_feedback )`)
      .eq('user_id', user.id)
      .order('entry_time', { ascending: false });

    const result: TradeWithDetails[] = (data ?? []).map((row: Record<string, unknown>) => {
      const { trade_details, ...trade } = row;
      return { ...(trade as unknown as TradeWithDetails), details: (trade_details as TradeWithDetails['details']) ?? undefined };
    });

    setTrades(result);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function addTrade(
    payload: Omit<TradeWithDetails, 'id' | 'user_id' | 'created_at'>
  ): Promise<{ error: string | null }> {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('trades')
      .insert({
        user_id:         user.id,
        prop_account_id: (payload as TradeWithDetails & { prop_account_id?: string }).prop_account_id ?? null,
        symbol:          payload.symbol,
        direction:       payload.direction,
        entry_price:     payload.entry_price,
        exit_price:      payload.exit_price,
        entry_time:      payload.entry_time,
        exit_time:       payload.exit_time,
        position_size:   payload.position_size,
        pnl:             payload.pnl,
        pnl_percent:     payload.pnl_percent,
        status:          payload.status,
      })
      .select()
      .single();

    if (error || !data) return { error: error?.message ?? 'Failed to save trade' };

    if (payload.details) {
      await supabase.from('trade_details').insert({
        trade_id:             data.id,
        entry_reason:         payload.details.entry_reason || null,
        exit_reason:          payload.details.exit_reason || null,
        psychological_notes:  payload.details.psychological_notes || null,
        confidence_level:     payload.details.confidence_level || null,
        structure_quality:    payload.details.structure_quality || null,
        confluence_count:     payload.details.confluence_count || null,
        ai_feedback:          null,
      });
    }

    setTrades(prev => [{ ...(data as TradeWithDetails), details: payload.details }, ...prev]);
    return { error: null };
  }

  return { trades, loading, addTrade, reload: load };
}
