/**
 * OPEN-CAP AI Text-to-Speech (TTS) Engine
 * Synthesizes natural voice narration in Turkish and English with voice profiles and timeline sync
 */

import { Clip, Track, DEFAULT_AUDIO_SETTINGS } from '@/types/project';

export interface TTSVoiceProfile {
  id: string;
  name: string;
  lang: 'tr-TR' | 'en-US';
  gender: 'male' | 'female';
  category: 'Viral TikTok' | 'Spiker / Belgesel' | 'Yayıncı' | 'Sinematik';
  description: string;
  pitch: number;
  rate: number;
  avatarColor: string;
}

export const TTS_VOICES: TTSVoiceProfile[] = [
  // 🇹🇷 Türkçe Ses Profilleri
  {
    id: 'tr-ahmet-viral',
    name: 'Ahmet (Viral TikTok)',
    lang: 'tr-TR',
    gender: 'male',
    category: 'Viral TikTok',
    description: 'Hızlı, dinamik ve dikkat çeken sosyal medya anlatım sesi.',
    pitch: 1.05,
    rate: 1.15,
    avatarColor: '#00f0ff',
  },
  {
    id: 'tr-elif-spiker',
    name: 'Elif (Haber & Belgesel)',
    lang: 'tr-TR',
    gender: 'female',
    category: 'Spiker / Belgesel',
    description: 'Diksiyonu kusursuz, net ve profesyonel spiker tonu.',
    pitch: 1.0,
    rate: 1.0,
    avatarColor: '#f43f5e',
  },
  {
    id: 'tr-can-yayinci',
    name: 'Can (YouTube & Vlog)',
    lang: 'tr-TR',
    gender: 'male',
    category: 'Yayıncı',
    description: 'Samimi, enerjik ve eğlenceli video blog anlatımı.',
    pitch: 0.95,
    rate: 1.08,
    avatarColor: '#10b981',
  },
  {
    id: 'tr-zeynep-sakin',
    name: 'Zeynep (Sakin & Meditasyon)',
    lang: 'tr-TR',
    gender: 'female',
    category: 'Sinematik',
    description: 'Yumuşak, dinlendirici ve masalsı ses tonu.',
    pitch: 0.9,
    rate: 0.88,
    avatarColor: '#a855f7',
  },

  // 🇬🇧 English Voice Profiles
  {
    id: 'en-adam-viral',
    name: 'Adam (TikTok Storyteller)',
    lang: 'en-US',
    gender: 'male',
    category: 'Viral TikTok',
    description: 'Iconic deep and punchy social media narrative voice.',
    pitch: 0.9,
    rate: 1.1,
    avatarColor: '#facc15',
  },
  {
    id: 'en-bella-creator',
    name: 'Bella (Natural Creator)',
    lang: 'en-US',
    gender: 'female',
    category: 'Yayıncı',
    description: 'Bright, cheerful and engaging vlog narrator.',
    pitch: 1.1,
    rate: 1.05,
    avatarColor: '#fb923c',
  },
];

export class TTSEngine {
  /**
   * Plays a live preview of the generated speech using Web Speech API
   */
  public static previewSpeech(
    text: string,
    voiceProfile: TTSVoiceProfile,
    customRate?: number,
    customPitch?: number
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Web Speech API is not supported in this environment.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceProfile.lang;
    utterance.rate = customRate || voiceProfile.rate;
    utterance.pitch = customPitch || voiceProfile.pitch;

    // Select closest system voice matching language
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(voiceProfile.lang.substring(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stops any ongoing speech synthesis preview
   */
  public static stopPreview() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Calculates the estimated spoken duration based on word count and speed rate
   */
  public static estimateDuration(text: string, rate: number = 1.0): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    // Average speaking rate: ~140 words per minute = 2.33 words/sec
    const baseDuration = words / 2.33;
    const adjusted = baseDuration / Math.max(0.5, rate);
    return Math.max(1.0, Math.round(adjusted * 10) / 10);
  }

  /**
   * Generates a timeline audio clip representation for the generated TTS voiceover
   */
  public static createVoiceoverClip(
    text: string,
    voiceProfile: TTSVoiceProfile,
    startTime: number,
    trackId: string,
    customRate?: number
  ): Clip {
    const rate = customRate || voiceProfile.rate;
    const duration = this.estimateDuration(text, rate);

    return {
      id: `clip-tts-${Date.now()}`,
      mediaId: '',
      trackId,
      name: `AI Ses: ${voiceProfile.name} ("${text.substring(0, 15)}...")`,
      startTime,
      duration,
      sourceStartTime: 0,
      sourceDuration: duration,
      speed: 1.0,
      isMuted: false,
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
      audioSettings: {
        ...DEFAULT_AUDIO_SETTINGS,
        volume: 1.2,
        fadeIn: 0.05,
        fadeOut: 0.1,
        voiceEnhance: true,
      },
      colorLabel: voiceProfile.avatarColor,
    };
  }
}
