/**
 * OPEN-CAP Mobile Ripple & Precision Editing Engine
 * Pure functional calculation engine for Ripple Delete, Ripple Trim, Roll, Slip, Slide, and Gap Closing
 */

import { Track, Clip, Project } from '@/types/project';

export interface RippleResult {
  trackId: string;
  originalClips: Clip[];
  updatedClips: Clip[];
  durationDelta: number;
}

export interface ProjectRippleResult {
  tracks: Array<{
    trackId: string;
    originalClips: Clip[];
    updatedClips: Clip[];
  }>;
  durationDelta: number;
}

export interface RollResult {
  trackId: string;
  firstClipId: string;
  secondClipId: string;
  prevFirstClip: Clip;
  prevSecondClip: Clip;
  nextFirstClip: Clip;
  nextSecondClip: Clip;
}

export interface SlipResult {
  clipId: string;
  prevSourceStartTime: number;
  nextSourceStartTime: number;
}

export interface SlideResult {
  trackId: string;
  prevClips: Clip[];
  nextClips: Clip[];
}

export class RippleEngine {
  /**
   * 1. RIPPLE DELETE (Single Track)
   * Deletes a clip and shifts all trailing clips to the left by deletedClip.duration
   */
  public static calculateRippleDelete(track: Track, clipId: string): RippleResult | null {
    const clipIndex = track.clips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return null;

    const originalClips = JSON.parse(JSON.stringify(track.clips)) as Clip[];
    const deletedClip = originalClips[clipIndex];
    const shiftAmount = deletedClip.duration;

    // Filter out deleted clip and shift all subsequent clips
    const updatedClips: Clip[] = [];

    for (let i = 0; i < originalClips.length; i++) {
      if (i === clipIndex) continue;
      const c = { ...originalClips[i] };
      if (c.startTime >= deletedClip.startTime) {
        c.startTime = Math.max(0, c.startTime - shiftAmount);
      }
      updatedClips.push(c);
    }

    updatedClips.sort((a, b) => a.startTime - b.startTime);

    return {
      trackId: track.id,
      originalClips,
      updatedClips,
      durationDelta: -shiftAmount,
    };
  }

  /**
   * 1B. MULTI-TRACK PROJECT RIPPLE DELETE
   * Deletes a clip and shifts trailing clips across all unlocked tracks to maintain multi-cam / audio sync
   */
  public static calculateProjectRippleDelete(
    project: Project,
    sourceTrackId: string,
    clipId: string,
    rippleAllTracks: boolean = true
  ): ProjectRippleResult | null {
    const sourceTrack = project.tracks.find((t) => t.id === sourceTrackId);
    if (!sourceTrack) return null;

    const targetClip = sourceTrack.clips.find((c) => c.id === clipId);
    if (!targetClip) return null;

    const shiftAmount = targetClip.duration;
    const splitTime = targetClip.startTime;
    const results: ProjectRippleResult['tracks'] = [];

    for (const track of project.tracks) {
      if (track.isLocked) {
        continue;
      }

      const origClips = JSON.parse(JSON.stringify(track.clips)) as Clip[];
      if (track.id === sourceTrackId) {
        const singleResult = this.calculateRippleDelete(track, clipId);
        if (singleResult) {
          results.push({
            trackId: track.id,
            originalClips: singleResult.originalClips,
            updatedClips: singleResult.updatedClips,
          });
        }
      } else if (rippleAllTracks) {
        const updatedClips: Clip[] = origClips.map((c) => {
          const copy = { ...c };
          if (copy.startTime >= splitTime) {
            copy.startTime = Math.max(0, copy.startTime - shiftAmount);
          }
          return copy;
        });
        updatedClips.sort((a, b) => a.startTime - b.startTime);
        results.push({
          trackId: track.id,
          originalClips: origClips,
          updatedClips,
        });
      }
    }

    return {
      tracks: results,
      durationDelta: -shiftAmount,
    };
  }

