import { useCallback, useEffect, useRef, useState } from 'react';
import { makeDataset, type DayStat } from '../../lib/stats';
import { useInterval } from '../../hooks/hooks';

export type Task = 'DEBUGGING' | 'COFFEE BREAK' | 'SNACK BREAK';
export type CoffeeStatus = 'AVAILABLE' | 'BREWING' | 'EMPTY';
export type SnackStatus = 'PENDING' | 'IN PROGRESS';

export interface Workspace {
  task: Task;
  coffee: CoffeeStatus;
  coffeeLevel: number;
  snack: SnackStatus;
  snacksEaten: number;
  bugsFixed: number;
  seed: number;
  data: DayStat[];
}

export interface WorkspaceActions {
  brewCoffee: () => 'started' | 'busy';
  startSnack: () => 'started' | 'already';
  backToWork: () => 'resumed' | 'already';
  fixBug: () => void;
  resample: () => void;
}

/**
 * All decorative workspace state lives here so the dashboard panels, the
 * terminal and the break buttons stay in sync with each other.
 */
export function useWorkspace(): [Workspace, WorkspaceActions] {
  const [seed, setSeed] = useState(20261031);
  const [ws, setWs] = useState<Omit<Workspace, 'seed' | 'data'>>({
    task: 'DEBUGGING',
    coffee: 'AVAILABLE',
    coffeeLevel: 72,
    snack: 'PENDING',
    snacksEaten: 0,
    bugsFixed: 3,
  });
  const [data, setData] = useState(() => makeDataset(20261031));
  const brewTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(brewTimer.current), []);

  // Coffee slowly drains while he is working.
  useInterval(() => {
    setWs((s) => {
      if (s.task !== 'DEBUGGING' || s.coffee === 'BREWING' || s.coffeeLevel <= 0) return s;
      const coffeeLevel = Math.max(0, s.coffeeLevel - 1);
      return { ...s, coffeeLevel, coffee: coffeeLevel === 0 ? 'EMPTY' : s.coffee };
    });
  }, 6000);

  // Mirror of the latest state so actions can report what they did synchronously.
  const latest = useRef(ws);
  latest.current = ws;

  const brewCoffee = useCallback(() => {
    if (latest.current.coffee === 'BREWING') return 'busy' as const;
    setWs((s) => ({ ...s, coffee: 'BREWING', task: 'COFFEE BREAK', snack: 'PENDING' }));
    latest.current = { ...latest.current, coffee: 'BREWING' };
    window.clearTimeout(brewTimer.current);
    brewTimer.current = window.setTimeout(() => {
      setWs((s) => ({ ...s, coffee: 'AVAILABLE', coffeeLevel: 100 }));
    }, 2600);
    return 'started' as const;
  }, []);

  const startSnack = useCallback(() => {
    if (latest.current.task === 'SNACK BREAK') return 'already' as const;
    setWs((s) => ({ ...s, task: 'SNACK BREAK', snack: 'IN PROGRESS', snacksEaten: s.snacksEaten + 1 }));
    latest.current = { ...latest.current, task: 'SNACK BREAK' };
    return 'started' as const;
  }, []);

  const backToWork = useCallback(() => {
    if (latest.current.task === 'DEBUGGING') return 'already' as const;
    setWs((s) => ({ ...s, task: 'DEBUGGING', snack: 'PENDING' }));
    latest.current = { ...latest.current, task: 'DEBUGGING' };
    return 'resumed' as const;
  }, []);

  const fixBug = useCallback(() => setWs((s) => ({ ...s, bugsFixed: s.bugsFixed + 1 })), []);

  const resample = useCallback(() => {
    const next = Math.floor(Math.random() * 1e9);
    setSeed(next);
    setData(makeDataset(next));
  }, []);

  return [{ ...ws, seed, data }, { brewCoffee, startSnack, backToWork, fixBug, resample }];
}
