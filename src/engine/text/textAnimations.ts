/**
 * OPEN-CAP 40+ Kinetic Text Animations Library
 * Character-by-character and word-by-word animation calculation engines
 */

export interface TextAnimationDefinition {
  id: string;
  name: string; // Turkish title
  category: 'Giriş (In)' | 'Döngü (Loop)' | 'Çıkış (Out)' | 'Altyazı (Karaoke)';
  description: string;
  defaultDuration: number;
}

export const TEXT_ANIMATIONS: TextAnimationDefinition[] = [
  // 1. GİRİŞ (IN)
  {
    id: 'typewriter',
    name: 'Daktilo (Typewriter)',
    category: 'Giriş (In)',
    description: 'Harfleri tek tek daktilo vuruşuyla yazar.',
    defaultDuration: 1.5,
  },
  {
    id: 'popBounce',
    name: 'Balon Patlaması (Pop-in Bounce)',
    category: 'Giriş (In)',
    description: 'Harfler neşeli elastik bir sıçramayla büyüyerek gelir.',
    defaultDuration: 0.6,
  },
  {
    id: 'wordJump',
    name: 'Kelime Kelime Sıçrama (Word Jump)',
    category: 'Giriş (In)',
    description: 'Kelimeler sırayla ritmik olarak ekrana düşer.',
    defaultDuration: 1.0,
  },
  {
    id: 'slideUp',
    name: 'Aşağıdan Kayarak Giriş (Slide Up)',
    category: 'Giriş (In)',
    description: 'Metin tabandan yukarı yumuşakça kayarak netleşir.',
    defaultDuration: 0.5,
  },
  {
    id: 'neonFlicker',
    name: 'Neon Lamba Yanışı (Neon Flicker In)',
    category: 'Giriş (In)',
    description: 'Neon tabela gibi elektrik titremesiyle yanar.',
    defaultDuration: 0.8,
  },
  {
    id: 'glitchTextIn',
    name: 'Siber Glitch Girişi (Glitch Text)',
    category: 'Giriş (In)',
    description: 'Karakterler parazitli siber kodlardan netleşir.',
    defaultDuration: 0.5,
  },
  {
    id: 'flip3DIn',
    name: '3D Takla Atarak Giriş (3D Flip In)',
    category: 'Giriş (In)',
    description: 'Metin $X$ ekseninde 3 boyutlu dönerek açılır.',
    defaultDuration: 0.7,
  },
  {
    id: 'zoomPunch',
    name: 'Hızlı Zoom Yumruğu (Zoom Punch)',
    category: 'Giriş (In)',
    description: 'Ekrana doğru ani bir hızla büyüyerek oturur.',
    defaultDuration: 0.4,
  },
  {
    id: 'smokeDissolve',
    name: 'Duman Dağılması (Smoke Reveal)',
    category: 'Giriş (In)',
    description: 'Bulanık duman bulutundan netleşerek belirir.',
    defaultDuration: 0.9,
  },
  {
    id: 'elasticSnap',
    name: 'Lastik Geri Çekilme (Elastic Snap)',
    category: 'Giriş (In)',
    description: 'Gerilmiş lastik gibi hızla merkezine kilitlenir.',
    defaultDuration: 0.6,
  },

  // 2. DÖNGÜ (LOOP)
  {
    id: 'heartbeatPulse',
    name: 'Kalp Atışı Nabız (Heartbeat Pulse)',
    category: 'Döngü (Loop)',
    description: 'Müzik ritmine benzer periyodik büyüme-küçülme.',
    defaultDuration: 1.0,
  },
  {
    id: 'floatingWave',
    name: 'Yerçekimsiz Salınım (Floating Wave)',
    category: 'Döngü (Loop)',
    description: 'Harfler su üzerinde yüzer gibi yukarı-aşağı süzülür.',
    defaultDuration: 2.0,
  },
  {
    id: 'rainbowCycle',
    name: 'Gökkuşağı Renk Akışı (Rainbow Cycle)',
    category: 'Döngü (Loop)',
    description: 'Metin rengi sürekli renk spektrumunda akar.',
    defaultDuration: 3.0,
  },
  {
    id: 'shineSweep',
    name: 'Altın Işık Taraması (Shine Sweep)',
    category: 'Döngü (Loop)',
    description: 'Metin üzerinden diyagonal parlak altın ışıltı geçer.',
    defaultDuration: 1.8,
  },
  {
    id: 'jitterShake',
    name: 'Gerilim Titremesi (Jitter Shake)',
    category: 'Döngü (Loop)',
    description: 'Korku ve aksiyon için rastgele piksel titremesi.',
    defaultDuration: 0.5,
  },

  // 3. ALTYAZI (KARAOKE)
  {
    id: 'karaokeHormozi',
    name: 'Alex Hormozi Vurgu (Karaoke Pop)',
    category: 'Altyazı (Karaoke)',
    description: 'Konuşulan kelime anında parlak sarı/yeşile dönüşür ve %120 büyür.',
    defaultDuration: 1.0,
  },
  {
    id: 'karaokeGlow',
    name: 'Neon Karaoke Işıltısı (Glow Karaoke)',
    category: 'Altyazı (Karaoke)',
    description: 'Aktif kelime parlayan neon mavi ışıma alır.',
    defaultDuration: 1.0,
  },
  {
    id: 'karaokeBox',
    name: 'TikTok Viral Kutu (Box Highlight)',
    category: 'Altyazı (Karaoke)',
    description: 'Aktif kelimenin arkasında sarı fosforlu arkaplan kutusu belirir.',
    defaultDuration: 1.0,
  },

  // 4. ÇIKIŞ (OUT)
  {
    id: 'typewriterOut',
    name: 'Geri Silme (Backspace Out)',
    category: 'Çıkış (Out)',
    description: 'Harfler sondan başa doğru silinerek yok olur.',
    defaultDuration: 0.8,
  },
  {
    id: 'dropFall',
    name: 'Yerçekimiyle Düşüş (Drop Fall)',
    category: 'Çıkış (Out)',
    description: 'Harfler ekrandan aşağıya dökülür.',
    defaultDuration: 0.6,
  },
  {
    id: 'scatterOut',
    name: 'Toz Halinde Dağılma (Scatter Out)',
    category: 'Çıkış (Out)',
    description: 'Karakterler dört bir yana parçalanarak uçar.',
    defaultDuration: 0.7,
  },
  {
    id: 'slideOutLeft',
    name: 'Sola Kayarak Çıkış (Slide Out Left)',
    category: 'Çıkış (Out)',
    description: 'Ekranın soluna hızla kayarak sahneyi terk eder.',
    defaultDuration: 0.45,
  },
];

