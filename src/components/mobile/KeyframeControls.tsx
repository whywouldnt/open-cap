import React from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { Keyframe } from '@/types/project';
import { KeyframeEngine } from '@/engine/vfx/KeyframeEngine';
import {
  Diamond,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';

export const KeyframeControls: React.FC = () => {
  const { selectedClipId, currentTime, setCurrentTime } = useTimelineStore();
  const { getClipById, updateClip } = useProjectStore();

  const selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  const clip = selectedData?.clip;

  if (!clip) return null;

  const localTime = Math.max(0, currentTime - clip.startTime);
  const keyframes = clip.keyframes || [];

  // Check if there is an exact keyframe at current local time (+- 0.05s)
  const activeKfIndex = keyframes.findIndex(
    (k) => Math.abs(k.time - localTime) < 0.05
  );
  const hasActiveKeyframe = activeKfIndex !== -1;

  // Toggle Keyframe at current playhead
  const handleToggleKeyframe = () => {
    if (hasActiveKeyframe) {
      // Remove keyframe
      const updated = keyframes.filter((_, i) => i !== activeKfIndex);
      updateClip(clip.id, { keyframes: updated });
    } else {
      // Add keyframe for transform.scaleX and transform.rotation
      const newKeyframes: Keyframe[] = [
        ...keyframes,
        {
          id: `kf-scale-${Date.now()}`,
          time: localTime,
          property: 'scaleX',
          value: clip.transform.scaleX,
          easing: 'easeInOut',
        },
        {
          id: `kf-rot-${Date.now()}`,
          time: localTime,
          property: 'rotation',
          value: clip.transform.rotation,
          easing: 'easeInOut',
        },
      ];
      updateClip(clip.id, { keyframes: newKeyframes });
    }
  };

  // Jump to previous keyframe
  const handlePrevKeyframe = () => {
    const prevs = keyframes
      .filter((k) => k.time < localTime - 0.05)
      .sort((a, b) => b.time - a.time);
    if (prevs.length > 0) {
      setCurrentTime(clip.startTime + prevs[0].time);
    }
  };

  // Jump to next keyframe
  const handleNextKeyframe = () => {
    const nexts = keyframes
      .filter((k) => k.time > localTime + 0.05)
      .sort((a, b) => a.time - b.time);
    if (nexts.length > 0) {
      setCurrentTime(clip.startTime + nexts[0].time);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-[#1b1b22] px-2 py-1 rounded-xl border border-white/10 shadow select-none">
      {/* Jump Prev */}
      <button
        onClick={handlePrevKeyframe}
        className="p-1 rounded text-zinc-400 hover:text-white active:scale-90 transition-all"
        title="Önceki Anahtar Kare (Keyframe)"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Toggle Keyframe Diamond Button */}
      <button
        onClick={handleToggleKeyframe}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
          hasActiveKeyframe
            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/25 animate-pulse'
            : 'text-zinc-300 hover:text-amber-400 hover:bg-white/5'
        }`}
        title={hasActiveKeyframe ? 'Anahtar Kareyi Sil' : 'Anahtar Kare Ekle'}
      >
        <Diamond
          className={`w-3.5 h-3.5 ${
            hasActiveKeyframe ? 'fill-black stroke-black' : 'text-amber-400'
          }`}
        />
        <span className="text-[10px]">{hasActiveKeyframe ? 'Sil' : 'Ekle'}</span>
      </button>

      {/* Jump Next */}
      <button
        onClick={handleNextKeyframe}
        className="p-1 rounded text-zinc-400 hover:text-white active:scale-90 transition-all"
        title="Sonraki Anahtar Kare (Keyframe)"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
