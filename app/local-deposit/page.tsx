'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { depositLocal } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '@/components/Spinner';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export default function LocalDepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeposit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('يرجى إدخال مبلغ صالح'); return; }
    if (num > 20000) { setError('الحد الأقصى للإيداع 20,000 ج.م'); return; }
    setError(''); setLoading(true);
    try {
      const res = await depositLocal(num, uuidv4());
      const params = new URLSearchParams({
        amount: String(num),
        newBalance: String(res.data.transaction?.new_balance ?? ''),
        transactionId: String(res.data.transaction?.id ?? ''),
      });
      router.replace(`/deposit-success?${params.toString()}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'حدث خطأ، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-bg-light mx-auto max-w-2xl px-4 sm:px-6 lg:px-10 pt-8 lg:pt-10 pb-6">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-2xl text-text-primary">→</button>
        <h1 className="font-cairo text-xl font-bold text-text-primary">إيداع - محفظة محلية</h1>
        <div className="w-6" />
      </div>

      <div className="mb-5 rounded-2xl bg-bg-card p-6 text-center shadow-md">
        <p className="mb-3 font-cairo text-sm font-medium text-text-secondary">المبلغ</p>
        <input type="number" inputMode="decimal"
          className="mb-2 w-full border-b-2 border-primary bg-transparent pb-2 text-center font-manrope text-[40px] font-bold text-text-primary placeholder:text-text-light"
          placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
        <p className="mb-5 font-cairo text-sm font-medium text-text-secondary">ج.م</p>
        <div className="flex justify-center gap-2">
          {QUICK_AMOUNTS.map(q => (
            <button key={q} onClick={() => setAmount(String(q))}
              className={`rounded-full border px-4 py-2 font-manrope text-xs font-semibold ${amount === String(q) ? 'border-primary bg-primary text-white' : 'border-border bg-bg-light text-text-secondary'}`}>
              {q.toLocaleString('en')}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl bg-primary-surface p-4">
        <span className="text-lg">ℹ️</span>
        <p className="flex-1 font-cairo text-xs text-primary">الحد الأقصى للإيداع الواحد 20,000 ج.م</p>
      </div>

      {!!error && (
        <div className="mb-5 rounded-xl bg-error-light p-4 text-center">
          <p className="font-cairo text-xs font-medium text-error">⚠ {error}</p>
        </div>
      )}

      <button onClick={handleDeposit} disabled={loading}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-lg font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70">
        {loading ? <Spinner color="white" /> : 'تأكيد الإيداع'}
      </button>
    </div>
  );
}
