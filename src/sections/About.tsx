import { useEffect, useState } from 'react';
import { BadgeCheck, Calculator, Code2, Coffee, Server, Sigma } from 'lucide-react';
import { about, identity, IMAGE_SRC } from '../data/noun';
import { SectionHead, Window } from '../components/ui';
import { useInView } from '../hooks/hooks';
import { prefersReducedMotion } from '../lib/storage';
import './About.css';

const LABELS = [
  { icon: Code2, text: 'Web developer' },
  { icon: Server, text: 'System maintenance' },
  { icon: Sigma, text: 'Statistics' },
  { icon: Calculator, text: 'Mathematical logic' },
  { icon: Coffee, text: 'Snack + drink powered' },
];

// Flavour numbers for the profile card. Decorative, not real data.
const STATS = [
  { value: 1284, label: 'lines refactored today' },
  { value: 37, label: 'bugs fixed this week' },
  { value: 4, label: 'drinks sipped so far' },
  { value: 99.9, label: 'uptime kept (%)', decimals: 1 },
];

function Counter({ to, decimals = 0, run }: { to: number; decimals?: number; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (prefersReducedMotion()) {
      setV(to);
      return;
    }
    const start = performance.now();
    const dur = 1400;
    let raf = requestAnimationFrame(function tick(t) {
      const p = Math.min(1, (t - start) / dur);
      setV(to * (1 - (1 - p) ** 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

export function About() {
  const [statsRef, seen] = useInView<HTMLDListElement>(0.4);

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <SectionHead index="02" path="~/noun/profile/about.md" title="About Noun" id="about-title">
          Developer profile, loaded from the original character sheet.
        </SectionHead>

        <div className="about__grid">
          <article className="idcard reveal" aria-label="Developer ID card">
            <div className="idcard__top mono">
              <span>DEV-ID</span>
              <span>NO.0x4E4F554E</span>
            </div>
            <div className="idcard__photo">
              <img src={IMAGE_SRC} alt="Portrait crop of Noun from the original artwork" width={1500} height={2000} loading="lazy" decoding="async" />
              <span className="idcard__scan" aria-hidden="true" />
            </div>
            <div className="idcard__name">
              <h3>
                {identity.name} <span lang="th">{identity.nameTh}</span>
              </h3>
              <p className="mono">{identity.subtitle}</p>
            </div>
            <dl className="idcard__rows mono">
              <div>
                <dt>status</dt>
                <dd>
                  <span className="dot" aria-hidden="true" /> online
                </dd>
              </div>
              <div>
                <dt>mode</dt>
                <dd>chill · polite</dd>
              </div>
              <div>
                <dt>clearance</dt>
                <dd>
                  <BadgeCheck size={14} aria-hidden="true" /> sysadmin
                </dd>
              </div>
            </dl>
            <div className="idcard__barcode" aria-hidden="true" />
          </article>

          <div className="about__main">
            <Window title="about_noun.md" className="about__bio reveal" style={{ ['--delay' as string]: '0.1s' }}>
              <h3 className="about__heading">{about.heading}</h3>
              <div lang="th" className="about__text th">
                {about.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Window>

            <ul className="about__labels reveal" style={{ ['--delay' as string]: '0.15s' }} aria-label="Developer identity">
              {LABELS.map(({ icon: Icon, text }) => (
                <li key={text} className="tag">
                  <Icon size={14} aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>

            <div className="about__stats reveal" style={{ ['--delay' as string]: '0.2s' }}>
              <dl ref={statsRef}>
                {STATS.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd className="mono">
                      <Counter to={s.value} decimals={s.decimals} run={seen} />
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="about__disclaimer mono">// decorative numbers, not real data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
