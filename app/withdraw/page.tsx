/* Withdraw page - updated with optional category selector */
/* category_id is sent to backend so withdrawal counts against budget */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { withdrawMain, getCategories } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '@/components/Spinner';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

interface Category { id: number; name: string; icon?: string; }

export default function WithdrawPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data.categories ?? res.data ?? []))
      .catch(() => {});
  }, []);

  const handleWithdraw = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('يرجى إدخال مبلغ صالح'); return; }
    if (num > parseFloat(user?.balance ?? '0')) { setError('الرصيد مش كافي'); return; }
    setError(''); setLoading(true);
    try {
      await withdrawMain(num, uuidv4(), selectedCatId);
      router.back();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'حدث خطأ، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl overflow-y-auto bg-bg-light px-4 pb-6 pt-8 sm:px-6 lg:px-10 lg:pt-10">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-2xl text-text-primary transition-opacity hover:opacity-60">→</button>
        <h1 className="font-cairo text-xl font-bold text-text-primary">سحب</h1>
        <div className="w-6" />
      </div>

      <div className="mb-5 rounded-2xl bg-primary-dark p-6 text-center shadow-md">
        <p className="mb-1 font-cairo text-sm text-white/70">رصيدك الحالي</p>
        <p className="font-manrope text-2xl font-bold text-gold">{parseFloat(user?.balance ?? '0').toLocaleString('en')} ج.م</p>
      </div>

      <div className="mb-5 rounded-2xl bg-bg-card p-6 text-center shadow-md">
        <p className="mb-3 font-cairo text-sm font-medium text-text-secondary">المبلغ</p>
        <input type="number" inputMode="decimal"
          className="mb-2 w-full border-b-2 border-error bg-transparent pb-2 text-center font-manrope text-[40px] font-bold text-text-primary placeholder:text-text-light"
          placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
        <p className="mb-5 font-cairo text-sm font-medium text-text-secondary">ج.م</p>
        <div className="flex justify-center gap-2">
          {QUICK_AMOUNTS.map(q => (
            <button key={q} onClick={() => setAmount(String(q))}
              className={`rounded-full border px-4 py-2 font-manrope text-xs font-medium ${amount === String(q) ? 'border-error bg-error-light text-error' : 'border-border bg-bg-light text-text-secondary'}`}>
              {q.toLocaleString('en')}
            </button>
          ))}
        </div>
      </div>

      {/* Category Selector (optional) */}
      {categories.length > 0 && (
        <div className="mb-5 rounded-2xl bg-bg-card p-5 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-cairo text-sm font-medium text-text-primary">الفئة (اختياري)</p>
            {selectedCatId && (
              <button onClick={() => setSelectedCatId(null)} className="font-cairo text-xs text-text-light transition-colors hover:text-error">
                مسح
              </button>
            )}
          </div>
          <p className="mb-3 font-cairo text-xs text-text-secondary">اختر فئة عشان المبلغ يتحسب من ميزانيتها</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c.id} onClick={() => setSelectedCatId(selectedCatId === c.id ? null : c.id)}
                className={`rounded-full border px-3 py-1.5 font-cairo text-xs font-medium transition-colors ${
                  selectedCatId === c.id
                    ? 'border-primary bg-primary-surface text-primary'
                    : 'border-border bg-bg-light text-text-secondary hover:border-text-light'
                }`}>
                {c.icon ?? '📁'} {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!!error && (
        <div className="mb-4 rounded-lg border border-error-border bg-error-light p-3">
          <p className="text-right font-cairo text-sm font-medium text-error">⚠ {error}</p>
        </div>
      )}

      <button onClick={handleWithdraw} disabled={loading}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-error font-cairo text-base font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-70">
        {loading ? <Spinner color="white" /> : 'تأكيد السحب'}
      </button>
    </div>
  );
}
