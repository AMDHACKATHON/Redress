import { Info } from 'lucide-react';

interface LetterDisplayProps {
  title: string;
  letter: string;
  recipient: string;
  channel: string;
  regulator: {
    name: string;
    contact: string;
    country?: string;
    filing_instructions?: string;
  };
}

export default function LetterDisplay({
  title,
  letter,
  recipient,
  channel,
  regulator,
}: LetterDisplayProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="flex items-center space-x-2 text-xs font-medium px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full border border-gray-100 dark:border-gray-700">
            <span>via {channel}</span>
          </div>
        </div>

        {/* Regulator Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recipient</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{recipient}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Regulator</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{regulator.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{regulator.contact}</p>
            {regulator.country && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{regulator.country}</p>
            )}
          </div>
        </div>

        {/* Filing Instructions */}
        {regulator.filing_instructions && (
          <div className="flex gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <Info className="text-blue-500 shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Filing Instructions</p>
              <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                {regulator.filing_instructions}
              </p>
            </div>
          </div>
        )}

        {/* Letter Content */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Letter Preview</p>
          <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto p-6 sm:p-8 font-mono text-sm text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {letter}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
