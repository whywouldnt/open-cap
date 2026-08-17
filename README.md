# 📱 OPEN-CAP Mobile Video Editor

> **Açık Kaynaklı, Sıfır Abonelikli, İnternetsiz ve Yerel Donanımlı Mobil CapCut Pro Alternatifi**  
> Hedef Platformlar: **Android & iOS** (Tauri v2 Mobile + Rust Backend + React 19 + TypeScript + WebGPU)

---

## ⚡ Temel Özellikler ve Mimari Yetenekler

- **📱 %100 Mobil Odaklı Ergonomi:** 9:16 dikey önizleme, CapCut tarzı tek elle kullanılabilir katlanabilir çekmeceler, dokunmatik hareketler ve haptik titreşimler.
- **🚀 60 FPS Donanım Hızlandırmalı GPU Render Motoru:** WebGPU ve donanım hızlandırmalı Canvas2D ile sıfır takılma, anlık 1.2ms katman birleştirme.
- **🎨 37+ Profesyonel Karışım Modu (Blend Modes):** Normal, Multiply, Screen, Overlay, Color Dodge, Soft/Hard Light, Difference, Luminosity vb.
- **✨ 50+ GPU Video Efekti:** Siberpunk RGB Split, 1985 VHS Kaseti, HDR Bloom Glow, Balıkgözü (Fish-Eye), Çiçek Dürbünü (Kaleidoscope), Vinyet, CRT TV vb.
- **🌀 30+ 2D ve 3D Sahne Geçişleri:** 3D Küp (Cube 3D), 3D Kart Çevirme (Flip 3D), Sayfa Kıvrılması (Page Curl), Whip Pan, Zoom In/Out, Glitch.
- **🎬 3D LUT (.cube) ve Renk Derecelendirme:** DaVinci Resolve ve Adobe uyumlu `.cube` profilleri (*Teal & Orange Hollywood, Kodak Portra 400, Fuji Velvia 50, Cyberpunk Neon, B&W Noir*).
- **💎 Keyframe Canlandırma Motoru:** Önizleme ekranı üzerinde sarı Elmas butonu ile Konum, Ölçek, Döndürme, Opaklık ve Efekt parametrelerine yumuşak Bezier animasyonları.
- **⏱️ Hız Eğrisi (Speed Curves), Freeze Frame & Reverse:** Montage, Hero Time, Bullet Time, Flash In eğrileri, 0.1x optik akış yavaşlatma, 2.0s donmuş kare ve ters video oynatma.
- **✍️ Tipografi & Otomatik Karaoke Altyazı:** Google Fonts desteği, 3D kabartma derinliği, 40+ kinetik metin animasyonu (Daktilo, Pop-in, Slide Up), Alex Hormozi ve TikTok tarzı kelime vurgulu karaoke altyazı ve çift yönlü SRT/VTT motoru.
- **🎧 Profesyonel Ses DSP Motoru:** 10-Bant Parametrik Ekolayzır (31Hz - 16kHz), dinamik tepe sınırlayıcı (limiter), dip gürültü temizleme (Denoise), ses dönüştürücüleri (Robot, Helyum, Canavar, Megafon, Radyo, Katedral) ve otomatik ritim/beat algılama (Beat Sync Markers).
- **📦 Donanım Hızlandırmalı Dışa Aktarma (Export):** Android MediaCodec, iOS VideoToolbox, NVENC ile 4K 60FPS MP4 (H.264/HEVC), ProRes 422, WebM, GIF animasyon ve WAV/MP3 çıktı.
- **🪄 Şablonlar & AI Akıllı Kesme (Smart Cutout):** 1-Tıkla TikTok/Vlog şablon üretimi, yeşil perdesiz insan arka plan silme, portre bokeh bulanıklığı ve neon vücut konturu.
- **🔋 Pil Tasarrufu ve Haptik Geri Bildirim:** Manyetik kenetlenmede milisaniyelik dokunsal titreşim (`HapticEngine`), duraklatıldığında on-demand GPU askıya alma.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Açıklama |
|---|---|---|
| **Mobil Çatı** | **Tauri v2 Mobile** | Rust tabanlı ultra hafif, yüksek performanslı yerel mobil çekirdek |
| **Arayüz (UI)** | **React 19 + TypeScript** | Deklaratif, modern bileşen mimarisi |
| **Stil & Tasarım** | **TailwindCSS + Lucide Icons** | Obsidian Dark (#0a0a0c) temalı mobil ergonomik tasarım |
| **Durum Yönetimi** | **Zustand + Immer** | Reaktif, mutasyonsuz çok kanallı zaman çizelgesi yönetimi |
| **Geri/İleri Alma** | **Command Pattern** | Sınırsız, bellek tasarruflu çift yönlü Undo/Redo motoru |
| **Grafik & Render** | **WebGPU / WGSL / Canvas2D** | 60 FPS donanım hızlandırmalı çok katmanlı GPU kompozitörü |
| **Ses DSP** | **Web Audio API + Rust CPAL** | 10-Bant parametrik EQ, kompresör, ses filtreleri |
| **Donanım Kodlayıcı** | **MediaCodec / VideoToolbox / NVENC** | Sıfır CPU yükü ile 4K 60 FPS donanım dışa aktarma |

---

## 🚀 Projeyi Çalıştırma ve Derleme

### 1. Ön Koşullar
- **Node.js:** v18+ ve npm
- **Rust & Cargo:** v1.75+
- **Android SDK & NDK** (Android derlemesi için) / **Xcode** (iOS derlemesi için)

### 2. Geliştirme Sunucusunu Başlatma
```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

### 3. Frontend Üretim Derlemesi
```bash
npm run build
```

### 4. Tauri Masaüstü & Mobil Önizleme
```bash
# Tauri masaüstü geliştirme
npm run tauri dev

# Android geliştirme
npm run tauri android dev

# iOS geliştirme
npm run tauri ios dev
```

---

## 🧪 Otomatik E2E ve Stres Testleri

Proje yerleşik bir **E2E & 1000-Adımlı Stres Test Paketi** içerir:
- 50-Kanal ve 200-Klip çok katmanlı ölçeklenebilirlik testi
- 1000-Adımlı ardışık Split / Trim / Undo / Redo hafıza sızıntısı testi
- Manyetik kenetlenme (Snapping) ve Ripple Delete doğrulama testi
- Beat algılama (BPM) ve çift yönlü SRT ayrıştırma testi

*Uygulama içerisinden `Ayarlar (Settings) -> E2E Tanılama Testi` butonuna basarak tüm testleri canlı olarak çalıştırabilirsiniz.*

---

## 📄 Lisans
Bu proje **MIT Lisansı** altında açık kaynaklı ve ücretsiz olarak sunulmaktadır.
