import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useSound } from '../audio/SoundContext';
import './Toasts.css';

export type ToastTone = 'info' | 'success' | 'warn';

interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: ToastTone;
}

type Notify = (title: string, body?: string, tone?: ToastTone) => void;

const ToastCtx = createContext<Notify | null>(null);

const ICONS = { info: Info, success: CheckCircle2, warn: AlertTriangle };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const { sfx } = useSound();

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notify = useCallback<Notify>(
    (title, body, tone = 'info') => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { id, title, body, tone }]);
      sfx(tone === 'warn' ? 'error' : 'notify');
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss, sfx],
  );

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div key={t.id} className={`toast toast--${t.tone}`}>
              <Icon size={18} aria-hidden="true" className="toast__icon" />
              <div className="toast__text">
                <strong>{t.title}</strong>
                {t.body && <span>{t.body}</span>}
              </div>
              <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
