/**
 * OPEN-CAP Sticker, Emoji & Animated Badge Library
 * Curated high-resolution stickers, social media call-to-actions, and comic effects
 */

import { Clip, DEFAULT_AUDIO_SETTINGS } from '@/types/project';

export interface StickerItem {
  id: string;
  name: string;
  category: 'Emojiler' | 'Sosyal Medya' | 'Oklar & Rozetler' | 'Çizgi Roman' | 'Neon';
  content: string; // Emoji character, SVG, or text badge
  type: 'emoji' | 'badge' | 'comic';
  defaultColor?: string;
}

export const STICKER_LIBRARY: StickerItem[] = [
  // 1. EMOJİLER & REAKSİYONLAR
  { id: 'st-fire', name: 'Alev', category: 'Emojiler', content: '🔥', type: 'emoji' },
  { id: 'st-heart-eyes', name: 'Kalp Gözler', category: 'Emojiler', content: '😍', type: 'emoji' },
  { id: 'st-laugh', name: 'Kahkaha', category: 'Emojiler', content: '😂', type: 'emoji' },
  { id: 'st-100', name: '100 Puan', category: 'Emojiler', content: '💯', type: 'emoji' },
  { id: 'st-rocket', name: 'Roket', category: 'Emojiler', content: '🚀', type: 'emoji' },
  { id: 'st-crown', name: 'Kral Tacı', category: 'Emojiler', content: '👑', type: 'emoji' },
  { id: 'st-sparkles', name: 'Işıltı', category: 'Emojiler', content: '✨', type: 'emoji' },
  { id: 'st-star', name: 'Yıldız', category: 'Emojiler', content: '⭐', type: 'emoji' },
  { id: 'st-clap', name: 'Alkış', category: 'Emojiler', content: '👏', type: 'emoji' },
  { id: 'st-skull', name: 'Kafatası (Öldüm)', category: 'Emojiler', content: '💀', type: 'emoji' },
  { id: 'st-money', name: 'Para Uçuşu', category: 'Emojiler', content: '💸', type: 'emoji' },
  { id: 'st-eyes', name: 'Gözler', category: 'Emojiler', content: '👀', type: 'emoji' },

  // 2. SOSYAL MEDYA
  { id: 'st-sub', name: 'ABONE OL', category: 'Sosyal Medya', content: '🔴 ABONE OL', type: 'badge', defaultColor: '#ef4444' },
  { id: 'st-like', name: 'BEĞEN', category: 'Sosyal Medya', content: '👍 BEĞEN', type: 'badge', defaultColor: '#3b82f6' },
  { id: 'st-follow', name: 'TAKİP ET', category: 'Sosyal Medya', content: '➕ TAKİP ET', type: 'badge', defaultColor: '#f43f5e' },
  { id: 'st-bell', name: 'BİLDİRİM', category: 'Sosyal Medya', content: '🔔 BİLDİRİMİ AÇ', type: 'badge', defaultColor: '#facc15' },
  { id: 'st-share', name: 'PAYLAŞ', category: 'Sosyal Medya', content: '↗️ PAYLAŞ', type: 'badge', defaultColor: '#10b981' },
  { id: 'st-save', name: 'KAYDET', category: 'Sosyal Medya', content: '🔖 KAYDET', type: 'badge', defaultColor: '#8b5cf6' },

  // 3. OKLAR & ROZETLER
  { id: 'st-arrow-right', name: 'Sağ Ok', category: 'Oklar & Rozetler', content: '➔', type: 'emoji' },
  { id: 'st-arrow-down', name: 'Aşağı Ok', category: 'Oklar & Rozetler', content: '⬇️', type: 'emoji' },
  { id: 'st-target', name: 'Hedef', category: 'Oklar & Rozetler', content: '🎯', type: 'emoji' },
  { id: 'st-warning', name: 'Uyarı', category: 'Oklar & Rozetler', content: '⚠️', type: 'emoji' },
  { id: 'st-question', name: 'Soru', category: 'Oklar & Rozetler', content: '❓', type: 'emoji' },
  { id: 'st-check', name: 'Onay', category: 'Oklar & Rozetler', content: '✅', type: 'emoji' },

  // 4. ÇİZGİ ROMAN (COMIC)
  { id: 'st-bam', name: 'BAM!', category: 'Çizgi Roman', content: '💥 BAM!', type: 'comic', defaultColor: '#f59e0b' },
  { id: 'st-wow', name: 'WOW!', category: 'Çizgi Roman', content: '😮 WOW!', type: 'comic', defaultColor: '#ec4899' },
  { id: 'st-omg', name: 'OMG!', category: 'Çizgi Roman', content: '😱 OMG!', type: 'comic', defaultColor: '#8b5cf6' },
  { id: 'st-pop', name: 'POP!', category: 'Çizgi Roman', content: '🎈 POP!', type: 'comic', defaultColor: '#06b6d4' },
  { id: 'st-pow', name: 'POW!', category: 'Çizgi Roman', content: '🥊 POW!', type: 'comic', defaultColor: '#ef4444' },
];

export class StickerEngine {
  /**
   * Creates an overlay clip containing the sticker / badge
   */
  public static createStickerClip(
    sticker: StickerItem,
    startTime: number,
    trackId: string,
    duration: number = 3.0
  ): Clip {
    return {
      id: `clip-sticker-${Date.now()}`,
      mediaId: '',
      trackId,
      name: `Sticker: ${sticker.name}`,
      startTime,
      duration,
      sourceStartTime: 0,
      sourceDuration: duration,
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
        text: sticker.content,
        fontFamily: 'Inter',
        fontSize: sticker.type === 'emoji' ? 48 : 28,
        fontColor: '#ffffff',
        backgroundColor: sticker.defaultColor || (sticker.type === 'badge' ? '#ef4444' : 'transparent'),
        backgroundPadding: sticker.type === 'badge' ? 12 : 0,
        backgroundRadius: 8,
        align: 'center',
        letterSpacing: 2,
        lineHeight: 1.2,
        animation: 'popBounce',
      },
      colorLabel: '#ec4899',
    };
  }
}
