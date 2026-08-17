import React, { useRef, useState } from 'react';
import { Clip, Track } from '@/types/project';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import {
  MoveClipCommand,
  TrimClipCommand,
  RippleTrimCommand,
  RollEditCommand,
  SlipClipCommand,
} from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { SnappingEngine } from '@/engine/timeline/snapping';
import { RippleEngine } from '@/engine/timeline/ripple';
import { formatDuration } from '@/utils/timecode';
import { Film, Music, Type, Wand2, Layers, VolumeX } from 'lucide-react';

interface ClipItemProps {
  clip: Clip;
  track: Track;
  zoom: number; // Pixels per second
}

export const ClipItem: React.FC<ClipItemProps> = ({ clip, track, zoom }) => {
  const {
    selectedClipId,
    selectClip,
    isSnappingEnabled,
    currentTime,
    editMode,
    setSnapLineTime,
  } = useTimelineStore();

  const { getMediaById, project } = useProjectStore();
  const mediaMetadata = clip.mediaId ? getMediaById(clip.mediaId) : null;

  const isSelected = selectedClipId === clip.id;
  const clipWidth = Math.max(20, clip.duration * zoom);
  const clipLeft = clip.startTime * zoom;

  // Waveform peak slice for current clip
  const totalPeaksCount = Math.max(8, Math.floor(clipWidth / 5));
  const rawWaveform = mediaMetadata?.waveform || [];
  const waveformPeaks =
    rawWaveform.length > 0
      ? rawWaveform.slice(0, totalPeaksCount)
      : [...Array(totalPeaksCount)].map((_, i) => ((i * 37) % 70 + 20) / 100);

  // Track types styling
  const trackStyleMap: Record<
    string,
    { bg: string; border: string; icon: React.ReactNode; badge: string }
  > = {
    video: {
      bg: 'bg-[#1e293b]',
      border: 'border-blue-500/40',
      icon: <Film className="w-3 h-3 text-blue-400" />,
      badge: 'bg-blue-600/30 text-blue-300',
    },
    audio: {
      bg: 'bg-[#064e3b]',
      border: 'border-emerald-500/40',
      icon: <Music className="w-3 h-3 text-emerald-400" />,
      badge: 'bg-emerald-600/30 text-emerald-300',
    },
    text: {
      bg: 'bg-[#431407]',
      border: 'border-amber-500/40',
      icon: <Type className="w-3 h-3 text-amber-400" />,
      badge: 'bg-amber-600/30 text-amber-300',
    },
    effect: {
      bg: 'bg-[#3b0764]',
      border: 'border-purple-500/40',
      icon: <Wand2 className="w-3 h-3 text-purple-400" />,
      badge: 'bg-purple-600/30 text-purple-300',
    },
    overlay: {
      bg: 'bg-[#4c0519]',
      border: 'border-rose-500/40',
      icon: <Layers className="w-3 h-3 text-rose-400" />,
      badge: 'bg-rose-600/30 text-rose-300',
    },
  };

  const style = trackStyleMap[track.type] || trackStyleMap.video;

  // Drag & Trim State
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const initialStartTime = useRef(clip.startTime);
  const initialDuration = useRef(clip.duration);
  const initialSourceStartTime = useRef(clip.sourceStartTime);

  // 1. DRAG / SLIP POINTER DOWN
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    selectClip(clip.id, track.id);
    dragStartX.current = e.clientX;
    initialStartTime.current = clip.startTime;
    initialSourceStartTime.current = clip.sourceStartTime;
    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - dragStartX.current;
      const deltaTime = deltaX / zoom;

      if (editMode === 'slip') {
        // SLIP MODE: Shift sourceStartTime without moving timeline position
        const slipResult = RippleEngine.calculateSlipEdit(clip, deltaTime);
        const store = useProjectStore.getState();
        store.updateClip(clip.id, { sourceStartTime: slipResult.nextSourceStartTime });
        return;
      }

      // NORMAL MOVE MODE
      let newStart = Math.max(0, initialStartTime.current + deltaTime);

      if (isSnappingEnabled) {
        const snap = SnappingEngine.findSnap(newStart, project, currentTime, 0.15, clip.id);
        if (snap.hasSnapped) {
          newStart = snap.snappedTime;
          setSnapLineTime(snap.snappedTime);
        } else {
          setSnapLineTime(null);
        }
      }

      const store = useProjectStore.getState();
      store.updateClipTiming(clip.id, {
        startTime: newStart,
        duration: clip.duration,
        sourceStartTime: clip.sourceStartTime,
      });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      setSnapLineTime(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      const finalDeltaX = upEvent.clientX - dragStartX.current;
      const finalDeltaTime = finalDeltaX / zoom;

      if (editMode === 'slip') {
        const slipResult = RippleEngine.calculateSlipEdit(clip, finalDeltaTime);
        if (Math.abs(slipResult.nextSourceStartTime - initialSourceStartTime.current) > 0.01) {
          const cmd = new SlipClipCommand(
            clip.id,
            initialSourceStartTime.current,
            slipResult.nextSourceStartTime
          );
          historyManager.execute(cmd);
        }
        return;
      }

      let finalStart = Math.max(0, initialStartTime.current + finalDeltaTime);

      if (isSnappingEnabled) {
        const snap = SnappingEngine.findSnap(finalStart, project, currentTime, 0.15, clip.id);
        if (snap.hasSnapped) {
          finalStart = snap.snappedTime;
        }
      }

      if (Math.abs(finalStart - initialStartTime.current) > 0.01) {
        const moveCmd = new MoveClipCommand(
          clip.id,
          track.id,
          initialStartTime.current,
          track.id,
          finalStart
        );
        historyManager.execute(moveCmd);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 2. LEFT TRIM HANDLE
  const handleTrimLeft = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragStartX.current = e.clientX;
    initialStartTime.current = clip.startTime;
    initialDuration.current = clip.duration;
    initialSourceStartTime.current = clip.sourceStartTime;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - dragStartX.current;
      const deltaTime = deltaX / zoom;
      let newStartTime = initialStartTime.current + deltaTime;

      if (isSnappingEnabled) {
        const snap = SnappingEngine.findSnap(newStartTime, project, currentTime, 0.15, clip.id);
        if (snap.hasSnapped) {
          newStartTime = snap.snappedTime;
          setSnapLineTime(snap.snappedTime);
        } else {
          setSnapLineTime(null);
        }
      }

      const newDuration = Math.max(
        0.2,
        initialDuration.current - (newStartTime - initialStartTime.current)
      );
      const newSourceStart = Math.max(
        0,
        initialSourceStartTime.current + (newStartTime - initialStartTime.current)
      );

      const store = useProjectStore.getState();
      store.updateClipTiming(clip.id, {
        startTime: newStartTime,
        duration: newDuration,
        sourceStartTime: newSourceStart,
      });
    };

    const handlePointerUp = () => {
      setSnapLineTime(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      const store = useProjectStore.getState();
      const currentClip = store.getClipById(clip.id)?.clip;
      if (currentClip) {
        const trimCmd = new TrimClipCommand(
          clip.id,
          {
            startTime: initialStartTime.current,
            duration: initialDuration.current,
            sourceStartTime: initialSourceStartTime.current,
          },
          {
            startTime: currentClip.startTime,
            duration: currentClip.duration,
            sourceStartTime: currentClip.sourceStartTime,
          }
        );
        historyManager.execute(trimCmd);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 3. RIGHT TRIM / RIPPLE TRIM / ROLL EDIT HANDLE
  const handleTrimRight = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragStartX.current = e.clientX;
    initialDuration.current = clip.duration;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - dragStartX.current;
      const deltaTime = deltaX / zoom;
      let newEndTime = clip.startTime + initialDuration.current + deltaTime;

      if (isSnappingEnabled) {
        const snap = SnappingEngine.findSnap(newEndTime, project, currentTime, 0.15, clip.id);
        if (snap.hasSnapped) {
          newEndTime = snap.snappedTime;
          setSnapLineTime(snap.snappedTime);
        } else {
          setSnapLineTime(null);
        }
      }

      const newDuration = Math.max(0.2, newEndTime - clip.startTime);

      if (editMode === 'ripple') {
        const ripple = RippleEngine.calculateRippleTrim(track, clip.id, newDuration);
        if (ripple) {
          const store = useProjectStore.getState();
          store.setTrackClips(track.id, ripple.updatedClips);
        }
        return;
      }

      const store = useProjectStore.getState();
      store.updateClipTiming(clip.id, {
        startTime: clip.startTime,
        duration: newDuration,
        sourceStartTime: clip.sourceStartTime,
      });
    };

    const handlePointerUp = () => {
      setSnapLineTime(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      const store = useProjectStore.getState();
      const currentTrack = store.getTrackById(track.id);
      const currentClip = store.getClipById(clip.id)?.clip;

      if (editMode === 'ripple' && currentTrack) {
        const ripple = RippleEngine.calculateRippleTrim(track, clip.id, currentClip?.duration || initialDuration.current);
        if (ripple) {
          const cmd = new RippleTrimCommand(track.id, ripple.originalClips, ripple.updatedClips);
          historyManager.execute(cmd);
        }
        return;
      }

      if (currentClip) {
        const trimCmd = new TrimClipCommand(
          clip.id,
          {
            startTime: clip.startTime,
            duration: initialDuration.current,
            sourceStartTime: clip.sourceStartTime,
          },
          {
            startTime: clip.startTime,
            duration: currentClip.duration,
            sourceStartTime: clip.sourceStartTime,
          }
        );
        historyManager.execute(trimCmd);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
      }}
      className={`absolute top-1 bottom-1 rounded-md overflow-hidden flex items-center justify-between cursor-pointer border select-none transition-shadow ${
        style.bg
      } ${
        isSelected
          ? 'clip-selected z-20 border-cyan-400'
          : `${style.border} hover:border-white/30 z-10`
      }`}
    >
      {/* Left Trim Handle */}
      {isSelected && (
        <div
          onPointerDown={handleTrimLeft}
          className="absolute left-0 top-0 bottom-0 w-5 min-w-[44px] bg-cyan-400 rounded-l-md flex items-center justify-center cursor-ew-resize z-30 shadow"
        >
          <div className="w-0.5 h-3 bg-black rounded" />
        </div>
      )}

      {/* Video Thumbnail Background Strip */}
      {track.type === 'video' && mediaMetadata?.thumbnailUri && (
        <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden flex items-center">
          <img
            src={mediaMetadata.thumbnailUri}
            alt="clip-thumb"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Clip Content Thumbnail Strip / Waveform / Title */}
      <div className="flex-1 flex items-center gap-1.5 px-2 overflow-hidden pointer-events-none z-10">
        {style.icon}
        <span className="text-[11px] font-medium text-white truncate max-w-[120px] drop-shadow-sm">
          {clip.name}
        </span>
        <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${style.badge}`}>
          {formatDuration(clip.duration)}
        </span>
        {clip.isMuted && <VolumeX className="w-3 h-3 text-red-400 ml-auto" />}
      </div>

      {/* Real Waveform graphic for audio tracks */}
      {track.type === 'audio' && (
        <div className="absolute inset-x-2 bottom-1 h-4 flex items-end gap-0.5 opacity-60 pointer-events-none z-10">
          {waveformPeaks.map((peak: number, i: number) => (
            <div
              key={i}
              style={{ height: `${Math.max(15, peak * 100)}%` }}
              className="flex-1 bg-gradient-to-t from-emerald-400 to-teal-200 rounded-t-sm"
            />
          ))}
        </div>
      )}

      {/* Right Trim Handle (Changes color when in Ripple mode) */}
      {isSelected && (
        <div
          onPointerDown={handleTrimRight}
          className={`absolute right-0 top-0 bottom-0 w-5 min-w-[44px] rounded-r-md flex items-center justify-center cursor-ew-resize z-30 shadow ${
            editMode === 'ripple' ? 'bg-amber-400' : 'bg-cyan-400'
          }`}
          title={editMode === 'ripple' ? 'Dalgalı Kırp (Ripple Trim)' : 'Kırp'}
        >
          <div className="w-0.5 h-3 bg-black rounded" />
        </div>
      )}
    </div>
  );
};
