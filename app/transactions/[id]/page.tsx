'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getTransactionById } from '@/lib/api';
import Spinner from '@/components/Spinner';

export default function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const res = await getTransactionById(id); setTx(res.data.transaction ?? res.data); }
      catch {} finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-bg-light"><Spinner /></div>;
  if (!tx) return <div className="flex min-h-screen items-center justify-center bg-bg-light"><p className="font-cairo text-sm text-text-secondary">المعاملة غير موجودة</p></div>;

  const isPos = tx.type === 'deposit' || tx.type === 'transfer_received';

  return (
    <div className="min-h-screen bg-bg-light mx-auto max-w-2xl px-4 sm:px-6 lg:px-10 pt-8 lg:pt-10">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-2xl text-text-primary">→</button>
        <h1 className="font-cairo text-xl font-bold text-text-primary">تفاصيل المعاملة</h1>
        <div className="w-6" />
      </div>
      <div className="mb-6 text-center">
        <p className={`font-manrope text-4xl font-bold ${isPos ? 'text-success' : 'text-error'}`}>
          {isPos ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en')} ج.م
        </p>
      </div>
      <div className="mb-8 rounded-2xl bg-bg-card p-6 shadow-md">
        {[
          ['النوع', tx.type],
          ['الوصف', tx.description || '—'],
          ['الفئة', tx.category_name || '—'],
          ['رقم العملية', `#${tx.id}`],
          ['التاريخ', new Date(tx.created_at).toLocaleDateString('ar-EG')],
          ['الوقت', new Date(tx.created_at).toLocaleTimeString('ar-EG')],
        ].map(([label, value], i, arr) => (
          <div key={label}>
            <div className="flex justify-between py-2">
              <span className="font-cairo text-sm text-text-secondary">{label}</span>
              <span className="max-w-[60%] text-left font-cairo text-sm font-medium text-text-primary">{value}</span>
            </div>
            {i < arr.length - 1 && <div className="h-px bg-divider" />}
          </div>
        ))}
      </div>
      <button onClick={() => router.back()}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white transition-colors hover:bg-green-700">
        رجوع
      </button>
    </div>
  );
}
