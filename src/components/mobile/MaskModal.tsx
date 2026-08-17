import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { MASK_PRESETS } from '@/engine/gpu/masking';
import { ClipMask, MaskType } from '@/types/project';
import {
  X,
  Sparkles,
  Layers,
  RotateCw,
  Maximize2,
  Sliders,
  Check,
  ToggleLeft,
  ToggleRight,
  Square,
  Circle,
  Split,
  EyeOff,
} from 'lucide-react';

interface MaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaskModal: React.FC<MaskModalProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen || !clip) return null;

  const currentMask: ClipMask = clip.mask || {
    type: 'none',
    inverted: false,
    feather: 0.1,
    position: { x: 0, y: 0 },
    size: { width: 0.6, height: 0.6 },
    rotation: 0,
  };

  const handleSelectPreset = (type: MaskType) => {
    const preset = MASK_PRESETS.find((p) => p.type === type);
    if (!preset) return;

    const newMask: ClipMask = {
      ...currentMask,
      type,
      ...preset.defaultParams,
    };
    updateClip(clip.id, { mask: newMask });
  };

  const handleUpdateMask = (updates: Partial<ClipMask>) => {
    const newMask: ClipMask = {
      ...currentMask,
      ...updates,
    };
    updateClip(clip.id, { mask: newMask });
  };

  const getPresetIcon = (type: MaskType) => {
    switch (type) {
      case 'none':
        return <EyeOff className="w-4 h-4 text-zinc-400" />;
      case 'linear':
        return <Split className="w-4 h-4 text-cyan-400" />;
      case 'mirror':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'radial':
        return <Circle className="w-4 h-4 text-emerald-400" />;
      case 'rectangle':
        return <Square className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Maske Kontrolleri (GPU Masking)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector Grid */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          {MASK_PRESETS.map((preset) => {
            const isSelected = currentMask.type === preset.type;
            return (
              <button
                key={preset.type}
                onClick={() => handleSelectPreset(preset.type)}
                className={`flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                    : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {getPresetIcon(preset.type)}
                <span className="text-[11px] font-bold mt-1">{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Mask Sliders */}
        {currentMask.type !== 'none' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* Invert Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Maskeyi Ters Çevir (Invert)</span>
              <button
                onClick={() => handleUpdateMask({ inverted: !currentMask.inverted })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentMask.inverted
                    ? 'bg-cyan-400 text-black shadow'
                    : 'bg-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {currentMask.inverted ? 'Ters Çevrildi' : 'Normal'}
              </button>
            </div>

            {/* Feather (Kenar Yumuşatma) Slider */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span>Kenar Yumuşatma (Feather)</span>
                <span className="font-mono text-cyan-400">
                  {Math.round((currentMask.feather || 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={currentMask.feather || 0}
                onChange={(e) =>
                  handleUpdateMask({ feather: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Size Width & Height */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400">Genişlik: {Math.round((currentMask.size?.width || 0.6) * 100)}%</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={currentMask.size?.width || 0.6}
                  onChange={(e) =>
                    handleUpdateMask({
                      size: {
                        width: parseFloat(e.target.value),
                        height: currentMask.size?.height || 0.6,
                      },
                    })
                  }
                  className="w-full h-1.5 bg-zinc-700 rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-zinc-400">Yükseklik: {Math.round((currentMask.size?.height || 0.6) * 100)}%</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={currentMask.size?.height || 0.6}
                  onChange={(e) =>
                    handleUpdateMask({
                      size: {
                        width: currentMask.size?.width || 0.6,
                        height: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full h-1.5 bg-zinc-700 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Rotation Slider */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  Döndürme Açısı
                </span>
                <span className="font-mono text-amber-400">
                  {Math.round(currentMask.rotation || 0)}°
                </span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={currentMask.rotation || 0}
                onChange={(e) =>
                  handleUpdateMask({ rotation: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          Uygula & Kapat
        </button>
      </div>
    </div>
  );
};
