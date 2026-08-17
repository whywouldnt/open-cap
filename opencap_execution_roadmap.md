# OPEN-CAP — 13 Fazlı Master Geliştirme Yol Haritası (AI Agent Execution Plan)

Bu belge, **OPEN-CAP** (CapCut Pro Açık Kaynak Alternatifi) projesini bir AI Agent'ın sırayla, modüler olarak ve geriye dönük uyumluluğu bozmadan inşa edebilmesi için **13 faza** ayrılmış nihai geliştirme planıdır.

---

## 🗺️ Faz Matrisi ve Kilometre Taşları

| Faz No | Faz Başlığı | Odak Alanı | Çıktı / Milestone |
|---|---|---|---|
| **Faz 0** | Proje Temeli ve Mimari İskelet | Tauri v2 + React 19, Monorepo, FFmpeg Build | Derlenebilir boş uygulama ve CI pipeline |
| **Faz 1** | Medya İçe Aktarma & Veri Modeli | FFprobe, WebCodecs, LRU Cache, Media Bin | Medya analizi, thumbnail & waveform |
| **Faz 2** | Zaman Çizelgesi Motoru (Timeline Core) | Multi-track State, Snapping, Ripple Edit | Salt State ve Undo/Redo kurgu mantığı |
| **Faz 3** | GPU Önizleme ve Render Motoru | WebGPU (WGSL), 37+ Blend Modes, Masking | 60 FPS çok katmanlı gerçek zamanlı oynatma |
| **Faz 4** | Kurgu Araçları UI | Bezier Graph Editor, Mask Controls, Motion Blur | Keyframe ve maske arayüz araçları |
| **Faz 5** | Renk Derecelendirme & VFX Shaders | Lift-Gamma-Gain, .CUBE 3D LUT, Glitch/Glow | Profesyonel renk ve efekt motoru |
| **Faz 6** | Dışa Aktarım (Export) Boru Hattı | FFmpeg NVENC/QSV/ProRes 422/4444 Alpha | 🚀 **TEMEL EDİTÖR MVP'Sİ TAMAMLANDI** |
| **Faz 7** | Yerel AI Çıkarım Altyapısı | ONNX / FastAPI Daemon, VRAM Manager | AI Arka Plan Servisi ve Görev Kuyruğu |
| **Faz 8** | AI Görüntü I: 2D & Takip | SAM 2 / BiRefNet, CoTracker v2, YOLO Reframe | Akıllı kesme, hareket takibi, reframe |
| **Faz 9** | AI Görüntü II: Zaman & Çözünürlük | RIFE 4.x, Real-ESRGAN, Stabilizasyon, Deflicker | 120 FPS ağır çekim ve 4K yükseltme |
| **Faz 10** | AI Görüntü III: Relight & Retouch | Depth Anything v2, MediaPipe Face Mesh | 3D yeniden aydınlatma, yüz rötuşu |
| **Faz 11** | Ses ve Müzik AI Araçları | Faster-Whisper, Demucs, DeepFilterNet, TTS | Otomatik altyazı, vokal ayırma, ducking |
| **Faz 12** | Optimizasyon, Test ve Paketleme | Profiling, MSI/DMG Paketleri, Lisans Denetimi | Dağıtıma ve kuruluma hazır nihai ürün |

---

## 📋 Detaylı Faz Açıklamaları

