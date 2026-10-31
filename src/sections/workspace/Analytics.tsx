import { useMemo, useState } from 'react';
import { BarChart3, Shuffle } from 'lucide-react';
import { Window } from '../../components/ui';
import { fmt, linearFit, mean, median, pearson, stdDev, type DayStat } from '../../lib/stats';
import { useInView } from '../../hooks/hooks';

const W = 420;
const H = 170;
const PAD = { l: 26, r: 8, t: 14, b: 22 };

export function Analytics({ data, onResample }: { data: DayStat[]; onResample: () => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const [ref, seen] = useInView<HTMLDivElement>(0.3);

  const s = useMemo(() => {
    const bugs = data.map((d) => d.bugs);
    const coffee = data.map((d) => d.coffee);
    return {
      bugs,
      coffee,
      mu: mean(bugs),
      sigma: stdDev(bugs),
      med: median(bugs),
      r: pearson(coffee, bugs),
      fit: linearFit(coffee, bugs),
      max: Math.max(...bugs, 1),
      maxCoffee: Math.max(...coffee, 1),
    };
  }, [data]);

  const yMax = Math.ceil((s.max + 2) / 5) * 5;
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const bw = iw / data.length;
  const y = (v: number) => PAD.t + ih - (v / yMax) * ih;

  // Scatter: coffee (x) vs bugs (y)
  const SW = 150;
  const SH = 110;
  const sx = (v: number) => 10 + (v / (s.maxCoffee + 1)) * (SW - 20);
  const sy = (v: number) => SH - 10 - (v / yMax) * (SH - 20);

  return (
    <Window
      title="analytics/bugs_fixed.csv"
      icon={<BarChart3 size={14} />}
      className="ana"
      actions={
        <button type="button" className="btn btn--small" onClick={onResample}>
          <Shuffle size={13} aria-hidden="true" /> Resample
        </button>
      }
    >
      <div className={`ana__wrap ${seen ? 'is-seen' : ''}`} ref={ref}>
        <figure className="ana__chart">
          <figcaption className="ana__cap mono">bugs fixed per day · last 14 days</figcaption>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart of bugs fixed per day. Mean ${fmt(s.mu)}, standard deviation ${fmt(s.sigma)}.`}>
            {/* σ band */}
            <rect x={PAD.l} width={iw} y={y(s.mu + s.sigma)} height={Math.max(0, y(Math.max(0, s.mu - s.sigma)) - y(s.mu + s.sigma))} className="ana__band" />
            {[0, yMax / 2, yMax].map((t) => (
              <g key={t}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="ana__grid" />
                <text x={PAD.l - 6} y={y(t) + 3} className="ana__tick" textAnchor="end">
                  {t}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const x = PAD.l + i * bw + bw * 0.18;
              const bh = PAD.t + ih - y(d.bugs);
              return (
                <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={PAD.l + i * bw} y={PAD.t} width={bw} height={ih} fill="transparent" />
                  <rect
                    x={x}
                    y={y(d.bugs)}
                    width={bw * 0.64}
                    height={bh}
                    rx={2}
                    className={`ana__bar ${hover === i ? 'is-hover' : ''} ${d.bugs > s.mu + s.sigma ? 'is-high' : ''}`}
                    style={{ transitionDelay: `${i * 30}ms` }}
                  />
                  {i % 2 === 0 && (
                    <text x={x + bw * 0.32} y={H - 6} className="ana__tick" textAnchor="middle">
                      {d.day}
                    </text>
                  )}
                </g>
              );
            })}
            <line x1={PAD.l} x2={W - PAD.r} y1={y(s.mu)} y2={y(s.mu)} className="ana__mean" />
            <text x={W - PAD.r} y={y(s.mu) - 4} textAnchor="end" className="ana__mean-label">
              μ {fmt(s.mu, 1)}
            </text>
            {hover !== null && (
              <g className="ana__tip" transform={`translate(${Math.min(W - 92, Math.max(PAD.l, PAD.l + hover * bw - 30))}, ${Math.max(2, y(data[hover].bugs) - 34)})`}>
                <rect width="90" height="28" rx="4" />
                <text x="8" y="12">
                  day {hover + 1} · {data[hover].day}
                </text>
                <text x="8" y="23">
                  {data[hover].bugs} bugs · {data[hover].coffee}☕
                </text>
              </g>
            )}
          </svg>
        </figure>

        <div className="ana__side">
          <dl className="ana__read mono">
            <div>
              <dt>μ mean</dt>
              <dd>{fmt(s.mu)}</dd>
            </div>
            <div>
              <dt>σ std dev</dt>
              <dd>{fmt(s.sigma)}</dd>
            </div>
            <div>
              <dt>median</dt>
              <dd>{fmt(s.med)}</dd>
            </div>
            <div>
              <dt>r(☕, bugs)</dt>
              <dd className="ana__r">{fmt(s.r)}</dd>
            </div>
          </dl>

          <figure className="ana__scatter">
            <svg viewBox={`0 0 ${SW} ${SH}`} role="img" aria-label={`Scatter of coffee cups against bugs fixed, correlation ${fmt(s.r)}`}>
              <line x1={10} x2={SW - 10} y1={SH - 10} y2={SH - 10} className="ana__grid" />
              <line x1={10} x2={10} y1={10} y2={SH - 10} className="ana__grid" />
              <line
                x1={sx(0)}
                y1={sy(Math.max(0, s.fit.intercept))}
                x2={sx(s.maxCoffee + 1)}
                y2={sy(Math.max(0, Math.min(yMax, s.fit.slope * (s.maxCoffee + 1) + s.fit.intercept)))}
                className="ana__fit"
              />
              {data.map((d, i) => (
                <circle key={i} cx={sx(d.coffee) + ((i % 3) - 1) * 2} cy={sy(d.bugs)} r={hover === i ? 4 : 2.6} className={`ana__pt ${hover === i ? 'is-hover' : ''}`} />
              ))}
            </svg>
            <figcaption className="mono">
              ŷ = {fmt(s.fit.slope)}x + {fmt(s.fit.intercept)}
            </figcaption>
          </figure>
        </div>
      </div>
      <p className="ws-foot mono">// fictional sample data · statistics computed live</p>
    </Window>
  );
}
