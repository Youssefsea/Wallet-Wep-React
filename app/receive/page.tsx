'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export default function ReceivePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!user?.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl overflow-y-auto bg-bg-light px-4 pb-6 pt-8 sm:px-6 lg:px-10 lg:pt-10">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-2xl text-text-primary transition-opacity hover:opacity-60">→</button>
        <h1 className="font-cairo text-xl font-bold text-text-primary">استلام</h1>
        <div className="w-6" />
      </div>

      <div className="mb-5 flex flex-col items-center rounded-2xl bg-bg-card p-6 shadow-md">
        <p className="mb-4 font-cairo text-sm font-medium text-text-secondary">
          امسح الكود لتحويل الأموال لهذا الحساب
        </p>

        <div className="mb-4 rounded-2xl border-2 border-primary-surface bg-white p-4">
          <QRCodeSVG
            value={user?.email ?? ''}
            size={200}
            level="M"
            fgColor="#1C5F20"
            bgColor="#FFFFFF"
          />
        </div>

        <p className="mb-3 font-manrope text-base font-medium text-text-primary" dir="ltr">
          {user?.email}
        </p>

        <button onClick={handleCopy}
          className="flex items-center gap-2 rounded-xl border border-border bg-bg-light px-5 py-2.5 font-cairo text-sm font-medium text-text-secondary transition-colors hover:bg-border-light">
          <span className="text-base">{copied ? '✅' : '📋'}</span>
          {copied ? 'تم النسخ' : 'نسخ الإيميل'}
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-primary-surface p-3">
        <span className="text-base">ℹ️</span>
        <p className="flex-1 font-cairo text-xs text-primary">
          شارك الكود مع المُرسل عشان يقدر يحول لك فلوس
        </p>
      </div>
    </div>
  );
}
