import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { UpdateAudioSettingsCommand } from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { AudioSettings, VoiceEffectType, FadeCurveType } from '@/types/project';
import { EQ_FREQUENCIES, EQ_PRESETS, VOICE_EFFECTS } from '@/engine/audio/VoiceTransformers';
import { BeatDetectionEngine } from '@/engine/audio/BeatDetection';
import {
  X,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Zap,
  Radio,
  Music,
  Check,
  Disc,
  Activity,
  RotateCcw,
} from 'lucide-react';

interface AudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioModal: React.FC<AudioModalProps> = ({ isOpen, onClose }) => {
  const { selectedClipId } = useTimelineStore();
  const { getClipById, updateClipAudioSettings, getMediaById, project } = useProjectStore();

  const selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  const clip = selectedData?.clip;
  const mediaMetadata = clip?.mediaId ? getMediaById(clip.mediaId) : null;

  const [activeTab, setActiveTab] = useState<'basic' | 'eq' | 'voice' | 'enhance'>('basic');
  const [initialSettings, setInitialSettings] = useState<AudioSettings | null>(null);
  const [currentSettings, setCurrentSettings] = useState<AudioSettings>({
    volume: 1.0,
    pitch: 1.0,
    speed: 1.0,
    fadeIn: 0,
    fadeOut: 0,
    fadeCurve: 'sCurve',
    pan: 0,
    isMuted: false,
    noiseReduction: false,
    denoiseIntensity: 0.5,
    voiceEnhance: false,
    voiceEffect: 'none',
    equalizerBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  const [beatDetectedCount, setBeatDetectedCount] = useState<number | null>(null);

  useEffect(() => {
    if (clip) {
      setInitialSettings({ ...clip.audioSettings });
      setCurrentSettings({
        equalizerBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        voiceEffect: 'none',
        denoiseIntensity: 0.5,
        fadeCurve: 'sCurve',
        ...clip.audioSettings,
      });
    }
  }, [clip?.id, isOpen]);

  if (!isOpen || !clip) return null;

  const handleUpdate = (updated: Partial<AudioSettings>) => {
    const next = { ...currentSettings, ...updated };
    setCurrentSettings(next);
    updateClipAudioSettings(clip.id, next);
  };

  const handleSaveAndClose = () => {
    if (initialSettings && clip) {
      const audioCmd = new UpdateAudioSettingsCommand(
        clip.id,
        initialSettings,
        currentSettings
      );
      historyManager.execute(audioCmd);
    }
    onClose();
  };

  // EQ Band Change
  const handleEqBandChange = (index: number, gainDb: number) => {
    const currentBands = currentSettings.equalizerBands || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const newBands = [...currentBands];
    newBands[index] = gainDb;
    handleUpdate({ equalizerBands: newBands });
  };

  // EQ Preset Selection
  const handleSelectEqPreset = (presetBands: number[]) => {
    handleUpdate({ equalizerBands: [...presetBands] });
  };

  // Beat Detection Execution
  const handleDetectBeats = () => {
    const rawWaveform = mediaMetadata?.waveform || [];
    const result = BeatDetectionEngine.detectBeatsFromWaveform(rawWaveform, clip.duration, 1.0);

    // Merge new beat markers into project store
    useProjectStore.setState((state) => {
      state.project.markers = [...state.project.markers, ...result.markers];
    });

    setBeatDetectedCount(result.markers.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Ses & DSP Miksaj Motoru</h3>
          </div>
          <button
            onClick={handleSaveAndClose}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#1b1b22] p-1 rounded-xl border border-white/5 flex-shrink-0">
          {[
            { id: 'basic', label: 'Ses & Fade', icon: <Volume2 className="w-3.5 h-3.5" /> },
            { id: 'eq', label: '10-Bant EQ', icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: 'voice', label: 'Ses Efekti', icon: <Radio className="w-3.5 h-3.5" /> },
            { id: 'enhance', label: 'Denoise & Beat', icon: <Activity className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Basic Volume, Pan, Fade */}
        {activeTab === 'basic' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* Volume Slider */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300 font-medium">
                <span>Ses Düzeyi (Volume)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {Math.round(currentSettings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={currentSettings.volume}
                onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Stereo Pan (L - R) */}
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-zinc-300 font-medium">
                <span>Stereo Panlama (Sol / Sağ)</span>
                <span className="font-mono text-emerald-400">
                  {currentSettings.pan === 0
                    ? 'Merkez (C)'
                    : currentSettings.pan < 0
                    ? `L ${Math.round(Math.abs(currentSettings.pan) * 100)}%`
                    : `R ${Math.round(currentSettings.pan * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.05"
                value={currentSettings.pan}
                onChange={(e) => handleUpdate({ pan: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Fade In & Fade Out */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Fade In</span>
                  <span className="font-mono text-emerald-400">{currentSettings.fadeIn.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={currentSettings.fadeIn}
                  onChange={(e) => handleUpdate({ fadeIn: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Fade Out</span>
                  <span className="font-mono text-emerald-400">{currentSettings.fadeOut.toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={currentSettings.fadeOut}
                  onChange={(e) => handleUpdate({ fadeOut: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Mute Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-xs text-zinc-300">Sessize Al (Mute)</span>
              <button
                onClick={() => handleUpdate({ isMuted: !currentSettings.isMuted })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentSettings.isMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-white/5 text-zinc-400'
                }`}
              >
                {currentSettings.isMuted ? 'Sessiz' : 'Açık'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 10-Band Parametric EQ */}
        {activeTab === 'eq' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* EQ Presets Chips */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {EQ_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectEqPreset(p.bands)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-[#1b1b22] border border-white/5 text-zinc-300 hover:text-white active:bg-emerald-500/20"
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* 10 Vertical EQ Sliders */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 items-center bg-[#1b1b22] p-2.5 rounded-xl border border-white/5">
              {EQ_FREQUENCIES.map((freq, idx) => {
                const gain = currentSettings.equalizerBands?.[idx] ?? 0;
                return (
                  <div key={freq} className="flex flex-col items-center gap-1 text-[10px]">
                    <span className="font-mono text-emerald-400 font-bold">{gain > 0 ? `+${gain}` : gain}</span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={gain}
                      onChange={(e) => handleEqBandChange(idx, parseInt(e.target.value, 10))}
                      className="w-16 h-1 bg-zinc-700 rounded-lg cursor-pointer -rotate-90 my-6 accent-emerald-400"
                    />
                    <span className="text-zinc-500 font-mono">
                      {freq >= 1000 ? `${freq / 1000}k` : freq}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Voice Changer */}
        {activeTab === 'voice' && (
          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 min-h-[220px]">
            {VOICE_EFFECTS.map((vfx) => {
              const isSelected = currentSettings.voiceEffect === vfx.id;
              return (
                <button
                  key={vfx.id}
                  onClick={() => handleUpdate({ voiceEffect: vfx.id })}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'bg-[#1b1b22] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                      {vfx.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                    {vfx.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 4: Denoise & Beat Detection */}
        {activeTab === 'enhance' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* Denoise (Dip Gürültü Temizleme) */}
            <div className="p-3 rounded-xl bg-[#1b1b22] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Dip Gürültü Temizleme (Denoise)</span>
                <button
                  onClick={() => handleUpdate({ noiseReduction: !currentSettings.noiseReduction })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    currentSettings.noiseReduction
                      ? 'bg-emerald-400 text-black shadow'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {currentSettings.noiseReduction ? 'Açık' : 'Kapalı'}
                </button>
              </div>

              {currentSettings.noiseReduction && (
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Gürültü Baskılama Yoğunluğu</span>
                    <span className="font-mono text-emerald-400">
                      {Math.round((currentSettings.denoiseIntensity ?? 0.5) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={currentSettings.denoiseIntensity ?? 0.5}
                    onChange={(e) => handleUpdate({ denoiseIntensity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-emerald-400"
                  />
                </div>
              )}
            </div>

            {/* Beat Detection Card */}
            <div className="p-3 rounded-xl bg-[#1b1b22] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Ritim & Beat Algılama (Beat Sync)</h4>
                  <p className="text-[10px] text-zinc-400">
                    Müzikteki vuruş noktalarını analiz ederek timeline üzerine sarı işaretçiler yerleştirir.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDetectBeats}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>Ritim Vuruşlarını Algıla</span>
              </button>

              {beatDetectedCount !== null && (
                <span className="text-[11px] font-mono text-amber-400 text-center font-bold">
                  ✓ {beatDetectedCount} adet ritim vuruşu timeline'a eklendi!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={handleSaveAndClose}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          Tamamla
        </button>
      </div>
    </div>
  );
};
