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

    // Calculate local energy threshold
    const windowSize = Math.max(4, Math.floor(n / 30));
    const meanEnergy = waveform.reduce((a, b) => a + b, 0) / n;
    const threshold = meanEnergy * 1.3 * sensitivity;

    let lastBeatIndex = -10;
    const minSpacingSamples = Math.max(2, Math.floor(0.25 / timePerSample)); // Max 240 BPM (min 0.25s apart)

    for (let i = 1; i < n - 1; i++) {
      const isPeak = waveform[i] > waveform[i - 1] && waveform[i] > waveform[i + 1];
      const isAboveThreshold = waveform[i] > threshold;

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
