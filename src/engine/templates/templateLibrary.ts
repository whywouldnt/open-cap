/**
 * OPEN-CAP Curated Project Templates Library
 * High-engagement TikTok, Reels, Cinematic Vlog, and E-Commerce video templates
 */

import { Track, Project } from '@/types/project';

export interface TemplateSlot {
  index: number;
  label: string;
  suggestedDuration: number;
  type: 'video' | 'image';
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'TikTok Trend' | 'Reels / Shorts' | 'Sinematik Vlog' | 'Hızlı Kurgu' | 'Ürün Tanıtımı';
  description: string;
  duration: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  bpm: number;
  previewColor: string;
  slots: TemplateSlot[];
  buildProject: (mediaIds: string[]) => Project;
}

export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  // 1. TikTok Viral Velocity Beat
  {
    id: 'tiktokVelocity',
    name: 'TikTok Viral Velocity (Beat-Sync)',
    category: 'TikTok Trend',
    description: '130 BPM vuruşlarına senkronize hız eğrileri, RGB Split ve patlayan başlıklar.',
    duration: 12.0,
    aspectRatio: '9:16',
    bpm: 130,
    previewColor: '#00f0ff',
    slots: [
      { index: 0, label: 'Giriş Klibi (Intro)', suggestedDuration: 3.0, type: 'video' },
      { index: 1, label: 'Hızlı Vuruş 1 (Drop)', suggestedDuration: 4.5, type: 'video' },
      { index: 2, label: 'Kapanış (Outro)', suggestedDuration: 4.5, type: 'video' },
    ],
    buildProject: (mediaIds: string[]): Project => {
      const id1 = mediaIds[0] || '';
      const id2 = mediaIds[1] || id1;
      const id3 = mediaIds[2] || id2;

      return {
        id: `proj-template-velocity-${Date.now()}`,
        schemaVersion: '1.0',
        name: 'TikTok Viral Velocity',
        duration: 12.0,
        fps: 60,
        resolution: { width: 1080, height: 1920, aspectRatio: '9:16' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mediaBin: [],
        metadata: { description: 'OPEN-CAP Template', author: 'OPEN-CAP', tags: ['template'] },
        markers: [
          { id: 'm1', time: 3.0, label: 'Vuruş 1', color: '#facc15' },
          { id: 'm2', time: 7.5, label: 'Vuruş 2', color: '#facc15' },
        ],
        tracks: [
          {
            id: 'track-v1',
            name: 'Ana Video',
            type: 'video',
            isMuted: false,
            isLocked: false,
            isHidden: false,
            volume: 1.0,
            zIndex: 1,
            clips: [
              {
                id: 'clip-t1',
                mediaId: id1,
                trackId: 'track-v1',
                name: 'Klip 1 (Giriş)',
                startTime: 0,
                duration: 3.0,
                sourceStartTime: 0,
                sourceDuration: 3.0,
                speed: 1.0,
                isMuted: false,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [{ id: 'fx1', type: 'bloomGlow', name: 'Bloom', enabled: true, intensity: 0.6, params: {} }],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0.2, fadeOut: 0, pan: 0, isMuted: false, noiseReduction: false, voiceEnhance: false },
                colorLabel: '#00f0ff',
              },
              {
                id: 'clip-t2',
                mediaId: id2,
                trackId: 'track-v1',
                name: 'Klip 2 (Drop)',
                startTime: 3.0,
                duration: 4.5,
                sourceStartTime: 0,
                sourceDuration: 4.5,
                speed: 1.5,
                transitionIn: { type: 'zoomIn', duration: 0.4 },
                isMuted: false,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [{ id: 'fx2', type: 'rgbSplit', name: 'RGB Split', enabled: true, intensity: 0.7, params: {} }],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0, fadeOut: 0, pan: 0, isMuted: false, noiseReduction: false, voiceEnhance: false },
                colorLabel: '#f43f5e',
              },
              {
                id: 'clip-t3',
                mediaId: id3,
                trackId: 'track-v1',
                name: 'Klip 3 (Kapanış)',
                startTime: 7.5,
                duration: 4.5,
                sourceStartTime: 0,
                sourceDuration: 4.5,
                speed: 1.0,
                transitionIn: { type: 'wipeLeft', duration: 0.5 },
                isMuted: false,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [{ id: 'fx3', type: 'vignette', name: 'Vinyet', enabled: true, intensity: 0.5, params: {} }],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0, fadeOut: 0.5, pan: 0, isMuted: false, noiseReduction: false, voiceEnhance: false },
                colorLabel: '#a855f7',
              },
            ],
          },
          {
            id: 'track-title',
            name: 'Kinetik Başlık',
            type: 'text',
            isMuted: false,
            isLocked: false,
            isHidden: false,
            volume: 1.0,
            zIndex: 5,
            clips: [
              {
                id: 'clip-text-1',
                mediaId: '',
                trackId: 'track-title',
                name: 'Başlık',
                startTime: 3.0,
                duration: 3.5,
                sourceStartTime: 0,
                sourceDuration: 3.5,
                speed: 1.0,
                isMuted: true,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0, fadeOut: 0, pan: 0, isMuted: true, noiseReduction: false, voiceEnhance: false },
                textContent: {
                  text: 'VELOCITY DROP',
                  fontFamily: 'Anton',
                  fontSize: 34,
                  fontColor: '#fde047',
                  strokeColor: '#000000',
                  strokeWidth: 4,
                  align: 'center',
                  letterSpacing: 3,
                  lineHeight: 1.2,
                  animation: 'popBounce',
                },
                colorLabel: '#facc15',
              },
            ],
          },
        ],
      };
    },
  },

  // 2. Sinematik Seyahat Vlogu
  {
    id: 'cinematicVlog',
    name: 'Sinematik Seyahat Vlogu',
    category: 'Sinematik Vlog',
    description: 'Teal & Orange Hollywood LUT, Whip Pan savurma geçişleri ve zarif daktilo başlıkları.',
    duration: 15.0,
    aspectRatio: '9:16',
    bpm: 90,
    previewColor: '#06b6d4',
    slots: [
      { index: 0, label: 'Manzara Açılışı', suggestedDuration: 5.0, type: 'video' },
      { index: 1, label: 'Aksiyon Anı', suggestedDuration: 5.0, type: 'video' },
      { index: 2, label: 'Altın Saat Kapanış', suggestedDuration: 5.0, type: 'video' },
    ],
    buildProject: (mediaIds: string[]): Project => {
      const id1 = mediaIds[0] || '';
      const id2 = mediaIds[1] || id1;
      const id3 = mediaIds[2] || id2;

      return {
        id: `proj-template-vlog-${Date.now()}`,
        schemaVersion: '1.0',
        name: 'Sinematik Seyahat',
        duration: 15.0,
        fps: 60,
        resolution: { width: 1080, height: 1920, aspectRatio: '9:16' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mediaBin: [],
        metadata: { description: 'Sinematik Vlog', author: 'OPEN-CAP', tags: ['vlog', 'travel'] },
        markers: [
          { id: 'm1', time: 5.0, label: 'Geçiş 1', color: '#06b6d4' },
          { id: 'm2', time: 10.0, label: 'Geçiş 2', color: '#06b6d4' },
        ],
        tracks: [
          {
            id: 'track-v1',
            name: 'Vlog Katmanı',
            type: 'video',
            isMuted: false,
            isLocked: false,
            isHidden: false,
            volume: 1.0,
            zIndex: 1,
            clips: [
              {
                id: 'clip-v1',
                mediaId: id1,
                trackId: 'track-v1',
                name: 'Manzara',
                startTime: 0,
                duration: 5.0,
                sourceStartTime: 0,
                sourceDuration: 5.0,
                speed: 1.0,
                isMuted: false,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [{ id: 'lut-1', type: 'lut', name: 'LUT: Teal & Orange', enabled: true, intensity: 1.0, params: { lutId: 'tealOrange' } }],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0.5, fadeOut: 0, pan: 0, isMuted: false, noiseReduction: false, voiceEnhance: false },
                colorLabel: '#06b6d4',
              },
              {
                id: 'clip-v2',
                mediaId: id2,
                trackId: 'track-v1',
                name: 'Aksiyon',
                startTime: 5.0,
                duration: 5.0,
                sourceStartTime: 0,
                sourceDuration: 5.0,
                speed: 1.0,
                transitionIn: { type: 'crossFade', duration: 0.6 },
                isMuted: false,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [{ id: 'lut-2', type: 'lut', name: 'LUT: Teal & Orange', enabled: true, intensity: 1.0, params: { lutId: 'tealOrange' } }],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0, fadeOut: 0, pan: 0, isMuted: false, noiseReduction: false, voiceEnhance: false },
                colorLabel: '#06b6d4',
              },
              {
                id: 'clip-v3',
                mediaId: id3,
                trackId: 'track-v1',
                name: 'Gün Batımı',
                startTime: 10.0,
                duration: 5.0,
                sourceStartTime: 0,
                sourceDuration: 5.0,
                speed: 1.0,
                transitionIn: { type: 'zoomIn', duration: 0.5 },
                isMuted: false,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [{ id: 'lut-3', type: 'lut', name: 'LUT: Teal & Orange', enabled: true, intensity: 1.0, params: { lutId: 'tealOrange' } }],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0, fadeOut: 0.8, pan: 0, isMuted: false, noiseReduction: false, voiceEnhance: false },
                colorLabel: '#06b6d4',
              },
            ],
          },
          {
            id: 'track-text',
            name: 'Vlog Başlıkları',
            type: 'text',
            isMuted: false,
            isLocked: false,
            isHidden: false,
            volume: 1.0,
            zIndex: 4,
            clips: [
              {
                id: 'clip-vlog-text',
                mediaId: '',
                trackId: 'track-text',
                name: 'Yazı',
                startTime: 1.0,
                duration: 3.5,
                sourceStartTime: 0,
                sourceDuration: 3.5,
                speed: 1.0,
                isMuted: true,
                transform: { x: 0, y: 150, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0, fadeOut: 0, pan: 0, isMuted: true, noiseReduction: false, voiceEnhance: false },
                textContent: {
                  text: 'KAPADOKYA MACERASI',
                  fontFamily: 'Montserrat',
                  fontSize: 26,
                  fontColor: '#ffffff',
                  shadowColor: 'rgba(0,0,0,0.8)',
                  shadowBlur: 14,
                  align: 'center',
                  letterSpacing: 4,
                  lineHeight: 1.2,
                  animation: 'typewriter',
                },
                colorLabel: '#ffffff',
              },
            ],
          },
        ],
      };
    },
  },

  // 3. Cyberpunk Glitch Reel
  {
    id: 'cyberpunkGlitch',
    name: 'Cyberpunk Glitch Reel',
    category: 'Reels / Shorts',
    description: 'Neon mor & mavi renk paleti, siber glitch bozulmaları ve 3D derinlikli fütüristik metin.',
    duration: 10.0,
    aspectRatio: '9:16',
    bpm: 140,
    previewColor: '#a855f7',
    slots: [
      { index: 0, label: 'Neon Gece 1', suggestedDuration: 5.0, type: 'video' },
      { index: 1, label: 'Siber Şehir 2', suggestedDuration: 5.0, type: 'video' },
    ],
    buildProject: (mediaIds: string[]): Project => {
      const id1 = mediaIds[0] || '';
      const id2 = mediaIds[1] || id1;

      return {
        id: `proj-template-cyberpunk-${Date.now()}`,
        schemaVersion: '1.0',
        name: 'Cyberpunk Glitch',
        duration: 10.0,
        fps: 60,
        resolution: { width: 1080, height: 1920, aspectRatio: '9:16' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mediaBin: [],
        metadata: { description: 'Cyberpunk Glitch', author: 'OPEN-CAP', tags: ['cyberpunk', 'glitch'] },
        markers: [{ id: 'm1', time: 5.0, label: 'Glitch Drop', color: '#a855f7' }],
        tracks: [
          {
            id: 'track-v1',
            name: 'Neon Katmanı',
            type: 'video',
            isMuted: false,
            isLocked: false,
            isHidden: false,
            volume: 1.0,
            zIndex: 1,
            clips: [
              {
                id: 'clip-c1',
                mediaId: id1,
                trackId: 'track-v1',
                name: 'Klip 1',
                startTime: 0,
                duration: 5.0,
                sourceStartTime: 0,
                sourceDuration: 5.0,
                speed: 1.0,
                isMuted: false,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [
                  { id: 'fx-lut', type: 'lut', name: 'LUT: Cyberpunk', enabled: true, intensity: 1.0, params: { lutId: 'cyberpunkNeon' } },
                  { id: 'fx-glitch', type: 'glitch', name: 'Glitch', enabled: true, intensity: 0.6, params: {} },
                ],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0.2, fadeOut: 0, pan: 0, isMuted: false, noiseReduction: false, voiceEnhance: false },
                colorLabel: '#a855f7',
              },
              {
                id: 'clip-c2',
                mediaId: id2,
                trackId: 'track-v1',
                name: 'Klip 2',
                startTime: 5.0,
                duration: 5.0,
                sourceStartTime: 0,
                sourceDuration: 5.0,
                speed: 1.0,
                transitionIn: { type: 'glitch', duration: 0.4 },
                isMuted: false,
                transform: { x: 0, y: 0, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [
                  { id: 'fx-lut', type: 'lut', name: 'LUT: Cyberpunk', enabled: true, intensity: 1.0, params: { lutId: 'cyberpunkNeon' } },
                  { id: 'fx-vhs', type: 'vhsTape', name: 'VHS', enabled: true, intensity: 0.5, params: {} },
                ],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0, fadeOut: 0.5, pan: 0, isMuted: false, noiseReduction: false, voiceEnhance: false },
                colorLabel: '#a855f7',
              },
            ],
          },
          {
            id: 'track-txt',
            name: 'Neon Yazı',
            type: 'text',
            isMuted: false,
            isLocked: false,
            isHidden: false,
            volume: 1.0,
            zIndex: 3,
            clips: [
              {
                id: 'clip-txt-1',
                mediaId: '',
                trackId: 'track-txt',
                name: 'CYBER MATRIX',
                startTime: 1.5,
                duration: 4.0,
                sourceStartTime: 0,
                sourceDuration: 4.0,
                speed: 1.0,
                isMuted: true,
                transform: { x: 0, y: -100, scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, anchorX: 0.5, anchorY: 0.5 },
                blendMode: 'normal',
                keyframes: [],
                effects: [],
                audioSettings: { volume: 1.0, pitch: 1.0, speed: 1.0, fadeIn: 0, fadeOut: 0, pan: 0, isMuted: true, noiseReduction: false, voiceEnhance: false },
                textContent: {
                  text: 'CYBERPUNK 2088',
                  fontFamily: 'Orbitron',
                  fontSize: 28,
                  fontColor: '#00f0ff',
                  shadowColor: '#a855f7',
                  shadowBlur: 24,
                  align: 'center',
                  letterSpacing: 4,
                  lineHeight: 1.2,
                  animation: 'neonFlicker',
                  text3D: { enabled: true, depth: 10, extrusionColor: '#1e1b4b', lightAngle: 45 },
                },
                colorLabel: '#00f0ff',
              },
            ],
          },
        ],
      };
    },
  },
];
