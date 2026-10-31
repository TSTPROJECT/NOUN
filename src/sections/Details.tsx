import { useState } from 'react';
import { Activity, AlertTriangle, BellRing, Check, FileText, Volume2, ServerCrash } from 'lucide-react';
import { personalNotes, triggers } from '../data/noun';
import { SectionHead, Window } from '../components/ui';
import { useToast } from '../components/Toasts';
import { useSound } from '../audio/SoundContext';
import './Details.css';

const ALERT_META = [
  { code: 'TRG-01', icon: Volume2, source: 'audio.env', level: 0.86 },
  { code: 'TRG-02', icon: ServerCrash, source: 'prod.weekend', level: 0.94 },
];

/** What the world turns into as stress goes up (Personal Note #1). */
const EQUATIONS = [
  'tasks(t) = tasks₀ · e^(kt)',
  'Δcalm / Δnoise < 0',
  'deadline − now → 0⁺',
  'P(bug | Friday 17:59) ≈ 1',
  'Σ messages = ∞ ; Σ replies = 0',
  'lim (sleep) as weekend → on-call = 0',
];

const STARE_REPLIES = [
  '(¬_¬) … … okay. Coming.',
  '(￣ー￣) one more bite first.',
  '(-_-) *slow blink* … fine.',
];

export function Details() {
  const notify = useToast();
  const { sfx } = useSound();
  const [acked, setAcked] = useState<boolean[]>(() => triggers.items.map(() => false));
  const [stress, setStress] = useState(25);
  const [stares, setStares] = useState(0);

  const visibleEqs = Math.round((stress / 100) * EQUATIONS.length);

  const ack = (i: number) => {
    setAcked((a) => a.map((v, j) => (j === i ? !v : v)));
    if (!acked[i]) notify(`${ALERT_META[i].code} acknowledged`, 'Noted. Please keep it quiet and keep prod up.', 'success');
    else sfx('click');
  };

  const ping = () => {
    const reply = STARE_REPLIES[stares % STARE_REPLIES.length];
    setStares((s) => s + 1);
    notify('Noun is on snack break', reply, 'info');
  };

  return (
    <section id="details" className="section details" aria-labelledby="details-title">
      <div className="container">
        <SectionHead index="03" path="~/noun/monitor/details" title="Character Details & Triggers" id="details-title">
          A live monitor of what disturbs the system, and a few notes from the developer's own log.
        </SectionHead>

        <div className="details__grid">
          <Window
            as="section"
            title="monitor/alerts"
            icon={<BellRing size={14} />}
            className="details__alerts reveal"
            labelledBy="triggers-title"
            actions={
              <span className="details__count mono">
                {acked.filter((a) => !a).length} active
              </span>
            }
          >
            <h3 id="triggers-title" className="details__h">
              {triggers.heading}
            </h3>
            <ul className="alerts">
              {triggers.items.map((text, i) => {
                const meta = ALERT_META[i];
                const Icon = meta.icon;
                return (
                  <li key={text} className={`alert ${acked[i] ? 'is-acked' : ''}`}>
                    <div className="alert__icon" aria-hidden="true">
                      <Icon size={20} />
                    </div>
                    <div className="alert__body">
                      <div className="alert__meta mono">
                        <span className="alert__level">
                          <AlertTriangle size={12} aria-hidden="true" /> {acked[i] ? 'ACK' : 'WARNING'}
                        </span>
                        <span>{meta.code}</span>
                        <span className="alert__src">src: {meta.source}</span>
                      </div>
                      <p lang="th" className="alert__text th">
                        {text}
                      </p>
                      <div className="alert__meter" aria-hidden="true">
                        <span style={{ transform: `scaleX(${acked[i] ? 0.15 : meta.level})` }} />
                      </div>
                    </div>
                    <button type="button" className="btn btn--small alert__ack" onClick={() => ack(i)} aria-pressed={acked[i]}>
                      {acked[i] ? <Check size={14} aria-hidden="true" /> : null}
                      {acked[i] ? 'Acked' : 'Ack'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Window>

          <Window
            as="section"
            title="notes.log"
            icon={<FileText size={14} />}
            className="details__notes reveal"
            style={{ ['--delay' as string]: '0.1s' }}
            labelledBy="notes-title"
          >
            <h3 id="notes-title" className="details__h">
              {personalNotes.heading}
            </h3>
            <ol className="notes">
              {personalNotes.items.map((text, i) => (
                <li key={text} className="note">
                  <span className="note__tag mono">[NOTE {String(i + 1).padStart(2, '0')}]</span>
                  <p lang="th" className="th">
                    {text}
                  </p>
                </li>
              ))}
            </ol>

            <div className="details__play">
              <div className="stress">
                <label htmlFor="stress" className="stress__label mono">
                  <Activity size={14} aria-hidden="true" />
                  stress_level <output htmlFor="stress">{stress}%</output>
                </label>
                <input
                  id="stress"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={stress}
                  onChange={(e) => setStress(Number(e.target.value))}
                  style={{ ['--fill' as string]: `${stress}%` }}
                />
                <ul className="stress__eqs mono" aria-live="polite" aria-label="Everything becomes an equation">
                  {visibleEqs === 0 && <li className="stress__calm">// calm. no equations detected.</li>}
                  {EQUATIONS.slice(0, visibleEqs).map((eq) => (
                    <li key={eq}>{eq}</li>
                  ))}
                </ul>
              </div>

              <button type="button" className="btn details__ping" onClick={ping}>
                Ping Noun with an IT request during snack time
              </button>
              {stares > 0 && <p className="details__stares mono">tired stares received: {stares}</p>}
            </div>
          </Window>
        </div>
      </div>
    </section>
  );
}
