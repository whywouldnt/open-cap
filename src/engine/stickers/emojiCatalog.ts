/**
 * OPEN-CAP Complete Mobile Emoji Catalog & Animated Sticker Engine
 * Contains comprehensive smartphone Unicode emojis across all standard categories + animated GIF/Sticker motion presets
 */

export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export interface AnimatedStickerPreset {
  id: string;
  name: string;
  content: string; // Emoji, badge, or SVG art
  animation: 'pulseGlow' | 'wiggle' | 'floatingBounce' | 'neonRainbow' | 'spinRotate' | 'glitchShake' | 'popJump' | 'flameFlicker';
  badgeStyle?: {
    bg: string;
    text: string;
    textColor: string;
  };
}

export const EMOJI_CATALOG: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Yüzler & Duygular',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗',
      '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶',
      '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯',
      '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
      '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️',
      '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'
    ],
  },
  {
    id: 'gestures',
    name: 'Jestler & İnsanlar',
    icon: '🖐️',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘',
      '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜',
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵',
      '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'
    ],
  },
  {
    id: 'hearts',
    name: 'Kalpler & Semboller',
    icon: '💖',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞',
      '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨', '⭐', '🌟', '💫', '💥', '💯',
      '💢', '💬', '💭', '🗯️', '💤', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
      '👑', '💎', '🔑', '🔔', '🔕', '⚡', '☀️', '🌙', '⭐', '🌈', '☁️', '❄️', '💧'
    ],
  },
  {
    id: 'animals',
    name: 'Hayvanlar & Doğa',
    icon: '🐶',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮',
      '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
      '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🐢', '🐍', '🦎', '🦖', '🐙',
      '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🦈', '🐊', '🐅', '🐆', '🦓',
      '🐘', '🦛', '🦏', '🐪', '🦒', '🦘', '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹',
      '🌺', '🌻', '🌼', '🌾', '🍀', '🍁', '🍂', '🍃'
    ],
  },
  {
    id: 'food',
    name: 'Yiyecek & İçecek',
    icon: '🍕',
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥',
      '🥝', '🍅', '🥑', '🥦', '🥒', '🌶️', '🌽', '🥕', '🥔', '🥐', '🍞', '🥖', '🥨',
      '🧀', '🥚', '🍳', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕',
      '🥪', '🥙', '🌮', '🌯', '🥗', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤',
      '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮',
      '🍿', '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🥛', '🍺', '🍻', '🥂', '🍷', '🍹'
    ],
  },
  {
    id: 'activities',
    name: 'Spor & Eğlence',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🥊',
      '🥋', '🛹', '🛼', '🎿', '🏂', '🏋️', '🤸', '🧘', '🏄', '🏊', '🚴', '🏆', '🥇',
      '🎯', '🎳', '🎮', '🕹️', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹',
      '🥁', '🎷', '🎺', '🎸', '🎻', '🎪', '🎟️', '🎫'
    ],
  },
  {
    id: 'travel',
    name: 'Seyahat & Yerler',
    icon: '🚗',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚜', '🚲', '🛵',
      '🏍️', '🚨', '✈️', '🛫', '🛬', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛳️', '⚓',
      '⛽', '🚦', '🗺️', '🗽', '🗼', '🏰', '🎡', '🎢', '🏖️', '🏝️', '🌋', '⛰️', '🏔️',
      '🏕️', '⛺', '🏠', '🏡', '🏢', '🏬', '🏦', '🏨', '🏪', '🏫'
    ],
  },
  {
    id: 'objects',
    name: 'Nesneler & Teknoloji',
    icon: '💡',
    emojis: [
      '📱', '💻', '🖥️', '🖨️', '🖱️', '📷', '📸', '📹', '🎥', '📞', '📺', '📻', '🎙️',
      '⏱️', '⏰', '🕰️', '⌛', '🔋', '🔌', '💡', '🔦', '💸', '💵', '💰', '💳', '💎',
      '⚖️', '🧰', '🔧', '🔨', '🛠️', '🧱', '🧲', '🔫', '💣', '🧨', '🔪', '🛡️', '🔮',
      '🧿', '💊', '💉', '🩹', '🧬', '🔬', '🔭', '📡'
    ],
  },
];

