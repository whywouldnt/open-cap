/**
 * OPEN-CAP Speed Curve Engine
 * Cubic Hermite spline interpolation for dynamic velocity curves,
 * duration integration, and timeline-to-source time mapping
 */

import { SpeedCurve, SpeedCurvePoint, SpeedCurvePreset } from '@/types/project';

export const SPEED_PRESETS: Record<SpeedCurvePreset, SpeedCurvePoint[]> = {
  custom: [
    { timeRatio: 0.0, speed: 1.0 },
    { timeRatio: 0.5, speed: 1.0 },
    { timeRatio: 1.0, speed: 1.0 },
  ],
  montage: [
    { timeRatio: 0.0, speed: 0.5 },
    { timeRatio: 0.3, speed: 4.0 },
    { timeRatio: 0.6, speed: 0.4 },
    { timeRatio: 0.8, speed: 3.5 },
    { timeRatio: 1.0, speed: 1.0 },
  ],
  hero: [
    { timeRatio: 0.0, speed: 6.0 },
    { timeRatio: 0.4, speed: 0.2 },
    { timeRatio: 0.7, speed: 0.2 },
    { timeRatio: 1.0, speed: 5.0 },
  ],
  bullet: [
    { timeRatio: 0.0, speed: 5.0 },
    { timeRatio: 0.35, speed: 0.1 },
    { timeRatio: 0.65, speed: 0.1 },
    { timeRatio: 1.0, speed: 5.0 },
  ],
  flashIn: [
    { timeRatio: 0.0, speed: 0.2 },
    { timeRatio: 0.3, speed: 6.0 },
    { timeRatio: 0.7, speed: 2.0 },
    { timeRatio: 1.0, speed: 1.0 },
  ],
  flashOut: [
    { timeRatio: 0.0, speed: 1.0 },
    { timeRatio: 0.4, speed: 2.0 },
    { timeRatio: 0.7, speed: 6.0 },
    { timeRatio: 1.0, speed: 0.2 },
  ],
};

export class SpeedCurveEngine {
  /**
   * Interpolates the speed multiplier at a normalized source time ratio [0.0 - 1.0]
   */
  public static getSpeedAtRatio(points: SpeedCurvePoint[], ratio: number): number {
    const clampedRatio = Math.max(0, Math.min(1, ratio));

    if (!points || points.length === 0) return 1.0;
    if (points.length === 1) return points[0].speed;

    // Find segment [p0, p1]
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      if (clampedRatio >= p0.timeRatio && clampedRatio <= p1.timeRatio) {
        const segT = (clampedRatio - p0.timeRatio) / (p1.timeRatio - p0.timeRatio || 1);
        // Smooth Hermite S-Curve
        const smoothT = segT * segT * (3 - 2 * segT);
        return p0.speed + (p1.speed - p0.speed) * smoothT;
      }
    }

    return points[points.length - 1].speed;
  }

  /**
   * Calculates resulting timeline duration for a given source segment duration under the speed curve
   * Duration = Integral_0^1 (SourceDuration / Speed(r)) dr
   */
  public static calculateTimelineDuration(
    sourceSegmentDuration: number,
    curve: SpeedCurve
  ): number {
    const steps = 100;
    let sum = 0;

    for (let i = 0; i < steps; i++) {
      const ratio = (i + 0.5) / steps;
      const speed = this.getSpeedAtRatio(curve.points, ratio);
      sum += 1 / Math.max(0.05, speed);
    }

    const avgInverseSpeed = sum / steps;
    return Math.max(0.1, sourceSegmentDuration * avgInverseSpeed);
  }

  /**
   * Maps a timeline elapsed progress time [0 -> timelineDuration] to the internal source media elapsed time
   */
  public static mapTimelineToSourceTime(
    timelineElapsed: number,
    timelineDuration: number,
    sourceSegmentDuration: number,
    curve?: SpeedCurve
  ): number {
    if (!curve || curve.points.length === 0) {
      return (timelineElapsed / (timelineDuration || 1)) * sourceSegmentDuration;
    }

    const steps = 60;
    const targetRatio = timelineElapsed / (timelineDuration || 1);
    let accumulatedTimelineTime = 0;
    const dt = 1 / steps;

    for (let i = 0; i < steps; i++) {
      const sourceRatio = i * dt;
      const speed = this.getSpeedAtRatio(curve.points, sourceRatio);
      const stepDuration = (sourceSegmentDuration * dt) / Math.max(0.05, speed);

      if (
        (accumulatedTimelineTime + stepDuration) / timelineDuration >=
        targetRatio
      ) {
        const rem = targetRatio * timelineDuration - accumulatedTimelineTime;
        const subRatio = rem / (stepDuration || 1);
        return (sourceRatio + subRatio * dt) * sourceSegmentDuration;
      }

      accumulatedTimelineTime += stepDuration;
    }

    return sourceSegmentDuration;
  }
}
