import { useEffect, useState } from 'react';
import { ArrowDown, FolderOpen, TerminalSquare } from 'lucide-react';
import { identity, IMAGE_ALT, IMAGE_HEIGHT, IMAGE_SRC, IMAGE_WIDTH } from '../data/noun';
import { DigitalClock } from '../components/ui';
import { useInterval, pad2 } from '../hooks/hooks';
import { prefersReducedMotion } from '../lib/storage';
import './Hero.css';

function useTyped(text: string, start: boolean, speed = 42) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) {
      setN(text.length);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [start, text, speed]);
  return text.slice(0, n);
}

function Uptime() {
  const [s, setS] = useState(0);
  useInterval(() => setS((v) => v + 1), 1000);
  return (
    <>
      {pad2(Math.floor(s / 3600))}:{pad2(Math.floor((s % 3600) / 60))}:{pad2(s % 60)}
    </>
  );
}

export function Hero({ ready }: { ready: boolean }) {
  const typed = useTyped(identity.tagline, ready);
  const typing = typed.length < identity.tagline.length;

  return (
    <section id="home" className={`hero ${ready ? 'is-ready' : ''}`} aria-labelledby="hero-title">
      <div className="hero__inner container">
        <div className="hero__copy">
          <div className="hero__status mono">
            <span className="tag">
              <span className="dot dot--pulse" aria-hidden="true" />
              SYSTEM: ONLINE
            </span>
            <span className="tag">guest@noun:~</span>
          </div>

          <p className="hero__wordmark mono" aria-hidden="true">
            NOUN<span>.exe</span>
            <em>personal developer environment</em>
          </p>

          <h1 id="hero-title" className="hero__name">
            {identity.name}
            <span lang="th"> ({identity.nameTh})</span>
          </h1>
          <p className="hero__subtitle mono">{identity.subtitle}</p>

          <p className="hero__typed mono" aria-label={identity.tagline}>
            <span className="hero__prompt" aria-hidden="true">
              $
            </span>
            <span aria-hidden="true">{typed}</span>
            <span className={`hero__caret ${typing ? 'is-typing' : ''}`} aria-hidden="true" />
          </p>

          <p className="hero__intro">
            A quiet, polite IT developer who keeps websites running, reads the world in numbers and statistics, and fixes bugs in
            silence, snack in hand. Say hi, and he will happily talk back.
          </p>

          <div className="hero__cta">
            <a href="#about" className="btn btn--primary">
              <FolderOpen size={16} aria-hidden="true" />
              Open profile
            </a>
            <a href="#workspace" className="btn">
              <TerminalSquare size={16} aria-hidden="true" />
              Enter workspace
            </a>
          </div>

          <dl className="hero__readouts mono">
            <div>
              <dt>local time</dt>
              <dd>
                <DigitalClock size="m" />
              </dd>
            </div>
            <div>
              <dt>session uptime</dt>
              <dd>
                <Uptime />
              </dd>
            </div>
            <div>
              <dt>mood</dt>
              <dd>chill</dd>
            </div>
          </dl>
        </div>

        <div className="hero__stage">
          <div className="hero__hud hero__hud--tl mono" aria-hidden="true">
            IMG_01 · original artwork
          </div>
          <div className="hero__hud hero__hud--br mono" aria-hidden="true">
            {IMAGE_WIDTH} × {IMAGE_HEIGHT}
          </div>
          <figure className="hero__frame">
            <div className="hero__backdrop" aria-hidden="true">
              <span className="hero__ring hero__ring--a" />
              <span className="hero__ring hero__ring--b" />
              <span className="hero__eq hero__eq--1">σ = √(Σ(x−μ)² / n)</span>
              <span className="hero__eq hero__eq--2">∀x ∈ bugs : fix(x)</span>
              <span className="hero__eq hero__eq--3">P(coffee | 02:00) ≈ 1</span>
            </div>
            <img
              src={IMAGE_SRC}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              alt={IMAGE_ALT}
              className="hero__art"
              decoding="async"
            />
            <span className="hero__corner hero__corner--tl" aria-hidden="true" />
            <span className="hero__corner hero__corner--tr" aria-hidden="true" />
          </figure>
        </div>
      </div>

      <a href="#about" className="hero__scroll mono" aria-label="Scroll to About Noun">
        <span>scroll</span>
        <span className="hero__scroll-line" aria-hidden="true" />
        <ArrowDown size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
