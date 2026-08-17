import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { SmartCutoutEngine, SmartCutoutOptions } from '@/engine/ai/SmartCutout';
import {
  X,
  Sparkles,
  User,
  Sliders,
  Check,
  Zap,
  Layers,
  Palette,
  Eye,
} from 'lucide-react';

interface SmartCutoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartCutoutModal: React.FC<SmartCutoutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedClipId } = useTimelineStore();
  const { getClipById, updateClip } = useProjectStore();

  const selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  const clip = selectedData?.clip;

  const [cutoutMode, setCutoutMode] = useState<'transparent' | 'portraitBlur' | 'neonOutline'>('neonOutline');
  const [feather, setFeather] = useState<number>(0.2);
  const [neonColor, setNeonColor] = useState<string>('#00f0ff');

  if (!isOpen || !clip) return null;

  const neonColors = ['#00f0ff', '#facc15', '#f43f5e', '#10b981', '#a855f7', '#ffffff'];

  const handleApplyCutout = () => {
    const updates = SmartCutoutEngine.applySmartCutout(clip, {
      mode: cutoutMode,
      feather,
      neonColor,
      neonWidth: 6,
    });

    updateClip(clip.id, updates);
    onClose();
  };

  const handleRemoveCutout = () => {
    updateClip(clip.id, {
      mask: { type: 'none', inverted: false, feather: 0, position: { x: 0, y: 0 }, size: { width: 1, height: 1 }, rotation: 0 },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">AI Akıllı Kesme (Smart Cutout)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          {[
            { id: 'neonOutline', label: 'Neon Kontur', desc: 'Işıltılı İnsan Dış Hattı' },
            { id: 'portraitBlur', label: 'Portre Bokeh', desc: 'Arka Plan Bulanıklığı' },
            { id: 'transparent', label: 'Arka Plan Sil', desc: 'Şeffaf İnsan Maskesi' },
          ].map((item) => {
            const isSelected = cutoutMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCutoutMode(item.id as any)}
                className={`flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow'
                    : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="font-bold text-xs">{item.label}</span>
                <span className="text-[9px] opacity-75 mt-0.5 text-center">{item.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Neon Color Picker (If Neon Outline selected) */}
        {cutoutMode === 'neonOutline' && (
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#121216] border border-white/5 flex-shrink-0">
            <span className="text-xs font-medium text-zinc-300">Neon Kontur Rengi</span>
            <div className="flex gap-2">
              {neonColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setNeonColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full shadow border-2 transition-transform ${
                    neonColor === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Feather Slider */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#121216] border border-white/5 flex-shrink-0">
          <div className="flex justify-between text-xs text-zinc-300">
            <span>Kenar Yumuşatma (Feather)</span>
            <span className="font-mono text-purple-400 font-bold">{Math.round(feather * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.02"
            value={feather}
            onChange={(e) => setFeather(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-purple-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0 pt-2">
          <button
            onClick={handleRemoveCutout}
            className="px-4 py-2.5 bg-[#1b1b22] border border-white/10 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
          >
            Sıfırla
          </button>

          <button
            onClick={handleApplyCutout}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Akıllı Kesmeyi Uygula</span>
          </button>
        </div>
      </div>
    </div>
  );
};
