import { Info, Mail, Send, Globe, Building2 } from 'lucide-react';

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
  const channelLower = channel.toLowerCase();
  const ChannelIcon = channelLower.includes('mail') || channelLower === 'email' ? Mail : Send;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-5 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h2>
          <div className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-500/20 uppercase tracking-wider">
            <ChannelIcon size={11} />
            <span>{channel}</span>
          </div>
        </div>

        {/* Recipient + Regulator (stacks naturally; no cramped 2-col on narrow widths) */}
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <Building2 size={11} /> Recipient
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug">
              {recipient}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <Globe size={11} /> Regulator
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug">
              {regulator.name}
            </p>
            <div className="space-y-0.5 pt-0.5">
              <p className="text-xs text-slate-600 dark:text-slate-400 break-words">
                {regulator.contact}
              </p>
              {regulator.country && (
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {regulator.country}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filing Instructions */}
        {regulator.filing_instructions && (
          <div className="flex gap-3 bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Filing Instructions
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200/90 leading-relaxed">
                {regulator.filing_instructions}
              </p>
            </div>
          </div>
        )}

        {/* Letter Content */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Letter Preview
          </p>
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-[#fdfcf7] dark:bg-[#1a1a1a]">
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar p-5 sm:p-6">
              <div className="font-serif text-[13px] sm:text-sm text-slate-800 dark:text-slate-200 leading-[1.7] whitespace-pre-wrap">
                {letter}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#fdfcf7] dark:from-[#1a1a1a] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
