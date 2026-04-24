'use client';

import { useState, useEffect } from 'react';
import { Save, Download, Shield, Bell, User, Building2, Plus, XCircle, RefreshCw, LogOut } from 'lucide-react';
import { DEFAULT_RISK_RULES } from '@/lib/mock-data';
import type { RiskRules } from '@/types';
import { useAuth } from '@/contexts/auth';
import { useTrades } from '@/hooks/use-trades';
import { exportTradesToCSV } from '@/lib/trade-utils';

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 150000, 200000, 250000];
function fmtSize(n: number) { return n >= 1000 ? `$${n / 1000}K` : `$${n}`; }

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
             style={{ background: 'rgba(0,212,255,0.1)' }}>
          <Icon size={14} style={{ color: 'var(--cyan)' }} />
        </div>
        <h2 className="text-[14px] font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {note && <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>{note}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { profile: authProfile, propAccounts, addPropAccount, revokePropAccount, reactivatePropAccount, updateProfile, user } = useAuth();
  const { trades } = useTrades();
  const [rules, setRules] = useState<RiskRules>(DEFAULT_RISK_RULES);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', timezone: 'America/New_York' });
  const [notifs, setNotifs] = useState({ daily_summary: true, loss_alert: true, weekly_report: false });

  useEffect(() => {
    if (authProfile) setProfile(p => ({ ...p, name: authProfile.name ?? '', timezone: authProfile.timezone }));
  }, [authProfile]);

  useEffect(() => {
    if (user) setProfile(p => ({ ...p, email: user.email ?? '' }));
  }, [user]);

  // Prop account add form
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newFirmName, setNewFirmName]       = useState('');
  const [newAccountSize, setNewAccountSize] = useState<number | null>(null);
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [accountError, setAccountError]     = useState('');
  const [accountLoading, setAccountLoading] = useState(false);

  async function handleAddAccount() {
    if (!newFirmName.trim() || !newAccountSize) { setAccountError('Firm name and account size are required.'); return; }
    setAccountLoading(true); setAccountError('');
    const { error } = await addPropAccount(newFirmName.trim(), newAccountSize, newAccountNumber.trim() || undefined);
    setAccountLoading(false);
    if (error) { setAccountError(error); return; }
    setNewFirmName(''); setNewAccountSize(null); setNewAccountNumber(''); setShowAddAccount(false);
  }

  async function handleSave() {
    await updateProfile({ name: profile.name, timezone: profile.timezone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const ruleSet = (k: keyof RiskRules) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setRules(r => ({ ...r, [k]: parseFloat(e.target.value) }));

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-[22px] font-bold text-white">Settings</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>Manage your account and trading preferences</p>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div className="rg-2 grid grid-cols-2 gap-4">
          <Field label="Display Name">
            <input className="input-field" value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="Email">
            <input className="input-field" type="email" value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
          </Field>
        </div>
        <Field label="Timezone">
          <select className="select-field" value={profile.timezone}
            onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Chicago">America/Chicago (CST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Europe/Paris">Europe/Paris (CET)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          </select>
        </Field>
      </Section>

      {/* Prop Accounts */}
      <Section title="Prop Firm Accounts" icon={Building2}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {propAccounts.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>No accounts yet.</p>
          )}
          {propAccounts.map(acc => (
            <div key={acc.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 12,
              background: acc.is_active ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${acc.is_active ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: acc.is_active ? '#fff' : 'var(--muted)' }}>
                  {acc.firm_name}
                  {acc.account_number && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>#{acc.account_number}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {fmtSize(acc.account_size)} account
                  {!acc.is_active && <span style={{ marginLeft: 8, color: '#ef4444' }}>Inactive</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {acc.is_active ? (
                  <button
                    className="btn-ghost"
                    style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                    onClick={() => revokePropAccount(acc.id)}
                  >
                    <XCircle size={13} /> Revoke
                  </button>
                ) : (
                  <button
                    className="btn-ghost"
                    style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                    onClick={() => reactivatePropAccount(acc.id)}
                  >
                    <RefreshCw size={13} /> Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {showAddAccount ? (
          <div style={{ marginTop: 16, padding: '20px', borderRadius: 12, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.05)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Add New Account</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label className="label">Firm Name</label>
                <input className="input-field" placeholder="e.g. FTMO" value={newFirmName} onChange={e => setNewFirmName(e.target.value)} />
              </div>
              <div>
                <label className="label">Account Number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
                <input className="input-field" placeholder="e.g. AP-123456" value={newAccountNumber} onChange={e => setNewAccountNumber(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Account Size</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 8 }}>
                {ACCOUNT_SIZES.map(size => (
                  <button key={size} type="button" onClick={() => setNewAccountSize(size)}
                    style={{
                      padding: '8px 4px', borderRadius: 8, fontSize: 12,
                      border: `1px solid ${newAccountSize === size ? 'var(--violet)' : 'rgba(255,255,255,0.08)'}`,
                      background: newAccountSize === size ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                      color: newAccountSize === size ? '#fff' : 'var(--muted)',
                      fontWeight: newAccountSize === size ? 700 : 400,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {fmtSize(size)}
                  </button>
                ))}
              </div>
            </div>
            {accountError && (
              <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)' }}>{accountError}</div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-ghost px-4 py-2" style={{ fontSize: 13 }} onClick={() => { setShowAddAccount(false); setAccountError(''); }}>Cancel</button>
              <button className="btn-primary px-5 py-2" style={{ fontSize: 13, opacity: accountLoading ? 0.7 : 1 }} onClick={handleAddAccount} disabled={accountLoading}>
                {accountLoading ? 'Adding...' : 'Add Account'}
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn-ghost"
            style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            onClick={() => setShowAddAccount(true)}
          >
            <Plus size={14} /> Add Account
          </button>
        )}
      </Section>

      {/* Risk Rules */}
      <Section title="Risk Management Rules" icon={Shield}>
        <div className="rg-2 grid grid-cols-2 gap-4">
          <Field label="Max Risk Per Trade (%)" note="Percentage of account risked per position">
            <input className="input-field" type="number" step="0.1" min="0.1" max="10"
              value={rules.max_risk_per_trade} onChange={ruleSet('max_risk_per_trade')} />
          </Field>
          <Field label="Max Daily Loss ($)" note="Stop trading when this loss is reached">
            <input className="input-field" type="number" step="10" min="0"
              value={rules.max_daily_loss} onChange={ruleSet('max_daily_loss')} />
          </Field>
          <Field label="Minimum R:R Ratio" note="Only take trades with this risk/reward or better">
            <input className="input-field" type="number" step="0.1" min="0.5"
              value={rules.min_rr_ratio} onChange={ruleSet('min_rr_ratio')} />
          </Field>
          <Field label="Kelly Criterion %" note="Position sizing fraction of optimal Kelly">
            <input className="input-field" type="number" step="5" min="5" max="100"
              value={rules.kelly_percentage} onChange={ruleSet('kelly_percentage')} />
          </Field>
        </div>

        {/* Live risk calc */}
        <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--cyan)' }}>
            Live Calculation (on $12,494 balance)
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
              Max position risk: <span className="text-white font-medium">${(12494 * rules.max_risk_per_trade / 100).toFixed(0)}</span>
            </div>
            <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
              Daily loss limit: <span className="text-white font-medium">${rules.max_daily_loss}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        {[
          { key: 'daily_summary', label: 'Daily P&L Summary', desc: 'End of day trade recap' },
          { key: 'loss_alert', label: 'Daily Loss Limit Alert', desc: 'Alert when approaching max daily loss' },
          { key: 'weekly_report', label: 'Weekly Performance Report', desc: 'Full week analytics every Sunday' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div>
              <div className="text-[13px] font-medium text-white">{label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</div>
            </div>
            <button
              onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
              className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
              style={{
                background: notifs[key as keyof typeof notifs] ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
              }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{
                  background: '#fff',
                  left: notifs[key as keyof typeof notifs] ? '20px' : '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              />
            </button>
          </div>
        ))}
      </Section>

      {/* Export */}
      <Section title="Data Export" icon={Download}>
        <div className="rg-2 grid grid-cols-2 gap-3">
          <button
            className="btn-ghost flex items-center justify-center gap-2 py-3"
            onClick={() => exportTradesToCSV(trades)}
            disabled={trades.length === 0}
          >
            <Download size={14} />
            Export Trades CSV
          </button>
          <button
            className="btn-ghost flex items-center justify-center gap-2 py-3"
            onClick={() => window.print()}
          >
            <Download size={14} />
            Print / PDF Report
          </button>
        </div>
        <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
          CSV export includes all {trades.length} trades with entry/exit, P&L, and notes.{trades.length === 0 ? ' Add trades first.' : ''}
        </p>
      </Section>

      {/* Save + Sign out */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="btn-primary flex items-center gap-2 px-6 py-3"
          onClick={handleSave}
        >
          <Save size={15} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <SignOutButton />
      </div>
    </div>
  );
}

function SignOutButton() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    await signOut();
    window.location.href = '/login';
  }
  return (
    <button
      className="btn-ghost flex items-center gap-2 px-5 py-3"
      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', fontSize: 13 }}
      onClick={handle}
      disabled={loading}
    >
      <LogOut size={14} />
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
