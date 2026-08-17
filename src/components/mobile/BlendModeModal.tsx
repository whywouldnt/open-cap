import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { BLEND_MODES, BlendModeDefinition } from '@/engine/gpu/blendModes';
import { BlendMode } from '@/types/project';
import {
  X,
  Sparkles,
  Layers,
  Check,
  Eye,
  Sliders,
} from 'lucide-react';

interface BlendModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlendModeModal: React.FC<BlendModeModalProps> = ({ isOpen, onClose }) => {
  const { project, getClipById, updateClip } = useProjectStore();
  const { currentTime, selectedClipId } = useTimelineStore();

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

  if (!isOpen || !clip) return null;

  const categories = ['Tümü', 'Temel', 'Koyulaştır', 'Aydınlat', 'Kontrast', 'Karşılaştırma', 'Bileşen', 'VFX Özel'];

  const filteredModes = BLEND_MODES.filter((m) => {
    if (activeCategory === 'Tümü') return true;
    return m.category === activeCategory;
  });

  const handleSelectBlendMode = (modeId: string) => {
    updateClip(clip.id, { blendMode: modeId as BlendMode });
  };

  const handleOpacityChange = (opacity: number) => {
    updateClip(clip.id, {
      transform: {
        ...clip.transform,
        opacity,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">37+ Karışım Modu (Blend Modes)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opacity Slider */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#1b1b22] border border-white/5 flex-shrink-0">
          <div className="flex justify-between text-xs text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Katman Opaklığı
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {Math.round(clip.transform.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.02"
            value={clip.transform.opacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                  : 'bg-[#1b1b22] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blend Modes Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 min-h-[220px]">
          {filteredModes.map((mode) => {
            const isSelected = clip.blendMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleSelectBlendMode(mode.id)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-[#1b1b22] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {mode.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                  {mode.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          Tamamla
        </button>
      </div>
    </div>
  );
};
