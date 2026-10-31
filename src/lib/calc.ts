/**
 * Safe arithmetic evaluator for the terminal's `calc` command.
 * Recursive-descent parser: no eval, no Function constructor.
 *
 *   expr   := term (('+' | '-') term)*
 *   term   := factor (('*' | '/' | '%') factor)*
 *   factor := unary ('^' factor)?
 *   unary  := ('-' | '+') unary | call
 *   call   := ident '(' expr (',' expr)* ')' | ident | number | '(' expr ')' | call '!'
 */

const FUNCS: Record<string, (...a: number[]) => number> = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  exp: Math.exp,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
};

const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E, phi: (1 + Math.sqrt(5)) / 2, tau: Math.PI * 2 };

function factorial(n: number) {
  if (n < 0 || !Number.isInteger(n)) throw new Error('factorial needs a non-negative integer');
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function evaluate(input: string): number {
  const src = input.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi');
  let i = 0;

  const peek = () => src[i];
  const eat = (c: string) => {
    if (src[i] === c) {
      i++;
      return true;
    }
    return false;
  };

  function expr(): number {
    let v = term();
    for (;;) {
      if (eat('+')) v += term();
      else if (eat('-')) v -= term();
      else return v;
    }
  }

  function term(): number {
    let v = factor();
    for (;;) {
      if (eat('*')) v *= factor();
      else if (eat('/')) v /= factor();
      else if (eat('%')) v %= factor();
      else return v;
    }
  }

  function factor(): number {
    const base = unary();
    if (eat('^')) return base ** factor();
    return base;
  }

  function unary(): number {
    if (eat('-')) return -factor();
    if (eat('+')) return factor();
    let v = primary();
    while (eat('!')) v = factorial(v);
    return v;
  }

  function primary(): number {
    if (eat('(')) {
      const v = expr();
      if (!eat(')')) throw new Error('missing )');
      return v;
    }
    const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(src.slice(i));
    if (num) {
      i += num[0].length;
      return parseFloat(num[0]);
    }
    const id = /^[a-z]+/i.exec(src.slice(i));
    if (id) {
      const name = id[0].toLowerCase();
      i += id[0].length;
      if (FUNCS[name]) {
        if (!eat('(')) throw new Error(`${name} needs (…)`);
        const args = [expr()];
        while (eat(',')) args.push(expr());
        if (!eat(')')) throw new Error('missing )');
        return FUNCS[name](...args);
      }
      if (name in CONSTS) return CONSTS[name];
      throw new Error(`unknown name "${name}"`);
    }
    throw new Error(peek() ? `unexpected "${peek()}"` : 'unexpected end of input');
  }

  if (!src) throw new Error('nothing to calculate');
  const result = expr();
  if (i < src.length) throw new Error(`unexpected "${src[i]}"`);
  return result;
}
