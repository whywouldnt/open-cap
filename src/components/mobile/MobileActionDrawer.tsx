import React from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import {
  SplitClipCommand,
  DeleteClipCommand,
  AddClipCommand,
  RippleDeleteCommand,
  CloseGapsCommand,
} from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { RippleEngine } from '@/engine/timeline/ripple';
import { HapticEngine } from '@/engine/mobile/HapticEngine';
import {
  Scissors,
  Gauge,
  Volume2,
  Move,
  Trash2,
  Copy,
  Wand2,
  Sparkles,
  Type,
  Music,
  PlusCircle,
  ChevronLeft,
  Sliders,
  Palette,
  Layers,
  Waves,
  ArrowLeftRight,
  Split,
  Magnet,
  Maximize2,
  Zap,
  FileText,
  UserCheck,
  Mic,
  Smile,
  Video,
} from 'lucide-react';

interface MobileActionDrawerProps {
  onOpenTransform: () => void;
  onOpenAudio: () => void;
  onOpenMediaBin: () => void;
  onOpenSlip: () => void;
  onOpenTrackManager: () => void;
  onOpenBlendModes: () => void;
  onOpenMask: () => void;
  onOpenSpeed: () => void;
  onOpenVFX: () => void;
  onOpenTransitions: () => void;
  onOpenColorGrading: () => void;
  onOpenTextEditor: () => void;
  onOpenAutoCaptions: () => void;
  onOpenSmartCutout: () => void;
  onOpenTTS: () => void;
  onOpenStickers: () => void;
  onOpenMultiCam: () => void;
}

