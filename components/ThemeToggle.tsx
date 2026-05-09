'use client';

import { useSyncExternalStore } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === 'dark';

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
    >
      {isDark ? <SunMedium className="w-4 h-4" /> : <MoonStar className="w-4 h-4" />}
    </button>
  );
}
