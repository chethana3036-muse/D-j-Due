import { SoundTheme } from '../types/alarm';

class CuteAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private activeLoopInterval: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a single note with soft envelope
  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainMax = 0.25,
    shimmer = false
  ) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    if (shimmer) {
      // Gentle vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5, startTime);
      lfoGain.gain.setValueAtTime(4, startTime);
      lfo.connect(osc.frequency);
      lfo.start(startTime);
      lfo.stop(startTime + duration);
    }

    // Soft attack, gentle exponential decay
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainMax, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  public playPattern(theme: SoundTheme) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (theme) {
      case 'peach_blossom': {
        // Pentatonic music box arpeggio: C5, E5, G5, A5, C6
        const notes = [523.25, 659.25, 783.99, 880.0, 1046.5];
        notes.forEach((freq, idx) => {
          this.playTone(freq, now + idx * 0.18, 0.7, 'triangle', 0.28, true);
          // Harmonic overtone
          this.playTone(freq * 2, now + idx * 0.18, 0.4, 'sine', 0.08);
        });
        break;
      }

      case 'kawaii_twinkle': {
        // High sparkling glockenspiel twinkle
        const notes = [659.25, 830.61, 987.77, 1318.51, 987.77, 1318.51];
        notes.forEach((freq, idx) => {
          this.playTone(freq, now + idx * 0.14, 0.5, 'sine', 0.25, true);
        });
        break;
      }

      case 'dreamy_harp': {
        // Cascading harp chords
        const notes = [440.0, 554.37, 659.25, 880.0, 1108.73, 1318.51];
        notes.forEach((freq, idx) => {
          this.playTone(freq, now + idx * 0.12, 1.2, 'sine', 0.22);
        });
        break;
      }

      case 'sunrise_melody': {
        // Uplifting warm major triad chords
        const chords = [
          [523.25, 659.25, 783.99], // C major
          [587.33, 739.99, 880.0],  // D major
          [659.25, 830.61, 987.77], // E major
        ];
        chords.forEach((chord, step) => {
          chord.forEach((freq) => {
            this.playTone(freq, now + step * 0.35, 0.8, 'triangle', 0.18);
          });
        });
        break;
      }

      case 'gentle_bell': {
        // Calm crystal singing bowl resonance
        const freqs = [528.0, 1056.0]; // 528Hz love/miracle frequency
        freqs.forEach((f, i) => {
          this.playTone(f, now, 2.2, 'sine', 0.28 / (i + 1), true);
        });
        this.playTone(792.0, now + 0.4, 1.8, 'sine', 0.15);
        break;
      }
    }
  }

  // Play alarm with looping until stopped
  public startAlarmRingtone(theme: SoundTheme): () => void {
    this.stopAlarm();
    this.playPattern(theme);

    // Repeat every 2.4 seconds
    this.activeLoopInterval = window.setInterval(() => {
      this.playPattern(theme);
    }, 2400);

    return () => this.stopAlarm();
  }

  public stopAlarm() {
    if (this.activeLoopInterval !== null) {
      clearInterval(this.activeLoopInterval);
      this.activeLoopInterval = null;
    }
  }
}

export const cuteAudioSynth = new CuteAudioSynthesizer();
