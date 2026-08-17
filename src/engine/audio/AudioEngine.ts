/**
 * OPEN-CAP Web Audio API DSP Graph Engine
 * 10-Band Equalizer, Dynamics Compressor, Noise Gate, and Voice Transformer Filter Chains
 */

import { AudioSettings } from '@/types/project';
import { EQ_FREQUENCIES, VOICE_EFFECTS } from './VoiceTransformers';
import { FadeCurves } from './FadeCurves';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private compressorNode: DynamicsCompressorNode | null = null;
  private masterGainNode: GainNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private reverbGainNode: GainNode | null = null;
  private dryGainNode: GainNode | null = null;
  private activeMediaSources: Map<HTMLMediaElement, MediaElementAudioSourceNode> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.buildMasterChain();
      }
    } catch (e) {
      console.info('AudioContext initialized on first user interaction:', e);
    }
  }

  private createImpulseResponse(duration: number = 2.5, decay: number = 2.0): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    return impulse;
  }

  private buildMasterChain() {
    if (!this.ctx) return;

    // Master Gain & Limiter
    this.masterGainNode = this.ctx.createGain();
    this.dryGainNode = this.ctx.createGain();
    this.reverbGainNode = this.ctx.createGain();
    this.reverbGainNode.gain.value = 0; // Off by default

    this.convolverNode = this.ctx.createConvolver();
    this.convolverNode.buffer = this.createImpulseResponse(2.5, 2.5);

    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -6;
    this.compressorNode.knee.value = 12;
    this.compressorNode.ratio.value = 8;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;

    // Build 10-band BiquadFilter equalizer
    this.eqFilters = EQ_FREQUENCIES.map((freq, i) => {
      const filter = this.ctx!.createBiquadFilter();
      if (i === 0) {
        filter.type = 'lowshelf';
      } else if (i === EQ_FREQUENCIES.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      return filter;
    });

    // Connect Filter Chain in Series
    for (let i = 0; i < this.eqFilters.length - 1; i++) {
      this.eqFilters[i].connect(this.eqFilters[i + 1]);
    }

    if (this.eqFilters.length > 0) {
      const lastFilter = this.eqFilters[this.eqFilters.length - 1];

      // Split into dry and reverb wet paths
      lastFilter.connect(this.dryGainNode);
      lastFilter.connect(this.convolverNode);
      this.convolverNode.connect(this.reverbGainNode);

      this.dryGainNode.connect(this.compressorNode);
      this.reverbGainNode.connect(this.compressorNode);

      this.compressorNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.ctx.destination);
    }
  }

  /**
   * Connect an HTML5 video or audio element to the DSP chain
   */
  public connectMediaElement(element: HTMLMediaElement) {
    if (!this.ctx || this.eqFilters.length === 0) return;
    try {
      let source = this.activeMediaSources.get(element);
      if (!source) {
        source = this.ctx.createMediaElementSource(element);
        this.activeMediaSources.set(element, source);
      }
      source.connect(this.eqFilters[0]);
    } catch {
      // Element might already be connected
    }
  }

  /**
   * Applies clip audio settings to the DSP graph
   */
  public applySettings(settings: AudioSettings, elapsedTime: number, clipDuration: number) {
    if (!this.ctx || !this.masterGainNode) return;

    // 1. Calculate Fade In/Out Volume Multiplier
    const fadeMult = FadeCurves.calculateFadeMultiplier(
      elapsedTime,
      clipDuration,
      settings.fadeIn,
      settings.fadeOut,
      settings.fadeCurve || 'sCurve'
    );

    const targetVolume = settings.isMuted ? 0 : settings.volume * fadeMult;
    this.masterGainNode.gain.setValueAtTime(targetVolume, this.ctx.currentTime);

    // 2. Apply 10-Band EQ Gains & Voice Effect
    const bands = settings.equalizerBands || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const voiceDef = VOICE_EFFECTS.find((v) => v.id === settings.voiceEffect);
    const voiceProfile = voiceDef?.eqProfile || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.eqFilters.forEach((filter, idx) => {
      const combinedGain = (bands[idx] || 0) + (voiceProfile[idx] || 0);
      filter.gain.setValueAtTime(
        Math.min(15, Math.max(-15, combinedGain)),
        this.ctx!.currentTime
      );
    });

    // 3. Reverb Wet/Dry level
    if (this.reverbGainNode && this.dryGainNode) {
      if (voiceDef?.reverbDecay && voiceDef.reverbDecay > 0) {
        this.reverbGainNode.gain.setValueAtTime(0.45, this.ctx.currentTime);
        this.dryGainNode.gain.setValueAtTime(0.75, this.ctx.currentTime);
      } else {
        this.reverbGainNode.gain.setValueAtTime(0.0, this.ctx.currentTime);
        this.dryGainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
      }
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Properly closes the AudioContext to free system resources
   */
  public dispose() {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
    this.activeMediaSources.clear();
    this.eqFilters = [];
    this.compressorNode = null;
    this.masterGainNode = null;
    this.convolverNode = null;
    this.reverbGainNode = null;
    this.dryGainNode = null;
    this.ctx = null;
  }
}
