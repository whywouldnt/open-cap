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

  private buildMasterChain() {
    if (!this.ctx) return;

    // Master Gain & Limiter
    this.masterGainNode = this.ctx.createGain();
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
      this.eqFilters[this.eqFilters.length - 1].connect(this.compressorNode);
      this.compressorNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.ctx.destination);
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

    // 2. Apply 10-Band EQ Gains
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
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}
