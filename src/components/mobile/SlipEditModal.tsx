import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { SlipClipCommand } from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { formatDuration } from '@/utils/timecode';
import {
  X,
  SlidersHorizontal,
  Film,
  Music,
  ArrowLeftRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface SlipEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlipEditModal: React.FC<SlipEditModalProps> = ({ isOpen, onClose }) => {
  const { selectedClipId } = useTimelineStore();
  const { getClipById, updateClip } = useProjectStore();

  const selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  const clip = selectedData?.clip;

  const [initialSourceStart, setInitialSourceStart] = useState(0);
  const [currentSourceStart, setCurrentSourceStart] = useState(0);

  useEffect(() => {
    if (clip) {
      setInitialSourceStart(clip.sourceStartTime);
      setCurrentSourceStart(clip.sourceStartTime);
    }
  }, [clip?.id, isOpen]);

  if (!isOpen || !clip) return null;

  const maxSourceStart = Math.max(0, clip.sourceDuration - clip.duration);

  const handleSliderChange = (newSourceStart: number) => {
    setCurrentSourceStart(newSourceStart);
    updateClip(clip.id, { sourceStartTime: newSourceStart });
  };

  const handleSaveAndClose = () => {
    if (clip && Math.abs(currentSourceStart - initialSourceStart) > 0.01) {
      const cmd = new SlipClipCommand(clip.id, initialSourceStart, currentSourceStart);
      historyManager.execute(cmd);
    }
    onClose();
  };

  const handleReset = () => {
    handleSliderChange(initialSourceStart);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-md bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Kaynak Kaydır (Slip Edit)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1 rounded text-zinc-400 hover:text-white flex items-center gap-1 text-xs"
              title="İlk Haline Döndür"
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

        {/* Info Banner */}
        <div className="p-3 rounded-xl bg-[#1b1b22] border border-white/5 flex flex-col gap-1.5 text-xs">
          <span className="font-bold text-white truncate">{clip.name}</span>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
            <div>
              <span>Timeline Süresi: </span>
              <span className="text-cyan-300 font-bold">{formatDuration(clip.duration)}</span>
            </div>
            <div>
              <span>Medya Toplamı: </span>
              <span className="text-white">{formatDuration(clip.sourceDuration)}</span>
            </div>
          </div>
        </div>

        {/* Slip In-Point Range Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              Medyada Başlangıç Noktası (In-Point)
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {formatDuration(currentSourceStart)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max={maxSourceStart || 1}
            step="0.05"
            value={currentSourceStart}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg cursor-pointer accent-amber-400"
          />

          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>00:00.0 (Medya Başı)</span>
            <span>Bitiş: {formatDuration(currentSourceStart + clip.duration)}</span>
            <span>{formatDuration(clip.sourceDuration)} (Medya Sonu)</span>
          </div>
        </div>

        {/* Visual Strip Indicator */}
        <div className="p-2.5 rounded-xl bg-[#121216] border border-white/5 flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Kullanılan Medya Aralığı
          </span>
          <div className="w-full h-5 bg-zinc-800 rounded-lg overflow-hidden relative flex items-center">
            {/* Active Window */}
            <div
              style={{
                left: `${(currentSourceStart / (clip.sourceDuration || 1)) * 100}%`,
                width: `${(clip.duration / (clip.sourceDuration || 1)) * 100}%`,
              }}
              className="absolute h-full bg-gradient-to-r from-amber-400 to-yellow-300 border border-black rounded shadow"
            />
          </div>
        </div>

        {/* Apply CTA */}
        <button
          onClick={handleSaveAndClose}
          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          Uygula & Kapat
        </button>
      </div>
    </div>
  );
};
