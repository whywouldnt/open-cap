/**
 * OPEN-CAP 50+ GPU Video Effects Library
 * Categorized VFX definitions with parameter schemas and GPU shader bindings
 */

export interface EffectDefinition {
  id: string;
  name: string; // Turkish title
  category: 'Glitch' | 'Retro' | 'Bulanıklık' | 'Işık & Parıltı' | 'Sinematik' | 'Bozulma' | 'Stil & Sanat';
  description: string;
  defaultIntensity: number; // 0.0 - 1.0
  iconName: string;
  params: Record<string, { label: string; min: number; max: number; default: number; step?: number }>;
}

export const VFX_EFFECTS: EffectDefinition[] = [
  // 1. GLITCH & CYBERPUNK (8 Effects)
  {
    id: 'rgbSplit',
    name: 'RGB Ayrışması (Chromatic Aberration)',
    category: 'Glitch',
    description: 'Kırmızı, yeşil ve mavi renk kanallarını yatay eksende ayrıştırır.',
    defaultIntensity: 0.6,
    iconName: 'Zap',
    params: {
      offset: { label: 'Ayrışma Mesafesi', min: 0, max: 50, default: 15 },
      angle: { label: 'Açı', min: 0, max: 360, default: 0 },
    },
  },
  {
    id: 'digitalGlitch',
    name: 'Dijital Parazit (Glitch Artifacts)',
    category: 'Glitch',
    description: 'Rastgele dijital blok kırılmaları ve veri kaymaları üretir.',
    defaultIntensity: 0.7,
    iconName: 'Radio',
    params: {
      frequency: { label: 'Sıklık', min: 1, max: 30, default: 10 },
      blockSize: { label: 'Blok Boyutu', min: 5, max: 100, default: 30 },
    },
  },
  {
    id: 'cyberGrid',
    name: 'Siber Izgara (Cyber Grid)',
    category: 'Glitch',
    description: 'Neon siberpunk perspektif ızgarası ekler.',
    defaultIntensity: 0.5,
    iconName: 'Grid',
    params: {
      gridSize: { label: 'Izgara Boyutu', min: 10, max: 80, default: 35 },
      glow: { label: 'Neon Parlama', min: 0, max: 1, default: 0.8 },
    },
  },
  {
    id: 'hologram',
    name: 'Hologram Titremesi (Hologram Flicker)',
    category: 'Glitch',
    description: 'Mavi neon tarama çizgileri ve holografik titreme uygular.',
    defaultIntensity: 0.65,
    iconName: 'Sparkles',
    params: {
      linesCount: { label: 'Çizgi Sayısı', min: 50, max: 400, default: 150 },
      flickerSpeed: { label: 'Titreme Hızı', min: 1, max: 20, default: 8 },
    },
  },
  {
    id: 'pixelate',
    name: 'Pikselleştirme (8-Bit Pixelate)',
    category: 'Glitch',
    description: 'Görüntüyü retro 8-bit piksel bloklarına dönüştürür.',
    defaultIntensity: 0.5,
    iconName: 'Square',
    params: {
      pixelSize: { label: 'Piksel Çözünürlüğü', min: 2, max: 64, default: 16 },
    },
  },
  {
    id: 'datamosh',
    name: 'Datamosh Video Sızıntısı',
    category: 'Glitch',
    description: 'Video sıkıştırma p-frame iz bırakma glitch efekti.',
    defaultIntensity: 0.75,
    iconName: 'Activity',
    params: {
      smear: { label: 'Bulaşma Miktarı', min: 0, max: 1, default: 0.7 },
    },
  },
  {
    id: 'vhsScan',
    name: 'VHS Takip Bozulması (Tracking Glitch)',
    category: 'Glitch',
    description: 'Eski kasetlerdeki alt bant paraziti ve kafa ayarı kayması.',
    defaultIntensity: 0.6,
    iconName: 'Sliders',
    params: {
      noiseHeight: { label: 'Parazit Yüksekliği', min: 10, max: 120, default: 45 },
    },
  },
  {
    id: 'crtMonitor',
    name: 'Tüplü TV (CRT Monitor Curvature)',
    category: 'Glitch',
    description: 'Bombeli cam monitör yansıması ve fosfor ızgarası.',
    defaultIntensity: 0.55,
    iconName: 'Tv',
    params: {
      curve: { label: 'Ekran Bombesi', min: 0, max: 0.5, default: 0.15 },
    },
  },

  // 2. RETRO & VINTAGE (8 Effects)
  {
    id: 'vhsTape',
    name: 'VHS Nostalji Bandı (1985 Tape)',
    category: 'Retro',
    description: 'Analog video greni, solgun renkler ve tarama hatları.',
    defaultIntensity: 0.7,
    iconName: 'Film',
    params: {
      grain: { label: 'Analog Gren', min: 0, max: 1, default: 0.6 },
      saturation: { label: 'Renk Doygunluğu', min: 0, max: 1.5, default: 0.85 },
    },
  },
  {
    id: 'filmGrain8mm',
    name: '8mm Sinema Greni (8mm Film Grain)',
    category: 'Retro',
    description: 'Gerçek analog film greni ve mikroskobik toz zerrecikleri.',
    defaultIntensity: 0.5,
    iconName: 'Camera',
    params: {
      density: { label: 'Gren Yoğunluğu', min: 0, max: 1, default: 0.5 },
    },
  },
  {
    id: 'sepiaVintage',
    name: 'Klasik Sepya (Vintage Sepia 1920)',
    category: 'Retro',
    description: 'Sıcak kahverengi sepya tonlama ve kenar yanığı.',
    defaultIntensity: 0.8,
    iconName: 'Image',
    params: {
      tone: { label: 'Sepya Tonu', min: 0, max: 1, default: 0.8 },
    },
  },
  {
    id: 'polaroidColor',
    name: 'Polaroid Anlık Fotoğraf',
    category: 'Retro',
    description: 'Yeşil/sarı gölgeler ve yüksek kontrastlı nostaljik renk tonu.',
    defaultIntensity: 0.65,
    iconName: 'Aperture',
    params: {
      fade: { label: 'Matlık', min: 0, max: 1, default: 0.4 },
    },
  },
  {
    id: 'retroHalftone',
    name: 'Retro Gazete Baskısı (Halftone Dots)',
    category: 'Retro',
    description: 'CMYK gazete baskı tram noktaları efekti.',
    defaultIntensity: 0.6,
    iconName: 'CircleDot',
    params: {
      dotSize: { label: 'Nokta Boyutu', min: 2, max: 20, default: 6 },
    },
  },
  {
    id: 'super16mm',
    name: 'Super 16mm Film Kaplaması',
    category: 'Retro',
    description: 'Organik sinematik 16mm film dokusu.',
    defaultIntensity: 0.55,
    iconName: 'Video',
    params: {
      jitter: { label: 'Kare Titremesi', min: 0, max: 1, default: 0.3 },
    },
  },
  {
    id: 'monochromeNewspaper',
    name: 'Siyah Beyaz Manşet (Newspaper B&W)',
    category: 'Retro',
    description: 'Yüksek kontrastlı keskin siyah-beyaz doku.',
    defaultIntensity: 1.0,
    iconName: 'Moon',
    params: {
      contrast: { label: 'Kontrast', min: 1, max: 3, default: 1.8 },
    },
  },
  {
    id: 'lightLeakVintage',
    name: 'Işık Sızıntısı (Vintage Light Leak)',
    category: 'Retro',
    description: 'Film kaset kenarından sızan turuncu/kırmızı ışık huzmesi.',
    defaultIntensity: 0.6,
    iconName: 'Sun',
    params: {
      warmth: { label: 'Sıcaklık', min: 0, max: 1, default: 0.8 },
    },
  },

  // 3. BULANIKLIK & ODAK (8 Effects)
  {
    id: 'gaussianBlur',
    name: 'Gauss Bulanıklığı (Gaussian Blur)',
    category: 'Bulanıklık',
    description: 'Pürüzsüz çok aşamalı alan derinliği bulanıklığı.',
    defaultIntensity: 0.5,
    iconName: 'Droplet',
    params: {
      radius: { label: 'Bulanıklık Yarıçapı', min: 1, max: 50, default: 15 },
    },
  },
  {
    id: 'radialZoomBlur',
    name: 'Radyal Zoom Bulanıklığı (Radial Zoom)',
    category: 'Bulanıklık',
    description: 'Merkezden dışa doğru yüksek hızlı aksiyon zoom efekti.',
    defaultIntensity: 0.6,
    iconName: 'Maximize2',
    params: {
      speed: { label: 'Yakınlaşma Hızı', min: 0, max: 1, default: 0.5 },
    },
  },
  {
    id: 'tiltShift',
    name: 'Minyatür Odak (Tilt-Shift Lens)',
    category: 'Bulanıklık',
    description: 'Üst ve altı bulanıklaştırarak sahneyi oyuncak/minyatür gibi gösterir.',
    defaultIntensity: 0.7,
    iconName: 'Eye',
    params: {
      focusBand: { label: 'Net Alan Genişliği', min: 0.1, max: 0.8, default: 0.3 },
    },
  },
  {
    id: 'motionBlur',
    name: 'Hareket Bulanıklığı (Directional Motion)',
    category: 'Bulanıklık',
    description: 'Belirlenen açı boyunca hızlı hareket izi oluşturur.',
    defaultIntensity: 0.55,
    iconName: 'MoveRight',
    params: {
      angle: { label: 'Yön Açısı', min: 0, max: 360, default: 0 },
      distance: { label: 'Mesafe', min: 2, max: 60, default: 20 },
    },
  },
  {
    id: 'bokehDream',
    name: 'Rüya Bokeh Işıkları (Bokeh Blur)',
    category: 'Bulanıklık',
    description: 'Işık noktalarını altıgen ve yuvarlak bokeh toplarına dönüştürür.',
    defaultIntensity: 0.65,
    iconName: 'Sparkle',
    params: {
      bokehSize: { label: 'Bokeh Boyutu', min: 5, max: 40, default: 18 },
    },
  },
  {
    id: 'spinBlur',
    name: 'Dönme Bulanıklığı (Spin Blur)',
    category: 'Bulanıklık',
    description: 'Merkez etrafında girdap gibi dönen kinetik bulanıklık.',
    defaultIntensity: 0.5,
    iconName: 'RotateCw',
    params: {
      angle: { label: 'Dönüş Hızı', min: 1, max: 45, default: 12 },
    },
  },
  {
    id: 'prismBlur',
    name: 'Prizma Renk Kırılması (Prism Edge Blur)',
    category: 'Bulanıklık',
    description: 'Kenarlarda optik prizma kırılması ve kromatik bulanıklık.',
    defaultIntensity: 0.6,
    iconName: 'Disc',
    params: {
      spread: { label: 'Kırılma Alanı', min: 0, max: 1, default: 0.45 },
    },
  },
  {
    id: 'softGlowBlur',
    name: 'Pastel Yumuşatma (Soft Portrait Blur)',
    category: 'Bulanıklık',
    description: 'Portrelerde cilt pürüzsüzleştirme ve yumuşak rüya ışıltısı.',
    defaultIntensity: 0.4,
    iconName: 'Smile',
    params: {
      smoothness: { label: 'Yumuşaklık', min: 0, max: 1, default: 0.6 },
    },
  },

  // 4. IŞIK & PARILTI (8 Effects)
  {
    id: 'bloomGlow',
    name: 'HDR Neon Parlama (Bloom Glow)',
    category: 'Işık & Parıltı',
    description: 'Parlak ışık kaynaklarına yoğun neon parıltısı giydirir.',
    defaultIntensity: 0.7,
    iconName: 'Sparkles',
    params: {
      threshold: { label: 'Parlaklık Eşiği', min: 0.3, max: 0.95, default: 0.65 },
      radius: { label: 'Işıma Yarıçapı', min: 5, max: 80, default: 35 },
    },
  },
  {
    id: 'anamorphicFlare',
    name: 'Anamorfik Sinema Işığı (Horizontal Flare)',
    category: 'Işık & Parıltı',
    description: 'Hollywood filmlerindeki yatay mavi sinema mercek parlaması.',
    defaultIntensity: 0.65,
    iconName: 'Minus',
    params: {
      length: { label: 'Işık Uzunluğu', min: 50, max: 500, default: 250 },
    },
  },
  {
    id: 'starfieldGlint',
    name: 'Yıldız Parıltıları (Cross Star Glint)',
    category: 'Işık & Parıltı',
    description: 'Mücevher ve ışık yansımalarında 4 köşeli parlak yıldızlar.',
    defaultIntensity: 0.6,
    iconName: 'Star',
    params: {
      starCount: { label: 'Yıldız Sayısı', min: 5, max: 50, default: 20 },
    },
  },
  {
    id: 'goldenHourSunburst',
    name: 'Altın Saat Güneş Huzmesi (Sunburst)',
    category: 'Işık & Parıltı',
    description: 'Köşeden süzülen sıcak güneş ışınları.',
    defaultIntensity: 0.55,
    iconName: 'SunMedium',
    params: {
      rayCount: { label: 'Işın Sayısı', min: 8, max: 36, default: 16 },
    },
  },
  {
    id: 'edgeGlowNeon',
    name: 'Neon Kenar Çizgileri (Edge Glow)',
    category: 'Işık & Parıltı',
    description: 'Sahnedeki nesnelerin siluetlerini parlayan neon çizgilere çevirir.',
    defaultIntensity: 0.75,
    iconName: 'Layers',
    params: {
      thickness: { label: 'Çizgi Kalınlığı', min: 1, max: 10, default: 3 },
    },
  },
  {
    id: 'rainbowPrism',
    name: 'Gökkuşağı Prizması (Rainbow Prism Flare)',
    category: 'Işık & Parıltı',
    description: 'Lens üzerinden geçen spektrum gökkuşağı rengi.',
    defaultIntensity: 0.5,
    iconName: 'Rainbow',
    params: {
      opacity: { label: 'Opaklık', min: 0, max: 1, default: 0.6 },
    },
  },
  {
    id: 'strobePulse',
    name: 'Strobe Flaş Titremesi (Strobe Beat)',
    category: 'Işık & Parıltı',
    description: 'Müzik ritmine uygun periyodik beyaz flaş patlaması.',
    defaultIntensity: 0.8,
    iconName: 'Zap',
    params: {
      frequency: { label: 'Flaş Hızı (Hz)', min: 1, max: 15, default: 4 },
    },
  },
  {
    id: 'laserScanline',
    name: 'Lazer Tarama Çizgisi (Laser Scan)',
    category: 'Işık & Parıltı',
    description: 'Ekrandan yukarıdan aşağıya kayan neon lazer ışını.',
    defaultIntensity: 0.7,
    iconName: 'ScanLine',
    params: {
      speed: { label: 'Tarama Hızı', min: 1, max: 10, default: 3 },
    },
  },

  // 5. BOZULMA & EĞİLME (8 Effects)
  {
    id: 'fisheyeLens',
    name: 'Balıkgözü Mercek (Fish-Eye 180°)',
    category: 'Bozulma',
    description: 'GoPro ve aksiyon kameralarındaki 180 derece küresel bükülme.',
    defaultIntensity: 0.65,
    iconName: 'Eye',
    params: {
      distortion: { label: 'Bükülme Gücü', min: -1, max: 1, default: 0.4 },
    },
  },
  {
    id: 'waterRipple',
    name: 'Su Dalgası (Water Ripple Flow)',
    category: 'Bozulma',
    description: 'Görüntüde akışkan su yüzeyi dalgalanması animasyonu.',
    defaultIntensity: 0.55,
    iconName: 'Waves',
    params: {
      waveSpeed: { label: 'Dalga Hızı', min: 1, max: 10, default: 3 },
    },
  },
  {
    id: 'kaleidoscope',
    name: 'Çiçek Dürbünü (Kaleidoscope 8-Fold)',
    category: 'Bozulma',
    description: '8 parçalı simetrik geometrik ayna yansımaları.',
    defaultIntensity: 0.8,
    iconName: 'Flower',
    params: {
      segments: { label: 'Parça Sayısı', min: 4, max: 16, default: 8, step: 2 },
    },
  },
  {
    id: 'swirlVortex',
    name: 'Girdap Bükülmesi (Swirl Vortex)',
    category: 'Bozulma',
    description: 'Merkez noktası etrafında spiralleşen dönme bozulması.',
    defaultIntensity: 0.6,
    iconName: 'Loader',
    params: {
      twistAngle: { label: 'Burgu Açısı', min: -720, max: 720, default: 180 },
    },
  },
  {
    id: 'blackHoleGravity',
    name: 'Kara Delik Çekimi (Gravitational Lens)',
    category: 'Bozulma',
    description: 'Merkeze doğru bükülen uzay-zaman gravitasyonel merceği.',
    defaultIntensity: 0.7,
    iconName: 'Circle',
    params: {
      mass: { label: 'Çekim Gücü', min: 0.1, max: 1.0, default: 0.5 },
    },
  },
  {
    id: 'mirrorSplit',
    name: 'Ayna İkiye Bölme (Mirror Split Screen)',
    category: 'Bozulma',
    description: 'Ekranı ortadan ikiye bölüp sağ/sol simetrisi oluşturur.',
    defaultIntensity: 1.0,
    iconName: 'Columns',
    params: {
      axis: { label: 'Eksen (0=Yatay, 1=Dikey)', min: 0, max: 1, default: 0, step: 1 },
    },
  },
  {
    id: 'thermalHeatmap',
    name: 'Termal Isı Kamerası (FLIR Thermal)',
    category: 'Bozulma',
    description: 'Kızılötesi askeri termal kamera renk spektrumu.',
    defaultIntensity: 1.0,
    iconName: 'Flame',
    params: {
      palette: { label: 'Isı Hassasiyeti', min: 0.5, max: 2.0, default: 1.0 },
    },
  },
  {
    id: 'sketchPencil',
    name: 'Kurşun Kalem Çizimi (Pencil Sketch)',
    category: 'Bozulma',
    description: 'Videoyu el çizimi eskiz ve tarama çizgilerine çevirir.',
    defaultIntensity: 0.9,
    iconName: 'Edit3',
    params: {
      stroke: { label: 'Kontur Keskinliği', min: 1, max: 5, default: 2 },
    },
  },
];
