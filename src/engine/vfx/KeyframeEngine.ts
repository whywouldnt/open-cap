/**
 * OPEN-CAP Keyframe Animation Engine
 * Multi-property keyframe evaluation, Bezier easing, and value interpolation
 */

import { Keyframe, Clip } from '@/types/project';

export class KeyframeEngine {
  /**
   * Evaluates the interpolated value of a keyframed property at current time within the clip
   * @param keyframes List of keyframes for this property
   * @param localTime Offset within clip (currentTime - clip.startTime)
   * @param defaultValue Fallback value if no keyframes exist
   */
  public static evaluateValue(
    keyframes: Keyframe[],
    localTime: number,
    defaultValue: number
  ): number {
    if (!keyframes || keyframes.length === 0) {
      return defaultValue;
    }

    // Sort keyframes chronologically
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);

    // If before first keyframe
    if (localTime <= sorted[0].time) {
      return typeof sorted[0].value === 'number' ? sorted[0].value : Number(sorted[0].value) || defaultValue;
    }

    // If after last keyframe
    if (localTime >= sorted[sorted.length - 1].time) {
      const last = sorted[sorted.length - 1];
      return typeof last.value === 'number' ? last.value : Number(last.value) || defaultValue;
    }

    // Find bounding pair [k0, k1]
    for (let i = 0; i < sorted.length - 1; i++) {
      const k0 = sorted[i];
      const k1 = sorted[i + 1];

      if (localTime >= k0.time && localTime <= k1.time) {
        const span = k1.time - k0.time;
        const v0 = typeof k0.value === 'number' ? k0.value : Number(k0.value) || 0;
        const v1 = typeof k1.value === 'number' ? k1.value : Number(k1.value) || 0;

        if (span <= 0.0001) return v0;

        const t = (localTime - k0.time) / span;

        // Apply Easing (linear, easeIn, easeOut, easeInOut)
        const easing = k1.easing || 'easeInOut';
        let easedT = t;

        if (easing === 'easeInOut') {
          easedT = t * t * (3 - 2 * t);
        } else if (easing === 'easeIn') {
          easedT = t * t;
        } else if (easing === 'easeOut') {
          easedT = t * (2 - t);
        }

        return v0 + (v1 - v0) * easedT;
      }
    }

    return defaultValue;
  }

  /**
   * Evaluates all keyframed transform properties of a clip at a given local time
   */
  public static evaluateClipTransforms(
    clip: Clip,
    localTime: number
  ): {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    opacity: number;
  } {
    const kfs = clip.keyframes || [];

    const xKfs = kfs.filter((k) => k.property === 'transform.x' || k.property === 'x');
    const yKfs = kfs.filter((k) => k.property === 'transform.y' || k.property === 'y');
    const sxKfs = kfs.filter((k) => k.property === 'transform.scaleX' || k.property === 'scaleX');
    const syKfs = kfs.filter((k) => k.property === 'transform.scaleY' || k.property === 'scaleY');
    const rotKfs = kfs.filter((k) => k.property === 'transform.rotation' || k.property === 'rotation');
    const opKfs = kfs.filter((k) => k.property === 'transform.opacity' || k.property === 'opacity');

    return {
      x: this.evaluateValue(xKfs, localTime, clip.transform.x),
      y: this.evaluateValue(yKfs, localTime, clip.transform.y),
      scaleX: this.evaluateValue(sxKfs, localTime, clip.transform.scaleX),
      scaleY: this.evaluateValue(syKfs, localTime, clip.transform.scaleY),
      rotation: this.evaluateValue(rotKfs, localTime, clip.transform.rotation),
      opacity: this.evaluateValue(opKfs, localTime, clip.transform.opacity),
    };
  }
}
