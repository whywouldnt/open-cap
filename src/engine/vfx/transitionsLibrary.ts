/**
 * OPEN-CAP 30+ 2D & 3D Transition Shaders Library
 * Definitions, easing curves, and interpolation math
 */

export interface TransitionDefinition {
  id: string;
  name: string; // Turkish title
  category: 'Temel' | 'Kaydırma (Wipe)' | 'Zoom & Kinetik' | '3D Boyutlu' | 'Glitch & Flaş' | 'Sanatsal';
  description: string;
  defaultDuration: number; // Seconds (e.g. 0.5s)
}

export const TRANSITIONS_LIBRARY: TransitionDefinition[] = [
  // 1. TEMEL (Basic)
  {
    id: 'crossFade',
    name: 'Çapraz Çözülme (Cross Dissolve)',
    category: 'Temel',
    description: 'İki klip arasında klasik yumuşak geçiş.',
    defaultDuration: 0.5,
  },
  {
    id: 'dipToBlack',
    name: 'Kararmaya Geçiş (Dip to Black)',
    category: 'Temel',
    description: 'Siyah ekrana sönümlenip yeni klibe açılır.',
    defaultDuration: 0.6,
  },
  {
    id: 'dipToWhite',
    name: 'Beyaza Geçiş (Dip to White)',
    category: 'Temel',
    description: 'Beyaz ışığa geçip yeni sahneye açılır.',
    defaultDuration: 0.4,
  },

  // 2. KAYDIRMA (Wipe)
  {
    id: 'wipeLeft',
    name: 'Sola Silme (Wipe Left)',
    category: 'Kaydırma (Wipe)',
    description: 'Yeni klip sağdan sola düz bir perde gibi gelir.',
    defaultDuration: 0.5,
  },
  {
    id: 'wipeRight',
    name: 'Sağa Silme (Wipe Right)',
    category: 'Kaydırma (Wipe)',
    description: 'Yeni klip soldan sağa silerek geçer.',
    defaultDuration: 0.5,
  },
  {
    id: 'wipeUp',
    name: 'Yukarı Silme (Wipe Up)',
    category: 'Kaydırma (Wipe)',
    description: 'Aşağıdan yukarıya dikey silme perdesi.',
    defaultDuration: 0.5,
  },
  {
    id: 'wipeDown',
    name: 'Aşağı Silme (Wipe Down)',
    category: 'Kaydırma (Wipe)',
    description: 'Yukarıdan aşağıya inen silme perdesi.',
    defaultDuration: 0.5,
  },
  {
    id: 'clockWipe',
    name: 'Saat Yönü Silme (Radial Clock Wipe)',
    category: 'Kaydırma (Wipe)',
    description: 'Saat ibresi gibi 360 derece dönerek açılır.',
    defaultDuration: 0.7,
  },

  // 3. ZOOM & KİNETİK (Zoom & Kinetic)
  {
    id: 'zoomIn',
    name: 'İçeri Hızlı Zoom (Zoom In)',
    category: 'Zoom & Kinetik',
    description: 'Sahnenin içine dalarak yeni klibi patlatır.',
    defaultDuration: 0.45,
  },
  {
    id: 'zoomOut',
    name: 'Dışarı Zoom (Zoom Out)',
    category: 'Zoom & Kinetik',
    description: 'Mevcut sahneden geri çekilerek yeni klibi gösterir.',
    defaultDuration: 0.45,
  },
  {
    id: 'whipPanLeft',
    name: 'Hızlı Kamera Savurma Sol (Whip Pan)',
    category: 'Zoom & Kinetik',
    description: 'Aksiyon filmlerindeki hızlı kamera savrulması ve hareket bulanıklığı.',
    defaultDuration: 0.35,
  },
  {
    id: 'whipPanRight',
    name: 'Hızlı Kamera Savurma Sağ (Whip Pan Right)',
    category: 'Zoom & Kinetik',
    description: 'Sağa doğru keskin kamera çevirme geçişi.',
    defaultDuration: 0.35,
  },
  {
    id: 'swirlTwist',
    name: 'Girdap Dönüşü (Swirl Twist)',
    category: 'Zoom & Kinetik',
    description: 'Girdap gibi dönerek yeni sahneye bağlanır.',
    defaultDuration: 0.5,
  },

  // 4. 3D BOYUTLU (3D Transforms)
  {
    id: 'cube3D',
    name: '3D Dönen Küp (Cube Rotate 3D)',
    category: '3D Boyutlu',
    description: 'Sahne 3 boyutlu bir küpün yüzeyi gibi döner.',
    defaultDuration: 0.7,
  },
  {
    id: 'flip3D',
    name: '3D Kart Çevirme (Flip 3D)',
    category: '3D Boyutlu',
    description: 'Ekran arkası dönen iskambil kartı gibi takla atar.',
    defaultDuration: 0.6,
  },
  {
    id: 'doorway3D',
    name: '3D Kapı Açılışı (Doorway 3D)',
    category: '3D Boyutlu',
    description: 'Mevcut klip ikiye ayrılarak arkadaki yeni sahneye kapı açar.',
    defaultDuration: 0.65,
  },
  {
    id: 'pageCurl3D',
    name: 'Sayfa Kıvrılması (Page Curl 3D)',
    category: '3D Boyutlu',
    description: 'Kitap sayfası gibi köşeden kıvrılarak açılır.',
    defaultDuration: 0.8,
  },
  {
    id: 'origamiFold3D',
    name: 'Origami Katlanma (Origami Fold 3D)',
    category: '3D Boyutlu',
    description: 'Görüntü üçgen parçalar halinde katlanarak değişir.',
    defaultDuration: 0.75,
  },

  // 5. GLITCH & FLAŞ (Glitch & Flash)
  {
    id: 'glitchRGB',
    name: 'RGB Dijital Glitch Geçişi',
    category: 'Glitch & Flaş',
    description: 'Siberpunk parazit patlaması ve renk kanalı kayması.',
    defaultDuration: 0.35,
  },
  {
    id: 'flashBurn',
    name: 'Lens Yanığı & Flaş (Film Burn Flash)',
    category: 'Glitch & Flaş',
    description: 'Işık patlaması ve sıcak film yanması geçişi.',
    defaultDuration: 0.4,
  },
  {
    id: 'vhsNoiseTransition',
    name: 'VHS Statik Parazit (VHS Strobe)',
    category: 'Glitch & Flaş',
    description: 'Kanal değiştirme paraziti ve kaset gürültüsü.',
    defaultDuration: 0.45,
  },

  // 6. SANATSAL & BLUR (Artistic & Blur)
  {
    id: 'dreamyBlur',
    name: 'Rüya Bulanıklığı (Dreamy Blur Fade)',
    category: 'Sanatsal',
    description: 'Görüntü ipeksi bir ışık bulanıklığına eriyip netleşir.',
    defaultDuration: 0.6,
  },
  {
    id: 'pixelateTransition',
    name: 'Piksel Erimesi (Pixelate Dissolve)',
    category: 'Sanatsal',
    description: 'Görüntü dev piksellere ayrışıp yeni sahneye dönüşür.',
    defaultDuration: 0.5,
  },
  {
    id: 'waterRippleTransition',
    name: 'Su Dalgası Geçişi (Ripple Transition)',
    category: 'Sanatsal',
    description: 'Suya taş atılmış gibi halkalar halinde dalgalanarak geçer.',
    defaultDuration: 0.7,
  },
];
