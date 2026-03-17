'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from './Spinner';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/onboarding'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn && !isPublic) {
      router.replace('/login');
    }
  }, [isLoading, isLoggedIn, isPublic, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <Spinner />
      </div>
    );
  }

  if (!isLoggedIn && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
