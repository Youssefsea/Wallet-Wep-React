'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getLocalWallets, createLocalWallet, getTransactions, getLocalTransactions } from '@/lib/api';
import Spinner from '@/components/Spinner';

interface LocalWallet { id: number; name: string; balance: string; }
interface Transaction { id: number; type: string; amount: string; description: string; created_at: string; }

export default function WalletsPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'main' | 'local'>('main');
  const [localWallets, setLocalWallets] = useState<LocalWallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [walletRes, txRes, localTxRes] = await Promise.all([
        getLocalWallets(),
        getTransactions(1, 5),
        getLocalTransactions(1, 5).catch(() => ({ data: { transactions: [] } })),
      ]);
      setLocalWallets(walletRes.data.localWallets ?? walletRes.data ?? []);
      setTransactions(txRes.data.transactions ?? []);
      setLocalTransactions(localTxRes.data.transactions ?? []);
      await refreshProfile();
    } catch {} finally { setLoading(false); }
  }, [refreshProfile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    setCreateLoading(true);
    try { await createLocalWallet(); await fetchData(); } catch {} finally { setCreateLoading(false); }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdraw': return '💸';
      case 'transfer': return '📤';
      case 'manual_expense': return '🧾';
      case 'manual_income': return '💵';
      case 'ai_expense':
      case 'ai_income': return '🤖';
      default: return '💳';
    }
  };
  const isPositive = (type: string) => type === 'deposit' || type === 'manual_income' || type === 'ai_income';

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;

  const tabClass = (t: 'main' | 'local') =>
    'flex-1 cursor-pointer rounded-lg py-2.5 text-center font-cairo text-sm font-medium transition-colors ' +
    (tab === t ? 'bg-bg-card text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary');

  const txAmountClass = (type: string) =>
    'font-manrope text-base font-bold ' + (isPositive(type) ? 'text-success' : 'text-error');

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pt-8 lg:pt-10 pb-6">
      <h1 className="mb-5 font-cairo text-2xl font-bold text-text-primary">المحافظ</h1>
      <div className="mb-6 flex rounded-xl bg-border-light p-1">
        {(['main', 'local'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={tabClass(t)}>
            {t === 'main' ? 'المحفظة الرئيسية' : 'محافظ محلية'}
          </button>
        ))}
      </div>

      {tab === 'main' ? (
        <>
          <div className="mb-6 rounded-[20px] bg-primary-dark p-8 sm:p-10 text-center shadow-lg">
            <p className="mb-2 font-cairo text-sm sm:text-base text-white/70">رصيد المحفظة</p>
            <p className="font-manrope text-4xl sm:text-5xl font-bold text-gold">{parseFloat(user?.balance ?? '0').toLocaleString('en')} ج.م</p>
          </div>
          <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
            {[{ icon: '💰', label: 'إيداع', href: '/deposit' }, { icon: '💸', label: 'سحب', href: '/withdraw' }, { icon: '📤', label: 'تحويل', href: '/transfer' }].map(a => (
              <button key={a.href} onClick={() => router.push(a.href)} className="flex flex-col items-center rounded-xl bg-bg-card p-4 sm:p-5 shadow-sm transition-colors hover:bg-border-light">
                <span className="mb-1 text-[28px] sm:text-[32px]">{a.icon}</span>
                <span className="font-cairo text-xs sm:text-sm font-medium text-text-primary">{a.label}</span>
              </button>
            ))}
          </div>
          <h3 className="mb-3 font-cairo text-lg font-bold text-text-primary">آخر المعاملات</h3>
          {transactions.length === 0 ? (
            <p className="py-12 text-center font-cairo text-sm text-text-secondary">لا توجد معاملات</p>
          ) : transactions.map(tx => (
              <button key={tx.id} onClick={() => router.push('/transactions/' + tx.id)}
                className="mb-2 flex w-full items-center justify-between rounded-xl bg-bg-card p-4 text-right shadow-sm transition-colors hover:bg-border-light">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeEmoji(tx.type)}</span>
                  <span className="flex-1 truncate font-cairo text-sm text-text-primary">{tx.description || tx.type}</span>
                </div>
                <span className={txAmountClass(tx.type)}>
                  {isPositive(tx.type) ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en')}
                </span>
              </button>
            ))
          }
        </>
      ) : (
        <>
          {localWallets.length === 0 ? (
            <>
              <p className="py-12 text-center font-cairo text-sm text-text-secondary">لا توجد محافظ محلية</p>
              <button onClick={handleCreate} disabled={createLoading}
                className="mt-3 w-full rounded-xl border-2 border-dashed border-primary p-5 text-center font-cairo text-base font-bold text-primary transition-colors hover:bg-primary/5 disabled:opacity-70">
                {createLoading ? <Spinner /> : '+ إنشاء محفظة محلية'}
              </button>
            </>
          ) : localWallets.map(w => (
            <div key={w.id}>
              <div className="mb-4 rounded-2xl bg-primary-dark p-6 sm:p-8 shadow-md">
                <p className="mb-1 font-cairo text-base font-bold text-white">💼 {w.name}</p>
                <p className="font-manrope text-2xl sm:text-3xl font-bold text-gold">{parseFloat(w.balance).toLocaleString('en')} ج.م</p>
              </div>
              <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
                {[{ icon: '💰', label: 'إيداع', href: '/local-deposit' }, { icon: '🧾', label: 'معاملة يدوية', href: '/manual-transaction' }, { icon: '🤖', label: 'مصروف ذكي', href: '/smart-expense' }].map(a => (
                  <button key={a.href} onClick={() => router.push(a.href)} className="flex flex-col items-center rounded-xl bg-bg-card p-4 sm:p-5 shadow-sm transition-colors hover:bg-border-light">
                    <span className="mb-1 text-[28px] sm:text-[32px]">{a.icon}</span>
                    <span className="font-cairo text-xs sm:text-sm font-medium text-text-primary">{a.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => router.push('/local-transactions')} className="mb-5 w-full rounded-xl bg-bg-card p-4 text-center font-cairo text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border-light">
                📋 سجل المعاملات المحلية
              </button>
              <h3 className="mb-3 font-cairo text-lg font-bold text-text-primary">آخر المعاملات</h3>
              {localTransactions.length === 0 ? (
                <p className="py-12 text-center font-cairo text-sm text-text-secondary">لا توجد معاملات</p>
              ) : localTransactions.map(tx => (
                  <button key={tx.id} onClick={() => router.push('/local-transactions/' + tx.id)}
                    className="mb-2 flex w-full items-center justify-between rounded-xl bg-bg-card p-4 text-right shadow-sm transition-colors hover:bg-border-light">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTypeEmoji(tx.type)}</span>
                      <span className="flex-1 truncate font-cairo text-sm text-text-primary">{tx.description || tx.type}</span>
                    </div>
                    <span className={txAmountClass(tx.type)}>
                      {isPositive(tx.type) ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en')}
                    </span>
                  </button>
                ))
              }
            </div>
          ))}
        </>
      )}
    </div>
  );
}
