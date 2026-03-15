/* Onboarding page - migrated from OnboardingScreen.tsx */
/* Web carousel with step indicators, centered layout */
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-light px-4">
      {/* Skip button */}
      {currentIndex < slides.length - 1 && (
        <button
          onClick={handleSkip}
          className="absolute top-6 left-6 font-cairo text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          تخطّي
        </button>
      )}

      {/* Slide Content */}
      <div className="flex w-full max-w-lg flex-col items-center px-4 text-center">
        <div className="mb-10 flex h-40 w-40 items-center justify-center rounded-full bg-primary-surface lg:h-48 lg:w-48">
          <span className="text-7xl lg:text-8xl">{slide.icon}</span>
        </div>
        <h2 className="mb-4 font-cairo text-2xl font-bold text-text-primary lg:text-3xl">
          {slide.title}
        </h2>
        <p className="mb-10 font-cairo text-base leading-7 text-text-secondary lg:text-lg">
          {slide.description}
        </p>
      </div>

      {/* Dots */}
      <div className="mb-8 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex
                ? 'w-6 bg-primary'
                : 'w-2 bg-border hover:bg-text-light'
            }`}
          />
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        className="w-full max-w-sm rounded-xl bg-primary px-6 py-3.5 font-cairo text-base font-bold text-white transition-colors hover:bg-green-700"
      >
        {currentIndex === slides.length - 1 ? 'يلا نبدأ' : 'التالي'}
      </button>
    </div>
  );
}
