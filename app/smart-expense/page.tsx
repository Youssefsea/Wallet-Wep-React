/* Smart Expense page - updated for multi-transaction AI response */
/* Backend now returns transactions[] array, new_balance, count */
'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { aiTransaction } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '@/components/Spinner';

interface TxResult {
  id: number;
  amount: string | number;
  type: 'ai_expense' | 'ai_income';
  category: string;
  description: string;
  confidence: number;
  created_at: string;
  duplicate?: boolean;
}

interface ApiResult {
  transactions: TxResult[];
  new_balance: string;
  count: number;
}

/* مثال واحد بسيط + مثال متعدد في نفس الوقت */
const EXAMPLES = [
  'اشتريت قهوة بـ 25 جنيه',
  '300 جنيه فراخ و 150 جنيه عصير',
  'الأكل 80 والنت 150 والجيم 200',
  'مواصلات 45 وسندويتش 30 وفاتورة 120',
];

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍔', transport: '🚗', 'bills & utilities': '💡', entertainment: '🎬',
  health: '💊', shopping: '🛍️', education: '📚', salary: '💵',
  freelance: '💻', gift: '🎁', other: '📦',
};

export default function SmartExpensePage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ApiResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('التسجيل الصوتي غير متاح في هذا المتصفح');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setText(transcript);
      if (event.results[0]?.isFinal) setIsRecording(false);
    };
    recognition.onerror = (event: any) => {
      setIsRecording(false);
      if (event.error !== 'no-speech') setError('حدث خطأ في التعرف على الصوت');
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    setError('');
    setIsRecording(true);
    recognition.start();
  }, [isRecording]);

  const handleAnalyze = async () => {
    if (!text.trim()) { setError('اكتب مصروفك الأول'); return; }
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await aiTransaction(text.trim(), uuidv4());
      /* الرسبونس الجديد: { transactions, new_balance, count } */
      setResult({
        transactions: res.data.transactions ?? [],
        new_balance: res.data.new_balance ?? '0',
        count: res.data.count ?? 0,
      });
      setText('');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'حدث خطأ في التحليل',
      );
    } finally {
      setLoading(false);
    }
  };

  const isPositive = (type: string) => type === 'ai_income';
  const getCatEmoji = (cat: string) =>
    CATEGORY_EMOJI[(cat ?? '').toLowerCase()] ?? '📦';

  /* إجمالي كل الـ transactions في الرسبونس */
  const totalAbsAmount = result
    ? result.transactions.reduce(
        (sum, tx) => sum + Math.abs(parseFloat(String(tx.amount))),
        0,
      )
    : 0;

  return (
    <div className="mx-auto min-h-screen max-w-2xl overflow-y-auto bg-bg-light px-4 pb-6 pt-8 sm:px-6 lg:px-10 lg:pt-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-2xl text-text-primary transition-opacity hover:opacity-60">→</button>
        <h1 className="font-cairo text-xl font-bold text-text-primary">المصروف الذكي</h1>
        <div className="w-6" />
      </div>

      {/* Hero Banner */}
      <div className="mb-5 flex flex-col items-center rounded-2xl bg-primary-surface px-6 py-5 shadow-md">
        <span className="mb-2 text-5xl">🤖</span>
        <h2 className="mb-1 font-cairo text-lg font-bold text-primary">مرحباً! أنا مساعدك المالي</h2>
        <p className="text-center font-cairo text-sm text-text-secondary">
          اكتب مصروف واحد أو أكتر في نفس الوقت وأنا هصنّفهم وأسجّلهم تلقائياً
        </p>
      </div>

      {/* Input */}
      <div className="mb-4 rounded-2xl bg-bg-card p-4 shadow-md">
        <textarea
          className="min-h-[110px] w-full resize-none bg-transparent p-2 text-right font-cairo text-base text-text-primary placeholder:text-text-light"
          placeholder={'مثلاً: 300 جنيه فراخ و 150 جنيه عصير وموصلات 50'}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          onClick={toggleRecording}
          className={`mt-1 flex w-full items-center justify-center gap-2 border-t border-border-light py-2 ${isRecording ? 'rounded-lg bg-error-light' : ''}`}
        >
          <span className="text-[22px]">{isRecording ? '⏹' : '🎤'}</span>
          <span className={`font-cairo text-xs font-medium ${isRecording ? 'text-error' : 'text-text-secondary'}`}>
            {isRecording ? 'جاري التسجيل... اضغط للإيقاف' : 'تسجيل صوتي'}
          </span>
        </button>
      </div>

      {/* Example Chips */}
      <p className="mb-2 font-cairo text-xs font-medium text-text-secondary">جرّب مثلاً:</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => setText(ex)}
            className="rounded-full border border-border bg-bg-card px-3 py-1.5 font-cairo text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Error */}
      {!!error && (
        <div className="mb-4 rounded-lg border border-error-border bg-error-light p-3">
          <p className="text-right font-cairo text-sm font-medium text-error">⚠ {error}</p>
        </div>
      )}

      {/* Results - multi-transaction */}
      {result && result.transactions.length > 0 && (
        <div className="mb-5">
          {/* Summary header */}
          <div className="mb-3 flex items-center justify-between rounded-xl bg-success-light px-4 py-3">
            <span className="font-cairo text-sm font-bold text-success">
              ✅ تم تسجيل {result.count} معاملة
            </span>
            <div className="text-left">
              <p className="font-manrope text-xs text-text-secondary">الرصيد الجديد</p>
              <p className="font-manrope text-base font-bold text-primary">
                {parseFloat(result.new_balance).toLocaleString('en')} ج.م
              </p>
            </div>
          </div>

          {/* Individual transaction cards */}
          {result.transactions.map((tx, idx) => {
            const absAmount = Math.abs(parseFloat(String(tx.amount)));
            const pos = isPositive(tx.type);
            return (
              <div
                key={tx.id ?? idx}
                className={`mb-2 flex items-center justify-between rounded-xl border p-4 ${
                  tx.duplicate
                    ? 'border-warning/40 bg-warning-light'
                    : 'border-success/30 bg-bg-card shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Category emoji */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-surface text-xl">
                    {getCatEmoji(tx.category)}
                  </div>
                  <div>
                    <p className="font-cairo text-sm font-medium text-text-primary">
                      {tx.description || tx.category || '—'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="rounded bg-border-light px-1.5 py-px font-cairo text-[10px] text-text-secondary">
                        {tx.category}
                      </span>
                      {tx.duplicate && (
                        <span className="rounded bg-warning/20 px-1.5 py-px font-cairo text-[10px] text-warning">
                          مكرر
                        </span>
                      )}
                      {tx.confidence !== undefined && (
                        <span className="font-manrope text-[10px] text-text-light">
                          {Math.round(tx.confidence * 100)}% ثقة
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`font-manrope text-base font-bold ${pos ? 'text-success' : 'text-error'}`}>
                  {pos ? '+' : '-'}{absAmount.toLocaleString('en')} ج.م
                </span>
              </div>
            );
          })}

          {/* Total row if more than 1 */}
          {result.transactions.length > 1 && (
            <div className="mt-3 flex justify-between rounded-xl bg-primary-surface px-4 py-3">
              <span className="font-cairo text-sm font-bold text-primary">الإجمالي</span>
              <span className="font-manrope text-base font-bold text-primary">
                {totalAbsAmount.toLocaleString('en')} ج.م
              </span>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70"
      >
        {loading ? <Spinner color="white" /> : '🤖 تحليل بالذكاء الاصطناعي'}
      </button>
    </div>
  );
}
