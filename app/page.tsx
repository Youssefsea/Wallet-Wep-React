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
    if (isLoggedIn) {
      router.replace('/dashboard');
    } else {
      const seen = localStorage.getItem('onboarded');
      router.replace(seen ? '/login' : '/onboarding');
    }
  }, [progress, isLoading, isLoggedIn, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-primary-dark">

      {/* Subtle radial glow behind logo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(212,175,55,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Center content */}
      <div className="relative flex flex-col items-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gold/10 ring-1 ring-gold/20 shadow-2xl lg:h-28 lg:w-28">
          <span className="text-5xl lg:text-6xl">💰</span>
        </div>

        <h1 className="mb-2 font-manrope text-3xl font-bold tracking-tight text-gold lg:text-4xl">
          WealthWise AI
        </h1>
        <p className="font-cairo text-base font-medium text-white/60">محفظتك الذكية</p>
      </div>

      {/* Progress bar — pinned to bottom, constrained width on desktop */}
      <div className="absolute bottom-12 flex w-full flex-col items-center gap-3 px-8">
        <div className="w-full max-w-xs overflow-hidden rounded-full bg-white/10 h-1">
          <div
            className="h-full rounded-full bg-gold transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-cairo text-xs text-white/30">جاري التحميل...</p>
      </div>
    </div>
  );
}