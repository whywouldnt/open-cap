import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { VFX_EFFECTS, EffectDefinition } from '@/engine/vfx/effectsLibrary';
import { FilterEffect } from '@/types/project';
import { HapticEngine } from '@/engine/mobile/HapticEngine';
import {
  X,
  Sparkles,
  Sliders,
  Check,
  Trash2,
  Zap,
  Activity,
  Layers,
  Wand2,
  Eye,
} from 'lucide-react';

interface VFXModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VFXModal: React.FC<VFXModalProps> = ({ isOpen, onClose }) => {
  const { selectedClipId, currentTime, selectClip } = useTimelineStore();
  const { getClipById, updateClip, project } = useProjectStore();

  // If no clip selected, find active clip under currentTime or first video clip in project
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
  const [selectedEffectId, setSelectedEffectId] = useState<string>('rgbSplit');

  if (!isOpen) return null;

  const categories = ['Tümü', 'Glitch', 'Retro', 'Bulanıklık', 'Işık & Parıltı', 'Bozulma', 'Sinematik', 'Stil & Sanat'];

  const filteredEffects = VFX_EFFECTS.filter((e) => {
    if (activeCategory === 'Tümü') return true;
    return e.category === activeCategory;
  });

  const activeClipEffects = clip?.effects || [];

  // Toggle or add effect
  const handleToggleEffect = (effectDef: EffectDefinition) => {
    if (!clip) {
      alert('Lütfen efekt uygulamak için zaman çizelgesinden bir klip seçin veya medya ekleyin.');
      return;
    }

    HapticEngine.impactMedium();
    const existingIndex = activeClipEffects.findIndex((e) => e.type === effectDef.id || e.id.includes(effectDef.id));

    if (existingIndex !== -1) {
      // Remove effect
      const updated = activeClipEffects.filter((_, i) => i !== existingIndex);
      updateClip(clip.id, { effects: updated });
    } else {
      // Add effect
      const newEffect: FilterEffect = {
        id: `fx-${effectDef.id}-${Date.now()}`,
        type: effectDef.id,
        name: effectDef.name,
        enabled: true,
        intensity: effectDef.defaultIntensity,
        params: {},
      };
      updateClip(clip.id, { effects: [...activeClipEffects, newEffect] });
      setSelectedEffectId(effectDef.id);
    }
  };

  // Change intensity of active effect
  const handleIntensityChange = (intensity: number) => {
    if (!clip) return;
    const updated = activeClipEffects.map((e) => {
      if (e.type === selectedEffectId || e.id.includes(selectedEffectId)) {
        return { ...e, intensity };
      }
      return e;
    });
    updateClip(clip.id, { effects: updated });
  };

  const currentActiveEffect = activeClipEffects.find(
    (e) => e.type === selectedEffectId || e.id.includes(selectedEffectId)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg card-stack-sheet p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Swipe-to-dismiss Handle Bar */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white tracking-wide">50+ GPU Video Efekti</h3>
              <span className="text-[10px] text-zinc-400 font-mono">
                {clip ? `Hedef: ${clip.name}` : 'Klip Seçilmedi'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Applied Effects Pill Badges */}
        {activeClipEffects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-shrink-0">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider pl-1">
              Aktif:
            </span>
            {activeClipEffects.map((eff) => (
              <div
                key={eff.id}
                onClick={() => setSelectedEffectId(eff.type)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedEffectId === eff.type
                    ? 'accent-gradient text-white shadow-md'
                    : 'bg-[#1b1b22] text-zinc-200 border border-white/10'
                }`}
              >
                <span>{eff.name}</span>
                <span className="text-[9px] opacity-80 font-mono">({Math.round(eff.intensity * 100)}%)</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!clip) return;
                    HapticEngine.impactMedium();
                    const updated = activeClipEffects.filter((x) => x.id !== eff.id);
                    updateClip(clip.id, { effects: updated });
                  }}
                  className="hover:text-rose-400 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Category Tabs */}
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

        {/* 50+ Effects Grid with Highly Legible Typography & High Contrast Cards */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-2.5 min-h-[220px] p-1">
          {filteredEffects.map((effect) => {
            const isApplied = activeClipEffects.some((e) => e.type === effect.id || e.id.includes(effect.id));
            const isSelected = selectedEffectId === effect.id;

            return (
              <button
                key={effect.id}
                onClick={() => handleToggleEffect(effect)}
                className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all text-center gap-2 relative overflow-hidden group shadow-lg ${
                  isApplied
                    ? 'border-pink-500 bg-pink-950/40 shadow-lg shadow-pink-500/20'
                    : isSelected
                    ? 'border-purple-400 bg-purple-950/30'
                    : 'bg-[#181820] hover:bg-[#20202c] border-white/10 hover:border-purple-400/40'
                }`}
              >
                {/* Visual Icon Badge */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500/30 to-pink-500/30 flex items-center justify-center text-white shadow">
                  <Sparkles className="w-5 h-5 text-pink-300" />
                </div>

                {/* Highly Visible Title & Description */}
                <div className="flex flex-col items-center gap-1 w-full">
                  <span className="text-xs font-extrabold text-white text-center leading-snug w-full">
                    {effect.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 text-center line-clamp-2 leading-tight">
                    {effect.description}
                  </span>
                </div>

                {/* Applied Check Indicator */}
                {isApplied && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full accent-gradient flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Effect Intensity Slider */}
        {currentActiveEffect && (
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl spatial-glass flex-shrink-0">
            <div className="flex justify-between text-xs text-zinc-200 font-semibold">
              <span className="font-bold text-white">{currentActiveEffect.name} Yoğunluğu</span>
              <span className="font-mono text-pink-400 font-bold">
                {Math.round(currentActiveEffect.intensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={currentActiveEffect.intensity}
              onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg cursor-pointer accent-pink-400"
            />
          </div>
        )}

        {/* Footer Close */}
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
