/* Dashboard - responsive web layout with grid */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getTransactions, getBudgetRest } from '@/lib/api';
import Spinner from '@/components/Spinner';

interface Transaction {
  id: number;
  type: string;
  amount: string;
  description: string;
  category_name?: string;
  created_at: string;
  is_ai?: boolean;
}
interface Budget {
  id: number;
  category_name: string;
  monthly_limit: string;
  spent_amount: string;
  icon?: string;
}

export default function DashboardPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const [txRes, budgetRes] = await Promise.all([
        getTransactions(1, 5),
        getBudgetRest(monthYear),
      ]);
      setTransactions(txRes.data.transactions ?? []);
      setBudgets(budgetRes.data.budgets ?? []);
      await refreshProfile();
    } catch {} finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdraw': return '💸';
      case 'transfer': return '📤';
      case 'manual_expense': return '🧾';
      case 'manual_income': return '💵';
      case 'ai_expense': case 'ai_income': return '🤖';
      default: return '💳';
    }
  };
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'إيداع';
      case 'withdraw': return 'سحب';
      case 'transfer': return 'تحويل';
      case 'manual_expense': return 'مصروف يدوي';
      case 'manual_income': return 'دخل يدوي';
      case 'ai_expense': return 'مصروف AI';
      case 'ai_income': return 'دخل AI';
      default: return type;
    }
  };
  const isPositive = (type: string) =>
    type === 'deposit' || type === 'manual_income' || type === 'ai_income';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6 lg:px-10 lg:pt-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between lg:mb-8">
        <div>
          <p className="font-cairo text-sm text-text-secondary">أهلاً 👋</p>
          <h2 className="font-cairo text-2xl font-bold text-text-primary lg:text-3xl">{user?.name ?? ''}</h2>
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary lg:h-14 lg:w-14"
        >
          <span className="font-manrope text-lg font-bold text-white lg:text-xl">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </span>
        </button>
      </div>

      {/* Top: Balance Card + Quick Actions */}
      <div className="mb-6 grid gap-5 lg:mb-8 lg:grid-cols-3">
        <div className="rounded-2xl bg-primary-dark p-6 shadow-lg lg:col-span-2 lg:p-8">
          <p className="mb-1 font-cairo text-sm text-white/70">الرصيد الكلي</p>
          <p className="mb-5 font-manrope text-4xl font-bold text-gold lg:text-5xl">
            {parseFloat(user?.balance ?? '0').toLocaleString('en')} ج.م
          </p>
          <div className="flex gap-4 sm:gap-6">
            {[
              { icon: '💰', label: 'إيداع', href: '/deposit' },
              { icon: '💸', label: 'سحب', href: '/withdraw' },
              { icon: '📤', label: 'تحويل', href: '/transfer' },
              { icon: '📥', label: 'استلام', href: '/receive' },
            ].map(a => (
              <button key={a.href} onClick={() => router.push(a.href)}
                className="flex flex-col items-center rounded-xl bg-white/10 px-4 py-3 transition-colors hover:bg-white/20 sm:px-6">
                <span className="mb-1 text-2xl">{a.icon}</span>
                <span className="font-cairo text-xs font-medium text-white">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-row gap-3 lg:flex-col">
          <button onClick={() => router.push('/transactions')}
            className="flex flex-1 flex-col items-center justify-center rounded-xl bg-bg-card p-5 shadow-sm transition-colors hover:bg-border-light">
            <span className="mb-2 text-3xl">📋</span>
            <span className="font-cairo text-sm font-medium text-text-primary">سجل المعاملات</span>
          </button>
        </div>
      </div>

      {/* Budget + Transactions in two columns on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Budget */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-cairo text-lg font-bold text-text-primary lg:text-xl">الميزانية الشهرية</h3>
            <button onClick={() => router.push('/budget')} className="font-cairo text-sm font-medium text-primary hover:underline">
              عرض الكل
            </button>
          </div>
          {budgets.length === 0 ? (
            <div className="rounded-2xl bg-bg-card p-8 text-center shadow-sm">
              <p className="font-cairo text-sm text-text-secondary">لا توجد ميزانيات لهذا الشهر</p>
              <button onClick={() => router.push('/budget')} className="mt-3 font-cairo text-sm font-bold text-primary hover:underline">
                إنشاء ميزانية
              </button>
            </div>
          ) : (
            budgets.slice(0, 4).map(b => {
              const spent = parseFloat(b.spent_amount || '0');
              const total = parseFloat(b.monthly_limit);
              const pct = total > 0 ? ((spent*-1)/ total) * 100 : 0;
              const barColor = pct > 80 ? 'bg-budget-red' : pct > 60 ? 'bg-budget-yellow' : 'bg-budget-green';
              return (
                <div key={b.id} className="mb-3 rounded-xl bg-bg-card p-4 shadow-sm lg:p-5">
                  <div className="mb-2 flex justify-between">
                    <span className="font-cairo text-sm font-medium text-text-primary">{b.icon ?? '📁'} {b.category_name}</span>
                    <span className="font-manrope text-xs font-medium text-text-secondary">
                      {spent.toLocaleString('en')} / {total.toLocaleString('en')}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border-light">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-cairo text-lg font-bold text-text-primary lg:text-xl">آخر المعاملات</h3>
            <button onClick={() => router.push('/transactions')} className="font-cairo text-sm font-medium text-primary hover:underline">
              عرض الكل
            </button>
          </div>
          {transactions.length === 0 ? (
            <div className="rounded-2xl bg-bg-card p-8 text-center shadow-sm">
              <p className="font-cairo text-sm text-text-secondary">لا توجد معاملات بعد</p>
            </div>
          ) : (
            transactions.map(tx => (
              <button
                key={tx.id}
                onClick={() => router.push(`/transactions/${tx.id}`)}
                className="mb-3 flex w-full items-center justify-between rounded-xl bg-bg-card p-4 text-right shadow-sm transition-colors hover:bg-border-light lg:p-5"
              >
                <div className="flex items-center">
                  <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-category-bg lg:h-12 lg:w-12">
                    <span className="text-xl lg:text-2xl">{getTypeEmoji(tx.type)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-cairo text-sm font-medium text-text-primary">{getTypeLabel(tx.type)}</span>
                      {tx.is_ai && <span className="rounded bg-primary-surface px-1.5 py-px font-manrope text-[10px] font-bold text-primary">AI</span>}
                    </div>
                    <p className="max-w-[250px] truncate font-cairo text-xs text-text-secondary">
                      {tx.description || tx.category_name || '—'}
                    </p>
                  </div>
                </div>
                <span className={`font-manrope text-base font-bold ${isPositive(tx.type) ? 'text-success' : 'text-error'}`}>
                  {isPositive(tx.type) ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en')}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
