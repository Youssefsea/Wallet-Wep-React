'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalTransactions } from '@/lib/api';
import Spinner from '@/components/Spinner';

const FILTERS = [
  { key: '', label: 'الكل' },
  { key: 'deposit', label: 'إيداع' },
  { key: 'manual_expense', label: 'مصروف يدوي' },
  { key: 'manual_income', label: 'دخل يدوي' },
  { key: 'ai_expense', label: 'مصروف AI' },
  { key: 'ai_income', label: 'دخل AI' },
];

interface Transaction { id: number; type: string; amount: string; description: string; category_name?: string; created_at: string; is_ai?: boolean; }

const getTypeEmoji = (type: string) => {
  switch (type) { case 'deposit': return '💰'; case 'manual_expense': return '🧾'; case 'manual_income': return '💵'; case 'ai_expense': case 'ai_income': return '🤖'; default: return '💳'; }
};
const getTypeLabel = (type: string) => {
  switch (type) { case 'deposit': return 'إيداع'; case 'manual_expense': return 'مصروف يدوي'; case 'manual_income': return 'دخل يدوي'; case 'ai_expense': return 'مصروف AI'; case 'ai_income': return 'دخل AI'; default: return type; }
};
const isPositive = (type: string) => type === 'deposit' || type === 'manual_income' || type === 'ai_income';
const getDateGroup = (dateStr: string) => {
  const d = new Date(dateStr); const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'اليوم'; if (diffDays === 1) return 'أمبارح';
  return d.toLocaleDateString('ar-EG');
};

export default function LocalTransactionHistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchTransactions = useCallback(async (pg = 1, append = false) => {
    try {
      const res = await getLocalTransactions(pg, 20, filter || undefined);
      const list: Transaction[] = res.data.transactions ?? [];
      if (append) setTransactions(prev => [...prev, ...list]);
      else setTransactions(list);
      setHasMore(list.length === 20);
    } catch {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { setLoading(true); setPage(1); fetchTransactions(1); }, [fetchTransactions]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1; setPage(next); fetchTransactions(next, true);
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, fetchTransactions]);

  return (
    <div className="min-h-screen bg-bg-light mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 pt-8 lg:pt-10">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-2xl text-text-primary">→</button>
        <h1 className="font-cairo text-xl font-bold text-text-primary">سجل المحفظة المحلية</h1>
        <div className="w-6" />
      </div>
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 font-cairo text-xs font-medium ${filter === f.key ? 'border-primary bg-primary-surface text-primary' : 'border-border bg-bg-card text-text-secondary'}`}>
            {f.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center pt-10"><Spinner /></div>
      ) : transactions.length === 0 ? (
        <p className="py-12 text-center font-cairo text-sm text-text-secondary">لا توجد معاملات</p>
      ) : (
        <div className="pb-24">
          {transactions.map(tx => (
            <button key={tx.id} onClick={() => router.push(`/local-transactions/${tx.id}`)}
              className="mb-2 flex w-full items-center justify-between rounded-xl bg-bg-card p-4 text-right shadow-sm transition-colors hover:bg-border-light">
              <div className="flex items-center">
                <div className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-category-bg">
                  <span className="text-xl">{getTypeEmoji(tx.type)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-cairo text-sm font-medium text-text-primary">{getTypeLabel(tx.type)}</span>
                    {tx.is_ai && <span className="rounded bg-primary-surface px-1.5 py-px font-manrope text-[10px] font-bold text-primary">AI</span>}
                  </div>
                  <p className="max-w-[180px] truncate font-cairo text-xs text-text-secondary">{tx.description || tx.category_name || '—'}</p>
                  <p className="mt-0.5 font-cairo text-[10px] text-text-light">{getDateGroup(tx.created_at)}</p>
                </div>
              </div>
              <span className={`font-manrope text-base font-bold ${isPositive(tx.type) ? 'text-success' : 'text-error'}`}>
                {isPositive(tx.type) ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en')}
              </span>
            </button>
          ))}
          <div ref={loaderRef} className="py-4 text-center">{hasMore && <Spinner />}</div>
        </div>
      )}
    </div>
  );
}
