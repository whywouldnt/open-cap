/**
 * OPEN-CAP Mobile Data Schema v1.0
 * Comprehensive TypeScript Project Definitions
 * Mirroring Rust struct models in `src-tauri/src/models.rs`
 */

export type TrackType = 'video' | 'audio' | 'text' | 'effect' | 'overlay';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'colorDodge'
  | 'colorBurn'
  | 'hardLight'
  | 'softLight'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bezier';

export type MaskType = 'none' | 'linear' | 'mirror' | 'radial' | 'rectangle' | 'pen';

export interface Resolution {
  width: number;
  height: number;
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5' | 'custom';
}

export interface Transform {
  x: number; // Offset X in normalized (-100 to 100) or pixel percentage
  y: number; // Offset Y in normalized (-100 to 100) or pixel percentage
  scaleX: number; // Scale factor (1.0 = 100%)
  scaleY: number; // Scale factor (1.0 = 100%)
  rotation: number; // Rotation in degrees (0 - 360)
  opacity: number; // 0.0 - 1.0
  anchorX: number; // 0.5 = center
  anchorY: number; // 0.5 = center
}

export interface Keyframe {
  id: string;
  time: number; // Offset from clip start in seconds
  property: 'x' | 'y' | 'scaleX' | 'scaleY' | 'rotation' | 'opacity' | 'volume' | string;
  value: number | string | boolean;
  easing: EasingType;
  controlPoints?: [number, number, number, number]; // [x1, y1, x2, y2] for cubic bezier
}

export interface FilterEffect {
  id: string;
  type: 'liftGammaGain' | 'lut' | 'glitch' | 'vhs' | 'glow' | 'blur' | 'vignette' | 'sharpen' | 'chromaKey' | string;
  name: string;
  enabled: boolean;
  intensity: number; // 0.0 - 1.0
  params: Record<string, number | string | boolean>;
}

export type VoiceEffectType =
  | 'none'
  | 'robot'
  | 'helium'
  | 'monster'
  | 'megaphone'
  | 'radio'
  | 'echo'
  | 'cathedral';

export type FadeCurveType = 'linear' | 'sCurve' | 'logarithmic';

export interface AudioSettings {
  volume: number; // 0.0 - 2.0 (1.0 = 100%)
  pitch: number; // Semi-tones or ratio (1.0 = normal)
  speed: number; // 0.1 - 10.0
  fadeIn: number; // Duration in seconds
  fadeOut: number; // Duration in seconds
  fadeCurve?: FadeCurveType;
  pan: number; // -1.0 (Left) to +1.0 (Right)
  isMuted: boolean;
  noiseReduction: boolean;
  denoiseIntensity?: number; // 0.0 - 1.0
  voiceEnhance: boolean;
  voiceEffect?: VoiceEffectType;
  equalizerBands?: number[]; // 10 bands (-12dB to +12dB)
}

export interface ClipMask {
  type: MaskType;
  inverted: boolean;
  feather: number; // Edge feathering 0.0 - 1.0
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  points?: Array<{ x: number; y: number }>; // For custom polygon / pen masks
}

export interface WordTiming {
  word: string;
  start: number; // Offset from clip start in seconds
  end: number;
}

export interface TextContent {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  curveRadius?: number; // 0 for flat, >0 for curved arc
  gradientColors?: string[]; // E.g. ['#f59e0b', '#ef4444']
  text3D?: {
    enabled: boolean;
    depth: number;
    extrusionColor: string;
    lightAngle: number;
  };
  animation?: string; // E.g. 'typewriter', 'pop', 'wordJump', 'neonFlicker', 'karaoke'
  animationSpeed?: number;
  wordTimings?: WordTiming[]; // For Karaoke Auto-Captions
}

export interface ClipTransition {
  type: 'none' | 'crossFade' | 'wipeLeft' | 'wipeRight' | 'zoomIn' | 'zoomOut' | 'glitch';
  duration: number; // Transition overlap duration in seconds
}

export type MediaType = 'video' | 'audio' | 'image';

export interface ProjectMediaItem {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  mediaType: MediaType;
  size: number;
  duration: number;
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  audioChannels?: number;
  sampleRate?: number;
  bitrate?: number;
  thumbnailUri?: string;
  thumbnails?: string[];
  waveform?: number[]; // Array of normalized peak heights (0.0 to 1.0)
  waveformUri?: string;
  createdAt?: string;
}

export interface SpeedCurvePoint {
  timeRatio: number; // 0.0 to 1.0 along the clip source duration
  speed: number; // Speed multiplier (e.g. 0.1 to 10.0)
}

