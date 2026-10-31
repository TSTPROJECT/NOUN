import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Eraser, TerminalSquare } from 'lucide-react';
import { Window } from '../../components/ui';
import { useSound } from '../../audio/SoundContext';
import { about, identity, preferences } from '../../data/noun';
import { evaluate } from '../../lib/calc';
import { fmt, mean, median, pearson, stdDev } from '../../lib/stats';
import { FILES } from './files';
import type { Workspace, WorkspaceActions } from './state';

type LineKind = 'cmd' | 'out' | 'err' | 'ok' | 'dim' | 'th';
interface Line {
  id: number;
  kind: LineKind;
  text: string;
}

const COMMANDS: [string, string][] = [
  ['help', 'list available commands'],
  ['about', "read Noun's bio"],
  ['profile', 'name, role, preferences & status'],
  ['status', 'current workspace status'],
  ['skills', "what he's good at"],
  ['coffee', 'start a coffee break'],
  ['snack', 'start a snack break'],
  ['work', 'back to work'],
  ['stats', 'statistics of the two-week log'],
  ['calc <expr>', 'evaluate maths, e.g. calc sqrt(2)^2'],
  ['ls / cat <file>', 'list / print editor files'],
  ['run <file>', 'run a file from the editor'],
  ['history', 'show command history'],
  ['clear', 'clear the screen'],
];
const NAMES = ['help', 'about', 'profile', 'status', 'skills', 'coffee', 'snack', 'work', 'stats', 'calc', 'ls', 'cat', 'run', 'history', 'clear', 'whoami', 'date', 'echo', 'hello', 'sudo', 'fix'];

const WELCOME: Omit<Line, 'id'>[] = [
  { kind: 'dim', text: 'NOUN shell 2.0 · fictional terminal, safe to play with' },
  { kind: 'out', text: "Type 'help' to see what you can do. ↑/↓ for history, Tab to complete." },
];

interface Props {
  ws: Workspace;
  actions: WorkspaceActions;
  runRequest: { cmd: string; n: number } | null;
}

