'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SplashPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100 || isLoading) return;
    router.replace(isLoggedIn ? '/dashboard' : (localStorage.getItem('onboarded') ? '/login' : '/onboarding'));
  }, [progress, isLoading, isLoggedIn, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-primary-dark">
      
      {/* Center glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(28,95,32,0.8) 0%, transparent 65%)' }}
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[200px]"
        style={{ background: 'linear-gradient(to top, rgba(13,43,15,0.6), transparent)' }}
      />

      {/* Logo + title */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="relative mb-5 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-gold/15"
          style={{ border: '1px solid rgba(212,175,55,0.25)' }}
        >
          {/* spinning dashed ring - web only */}
          <div
            className="absolute inset-[-8px] rounded-full"
            style={{
              border: '1px dashed rgba(212,175,55,0.18)',
              animation: 'spin-slow 20s linear infinite',
            }}
          />
          <span className="text-5xl">💰</span>
        </div>

        <h1 className="mb-1 font-manrope text-[28px] font-bold text-gold">WealthWise AI</h1>
        <p className="font-cairo text-base font-medium text-white/70">محفظتك الذكية</p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-20 z-10 flex w-[60%] max-w-[320px] flex-col items-center gap-2.5">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gold transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-cairo text-xs font-medium text-white/40">{progress}%</span>
      </div>

      {/* Footer */}
      <p className="absolute bottom-7 z-10 font-cairo text-[11px] tracking-wide text-white/20">
        WealthWise &copy; 2025
      </p>
    </div>
  );
}
