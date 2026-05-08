'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200 group"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 text-amber-500 absolute transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:rotate-90" />
      <Moon className="h-4 w-4 text-indigo-400 absolute transition-all duration-300 scale-0 -rotate-90 dark:scale-100 dark:rotate-0" />
    </button>
  );
}