export const MobileActionDrawer: React.FC<MobileActionDrawerProps> = ({
  onOpenTransform,
  onOpenAudio,
  onOpenMediaBin,
  onOpenSlip,
  onOpenTrackManager,
  onOpenBlendModes,
  onOpenMask,
  onOpenSpeed,
  onOpenVFX,
  onOpenTransitions,
  onOpenColorGrading,
  onOpenTextEditor,
  onOpenAutoCaptions,
  onOpenSmartCutout,
  onOpenTTS,
  onOpenStickers,
  onOpenMultiCam,
}) => {
  const {
    selectedClipId,
    selectClip,
    currentTime,
    editMode,
    setEditMode,
  } = useTimelineStore();

  const { getClipById, project } = useProjectStore();

  const selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  const clip = selectedData?.clip;
  const track = selectedData?.track;

  // 1. SPLIT (BÖL)
  const handleSplitClip = () => {
    if (!clip || !track) return;
    if (currentTime <= clip.startTime || currentTime >= clip.startTime + clip.duration) {
      alert('İmleç (playhead) seçili klibin üzerinde olmalıdır.');
      return;
    }
    HapticEngine.impactHeavy();
    const splitCmd = new SplitClipCommand(clip, currentTime);
    historyManager.execute(splitCmd);
  };

  // 2. RIPPLE DELETE (BOŞLUKSUZ SİL)
  const handleRippleDelete = () => {
    if (!clip || !track) return;
    HapticEngine.impactHeavy();
    const ripple = RippleEngine.calculateRippleDelete(track, clip.id);
    if (ripple) {
      const cmd = new RippleDeleteCommand(
        track.id,
        ripple.originalClips,
        ripple.updatedClips,
        clip.name
      );
      historyManager.execute(cmd);
      selectClip(null);
    }
  };

  // 3. NORMAL DELETE (SİL)
  const handleDeleteClip = () => {
    if (!clip || !track) return;
    HapticEngine.impactMedium();
    const deleteCmd = new DeleteClipCommand(track.id, clip, selectedData.index);
    historyManager.execute(deleteCmd);
    selectClip(null);
  };

  // 4. DUPLICATE (ÇOĞALT)
  const handleDuplicateClip = () => {
    if (!clip || !track) return;
    HapticEngine.impactMedium();
    const clonedClip = {
      ...JSON.parse(JSON.stringify(clip)),
      id: `clip-copy-${Date.now()}`,
      startTime: clip.startTime + clip.duration + 0.1,
      name: `${clip.name} (Kopya)`,
    };
    const addCmd = new AddClipCommand(track.id, clonedClip, `Çoğalt: ${clip.name}`);
    historyManager.execute(addCmd);
  };

  // 5. CLOSE GAPS (BOŞLUKLARI KAPAT)
  const handleCloseGaps = () => {
    if (!track) return;
    HapticEngine.impactMedium();
    const gapResult = RippleEngine.calculateCloseGaps(track);
    const cmd = new CloseGapsCommand(
      track.id,
      gapResult.originalClips,
      gapResult.updatedClips
    );
    historyManager.execute(cmd);
  };

  // 6. ADD TEXT CLIP & OPEN TEXT EDITOR
  const handleAddText = () => {
    HapticEngine.impactMedium();
    let textTrack = project.tracks.find((t) => t.type === 'text');
    if (!textTrack) {
      textTrack = project.tracks[0];
    }
    if (!textTrack) return;

    const newTextClip = {
      id: `clip-text-${Date.now()}`,
      mediaId: '',
      trackId: textTrack.id,
      name: 'Yeni Başlık',
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
      blendMode: 'normal' as const,
      keyframes: [],
      effects: [],
      audioSettings: {
        volume: 1.0,
        pitch: 1.0,
        speed: 1.0,
        fadeIn: 0,
        fadeOut: 0,
        pan: 0,
        isMuted: true,
        noiseReduction: false,
        voiceEnhance: false,
      },
      textContent: {
        text: 'BURAYA YAZIN',
        fontFamily: 'Inter',
        fontSize: 28,
        fontColor: '#ffffff',
        align: 'center' as const,
        letterSpacing: 2,
        lineHeight: 1.2,
        animation: 'popBounce',
      },
      colorLabel: '#ec4899',
    };

    const addCmd = new AddClipCommand(textTrack.id, newTextClip, 'Metin Ekle');
    historyManager.execute(addCmd);
    selectClip(newTextClip.id, textTrack.id);
    onOpenTextEditor();
  };

  return (
    <nav aria-label="Mobil Düzenleme Araçları" className="w-full spatial-glass px-2 py-1.5 flex items-center justify-between z-30 select-none overflow-x-auto no-scrollbar min-h-[60px] border-t border-white/[0.08]">
      {/* Selected Clip Specific Context Toolbar */}
      {clip ? (
        <div className="flex items-center gap-1.5 w-full justify-between px-1">
          {/* Back button to deselect */}
          <button
            onClick={() => {
              HapticEngine.snapTick();
              selectClip(null);
            }}
            className="flex flex-col items-center gap-0.5 text-zinc-400 hover:text-white px-2 py-1 rounded-xl spatial-glass-pill transition-all flex-shrink-0"
            title="Seçimi Bırak"
          >
            <ChevronLeft className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Tamam</span>
          </button>

          <div className="w-px h-6 bg-white/10 mx-0.5 flex-shrink-0" />

          {/* Text Editor & TTS (If text clip) */}
          {clip.textContent && (
            <>
              <button
                onClick={() => {
                  HapticEngine.impactMedium();
                  onOpenTextEditor();
                }}
                className="flex flex-col items-center gap-1 text-zinc-200 hover:text-pink-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
                title="Metin ve Font Düzenle"
              >
                <Type className="w-4 h-4 text-pink-400" />
                <span className="text-[9px] font-bold">Metin</span>
              </button>

              <button
                onClick={() => {
                  HapticEngine.impactMedium();
                  onOpenTTS();
                }}
                className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
                title="AI Metin Seslendirme (TTS)"
              >
                <Mic className="w-4 h-4 text-purple-400" />
                <span className="text-[9px] font-bold">Seslendir</span>
              </button>
            </>
          )}

          {/* AI Smart Cutout */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenSmartCutout();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-pink-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="AI Akıllı Kesme & Arka Plan"
          >
            <UserCheck className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-bold">AI Kesme</span>
          </button>

          {/* Split (Böl) */}
          <button
            onClick={handleSplitClip}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="İmleçten Böl"
          >
            <Scissors className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Böl</span>
          </button>

          {/* Speed & Time (Hız & Eğriler) */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenSpeed();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="Hız Eğrisi, Freeze Frame & Reverse"
          >
            <Gauge className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Hız</span>
          </button>

          {/* VFX Effects */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenVFX();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-pink-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="50+ GPU Video Efekti"
          >
            <Wand2 className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-bold">Efektler</span>
          </button>

          {/* Transitions */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenTransitions();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="30+ 2D/3D Geçiş"
          >
            <Split className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Geçişler</span>
          </button>

          {/* Color Grading & 3D LUT */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenColorGrading();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-pink-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="Renk Derecelendirme & 3D LUT"
          >
            <Palette className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-bold">Filtre</span>
          </button>

          {/* Blend Modes */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenBlendModes();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="37+ Karışım Modu"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Karışım</span>
          </button>

          {/* Mask */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenMask();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-pink-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="Maske (Linear, Radial, Mirror)"
          >
            <Layers className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-bold">Maske</span>
          </button>

          {/* Transform */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenTransform();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="Konum ve Ölçek"
          >
            <Move className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Dönüştür</span>
          </button>

          {/* Ripple Delete */}
          <button
            onClick={handleRippleDelete}
            className="flex flex-col items-center gap-1 text-pink-300 hover:text-pink-200 px-2 py-1 rounded-xl active:bg-pink-500/20 transition-all flex-shrink-0 touch-active"
            title="Boşluksuz Sil (Ripple Delete)"
          >
            <Waves className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-bold">Ripple</span>
          </button>

          {/* Slip Edit */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenSlip();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="Kaynak Medyayı Kaydır"
          >
            <ArrowLeftRight className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Slip</span>
          </button>

          {/* Volume */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenAudio();
            }}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="Ses Ayarları"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-bold">Ses</span>
          </button>

          {/* Close Gaps */}
          <button
            onClick={handleCloseGaps}
            className="flex flex-col items-center gap-1 text-zinc-200 hover:text-purple-400 px-2 py-1 rounded-xl active:bg-white/10 transition-all flex-shrink-0 touch-active"
            title="Kanaldaki Boşlukları Kapat"
          >
            <Magnet className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Boşluk</span>
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteClip}
            className="flex flex-col items-center gap-1 text-rose-400 hover:text-rose-300 px-2 py-1 rounded-xl active:bg-rose-500/20 transition-all flex-shrink-0 touch-active"
            title="Klibi Sil"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="text-[9px] font-bold">Sil</span>
          </button>
        </div>
      ) : (
        /* Main Category Drawer (When no clip is selected) */
        <div className="flex items-center gap-2 w-full justify-around px-1">
          {/* Add Media */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenMediaBin();
            }}
            className="flex flex-col items-center gap-1 text-zinc-300 hover:text-purple-400 px-2 py-1 rounded-xl active:scale-95 transition-all touch-active"
          >
            <PlusCircle className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Medya</span>
          </button>

          {/* Add Text */}
          <button
            onClick={handleAddText}
            className="flex flex-col items-center gap-1 text-zinc-300 hover:text-pink-400 px-2 py-1 rounded-xl active:scale-95 transition-all touch-active"
          >
            <Type className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-bold">Metin</span>
          </button>

          {/* Stickers */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenStickers();
            }}
            className="flex flex-col items-center gap-1 text-zinc-300 hover:text-pink-400 px-2 py-1 rounded-xl active:scale-95 transition-all touch-active"
          >
            <Smile className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-bold">Sticker</span>
          </button>

          {/* AI Voice TTS */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenTTS();
            }}
            className="flex flex-col items-center gap-1 text-zinc-300 hover:text-purple-400 px-2 py-1 rounded-xl active:scale-95 transition-all touch-active"
          >
            <Mic className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">TTS Ses</span>
          </button>

          {/* Multi-Cam */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenMultiCam();
            }}
            className="flex flex-col items-center gap-1 text-zinc-300 hover:text-emerald-400 px-2 py-1 rounded-xl active:scale-95 transition-all touch-active"
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-bold">Çoklu Kamera</span>
          </button>

          {/* Auto Captions */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenAutoCaptions();
            }}
            className="flex flex-col items-center gap-1 text-zinc-300 hover:text-yellow-400 px-2 py-1 rounded-xl active:scale-95 transition-all touch-active"
          >
            <FileText className="w-4 h-4 text-yellow-400" />
            <span className="text-[9px] font-bold">Altyazı</span>
          </button>

          {/* Track Layers Manager */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenTrackManager();
            }}
            className="flex flex-col items-center gap-1 text-zinc-300 hover:text-purple-400 px-2 py-1 rounded-xl active:scale-95 transition-all touch-active"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold">Katmanlar</span>
          </button>

          {/* Effects */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              onOpenVFX();
            }}
            className="flex flex-col items-center gap-1 text-zinc-300 hover:text-pink-400 px-2 py-1 rounded-xl active:scale-95 transition-all touch-active"
          >
            <Palette className="w-4 h-4 text-pink-400" />
            <span className="text-[9px] font-bold">Efektler</span>
          </button>
        </div>
      )}
    </nav>
  );
};
