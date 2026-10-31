/** Decorative source files shown in the workspace editor (and `cat` in the terminal). */

export interface SourceFile {
  name: string;
  lang: string;
  code: string;
}

export const FILES: SourceFile[] = [
  {
    name: 'stats.ts',
    lang: 'TypeScript',
    code: `// stats.ts — quiet numbers, loud insights
export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stdDev(xs: number[]): number {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

// coffee vs. bugs fixed, last 14 days
const r = pearson(log.coffee, log.bugsFixed);
console.log(\`r = \${r.toFixed(2)}\`); // correlation ≠ causation`,
  },
  {
    name: 'debug.ts',
    lang: 'TypeScript',
    code: `// TODO: find out why it works on my machine
async function fixBug(id: number): Promise<Patch> {
  const bug = await tracker.get(id);

  if (!bug.reproducible) {
    await coffee.refill();
    return fixBug(id); // try again, calmly
  }

  const patch = await write(bug, { tests: true });
  return deploy(patch, { day: "weekday" });
}`,
  },
  {
    name: 'break.ts',
    lang: 'TypeScript',
    code: `const SNACK_INTERVAL = 3; // hours

function isSnackTime(now: Date): boolean {
  return now.getHours() % SNACK_INTERVAL === 0;
}

if (isSnackTime(new Date())) {
  noun.status = "busy"; // eating. please wait.
  noun.reply = "(¬_¬) …";
}`,
  },
];

const KEYWORDS = new Set([
  'export', 'function', 'return', 'const', 'let', 'if', 'else', 'async', 'await', 'new', 'import', 'from', 'true', 'false', 'for', 'of',
]);
const TYPES = new Set(['number', 'boolean', 'string', 'Promise', 'Date', 'Patch', 'Math', 'console']);

export type Token = { t: 'kw' | 'type' | 'str' | 'num' | 'com' | 'fn' | 'punc' | 'txt'; v: string };

const TOKEN_RE = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([{}()[\];,.:=<>+\-*/%!?&|]+)|(\s+|.)/gm;

/** Tiny line tokenizer, good enough for the decorative snippets above. */
export function tokenize(line: string): Token[] {
  const out: Token[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line))) {
    const [v, com, str, num, word, punc] = m;
    if (com) out.push({ t: 'com', v });
    else if (str) out.push({ t: 'str', v });
    else if (num) out.push({ t: 'num', v });
    else if (word) {
      if (KEYWORDS.has(word)) out.push({ t: 'kw', v });
      else if (TYPES.has(word)) out.push({ t: 'type', v });
      else if (line[m.index + v.length] === '(') out.push({ t: 'fn', v });
      else out.push({ t: 'txt', v });
    } else if (punc) out.push({ t: 'punc', v });
    else out.push({ t: 'txt', v });
  }
  return out;
}
