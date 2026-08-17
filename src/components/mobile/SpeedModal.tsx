import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { SpeedCurve, SpeedCurvePreset } from '@/types/project';
import { SPEED_PRESETS, SpeedCurveEngine } from '@/engine/speed/SpeedCurveEngine';
import { FreezeFrameEngine } from '@/engine/speed/FreezeFrame';
import {
  SetClipSpeedCommand,
  SetClipSpeedCurveCommand,
  FreezeFrameCommand,
  ReverseClipCommand,
} from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { formatDuration } from '@/utils/timecode';
import { SpeedCurveEditor } from './SpeedCurveEditor';
import {
  X,
  Gauge,
  Zap,
  Snowflake,
  RotateCcw,
  Sparkles,
  Volume2,
  Sliders,
  Check,
  Film,
} from 'lucide-react';

interface SpeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpeedModal: React.FC<SpeedModalProps> = ({ isOpen, onClose }) => {
  const { selectedClipId, currentTime } = useTimelineStore();
  const { project, getClipById, updateClip } = useProjectStore();

  let selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  if (!selectedData) {
    for (const trk of project.tracks) {
      const activeClip = trk.clips.find(
        (c) => currentTime >= c.startTime && currentTime < c.startTime + c.duration
      );
      if (activeClip) {
        selectedData = { clip: activeClip, track: trk, index: trk.clips.indexOf(activeClip) };
        break;
      }
    }
    if (!selectedData) {
      for (const trk of project.tracks) {
        if (trk.clips.length > 0) {
          selectedData = { clip: trk.clips[0], track: trk, index: 0 };
          break;
        }
      }
    }
  }

  const clip = selectedData?.clip;
  const track = selectedData?.track;

  const [activeTab, setActiveTab] = useState<'normal' | 'curve' | 'tools'>('normal');

  if (!isOpen || !clip || !track) return null;

  const currentSpeed = clip.speed || 1.0;
  const currentCurve: SpeedCurve = clip.speedCurve || {
    preset: 'custom',
    points: SPEED_PRESETS.custom,
  };

  // Normal Speed Change
  const handleSetSpeed = (newSpeed: number) => {
    const clamped = Math.max(0.1, Math.min(100.0, newSpeed));
    // Calculate new timeline duration based on source media segment
    const sourceSegment = clip.sourceDuration || clip.duration * clip.speed;
    const newDuration = Math.max(0.1, sourceSegment / clamped);

    const cmd = new SetClipSpeedCommand(
      clip.id,
      clip.speed,
      clip.duration,
      clamped,
      newDuration,
      clip.preservePitch
    );
    historyManager.execute(cmd);
  };

  // Preset Curve Selection
  const handleSelectCurvePreset = (preset: SpeedCurvePreset) => {
    const points = SPEED_PRESETS[preset];
    const newCurve: SpeedCurve = { preset, points };
    const sourceSegment = clip.sourceDuration || clip.duration * clip.speed;
    const newDuration = SpeedCurveEngine.calculateTimelineDuration(sourceSegment, newCurve);

    const cmd = new SetClipSpeedCurveCommand(
      clip.id,
      clip.speedCurve,
      clip.duration,
      newCurve,
      newDuration
    );
    historyManager.execute(cmd);
  };

  // Custom Curve Point Adjustment
  const handleCustomCurveChange = (updatedCurve: SpeedCurve) => {
    const sourceSegment = clip.sourceDuration || clip.duration * clip.speed;
    const newDuration = SpeedCurveEngine.calculateTimelineDuration(sourceSegment, updatedCurve);
    updateClip(clip.id, { speedCurve: updatedCurve, duration: newDuration });
  };

  // Freeze Frame (Donma Karesi)
  const handleFreezeFrame = () => {
    const result = FreezeFrameEngine.createFreezeFrame(track, clip, currentTime, 2.0);
    if (!result) {
      alert('İmleç (playhead) klibin iç bölgesinde olmalıdır.');
      return;
    }
    const cmd = new FreezeFrameCommand(track.id, result.originalClips, result.updatedClips);
    historyManager.execute(cmd);
    onClose();
  };

  // Reverse Video (Ters Oynat)
  const handleToggleReverse = () => {
    const isReversed = !clip.isReversed;
    const cmd = new ReverseClipCommand(clip.id, !!clip.isReversed, isReversed);
    historyManager.execute(cmd);
  };

  // Pitch Correction Toggle
  const handleTogglePitch = () => {
    updateClip(clip.id, { preservePitch: !clip.preservePitch });
  };

