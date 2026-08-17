/**
 * OPEN-CAP Freeze Frame Engine
 * Slices a video clip at the playhead and inserts a frozen frame clip with ripple shift
 */

import { Track, Clip } from '@/types/project';

export interface FreezeFrameResult {
  trackId: string;
  originalClips: Clip[];
  updatedClips: Clip[];
  frozenClipId: string;
}

export class FreezeFrameEngine {
  /**
   * Creates a freeze-frame slice at splitTimestamp and inserts it into the track
   * @param track Target track containing the clip
   * @param clip Target video clip
   * @param splitTimestamp Timeline time position to freeze
   * @param freezeDuration Length of the frozen freeze frame in seconds (default 2.0s)
   */
  public static createFreezeFrame(
    track: Track,
    clip: Clip,
    splitTimestamp: number,
    freezeDuration: number = 2.0
  ): FreezeFrameResult | null {
    const clipIndex = track.clips.findIndex((c) => c.id === clip.id);
    if (clipIndex === -1) return null;

    const offsetInClip = splitTimestamp - clip.startTime;
    if (offsetInClip <= 0.1 || offsetInClip >= clip.duration - 0.1) {
      return null;
    }

    const originalClips = JSON.parse(JSON.stringify(track.clips)) as Clip[];

    // 1. First Part (Before freeze)
    const firstPart: Clip = {
      ...JSON.parse(JSON.stringify(clip)),
      id: `${clip.id}-p1-${Date.now()}`,
      duration: offsetInClip,
    };

    // 2. Frozen Snapshot Part (Duration: freezeDuration, speed: 0.0001)
    const frozenSourceTime = clip.sourceStartTime + offsetInClip * clip.speed;
    const frozenClip: Clip = {
      ...JSON.parse(JSON.stringify(clip)),
      id: `clip-freeze-${Date.now()}`,
      name: `${clip.name} (Donma Karesi)`,
      startTime: splitTimestamp,
      duration: freezeDuration,
      sourceStartTime: frozenSourceTime,
      sourceDuration: 0.1,
      speed: 0.00001, // Stationary freeze
      colorLabel: '#38bdf8', // Cyan freeze badge
    };

    // 3. Second Part (After freeze, shifted right by freezeDuration)
    const secondPart: Clip = {
      ...JSON.parse(JSON.stringify(clip)),
      id: `${clip.id}-p2-${Date.now()}`,
      startTime: splitTimestamp + freezeDuration,
      duration: clip.duration - offsetInClip,
      sourceStartTime: frozenSourceTime,
    };

    // Assemble updated clips with ripple shift for all subsequent clips on the track
    const updatedClips: Clip[] = [];

    for (let i = 0; i < originalClips.length; i++) {
      if (i === clipIndex) {
        updatedClips.push(firstPart);
        updatedClips.push(frozenClip);
        updatedClips.push(secondPart);
      } else {
        const otherClip = { ...originalClips[i] };
        if (otherClip.startTime >= splitTimestamp) {
          otherClip.startTime += freezeDuration;
        }
        updatedClips.push(otherClip);
      }
    }

    updatedClips.sort((a, b) => a.startTime - b.startTime);

    return {
      trackId: track.id,
      originalClips,
      updatedClips,
      frozenClipId: frozenClip.id,
    };
  }
}
