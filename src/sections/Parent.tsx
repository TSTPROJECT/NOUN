import { BookOpen, ShieldCheck, UserRound } from 'lucide-react';
import { parent } from '../data/noun';
import { SectionHead, Window } from '../components/ui';
import './Parent.css';

export function Parent() {
  return (
    <section id="parent" className="section parent" aria-labelledby="parent-title">
      <div className="container">
        <SectionHead index="06" path="~/README.md" title="About Parent" id="parent-title">
          Interaction guidelines from the character's owner. Please read before starting a roleplay.
        </SectionHead>

        <Window title="README.md — about parent" icon={<BookOpen size={14} />} className="parent__doc reveal" bodyClassName="parent__body">
          <div className="parent__head">
            <span className="parent__avatar" aria-hidden="true">
              <UserRound size={22} />
            </span>
            <div>
              <h3>{parent.heading}</h3>
              <p className="parent__badges mono">
                <span className="tag">
                  <ShieldCheck size={13} aria-hidden="true" /> 20+
                </span>
                <span className="tag">active until 00:00</span>
              </p>
            </div>
          </div>

          <p lang="th" className="parent__intro th">
            {parent.intro}
          </p>

          <ul lang="th" className="parent__list th">
            {parent.items.map((item, i) => (
              <li key={item}>
                <span className="parent__num mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p lang="th" className="parent__foot th">
            {parent.footnote}
          </p>
        </Window>
      </div>
    </section>
  );
}
