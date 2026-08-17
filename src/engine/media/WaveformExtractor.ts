/**
 * OPEN-CAP Waveform Extractor
 * Web Audio API based waveform peak extraction
 */

export class WaveformExtractor {
  private static audioCtx: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Extracts normalized peak values (0.0 to 1.0) from an Audio Buffer or Blob
   */
  public static async extractWaveformFromBlob(
    blob: Blob,
    samplesCount: number = 64
  ): Promise<number[]> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const ctx = this.getAudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

      return this.computePeaksFromAudioBuffer(audioBuffer, samplesCount);
    } catch (err) {
      console.warn('Waveform extraction from audio buffer failed, using acoustic synthesis fallback:', err);
      return this.generateSyntheticWaveform(samplesCount);
    }
  }

  /**
   * Computes min/max root mean square peaks
   */
  public static computePeaksFromAudioBuffer(
    buffer: AudioBuffer,
    samplesCount: number = 64
  ): number[] {
    const rawData = buffer.getChannelData(0); // Primary channel (L or Mono)
    const totalSamples = rawData.length;
    const blockSize = Math.floor(totalSamples / samplesCount);
    const peaks: number[] = [];

    for (let i = 0; i < samplesCount; i++) {
      const start = i * blockSize;
      let sum = 0;
      let maxPeak = 0;

      for (let j = 0; j < blockSize; j++) {
        const val = Math.abs(rawData[start + j] || 0);
        if (val > maxPeak) maxPeak = val;
        sum += val * val;
      }

      // Root-mean-square with peak bias for visual clarity
      const rms = Math.sqrt(sum / blockSize);
      const combined = Math.min(1.0, Math.max(0.08, rms * 0.7 + maxPeak * 0.3));
      peaks.push(Math.round(combined * 1000) / 1000);
    }

    return peaks;
  }

  /**
   * Deterministic synthetic waveform generator for offline/instant mock previews
   */
  public static generateSyntheticWaveform(samplesCount: number = 64, seed: number = 42): number[] {
    const peaks: number[] = [];
    for (let i = 0; i < samplesCount; i++) {
      const angle = (i * 0.28) + (seed * 0.1);
      const val = (Math.sin(angle) * 0.4 + Math.cos(angle * 2.1) * 0.3 + 0.5) * 0.9;
      peaks.push(Math.min(1.0, Math.max(0.1, Math.round(val * 100) / 100)));
    }
    return peaks;
  }
}
