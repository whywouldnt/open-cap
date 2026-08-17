import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { TransformClipCommand } from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { Transform } from '@/types/project';
import { X, RotateCw, Move, Maximize, Eye, RefreshCw } from 'lucide-react';

interface TransformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransformModal: React.FC<TransformModalProps> = ({ isOpen, onClose }) => {
  const { project, getClipById, updateClipTransform } = useProjectStore();
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

  const [initialTransform, setInitialTransform] = useState<Transform | null>(null);
  const [currentTransform, setCurrentTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    anchorX: 0.5,
    anchorY: 0.5,
  });

  useEffect(() => {
    if (clip) {
      setInitialTransform({ ...clip.transform });
      setCurrentTransform({ ...clip.transform });
    }
  }, [clip?.id, isOpen]);

  if (!isOpen || !clip) return null;

  const handleUpdate = (updated: Partial<Transform>) => {
    const next = { ...currentTransform, ...updated };
    setCurrentTransform(next);
    updateClipTransform(clip.id, next);
  };

  const handleSaveAndClose = () => {
    if (initialTransform && clip) {
      const transformCmd = new TransformClipCommand(
        clip.id,
        initialTransform,
        currentTransform
      );
      historyManager.execute(transformCmd);
    }
    onClose();
  };

  const handleReset = () => {
    const defaultT: Transform = {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      anchorX: 0.5,
      anchorY: 0.5,
    };
    handleUpdate(defaultT);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in select-none">
      <div className="w-full sm:max-w-md bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Dönüştür & Konum</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1 rounded text-zinc-400 hover:text-white flex items-center gap-1 text-xs"
              title="Sıfırla"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
            <button
              onClick={handleSaveAndClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-3 text-xs">
          {/* Scale */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-zinc-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-cyan-400" />
                Ölçek (Scale)
              </span>
              <span className="font-mono text-cyan-400">
                {Math.round(currentTransform.scaleX * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={currentTransform.scaleX}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleUpdate({ scaleX: val, scaleY: val });
              }}
              className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Rotation */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-zinc-300 font-medium">
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                Döndürme (Rotation)
              </span>
              <span className="font-mono text-amber-400">
                {Math.round(currentTransform.rotation)}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={currentTransform.rotation}
              onChange={(e) =>
                handleUpdate({ rotation: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-amber-400"
            />
          </div>

          {/* Opacity */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-zinc-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                Opaklık (Opacity)
              </span>
              <span className="font-mono text-emerald-400">
                {Math.round(currentTransform.opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.02"
              value={currentTransform.opacity}
              onChange={(e) =>
                handleUpdate({ opacity: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Offset X & Offset Y */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-zinc-400">X Konumu: {Math.round(currentTransform.x)}px</span>
              <input
                type="range"
                min="-200"
                max="200"
                step="2"
                value={currentTransform.x}
                onChange={(e) =>
                  handleUpdate({ x: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-zinc-700 rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-zinc-400">Y Konumu: {Math.round(currentTransform.y)}px</span>
              <input
                type="range"
                min="-200"
                max="200"
                step="2"
                value={currentTransform.y}
                onChange={(e) =>
                  handleUpdate({ y: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-zinc-700 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Apply */}
        <button
          onClick={handleSaveAndClose}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          Uygula & Kapat
        </button>
      </div>
    </div>
  );
};
