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
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-dark">
      <div className="mb-20 flex flex-col items-center">
        <div className="mb-5 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-gold/15">
          <span className="text-5xl">💰</span>
        </div>
        <h1 className="mb-1 font-manrope text-[28px] font-bold text-gold">WealthWise AI</h1>
        <p className="font-cairo text-base font-medium text-white/70">محفظتك الذكية</p>
      </div>
      <div className="absolute bottom-20 w-[60%]">
        <div className="h-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gold transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
