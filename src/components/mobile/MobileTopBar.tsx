import React from 'react';
import {
  Undo2,
  Redo2,
  Settings,
  Share2,
  FolderPlus,
  LayoutTemplate,
  ChevronLeft,
} from 'lucide-react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { HapticEngine } from '@/engine/mobile/HapticEngine';

interface MobileTopBarProps {
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onOpenMediaBin: () => void;
  onOpenTemplates: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  onOpenSettings,
  onOpenExport,
  onOpenMediaBin,
  onOpenTemplates,
}) => {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    lastActionName,
  } = useTimelineStore();

  const { project, isDirty } = useProjectStore();

  const handleUndo = () => {
    if (canUndo) {
      HapticEngine.snapTick();
      undo();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      HapticEngine.snapTick();
      redo();
    }
  };

  return (
    <header className="w-full spatial-glass px-4 py-2.5 flex items-center justify-between z-30 select-none border-b border-white/[0.08] min-h-[52px]">
      {/* Left: Clean Project Info & Aspect Ratio Pill */}
      <div className="flex items-center gap-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold text-white tracking-wide truncate max-w-[130px]">
              {project.name || 'İsimsiz Proje'}
            </span>
            {isDirty && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"
                title="Kaydedilmemiş değişiklikler var"
              />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
            <span className="text-purple-300 font-semibold">{project.resolution.aspectRatio}</span>
            <span className="text-zinc-600">•</span>
            <span>{project.fps} FPS</span>
          </div>
        </div>
      </div>

      {/* Center-Right Group: Undo, Redo, Templates, MediaBin, Settings, Export */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo Group (Ergonomic Circular Glass Buttons) */}
        <div className="flex items-center spatial-glass-pill rounded-full p-0.5 shadow-inner">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title={lastActionName ? `Geri Al: ${lastActionName}` : 'Geri Al'}
            className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
              canUndo
                ? 'text-white hover:bg-white/15 active:scale-85 text-purple-400'
                : 'text-zinc-600 cursor-not-allowed opacity-40'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-white/10 mx-0.5" />

          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title="İleri Al"
            className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
              canRedo
                ? 'text-white hover:bg-white/15 active:scale-85 text-purple-400'
                : 'text-zinc-600 cursor-not-allowed opacity-40'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Templates Button */}
        <button
          onClick={() => {
            HapticEngine.impactMedium();
            onOpenTemplates();
          }}
          className="p-2 rounded-full spatial-glass-pill text-zinc-300 hover:text-purple-300 active:scale-90 transition-all"
          title="Şablonlar (Templates)"
        >
          <LayoutTemplate className="w-4 h-4" />
        </button>

        {/* Media Bin Button */}
        <button
          onClick={() => {
            HapticEngine.impactMedium();
            onOpenMediaBin();
          }}
          className="p-2 rounded-full spatial-glass-pill text-zinc-300 hover:text-white active:scale-90 transition-all"
          title="Medya Kutusu"
        >
          <FolderPlus className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            HapticEngine.impactMedium();
            onOpenSettings();
          }}
          className="p-2 rounded-full spatial-glass-pill text-zinc-300 hover:text-white active:scale-90 transition-all"
          title="Proje ve Donanım Ayarları"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Export Button (Vibrant Spatial Pill) */}
        <button
          onClick={() => {
            HapticEngine.impactHeavy();
            onOpenExport();
          }}
          className="flex items-center gap-1.5 accent-gradient font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg shadow-purple-500/25 active:scale-90 transition-all border border-white/20 ml-1"
          title="Videoyu Dışa Aktar"
        >
          <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Dışa Aktar</span>
        </button>
      </div>
    </header>
  );
};
