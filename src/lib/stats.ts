/** Small, real statistics helpers used by the workspace analytics and terminal. */

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);

export function stdDev(xs: number[]) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

export function median(xs: number[]) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function pearson(xs: number[], ys: number[]) {
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  xs.forEach((x, i) => {
    num += (x - mx) * (ys[i] - my);
    dx += (x - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  });
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

/** Least squares fit y = slope·x + intercept. */
export function linearFit(xs: number[], ys: number[]) {
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  xs.forEach((x, i) => {
    num += (x - mx) * (ys[i] - my);
    den += (x - mx) ** 2;
  });
  const slope = den ? num / den : 0;
  return { slope, intercept: my - slope * mx };
}

/** Deterministic PRNG so a "dataset seed" always produces the same sample. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DayStat {
  day: string;
  coffee: number;
  bugs: number;
}

/**
 * A fictional two-week sample: cups of coffee and bugs fixed per day. Bugs
 * loosely depend on coffee, so the correlation is real maths on made-up data.
 */
export function makeDataset(seed: number, days = 14): DayStat[] {
  const rnd = mulberry32(seed);
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return Array.from({ length: days }, (_, i) => {
    const weekend = i % 7 >= 5;
    const coffee = Math.max(0, Math.round((weekend ? 1 : 2) + rnd() * 3));
    const bugs = Math.max(0, Math.round(coffee * 1.8 + (weekend ? 0 : 3) + (rnd() - 0.5) * 5));
    return { day: names[i % 7], coffee, bugs };
  });
}

export const fmt = (n: number, d = 2) => (Number.isInteger(n) ? String(n) : n.toFixed(d));