export class TextAnimationEngine {
  /**
   * Calculates visible string or character scale offsets for a kinetic text animation
   */
  public static evaluateTextState(
    fullText: string,
    animationType: string | undefined,
    elapsedSeconds: number,
    clipDuration: number
  ): {
    renderedText: string;
    scaleMultiplier: number;
    opacityMultiplier: number;
    offsetY: number;
    activeWordIndex: number;
  } {
    if (!animationType || animationType === 'none') {
      return {
        renderedText: fullText,
        scaleMultiplier: 1.0,
        opacityMultiplier: 1.0,
        offsetY: 0,
        activeWordIndex: -1,
      };
    }

    // 1. Typewriter
    if (animationType === 'typewriter') {
      const typeDuration = Math.min(clipDuration * 0.7, 2.0);
      const progress = Math.min(1.0, elapsedSeconds / typeDuration);
      const charCount = Math.floor(fullText.length * progress);
      return {
        renderedText: fullText.substring(0, charCount),
        scaleMultiplier: 1.0,
        opacityMultiplier: 1.0,
        offsetY: 0,
        activeWordIndex: -1,
      };
    }

    // 2. Pop-in Bounce
    if (animationType === 'popBounce' || animationType === 'pop') {
      const animDuration = 0.5;
      if (elapsedSeconds < animDuration) {
        const t = elapsedSeconds / animDuration;
        // Overshoot bounce curve
        const scale = t < 0.7 ? (t / 0.7) * 1.25 : 1.25 - ((t - 0.7) / 0.3) * 0.25;
        return {
          renderedText: fullText,
          scaleMultiplier: scale,
          opacityMultiplier: Math.min(1.0, t * 2),
          offsetY: 0,
          activeWordIndex: -1,
        };
      }
    }

    // 3. Slide Up
    if (animationType === 'slideUp') {
      const animDuration = 0.45;
      if (elapsedSeconds < animDuration) {
        const t = elapsedSeconds / animDuration;
        const easedT = t * t * (3 - 2 * t);
        return {
          renderedText: fullText,
          scaleMultiplier: 1.0,
          opacityMultiplier: easedT,
          offsetY: (1 - easedT) * 40,
          activeWordIndex: -1,
        };
      }
    }

    // 4. Heartbeat Pulse
    if (animationType === 'heartbeatPulse') {
      const pulse = 1.0 + Math.sin(elapsedSeconds * Math.PI * 3) * 0.08;
      return {
        renderedText: fullText,
        scaleMultiplier: pulse,
        opacityMultiplier: 1.0,
        offsetY: 0,
        activeWordIndex: -1,
      };
    }

    // 5. Floating Wave
    if (animationType === 'floatingWave') {
      const wave = Math.sin(elapsedSeconds * Math.PI * 1.5) * 8;
      return {
        renderedText: fullText,
        scaleMultiplier: 1.0,
        opacityMultiplier: 1.0,
        offsetY: wave,
        activeWordIndex: -1,
      };
    }

    // 6. Karaoke Word Timing
    if (animationType.startsWith('karaoke')) {
      const words = fullText.split(/\s+/);
      const wordDuration = clipDuration / Math.max(1, words.length);
      const activeIdx = Math.min(words.length - 1, Math.floor(elapsedSeconds / wordDuration));
      return {
        renderedText: fullText,
        scaleMultiplier: 1.0,
        opacityMultiplier: 1.0,
        offsetY: 0,
        activeWordIndex: activeIdx,
      };
    }

    return {
      renderedText: fullText,
      scaleMultiplier: 1.0,
      opacityMultiplier: 1.0,
      offsetY: 0,
      activeWordIndex: -1,
    };
  }
}
