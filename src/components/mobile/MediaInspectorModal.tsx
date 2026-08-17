import React from 'react';
import { ProjectMediaItem } from '@/types/project';
import {
  X,
  FileVideo,
  Music,
  Image as ImageIcon,
  Info,
  Cpu,
  Layers,
  Clock,
  HardDrive,
  Activity,
} from 'lucide-react';
import { formatDuration } from '@/utils/timecode';

interface MediaInspectorModalProps {
  media: ProjectMediaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaInspectorModal: React.FC<MediaInspectorModalProps> = ({
  media,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !media) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-md bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">FFprobe Medya Analizi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Thumbnail & Name Banner */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1b1b22] border border-white/5">
          <div className="w-14 h-14 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {media.thumbnailUri ? (
              <img
                src={media.thumbnailUri}
                alt={media.name}
                className="w-full h-full object-cover"
              />
            ) : media.mediaType === 'audio' ? (
              <Music className="w-6 h-6 text-emerald-400" />
            ) : (
              <FileVideo className="w-6 h-6 text-cyan-400" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">
              {media.name}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {media.mimeType}
            </span>
            <span className="text-[9px] text-cyan-300 font-mono">
              ID: {media.id}
            </span>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Duration */}
          <div className="p-2.5 rounded-xl bg-[#121216] border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              Süre
            </span>
            <span className="font-mono font-bold text-white">
              {formatDuration(media.duration)} ({media.duration.toFixed(2)}s)
            </span>
          </div>

          {/* File Size */}
          <div className="p-2.5 rounded-xl bg-[#121216] border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-emerald-400" />
              Dosya Boyutu
            </span>
            <span className="font-mono font-bold text-white">
              {formatFileSize(media.size)}
            </span>
          </div>

          {/* Resolution */}
          {media.width && media.height ? (
            <div className="p-2.5 rounded-xl bg-[#121216] border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-400" />
                Çözünürlük & FPS
              </span>
              <span className="font-mono font-bold text-white">
                {media.width}x{media.height} @ {media.fps || 60}fps
              </span>
            </div>
          ) : null}

          {/* Codec */}
          <div className="p-2.5 rounded-xl bg-[#121216] border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-purple-400" />
              Kodlayıcı (Codec)
            </span>
            <span className="font-mono font-bold text-white">
              {media.codec || 'Otomatik Algılama'}
            </span>
          </div>

          {/* Audio Channels & Sample Rate */}
          {media.sampleRate ? (
            <div className="p-2.5 rounded-xl bg-[#121216] border border-white/5 flex flex-col gap-1 col-span-2">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-rose-400" />
                Ses Akışı
              </span>
              <span className="font-mono font-bold text-white">
                {media.sampleRate} Hz • {media.audioChannels === 2 ? 'Stereo (2 Ch)' : 'Mono (1 Ch)'}
              </span>
            </div>
          ) : null}
        </div>

        {/* Waveform Peak Preview if available */}
        {media.waveform && media.waveform.length > 0 && (
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#121216] border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Ses Dalga Formu (Waveform Peaks)
            </span>
            <div className="h-8 flex items-end gap-0.5 bg-[#0b0b0e] p-1.5 rounded-lg">
              {media.waveform.map((peak, idx) => (
                <div
                  key={idx}
                  style={{ height: `${Math.max(10, peak * 100)}%` }}
                  className="flex-1 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t-sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
