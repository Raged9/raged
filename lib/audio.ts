/**
 * lib/audio.ts
 * Centralized, high-fidelity Web Audio synthesis engine for Edgar's Portfolio.
 * 
 * Features:
 * 1. Singleton AudioContext — eliminates browser limit bugs where sound dies after ~6 keystrokes.
 * 2. Authentic Vintage Typewriter Key Mechanics:
 *    - Typebar metal-on-platen impact transient
 *    - Deep platen body resonance
 *    - Subtle mechanical spring/lever ring
 *    - Micro-pitch variance per key (eliminates repetitive machine-gun effect)
 *    - Distinct acoustics for Space, Return, Backspace, and standard keys
 * 3. Authentic Perforated Cardstock Paper Tear:
 *    - High-density fibrous crackle impulse train (Poisson micro-fiber snaps)
 *    - Resonant shearing friction noise sweep
 *    - Final paper detachment snap & air flutter
 *    - Incremental granular tear on drag
 *    - Smooth paper card reattach slide sound
 */

export type SoundProfile = "classic" | "acoustic";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private soundProfile: SoundProfile = "classic"; // "classic" (previous click sound) is the default

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public setSoundProfile(profile: SoundProfile) {
    this.soundProfile = profile;
  }

  public getSoundProfile(): SoundProfile {
    return this.soundProfile;
  }

  /**
   * Unlock AudioContext on initial user gesture (pointerdown/keydown)
   */
  public resumeAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }

  // ==========================================
  // TYPEWRITER SOUND EFFECTS (2 OPTIONS)
  // ==========================================

  /**
   * Option 1 (Default): Exact Poppy Modern 8-Bit Click (Porto-Vibe Original)
   * Pure square-wave rapid chirp (580Hz -> 110Hz in 20ms) with clean exponential decay.
   * Powered by singleton AudioContext so sound NEVER cuts out, even after thousands of keys!
   */
  public playTypewriterClassicClick(_key = "", isError = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      const startFreq = isError ? 720 : 580;
      const endFreq = isError ? 180 : 110;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.02);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
    } catch {}
  }

  /**
   * Option 2: Rich Multi-Layered Acoustic Platen Model
   * (Sharp hammer attack transient + low-mid platen resonance + metal lever ring)
   */
  public playTypewriterAcousticKey(key = "", isError = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const upper = key.toUpperCase();
      const isSpace = key === " " || upper === "SPACE";
      const isReturn = key === "Enter" || upper === "RETURN";
      const isBackspace = key === "Backspace" || upper === "DEL";

      const jitter = 0.94 + Math.random() * 0.12;

      // LAYER 1: Sharp Typebar Hammer Impact (Transient Click)
      const clickDuration = isSpace ? 0.015 : isReturn ? 0.025 : 0.018;
      const clickBufferSize = Math.floor(ctx.sampleRate * clickDuration);
      const clickBuffer = ctx.createBuffer(1, clickBufferSize, ctx.sampleRate);
      const clickData = clickBuffer.getChannelData(0);

      for (let i = 0; i < clickBufferSize; i++) {
        const env = Math.exp(-i / (clickBufferSize * 0.25));
        const noise = (Math.random() * 2 - 1);
        clickData[i] = noise * env;
      }

      const clickSource = ctx.createBufferSource();
      clickSource.buffer = clickBuffer;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = isSpace ? "lowpass" : "bandpass";
      clickFilter.frequency.setValueAtTime((isSpace ? 1400 : 2800) * jitter, now);
      clickFilter.Q.setValueAtTime(2.0, now);

      const clickGain = ctx.createGain();
      const clickVolume = isSpace ? 0.12 : isReturn ? 0.22 : 0.18;
      clickGain.gain.setValueAtTime(clickVolume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + clickDuration);

      clickSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickSource.start(now);

      // LAYER 2: Platen Body Resonance (Low-Mid Hollow Thud)
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();

      thudOsc.type = "sine";
      const baseFreq = isSpace ? 180 : isReturn ? 160 : isBackspace ? 310 : 230;
      const startFreq = baseFreq * jitter;
      const endFreq = (isSpace ? 75 : isReturn ? 85 : 110) * jitter;
      const thudDuration = isSpace ? 0.045 : isReturn ? 0.065 : 0.035;

      thudOsc.frequency.setValueAtTime(startFreq, now);
      thudOsc.frequency.exponentialRampToValueAtTime(endFreq, now + thudDuration);

      const thudVolume = isSpace ? 0.18 : isReturn ? 0.24 : 0.12;
      thudGain.gain.setValueAtTime(thudVolume, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + thudDuration);

      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + thudDuration + 0.005);

      // LAYER 3: Metallic Lever & Guide Ring
      if (!isSpace) {
        const ringOsc = ctx.createOscillator();
        const ringGain = ctx.createGain();

        ringOsc.type = "triangle";
        const ringFreq = (isError ? 980 : isReturn ? 1420 : 2150) * jitter;
        ringOsc.frequency.setValueAtTime(ringFreq, now);

        const ringDuration = isReturn ? 0.05 : 0.025;
        const ringVolume = isError ? 0.08 : 0.04;
        ringGain.gain.setValueAtTime(ringVolume, now);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + ringDuration);

        ringOsc.connect(ringGain);
        ringGain.connect(ctx.destination);
        ringOsc.start(now);
        ringOsc.stop(now + ringDuration + 0.005);
      }
    } catch {}
  }

  /**
   * Main keystroke dispatcher — routes to selected sound profile (classic or acoustic)
   */
  public playTypewriterKey(key = "", isError = false) {
    if (this.soundProfile === "acoustic") {
      this.playTypewriterAcousticKey(key, isError);
    } else {
      this.playTypewriterClassicClick(key, isError);
    }
  }

  /**
   * Vintage Typewriter End-of-Line Bell (Bronze carriage return chime)
   */
  public playTypewriterBell() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.75;

      // Dual harmonic bell chime: 1760Hz (A6) and 3520Hz (A7) + shimmer
      const fundamental = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gainFund = ctx.createGain();
      const gainHarm = ctx.createGain();

      fundamental.type = "sine";
      fundamental.frequency.setValueAtTime(1760, now);

      harmonic.type = "sine";
      harmonic.frequency.setValueAtTime(3520, now);

      gainFund.gain.setValueAtTime(0.25, now);
      gainFund.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      gainHarm.gain.setValueAtTime(0.12, now);
      gainHarm.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.6);

      fundamental.connect(gainFund);
      harmonic.connect(gainHarm);

      gainFund.connect(ctx.destination);
      gainHarm.connect(ctx.destination);

      fundamental.start(now);
      harmonic.start(now);

      fundamental.stop(now + duration + 0.05);
      harmonic.stop(now + duration * 0.6 + 0.05);
    } catch {}
  }

  // ==========================================
  // BOARDING PASS PAPER TEAR EFFECTS
  // ==========================================

  /**
   * Play a rich, tactile, authentic cardstock paper rip sound.
   * Emulates the physical shearing and fiber rupture along a perforation line.
   */
  public playPaperTearFull() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.42; // 420ms authentic tear
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Stochastic paper fiber rupture model:
      // Combines brownian noise texture + rapid Poisson impulse bursts (crackles)
      let brownian = 0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;

        // Base friction noise
        const white = Math.random() * 2 - 1;
        brownian = (brownian + 0.05 * white) / 1.05;

        // Periodic & stochastic fiber snaps (concentrated in middle 15% - 75% of tear)
        const inBurstRegion = t > 0.08 && t < 0.85;
        const fiberSnapProbability = inBurstRegion ? 0.12 : 0.02;
        const fiberSnap = Math.random() < fiberSnapProbability ? (Math.random() * 2 - 1) * 1.8 : 0;

        // Flutter modulation (fluttering paper resistance)
        const flutter = 1.0 + 0.4 * Math.sin(t * Math.PI * 34);

        // Overall envelope: sharp attack, sustained tearing resistance, quick raspy decay
        const envelope = t < 0.15 
          ? Math.pow(t / 0.15, 0.7) 
          : Math.pow(1 - (t - 0.15) / 0.85, 1.4);

        data[i] = (white * 0.35 + brownian * 0.4 + fiberSnap) * flutter * envelope;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Resonant bandpass sweep: starts high (initial edge rip) and sweeps downward as stub shears free
      const tearFilter = ctx.createBiquadFilter();
      tearFilter.type = "bandpass";
      tearFilter.frequency.setValueAtTime(4200, now);
      tearFilter.frequency.exponentialRampToValueAtTime(1600, now + duration * 0.7);
      tearFilter.frequency.exponentialRampToValueAtTime(1100, now + duration);
      tearFilter.Q.setValueAtTime(2.8, now);

      // High-shelf filter to give that crisp "crunchy cardstock" surface bite
      const crispShelf = ctx.createBiquadFilter();
      crispShelf.type = "highshelf";
      crispShelf.frequency.setValueAtTime(3200, now);
      crispShelf.gain.setValueAtTime(4.5, now);

      // Low-cut highpass to remove muddy sub-frequencies
      const lowCut = ctx.createBiquadFilter();
      lowCut.type = "highpass";
      lowCut.frequency.setValueAtTime(350, now);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.32, now);
      mainGain.gain.linearRampToValueAtTime(0.38, now + 0.06);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseNode.connect(tearFilter);
      tearFilter.connect(crispShelf);
      crispShelf.connect(lowCut);
      lowCut.connect(mainGain);
      mainGain.connect(ctx.destination);

      noiseNode.start(now);
      noiseNode.stop(now + duration + 0.01);
    } catch {}
  }

  /**
   * Incremental fiber crackle sound played while dragging/pulling the stub
   */
  public playFiberCrackle(intensity = 1.0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.07; // 70ms crisp rip fragment
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const spike = Math.random() < 0.18 ? (Math.random() * 2 - 1) * 1.5 : 0;
        const noise = (Math.random() * 2 - 1) * 0.5;
        const env = Math.sin(t * Math.PI);
        data[i] = (noise + spike) * env;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3400 + Math.random() * 800, now);
      filter.Q.setValueAtTime(3.2, now);

      const gain = ctx.createGain();
      const vol = Math.min(0.24, 0.14 * intensity);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration + 0.005);
    } catch {}
  }

  /**
   * Sound of ticket paper sliding back into place upon reattach
   */
  public playPaperSlide() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.22;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let brown = 0;
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.08 * white) / 1.08;
        const env = Math.sin(t * Math.PI);
        data[i] = (white * 0.25 + brown * 0.75) * env;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
      source.stop(now + duration + 0.01);
    } catch {}
  }
}

// Export singleton instance
export const audio = new SoundEngine();
