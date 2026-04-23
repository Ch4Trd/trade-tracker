'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth';
import { OnboardingWizard } from '@/components/onboarding/wizard';

export function AppGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [wizardDone, setWizardDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(139,92,246,0.2)',
          borderTopColor: 'var(--violet)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  const needsOnboarding = profile && !profile.onboarded && !wizardDone;

  return (
    <>
      {needsOnboarding && (
        <OnboardingWizard onComplete={() => setWizardDone(true)} />
      )}
      {children}
    </>
  );
}
