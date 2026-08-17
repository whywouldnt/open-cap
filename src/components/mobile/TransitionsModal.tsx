import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { TRANSITIONS_LIBRARY, TransitionDefinition } from '@/engine/vfx/transitionsLibrary';
import { HapticEngine } from '@/engine/mobile/HapticEngine';
import {
  X,
  Split,
  Sliders,
  Check,
  Zap,
  Sparkles,
  Layers,
} from 'lucide-react';

interface TransitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransitionsModal: React.FC<TransitionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedClipId, currentTime } = useTimelineStore();
  const { getClipById, updateClip, project } = useProjectStore();

  let selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  if (!selectedData) {
    for (const track of project.tracks) {
      const activeClip = track.clips.find(
        (c) => currentTime >= c.startTime && currentTime < c.startTime + c.duration
      );
      if (activeClip) {
        selectedData = { clip: activeClip, track, index: track.clips.indexOf(activeClip) };
        break;
      }
    }
    if (!selectedData) {
      for (const track of project.tracks) {
        if (track.clips.length > 0) {
          selectedData = { clip: track.clips[0], track, index: 0 };
          break;
        }
      }
    }
  }

  const clip = selectedData?.clip;

  const [activeCategory, setActiveCategory] = useState<string>('Tümü');
  const [duration, setDuration] = useState<number>(0.5);

  if (!isOpen) return null;

  const categories = ['Tümü', 'Temel', 'Kaydırma (Wipe)', 'Zoom & Kinetik', '3D Boyutlu', 'Glitch & Flaş', 'Sanatsal'];

  const filteredTransitions = TRANSITIONS_LIBRARY.filter((t) => {
    if (activeCategory === 'Tümü') return true;
    return t.category === activeCategory;
  });

  const currentTransition = clip?.transitionIn?.type || 'none';

  const handleSelectTransition = (transDef: TransitionDefinition) => {
    if (!clip) {
      alert('Lütfen geçiş uygulamak için zaman çizelgesinden bir klip seçin.');
      return;
    }

    HapticEngine.impactMedium();
    if (transDef.id === 'none') {
      updateClip(clip.id, { transitionIn: undefined });
    } else {
      updateClip(clip.id, {
        transitionIn: {
          type: transDef.id as any,
          duration: duration,
        },
      });
    }
  };

  const handleDurationChange = (val: number) => {
    setDuration(val);
    if (clip && clip.transitionIn) {
      updateClip(clip.id, {
        transitionIn: {
          ...clip.transitionIn,
          duration: val,
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg card-stack-sheet p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Handle bar */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl accent-gradient flex items-center justify-center shadow">
              <Split className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white">30+ 2D/3D Sahne Geçişi</h3>
              <span className="text-[10px] text-zinc-400 font-mono">
                {clip ? `Hedef: ${clip.name}` : 'Klip seçilmedi'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                HapticEngine.snapTick();
                setActiveCategory(cat);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'accent-gradient text-white shadow-sm'
                  : 'spatial-glass-pill text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 30+ Transitions Grid with Highly Legible Typography */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-2.5 min-h-[220px] p-1">
          {filteredTransitions.map((t) => {
            const isSelected = currentTransition === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTransition(t)}
                className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all text-center gap-2 relative overflow-hidden shadow-lg ${
                  isSelected
                    ? 'border-pink-500 bg-pink-950/40 shadow-lg shadow-pink-500/20'
                    : 'bg-[#181820] hover:bg-[#20202c] border-white/10 hover:border-purple-400/40'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500/30 to-pink-500/30 flex items-center justify-center text-white shadow">
                  <Split className="w-5 h-5 text-purple-300" />
                </div>
                <div className="flex flex-col items-center gap-1 w-full">
                  <span className="text-xs font-extrabold text-white text-center leading-snug w-full">
                    {t.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 text-center line-clamp-2 leading-tight">
                    {t.description}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full accent-gradient flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Duration Slider */}
        {currentTransition !== 'none' && (
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl spatial-glass flex-shrink-0">
            <div className="flex justify-between text-xs text-zinc-300 font-medium">
              <span className="font-bold text-white">Geçiş Süresi</span>
              <span className="font-mono text-pink-400 font-bold">{duration.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={duration}
              onChange={(e) => handleDurationChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer accent-pink-400"
            />
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 spatial-glass-pill text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex-shrink-0"
        >
          Tamam
        </button>
      </div>
    </div>
  );
};
