/**
 * OPEN-CAP Audio Fade In / Fade Out Curves
 * Linear, Hermite S-Curve, and Logarithmic volume ramping
 */

import { FadeCurveType } from '@/types/project';

export class FadeCurves {
  /**
   * Calculates volume multiplier [0.0 - 1.0] at elapsed time within a clip
   */
  public static calculateFadeMultiplier(
    elapsedTime: number,
    clipDuration: number,
    fadeInDuration: number = 0,
    fadeOutDuration: number = 0,
    curveType: FadeCurveType = 'sCurve'
  ): number {
    let multiplier = 1.0;

    // 1. Fade In
    if (fadeInDuration > 0 && elapsedTime < fadeInDuration) {
      const t = Math.max(0, Math.min(1, elapsedTime / fadeInDuration));
      multiplier *= this.applyCurve(t, curveType);
    }

    // 2. Fade Out
    const timeRemaining = clipDuration - elapsedTime;
    if (fadeOutDuration > 0 && timeRemaining < fadeOutDuration) {
      const t = Math.max(0, Math.min(1, timeRemaining / fadeOutDuration));
      multiplier *= this.applyCurve(t, curveType);
    }

    return Math.max(0, Math.min(1, multiplier));
  }

  private static applyCurve(t: number, curveType: FadeCurveType): number {
    if (curveType === 'linear') {
      return t;
    } else if (curveType === 'sCurve') {
      // Smooth Hermite S-Curve
      return t * t * (3 - 2 * t);
    } else if (curveType === 'logarithmic') {
      // Exponential audio perception curve
      return Math.pow(t, 2);
    }
    return t;
  }
}