export type SpeedCurvePreset =
  | 'custom'
  | 'montage'
  | 'hero'
  | 'bullet'
  | 'flashIn'
  | 'flashOut';

export interface SpeedCurve {
  preset: SpeedCurvePreset;
  points: SpeedCurvePoint[];
}

export interface Clip {
  id: string;
  mediaId: string;
  trackId: string;
  name: string;
  startTime: number; // Placement on timeline in seconds
  duration: number; // Active play duration on timeline in seconds
  sourceStartTime: number; // Start offset in source media (trim in)
  sourceDuration: number; // Total available source media duration
  speed: number; // Playback speed multiplier (1.0 = normal)
  speedCurve?: SpeedCurve; // Optional dynamic speed curve
  isReversed?: boolean; // Reverse playback flag
  preservePitch?: boolean; // Audio pitch correction flag
  smoothSlowMotion?: 'none' | 'frameBlending' | 'opticalFlow'; // Smooth slow-mo interpolation
  isMuted: boolean;
  transform: Transform;
  blendMode: BlendMode;
  keyframes: Keyframe[];
  effects: FilterEffect[];
  audioSettings: AudioSettings;
  mask?: ClipMask;
  textContent?: TextContent;
  transitionIn?: ClipTransition;
  transitionOut?: ClipTransition;
  colorLabel?: string;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  isMuted: boolean;
  isLocked: boolean;
  isHidden: boolean;
  volume: number; // 0.0 - 1.0
  zIndex: number;
  clips: Clip[];
}

export interface Marker {
  id: string;
  time: number; // Seconds
  label: string;
  color: string;
}

export interface ProjectMetadata {
  description?: string;
  tags?: string[];
  thumbnail?: string;
  author?: string;
  device?: string;
}

export interface Project {
  schemaVersion: string; // e.g. "1.0.0"
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  resolution: Resolution;
  fps: number; // 30, 60, 24, 120
  duration: number; // Project duration in seconds
  tracks: Track[];
  markers: Marker[];
  mediaBin: ProjectMediaItem[];
  metadata: ProjectMetadata;
}

// -------------------------------------------------------------
// FACTORY DEFAULTS & INITIALIZERS
// -------------------------------------------------------------

export const DEFAULT_TRANSFORM: Transform = {
  x: 0,
  y: 0,
  scaleX: 1.0,
  scaleY: 1.0,
  rotation: 0,
  opacity: 1.0,
  anchorX: 0.5,
  anchorY: 0.5,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: 1.0,
  pitch: 1.0,
  speed: 1.0,
  fadeIn: 0,
  fadeOut: 0,
  pan: 0,
  isMuted: false,
  noiseReduction: false,
  voiceEnhance: false,
};

export const DEFAULT_RESOLUTION: Resolution = {
  width: 1080,
  height: 1920,
  aspectRatio: '9:16',
};

