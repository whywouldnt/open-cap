import React, { useState, useRef } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useTimelineStore } from '@/store/timelineStore';
import { useMediaStore } from '@/store/mediaStore';
import { ProjectMediaItem, Clip, DEFAULT_TRANSFORM, DEFAULT_AUDIO_SETTINGS } from '@/types/project';
import { AddClipCommand } from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { MediaItemCard } from './MediaItemCard';
import { MediaInspectorModal } from './MediaInspectorModal';
import {
  X,
  FolderPlus,
  Upload,
  Search,
  Film,
  Music,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface MediaBinDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediaBinDrawer: React.FC<MediaBinDrawerProps> = ({ isOpen, onClose }) => {
  const { project } = useProjectStore();
  const { currentTime, selectClip } = useTimelineStore();
  const {
    isImporting,
    importProgress,
    importStatus,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    importFiles,
    removeMedia,
  } = useMediaStore();

  const [inspectMedia, setInspectMedia] = useState<ProjectMediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter media items
  const mediaItems = project.mediaBin.filter((item) => {
    // Category filter
    if (activeFilter !== 'all' && item.mediaType !== activeFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.codec && item.codec.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importFiles(e.target.files);
    }
  };

  const handleAddMediaToTimeline = (media: ProjectMediaItem) => {
    // Pick or create appropriate track
    const targetType = media.mediaType === 'audio' ? 'audio' : 'video';
    let targetTrack = project.tracks.find((t) => t.type === targetType);

    if (!targetTrack) {
      targetTrack = project.tracks[0];
    }
    if (!targetTrack) return;

    const newClip: Clip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mediaId: media.id,
      trackId: targetTrack.id,
      name: media.name,
      startTime: currentTime,
      duration: media.duration || 4.0,
      sourceStartTime: 0,
      sourceDuration: media.duration || 4.0,
      speed: 1.0,
      isMuted: false,
      transform: { ...DEFAULT_TRANSFORM },
      blendMode: 'normal',
      keyframes: [],
      effects: [],
      audioSettings: { ...DEFAULT_AUDIO_SETTINGS },
      colorLabel:
        media.mediaType === 'audio'
          ? '#10b981'
          : media.mediaType === 'video'
          ? '#3b82f6'
          : '#f59e0b',
    };

    const cmd = new AddClipCommand(targetTrack.id, newClip, `Medya Ekle: ${media.name}`);
    historyManager.execute(cmd);
    selectClip(newClip.id, targetTrack.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Medya Havuzu (Media Bin)</h3>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono text-zinc-400">
              {project.mediaBin.length} öğe
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Import Trigger Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>İçe Aktar</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*,audio/*,image/*,.mp4,.mov,.mkv,.wav,.mp3,.png,.jpg,.jpeg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Medya ara (isim, codec, format)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b1b22] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder-zinc-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex rounded-xl bg-[#1b1b22] p-1 border border-white/5 text-xs">
            {[
              { id: 'all', label: 'Tümü', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'video', label: 'Videolar', icon: <Film className="w-3.5 h-3.5" /> },
              { id: 'audio', label: 'Sesler', icon: <Music className="w-3.5 h-3.5" /> },
              { id: 'image', label: 'Görseller', icon: <ImageIcon className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-all ${
                  activeFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Import Status Alert Bar */}
        {isImporting && (
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-cyan-300 font-medium">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {importStatus || 'Medya analiz ediliyor...'}
              </span>
              <span className="font-mono">{importProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                style={{ width: `${importProgress}%` }}
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-150"
              />
            </div>
          </div>
        )}

        {importStatus && !isImporting && (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1.5 flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Media Items Scrollable Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 pr-0.5 min-h-[220px]">
          {mediaItems.length > 0 ? (
            mediaItems.map((item) => (
              <MediaItemCard
                key={item.id}
                media={item}
                onAddToTimeline={handleAddMediaToTimeline}
                onInspect={(m) => setInspectMedia(m)}
                onDelete={(id) => removeMedia(id)}
              />
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 gap-2">
              <FolderPlus className="w-10 h-10 stroke-1 text-zinc-600" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-400">
                  {searchQuery ? 'Aramaya uygun medya bulunamadı' : 'Henüz medya eklenmedi'}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  Yukarıdaki "İçe Aktar" butonu ile MP4, MOV, WAV, MP3 dosyalarını ekleyebilirsiniz.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Media Inspector Modal */}
        <MediaInspectorModal
          media={inspectMedia}
          isOpen={!!inspectMedia}
          onClose={() => setInspectMedia(null)}
        />
      </div>
    </div>
  );
};
