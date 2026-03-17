/* Root layout - replaces App.tsx wrapper */
/* Loads Cairo + Manrope fonts, wraps in AuthProvider, sets RTL */
import type { Metadata } from 'next';
import { Cairo, Manrope } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo-var',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope-var',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WealthWise AI - محفظتك الذكية',
  description: 'تابع فلوسك بسهولة مع الذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} ${manrope.variable} font-cairo bg-bg-light text-text-primary antialiased`}>
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