  /**
   * 2. RIPPLE TRIM
   * Trims a clip's right edge and shifts all subsequent clips accordingly
   */
  public static calculateRippleTrim(
    track: Track,
    clipId: string,
    newDuration: number
  ): RippleResult | null {
    const clipIndex = track.clips.findIndex((c) => c.id === clipId);
    if (clipIndex === -1) return null;

    const originalClips = JSON.parse(JSON.stringify(track.clips)) as Clip[];
    const targetClip = originalClips[clipIndex];
    const clampedDuration = Math.max(0.1, newDuration);
    const durationDelta = clampedDuration - targetClip.duration;

    const updatedClips: Clip[] = originalClips.map((c, i) => {
      const copy = { ...c };
      if (i === clipIndex) {
        copy.duration = clampedDuration;
      } else if (c.startTime > targetClip.startTime) {
        copy.startTime = Math.max(0, copy.startTime + durationDelta);
      }
      return copy;
    });

    updatedClips.sort((a, b) => a.startTime - b.startTime);

    return {
      trackId: track.id,
      originalClips,
      updatedClips,
      durationDelta,
    };
  }

  /**
   * 3. ROLL EDIT
   * Moves the edit point between two adjacent clips without changing overall track duration
   */
  public static calculateRollEdit(
    track: Track,
    firstClipId: string,
    secondClipId: string,
    deltaSeconds: number
  ): RollResult | null {
    const firstIndex = track.clips.findIndex((c) => c.id === firstClipId);
    const secondIndex = track.clips.findIndex((c) => c.id === secondClipId);
    if (firstIndex === -1 || secondIndex === -1) return null;

    const first = track.clips[firstIndex];
    const second = track.clips[secondIndex];

    const prevFirstClip = JSON.parse(JSON.stringify(first)) as Clip;
    const prevSecondClip = JSON.parse(JSON.stringify(second)) as Clip;

    // Calculate maximum allowable delta without shrinking either clip below 0.2s
    let delta = deltaSeconds;
    if (first.duration + delta < 0.2) {
      delta = 0.2 - first.duration;
    }
    if (second.duration - delta < 0.2) {
      delta = second.duration - 0.2;
    }

    const nextFirstClip: Clip = {
      ...first,
      duration: first.duration + delta,
    };

    const nextSecondClip: Clip = {
      ...second,
      startTime: second.startTime + delta,
      duration: second.duration - delta,
      sourceStartTime: Math.max(0, second.sourceStartTime + delta),
    };

    return {
      trackId: track.id,
      firstClipId,
      secondClipId,
      prevFirstClip,
      prevSecondClip,
      nextFirstClip,
      nextSecondClip,
    };
  }

  /**
   * 4. SLIP EDIT
   * Adjusts a clip's media in-point (sourceStartTime) without altering its timeline position or duration
   */
  public static calculateSlipEdit(
    clip: Clip,
    sourceDeltaSeconds: number
  ): SlipResult {
    const prevSourceStartTime = clip.sourceStartTime;
    // Ensure sourceStartTime stays within valid media bounds [0, sourceDuration - duration]
    const maxSourceStart = Math.max(0, clip.sourceDuration - clip.duration);
    const nextSourceStartTime = Math.max(
      0,
      Math.min(maxSourceStart, clip.sourceStartTime + sourceDeltaSeconds)
    );

    return {
      clipId: clip.id,
      prevSourceStartTime,
      nextSourceStartTime,
    };
  }

  /**
   * 5. CLOSE GAPS (Magnetic Alignment)
   * Collapses all empty gaps between clips so clips are tightly aligned head-to-tail
   */
  public static calculateCloseGaps(track: Track): RippleResult {
    const originalClips = JSON.parse(JSON.stringify(track.clips)) as Clip[];
    const sorted = [...originalClips].sort((a, b) => a.startTime - b.startTime);

    let currentCursor = 0;
    const updatedClips: Clip[] = sorted.map((clip) => {
      const copy = { ...clip, startTime: currentCursor };
      currentCursor += clip.duration;
      return copy;
    });

    const originalEnd =
      originalClips.length > 0
        ? Math.max(...originalClips.map((c) => c.startTime + c.duration))
        : 0;

    return {
      trackId: track.id,
      originalClips,
      updatedClips,
      durationDelta: currentCursor - originalEnd,
    };
  }
}