export function Terminal({ ws, actions, runRequest }: Props) {
  const nextId = useRef(0);
  const mk = (kind: LineKind, text: string): Line => ({ id: nextId.current++, kind, text });
  const [lines, setLines] = useState<Line[]>(() => WELCOME.map((l) => mk(l.kind, l.text)));
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sfx } = useSound();

  // Keep the newest output in view by scrolling the terminal itself, never the page.
  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const execute = useCallback(
    (raw: string) => {
      const cmdline = raw.trim();
      const out: Line[] = [mk('cmd', cmdline)];
      const say = (kind: LineKind, text: string) => out.push(mk(kind, text));

      if (!cmdline) {
        setLines((l) => [...l, ...out]);
        return;
      }
      setHistory((h) => (h[h.length - 1] === cmdline ? h : [...h, cmdline]));
      const [name, ...rest] = cmdline.split(/\s+/);
      const arg = rest.join(' ');
      let tone: 'enter' | 'error' | 'success' = 'enter';

      switch (name.toLowerCase()) {
        case 'help':
          say('dim', 'available commands:');
          COMMANDS.forEach(([c, d]) => say('out', `  ${c.padEnd(16)} ${d}`));
          break;
        case 'about':
          say('ok', about.heading);
          about.paragraphs.forEach((p) => say('th', p));
          break;
        case 'profile':
          say('out', `name         ${identity.name} (${identity.nameTh})`);
          say('out', `role         ${identity.subtitle}`);
          say('out', `preferences  ${preferences.preferences.join(' / ')}`);
          say('out', `status       ${preferences.status}`);
          say('th', preferences.note);
          break;
        case 'status':
          say('out', 'SYSTEM STATUS   OPERATIONAL');
          say('out', `DEVELOPER MODE  ${ws.task === 'DEBUGGING' ? 'ACTIVE' : 'IDLE'}`);
          say('out', `CURRENT TASK    ${ws.task}`);
          say('out', `COFFEE STATUS   ${ws.coffee} (${ws.coffeeLevel}%)`);
          say('out', `SNACK BREAK     ${ws.snack}`);
          say('dim', `bugs fixed this session: ${ws.bugsFixed} · snacks: ${ws.snacksEaten}`);
          break;
        case 'skills':
          [
            ['web development', 92],
            ['system maintenance', 88],
            ['statistics', 95],
            ['mathematical logic', 97],
            ['debugging (quietly)', 90],
            ['saying no to snack-time requests', 64],
          ].forEach(([s, v]) => {
            const n = Math.round((v as number) / 10);
            say('out', `  ${String(s).padEnd(34)} ${'█'.repeat(n)}${'░'.repeat(10 - n)} ${v}`);
          });
          break;
        case 'coffee': {
          const r = actions.brewCoffee();
          if (r === 'busy') say('dim', 'coffee is already brewing. patience is also a skill.');
          else {
            say('ok', '☕ brewing coffee… ETA 2.6s');
            say('out', 'CURRENT TASK → COFFEE BREAK');
            tone = 'success';
          }
          break;
        }
        case 'snack': {
          const r = actions.startSnack();
          if (r === 'already') say('dim', '(¬_¬) already eating. please wait.');
          else {
            say('ok', '🍪 snack break started.');
            say('dim', 'IT requests received now may be answered with one (1) tired stare.');
            tone = 'success';
          }
          break;
        }
        case 'work':
        case 'back': {
          const r = actions.backToWork();
          say(r === 'already' ? 'dim' : 'ok', r === 'already' ? 'already working. the bugs never left.' : 'back to work. CURRENT TASK → DEBUGGING');
          break;
        }
        case 'fix': {
          actions.fixBug();
          say('ok', `patched bug #${4000 + ws.bugsFixed + 1}. tests passing. (this time.)`);
          tone = 'success';
          break;
        }
        case 'stats': {
          const bugs = ws.data.map((d) => d.bugs);
          const coffee = ws.data.map((d) => d.coffee);
          say('dim', `sample: ${ws.data.length} days · seed ${ws.seed}`);
          say('out', `bugs fixed  μ = ${fmt(mean(bugs))}  σ = ${fmt(stdDev(bugs))}  median = ${fmt(median(bugs))}`);
          say('out', `coffee      μ = ${fmt(mean(coffee))}  σ = ${fmt(stdDev(coffee))}`);
          say('ok', `r(coffee, bugs) = ${fmt(pearson(coffee, bugs))}`);
          say('dim', '// fictional data, real maths');
          break;
        }
        case 'calc':
          try {
            const v = evaluate(arg);
            say('ok', `= ${Number.isFinite(v) ? +v.toPrecision(12) : v}`);
          } catch (e) {
            say('err', `calc: ${(e as Error).message}`);
            tone = 'error';
          }
          break;
        case 'ls':
          say('out', FILES.map((f) => f.name).join('    '));
          break;
        case 'cat': {
          const f = FILES.find((x) => x.name === arg);
          if (!f) {
            say('err', arg ? `cat: ${arg}: no such file` : 'usage: cat <file>');
            tone = 'error';
          } else f.code.split('\n').forEach((l) => say('out', l));
          break;
        }
        case 'run': {
          const f = FILES.find((x) => x.name === arg);
          if (!f) {
            say('err', arg ? `run: ${arg}: no such file` : 'usage: run <file>');
            tone = 'error';
            break;
          }
          say('dim', `$ ts-node ${f.name}`);
          if (f.name === 'stats.ts') {
            const bugs = ws.data.map((d) => d.bugs);
            say('out', `mean(bugs)   = ${fmt(mean(bugs))}`);
            say('out', `stdDev(bugs) = ${fmt(stdDev(bugs))}`);
            say('ok', `r = ${pearson(ws.data.map((d) => d.coffee), bugs).toFixed(2)}`);
          } else if (f.name === 'debug.ts') {
            actions.fixBug();
            say('out', 'bug not reproducible → refilling coffee…');
            say('ok', `retry ok. bug #${4000 + ws.bugsFixed + 1} fixed. deploy scheduled for a weekday.`);
          } else {
            const h = new Date().getHours();
            say('out', h % 3 === 0 ? 'isSnackTime → true. noun.status = "busy"' : `isSnackTime → false (next in ${3 - (h % 3)}h)`);
          }
          tone = 'success';
          break;
        }
        case 'history':
          if (!history.length) say('dim', 'no history yet.');
          history.forEach((h, i) => say('out', `  ${String(i + 1).padStart(3)}  ${h}`));
          break;
        case 'whoami':
          say('out', 'guest. Noun is in the corner of the room, say hi.');
          break;
        case 'hello':
        case 'hi':
        case 'สวัสดี':
          say('ok', 'Noun: oh, hi! (looks up from the screen) need anything?');
          break;
        case 'date':
          say('out', new Date().toString());
          break;
        case 'echo':
          say('out', arg);
          break;
        case 'sudo':
          say('err', 'nice try. this incident will be reported (to the snack drawer).');
          tone = 'error';
          break;
        case 'exit':
          say('dim', "there is no exit. only the next bug. (try 'snack' instead)");
          break;
        case 'clear':
          setLines([]);
          sfx('click');
          return;
        default:
          say('err', `command not found: ${name}`);
          say('dim', "type 'help' for a list of commands.");
          tone = 'error';
      }
      sfx(tone);
      setLines((l) => [...l, ...out].slice(-300));
    },
    [ws, actions, history, sfx],
  );

  // Commands sent from elsewhere on the page (editor Run button, break panel).
  useEffect(() => {
    if (runRequest) execute(runRequest.cmd);
  }, [runRequest]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
      setHistIdx(null);
    } else if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault();
      const i = histIdx === null ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(i);
      setInput(history[i]);
    } else if (e.key === 'ArrowDown') {
      if (histIdx === null) return;
      e.preventDefault();
      const i = histIdx + 1;
      if (i >= history.length) {
        setHistIdx(null);
        setInput('');
      } else {
        setHistIdx(i);
        setInput(history[i]);
      }
    } else if (e.key === 'Tab') {
      const [head, ...rest] = input.split(' ');
      if (rest.length === 0 && head) {
        const match = NAMES.filter((n) => n.startsWith(head.toLowerCase()));
        if (match.length) e.preventDefault();
        if (match.length === 1) setInput(`${match[0]} `);
        else if (match.length > 1) setLines((l) => [...l, mk('dim', match.join('  '))]);
      } else if ((head === 'cat' || head === 'run') && rest.length === 1) {
        const match = FILES.filter((f) => f.name.startsWith(rest[0]));
        if (match.length === 1) {
          e.preventDefault();
          setInput(`${head} ${match[0].name}`);
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key.length === 1) {
      sfx('key');
    }
  };

  return (
    <Window
      title="noun@workstation: ~ — zsh"
      icon={<TerminalSquare size={14} />}
      className="term"
      bodyClassName="term__body"
      actions={
        <button type="button" className="icon-btn term__clear" onClick={() => execute('clear')} aria-label="Clear terminal" title="Clear">
          <Eraser size={15} aria-hidden="true" />
        </button>
      }
    >
      <div
        className="term__out mono"
        ref={outRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onClick={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
        }}
      >
        {lines.map((l) =>
          l.kind === 'cmd' ? (
            <div key={l.id} className="term__line term__line--cmd">
              <span className="term__ps1" aria-hidden="true">
                noun@ws:~$
              </span>{' '}
              {l.text}
            </div>
          ) : (
            <div key={l.id} className={`term__line term__line--${l.kind}`} lang={l.kind === 'th' ? 'th' : undefined}>
              {l.text}
            </div>
          ),
        )}
      </div>
      <div className="term__input mono">
        <label htmlFor="term-input" className="term__ps1">
          noun@ws:~$
        </label>
        <input
          id="term-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          aria-describedby="term-hint"
          placeholder="type 'help'"
        />
      </div>
      <p id="term-hint" className="sr-only">
        Type a command and press Enter. Up and down arrows browse history, Tab completes.
      </p>
      <div className="term__chips">
        {['help', 'about', 'status', 'skills', 'stats', 'coffee', 'snack', 'clear'].map((c) => (
          <button key={c} type="button" className="term__chip mono" onClick={() => execute(c)}>
            {c}
          </button>
        ))}
      </div>
    </Window>
  );
}
