'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('يرجى ملء جميع الحقول'); return; }
    setError(''); setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'حدث خطأ، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-light px-4">
      <div className="w-full max-w-md">
      <div className="mb-6">
        <h1 className="mb-1 font-cairo text-[28px] font-bold text-text-primary">تسجيل الدخول</h1>
        <p className="font-cairo text-sm text-text-secondary">أهلاً بيك! سجّل دخولك عشان تكمّل</p>
      </div>

      {!!error && (
        <div className="mb-4 rounded-lg border border-error-border bg-error-light p-3">
          <p className="text-right font-cairo text-sm font-medium text-error">⚠ {error}</p>
        </div>
      )}

      <div className="mb-6 rounded-2xl bg-bg-card p-6 shadow-md">
        <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">البريد الإلكتروني</label>
        <div className="mb-4 flex h-[52px] items-center rounded-xl border border-border bg-bg-light px-3">
          <span className="ml-2 text-lg">📧</span>
          <input type="email" dir="ltr" className="flex-1 bg-transparent font-cairo text-sm text-text-primary placeholder:text-text-light" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">كلمة المرور</label>
        <div className="mb-4 flex h-[52px] items-center rounded-xl border border-border bg-bg-light px-3">
          <span className="ml-2 text-lg">🔒</span>
          <input type={showPassword ? 'text' : 'password'} className="flex-1 bg-transparent font-cairo text-sm text-text-primary placeholder:text-text-light" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={() => setShowPassword(!showPassword)} className="p-1">{showPassword ? '🙈' : '👁'}</button>
        </div>

        <button onClick={handleLogin} disabled={loading} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70">
          {loading ? <Spinner color="white" /> : 'تسجيل الدخول'}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1">
        <span className="font-cairo text-sm text-text-secondary">ما عندكش حساب؟</span>
        <Link href="/signup" className="font-cairo text-sm font-bold text-primary">سجّل دلوقتي</Link>
      </div>
      </div>
    </div>
  );
}
