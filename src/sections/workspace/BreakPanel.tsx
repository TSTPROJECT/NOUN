import { useState } from 'react';
import { Coffee, Cookie, Laptop } from 'lucide-react';
import { Window } from '../../components/ui';
import { useToast } from '../../components/Toasts';
import type { Workspace, WorkspaceActions } from './state';

const COFFEE_LINES = [
  'Coffee acquired. Bug count unchanged, morale +12%.',
  'Brewing… caffeine is entering the system.',
  'One more cup. For statistical significance.',
];
const SNACK_LINES = [
  'Snack time. IT requests may now receive one (1) tired stare.',
  'Snack break started. The bugs can wait 10 minutes.',
  'Crunch. Not the deadline kind, the good kind.',
];
const WORK_LINES = ['Back to work. The bug is still there. It missed him.', 'Developer mode: active. Snack: finished (mostly).'];

const pick = (xs: string[], n: number) => xs[n % xs.length];

export function BreakPanel({ ws, actions }: { ws: Workspace; actions: WorkspaceActions }) {
  const notify = useToast();
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Pick a break. Noun has earned one.');

  const say = (title: string, line: string, tone: 'info' | 'success' = 'info') => {
    setMessage(line);
    setCount((c) => c + 1);
    notify(title, line, tone);
  };

  const coffee = () => {
    if (actions.brewCoffee() === 'busy') say('Coffee', 'Already brewing. Patience is also a skill.');
    else say('Coffee break', pick(COFFEE_LINES, count), 'success');
  };
  const snack = () => {
    if (actions.startSnack() === 'already') say('Snack break', '(¬_¬) Still eating. Please wait.');
    else say('Snack time', pick(SNACK_LINES, count), 'success');
  };
  const work = () => {
    if (actions.backToWork() === 'already') say('Already working', 'He never stopped. The bugs never left.');
    else say('Back to work', pick(WORK_LINES, count));
  };

  const level = ws.coffee === 'BREWING' ? 100 : ws.coffeeLevel;

  return (
    <Window title="break.exe" icon={<Coffee size={14} />} className="brk">
      <div className="brk__top">
        <div className={`mug ${ws.coffee === 'BREWING' ? 'is-brewing' : ''}`} aria-hidden="true">
          <span className="mug__steam">
            <i />
            <i />
            <i />
          </span>
          <span className="mug__cup">
            <span className="mug__fill" style={{ transform: `scaleY(${level / 100})` }} />
          </span>
          <span className="mug__handle" />
        </div>
        <dl className="brk__stats mono">
          <div>
            <dt>coffee</dt>
            <dd>
              {ws.coffee === 'BREWING' ? 'brewing…' : `${ws.coffeeLevel}%`}
            </dd>
          </div>
          <div>
            <dt>snacks today</dt>
            <dd>{ws.snacksEaten}</dd>
          </div>
          <div>
            <dt>task</dt>
            <dd>{ws.task.toLowerCase()}</dd>
          </div>
        </dl>
      </div>

      <p className="brk__msg" aria-live="polite">
        {message}
      </p>

      <div className="brk__btns">
        <button type="button" className={`brk__btn ${ws.task === 'COFFEE BREAK' ? 'is-active' : ''}`} onClick={coffee}>
          <Coffee size={22} aria-hidden="true" />
          <span>Coffee break</span>
        </button>
        <button type="button" className={`brk__btn ${ws.task === 'SNACK BREAK' ? 'is-active' : ''}`} onClick={snack}>
          <Cookie size={22} aria-hidden="true" />
          <span>Snack time</span>
        </button>
        <button type="button" className={`brk__btn ${ws.task === 'DEBUGGING' ? 'is-active' : ''}`} onClick={work}>
          <Laptop size={22} aria-hidden="true" />
          <span>Back to work</span>
        </button>
      </div>
    </Window>
  );
}
