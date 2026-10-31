import { useCallback, useState } from 'react';
import { SectionHead, DigitalClock } from '../components/ui';
import { useWorkspace } from './workspace/state';
import { CodeEditor } from './workspace/CodeEditor';
import { Terminal } from './workspace/Terminal';
import { SystemMonitor } from './workspace/SystemMonitor';
import { Analytics } from './workspace/Analytics';
import { BreakPanel } from './workspace/BreakPanel';
import { Projects } from './workspace/Projects';
import './Workspace.css';

export function Workspace() {
  const [ws, actions] = useWorkspace();
  const [runRequest, setRunRequest] = useState<{ cmd: string; n: number } | null>(null);
  const send = useCallback((cmd: string) => setRunRequest((r) => ({ cmd, n: (r?.n ?? 0) + 1 })), []);

  const status: [string, string, 'ok' | 'warn' | 'calm'][] = [
    ['SYSTEM STATUS', 'OPERATIONAL', 'ok'],
    ['DEVELOPER MODE', ws.task === 'DEBUGGING' ? 'ACTIVE' : 'IDLE', ws.task === 'DEBUGGING' ? 'ok' : 'calm'],
    ['CURRENT TASK', ws.task, ws.task === 'DEBUGGING' ? 'warn' : 'calm'],
    ['COFFEE STATUS', ws.coffee, ws.coffee === 'EMPTY' ? 'warn' : ws.coffee === 'BREWING' ? 'calm' : 'ok'],
    ['SNACK BREAK', ws.snack, ws.snack === 'PENDING' ? 'warn' : 'calm'],
  ];

  return (
    <section id="workspace" className="section ws" aria-labelledby="ws-title">
      <div className="container ws__container">
        <SectionHead index="05" path="~/noun/workstation" title="Personal Workspace" id="ws-title">
          Noun's desk, simulated. Every panel is live: type in the terminal, run the code, resample the data, or send him on a break.
        </SectionHead>

        <div className="ws__desk reveal">
          <div className="ws__statusbar mono" role="status" aria-label="Workspace status">
            <ul>
              {status.map(([k, v, tone]) => (
                <li key={k} className={`ws__pill ws__pill--${tone}`}>
                  <span className="ws__pill-k">{k}</span>
                  <span className="ws__pill-v">{v}</span>
                </li>
              ))}
            </ul>
            <div className="ws__clock">
              <DigitalClock size="m" showDate />
            </div>
          </div>

          <div className="ws__grid">
            <div className="ws__a">
              <CodeEditor onRun={(f) => send(`run ${f}`)} />
            </div>
            <div className="ws__b">
              <Terminal ws={ws} actions={actions} runRequest={runRequest} />
            </div>
            <div className="ws__c">
              <SystemMonitor task={ws.task} />
            </div>
            <div className="ws__d">
              <Analytics data={ws.data} onResample={actions.resample} />
            </div>
            <div className="ws__e">
              <BreakPanel ws={ws} actions={actions} />
            </div>
            <div className="ws__f">
              <Projects onBugFixed={actions.fixBug} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
