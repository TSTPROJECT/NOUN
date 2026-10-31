import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/storage';
import './Cursor.css';

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], input[type="range"], input[type="checkbox"], label, summary, [data-cursor="hover"]';
const TEXTUAL = 'input:not([type="range"]):not([type="checkbox"]), textarea, [contenteditable="true"]';
const TRAIL = 4;

/**
 * Crosshair cursor for fine pointers only. Touch devices and coarse pointers
 * keep the native cursor, and text fields always show the native caret so the
 * custom cursor never sits on top of what you are typing.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const trail = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-custom-cursor');
    const reduced = prefersReducedMotion();
    const target = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    const trailPos = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));
    let raf = 0;
    let visible = false;

    const setState = (cls: string, on: boolean) => ring.current?.parentElement?.classList.toggle(cls, on);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = target.x;
        ringPos.y = target.y;
        trailPos.forEach((p) => Object.assign(p, target));
        setState('is-visible', true);
      }
      const el = e.target as Element | null;
      setState('is-text', !!el?.closest?.(TEXTUAL));
      setState('is-hover', !!el?.closest?.(INTERACTIVE));
    };
    const onLeave = () => {
      visible = false;
      setState('is-visible', false);
    };
    const onDown = () => setState('is-down', true);
    const onUp = () => setState('is-down', false);

    const loop = () => {
      const k = reduced ? 1 : 0.22;
      ringPos.x += (target.x - ringPos.x) * k;
      ringPos.y += (target.y - ringPos.y) * k;
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      if (!reduced) {
        let prev = target;
        trailPos.forEach((p, i) => {
          p.x += (prev.x - p.x) * 0.35;
          p.y += (prev.y - p.y) * 0.35;
          prev = p;
          const node = trail.current[i];
          if (node) node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="cursor" aria-hidden="true">
      {Array.from({ length: TRAIL }, (_, i) => (
        <span
          key={i}
          className="cursor__trail"
          style={{ opacity: 0.35 - i * 0.07 }}
          ref={(el) => {
            trail.current[i] = el;
          }}
        />
      ))}
      <div className="cursor__ring" ref={ring}>
        <svg viewBox="0 0 32 32" width="32" height="32">
          <circle cx="16" cy="16" r="10" />
          <path d="M16 1v7M16 24v7M1 16h7M24 16h7" />
        </svg>
      </div>
      <div className="cursor__dot" ref={dot} />
    </div>
  );
}
