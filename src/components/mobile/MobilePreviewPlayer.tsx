import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize2,
  Activity,
} from 'lucide-react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { formatTimecode } from '@/utils/timecode';
import { GPURenderEngine, RenderMetrics } from '@/engine/gpu/GPURenderEngine';
import { KeyframeControls } from './KeyframeControls';
import { HapticEngine } from '@/engine/mobile/HapticEngine';

export const MobilePreviewPlayer: React.FC = () => {
  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    togglePlay,
    setIsPlaying,
    selectedClipId,
  } = useTimelineStore();

  const { project, getClipById } = useProjectStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gpuEngineRef = useRef<GPURenderEngine | null>(null);

  // Playback Clock Refs (Decoupled from React State for smooth 60 FPS)
  const playbackClockRef = useRef<{ startWallTime: number; startPlayhead: number }>({
    startWallTime: 0,
    startPlayhead: 0,
  });

  const lastMetricsUpdateRef = useRef<number>(0);
  const lastTimeStoreUpdateRef = useRef<number>(0);

  const [metrics, setMetrics] = useState<RenderMetrics>({
    fps: 60,
    frameTimeMs: 1.2,
    layersRendered: 3,
    gpuBackend: 'Hardware Canvas2D / WebGL',
  });

  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 1. Initialize GPU Engine on Canvas
  useEffect(() => {
    if (canvasRef.current && !gpuEngineRef.current) {
      gpuEngineRef.current = new GPURenderEngine(canvasRef.current);
      // Initial frame render
      gpuEngineRef.current.renderScene(project, currentTime);
    }
  }, []);

  // 2. High-Precision Continuous 60 FPS Playback Loop (Decoupled from React State)
  useEffect(() => {
    if (!isPlaying) {
      // When paused, render current static frame
      if (gpuEngineRef.current && canvasRef.current) {
        gpuEngineRef.current.renderScene(project, currentTime);
      }
      return;
    }

    // Reset high-precision start clock
    playbackClockRef.current = {
      startWallTime: performance.now(),
      startPlayhead: currentTime,
    };

    let animId: number;

    const playLoop = (now: number) => {
      const elapsedSeconds = (now - playbackClockRef.current.startWallTime) / 1000;
      let calculatedTime = playbackClockRef.current.startPlayhead + elapsedSeconds;

      // Loop or stop at end of project
      if (calculatedTime >= project.duration) {
        setCurrentTime(0);
        setIsPlaying(false);
        if (gpuEngineRef.current) {
          gpuEngineRef.current.renderScene(project, 0);
        }
        return;
      }

      // Smooth Hardware GPU Render on every vsync frame
      if (gpuEngineRef.current && canvasRef.current) {
        gpuEngineRef.current.syncVideoPlayback(project, calculatedTime, true);
        const renderResult = gpuEngineRef.current.renderScene(project, calculatedTime);

        // Throttle UI metrics state update (every 500ms) to prevent React render stutter
        if (now - lastMetricsUpdateRef.current >= 500) {
          setMetrics(renderResult);
          lastMetricsUpdateRef.current = now;
        }
      }

      // Sync Zustand Playhead smoothly (every ~30ms for 30-60 Hz timeline sync)
      if (now - lastTimeStoreUpdateRef.current >= 30) {
        useTimelineStore.setState({ currentTime: calculatedTime });
        lastTimeStoreUpdateRef.current = now;
      }

      animId = requestAnimationFrame(playLoop);
    };

    animId = requestAnimationFrame(playLoop);
    return () => {
      cancelAnimationFrame(animId);
      if (gpuEngineRef.current) {
        gpuEngineRef.current.pauseAll();
      }
    };
  }, [isPlaying, project.duration]);

  // 3. Static Render when Paused and currentTime changes (scrubbing/stepping)
  useEffect(() => {
    if (!isPlaying && gpuEngineRef.current && canvasRef.current) {
      gpuEngineRef.current.syncVideoPlayback(project, currentTime, false);
      gpuEngineRef.current.renderScene(project, currentTime);
    }
  }, [currentTime, isPlaying, project]);

  // Frame navigation helpers
  const stepFrame = (frames: number) => {
    const frameDuration = 1 / project.fps;
    const nextTime = Math.max(
      0,
      Math.min(project.duration, currentTime + frames * frameDuration)
    );
    HapticEngine.snapTick();
    setCurrentTime(nextTime);
  };

  // Double Tap gesture for fullscreen toggle
  const handleCanvasTap = () => {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      HapticEngine.impactHeavy();
      setIsFullscreen(!isFullscreen);
    }
    setLastTapTime(now);
  };

  const selectedClipData = selectedClipId ? getClipById(selectedClipId) : null;
  const isSelectedClipActive =
    selectedClipData &&
    currentTime >= selectedClipData.clip.startTime &&
    currentTime < selectedClipData.clip.startTime + selectedClipData.clip.duration;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#000000] relative overflow-hidden select-none p-2.5">
      {/* Top Floating Pill: Real-Time GPU Engine Diagnostics Badge + Keyframe Controls */}
      <div className="absolute top-2 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 spatial-glass-pill px-3 py-1 rounded-full text-[10px] text-zinc-300 font-mono shadow pointer-events-auto">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>{metrics.fps.toFixed(0)} FPS</span>
          </div>
          <span className="text-zinc-600">•</span>
          <span className="text-purple-300 font-semibold">{metrics.frameTimeMs}ms</span>
          <span className="text-zinc-600">•</span>
          <span className="text-pink-400 font-medium">{metrics.layersRendered} Katman</span>
        </div>

        {/* Keyframe Controls */}
        <div className="pointer-events-auto">
          <KeyframeControls />
        </div>
      </div>

      {/* Floating 18px Squircle Preview Area with Ambient Glow */}
      <div
        onClick={handleCanvasTap}
        className={`relative aspect-[9/16] h-full ${
          isFullscreen
            ? 'fixed inset-2 z-40 max-h-none rounded-[24px]'
            : 'max-h-[380px] sm:max-h-[420px] rounded-[18px]'
        } bg-black overflow-hidden ambient-glow border border-white/10 flex items-center justify-center group transition-all duration-300 cursor-pointer`}
      >
        {/* GPU Rendering Canvas */}
        <canvas
          ref={canvasRef}
          width={720}
          height={1280}
          className="w-full h-full object-cover"
        />

        {/* Selected Clip Transform Gizmo Outline Overlay */}
        {isSelectedClipActive && !isFullscreen && (
          <div className="absolute inset-4 border-2 border-purple-400 pointer-events-none rounded shadow-[0_0_18px_rgba(168,85,247,0.5)]">
            <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-purple-400 rounded-full shadow" />
            <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-purple-400 rounded-full shadow" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-purple-400 rounded-full shadow" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-purple-400 rounded-full shadow" />
          </div>
        )}

        {/* Fullscreen Toggle Hint Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(!isFullscreen);
          }}
          className="absolute bottom-2 right-2 p-1.5 rounded-full spatial-glass-pill text-zinc-300 hover:text-white active:scale-90 transition-all opacity-75 hover:opacity-100"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Floating Transport Pills (Oynatma çubuğu üzerinde havada asılı duran cam kontrol kapsülü) */}
      <div className="w-full max-w-[340px] flex items-center justify-between mt-2 px-3.5 py-1.5 spatial-glass-pill rounded-full z-20 shadow-lg">
        {/* Current Timecode Display */}
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {formatTimecode(currentTime, project.fps)}
          </span>
          <span className="text-[9px] font-mono text-zinc-500">
            {formatTimecode(project.duration, project.fps)}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Step Back 1 Frame */}
          <button
            onClick={() => stepFrame(-1)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
            title="1 Kare Geri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle Button (Accent Gradient) */}
          <button
            onClick={() => {
              HapticEngine.impactMedium();
              togglePlay();
            }}
            className="w-9 h-9 rounded-full accent-gradient text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/30 active:scale-90 transition-all border border-white/20"
            title={isPlaying ? 'Durdur' : 'Oynat'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white stroke-white" />
            ) : (
              <Play className="w-4 h-4 fill-white stroke-white ml-0.5" />
            )}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            onClick={() => stepFrame(1)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
            title="1 Kare İleri"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Resolution & FPS Indicator */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-zinc-400 font-medium">
            {project.resolution.width}x{project.resolution.height}
          </span>
          <span className="text-[9px] font-mono text-purple-300 font-bold">
            {project.fps} FPS
          </span>
        </div>
      </div>
    </div>
  );
};
