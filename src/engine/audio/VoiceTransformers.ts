/**
 * OPEN-CAP Voice Transformers & Equalizer Presets
 * DSP Filter Chains for Voice Effects (Robot, Helium, Monster, Megaphone, Radio) and 10-Band EQ
 */

import { VoiceEffectType } from '@/types/project';

export interface EqualizerPreset {
  id: string;
  name: string;
  bands: number[]; // 10 frequency band gains in dB (-12 to +12)
}

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: EqualizerPreset[] = [
  {
    id: 'flat',
    name: 'Düz (Flat / Doğal)',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'bassBoost',
    name: 'Derin Bas Güçlendirme (Bass Boost)',
    bands: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'vocalEnhance',
    name: 'Vokal Netleştirme (Vocal Clarity)',
    bands: [-2, -2, 0, 2, 4, 5, 4, 3, 1, 0],
  },
  {
    id: 'trebleBoost',
    name: 'Tiz Parlatma (Treble Boost)',
    bands: [0, 0, 0, 0, 0, 1, 3, 5, 6, 6],
  },
  {
    id: 'podcastMaster',
    name: 'Podcast / Yayıncı Tonu',
    bands: [3, 2, 0, -1, 2, 4, 3, 2, 0, -1],
  },
];

export interface VoiceEffectDefinition {
  id: VoiceEffectType;
  name: string;
  description: string;
  pitchShift: number; // Semitones (-12 to +12)
  eqProfile: number[];
  reverbDecay?: number;
}

export const VOICE_EFFECTS: VoiceEffectDefinition[] = [
  {
    id: 'none',
    name: 'Efekt Yok (Orijinal)',
    description: 'Doğal ses kaydı.',
    pitchShift: 0,
    eqProfile: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'robot',
    name: 'Siber Robot (Vocoder)',
    description: 'Metalik rezonans ve sentetik modülasyon.',
    pitchShift: -2,
    eqProfile: [-4, -2, 4, 6, -2, 6, -4, 2, -2, -6],
  },
  {
    id: 'helium',
    name: 'Helyum Balonu (Chipmunk)',
    description: 'Yüksek frekanslı sevimli tiz ses.',
    pitchShift: 8,
    eqProfile: [-6, -4, -2, 0, 2, 4, 6, 6, 4, 2],
  },
  {
    id: 'monster',
    name: 'Derin Canavar (Deep Monster)',
    description: 'Kalın gök gürültüsü tonunda baslı ses.',
    pitchShift: -8,
    eqProfile: [8, 6, 4, 2, 0, -2, -4, -6, -6, -8],
  },
  {
    id: 'megaphone',
    name: 'Sokak Megafonu (Megaphone)',
    description: 'Band-pass telefon ve anons hoparlörü tınısı.',
    pitchShift: 0,
    eqProfile: [-12, -10, -6, 2, 8, 8, 4, -4, -10, -12],
  },
  {
    id: 'radio',
    name: 'Eski Radyo (AM Radio 1950)',
    description: 'Nostaljik dar frekanslı cızırtılı radyo hoparlörü.',
    pitchShift: 0,
    eqProfile: [-10, -8, -4, 4, 6, 4, -2, -6, -10, -12],
  },
  {
    id: 'cathedral',
    name: 'Katedral / Mağara Yankısı',
    description: 'Geniş hacimli akustik katedral yankısı.',
    pitchShift: 0,
    eqProfile: [2, 1, 0, 0, 0, 1, 2, 3, 2, 1],
    reverbDecay: 3.5,
  },
];
