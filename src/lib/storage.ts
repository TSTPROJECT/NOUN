/** Storage can be missing or throw (private mode, blocked site data). Never let it break the page. */
export function readStored<T>(key: string, fallback: T, store: 'local' | 'session' = 'local'): T {
  try {
    const raw = (store === 'local' ? window.localStorage : window.sessionStorage).getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown, store: 'local' | 'session' = 'local') {
  try {
    (store === 'local' ? window.localStorage : window.sessionStorage).setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
