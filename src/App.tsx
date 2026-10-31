import { useCallback, useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { SoundProvider } from './audio/SoundContext';
import { ToastProvider } from './components/Toasts';
import { BootSequence } from './components/BootSequence';
import { Cursor } from './components/Cursor';
import { Nav } from './components/Nav';
import { MusicPlayer } from './components/MusicPlayer';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Details } from './sections/Details';
import { Preferences } from './sections/Preferences';
import { Workspace } from './sections/Workspace';
import { Parent } from './sections/Parent';
import { sections, type SectionId } from './data/noun';
import { useActiveSection, useRevealAll } from './hooks/hooks';
import { readStored, writeStored } from './lib/storage';

const SECTION_IDS = sections.map((s) => s.id);

export default function App() {
  const [booting, setBooting] = useState(() => !readStored('noun.booted', false, 'session'));
  const ready = !booting;
  const active = useActiveSection(SECTION_IDS) as SectionId;
  useRevealAll(ready);

  const finishBoot = useCallback(() => {
    writeStored('noun.booted', true, 'session');
    setBooting(false);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = booting ? 'hidden' : '';
  }, [booting]);

  return (
    <SoundProvider>
      <ToastProvider>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {booting && <BootSequence onDone={finishBoot} />}
        <Cursor />
        <Nav active={active} />
        <main id="main">
          <Hero ready={ready} />
          <About />
          <Details />
          <Preferences />
          <Workspace />
          <Parent />
        </main>
        <footer className="footer">
          <div className="container footer__inner">
            <div className="footer__brand mono">
              NOUN<span>.exe</span>
              <small>character showcase · v1.0</small>
            </div>
            <p className="footer__credit">
              Character: <strong>Noun (นาวน์)</strong>
              <span aria-hidden="true"> · </span>
              Created by <strong>TST Project</strong>
            </p>
            <a href="#home" className="btn btn--small">
              <ArrowUp size={14} aria-hidden="true" /> Back to top
            </a>
          </div>
        </footer>
        <MusicPlayer />
      </ToastProvider>
    </SoundProvider>
  );
}
