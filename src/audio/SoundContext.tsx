import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { audio, type SfxName } from './engine';
import { readStored, writeStored } from '../lib/storage';

interface SoundState {
  masterMuted: boolean;
  toggleMaster: () => void;
  sfxEnabled: boolean;
  toggleSfx: () => void;
  sfx: (name: SfxName) => void;
  musicPlaying: boolean;
  toggleMusic: () => void;
  volume: number;
  setVolume: (v: number) => void;
  musicMuted: boolean;
  toggleMusicMuted: () => void;
}

const SoundCtx = createContext<SoundState | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [masterMuted, setMasterMuted] = useState(() => readStored('noun.masterMuted', false));
  const [sfxEnabled, setSfxEnabled] = useState(() => readStored('noun.sfx', true));
  const [volume, setVolumeState] = useState(() => readStored('noun.volume', 0.6));
  const [musicMuted, setMusicMuted] = useState(false);
  // Music always starts paused: nothing autoplays.
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    audio.setMasterMuted(masterMuted);
    writeStored('noun.masterMuted', masterMuted);
  }, [masterMuted]);
  useEffect(() => {
    audio.setSfxEnabled(sfxEnabled);
    writeStored('noun.sfx', sfxEnabled);
  }, [sfxEnabled]);
  useEffect(() => {
    audio.setVolume(volume);
    writeStored('noun.volume', volume);
  }, [volume]);
  useEffect(() => audio.setMusicMuted(musicMuted), [musicMuted]);

  const sfx = useCallback((name: SfxName) => audio.playSfx(name), []);

  const toggleMusic = useCallback(() => {
    if (audio.playing) audio.pause();
    else audio.play();
    setMusicPlaying(audio.playing);
  }, []);

  const value = useMemo<SoundState>(
    () => ({
      masterMuted,
      toggleMaster: () => setMasterMuted((m) => !m),
      sfxEnabled,
      toggleSfx: () => setSfxEnabled((s) => !s),
      sfx,
      musicPlaying,
      toggleMusic,
      volume,
      setVolume: (v) => {
        setVolumeState(v);
        if (v > 0) setMusicMuted(false);
      },
      musicMuted,
      toggleMusicMuted: () => setMusicMuted((m) => !m),
    }),
    [masterMuted, sfxEnabled, sfx, musicPlaying, toggleMusic, volume, musicMuted],
  );

  return <SoundCtx.Provider value={value}>{children}</SoundCtx.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundCtx);
  if (!ctx) throw new Error('useSound must be used inside <SoundProvider>');
  return ctx;
}
