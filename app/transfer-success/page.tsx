'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TransferSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const amount = params.get('amount') ?? '0';
  const receiverEmail = params.get('receiverEmail') ?? '';
  const transactionId = params.get('transactionId');
  const newBalance = params.get('newBalance') ?? '0';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-light px-4">
      <div className="w-full mx-auto max-w-lg">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success-light mx-auto">
        <span className="text-4xl font-bold text-success">✓</span>
      </div>
      <h1 className="mb-2 text-center font-cairo text-2xl font-bold text-text-primary">تم التحويل بنجاح!</h1>
      <p className="mb-6 text-center font-manrope text-4xl font-bold text-primary">
        {parseFloat(amount).toLocaleString('en')} ج.م
      </p>
      <div className="mb-8 w-full rounded-2xl bg-bg-card p-6 shadow-md">
        {[
          ['المبلغ', `${parseFloat(amount).toLocaleString('en')} ج.م`],
          ['إلى', receiverEmail],
          ['رصيدك الجديد', `${parseFloat(newBalance).toLocaleString('en')} ج.م`],
          ...(transactionId ? [['رقم العملية', `#${transactionId}`]] : []),
          ['التاريخ', new Date().toLocaleDateString('ar-EG')],
        ].map(([label, value], i, arr) => (
          <div key={label}>
            <div className="flex justify-between py-2">
              <span className="font-cairo text-sm text-text-secondary">{label}</span>
              <span className="font-cairo text-sm font-medium text-text-primary">{value}</span>
            </div>
            {i < arr.length - 1 && <div className="h-px bg-divider" />}
          </div>
        ))}
      </div>
      <button onClick={() => router.push('/wallets')}
        className="flex h-[52px] w-full items-center justify-center rounded-xl bg-primary font-cairo text-base font-bold text-white transition-colors hover:bg-green-700">
        تم
      </button>
      </div>
    </div>
  );
}

export default function TransferSuccessPage() {
  return <Suspense><TransferSuccessContent /></Suspense>;
}
