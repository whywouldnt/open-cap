# OPEN-CAP Mobile — Faz 0 Mimari ve Sistem Raporu

**Proje:** OPEN-CAP Mobile (Açık Kaynaklı, Yerel Donanım Hızlandırmalı CapCut Pro Alternatifi)  
**Aşama:** FAZ 0 — Mobil Temel İskelet, Mimari ve Veri Modeli  
**Hedef:** Android & iOS (Tauri v2 Mobile + React 19 + TypeScript + Zustand + Rust Core)  
**Tarih:** 2026-08-17

---

## 🏛️ Mimari Genel Bakış

OPEN-CAP Mobile, bulut bağımlılığı olmayan, aboneliksiz ve doğrudan cihazın NPU / GPU donanım hızlandırma yeteneklerini kullanan CapCut Pro benzeri modern bir video düzenleyicidir.

```
D:\projects\open-cap\
├── src-tauri/                         # Rust Tauri v2 Mobil Çekirdeği
│   ├── src/
│   │   ├── models.rs                  # Rust tarafı veri modelleri (Serde uyumlu)
│   │   ├── commands.rs                # save_project, load_project, get_device_capabilities
│   │   ├── error.rs                   # Özelleştirilmiş IPC hata mekanizmaları
│   │   ├── lib.rs                     # Tauri v2 mobil ve masaüstü giriş noktası
│   │   └── main.rs                    # Masaüstü çalıştırıcısı
│   ├── capabilities/                  # Tauri v2 izin ve güvenlik tanımlamaları
│   ├── icons/                         # Mobil & masaüstü ikon varlıkları
│   ├── Cargo.toml                     # Rust bağımlılıkları ve staticlib/cdylib mobil hedefleri
│   └── tauri.conf.json                # Tauri v2 mobil paket yapılandırması (com.opencap.mobile)
│
├── src/                               # React 19 & TypeScript Dokunmatik Arayüz
│   ├── types/
│   │   └── project.ts                 # TS Proje, Kanal, Klip, Keyframe, Transform veri şeması
│   ├── engine/
│   │   ├── history.ts                 # Command Pattern tabanlı Undo / Redo Motoru (HistoryManager)
│   │   └── commands.ts                # Geri alınabilir işlem komutları (Split, Move, Trim, Transform, Delete)
│   ├── store/
│   │   ├── projectStore.ts            # Zustand + Immer reaktif proje durumu
│   │   └── timelineStore.ts           # Playhead, zoom, seçim ve oynatma durumu
│   ├── hooks/
│   │   ├── useTauriIpc.ts             # Rust IPC köprüsü ve tarayıcı/mobil localStorage yedeği
│   │   └── useTouchGesture.ts         # Mobil dokunmatik jestler
│   ├── utils/
│   │   └── timecode.ts                # Kare hassasiyetinde 00:00:00:00 zaman kodu dönüştürücü
│   ├── components/mobile/
│   │   ├── MobileEditor.tsx           # Ana mobil editör orkestratörü
│   │   ├── MobileTopBar.tsx           # Geri/İleri al, En-boy oranı, Dışa aktar, Ayarlar
│   │   ├── MobilePreviewPlayer.tsx    # 9:16 Dikey video önizleme, anlık render ve oynatıcı
│   │   ├── MobileTimeline.tsx         # Çok kanallı zaman çizelgesi, cetvel ve manyetik playhead
│   │   ├── MobileTrackView.tsx        # Video, Ses, Metin kanal satırları ve kontrolleri
│   │   ├── ClipItem.tsx               # Kırpma kulpları, dalga formu ve sürükle-bırak klip kutusu
│   │   ├── MobileActionDrawer.tsx     # CapCut alt araç çekmecesi (Böl, Sil, Ses, Dönüştür)
│   │   ├── TransformModal.tsx         # Konum, ölçek, döndürme ve opaklık paneli
│   │   ├── AudioModal.tsx             # Ses seviyesi, solma ve AI gürültü temizleme
│   │   ├── SettingsModal.tsx          # FPS, çözünürlük ve donanım yetenekleri paneli
│   │   ├── ExportModal.tsx            # Dışa aktarım ve render simülasyonu
│   │   └── MediaBinDrawer.tsx         # Medya havuzu (Video ve ses ekleme)
│   ├── App.tsx                        # 9:16 Mobil cihaz çerçevesi ve toast sistemi
│   ├── index.css                      # CapCut Obsidian Dark tema ve CSS belirteçleri
│   └── main.tsx                       # React başlatıcı
│
├── package.json                       # React 19, Zustand, Lucide, Tailwind, Vite
├── tsconfig.json                      # Strict TS ve @/ path aliases
└── vite.config.ts                     # Tauri v2 port ve HMR ayarları
```

