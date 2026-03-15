/* Tabs layout - Sidebar on desktop (lg+), bottom bar on mobile */
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const tabs = [
  { href: '/dashboard', icon: '🏠', label: 'الرئيسية' },
  { href: '/wallets', icon: '💰', label: 'المحافظ' },
  { href: '/smart-expense', icon: '🤖', label: 'المصروف الذكي', isCenter: true },
  { href: '/budget', icon: '📊', label: 'البادجت' },
  { href: '/profile', icon: '👤', label: 'الحساب' },
];

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-l border-border-light bg-bg-card lg:flex">
        <div className="flex items-center gap-3 border-b border-border-light px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl">💰</span>
          </div>
          <h1 className="font-manrope text-lg font-bold text-primary">WealthWise AI</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                isActive(tab.href)
                  ? 'bg-primary-surface text-primary'
                  : 'text-text-secondary hover:bg-border-light'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`font-cairo text-sm font-medium ${
                isActive(tab.href) ? 'font-bold text-primary' : ''
              }`}>
                {tab.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-border-light px-4 py-4">
          <p className="font-cairo text-xs text-text-light">WealthWise AI v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[68px] items-center justify-around border-t border-border-light bg-bg-card shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <Link key="smart" href={tab.href} className="relative -top-5 flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_4px_8px_rgba(28,95,32,0.3)]">
                  <span className="text-[26px]">{tab.icon}</span>
                </div>
              </Link>
            );
          }
          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 py-2">
              <span className={`text-[22px] ${isActive(tab.href) ? 'opacity-100' : 'opacity-50'}`}>{tab.icon}</span>
              <span className={`font-cairo text-[10px] font-medium ${isActive(tab.href) ? 'text-primary' : 'text-text-light'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
