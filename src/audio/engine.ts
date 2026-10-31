import { MUSIC_TRACK } from './config';

export type SfxName = 'click' | 'key' | 'enter' | 'notify' | 'error' | 'success' | 'open';

const midiToHz = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Fmaj7 → Em7 → Dm9 → Cmaj9: a slow, unresolved late-night progression. */
const PROGRESSION: number[][] = [
  [53, 57, 60, 64],
  [52, 55, 59, 62],
  [50, 53, 57, 60, 64],
  [48, 55, 59, 62, 64],
];
const BPM = 70;
const STEP = 60 / BPM / 2; // eighth notes
const STEPS_PER_CHORD = 16; // two bars

/**
 * One AudioContext for the whole site. Created lazily on the first user
 * gesture (browsers block audio before that), then reused.
 *
 * Graph: sfx ─┐
 *        music ─ analyser ─┴─ master ─ destination
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private musicVolume!: GainNode;
  private delay!: DelayNode;
  analyser: AnalyserNode | null = null;

  private masterMuted = false;
  private sfxEnabled = true;
  private volume = 0.6;
  private musicMuted = false;

  private timer: number | null = null;
  private nextStepTime = 0;
  private step = 0;
  private fileEl: HTMLAudioElement | null = null;
  private noise: AudioBuffer | null = null;
  playing = false;

  private ensure(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.masterMuted ? 0 : 1;
    this.master.connect(ctx.destination);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.5;
    this.sfxBus.connect(this.master);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.85;
    this.analyser.connect(this.master);

    this.musicVolume = ctx.createGain();
    this.musicVolume.gain.value = this.effectiveMusicVolume();
    this.musicVolume.connect(this.analyser);

    // Fades in/out on play/pause without touching the user's volume setting.
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0;
    this.musicBus.connect(this.musicVolume);

    // A soft feedback delay gives the plucks some room.
    this.delay = ctx.createDelay(2);
    this.delay.delayTime.value = STEP * 3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const delayTone = ctx.createBiquadFilter();
    delayTone.type = 'lowpass';
    delayTone.frequency.value = 1800;
    this.delay.connect(delayTone);
    delayTone.connect(feedback);
    feedback.connect(this.delay);
    delayTone.connect(this.musicBus);

    return ctx;
  }

  private effectiveMusicVolume() {
    return this.musicMuted ? 0 : this.volume * 0.5;
  }

  // ---------- settings ----------

  setMasterMuted(muted: boolean) {
    this.masterMuted = muted;
    if (this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    if (this.fileEl && !this.ctx) this.fileEl.muted = muted;
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.ctx) this.musicVolume.gain.setTargetAtTime(this.effectiveMusicVolume(), this.ctx.currentTime, 0.05);
  }

  setMusicMuted(muted: boolean) {
    this.musicMuted = muted;
    if (this.ctx) this.musicVolume.gain.setTargetAtTime(this.effectiveMusicVolume(), this.ctx.currentTime, 0.05);
  }

  // ---------- UI sound effects ----------

  playSfx(name: SfxName) {
    if (!this.sfxEnabled || this.masterMuted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const blip = (freq: number, start: number, dur: number, gain: number, type: OscillatorType = 'sine', to?: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t + start);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + start + dur);
      g.gain.setValueAtTime(0.0001, t + start);
      g.gain.exponentialRampToValueAtTime(gain, t + start + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      o.connect(g).connect(this.sfxBus);
      o.start(t + start);
      o.stop(t + start + dur + 0.02);
    };
    switch (name) {
      case 'click':
        blip(1320, 0, 0.05, 0.08, 'triangle', 990);
        break;
      case 'key':
        blip(2200 + Math.random() * 400, 0, 0.025, 0.035, 'square');
        break;
      case 'enter':
        blip(660, 0, 0.06, 0.07, 'triangle');
        blip(990, 0.05, 0.08, 0.06, 'triangle');
        break;
      case 'open':
        blip(520, 0, 0.12, 0.06, 'sine', 880);
        break;
      case 'notify':
        blip(880, 0, 0.14, 0.07, 'sine');
        blip(1318.5, 0.09, 0.22, 0.06, 'sine');
        break;
      case 'success':
        blip(659.3, 0, 0.1, 0.06, 'sine');
        blip(783.99, 0.07, 0.1, 0.06, 'sine');
        blip(1046.5, 0.14, 0.2, 0.06, 'sine');
        break;
      case 'error':
        blip(220, 0, 0.16, 0.07, 'triangle', 160);
        break;
    }
  }

  // ---------- music ----------

  play() {
    const ctx = this.ensure();
    if (!ctx || this.playing) return;
    this.playing = true;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(1, ctx.currentTime, 0.4);

    if (MUSIC_TRACK.kind === 'file') {
      if (!this.fileEl) {
        this.fileEl = new Audio(MUSIC_TRACK.src);
        this.fileEl.loop = true;
        this.fileEl.crossOrigin = 'anonymous';
        ctx.createMediaElementSource(this.fileEl).connect(this.musicBus);
      }
      void this.fileEl.play().catch(() => {
        this.playing = false;
      });
      return;
    }

    this.nextStepTime = ctx.currentTime + 0.08;
    this.timer = window.setInterval(() => this.schedule(), 40);
    this.schedule();
  }

  pause() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    this.musicBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    const el = this.fileEl;
    if (el) window.setTimeout(() => !this.playing && el.pause(), 900);
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextStepTime < ctx.currentTime + 0.25) {
      this.playStep(this.step, this.nextStepTime);
      this.step = (this.step + 1) % (STEPS_PER_CHORD * PROGRESSION.length);
      this.nextStepTime += STEP;
    }
  }

  private playStep(step: number, time: number) {
    const chord = PROGRESSION[Math.floor(step / STEPS_PER_CHORD)];
    const inChord = step % STEPS_PER_CHORD;

    if (inChord === 0) {
      const dur = STEP * STEPS_PER_CHORD;
      chord.forEach((n) => this.pad(midiToHz(n), time, dur + 1.2, 0.035));
      this.pad(midiToHz(chord[0] - 12), time, dur, 0.07, 'sine');
    }

    // Sparse, gently random plucks from the chord, an octave up.
    const pattern = [1, 0, 0.5, 0, 0.8, 0, 0.35, 0.5];
    if (Math.random() < pattern[inChord % 8] * 0.75) {
      const note = chord[Math.floor(Math.random() * chord.length)] + 12 + (Math.random() < 0.25 ? 12 : 0);
      this.pluck(midiToHz(note), time + (Math.random() - 0.5) * 0.02);
    }

    // Quiet hat tick, swung.
    if (inChord % 2 === 1 && Math.random() < 0.55) this.tick(time + STEP * 0.12);
  }

  private pad(freq: number, time: number, dur: number, gain: number, type: OscillatorType = 'triangle') {
    const ctx = this.ctx!;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.linearRampToValueAtTime(gain, time + 1.1);
    g.gain.setValueAtTime(gain, time + dur - 1.2);
    g.gain.linearRampToValueAtTime(0.0001, time + dur);
    filter.connect(g).connect(this.musicBus);
    [-5, 5].forEach((detune) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = detune;
      o.connect(filter);
      o.start(time);
      o.stop(time + dur + 0.05);
    });
  }

  private pluck(freq: number, time: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.05, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);
    o.connect(g);
    g.connect(this.musicBus);
    g.connect(this.delay);
    o.start(time);
    o.stop(time + 1);
  }

  private tick(time: number) {
    const ctx = this.ctx!;
    if (!this.noise) {
      const len = Math.floor(ctx.sampleRate * 0.03);
      this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.value = 0.025;
    src.connect(hp).connect(g).connect(this.musicBus);
    src.start(time);
  }
}

export const audio = new AudioEngine();
