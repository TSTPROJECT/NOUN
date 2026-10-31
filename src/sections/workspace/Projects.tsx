import { useEffect, useRef, useState } from 'react';
import { FlaskConical, GitBranch, Loader2 } from 'lucide-react';
import { Window } from '../../components/ui';
import { useToast } from '../../components/Toasts';

interface Project {
  name: string;
  branch: string;
  progress: number;
  state: string;
}

const INITIAL: Project[] = [
  { name: 'company-portal', branch: 'feat/dashboard-v2', progress: 82, state: 'in review' },
  { name: 'stats-engine', branch: 'fix/rounding-error', progress: 64, state: 'debugging' },
  { name: 'uptime-watch', branch: 'main', progress: 100, state: 'deployed' },
  { name: 'bug #4096', branch: 'hotfix/cannot-reproduce', progress: 23, state: 'investigating' },
];

const TOTAL_TESTS = 48;

export function Projects({ onBugFixed }: { onBugFixed: () => void }) {
  const notify = useToast();
  const [projects, setProjects] = useState(INITIAL);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const timer = useRef<number>();

  useEffect(() => () => window.clearInterval(timer.current), []);

  const runTests = () => {
    if (running) return;
    setRunning(true);
    setDone(0);
    let n = 0;
    timer.current = window.setInterval(() => {
      n += 3;
      setDone(Math.min(n, TOTAL_TESTS));
      if (n >= TOTAL_TESTS) {
        window.clearInterval(timer.current);
        setRunning(false);
        setProjects((ps) =>
          ps.map((p) =>
            p.state === 'debugging' || p.state === 'investigating'
              ? { ...p, progress: Math.min(100, p.progress + 12), state: p.progress + 12 >= 100 ? 'ready to ship' : p.state }
              : p,
          ),
        );
        onBugFixed();
        notify('Test suite finished', `${TOTAL_TESTS - 1} passed, 1 skipped (works on my machine).`, 'success');
      }
    }, 70);
  };

  return (
    <Window
      title="projects/status"
      icon={<GitBranch size={14} />}
      className="proj"
      actions={
        <button type="button" className="btn btn--small" onClick={runTests} disabled={running} aria-busy={running}>
          {running ? <Loader2 size={13} className="spin" aria-hidden="true" /> : <FlaskConical size={13} aria-hidden="true" />}
          {running ? `${done}/${TOTAL_TESTS}` : 'Run tests'}
        </button>
      }
    >
      <ul className="proj__list">
        {projects.map((p) => (
          <li key={p.name}>
            <div className="proj__row">
              <strong className="mono">{p.name}</strong>
              <span className={`proj__state mono ${p.progress >= 100 ? 'is-done' : ''}`}>{p.state}</span>
            </div>
            <div className="proj__branch mono">
              <GitBranch size={11} aria-hidden="true" /> {p.branch}
            </div>
            <div className="meter" role="progressbar" aria-label={`${p.name} progress`} aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ transform: `scaleX(${p.progress / 100})` }} />
            </div>
          </li>
        ))}
      </ul>
      {running && (
        <div className="proj__tests mono" aria-live="polite">
          running tests… {done}/{TOTAL_TESTS}
        </div>
      )}
      <p className="ws-foot mono">// fictional projects</p>
    </Window>
  );
}
