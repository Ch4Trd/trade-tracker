'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Profile, PropAccount } from '@/lib/supabase/types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  propAccounts: PropAccount[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string; timezone?: string; onboarded?: boolean }) => Promise<{ error: string | null }>;
  addPropAccount: (firmName: string, accountSize: number, accountNumber?: string) => Promise<{ error: string | null }>;
  revokePropAccount: (id: string) => Promise<{ error: string | null }>;
  reactivatePropAccount: (id: string) => Promise<{ error: string | null }>;
  refreshPropAccounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [session, setSession]         = useState<Session | null>(null);
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [propAccounts, setPropAccounts] = useState<PropAccount[]>([]);
  const [loading, setLoading]         = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    setProfile(data ?? null);
  }, []);

  const loadPropAccounts = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('prop_accounts')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    setPropAccounts(data ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        Promise.all([
          loadProfile(session.user.id),
          loadPropAccounts(session.user.id),
        ]).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        loadPropAccounts(session.user.id);
      } else {
        setProfile(null);
        setPropAccounts([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile, loadPropAccounts]);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function updateProfile(updates: { name?: string; timezone?: string; onboarded?: boolean }) {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (data) setProfile(data);
    return { error: error?.message ?? null };
  }

  async function addPropAccount(firmName: string, accountSize: number, accountNumber?: string) {
    if (!user) return { error: 'Not authenticated' };
    const { data, error } = await supabase
      .from('prop_accounts')
      .insert({ user_id: user.id, firm_name: firmName, account_size: accountSize, account_number: accountNumber ?? null })
      .select()
      .single();
    if (data) setPropAccounts(prev => [data, ...prev]);
    return { error: error?.message ?? null };
  }

  async function revokePropAccount(id: string) {
    const { error } = await supabase
      .from('prop_accounts')
      .update({ is_active: false })
      .eq('id', id);
    if (!error) setPropAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: false } : a));
    return { error: error?.message ?? null };
  }

  async function reactivatePropAccount(id: string) {
    const { error } = await supabase
      .from('prop_accounts')
      .update({ is_active: true })
      .eq('id', id);
    if (!error) setPropAccounts(prev => prev.map(a => a.id === id ? { ...a, is_active: true } : a));
    return { error: error?.message ?? null };
  }

  async function refreshPropAccounts() {
    if (user) await loadPropAccounts(user.id);
  }

  return (
    <AuthContext.Provider value={{
      user, session, profile, propAccounts, loading,
      signIn, signUp, signOut, updateProfile,
      addPropAccount, revokePropAccount, reactivatePropAccount, refreshPropAccounts,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
