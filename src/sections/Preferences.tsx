import { HeartHandshake, MessageCircleHeart, SlidersHorizontal } from 'lucide-react';
import { preferences } from '../data/noun';
import { SectionHead } from '../components/ui';
import './Preferences.css';

export function Preferences() {
  return (
    <section id="preferences" className="section prefs" aria-labelledby="prefs-title">
      <div className="container">
        <SectionHead index="04" path="~/noun/config/preferences" title="Preferences & Role" id="prefs-title" />

        <div className="prefs__grid">
          <article className="pcard reveal">
            <header className="pcard__head mono">
              <SlidersHorizontal size={16} aria-hidden="true" />
              <h3>{preferences.preferencesLabel}</h3>
            </header>
            <ul className="pcard__chips" aria-label={preferences.preferencesLabel}>
              {preferences.preferences.map((p) => (
                <li key={p} className="mono">
                  {p}
                </li>
              ))}
            </ul>
            <p className="pcard__key mono">
              preferences = [{preferences.preferences.map((p) => `"${p}"`).join(', ')}]
            </p>
          </article>

          <article className="pcard reveal" style={{ ['--delay' as string]: '0.08s' }}>
            <header className="pcard__head mono">
              <HeartHandshake size={16} aria-hidden="true" />
              <h3>{preferences.statusLabel}</h3>
            </header>
            <p className="pcard__status">
              <span className="dot dot--pulse" aria-hidden="true" />
              {preferences.status}
            </p>
            <p className="pcard__key mono">status = "{preferences.status}"</p>
          </article>

          <article className="pcard pcard--quote reveal" style={{ ['--delay' as string]: '0.16s' }}>
            <header className="pcard__head mono">
              <MessageCircleHeart size={16} aria-hidden="true" />
              <h3>note</h3>
            </header>
            <blockquote lang="th" className="th">
              {preferences.note}
            </blockquote>
          </article>
        </div>
      </div>
    </section>
  );
}
