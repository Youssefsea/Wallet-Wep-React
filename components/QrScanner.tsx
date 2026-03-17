'use client';
import { useEffect, useRef, useState } from 'react';

interface QrScannerProps {
  onResult: (decodedText: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

const SCANNER_ID = 'qr-reader';

export default function QrScanner({ onResult, onError, onClose }: QrScannerProps) {
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const scannedRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    scannedRef.current = false;
    return () => { mountedRef.current = false; };
  }, []);

  // Wait for the DOM element to exist before starting
  useEffect(() => {
    const el = document.getElementById(SCANNER_ID);
    if (el) {
      setReady(true);
    } else {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;

    let scanner: any = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mountedRef.current) return;

        scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            if (!mountedRef.current || scannedRef.current) return;
            scannedRef.current = true;

            scanner.stop().then(() => {
              scannerRef.current = null;
              if (mountedRef.current) {
                onResult(decodedText);
              }
            }).catch(() => {
              scannerRef.current = null;
              if (mountedRef.current) {
                onResult(decodedText);
              }
            });
          },
          () => {}
        );
      } catch {
        if (mountedRef.current && onError) {
          onError('لا يمكن الوصول للكاميرا. تأكد من منح الإذن.');
        }
      }
    };

    startScanner();

    return () => {
      if (scanner) {
        try {
          const state = scanner.getState?.();
          // State 2 = SCANNING, 3 = PAUSED
          if (state === 2 || state === 3) {
            scanner.stop().catch(() => {});
          }
        } catch {
          try { scanner.stop().catch(() => {}); } catch {}
        }
        scannerRef.current = null;
      }
    };
  }, [ready, onResult, onError]);

  const handleClose = () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        const state = scanner.getState?.();
        if (state === 2 || state === 3) {
          scanner.stop().catch(() => {});
        }
      } catch {
        try { scanner.stop().catch(() => {}); } catch {}
      }
      scannerRef.current = null;
    }
    onClose();
  };

  return (
    <div className="rounded-2xl bg-bg-card p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-cairo text-sm font-medium text-text-primary">مسح كود QR</p>
        <button
          onClick={handleClose}
          className="font-cairo text-sm font-medium text-error transition-opacity hover:opacity-60"
        >
          إغلاق
        </button>
      </div>
      <div id={SCANNER_ID} className="overflow-hidden rounded-xl" style={{ minHeight: 250 }} />
    </div>
  );
}
