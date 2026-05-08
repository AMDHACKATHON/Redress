import Link from 'next/link';

export function MinimalFooter() {
  return (
    <footer className="py-8 px-6 border-t border-slate-100 dark:border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-500">
          <span className="font-bold text-slate-900 dark:text-white">Redress</span>
          <span>© 2026</span>
          <span className="hidden md:inline">•</span>
          <span>AMD Developer Hackathon</span>
        </div>
        
        <div className="flex items-center space-x-6 text-xs font-medium text-slate-400 dark:text-slate-600">
          <Link href="https://github.com/AMDHACKATHON/Redress" target="_blank" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            GitHub
          </Link>
          <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