export function createDefaultProject(name: string = 'Untitled OpenCap Project'): Project {
  const videoTrackId = 'track-video-main';
  const audioTrackId = 'track-audio-main';
  const textTrackId = 'track-text-main';

  const defaultClips: Clip[] = [
    {
      id: 'clip-demo-1',
      mediaId: 'media-demo-1',
      trackId: videoTrackId,
      name: 'Cyberpunk City Glow',
      startTime: 0,
      duration: 3.5,
      sourceStartTime: 0,
      sourceDuration: 5.0,
      speed: 1.0,
      isMuted: false,
      transform: { ...DEFAULT_TRANSFORM },
      blendMode: 'normal',
      keyframes: [],
      effects: [
        {
          id: 'fx-1',
          type: 'glow',
          name: 'Neon Glow',
          enabled: true,
          intensity: 0.4,
          params: { radius: 12, threshold: 0.7 },
        },
      ],
      audioSettings: { ...DEFAULT_AUDIO_SETTINGS },
      colorLabel: '#3b82f6',
    },
    {
      id: 'clip-demo-2',
      mediaId: 'media-demo-2',
      trackId: videoTrackId,
      name: 'Neon Streets & Rain',
      startTime: 3.5,
      duration: 4.5,
      sourceStartTime: 0,
      sourceDuration: 6.0,
      speed: 1.0,
      isMuted: false,
      transform: { ...DEFAULT_TRANSFORM },
      blendMode: 'normal',
      keyframes: [],
      effects: [],
      audioSettings: { ...DEFAULT_AUDIO_SETTINGS },
      colorLabel: '#8b5cf6',
    },
    {
      id: 'clip-demo-text',
      mediaId: '',
      trackId: textTrackId,
      name: 'Title: OPEN-CAP',
      startTime: 0.5,
      duration: 4.0,
      sourceStartTime: 0,
      sourceDuration: 4.0,
      speed: 1.0,
      isMuted: true,
      transform: { ...DEFAULT_TRANSFORM, y: -25, scaleX: 1.1, scaleY: 1.1 },
      blendMode: 'normal',
      keyframes: [],
      effects: [],
      audioSettings: { ...DEFAULT_AUDIO_SETTINGS },
      textContent: {
        text: 'OPEN-CAP MOBILE',
        fontFamily: 'Inter',
        fontSize: 32,
        fontColor: '#00f0ff',
        strokeColor: '#000000',
        strokeWidth: 2,
        align: 'center',
        letterSpacing: 3,
        lineHeight: 1.2,
        animation: 'pop',
      },
      colorLabel: '#ec4899',
    },
    {
      id: 'clip-demo-audio',
      mediaId: 'media-demo-audio-1',
      trackId: audioTrackId,
      name: 'Synthwave Beat 128BPM',
      startTime: 0,
      duration: 8.0,
      sourceStartTime: 0,
      sourceDuration: 15.0,
      speed: 1.0,
      isMuted: false,
      transform: { ...DEFAULT_TRANSFORM },
      blendMode: 'normal',
      keyframes: [],
      effects: [],
      audioSettings: { ...DEFAULT_AUDIO_SETTINGS, volume: 0.8 },
      colorLabel: '#10b981',
    },
  ];

  return {
    schemaVersion: '1.0.0',
    id: `opencap-${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolution: { ...DEFAULT_RESOLUTION },
    fps: 60,
    duration: 8.0,
    tracks: [
      {
        id: textTrackId,
        name: 'Text / Titles',
        type: 'text',
        isMuted: false,
        isLocked: false,
        isHidden: false,
        volume: 1.0,
        zIndex: 3,
        clips: [defaultClips[2]],
      },
      {
        id: videoTrackId,
        name: 'Main Video',
        type: 'video',
        isMuted: false,
        isLocked: false,
        isHidden: false,
        volume: 1.0,
        zIndex: 2,
        clips: [defaultClips[0], defaultClips[1]],
      },
      {
        id: audioTrackId,
        name: 'Background Audio',
        type: 'audio',
        isMuted: false,
        isLocked: false,
        isHidden: false,
        volume: 0.8,
        zIndex: 1,
        clips: [defaultClips[3]],
      },
    ],
    markers: [
      { id: 'm-1', time: 3.5, label: 'Beat Drop', color: '#f59e0b' },
    ],
    mediaBin: [
      {
        id: 'media-demo-1',
        name: 'city_glow_1080p.mp4',
        path: '/assets/sample_city.mp4',
        mimeType: 'video/mp4',
        mediaType: 'video',
        size: 14205800,
        duration: 5.0,
        width: 1080,
        height: 1920,
        fps: 60,
        codec: 'H.264 / AVC',
        audioChannels: 2,
        sampleRate: 48000,
        waveform: [0.2, 0.4, 0.7, 0.5, 0.8, 0.9, 0.6, 0.3, 0.5, 0.7, 0.8, 0.4, 0.3, 0.6, 0.9, 0.7],
      },
      {
        id: 'media-demo-2',
        name: 'neon_rain_1080p.mp4',
        path: '/assets/sample_rain.mp4',
        mimeType: 'video/mp4',
        mediaType: 'video',
        size: 19801200,
        duration: 6.0,
        width: 1080,
        height: 1920,
        fps: 60,
        codec: 'HEVC / H.265',
        audioChannels: 2,
        sampleRate: 48000,
        waveform: [0.3, 0.6, 0.8, 0.9, 0.7, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.2, 0.6, 0.8, 0.5],
      },
      {
        id: 'media-demo-audio-1',
        name: 'synthwave_beat.wav',
        path: '/assets/sample_beat.wav',
        mimeType: 'audio/wav',
        mediaType: 'audio',
        size: 5120000,
        duration: 15.0,
        codec: 'PCM WAV (16-bit)',
        audioChannels: 2,
        sampleRate: 48000,
        waveform: [
          0.1, 0.8, 0.9, 0.3, 0.7, 0.9, 0.4, 0.8, 0.9, 0.5, 0.9, 0.8, 0.4, 0.7, 0.9, 0.3,
          0.8, 0.9, 0.5, 0.8, 0.9, 0.4, 0.7, 0.9, 0.5, 0.9, 0.8, 0.3, 0.8, 0.9, 0.4, 0.7,
        ],
      },
    ],
    metadata: {
      description: 'Phase 0 Mobile Editor Test Project',
      author: 'OPEN-CAP Architect',
      device: 'Mobile Touch Emulation',
    },
  };
}