export const ANIMATED_STICKERS: AnimatedStickerPreset[] = [
  // 1. POPÜLER SOSYAL MEDYA & ETKİLEŞİM
  {
    id: 'anim-sub',
    name: 'Abone Ol (Pulse)',
    content: '🔴 ABONE OL',
    animation: 'pulseGlow',
    badgeStyle: { bg: '#ef4444', text: 'ABONE OL', textColor: '#ffffff' },
  },
  {
    id: 'anim-like',
    name: 'Beğen (Wiggle)',
    content: '👍 BEĞEN & TAKİP ET',
    animation: 'wiggle',
    badgeStyle: { bg: '#3b82f6', text: 'BEĞEN', textColor: '#ffffff' },
  },
  {
    id: 'anim-bell',
    name: 'Bildirim Çanı (Shake)',
    content: '🔔 BİLDİRİMİ AÇ',
    animation: 'glitchShake',
    badgeStyle: { bg: '#facc15', text: 'BİLDİRİM', textColor: '#000000' },
  },
  {
    id: 'anim-share',
    name: 'Paylaş (Pop)',
    content: '↗️ PAYLAŞ',
    animation: 'popJump',
    badgeStyle: { bg: '#10b981', text: 'PAYLAŞ', textColor: '#ffffff' },
  },

  // 2. HAREKETLİ EMOJİLER & REAKSİYONLAR
  {
    id: 'anim-fire',
    name: 'Alev Dansı (Flame)',
    content: '🔥',
    animation: 'flameFlicker',
  },
  {
    id: 'anim-heart-eyes',
    name: 'Aşık Kalpler (Pulse)',
    content: '😍',
    animation: 'pulseGlow',
  },
  {
    id: 'anim-laugh',
    name: 'Gülme Krizi (Wiggle)',
    content: '😂',
    animation: 'wiggle',
  },
  {
    id: 'anim-sparkle',
    name: 'Sihirli Işıltı (Rainbow)',
    content: '✨',
    animation: 'neonRainbow',
  },
  {
    id: 'anim-rocket',
    name: 'Uçan Roket (Floating)',
    content: '🚀',
    animation: 'floatingBounce',
  },
  {
    id: 'anim-crown',
    name: 'Kral Tacı (Spin)',
    content: '👑',
    animation: 'spinRotate',
  },
  {
    id: 'anim-100',
    name: '100 Puan (Pop Jump)',
    content: '💯',
    animation: 'popJump',
  },
  {
    id: 'anim-skull',
    name: 'Öldüm Gülmekten (Shake)',
    content: '💀',
    animation: 'glitchShake',
  },

  // 3. ÇİZGİ ROMAN VE EFEKT STICKERLARI
  {
    id: 'anim-bam',
    name: 'BAM! Patlama',
    content: '💥 BAM!',
    animation: 'popJump',
    badgeStyle: { bg: '#f59e0b', text: 'BAM!', textColor: '#ffffff' },
  },
  {
    id: 'anim-wow',
    name: 'WOW! Şaşkınlık',
    content: '😮 WOW!',
    animation: 'pulseGlow',
    badgeStyle: { bg: '#ec4899', text: 'WOW!', textColor: '#ffffff' },
  },
  {
    id: 'anim-omg',
    name: 'OMG! Aman Tanrım',
    content: '😱 OMG!',
    animation: 'wiggle',
    badgeStyle: { bg: '#8b5cf6', text: 'OMG!', textColor: '#ffffff' },
  },
  {
    id: 'anim-neon-arrow',
    name: 'Neon Ok (Floating)',
    content: '➔ BURAYA BAK',
    animation: 'floatingBounce',
    badgeStyle: { bg: '#00f0ff', text: '➔ BAKIN', textColor: '#000000' },
  },
];