### FAZ 0 — Proje Temeli ve Mimari İskelet
* **Amaç:** Derleme/CI hattı kurulu, boş ama çalışır bir uygulama iskeleti.
* **Görevler:**
  - Tauri v2 (Rust backend + React 19 / TypeScript frontend) proje iskeletini kur.
  - Monorepo yapısı: `/src-tauri` (Rust core), `/src` (React UI), `/native` (FFmpeg/ONNX bağlayıcı crate'ler), `/ai-service` (Python FastAPI daemon).
  - FFmpeg (libavformat/libavcodec/libswscale) statik/dinamik bağlama ve build script'leri.
  - Temel pencere: Menü çubuğu, proje aç/kaydet iskeleti, boş timeline ve önizleme paneli.
  - Lint/format kuralları (ESLint, Prettier, clippy, rustfmt).
* **Bitti Tanımı (DoD):** `npm run tauri dev` sorunsuz açılıyor; FFmpeg sürümü Rust IPC üzerinden konsola basılıyor; `.opencap` proje JSON şeması taslak olarak tanımlı.

---

### FAZ 1 — Medya İçe Aktarma ve Proje Veri Modeli
* **Amaç:** Medya dosyalarının içe aktarılması, analizi ve dahili veri modelinin oluşturulması.
* **Görevler:**
  - FFprobe ile metadata çıkarımı (codec, çözünürlük, fps, süre, ses kanalları).
  - Arka planda proxy/thumbnail ve ses dalga formu (waveform) üretim hattı.
  - WebCodecs API (`VideoDecoder`, `AudioDecoder`) ve LRU Frame Cache (Kare Önbelleği) temeli.
  - Veri modeli: Project → Tracks → Clips → Effects/Keyframes (TS tipleri + Rust struct'ları senkron).
  - Media Bin UI: Sürükle-bırak, klasörleme, arama.
* **Bitti Tanımı (DoD):** MP4/MOV/MKV/WAV/MP3/PNG dosyaları içe aktarılıp thumbnail ile listeleniyor; proje kaydedilip tekrar açıldığında medya referansları korunuyor.

---

### FAZ 2 — Zaman Çizelgesi Motoru (Timeline Core)
* **Amaç:** Çok kanallı, manyetik timeline mantığı (GPU render olmadan, salt State + UI).
* **Görevler:**
  - Sınırsız video/ses/metin/efekt/PIP katmanı (track ekle/sil/kilitle/gizle).
  - Ripple-edit, roll-edit, slip/slide modları.
  - Otomatik yapışma (klip kenarı, playhead, marker hizalama - Snapping).
  - Kare hassasiyetinde playhead/scrubbing state.
  - Command pattern ile tüm timeline işlemleri için tam Undo/Redo.
* **Bitti Tanımı (DoD):** 8+ kanallı timeline'da sürükle/kes/birleştir işlemleri tam undo/redo destekli çalışıyor; snapping ve ripple-delete hatasız.

---

### FAZ 3 — GPU Önizleme ve Render Motoru
* **Amaç:** Gerçek zamanlı 60 FPS önizleme, blend mode ve GPU filtre boru hattı.
* **Görevler:**
  - WebGPU (WGSL) render pipeline (`GPUDevice`, `GPURenderPipeline`).
  - Frame decode → GPU texture zinciri (WebCodecs API donanım hızlandırma).
  - 37+ blend mode shader kütüphanesi (Multiply, Screen, Overlay, Color Dodge vb.).
  - Çoklu katman kompozisyonu: Opaklık, transform (matris hesaplamaları), z-sıra.
  - Maske shader'ları: Lineer, ayna, radyal, dikdörtgen, pen tool, luma/kroma.
* **Bitti Tanımı (DoD):** 3 katmanlı sahne (video + video + metin) blend mode ve maskelerle 1080p 60 FPS'te bellek sızıntısı olmadan oynatılabiliyor.

---

### FAZ 4 — Kurgu Araçları: Bezier Keyframe, Efektler, Maskeleme UI
* **Amaç:** Faz 3 render altyapısını kullanıcıya açan arayüz araç seti.
* **Görevler:**
  - Bezier keyframe editörü: Konum/ölçek/döndürme/opaklık için ease-in/out ve custom bezier graph UI.
  - Efekt paneli (parlaklık, kontrast, doygunluk, vinyet, keskinlik) — parametreler keyframe'lenebilir.
  - Maske araçları UI: Pen tool, radyal/dikdörtgen handle'lar, feather (kenar yumuşatma) kontrolü.
  - Motion blur: Poz süresi + shutter angle shader entegrasyonu.
* **Bitti Tanımı (DoD):** Bir klibe pozisyon+ölçek keyframe'i eklenip Bezier ile hızlandırılabiliyor; maske ve blend modları görsel olarak yönetilebiliyor.

---

### FAZ 5 — Renk Derecelendirme ve VFX Shader Kütüphanesi
* **Amaç:** Profesyonel renk düzenleme araç seti ve görsel efektler.
* **Görevler:**
  - Lift-Gamma-Gain renk tekerlekleri (shadows/midtones/highlights).
  - HSL seçici ayarlayıcı (renk bazlı ince ayar).
  - RGB Curves editörü (Bezier eğri → WGSL LUT uygulaması).
  - `.CUBE` 3D LUT import (33³/65³ grid, 3D texture + trilinear interpolasyon).
  - VFX kütüphanesi: Glitch, RGB Split, Parazit, Glow/Bloom, Retro VHS, partikül sistemi.
* **Bitti Tanımı (DoD):** LUT yüklenip renk tekerlekleriyle ince ayar yapıldığında anlık önizlemede yansıyor; en az 5 VFX shader'ı parametrelerle çalışıyor.

---

### FAZ 6 — Dışa Aktarım (Export) Boru Hattı 🚀 [MVP MILESTONE]
* **Amaç:** Timeline'ı nihai video dosyasına render eden donanım hızlandırmalı pipeline.
* **Görevler:**
  - FFmpeg encode: H.264, H.265/HEVC, AV1, Apple ProRes 422/4444 (alfa kanallı).
  - Donanım hızlandırma: NVENC / QuickSync / VideoToolbox / AMF otomatik tespiti + yazılımsal fallback.
  - 4K/8K çözünürlük, 24-240 FPS aralığı, CBR/VBR bitrate kontrolü, Rec.709/DCI-P3/HDR renk uzayları.
  - Arka plan render kuyruğu, ilerleme çubuğu, ses kanalları miksajı (Audio Mixdown).
* **Bitti Tanımı (DoD):** Karmaşık bir proje 3 farklı formatta (MP4 H.264, HEVC, ProRes) 0-frame ses/görüntü kayması ile hatasız dışa aktarılıyor.

---

### FAZ 7 — Yerel AI Çıkarım Altyapısı (Model Sunucu Katmanı)
* **Amaç:** Tüm AI modellerinin üzerinde koşacağı ortak yerel çıkarım servisi.
* **Görevler:**
  - Python FastAPI / gRPC yerel daemon veya yerel ONNX Runtime (CUDA / DirectML / CoreML).
  - Model indirme ve önbellek yöneticisi (HuggingFace otomatik indirme, checksum doğrulaması).
  - Ortak "AI Job" kuyruğu (uzun süren işler için arka plan yöneticisi ve ilerleme bildirimi).
  - Dinamik VRAM yöneticisi: Modelleri iş bitince VRAM'den boşaltan LRU mekanizması.
* **Bitti Tanımı (DoD):** Test modeli arka planda indirilip çalıştırılıyor; job kuyruğu eşzamanlı istekleri yönetip Tauri UI'a canlı ilerleme bildiriyor.

---

### FAZ 8 — AI Görüntü Araçları I: Segmentasyon, Takip, Reframe
* **Amaç:** Tek kare veya kısa pencere bazlı temel AI görsel araçları.
* **Görevler:**
  - **Akıllı Kesme:** SAM 2 / BiRefNet / RMBG-1.4 ile yeşil perdesiz insan/nesne yalıtımı (Alfa kanallı katman üretimi).
  - **Kamera/Nesne Takibi:** CoTracker v2 / ByteTrack ile seçilen nesneyi takip edip metin veya sansür sabitleme.
  - **Otomatik Yeniden Çerçeveleme (Smart Auto Reframe):** YOLOv11 + Kalman filtresi ile 16:9 → 9:16/1:1 otomatik odaklı kamera hareketi.
* **Bitti Tanımı (DoD):** İnsan figürlü klip tek tıkla arka plandan ayrılıyor; seçilen nesne 10 saniyelik klipte kayıpsız takip ediliyor; yatay video dikey 9:16'ya kusursuz dönüştürülüyor.

---

### FAZ 9 — AI Görüntü Araçları II: Zaman, Çözünürlük, Stabilizasyon
* **Amaç:** Zamansal ve yoğun hesaplama gerektiren çoklu-kare AI video araçları.
* **Görevler:**
  - **Akıcı Ağır Çekim (Optical Flow):** RIFE 4.x / FILM ile 24/30 FPS videoyu 120+ FPS akıcı ağır çekime yükseltme.
  - **Süper Çözünürlük (Upscaling):** Real-CUGAN / Real-ESRGAN Video + FastDVDnet (Denoise) ile 4K yükseltme.
  - **Video Sabitleme (Stabilization):** OpenCV VideoStab / Gyroflow entegrasyonu.
  - **Titreşim Giderme (Deflicker):** Zamansal luma dengeleme filtresi.
* **Bitti Tanımı (DoD):** 24 FPS klip 120 FPS'e yükseltilip dışa aktarılıyor; 720p video artefaktsız 4K yapılıyor; sarsıntılı video stabilize ediliyor.

---

### FAZ 10 — AI Görüntü Araçları III: Relight ve Retouch (İleri Seviye)
* **Amaç:** 3D derinlik haritalama ve yüz landmark modelleri.
* **Görevler:**
  - **3D Yeniden Aydınlatma (AI Relight):** Depth Anything v2 (derinlik haritası) + WGSL normal haritası ile sahneye 3D yönlü/nokta ışık ekleme.
  - **Yüz & Vücut Rötuşu:** MediaPipe Face Mesh ile cilt pürüzsüzleştirme, yüz inceltme ve göz teması düzeltme (Gaze correction).
* **Bitti Tanımı (DoD):** Portre videoya yönlü yapay ışık eklenip derinliğe göre gölgeleniyor; cilt pürüzsüzleştirme doğal bir görünümle uygulanıyor.

---

### FAZ 11 — Ses ve Müzik AI Araçları
* **Amaç:** Konuşma ve müzik tarafındaki tüm akıllı ses işleme özellikleri.
* **Görevler:**
  - **Otomatik Altyazı:** Faster-Whisper (Large-v3) + CTC-segmentation ile kelime düzeyinde zaman damgalı animasyonlu altyazı.
  - **Vokal/Enstrüman Ayrıştırma (Stem Splitter):** Demucs v4 / HTDemucs ile vokal, bas, davul ve fon ayrımı.
  - **Gelişmiş Ses Temizleme:** DeepFilterNet 3 / RNNoise ile yankı ve dip gürültüsü temizleme.
  - **Metinden Sese (TTS):** Kokoro-82M veya Piper TTS ile doğrudan zaman çizgisine seslendirme üretme.
  - **Ritim Tespiti & Ducking:** Librosa/Aubio ile ritim işaretçileri; vokal başladığında müziği kısan Sidechain Auto-Ducking.
* **Bitti Tanımı (DoD):** 2 dakikalık konuşma kelime senkronlu altyazıya dökülüyor; müzik parçası 4 kanala ayrıştırılıyor; auto-ducking doğru çalışıyor.

---

### FAZ 12 — Optimizasyon, Test, Paketleme ve Dağıtım
* **Amaç:** Ürünü kararlı, optimize edilmiş ve kurulabilir paket halinde teslim etmek.
* **Görevler:**
  - 100+ klipli projelerde bellek sızıntısı ve CPU/GPU stres testleri.
  - Proxy sistemi optimizasyonu (4K/8K dosyalar için otomatik arka plan düşük çözünürlüklü ProRes proxy).
  - Kurulum paketleri: Windows (.msi / .exe installer), macOS (.dmg), Linux (.AppImage).
  - Otomatik güncelleme mekanizması (Tauri updater).
  - Lisans ve uyumluluk denetimi sayfası (açık kaynak modellerin lisans dökümü).
* **Bitti Tanımı (DoD):** Windows ve diğer platformlar için imzalı kurulum paketi üretiliyor; sıfır abonelik/filigran kilidi doğrulanıyor.
