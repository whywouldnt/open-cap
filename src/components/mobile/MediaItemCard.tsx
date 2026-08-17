import React from 'react';
import { ProjectMediaItem } from '@/types/project';
import {
  Film,
  Music,
  Image as ImageIcon,
  Plus,
  Info,
  Trash2,
  Cpu,
} from 'lucide-react';
import { formatDuration } from '@/utils/timecode';

interface MediaItemCardProps {
  media: ProjectMediaItem;
  onAddToTimeline: (media: ProjectMediaItem) => void;
  onInspect: (media: ProjectMediaItem) => void;
  onDelete: (mediaId: string) => void;
}

export const MediaItemCard: React.FC<MediaItemCardProps> = ({
  media,
  onAddToTimeline,
  onInspect,
  onDelete,
}) => {
  const getMediaTypeIcon = () => {
    switch (media.mediaType) {
      case 'video':
        return <Film className="w-4 h-4 text-blue-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-amber-400" />;
      default:
        return <Film className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col p-2.5 rounded-xl bg-[#1b1b22] border border-white/5 hover:border-cyan-500/30 transition-all gap-2 group">
      {/* Top row: Thumbnail & Basic Info */}
      <div className="flex items-center gap-2.5">
        {/* Thumbnail Box */}
        <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          {media.thumbnailUri ? (
            <img
              src={media.thumbnailUri}
              alt={media.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1">
              {getMediaTypeIcon()}
              <span className="text-[8px] uppercase font-bold text-zinc-500">
                {media.mediaType}
              </span>
            </div>
          )}

          {/* Duration Badge */}
          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[8px] font-mono text-zinc-300 rounded">
            {formatDuration(media.duration)}
          </span>
        </div>

        {/* Title, Codec & Resolution */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white truncate max-w-[140px]">
              {media.name}
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {media.codec || media.mediaType.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono mt-1">
            {media.width && media.height ? (
              <span>{media.width}x{media.height}</span>
            ) : null}
            {media.fps ? <span>• {media.fps}fps</span> : null}
            <span>• {formatFileSize(media.size)}</span>
          </div>

          {/* Waveform preview strip for audio/video */}
          {media.waveform && media.waveform.length > 0 && (
            <div className="h-2.5 flex items-end gap-0.5 mt-1.5 opacity-60">
              {media.waveform.slice(0, 24).map((p, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.max(15, p * 100)}%` }}
                  className={`w-0.5 rounded-t-sm ${
                    media.mediaType === 'audio' ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions: Inspect, Add to Timeline, Delete */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onInspect(media)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="FFprobe Detaylarını İncele"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(media.id)}
            className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Medyayı Havuzdan Sil"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add to Timeline Button */}
        <button
          onClick={() => onAddToTimeline(media)}
          className="flex items-center gap-1 px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-[11px] rounded-lg shadow active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Timeline'a Ekle</span>
        </button>
      </div>
    </div>
  );
};
