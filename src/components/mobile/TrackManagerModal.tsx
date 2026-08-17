import React, { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { AddTrackCommand, DeleteTrackCommand, ReorderTracksCommand } from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { Track, TrackType } from '@/types/project';
import {
  X,
  Layers,
  Plus,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Radio,
  ArrowUp,
  ArrowDown,
  Trash2,
  Film,
  Music,
  Type,
  Wand2,
} from 'lucide-react';

interface TrackManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackManagerModal: React.FC<TrackManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    project,
    toggleTrackMute,
    toggleTrackLock,
    toggleTrackHidden,
    toggleTrackSolo,
    setTrackVolume,
  } = useProjectStore();

  const [newTrackType, setNewTrackType] = useState<TrackType>('video');

  if (!isOpen) return null;

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.tracks.length) return;

    const cmd = new ReorderTracksCommand(index, targetIndex);
    historyManager.execute(cmd);
  };

  const handleAddNewTrack = () => {
    const count = project.tracks.length + 1;
    const typeLabel =
      newTrackType === 'video'
        ? `Video Katmanı ${count}`
        : newTrackType === 'audio'
        ? `Ses Parçası ${count}`
        : newTrackType === 'text'
        ? `Altyazı / Metin ${count}`
        : `Efekt Katmanı ${count}`;

    const newTrack: Track = {
      id: `track-${newTrackType}-${Date.now()}`,
      name: typeLabel,
      type: newTrackType,
      isMuted: false,
      isLocked: false,
      isHidden: false,
      volume: 1.0,
      zIndex: count,
      clips: [],
    };

    const cmd = new AddTrackCommand(newTrack);
    historyManager.execute(cmd);
  };

  const handleDeleteTrack = (track: Track) => {
    if (project.tracks.length <= 1) {
      alert('Projede en az 1 kanal bulunmalıdır.');
      return;
    }
    const cmd = new DeleteTrackCommand(track.id);
    historyManager.execute(cmd);
  };

  const getTrackIcon = (type: TrackType) => {
    switch (type) {
      case 'video':
      case 'overlay':
        return <Film className="w-4 h-4 text-blue-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-emerald-400" />;
      case 'text':
        return <Type className="w-4 h-4 text-amber-400" />;
      case 'effect':
        return <Wand2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Çok Kanallı Katman Yöneticisi</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              {project.tracks.length} Kanal
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Track Control */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1b1b22] border border-white/5 flex-shrink-0">
          <select
            value={newTrackType}
            onChange={(e) => setNewTrackType(e.target.value as TrackType)}
            className="bg-[#121216] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="video">Video / PIP Katmanı</option>
            <option value="audio">Ses / Müzik Kanalı</option>
            <option value="text">Metin / Başlık Katmanı</option>
            <option value="effect">Efekt / Ayar Katmanı</option>
          </select>

          <button
            onClick={handleAddNewTrack}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-lg active:scale-95 transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Yeni Katman Ekle</span>
          </button>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 min-h-[220px]">
          {project.tracks.map((track, idx) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1b22] border border-white/5 hover:border-white/20 transition-all gap-2"
            >
              {/* Left: Reorder up/down + Icon + Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveTrack(idx, 'up')}
                    disabled={idx === 0}
                    className={`p-0.5 rounded ${
                      idx === 0
                        ? 'text-zinc-700'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMoveTrack(idx, 'down')}
                    disabled={idx === project.tracks.length - 1}
                    className={`p-0.5 rounded ${
                      idx === project.tracks.length - 1
                        ? 'text-zinc-700'
                        : 'text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                {getTrackIcon(track.type)}

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {track.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {track.clips.length} Klip
                  </span>
                </div>
              </div>

              {/* Right: Mute, Solo, Lock, Hide, Delete */}
              <div className="flex items-center gap-1.5">
                {/* Mute */}
                <button
                  onClick={() => toggleTrackMute(track.id)}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    track.isMuted
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                  title="Sesi Aç / Kapat"
                >
                  {track.isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Solo */}
                <button
                  onClick={() => toggleTrackSolo(track.id)}
                  className="p-1.5 rounded-lg text-xs bg-white/5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  title="Solo Dinle/İzle"
                >
                  <Radio className="w-3.5 h-3.5" />
                </button>

                {/* Lock */}
                <button
                  onClick={() => toggleTrackLock(track.id)}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    track.isLocked
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                  title="Kilitle"
                >
                  {track.isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Hide */}
                <button
                  onClick={() => toggleTrackHidden(track.id)}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    track.isHidden
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                  title="Gizle / Göster"
                >
                  {track.isHidden ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteTrack(track)}
                  className="p-1.5 rounded-lg text-xs bg-white/5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Kanalı Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
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
