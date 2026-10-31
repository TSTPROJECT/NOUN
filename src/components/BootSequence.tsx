import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/storage';
import './BootSequence.css';

const LINES: [string, string][] = [
  ['NOUN BIOS v2.0.26', ''],
  ['checking memory', '16384 MB  ok'],
  ['mounting /home/noun', 'ok'],
  ['loading stats.lib  logic.lib', 'ok'],
  ['brewing coffee.service', 'ok'],
  ['restoring snack cache', '3 items'],
  ['starting developer environment', 'ok'],
];

/**
 * Short (≈2.4 s) boot overlay. Skippable by button, Esc, Enter or Space, and
 * shown only once per browser session.
 */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const skipRef = useRef<HTMLButtonElement>(null);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    window.setTimeout(onDone, prefersReducedMotion() ? 0 : 550);
  }, [onDone]);

  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
    const step = prefersReducedMotion() ? 90 : 260;
    const timers: number[] = [];
    LINES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setShown(i + 1), 150 + i * step));
    });
    const total = 150 + LINES.length * step + 350;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(t) {
      const p = Math.min(1, (t - start) / total);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    timers.push(window.setTimeout(finish, total + 250));
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [finish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finish]);

  return (
    <div className={`boot ${leaving ? 'is-leaving' : ''}`} role="dialog" aria-modal="true" aria-label="System boot">
      <div className="boot__panel">
        <div className="boot__brand mono">
          <span className="boot__mark">N</span>
          NOUN<span>.exe</span>
        </div>
        <ol className="boot__log mono" aria-live="polite">
          {LINES.slice(0, shown).map(([label, status], i) => (
            <li key={label} className={i === 0 ? 'boot__title' : ''}>
              <span>{i === 0 ? label : `> ${label}`}</span>
              {status && (
                <>
                  <span className="boot__dots" aria-hidden="true" />
                  <span className="boot__ok">[{status}]</span>
                </>
              )}
            </li>
          ))}
        </ol>
        <div className="boot__bar" role="progressbar" aria-label="Boot progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className="boot__foot mono">
          <span>{Math.round(progress * 100)}%</span>
          <button type="button" ref={skipRef} className="btn btn--small" onClick={finish}>
            Skip <kbd>Esc</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
