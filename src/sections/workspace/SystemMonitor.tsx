import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { Window } from '../../components/ui';
import { useInterval } from '../../hooks/hooks';
import type { Task } from './state';

const HISTORY = 40;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Random walk toward a target; values are simulated, not read from hardware. */
const drift = (v: number, target: number, jitter: number) => clamp(v + (target - v) * 0.25 + (Math.random() - 0.5) * jitter, 1, 99);

const PROCS = ['code.exe', 'node — dev server', 'stats-engine', 'coffee.service', 'snack.daemon'];

export function SystemMonitor({ task }: { task: Task }) {
  const [cpu, setCpu] = useState<number[]>(() => Array.from({ length: HISTORY }, (_, i) => 40 + Math.sin(i / 3) * 10));
  const [ram, setRam] = useState(58);
  const [net, setNet] = useState(24);
  const [procs, setProcs] = useState([31, 12, 18, 3, 1]);

  const resting = task !== 'DEBUGGING';

  useInterval(() => {
    const target = resting ? 12 : 54;
    setCpu((h) => [...h.slice(1), drift(h[h.length - 1], target, resting ? 6 : 22)]);
    setRam((r) => drift(r, resting ? 46 : 63, 3));
    setNet((n) => drift(n, resting ? 6 : 28, 14));
    setProcs((p) =>
      p.map((v, i) => {
        if (resting) return i === 3 && task === 'COFFEE BREAK' ? drift(v, 30, 6) : i === 4 && task === 'SNACK BREAK' ? drift(v, 34, 6) : drift(v, 2, 2);
        return drift(v, [31, 12, 18, 3, 1][i], 8);
      }),
    );
  }, 1200);

  const current = cpu[cpu.length - 1];
  const w = 240;
  const h = 64;
  const pts = cpu.map((v, i) => `${(i / (HISTORY - 1)) * w},${h - (v / 100) * h}`).join(' ');

  return (
    <Window title="sysmon" icon={<Cpu size={14} />} className="mon" actions={<span className="ws-sim mono">SIMULATED</span>}>
      <div className="mon__cpu">
        <div className="mon__big mono">
          <span>CPU</span>
          <strong>{Math.round(current)}%</strong>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mon__spark" aria-hidden="true">
          <defs>
            <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#65C8ED" stopOpacity="0.35" />
              <stop offset="1" stopColor="#65C8ED" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#spark-fill)" />
          <polyline points={pts} fill="none" stroke="#65C8ED" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <dl className="mon__bars mono">
        {[
          ['RAM', ram, `${((ram / 100) * 32).toFixed(1)} / 32 GB`],
          ['NET', net, `${(net * 0.8).toFixed(1)} MB/s`],
        ].map(([label, v, detail]) => (
          <div key={label as string}>
            <dt>
              {label} <span>{detail}</span>
            </dt>
            <dd>
              <span className="meter">
                <span style={{ transform: `scaleX(${(v as number) / 100})` }} />
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <table className="mon__procs mono">
        <caption className="sr-only">Simulated processes</caption>
        <thead>
          <tr>
            <th scope="col">process</th>
            <th scope="col">cpu</th>
          </tr>
        </thead>
        <tbody>
          {PROCS.map((p, i) => (
            <tr key={p}>
              <td>{p}</td>
              <td>{procs[i].toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ws-foot mono">// decorative values, not real hardware data</p>
    </Window>
  );
}
