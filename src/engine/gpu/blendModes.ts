/**
 * OPEN-CAP 37+ Blend Modes Library
 * Definitions, categorization, and CPU/GPU blend formulations
 */

export interface BlendModeDefinition {
  id: string;
  name: string; // Turkish title (e.g. "Çoğalt", "Ekran")
  category: 'Temel' | 'Koyulaştır' | 'Aydınlat' | 'Kontrast' | 'Karşılaştırma' | 'Bileşen' | 'VFX Özel';
  description: string;
  wgslFunction: string;
  canvasCompositeOperation?: GlobalCompositeOperation;
}

export const BLEND_MODES: BlendModeDefinition[] = [
  // 1. TEMEL
  {
    id: 'normal',
    name: 'Normal',
    category: 'Temel',
    description: 'Üst katmanı standart opaklıkla yerleştirir.',
    wgslFunction: 'blend_normal',
    canvasCompositeOperation: 'source-over',
  },
  {
    id: 'dissolve',
    name: 'Dağıt (Dissolve)',
    category: 'Temel',
    description: 'Rastgele gürültü deseni ile piksel dağıtımı yapar.',
    wgslFunction: 'blend_dissolve',
  },

  // 2. KOYULAŞTIR (DARKEN)
  {
    id: 'darken',
    name: 'Koyulaştır (Darken)',
    category: 'Koyulaştır',
    description: 'Her kanalda en koyu pikseli seçer.',
    wgslFunction: 'blend_darken',
    canvasCompositeOperation: 'darken',
  },
  {
    id: 'multiply',
    name: 'Çoğalt (Multiply)',
    category: 'Koyulaştır',
    description: 'Pikselleri çarparak gölgeleri koyulaştırır, beyazı şeffaf yapar.',
    wgslFunction: 'blend_multiply',
    canvasCompositeOperation: 'multiply',
  },
  {
    id: 'colorBurn',
    name: 'Renk Yakma (Color Burn)',
    category: 'Koyulaştır',
    description: 'Kontrastı artırarak arka plan rengini koyulaştırır.',
    wgslFunction: 'blend_color_burn',
    canvasCompositeOperation: 'color-burn',
  },
  {
    id: 'linearBurn',
    name: 'Doğrusal Yakma (Linear Burn)',
    category: 'Koyulaştır',
    description: 'Parlaklığı azaltarak koyulaştırır.',
    wgslFunction: 'blend_linear_burn',
  },
  {
    id: 'darkerColor',
    name: 'Daha Koyu Renk (Darker Color)',
    category: 'Koyulaştır',
    description: 'Toplam parlaklık değerine göre en koyu rengi seçer.',
    wgslFunction: 'blend_darker_color',
  },

  // 3. AYDINLAT (LIGHTEN)
  {
    id: 'lighten',
    name: 'Aydınlat (Lighten)',
    category: 'Aydınlat',
    description: 'Her kanalda en açık pikseli seçer.',
    wgslFunction: 'blend_lighten',
    canvasCompositeOperation: 'lighten',
  },
  {
    id: 'screen',
    name: 'Ekran (Screen)',
    category: 'Aydınlat',
    description: 'Siyahı şeffaf yaparak ışığı ve parlak alanları birleştirir.',
    wgslFunction: 'blend_screen',
    canvasCompositeOperation: 'screen',
  },
  {
    id: 'colorDodge',
    name: 'Renk Soldurma (Color Dodge)',
    category: 'Aydınlat',
    description: 'Parlaklığı artırarak canlı ışık patlamaları üretir.',
    wgslFunction: 'blend_color_dodge',
    canvasCompositeOperation: 'color-dodge',
  },
  {
    id: 'linearDodge',
    name: 'Doğrusal Soldurma (Ekle / Add)',
    category: 'Aydınlat',
    description: 'Kanal değerlerini doğrudan toplayarak yoğun ışık verir.',
    wgslFunction: 'blend_linear_dodge',
    canvasCompositeOperation: 'lighter',
  },
  {
    id: 'lighterColor',
    name: 'Daha Açık Renk (Lighter Color)',
    category: 'Aydınlat',
    description: 'Toplam parlaklık değerine göre en açık rengi seçer.',
    wgslFunction: 'blend_lighter_color',
  },

  // 4. KONTRAST (CONTRAST)
  {
    id: 'overlay',
    name: 'Kaplama (Overlay)',
    category: 'Kontrast',
    description: 'Koyu alanları koyulaştırır, açık alanları aydınlatır.',
    wgslFunction: 'blend_overlay',
    canvasCompositeOperation: 'overlay',
  },
  {
    id: 'softLight',
    name: 'Yumuşak Işık (Soft Light)',
    category: 'Kontrast',
    description: 'Sahneye difüze bir spot ışık efekti verir.',
    wgslFunction: 'blend_soft_light',
    canvasCompositeOperation: 'soft-light',
  },
  {
    id: 'hardLight',
    name: 'Sert Işık (Hard Light)',
    category: 'Kontrast',
    description: 'Doğrudan sert projektör ışığı efekti üretir.',
    wgslFunction: 'blend_hard_light',
    canvasCompositeOperation: 'hard-light',
  },
  {
    id: 'vividLight',
    name: 'Canlı Işık (Vivid Light)',
    category: 'Kontrast',
    description: 'Color Burn ve Color Dodge kombinasyonu uygular.',
    wgslFunction: 'blend_vivid_light',
  },
  {
    id: 'linearLight',
    name: 'Doğrusal Işık (Linear Light)',
    category: 'Kontrast',
    description: 'Linear Burn ve Linear Dodge kombinasyonu uygular.',
    wgslFunction: 'blend_linear_light',
  },
  {
    id: 'pinLight',
    name: 'İğne Işığı (Pin Light)',
    category: 'Kontrast',
    description: 'Renkleri tonlarına göre keskin şekilde değiştirir.',
    wgslFunction: 'blend_pin_light',
  },
  {
    id: 'hardMix',
    name: 'Sert Karışım (Hard Mix)',
    category: 'Kontrast',
    description: 'Renkleri 8 temel renk eşiğine (posterize) kilitler.',
    wgslFunction: 'blend_hard_mix',
  },

  // 5. KARŞILAŞTIRMA (DIFFERENCE / INVERT)
  {
    id: 'difference',
    name: 'Fark (Difference)',
    category: 'Karşılaştırma',
    description: 'İki katman arasındaki mutlak renk farkını alır.',
    wgslFunction: 'blend_difference',
    canvasCompositeOperation: 'difference',
  },
  {
    id: 'exclusion',
    name: 'Dışlama (Exclusion)',
    category: 'Karşılaştırma',
    description: 'Difference moduna benzer ancak daha yumuşak kontrast üretir.',
    wgslFunction: 'blend_exclusion',
    canvasCompositeOperation: 'exclusion',
  },
  {
    id: 'subtract',
    name: 'Çıkar (Subtract)',
    category: 'Karşılaştırma',
    description: 'Arka plan renginden üst katmanın rengini çıkarır.',
    wgslFunction: 'blend_subtract',
  },
  {
    id: 'divide',
    name: 'Böl (Divide)',
    category: 'Karşılaştırma',
    description: 'Arka plan rengini üst katman rengine böler.',
    wgslFunction: 'blend_divide',
  },

  // 6. BİLEŞEN (HSL / COLOR COMPONENT)
  {
    id: 'hue',
    name: 'Ton (Hue)',
    category: 'Bileşen',
    description: 'Üst katmanın renk tonunu arka plana aktarır.',
    wgslFunction: 'blend_hue',
    canvasCompositeOperation: 'hue',
  },
  {
    id: 'saturation',
    name: 'Doygunluk (Saturation)',
    category: 'Bileşen',
    description: 'Üst katmanın renk doygunluğunu uygular.',
    wgslFunction: 'blend_saturation',
    canvasCompositeOperation: 'saturation',
  },
  {
    id: 'color',
    name: 'Renk (Color)',
    category: 'Bileşen',
    description: 'Üst katmanın ton ve doygunluğunu koruyarak parlaklığı korur.',
    wgslFunction: 'blend_color',
    canvasCompositeOperation: 'color',
  },
  {
    id: 'luminosity',
    name: 'Parlaklık (Luminosity)',
    category: 'Bileşen',
    description: 'Üst katmanın parlaklığını arka plan renklerine aktarır.',
    wgslFunction: 'blend_luminosity',
    canvasCompositeOperation: 'luminosity',
  },

  // 7. VFX & SİNEMA ÖZEL (CINEMATIC / VFX)
  {
    id: 'glowAdd',
    name: 'Neon Parıltı (Glow Add)',
    category: 'VFX Özel',
    description: 'HDR renk eşiğini aşan piksellere neon ışıması ekler.',
    wgslFunction: 'blend_glow_add',
  },
  {
    id: 'reflect',
    name: 'Yansıma (Reflect)',
    category: 'VFX Özel',
    description: 'Parlak nesneler üzerinde metalik yansıma oluşturur.',
    wgslFunction: 'blend_reflect',
  },
  {
    id: 'freeze',
    name: 'Donma (Freeze)',
    category: 'VFX Özel',
    description: 'Reflect modunun tersi soğuk buz tonları üretir.',
    wgslFunction: 'blend_freeze',
  },
  {
    id: 'heat',
    name: 'Termal Isı (Heat)',
    category: 'VFX Özel',
    description: 'Sıcak neon turuncu/kırmızı kızılötesi tonlama yapar.',
    wgslFunction: 'blend_heat',
  },
  {
    id: 'grainExtract',
    name: 'Doku Çıkarımı (Grain Extract)',
    category: 'VFX Özel',
    description: 'Film greni ve doku katmanlarını ayrıştırır.',
    wgslFunction: 'blend_grain_extract',
  },
  {
    id: 'grainMerge',
    name: 'Doku Birleştirme (Grain Merge)',
    category: 'VFX Özel',
    description: 'Film grenini video üzerine doğal analog hissiyle giydirir.',
    wgslFunction: 'blend_grain_merge',
  },
  {
    id: 'chromaStencil',
    name: 'Kroma Şablon (Chroma Stencil)',
    category: 'VFX Özel',
    description: 'Yeşil/Mavi perde arkasını saydamlaştırarak maskeler.',
    wgslFunction: 'blend_chroma_stencil',
  },
  {
    id: 'silhouetteAlpha',
    name: 'Siluet Alfa (Silhouette Alpha)',
    category: 'VFX Özel',
    description: 'Üst katmanın alfa kanalını alttaki tüm katmanlara kesme maskesi yapar.',
    wgslFunction: 'blend_silhouette_alpha',
    canvasCompositeOperation: 'destination-in',
  },
  {
    id: 'alphaMaskInverted',
    name: 'Ters Alfa Maske (Inverted Alpha)',
    category: 'VFX Özel',
    description: 'Üst katmanın opak alanlarını alttan delerek çıkartır.',
    wgslFunction: 'blend_alpha_mask_inverted',
    canvasCompositeOperation: 'destination-out',
  },
  {
    id: 'hardColor',
    name: 'Sert Renk (Hard Color)',
    category: 'VFX Özel',
    description: 'Retro pop-art ve çizgi roman tarzı keskin renk posterizasyonu.',
    wgslFunction: 'blend_hard_color',
  },
];
