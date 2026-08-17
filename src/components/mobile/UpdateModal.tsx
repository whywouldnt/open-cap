import React, { useState } from 'react';
import { AutoUpdaterEngine, UpdateInfo } from '@/engine/updater/AutoUpdaterEngine';
import { HapticEngine } from '@/engine/mobile/HapticEngine';
import {
  Sparkles,
  Download,
  CheckCircle,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  if (!isOpen || !updateInfo) return null;

  const handleStartUpdate = () => {
    HapticEngine.impactHeavy();
    setIsDownloading(true);
    setDownloadProgress(10);

    // Simulate progress while starting OS download intent
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          // Trigger APK package installer
          AutoUpdaterEngine.startApkDownload(updateInfo.apkDownloadUrl);
          return 100;
        }
        return prev + 18;
      });
    }, 150);
  };

  const formattedSize = updateInfo.fileSizeBytes
    ? `${(updateInfo.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : '28.5 MB';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-md card-stack-sheet p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden border border-purple-500/30">
        {/* Swipe Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-1 flex-shrink-0" />

        {/* Header with Glowing Update Badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl accent-gradient flex items-center justify-center shadow-lg shadow-pink-500/30 animate-pulse flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Yeni Güncelleme Hazır!</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mt-0.5">
                <span className="text-zinc-500 line-through">v{updateInfo.currentVersion}</span>
                <ArrowRight className="w-3 h-3 text-pink-400" />
                <span className="text-purple-300 font-bold bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-400/30">
                  v{updateInfo.latestVersion}
                </span>
                <span>•</span>
                <span>{formattedSize}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Release Title & Notes */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#161622] border border-white/5 overflow-y-auto max-h-[220px]">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>✨ {updateInfo.releaseName}</span>
          </span>

          <div className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed font-sans opacity-90">
            {updateInfo.releaseNotes || '• Genel performans optimizasyonları ve hata düzeltmeleri yapıldı.\n• Yeni GPU video filtreleri ve animasyonlar eklendi.'}
          </div>
        </div>

        {/* Download Progress Bar (If active) */}
        {isDownloading && (
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl spatial-glass">
            <div className="flex justify-between text-xs text-zinc-300 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <RefreshCw className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                <span>APK İndiriliyor & Hazırlanıyor...</span>
              </span>
              <span className="font-mono text-pink-400 font-bold">{downloadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full accent-gradient transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleStartUpdate}
            disabled={isDownloading}
            className="w-full py-3.5 accent-gradient text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isDownloading ? 'İndiriliyor...' : 'Şimdi Güncelle & Yükle (1-Tık)'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 spatial-glass-pill text-zinc-400 hover:text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
          >
            Daha Sonra Hatırlat
          </button>
        </div>
      </div>
    </div>
  );
};
