export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          timezone: string;
          onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          timezone?: string;
          onboarded?: boolean;
        };
        Update: {
          name?: string | null;
          timezone?: string;
          onboarded?: boolean;
        };
      };
      prop_accounts: {
        Row: {
          id: string;
          user_id: string;
          firm_name: string;
          account_size: number;
          account_number: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          firm_name: string;
          account_size: number;
          account_number?: string | null;
          is_active?: boolean;
        };
        Update: {
          firm_name?: string;
          account_size?: number;
          account_number?: string | null;
          is_active?: boolean;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          prop_account_id: string | null;
          symbol: string;
          direction: 'long' | 'short';
          entry_price: number;
          exit_price: number | null;
          entry_time: string;
          exit_time: string | null;
          position_size: number;
          pnl: number | null;
          pnl_percent: number | null;
          status: 'open' | 'closed' | 'pending';
          created_at: string;
        };
        Insert: {
          user_id: string;
          prop_account_id?: string | null;
          symbol: string;
          direction: 'long' | 'short';
          entry_price: number;
          exit_price?: number | null;
          entry_time: string;
          exit_time?: string | null;
          position_size: number;
          pnl?: number | null;
          pnl_percent?: number | null;
          status?: 'open' | 'closed' | 'pending';
        };
        Update: Partial<Database['public']['Tables']['trades']['Insert']>;
      };
      trade_details: {
        Row: {
          trade_id: string;
          entry_reason: string | null;
          exit_reason: string | null;
          psychological_notes: string | null;
          confidence_level: number | null;
          structure_quality: number | null;
          confluence_count: number | null;
          ai_feedback: string | null;
        };
        Insert: {
          trade_id: string;
          entry_reason?: string | null;
          exit_reason?: string | null;
          psychological_notes?: string | null;
          confidence_level?: number | null;
          structure_quality?: number | null;
          confluence_count?: number | null;
          ai_feedback?: string | null;
        };
        Update: Partial<Database['public']['Tables']['trade_details']['Insert']>;
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type PropAccount = Database['public']['Tables']['prop_accounts']['Row'];
export type TradeRow = Database['public']['Tables']['trades']['Row'];
export type TradeDetailRow = Database['public']['Tables']['trade_details']['Row'];
