import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { MultiCamEngine, CameraAngle } from '@/engine/multicam/MultiCamEngine';
import {
  X,
  Video,
  Camera,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Sliders,
  Check,
  RefreshCw,
} from 'lucide-react';

interface MultiCamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiCamModal: React.FC<MultiCamModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { project, updateClip } = useProjectStore();

  const [angles, setAngles] = useState<CameraAngle[]>([
    { id: 'cam-1', name: 'Kamera A (Geniş Açı)', clipId: 'clip-v1', trackId: 'track-1', timeOffsetSeconds: 0, confidence: 1.0 },
    { id: 'cam-2', name: 'Kamera B (Yakın Plan)', clipId: 'clip-v2', trackId: 'track-2', timeOffsetSeconds: 0.42, confidence: 0.95 },
    { id: 'cam-3', name: 'Kamera C (Yan Detay)', clipId: 'clip-v3', trackId: 'track-3', timeOffsetSeconds: -0.28, confidence: 0.91 },
  ]);

  const [activeAngleIndex, setActiveAngleIndex] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSynced, setIsSynced] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSyncAudio = () => {
    setIsSyncing(true);
    setIsSynced(false);

    setTimeout(() => {
      const synced = MultiCamEngine.synchronizeCameraAngles(angles);
      setAngles(synced);
      setIsSyncing(false);
      setIsSynced(true);
    }, 600);
  };

  const handleSelectActiveAngle = (index: number) => {
    setActiveAngleIndex(index);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Çoklu Kamera (Multi-Cam) Senkronizasyonu</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Angle Quad Preview Grid */}
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          {angles.map((cam, idx) => {
            const isActive = activeAngleIndex === idx;
            return (
              <button
                key={cam.id}
                onClick={() => handleSelectActiveAngle(idx)}
                className={`relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all flex flex-col items-center justify-between p-2 ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'border-white/10 bg-[#121216] hover:border-white/20'
                }`}
              >
                {/* Badge */}
                <div className="w-full flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-cyan-400 text-black' : 'bg-black/60 text-white'}`}>
                    AÇI {idx + 1}
                  </span>
                  {isActive && <Check className="w-3 h-3 text-cyan-400" />}
                </div>

                {/* Cam Icon Simulation */}
                <div className="flex flex-col items-center gap-1 text-zinc-400">
                  <Camera className="w-6 h-6" />
                  <span className="text-[9px] font-bold text-center line-clamp-1">{cam.name}</span>
                </div>

                {/* Sync Offset Pill */}
                <span className="text-[9px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-zinc-300">
                  {cam.timeOffsetSeconds === 0 ? 'Referans (0s)' : `${cam.timeOffsetSeconds > 0 ? '+' : ''}${cam.timeOffsetSeconds}s`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sync Info Card */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#121216] border border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Ses Dalga Formu Eşleme (Cross-Correlation)</span>
            </div>
            {isSynced && (
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Senkronize (%95 Güven)
              </span>
            )}
          </div>

          <p className="text-[11px] text-zinc-400">
            Farklı kameralardan kaydedilen videoların ses izlerini analiz ederek tüm açıları milisaniye hassasiyetinde otomatik hizalar.
          </p>

          <button
            onClick={handleSyncAudio}
            disabled={isSyncing}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Ses İzleri Analiz Ediliyor...' : 'Ses Dalgalarına Göre Otomatik Eşle'}</span>
          </button>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#1b1b22] border border-white/10 text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex-shrink-0"
        >
          Seçilen Açıyı Onayla ve Kapat
        </button>
      </div>
    </div>
  );
};
