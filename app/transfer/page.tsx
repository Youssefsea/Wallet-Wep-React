/* Transfer page - with optional category selector */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { transfer, getCategories } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '@/components/Spinner';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false });

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

interface Category { id: number; name: string; icon?: string; }

export default function TransferPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data.categories ?? res.data ?? []))
      .catch(() => {});
  }, []);

  const handleTransfer = async () => {
    if (!receiverEmail.trim()) { setError('يرجى إدخال إيميل المستلم'); return; }
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('يرجى إدخال مبلغ صالح'); return; }
    if (num > parseFloat(user?.balance ?? '0')) { setError('الرصيد مش كافي'); return; }
    setError(''); setLoading(true);
    try {
      const res = await transfer(receiverEmail.trim(), num, uuidv4(), description.trim() || undefined, selectedCatId);
      const params = new URLSearchParams({
        amount: String(num),
        receiverEmail: receiverEmail.trim(),
        transactionId: String(res.data.transfer?.id ?? ''),
        newBalance: String(res.data.transfer?.from?.new_balance ?? ''),
      });
      router.replace(`/transfer-success?${params.toString()}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'حدث خطأ، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl overflow-y-auto bg-bg-light px-4 pb-6 pt-8 sm:px-6 lg:px-10 lg:pt-10">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-2xl text-text-primary transition-opacity hover:opacity-60">→</button>
        <h1 className="font-cairo text-xl font-bold text-text-primary">تحويل</h1>
        <div className="w-6" />
      </div>

      <div className="mb-5 rounded-2xl bg-bg-card p-6 shadow-md">
        <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">إيميل المستلم</label>
        <div className="mb-4 flex h-[52px] items-center rounded-xl border border-border bg-bg-light px-3">
          <span className="ml-2 text-lg">📧</span>
          <input type="email" dir="ltr" className="flex-1 bg-transparent font-cairo text-sm text-text-primary placeholder:text-text-light" placeholder="example@mail.com" value={receiverEmail} onChange={e => setReceiverEmail(e.target.value)} />
          <button
            type="button"
            onClick={() => setShowScanner(prev => !prev)}
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-surface text-primary transition-colors hover:bg-primary hover:text-white"
            title="مسح كود QR"
          >
            <span className="text-lg">📷</span>
          </button>
        </div>

        {showScanner && (
          <div className="mb-4">
            <QrScanner
              onResult={(text) => {
                const trimmed = text.trim();
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                  setReceiverEmail(trimmed);
                  setShowScanner(false);
                } else {
                  setError('الكود لا يحتوي على إيميل صالح');
                  setShowScanner(false);
                }
              }}
              onError={(errMsg) => {
                setError(errMsg);
                setShowScanner(false);
              }}
              onClose={() => setShowScanner(false)}
            />
          </div>
        )}

        <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">المبلغ</label>
        <input type="number" inputMode="decimal"
          className="mb-3 w-full border-b-2 border-primary bg-transparent pb-2 text-center font-manrope text-[28px] font-bold text-text-primary placeholder:text-text-light"
          placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
        <div className="mb-4 flex justify-center gap-2">
          {QUICK_AMOUNTS.map(q => (
            <button key={q} onClick={() => setAmount(String(q))}
              className={`rounded-full border px-4 py-2 font-manrope text-xs font-medium ${amount === String(q) ? 'border-primary bg-primary-surface text-primary' : 'border-border bg-bg-light text-text-secondary'}`}>
              {q.toLocaleString('en')}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">وصف (اختياري)</label>
        <textarea className="min-h-[80px] w-full rounded-xl border border-border bg-bg-light p-3 text-right font-cairo text-sm text-text-primary placeholder:text-text-light" placeholder="مثلاً: إيجار الشهر" value={description} onChange={e => setDescription(e.target.value)} />
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

      <div className="mb-5 flex items-center gap-2 rounded-xl bg-primary-surface p-3">
        <span className="text-base">🔒</span>
        <p className="flex-1 font-cairo text-xs text-primary">التحويل آمن ومشفر وهيتم تنفيذه فوراً</p>
      </div>

      {!!error && (
        <div className="mb-4 rounded-lg border border-error-border bg-error-light p-3">
          <p className="text-right font-cairo text-sm font-medium text-error">⚠ {error}</p>
        </div>
      )}

      <button onClick={handleTransfer} disabled={loading}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70">
        {loading ? <Spinner color="white" /> : 'تحويل'}
      </button>
    </div>
  );
}
