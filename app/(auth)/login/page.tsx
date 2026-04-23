'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        setSuccess('Account created — check your email to confirm, then sign in.');
        setMode('login');
        setLoading(false);
      }
    }
  }

  return (
    <div>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
        }}>
          <TrendingUp size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>TradingJournal Pro</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
          {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        {/* Email */}
        <div>
          <label className="label">Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: 36 }}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: 36, paddingRight: 40 }}
              type={showPw ? 'text' : 'password'}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex' }}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 13, color: '#ef4444' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', fontSize: 13, color: '#22c55e' }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full py-3"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                style={{ color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                style={{ color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
