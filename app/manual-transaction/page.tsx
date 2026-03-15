'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { manualTransaction, getCategories } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '@/components/Spinner';

interface Category { id: number; name: string; type: string; icon?: string; }

export default function ManualTransactionPage() {
  const router = useRouter();
  const [type] = useState<'manual_expense'>('manual_expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try { const res = await getCategories(); setCategories(res.data.categories ?? res.data ?? []); }
      catch {} finally { setCatLoading(false); }
    })();
  }, []);

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('يرجى إدخال مبلغ صالح'); return; }
    if (num > 100000) { setError('الحد الأقصى 100,000 ج.م'); return; }
    if (!selectedCatId) { setError('يرجى اختيار فئة'); return; }
    setError(''); setSuccess(null); setLoading(true);
    try {
      const res = await manualTransaction(type, num, selectedCatId, uuidv4(), description.trim() || undefined);
      setSuccess(res.data.transaction);
      setAmount(''); setDescription(''); setSelectedCatId(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'حدث خطأ، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-bg-light mx-auto max-w-2xl px-4 sm:px-6 lg:px-10 pt-8 lg:pt-10 pb-6">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-2xl text-text-primary">→</button>
        <h1 className="font-cairo text-xl font-bold text-text-primary">معاملة يدوية</h1>
        <div className="w-6" />
      </div>

      <div className="mb-5">
        <button className="flex-1 items-center rounded-xl border border-error bg-error-light px-4 py-3 text-center font-cairo text-sm font-bold text-text-primary">
          🧾 مصروف
        </button>
      </div>

      <div className="mb-5 rounded-2xl bg-bg-card p-6 text-center shadow-md">
        <p className="mb-3 font-cairo text-sm font-medium text-text-secondary">المبلغ</p>
        <input type="number" inputMode="decimal"
          className="mb-2 w-full border-b-2 border-primary bg-transparent pb-2 text-center font-manrope text-[40px] font-bold text-text-primary placeholder:text-text-light"
          placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
        <p className="font-cairo text-sm font-medium text-text-secondary">ج.م</p>
      </div>

      <p className="mb-2 text-right font-cairo text-sm font-medium text-text-primary">الفئة</p>
      {catLoading ? (
        <div className="mb-5 flex justify-center py-3"><Spinner /></div>
      ) : (
        <div className="mb-5 flex flex-wrap gap-2 overflow-x-auto">
          {categories.map(c => (
            <button key={c.id} onClick={() => setSelectedCatId(c.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-cairo text-xs font-medium ${selectedCatId === c.id ? 'border-primary bg-primary-surface text-primary' : 'border-border bg-bg-card text-text-secondary'}`}>
              {c.icon ?? '📁'} {c.name}
            </button>
          ))}
        </div>
      )}

      <p className="mb-2 text-right font-cairo text-sm font-medium text-text-primary">الوصف (اختياري)</p>
      <input className="mb-5 h-[52px] w-full rounded-xl border border-border bg-bg-card px-3 text-right font-cairo text-sm text-text-primary placeholder:text-text-light"
        placeholder="مثلاً: فاتورة الكهرباء" value={description} onChange={e => setDescription(e.target.value)} />

      {!!error && (
        <div className="mb-5 rounded-xl bg-error-light p-4 text-center">
          <p className="font-cairo text-xs font-medium text-error">⚠ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-2xl bg-success-light p-6 shadow-sm">
          <p className="mb-3 text-center font-cairo text-base font-bold text-success">✅ تم تسجيل المعاملة</p>
          {[
            ['المبلغ', `${Math.abs(parseFloat(success.amount ?? 0)).toLocaleString('en')} ج.م`],
            ['النوع', success.type === 'manual_expense' ? 'مصروف' : 'دخل'],
            ['الفئة', success.category ?? '—'],
            ['الرصيد الجديد', `${parseFloat(success.new_balance ?? 0).toLocaleString('en')} ج.م`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-1">
              <span className="font-cairo text-sm text-text-secondary">{label}</span>
              <span className="font-cairo text-sm font-medium text-text-primary">{value}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-lg font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70">
        {loading ? <Spinner color="white" /> : 'تسجيل مصروف'}
      </button>
    </div>
  );
}
