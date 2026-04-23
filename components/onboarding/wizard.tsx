'use client';

import { useState } from 'react';
import { CheckCircle, TrendingUp, Building2, ChevronRight, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 150000, 200000, 250000];

function fmt(n: number): string {
  if (n >= 1000) return `$${n / 1000}K`;
  return `$${n}`;
}

interface WizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: WizardProps) {
  const { updateProfile, addPropAccount } = useAuth();
  const [step, setStep]             = useState(1);
  const [name, setName]             = useState('');
  const [firmName, setFirmName]     = useState('');
  const [accountSize, setAccountSize] = useState<number | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  async function handleFinish() {
    if (!firmName.trim() || !accountSize) {
      setError('Please fill in your firm name and select an account size.');
      return;
    }
    setLoading(true);
    setError('');

    const profileRes = await updateProfile({ name: name.trim() || undefined, onboarded: true });
    if (profileRes.error) { setError(profileRes.error); setLoading(false); return; }

    const accountRes = await addPropAccount(firmName.trim(), accountSize, accountNumber.trim() || undefined);
    if (accountRes.error) { setError(accountRes.error); setLoading(false); return; }

    setStep(3);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 1400);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(9,11,20,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)',
    }}>
      {/* Orbs */}
      <div style={{ position: 'fixed', top: -200, right: -100, width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -200, left: -100, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 520, padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
          }}>
            <TrendingUp size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Welcome to TradingJournal Pro</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Let's set up your account in a few steps</p>

          {/* Step indicators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                width: s === step ? 24 : 8, height: 8, borderRadius: 4,
                background: s <= step ? 'var(--violet)' : 'rgba(255,255,255,0.12)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="card p-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} style={{ color: 'var(--violet)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Your Name</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>How should we address you?</div>
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label className="label">Display Name</label>
              <input
                className="input-field"
                placeholder="e.g. Charles"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setStep(2)}
                autoFocus
              />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Optional — you can set this later in settings</p>
            </div>

            <button className="btn-primary w-full py-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => setStep(2)}>
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Prop account */}
        {step === 2 && (
          <div className="card p-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={16} style={{ color: 'var(--violet)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Prop Firm Account</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Add your first funded account</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label className="label">Firm Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. FTMO, Apex, MFF..."
                  value={firmName}
                  onChange={e => setFirmName(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Account Number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="input-field"
                  placeholder="e.g. AP-123456"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Account Size</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
                  {ACCOUNT_SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setAccountSize(size)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 10,
                        border: `1px solid ${accountSize === size ? 'var(--violet)' : 'rgba(255,255,255,0.08)'}`,
                        background: accountSize === size ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                        color: accountSize === size ? '#fff' : 'var(--muted)',
                        fontSize: 12,
                        fontWeight: accountSize === size ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {fmt(size)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 13, color: '#ef4444', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost px-5 py-3" onClick={() => setStep(1)}>Back</button>
              <button
                className="btn-primary py-3"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: loading ? 0.7 : 1 }}
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? 'Saving...' : <>Finish setup <ChevronRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="card p-8" style={{ textAlign: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px',
              background: 'rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={30} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>You're all set!</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Taking you to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
