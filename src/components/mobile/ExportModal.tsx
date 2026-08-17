import React, { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import {
  ExportFormat,
  ExportCodec,
  ExportSettings,
  RenderManager,
  RenderProgressData,
} from '@/engine/export/RenderManager';
import {
  X,
  Share2,
  CheckCircle2,
  FileVideo,
  Zap,
  HardDrive,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Film,
  Music,
  Image as ImageIcon,
  Clock,
  Activity,
  Check,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project } = useProjectStore();

  // Export Settings State
  const [resolutionLabel, setResolutionLabel] = useState<'720p' | '1080p' | '2K' | '4K'>('1080p');
  const [fps, setFps] = useState<24 | 30 | 60>(60);
  const [format, setFormat] = useState<ExportFormat>('mp4');
  const [codec, setCodec] = useState<ExportCodec>('h264');
  const [bitrateKbps, setBitrateKbps] = useState<number>(15000); // 15 Mbps
  const [useHardwareAccel, setUseHardwareAccel] = useState<boolean>(true);

  // Render Execution State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressData, setProgressData] = useState<RenderProgressData | null>(null);
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen) return null;

  // Resolutions map (Respecting 9:16 mobile aspect ratio by default)
  const resolutions = {
    '720p': { width: 720, height: 1280, label: '720p' as const },
    '1080p': { width: 1080, height: 1920, label: '1080p' as const },
    '2K': { width: 1440, height: 2560, label: '2K' as const },
    '4K': { width: 2160, height: 3840, label: '4K' as const },
  };

  const estimatedSize = RenderManager.calculateEstimatedSizeMb(
    project.duration,
    bitrateKbps,
    format
  );

  const handleStartExport = async () => {
    setIsExporting(true);
    setIsDone(false);

    const exportSettings: ExportSettings = {
      resolution: resolutions[resolutionLabel],
      fps,
      format,
      codec,
      bitrateKbps,
      useHardwareAccel,
    };

    const finalResult = await RenderManager.startRenderJob(
      project,
      exportSettings,
      (prog) => {
        setProgressData(prog);
      }
    );

    setIsExporting(false);
    setIsDone(true);
  };

  const handleReset = () => {
    setIsExporting(false);
    setIsDone(false);
    setProgressData(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Donanım Hızlandırmalı Dışa Aktarma</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. RENDER IN PROGRESS VIEW */}
        {isExporting && progressData && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 gap-4">
            {/* Progress Percentage Badge */}
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-zinc-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-cyan-400 transition-all duration-150"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={301.6}
                  strokeDashoffset={301.6 * (1 - progressData.progress)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white font-mono">
                  {Math.round(progressData.progress * 100)}%
                </span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Kodlanıyor
                </span>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              <div className="flex flex-col p-2 rounded-xl bg-[#1b1b22] border border-white/5 text-center">
                <span className="text-[10px] text-zinc-400">Anlık Kodlama Hızı</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {progressData.fps.toFixed(1)} FPS
                </span>
              </div>

              <div className="flex flex-col p-2 rounded-xl bg-[#1b1b22] border border-white/5 text-center">
                <span className="text-[10px] text-zinc-400">Kalan Süre (ETA)</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  ~{progressData.etaSeconds} saniye
                </span>
              </div>

              <div className="flex flex-col p-2 rounded-xl bg-[#1b1b22] border border-white/5 text-center">
                <span className="text-[10px] text-zinc-400">İşlenen Kare</span>
                <span className="text-xs font-mono font-bold text-zinc-200">
                  {progressData.currentFrame} / {progressData.totalFrames}
                </span>
              </div>

              <div className="flex flex-col p-2 rounded-xl bg-[#1b1b22] border border-white/5 text-center">
                <span className="text-[10px] text-zinc-400">Donanım Birimi</span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  MediaCodec / NVENC
                </span>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleReset}
              className="py-2 px-6 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 hover:bg-rose-500/30 transition-all mt-2"
            >
              Dışa Aktarmayı İptal Et
            </button>
          </div>
        )}

        {/* 2. RENDER COMPLETED VIEW */}
        {isDone && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="flex flex-col">
              <h4 className="text-base font-bold text-white">Video Başarıyla Dışa Aktarıldı!</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {resolutionLabel} • {fps} FPS • {format.toUpperCase()} ({estimatedSize})
              </p>
            </div>

            <div className="flex gap-2 w-full max-w-xs mt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#1b1b22] border border-white/10 text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
              >
                Kapat
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Paylaş</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. SETTINGS & CONFIGURATION VIEW */}
        {!isExporting && !isDone && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
            {/* Resolution Selector */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-zinc-300 font-medium">Çözünürlük (Resolution)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['720p', '1080p', '2K', '4K'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolutionLabel(res)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      resolutionLabel === res
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow'
                        : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate (FPS) Selector */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-zinc-300 font-medium">Kare Hızı (Frame Rate)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { val: 24, label: '24 FPS (Sinema)' },
                  { val: 30, label: '30 FPS (Standart)' },
                  { val: 60, label: '60 FPS (Akıcı)' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setFps(item.val as any)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      fps === item.val
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow'
                        : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Codec & Format Selector */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-zinc-300 font-medium">Format & Kodlayıcı (Codec)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { fmt: 'mp4' as const, cdc: 'h264' as const, label: 'MP4 (H.264)', desc: 'Evrensel' },
                  { fmt: 'mp4' as const, cdc: 'hevc' as const, label: 'MP4 (H.265)', desc: 'Yüksek Sıkıştırma' },
                  { fmt: 'mov' as const, cdc: 'prores' as const, label: 'ProRes 422', desc: 'Kayıpsız Master' },
                  { fmt: 'gif' as const, cdc: 'gif' as const, label: 'GIF Animasyon', desc: 'Sosyal Medya' },
                  { fmt: 'webm' as const, cdc: 'vp9' as const, label: 'WebM (VP9)', desc: 'Web Yayını' },
                  { fmt: 'wav' as const, cdc: 'pcm' as const, label: 'Ses (WAV)', desc: 'Sadece Ses' },
                ].map((item) => {
                  const isSelected = format === item.fmt && codec === item.cdc;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setFormat(item.fmt);
                        setCodec(item.cdc);
                      }}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow'
                          : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-[11px] truncate">{item.label}</span>
                      <span className="text-[9px] opacity-75">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bitrate Slider */}
            <div className="flex flex-col gap-1 text-xs p-3 rounded-xl bg-[#121216] border border-white/5">
              <div className="flex justify-between text-zinc-300 font-medium">
                <span>Bitrate (Veri Oranı)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round(bitrateKbps / 1000)} Mbps
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="60000"
                step="1000"
                value={bitrateKbps}
                onChange={(e) => setBitrateKbps(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-cyan-400"
              />

              {/* Hardware Acceleration Switch */}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-zinc-300">Donanım Hızlandırma (GPU Enc.)</span>
                </div>
                <button
                  onClick={() => setUseHardwareAccel(!useHardwareAccel)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    useHardwareAccel
                      ? 'bg-amber-400 text-black shadow'
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {useHardwareAccel ? 'Aktif' : 'Pasif'}
                </button>
              </div>
            </div>

            {/* Summary Banner */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1b1b22] border border-white/5 text-xs">
              <span className="text-zinc-400">Tahmini Dosya Boyutu:</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">
                {estimatedSize}
              </span>
            </div>

            {/* Start Export Button */}
            <button
              onClick={handleStartExport}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Share2 className="w-4 h-4 fill-black" />
              <span>Dışa Aktarmayı Başlat ({estimatedSize})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
