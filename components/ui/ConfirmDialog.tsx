'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';

export type ConfirmVariant = 'default' | 'danger';

export interface ConfirmOptions {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  /** When true, hide the cancel button — the dialog acts as an alert. */
  alert?: boolean;
}

interface DialogState extends ConfirmOptions {
  open: boolean;
  loading: boolean;
}

const initialState: DialogState = {
  open: false,
  loading: false,
  description: '',
};

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  alert: (opts: Omit<ConfirmOptions, 'alert'>) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>(initialState);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    setState((prev) => ({ ...prev, open: false, loading: false }));
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(result);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    // If a previous prompt is still open, resolve it as cancelled before opening a new one
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    setState({ ...initialState, ...opts, open: true });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const alertFn = useCallback(
    async (opts: Omit<ConfirmOptions, 'alert'>) => {
      await confirm({ ...opts, alert: true });
    },
    [confirm]
  );

  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.open, close]);

  const variant: ConfirmVariant = state.variant ?? 'default';
  const isDanger = variant === 'danger';
  const isAlert = state.alert === true;

  const confirmLabel = state.confirmLabel ?? (isAlert ? 'OK' : 'Confirm');
  const cancelLabel = state.cancelLabel ?? 'Cancel';
  const title = state.title ?? (isAlert ? 'Notice' : 'Are you sure?');

  return (
    <ConfirmContext.Provider value={{ confirm, alert: alertFn }}>
      {children}

      {state.open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
            onClick={() => !state.loading && close(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_120ms_ease-out]">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    isDanger
                      ? 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {isDanger ? <AlertTriangle size={20} /> : <Info size={20} />}
                </div>
                <div className="flex-1 space-y-1.5">
                  <h2
                    id="confirm-dialog-title"
                    className="text-base font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h2>
                  <p
                    id="confirm-dialog-description"
                    className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                  >
                    {state.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800">
              {!isAlert && (
                <button
                  type="button"
                  disabled={state.loading}
                  onClick={() => close(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                type="button"
                disabled={state.loading}
                autoFocus
                onClick={() => close(true)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  isDanger
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                }`}
              >
                {state.loading && <Loader2 className="animate-spin" size={16} />}
                {confirmLabel}
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: scale(0.96);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx.confirm;
}

export function useAlert() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useAlert must be used within a ConfirmProvider');
  }
  return ctx.alert;
}
