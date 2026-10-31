import { useEffect, useState } from 'react';
import { Menu, Volume2, VolumeX, X } from 'lucide-react';
import { sections, type SectionId } from '../data/noun';
import { useSound } from '../audio/SoundContext';
import { DigitalClock } from './ui';
import './Nav.css';

export function Nav({ active }: { active: SectionId }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { masterMuted, toggleMaster, sfx } = useSound();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 960 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav__inner">
        <a href="#home" className="nav__brand" onClick={() => setOpen(false)} aria-label="NOUN.exe, back to top">
          <span className="nav__mark" aria-hidden="true">
            N
          </span>
          <span className="mono">
            NOUN<span className="nav__ext">.exe</span>
          </span>
        </a>

        <nav className="nav__links" id="site-menu" aria-label="Sections">
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={active === s.id ? 'is-active' : ''}
                  aria-current={active === s.id ? 'location' : undefined}
                  onClick={() => {
                    sfx('click');
                    setOpen(false);
                  }}
                >
                  <span className="nav__idx">{s.index}</span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__tools">
          <span className="nav__status mono">
            <span className="dot dot--pulse" aria-hidden="true" />
            ONLINE
          </span>
          <span className="nav__clock">
            <DigitalClock size="s" />
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleMaster}
            aria-pressed={masterMuted}
            aria-label={masterMuted ? 'Unmute all sound' : 'Mute all sound'}
            title={masterMuted ? 'Unmute all sound' : 'Mute all sound'}
          >
            {masterMuted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="icon-btn nav__burger"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => {
              sfx('click');
              setOpen((o) => !o);
            }}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
