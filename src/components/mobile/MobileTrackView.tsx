import React from 'react';
import { Track } from '@/types/project';
import { ClipItem } from './ClipItem';
import { useProjectStore } from '@/store/projectStore';
import {
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Radio,
  Film,
  Music,
  Type,
  Wand2,
} from 'lucide-react';

interface MobileTrackViewProps {
  track: Track;
  zoom: number; // Pixels per second
  onAddClip: (trackId: string) => void;
}

export const MobileTrackView: React.FC<MobileTrackViewProps> = ({
  track,
  zoom,
}) => {
  const { toggleTrackMute, toggleTrackLock, toggleTrackHidden, toggleTrackSolo } =
    useProjectStore();

  const getTrackIcon = () => {
    switch (track.type) {
      case 'video':
      case 'overlay':
        return <Film className="w-3.5 h-3.5 text-blue-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      case 'effect':
        return <Wand2 className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="flex items-center h-12 border-b border-white/[0.04] relative group">
      {/* Fixed Track Header on Left (Mute / Solo / Lock / Hide) */}
      <div className="w-24 flex-shrink-0 h-full bg-[#141418] border-r border-white/[0.06] flex items-center justify-between px-1.5 z-20 shadow-md">
        <div className="flex items-center gap-1 overflow-hidden">
          {getTrackIcon()}
          <span className="text-[10px] font-semibold text-zinc-300 truncate max-w-[40px]">
            {track.name}
          </span>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-0.5">
          {/* Mute */}
          <button
            onClick={() => toggleTrackMute(track.id)}
            className={`p-1 rounded transition-colors ${
              track.isMuted
                ? 'text-red-400 bg-red-500/20'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={track.isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {track.isMuted ? (
              <VolumeX className="w-3 h-3" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </button>

          {/* Solo */}
          <button
            onClick={() => toggleTrackSolo(track.id)}
            className="p-1 rounded text-zinc-500 hover:text-amber-400 transition-colors"
            title="Solo Dinle"
          >
            <Radio className="w-3 h-3" />
          </button>

          {/* Lock */}
          <button
            onClick={() => toggleTrackLock(track.id)}
            className={`p-1 rounded transition-colors ${
              track.isLocked
                ? 'text-amber-400 bg-amber-500/20'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={track.isLocked ? 'Kilidi Aç' : 'Kilitle'}
          >
            {track.isLocked ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Unlock className="w-3 h-3" />
            )}
          </button>

          {/* Hide */}
          <button
            onClick={() => toggleTrackHidden(track.id)}
            className={`p-1 rounded transition-colors ${
              track.isHidden
                ? 'text-purple-400 bg-purple-500/20'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={track.isHidden ? 'Görünür Yap' : 'Gizle'}
          >
            {track.isHidden ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Clips Strip */}
      <div className="flex-1 h-full relative bg-[#0e0e12]/60 overflow-visible">
        {/* Render Clips */}
        {track.clips.map((clip) => (
          <ClipItem key={clip.id} clip={clip} track={track} zoom={zoom} />
        ))}
      </div>
    </div>
  );
};
