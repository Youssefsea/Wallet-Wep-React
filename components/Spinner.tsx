/* Spinner component - replaces React Native ActivityIndicator */
'use client';

export default function Spinner({ className = '', color = 'var(--color-primary)' }: { className?: string; color?: string }) {
  return (
    <div
      className={`inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-current border-t-transparent ${className}`}
      style={{ color }}
      role="status"
      aria-label="loading"
    />
  );
}
