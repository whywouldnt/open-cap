import React, { useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Magnet,
  MousePointer,
  Waves,
  Split,
  ArrowLeftRight,
  Layers,
} from 'lucide-react';
import { useTimelineStore, TimelineEditMode } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { MobileTrackView } from './MobileTrackView';
import { HapticEngine } from '@/engine/mobile/HapticEngine';

interface MobileTimelineProps {
  onOpenMediaBin: () => void;
  onOpenTrackManager: () => void;
}

export const MobileTimeline: React.FC<MobileTimelineProps> = ({
  onOpenMediaBin,
  onOpenTrackManager,
}) => {
  const {
    currentTime,
    setCurrentTime,
    zoom,
    zoomIn,
    zoomOut,
    isSnappingEnabled,
    toggleSnapping,
    selectClip,
    editMode,
    setEditMode,
    snapLineTime,
  } = useTimelineStore();

  const { project } = useProjectStore();

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const isScrubbing = useRef(false);

  const timelineWidth = Math.max(800, (project.duration + 2) * zoom);

  // Ruler tick generation
  const rulerTicks: Array<{ time: number; label: string; isMajor: boolean }> = [];
  const tickInterval = zoom > 120 ? 0.5 : zoom > 60 ? 1 : 2; // In seconds

  for (let t = 0; t <= project.duration + 2; t += tickInterval) {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    const label = `${('00' + mins).slice(-2)}:${('00' + secs).slice(-2)}`;
    rulerTicks.push({
      time: t,
      label,
      isMajor: t % (tickInterval * 2) === 0,
    });
  }

  // Handle Scrubbing on Ruler / Timeline
  const handleTimelinePointerDown = (e: React.PointerEvent) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    // Account for fixed 96px header
    const clickX = e.clientX - rect.left - 96 + scrollLeft;
    const clickTime = Math.max(0, Math.min(project.duration, clickX / zoom));
    setCurrentTime(clickTime);
    selectClip(null);
    HapticEngine.snapTick();
    isScrubbing.current = true;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isScrubbing.current || !timelineContainerRef.current) return;
      const moveRect = timelineContainerRef.current.getBoundingClientRect();
      const moveX = moveEvent.clientX - moveRect.left - 96 + timelineContainerRef.current.scrollLeft;
      const moveTime = Math.max(0, Math.min(project.duration, moveX / zoom));
      setCurrentTime(moveTime);
    };

    const handlePointerUp = () => {
      isScrubbing.current = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const playheadPixel = 96 + currentTime * zoom;
  const snapLinePixel = snapLineTime !== null ? 96 + snapLineTime * zoom : null;

  return (
    <div className="w-full flex-1 flex flex-col bg-[#000000] border-t border-white/[0.08] relative select-none overflow-hidden">
      {/* Spatial Glass Sub-Bar (Edit Modes, Snap, Zoom, Track Manager) */}
      <div className="h-9 spatial-glass px-2.5 flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-2 border-b border-white/[0.06]">
        {/* Left: Edit Mode Selector */}
        <div className="flex items-center spatial-glass-pill p-0.5 rounded-full text-[10px]">
          {[
            { id: 'select' as TimelineEditMode, label: 'Seç', icon: <MousePointer className="w-3 h-3" /> },
            { id: 'ripple' as TimelineEditMode, label: 'Ripple', icon: <Waves className="w-3 h-3" /> },
            { id: 'roll' as TimelineEditMode, label: 'Roll', icon: <Split className="w-3 h-3" /> },
            { id: 'slip' as TimelineEditMode, label: 'Slip', icon: <ArrowLeftRight className="w-3 h-3" /> },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                HapticEngine.snapTick();
                setEditMode(mode.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                editMode === mode.id
                  ? 'accent-gradient font-bold shadow-md shadow-purple-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode.icon}
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Center: Magnetic Snapping */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              HapticEngine.snapTick();
              toggleSnapping();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              isSnappingEnabled
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Otomatik Manyetik Yapışma (Snapping)"
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mıknatıs</span>
          </button>
        </div>

        {/* Right: Zoom & Multi-Track Manager */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 spatial-glass-pill px-1.5 py-0.5 rounded-full">
            <button
              onClick={() => {
                HapticEngine.snapTick();
                zoomOut();
              }}
              className="p-1 rounded-full text-zinc-400 hover:text-white active:scale-90 transition-all"
              title="Uzaklaş"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[9px] font-mono text-zinc-400 min-w-[28px] text-center">
              {Math.round(zoom)}px
            </span>
            <button
              onClick={() => {
                HapticEngine.snapTick();
                zoomIn();
              }}
              className="p-1 rounded-full text-zinc-400 hover:text-white active:scale-90 transition-all"
              title="Yakınlaş"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Track Manager Button */}
          <button
            onClick={onOpenTrackManager}
            className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 px-2.5 py-1 rounded-full border border-purple-400/30 transition-all"
            title="Katmanları Yönet"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold">{project.tracks.length}</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Timeline Body */}
      <div
        ref={timelineContainerRef}
        onPointerDown={handleTimelinePointerDown}
        className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar relative cursor-crosshair bg-[#000000]"
      >
        {/* Ruler Bar */}
        <div
          style={{ width: `${timelineWidth + 96}px` }}
          className="h-6 spatial-glass border-b border-white/[0.06] relative flex items-end sticky top-0 z-30"
        >
          {/* Header spacer (96px) */}
          <div className="w-24 flex-shrink-0 h-full spatial-glass border-r border-white/[0.08] flex items-center px-2">
            <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
              {project.tracks.length} Katman
            </span>
          </div>

          {/* Time ticks */}
          <div className="flex-1 h-full relative overflow-hidden">
            {rulerTicks.map((tick, i) => (
              <div
                key={i}
                style={{ left: `${tick.time * zoom}px` }}
                className="absolute bottom-0 flex flex-col items-center pointer-events-none"
              >
                <span
                  className={`text-[8px] font-mono mb-0.5 ${
                    tick.isMajor ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  {tick.label}
                </span>
                <div
                  className={`w-px ${
                    tick.isMajor ? 'h-2 bg-purple-400/60' : 'h-1 bg-zinc-700'
                  }`}
                />
              </div>
            ))}

            {/* Markers */}
            {project.markers.map((marker) => (
              <div
                key={marker.id}
                style={{ left: `${marker.time * zoom}px` }}
                className="absolute top-0 bottom-0 flex items-center pointer-events-none z-40"
              >
                <div
                  style={{ backgroundColor: marker.color }}
                  className="w-2.5 h-2.5 rotate-45 -translate-x-1 shadow-lg shadow-yellow-500/50"
                  title={`İşaretçi: ${marker.label}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tracks List */}
        <div style={{ width: `${timelineWidth + 96}px` }} className="relative pb-8">
          {project.tracks.map((track) => (
            <MobileTrackView
              key={track.id}
              track={track}
              zoom={zoom}
              onAddClip={() => onOpenMediaBin()}
            />
          ))}
        </div>

        {/* Active Magnetic Snapping Laser Line */}
        {snapLinePixel !== null && (
          <div
            style={{ left: `${snapLinePixel}px` }}
            className="absolute top-0 bottom-0 w-0.5 bg-pink-400 z-35 pointer-events-none shadow-[0_0_15px_#ec4899] animate-pulse"
          >
            <div className="absolute top-0 -left-8 px-1.5 py-0.5 accent-gradient text-white font-bold text-[8px] rounded shadow">
              Hizalandı
            </div>
          </div>
        )}

        {/* Playhead Needle (Purple/Pink gradient vertical laser line) */}
        <div
          style={{ left: `${playheadPixel}px` }}
          className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 to-pink-500 z-40 pointer-events-none playhead-needle"
        >
          {/* Top Playhead Diamond/Badge */}
          <div className="absolute -top-0 -left-1.5 w-3.5 h-3.5 accent-gradient rounded-b-sm shadow-md flex items-center justify-center border border-white/20">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
