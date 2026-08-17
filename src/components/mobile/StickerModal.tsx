import React, { useState, useMemo } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { EMOJI_CATALOG, ANIMATED_STICKERS, AnimatedStickerPreset } from '@/engine/stickers/emojiCatalog';
import { AddClipCommand, AddTrackCommand } from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { Track, Clip, DEFAULT_AUDIO_SETTINGS } from '@/types/project';
import { HapticEngine } from '@/engine/mobile/HapticEngine';
import {
  X,
  Smile,
  Sparkles,
  Search,
  Zap,
  Flame,
  Check,
  PlusCircle,
  Layers,
} from 'lucide-react';

interface StickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StickerModal: React.FC<StickerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTime, selectClip } = useTimelineStore();
  const { project } = useProjectStore();

  const [activeTab, setActiveTab] = useState<'animated' | 'emojis'>('animated');
  const [selectedEmojiCat, setSelectedEmojiCat] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Active category emojis
  const activeEmojiList = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      // Search all emojis
      const all: string[] = [];
      EMOJI_CATALOG.forEach((cat) => {
        cat.emojis.forEach((em) => {
          all.push(em);
        });
      });
      return all.slice(0, 120);
    }
    const cat = EMOJI_CATALOG.find((c) => c.id === selectedEmojiCat);
    return cat ? cat.emojis : EMOJI_CATALOG[0].emojis;
  }, [selectedEmojiCat, searchQuery]);

  // Helper to add any sticker or emoji clip to timeline
  const handleAddClip = (
    content: string,
    name: string,
    animation: string = 'popBounce',
    badgeStyle?: { bg: string; text: string; textColor: string }
  ) => {
    HapticEngine.impactHeavy();

    // Find or create Overlay track
    let overlayTrack = project.tracks.find((t) => t.type === 'overlay' || t.type === 'text');
    if (!overlayTrack) {
      const newTrack: Track = {
        id: `track-overlay-${Date.now()}`,
        name: 'Çıkartma / Sticker',
        type: 'overlay',
        isMuted: false,
        isLocked: false,
        isHidden: false,
        volume: 1.0,
        zIndex: 6,
        clips: [],
      };
      const addTrkCmd = new AddTrackCommand(newTrack);
      historyManager.execute(addTrkCmd);
      overlayTrack = newTrack;
    }

    const isBadge = !!badgeStyle;
    const stickerClip: Clip = {
      id: `clip-sticker-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mediaId: '',
      trackId: overlayTrack.id,
      name: `Sticker: ${name}`,
      startTime: currentTime,
      duration: 3.0,
      sourceStartTime: 0,
      sourceDuration: 3.0,
      speed: 1.0,
      isMuted: true,
      transform: {
        x: 0,
        y: 0,
        scaleX: 1.0,
        scaleY: 1.0,
        rotation: 0,
        opacity: 1.0,
        anchorX: 0.5,
        anchorY: 0.5,
      },
      blendMode: 'normal',
      keyframes: [],
      effects: [],
      audioSettings: { ...DEFAULT_AUDIO_SETTINGS },
      textContent: {
        text: content,
        fontFamily: 'Inter',
        fontSize: isBadge ? 28 : 52,
        fontColor: badgeStyle?.textColor || '#ffffff',
        backgroundColor: badgeStyle?.bg || 'transparent',
        backgroundPadding: isBadge ? 12 : 0,
        backgroundRadius: 10,
        align: 'center',
        letterSpacing: 2,
        lineHeight: 1.2,
        animation: animation,
      },
      colorLabel: '#ec4899',
    };

    const addClipCmd = new AddClipCommand(
      overlayTrack.id,
      stickerClip,
      `Sticker Ekle: ${name}`
    );
    historyManager.execute(addClipCmd);
    selectClip(stickerClip.id, overlayTrack.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg card-stack-sheet p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Swipe Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl accent-gradient flex items-center justify-center shadow">
              <Smile className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white">Çıkartma & Emoji Kütüphanesi</h3>
              <span className="text-[10px] text-zinc-400 font-mono">400+ Mobil Emoji & Hareketli Sticker</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tab Navigation: Hareketli Stickerlar vs Tüm Telefon Emojileri */}
        <div className="flex bg-[#121216] p-1 rounded-full border border-white/5 flex-shrink-0">
          <button
            onClick={() => {
              HapticEngine.snapTick();
              setActiveTab('animated');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'animated'
                ? 'accent-gradient shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🎬 Hareketli Stickerlar</span>
          </button>

          <button
            onClick={() => {
              HapticEngine.snapTick();
              setActiveTab('emojis');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'emojis'
                ? 'accent-gradient shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>😀 Tüm Telefon Emojileri</span>
          </button>
        </div>

        {/* TAB 1: HAREKETLİ STICKERLAR */}
        {activeTab === 'animated' && (
          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-2.5 min-h-[240px] p-1">
            {ANIMATED_STICKERS.map((st) => (
              <button
                key={st.id}
                onClick={() => handleAddClip(st.content, st.name, st.animation, st.badgeStyle)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl spatial-glass border border-white/10 hover:border-pink-500/50 active:scale-90 transition-all gap-1.5 shadow-lg group relative overflow-hidden"
              >
                {/* Visual Motion Preview Badge */}
                <div className="text-2xl filter drop-shadow animate-bounce py-1">
                  {st.content}
                </div>
                <span className="text-[11px] font-bold text-white text-center line-clamp-1">
                  {st.name}
                </span>
                <span className="text-[9px] font-mono text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded-full">
                  {st.animation}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* TAB 2: TÜM TELEFON EMOJİLERİ (400+ EMOJİ) */}
        {activeTab === 'emojis' && (
          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
            {/* Search Input */}
            <div className="relative flex-shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Emoji ara..."
                className="w-full bg-[#121216] border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Emoji Category Tabs */}
            {!searchQuery && (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-shrink-0">
                {EMOJI_CATALOG.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      HapticEngine.snapTick();
                      setSelectedEmojiCat(cat.id);
                    }}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedEmojiCat === cat.id
                        ? 'accent-gradient text-white shadow-sm'
                        : 'spatial-glass-pill text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-[10px]">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 400+ Emojis Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-6 sm:grid-cols-8 gap-2 p-1 min-h-[200px]">
              {activeEmojiList.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  onClick={() => handleAddClip(emoji, `Emoji ${emoji}`, 'popBounce')}
                  className="w-full aspect-square flex items-center justify-center text-2xl p-1 rounded-xl spatial-glass hover:bg-white/15 active:scale-75 transition-all shadow"
                >
                  <span className="filter drop-shadow select-none">{emoji}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 spatial-glass-pill text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex-shrink-0"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