---

## 💎 Veri Modeli Şeması (`.opencap`)

Hem TypeScript (`src/types/project.ts`) hem de Rust (`src-tauri/src/models.rs`) tarafında birebir eşitlenmiş Serde uyumlu JSON veri yapısı:

```json
{
  "schemaVersion": "1.0.0",
  "id": "opencap-1723890000000",
  "name": "Cyberpunk City Reel",
  "createdAt": "2026-08-17T10:50:00Z",
  "updatedAt": "2026-08-17T10:55:00Z",
  "resolution": {
    "width": 1080,
    "height": 1920,
    "aspectRatio": "9:16"
  },
  "fps": 60,
  "duration": 8.0,
  "tracks": [
    {
      "id": "track-text-main",
      "name": "Text / Titles",
      "type": "text",
      "isMuted": false,
      "isLocked": false,
      "isHidden": false,
      "volume": 1.0,
      "zIndex": 3,
      "clips": [...]
    },
    {
      "id": "track-video-main",
      "name": "Main Video",
      "type": "video",
      "isMuted": false,
      "isLocked": false,
      "isHidden": false,
      "volume": 1.0,
      "zIndex": 2,
      "clips": [...]
    }
  ],
  "markers": [
    { "id": "m-1", "time": 3.5, "label": "Beat Drop", "color": "#f59e0b" }
  ]
}
```

---

## ⚡ Command Pattern Tabanlı Undo / Redo Motoru

Mobil cihazların kısıtlı RAM kapasitesini korumak için her işlemde tüm projenin derin kopyasını (deep clone) tutmak yerine, yalnızca tersine çevrilebilir (reversible) komut nesneleri saklanır:

- **`SplitClipCommand`**: Klibi playhead noktasından 2 parçaya böler; geri al işleminde iki parçayı birleştirip orijinal klibi tek parça halinde eksiksiz geri getirir.
- **`MoveClipCommand`**: Klibin kanal ve zaman koordinatlarını değiştirir; geri al işleminde eski konuma döndürür.
- **`TrimClipCommand`**: Klibin baş ve son kırpma kulplarının delta değerlerini yönetir.
- **`TransformClipCommand`**: X/Y konumu, döndürme açısı, ölçek ve opaklık değerlerini yönetir.
- **`DeleteClipCommand`**: Silinen klibi ve kanal indeksini saklar; geri al işleminde aynı sıraya geri yerleştirir.
- **`AddClipCommand`**: Yeni eklenen klibi yönetir.

---

## 🛠️ Doğrulama ve Test Sonuçları (DoD)

1. **Rust Backend:** `cargo check` -> `0 error, 0 warning` (1.75s).
2. **Frontend UI:** `npm run build` -> `tsc && vite build` -> `0 error` (Tam başarı).
3. **IPC Köprüsü:** `save_project` ve `load_project` `.opencap` dosya yazma/okuma komutları hazır.
4. **Mobil Deneyim:** 9:16 Dikey CapCut stili koyu tema (Obsidian Dark), çok kanallı oynatıcı ve dokunmatik kontroller hazır.