  // Smooth Slow-Motion Toggle
  const handleToggleSmoothSlowMo = () => {
    const nextMode =
      clip.smoothSlowMotion === 'opticalFlow'
        ? 'none'
        : clip.smoothSlowMotion === 'frameBlending'
        ? 'opticalFlow'
        : 'frameBlending';
    updateClip(clip.id, { smoothSlowMotion: nextMode });
  };

  const speedPresets = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 50.0, 100.0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Hız & Zaman Manipülasyonu</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#1b1b22] p-1 rounded-xl border border-white/5 flex-shrink-0">
          {[
            { id: 'normal', label: 'Standart Hız', icon: <Gauge className="w-3.5 h-3.5" /> },
            { id: 'curve', label: 'Hız Eğrileri', icon: <Zap className="w-3.5 h-3.5" /> },
            { id: 'tools', label: 'Dondur & Ters', icon: <Snowflake className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Normal Speed */}
        {activeTab === 'normal' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* Speed Value Hero */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Oynatma Hızı</span>
              <span className="text-2xl font-black font-mono text-cyan-400">
                {currentSpeed.toFixed(1)}x
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0.1"
              max="20.0"
              step="0.1"
              value={currentSpeed}
              onChange={(e) => handleSetSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg cursor-pointer accent-cyan-400"
            />

            {/* Preset Speed Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {speedPresets.map((sp) => (
                <button
                  key={sp}
                  onClick={() => handleSetSpeed(sp)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    Math.abs(currentSpeed - sp) < 0.05
                      ? 'bg-cyan-400 text-black shadow'
                      : 'bg-[#1b1b22] text-zinc-300 hover:text-white border border-white/5'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>

            {/* Pitch Correction & Smooth Slow-Mo Toggles */}
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/5">
              {/* Pitch Correction */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  Ses Perdesini Koru (Pitch Correction)
                </span>
                <button
                  onClick={handleTogglePitch}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    clip.preservePitch
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {clip.preservePitch ? 'Açık' : 'Kapalı'}
                </button>
              </div>

              {/* Optical Flow Smooth Slow-Mo */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Pürüzsüz Ağır Çekim (Optik Akış)
                </span>
                <button
                  onClick={handleToggleSmoothSlowMo}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    clip.smoothSlowMotion && clip.smoothSlowMotion !== 'none'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {clip.smoothSlowMotion === 'opticalFlow'
                    ? 'Optik Akış (GPU)'
                    : clip.smoothSlowMotion === 'frameBlending'
                    ? 'Kare Harmanlama'
                    : 'Kapalı'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Speed Curves */}
        {activeTab === 'curve' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-2 rounded-xl bg-[#121216] border border-white/5">
            {/* Curve Preset Buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'montage', label: 'Montaj' },
                { id: 'hero', label: 'Hero Time' },
                { id: 'bullet', label: 'Bullet Time' },
                { id: 'flashIn', label: 'Flash In' },
                { id: 'flashOut', label: 'Flash Out' },
                { id: 'custom', label: 'Özel Bezier' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCurvePreset(c.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    currentCurve.preset === c.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow'
                      : 'bg-[#1b1b22] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Interactive Canvas Editor */}
            <SpeedCurveEditor
              curve={currentCurve}
              onChange={handleCustomCurveChange}
            />
          </div>
        )}

        {/* TAB 3: Freeze Frame & Reverse */}
        {activeTab === 'tools' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* Freeze Frame Card */}
            <div className="p-3 rounded-xl bg-[#1b1b22] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Donma Karesi (Freeze Frame)</h4>
                  <p className="text-[10px] text-zinc-400">
                    Oynatma imlecinin bulunduğu kareyi 2 saniyelik durağan klip olarak araya ekler.
                  </p>
                </div>
              </div>

              <button
                onClick={handleFreezeFrame}
                className="w-full py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-lg active:scale-95 transition-all shadow"
              >
                İmleç Noktasını Dondur
              </button>
            </div>

            {/* Reverse Video Card */}
            <div className="p-3 rounded-xl bg-[#1b1b22] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Ters Oynat (Reverse Video/Audio)</h4>
                  <p className="text-[10px] text-zinc-400">
                    Klibi baştan sona geriye doğru ters oynatır.
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleReverse}
                className={`w-full py-2 font-bold text-xs rounded-lg active:scale-95 transition-all shadow ${
                  clip.isReversed
                    ? 'bg-amber-400 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {clip.isReversed ? 'Ters Oynatma Aktif (Kapat)' : 'Klibi Ters Oynat'}
              </button>
            </div>
          </div>
        )}

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
