'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import { sendOTP } from '@/lib/api';

export default function SignUpPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validate = (): string | null => {
    if (!name.trim()) return 'يرجى إدخال الاسم';
    if (!email.trim()) return 'يرجى إدخال البريد الإلكتروني';
    if (password.length < 8) return 'كلمة المرور لازم تكون 8 أحرف على الأقل';
    if (password !== confirmPassword) return 'كلمة المرور مش متطابقة';
    return null;
  };

  const handleSendOTP = async () => {
    const msg = validate();
    if (msg) { setError(msg); return; }
    setError(''); setLoading(true);
    try {
      await sendOTP(email.trim());
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'فشل إرسال الرمز، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSignUp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) { setError('يرجى إدخال رمز التحقق كاملاً'); return; }
    setError(''); setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password, otpCode);
      router.replace('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'حدث خطأ، حاول مرة أخرى');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-light px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => step === 2 ? (setStep(1), setOtp(['', '', '', '', '', ''])) : router.back()}
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-bg-card transition-colors hover:bg-border-light"
        >
          <span className="text-xl text-text-primary">→</span>
        </button>

        <div className="mb-6">
          <h1 className="mb-1 font-cairo text-[28px] font-bold text-text-primary">
            {step === 1 ? 'إنشاء حساب' : 'تأكيد البريد الإلكتروني'}
          </h1>
          <p className="font-cairo text-sm text-text-secondary">
            {step === 1 ? 'سجّل حسابك وابدأ تتابع فلوسك بذكاء' : `أدخل الرمز المُرسل إلى ${email}`}
          </p>
        </div>

        {!!error && (
          <div className="mb-4 rounded-lg border border-error-border bg-error-light p-3">
            <p className="text-right font-cairo text-sm font-medium text-error">⚠ {error}</p>
          </div>
        )}

        <div className="mb-6 rounded-2xl bg-bg-card p-6 shadow-md">
          {step === 1 ? (
            <>
              <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">الاسم الكامل</label>
              <div className="mb-4 flex h-[52px] items-center rounded-xl border border-border bg-bg-light px-3">
                <span className="ml-2 text-lg">👤</span>
                <input
                  className="flex-1 bg-transparent font-cairo text-sm text-text-primary placeholder:text-text-light"
                  placeholder="محمد أحمد"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">البريد الإلكتروني</label>
              <div className="mb-4 flex h-[52px] items-center rounded-xl border border-border bg-bg-light px-3">
                <span className="ml-2 text-lg">📧</span>
                <input
                  type="email"
                  dir="ltr"
                  className="flex-1 bg-transparent font-cairo text-sm text-text-primary placeholder:text-text-light"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

            

              <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">كلمة المرور</label>
              <div className="mb-4 flex h-[52px] items-center rounded-xl border border-border bg-bg-light px-3">
                <span className="ml-2 text-lg">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="flex-1 bg-transparent font-cairo text-sm text-text-primary placeholder:text-text-light"
                  placeholder="8 أحرف على الأقل"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button onClick={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>

              <label className="mb-2 block text-right font-cairo text-sm font-medium text-text-primary">تأكيد كلمة المرور</label>
              <div className="mb-4 flex h-[52px] items-center rounded-xl border border-border bg-bg-light px-3">
                <span className="ml-2 text-lg">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="flex-1 bg-transparent font-cairo text-sm text-text-primary placeholder:text-text-light"
                  placeholder="أعد كتابة كلمة المرور"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="mt-2 flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70"
              >
                {loading ? <Spinner color="white" /> : 'إرسال رمز التحقق 📨'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-3xl">📧</span>
                </div>
                <p className="font-cairo text-sm text-text-secondary">
                  تحقق من بريدك وأدخل الرمز المكون من 6 أرقام
                </p>
              </div>

              <div dir="ltr" className="mb-6 flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="h-[52px] w-[44px] rounded-xl border border-border bg-bg-light text-center font-cairo text-xl font-bold text-text-primary transition-colors focus:border-primary focus:outline-none"
                  />
                ))}
              </div>

              <button
                onClick={handleSignUp}
                disabled={loading}
                className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70"
              >
                {loading ? <Spinner color="white" /> : 'تأكيد وإنشاء الحساب ✓'}
              </button>

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="mt-3 w-full font-cairo text-sm text-text-secondary underline"
              >
                إعادة إرسال الرمز
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-1">
          <span className="font-cairo text-sm text-text-secondary">عندك حساب؟</span>
          <Link href="/login" className="font-cairo text-sm font-bold text-primary">سجّل دخولك</Link>
        </div>
      </div>
    </div>
  );
}
