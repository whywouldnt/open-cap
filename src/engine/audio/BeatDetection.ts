/**
 * OPEN-CAP Beat Detection & Rhythmic Sync Engine
 * Computes energy flux in bass drum frequencies, estimates BPM, and places timeline markers
 */

import { Marker } from '@/types/project';

export interface BeatAnalysisResult {
  bpm: number;
  beatTimes: number[]; // Timestamp in seconds
  markers: Marker[];
}

export class BeatDetectionEngine {
  /**
   * Analyzes an AudioBuffer or waveform data to extract rhythmic beat drops
   * @param waveform Raw normalized peak array or audio samples
   * @param duration Total audio duration in seconds
   * @param sensitivity Threshold sensitivity (0.5 to 1.5)
   */
  public static detectBeatsFromWaveform(
    waveform: number[],
    duration: number,
    sensitivity: number = 1.0
  ): BeatAnalysisResult {
    if (!waveform || waveform.length === 0) {
      // Fallback 120 BPM grid
      return this.generateFallbackBeats(duration, 120);
    }

    const n = waveform.length;
    const timePerSample = duration / n;
    const beatTimes: number[] = [];

    // 1. Calculate RMS energy flux (spectral flux approximation across moving window)
    const energyFlux: number[] = new Array(n).fill(0);
    const windowSize = Math.max(3, Math.floor(0.08 / timePerSample)); // 80ms energy window

    for (let i = 0; i < n; i++) {
      let sumSq = 0;
      let count = 0;
      for (let w = Math.max(0, i - windowSize); w <= Math.min(n - 1, i + windowSize); w++) {
        sumSq += waveform[w] * waveform[w];
        count++;
      }
      const rms = Math.sqrt(sumSq / Math.max(1, count));
      // Energy flux is the positive difference in RMS energy
      energyFlux[i] = i > 0 ? Math.max(0, rms - Math.sqrt((waveform[i - 1] * waveform[i - 1]))) : rms;
    }

    // 2. Compute dynamic moving average threshold
    const contextRadius = Math.max(8, Math.floor(0.4 / timePerSample)); // 400ms context
    const minSpacingSamples = Math.max(2, Math.floor(0.24 / timePerSample)); // Max 250 BPM (min 0.24s spacing)
    let lastBeatIndex = -100;

    for (let i = 1; i < n - 1; i++) {
      let localSum = 0;
      let localCount = 0;
      const start = Math.max(0, i - contextRadius);
      const end = Math.min(n - 1, i + contextRadius);

      for (let k = start; k <= end; k++) {
        localSum += energyFlux[k];
        localCount++;
      }
      const localMean = localSum / Math.max(1, localCount);
      const adaptiveThreshold = localMean * (1.35 / Math.max(0.5, sensitivity));

      const isPeak = energyFlux[i] > energyFlux[i - 1] && energyFlux[i] > energyFlux[i + 1];
      const isAboveThreshold = energyFlux[i] > adaptiveThreshold && energyFlux[i] > 0.05;

      if (isPeak && isAboveThreshold && i - lastBeatIndex >= minSpacingSamples) {
        const beatTime = Math.round(i * timePerSample * 100) / 100;
        beatTimes.push(beatTime);
        lastBeatIndex = i;
      }
    }

    // Estimate BPM from intervals
    let estimatedBpm = 120;
    if (beatTimes.length >= 4) {
      const intervals: number[] = [];
      for (let i = 1; i < beatTimes.length; i++) {
        intervals.push(beatTimes[i] - beatTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval > 0.1) {
        estimatedBpm = Math.round(60 / avgInterval);
      }
    }

    // Generate Timeline Markers
    const markers: Marker[] = beatTimes.map((t, idx) => ({
      id: `marker-beat-${idx + 1}-${Date.now()}`,
      time: t,
      label: `Vuruş ${idx + 1}`,
      color: '#facc15', // Neon Yellow Beat Marker
    }));

    return {
      bpm: Math.min(220, Math.max(60, estimatedBpm)),
      beatTimes,
      markers,
    };
  }

  private static generateFallbackBeats(duration: number, bpm: number): BeatAnalysisResult {
    const interval = 60 / bpm;
    const beatTimes: number[] = [];
    const markers: Marker[] = [];

    for (let t = interval; t < duration; t += interval) {
      const rounded = Math.round(t * 100) / 100;
      beatTimes.push(rounded);
      markers.push({
        id: `marker-beat-${markers.length + 1}`,
        time: rounded,
        label: `Vuruş ${markers.length + 1}`,
        color: '#facc15',
      });
    }

    return {
      bpm,
      beatTimes,
      markers,
    };
  }
}
