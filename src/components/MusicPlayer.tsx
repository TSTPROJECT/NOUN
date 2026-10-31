import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Music2, Pause, Play, Volume1, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../audio/SoundContext';
import { audio } from '../audio/engine';
import { MUSIC_TRACK } from '../audio/config';
import { pad2 } from '../hooks/hooks';
import './MusicPlayer.css';

const BARS = 14;

export function MusicPlayer() {
  const s = useSound();
  const [open, setOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const barsRef = useRef<HTMLDivElement>(null);

  // Elapsed time for the current listening session.
  useEffect(() => {
    if (!s.musicPlaying) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [s.musicPlaying]);

  // Visualiser reads the real analyser output while music plays.
  useEffect(() => {
    if (!s.musicPlaying || !open) return;
    const data = new Uint8Array(32);
    let raf = 0;
    const draw = () => {
      const bars = barsRef.current?.children;
      if (audio.analyser && bars) {
        audio.analyser.getByteFrequencyData(data);
        for (let i = 0; i < bars.length; i++) {
          const v = data[i + 1] / 255;
          (bars[i] as HTMLElement).style.transform = `scaleY(${Math.max(0.06, v)})`;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      const bars = barsRef.current?.children;
      if (bars) for (const b of Array.from(bars)) (b as HTMLElement).style.transform = '';
    };
  }, [s.musicPlaying, open]);

  const VolIcon = s.musicMuted || s.volume === 0 ? VolumeX : s.volume < 0.5 ? Volume1 : Volume2;

  return (
    <aside className={`player ${open ? 'is-open' : ''} ${s.musicPlaying ? 'is-playing' : ''}`} aria-label="Music player">
      {open && (
        <div className="player__panel" id="player-panel">
          <div className="player__head mono">
            <span>now_playing</span>
            <button type="button" className="icon-btn player__collapse" onClick={() => setOpen(false)} aria-label="Collapse music player">
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="player__track">
            <div className="player__art" aria-hidden="true">
              <div className="player__viz" ref={barsRef}>
                {Array.from({ length: BARS }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            </div>
            <div className="player__meta">
              <strong className="mono">{MUSIC_TRACK.title}</strong>
              <span>{MUSIC_TRACK.artist}</span>
              <span className="player__time mono">
                {s.musicPlaying ? 'PLAYING' : 'PAUSED'} · {pad2(Math.floor(elapsed / 60))}:{pad2(elapsed % 60)} · loop
              </span>
            </div>
          </div>

          <div className="player__controls">
            <button type="button" className="btn btn--primary btn--small player__play" onClick={s.toggleMusic} aria-label={s.musicPlaying ? 'Pause music' : 'Play music'}>
              {s.musicPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              {s.musicPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={s.toggleMusicMuted}
              aria-pressed={s.musicMuted}
              aria-label={s.musicMuted ? 'Unmute music' : 'Mute music'}
            >
              <VolIcon size={18} aria-hidden="true" />
            </button>
            <label className="player__vol">
              <span className="sr-only">Music volume</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(s.volume * 100)}
                onChange={(e) => s.setVolume(Number(e.target.value) / 100)}
                style={{ ['--fill' as string]: `${s.musicMuted ? 0 : s.volume * 100}%` }}
              />
            </label>
          </div>

          <label className="player__toggle">
            <input type="checkbox" checked={s.sfxEnabled} onChange={s.toggleSfx} />
            <span className="player__switch" aria-hidden="true" />
            UI sound effects
          </label>
          {s.masterMuted && <p className="player__note">All sound is muted from the top bar.</p>}
        </div>
      )}

      <button
        type="button"
        className="player__fab"
        aria-expanded={open}
        aria-controls="player-panel"
        aria-label={open ? 'Hide music player' : 'Show music player'}
        onClick={() => {
          s.sfx('open');
          setOpen((o) => !o);
        }}
      >
        <Music2 size={18} aria-hidden="true" />
        <span className="player__eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
    </aside>
  );
}
