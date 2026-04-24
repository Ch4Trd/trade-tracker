import { Sidebar } from '@/components/layout/sidebar';
import { AppGuard } from '@/components/layout/app-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Background violet orbs — corners */}
      <div style={{
        position: 'fixed', top: -180, right: -120,
        width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, rgba(139,92,246,0.04) 50%, transparent 75%)',
        filter: 'blur(40px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: -220, left: 40,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109,40,217,0.11) 0%, rgba(139,92,246,0.03) 50%, transparent 75%)',
        filter: 'blur(50px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: '35%', right: '10%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: -80, left: 80,
        width: 250, height: 250, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Bottom-right small accent */}
      <div style={{
        position: 'fixed', bottom: -60, right: 80,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(192,132,252,0.07) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <AppGuard>
        <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <Sidebar />
        </div>

        <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          <div className="app-main-pad" style={{ padding: '32px', minHeight: '100%' }}>
            {children}
          </div>
        </main>
      </AppGuard>
    </div>
  );
}
