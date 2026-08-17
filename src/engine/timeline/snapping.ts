/**
 * OPEN-CAP Mobile Snapping Engine
 * Calculates magnetic snap points (clip edges, playhead, markers, adjacent tracks)
 */

import { Project, Track, Clip, Marker } from '@/types/project';

export interface SnapTarget {
  time: number;
  type: 'playhead' | 'clip-start' | 'clip-end' | 'marker' | 'zero';
  label: string;
  distance: number; // In seconds
}

export interface SnapResult {
  snappedTime: number;
  hasSnapped: boolean;
  activeSnapTarget: SnapTarget | null;
}

export class SnappingEngine {
  /**
   * Finds the closest magnetic snap target within threshold
   * @param targetTime The time position being dragged or trimmed (in seconds)
   * @param project The active project with all tracks and markers
   * @param currentTime Current playhead position
   * @param thresholdSeconds Snapping tolerance in seconds (e.g. 0.1s to 0.25s)
   * @param excludeClipId Clip currently being moved (to avoid self-snapping)
   */
  public static findSnap(
    targetTime: number,
    project: Project,
    currentTime: number,
    thresholdSeconds: number = 0.05,
    excludeClipId?: string
  ): SnapResult {
    let closestTarget: SnapTarget | null = null;
    let minDistance = thresholdSeconds;

    // 1. Snap to Zero (Timeline start)
    if (Math.abs(targetTime - 0) < minDistance) {
      minDistance = Math.abs(targetTime - 0);
      closestTarget = {
        time: 0,
        type: 'zero',
        label: 'Zaman Başlangıcı (00:00:00)',
        distance: minDistance,
      };
    }

    // 2. Snap to Playhead
    const playheadDist = Math.abs(targetTime - currentTime);
    if (playheadDist < minDistance) {
      minDistance = playheadDist;
      closestTarget = {
        time: currentTime,
        type: 'playhead',
        label: 'Oynatma Çizgisi (Playhead)',
        distance: playheadDist,
      };
    }

    // 3. Snap to Markers
    for (const marker of project.markers) {
      const dist = Math.abs(targetTime - marker.time);
      if (dist < minDistance) {
        minDistance = dist;
        closestTarget = {
          time: marker.time,
          type: 'marker',
          label: `İşaretçi: ${marker.label}`,
          distance: dist,
        };
      }
    }

    // 4. Snap to all Clip boundaries across visible tracks
    for (const track of project.tracks) {
      if (track.isHidden) continue;

      for (const clip of track.clips) {
        if (excludeClipId && clip.id === excludeClipId) continue;

        const startDist = Math.abs(targetTime - clip.startTime);
        if (startDist < minDistance) {
          minDistance = startDist;
          closestTarget = {
            time: clip.startTime,
            type: 'clip-start',
            label: `${clip.name} (Başlangıç)`,
            distance: startDist,
          };
        }

        const endDist = Math.abs(targetTime - (clip.startTime + clip.duration));
        if (endDist < minDistance) {
          minDistance = endDist;
          closestTarget = {
            time: clip.startTime + clip.duration,
            type: 'clip-end',
            label: `${clip.name} (Bitiş)`,
            distance: endDist,
          };
        }
      }
    }

    if (closestTarget) {
      return {
        snappedTime: closestTarget.time,
        hasSnapped: true,
        activeSnapTarget: closestTarget,
      };
    }

    return {
      snappedTime: targetTime,
      hasSnapped: false,
      activeSnapTarget: null,
    };
  }
}
