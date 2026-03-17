'use client';
import { useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onResult: (decodedText: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

const SCANNER_ID = 'qr-reader';

export default function QrScanner({ onResult, onError, onClose }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const stableOnResult = useRef(onResult);
  const stableOnError = useRef(onError);
  stableOnResult.current = onResult;
  stableOnError.current = onError;

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (mounted) {
              scanner.stop().catch(() => {});
              stableOnResult.current(decodedText);
            }
          },
          () => {}
        );
      } catch {
        if (mounted && stableOnError.current) {
          stableOnError.current('لا يمكن الوصول للكاميرا. تأكد من منح الإذن.');
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rounded-2xl bg-bg-card p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-cairo text-sm font-medium text-text-primary">مسح كود QR</p>
        <button
          onClick={() => { stopScanner(); onClose(); }}
          className="font-cairo text-sm font-medium text-error transition-opacity hover:opacity-60"
        >
          إغلاق
        </button>
      </div>
      <div id={SCANNER_ID} className="overflow-hidden rounded-xl" />
    </div>
  );
}
