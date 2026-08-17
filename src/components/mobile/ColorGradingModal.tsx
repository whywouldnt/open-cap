import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { BUILTIN_LUTS, LUTPreset } from '@/engine/vfx/LUTParser';
import {
  X,
  Palette,
  Sun,
  Contrast,
  Droplet,
  Thermometer,
  Disc,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ColorGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColorGradingModal: React.FC<ColorGradingModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  const [activeTab, setActiveTab] = useState<'luts' | 'adjust'>('luts');
  const [activeLut, setActiveLut] = useState<string>('tealOrange');

  // Color parameters state
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [vignette, setVignette] = useState<number>(0);

  if (!isOpen || !clip) return null;

  const handleSelectLut = (lutId: string) => {
    setActiveLut(lutId);
    // Add or update LUT effect on clip
    const effects = clip.effects || [];
    const lutIndex = effects.findIndex((e) => e.type === 'lut' || e.name.startsWith('LUT:'));

    if (lutId === 'none') {
      if (lutIndex !== -1) {
        updateClip(clip.id, { effects: effects.filter((_, i) => i !== lutIndex) });
      }
    } else {
      const lutDef = BUILTIN_LUTS.find((l) => l.id === lutId);
      const newLutEffect = {
        id: `fx-lut-${Date.now()}`,
        type: 'lut',
        name: `LUT: ${lutDef?.name || lutId}`,
        enabled: true,
        intensity: 1.0,
        params: { lutId },
      };

      if (lutIndex !== -1) {
        const updated = [...effects];
        updated[lutIndex] = newLutEffect;
        updateClip(clip.id, { effects: updated });
      } else {
        updateClip(clip.id, { effects: [...effects, newLutEffect] });
      }
    }
  };

  const handleResetAdjustments = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setTemperature(0);
    setVignette(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Renk Derecelendirme & 3D LUT</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#1b1b22] p-1 rounded-xl border border-white/5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('luts')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'luts'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D LUT Hazır Renkler</span>
          </button>

          <button
            onClick={() => setActiveTab('adjust')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'adjust'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manuel Renk Ayarları</span>
          </button>
        </div>

        {/* TAB 1: 3D LUT Presets */}
        {activeTab === 'luts' && (
          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 min-h-[220px]">
            {BUILTIN_LUTS.map((lut) => {
              const isSelected = activeLut === lut.id;
              return (
                <button
                  key={lut.id}
                  onClick={() => handleSelectLut(lut.id)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-[#1b1b22] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <div
                        style={{ backgroundColor: lut.previewColor }}
                        className="w-3 h-3 rounded-full shadow"
                      />
                      <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                        {lut.name}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                    {lut.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 2: Manual Adjustments */}
        {activeTab === 'adjust' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* Brightness */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Parlaklık (Brightness)
                </span>
                <span className="font-mono text-amber-400">{brightness > 0 ? `+${brightness}` : brightness}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-amber-400"
              />
            </div>

            {/* Contrast */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-amber-400" />
                  Kontrast (Contrast)
                </span>
                <span className="font-mono text-amber-400">{contrast > 0 ? `+${contrast}` : contrast}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-amber-400"
              />
            </div>

            {/* Saturation */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-emerald-400" />
                  Doygunluk (Saturation)
                </span>
                <span className="font-mono text-emerald-400">{saturation > 0 ? `+${saturation}` : saturation}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Temperature */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  Sıcaklık (Temperature)
                </span>
                <span className="font-mono text-rose-400">{temperature > 0 ? `+${temperature}` : temperature}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-rose-400"
              />
            </div>

            {/* Vignette */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5 text-purple-400" />
                  Vinyet (Vignette)
                </span>
                <span className="font-mono text-purple-400">{vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={vignette}
                onChange={(e) => setVignette(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-purple-400"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetAdjustments}
              className="py-1.5 text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1 mt-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ayarları Sıfırla</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          Tamamla
        </button>
      </div>
    </div>
  );
};
