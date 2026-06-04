'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const slides = [
  {
    id: '1',
    icon: '👛',
    title: 'تابع فلوسك بسهولة',
    description: 'سجّل مصاريفك ودخلك بسرعة وتابع رصيدك لحظة بلحظة من مكان واحد.',
  },
  {
    id: '2',
    icon: '🤖',
    title: 'الذكاء الاصطناعي يفهمك',
    description: 'اكتب مصروفك بالعربي وخلّي الذكاء الاصطناعي يصنّفه ويسجّله تلقائياً.',
  },
  {
    id: '3',
    icon: '📊',
    title: 'نصايح مالية ذكية',
    description: 'احصل على نصايح مخصصة بناءً على أنماط صرفك وميزانيتك الشهرية.',
  },
];

export default function OnboardingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      localStorage.setItem('onboarded', 'true');
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarded', 'true');
    router.replace('/login');
  };

  const slide = slides[currentIndex];

  return (
    <div className="flex min-h-screen bg-bg-light">

      {/* ── Left panel: feature cards — visible on lg+ ── */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0 flex-col justify-between bg-primary-dark px-10 py-12">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <span className="text-xl">💰</span>
            </div>
            <span className="font-manrope text-lg font-bold text-gold">WealthWise AI</span>
          </div>

          <h2 className="mb-8 font-cairo text-2xl font-bold leading-snug text-white">
            كل اللي تحتاجه
            <br />
            <span className="text-gold">لتنظيم مالياتك</span>
          </h2>

          <div className="flex flex-col gap-4">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(i)}
                className={`flex items-start gap-4 rounded-2xl p-4 text-right transition-all ${
                  i === currentIndex
                    ? 'bg-white/10 ring-1 ring-white/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${
                  i === currentIndex ? 'bg-gold/20' : 'bg-white/10'
                }`}>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <div>
                  <p className={`font-cairo text-sm font-bold ${i === currentIndex ? 'text-white' : 'text-white/60'}`}>
                    {s.title}
                  </p>
                  <p className={`mt-1 font-cairo text-xs leading-5 ${i === currentIndex ? 'text-white/70' : 'text-white/30'}`}>
                    {s.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="font-cairo text-xs text-white/30">© 2025 WealthWise AI</p>
      </aside>

      {/* ── Right panel: active slide + CTA ── */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">

        {currentIndex < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className="absolute top-6 left-6 font-cairo text-sm font-medium text-text-secondary transition-colors hover:text-primary lg:left-8 lg:top-8"
          >
            تخطّي
          </button>
        )}

        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-primary-surface shadow-lg lg:h-40 lg:w-40">
            <span className="text-6xl lg:text-7xl">{slide.icon}</span>
          </div>

          <h2 className="mb-4 font-cairo text-2xl font-bold text-text-primary lg:text-3xl xl:text-4xl">
            {slide.title}
          </h2>
          <p className="mb-10 font-cairo text-base leading-7 text-text-secondary lg:text-lg">
            {slide.description}
          </p>

          <button
            onClick={handleNext}
            className="w-full rounded-xl bg-primary px-6 py-3.5 font-cairo text-base font-bold text-white transition-colors hover:bg-green-700"
          >
            {currentIndex === slides.length - 1 ? 'يلا نبدأ 🚀' : 'التالي'}
          </button>

          {/* Dots — shown on mobile only, desktop uses sidebar */}
          <div className="mt-6 flex items-center justify-center gap-2 lg:hidden">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-text-light'
                }`}
              />
            ))}
          </div>

          {/* Step counter — desktop only */}
          <p className="mt-6 hidden font-cairo text-sm text-text-secondary lg:block">
            {currentIndex + 1} / {slides.length}
          </p>
        </div>
      </main>
    </div>
  );
}