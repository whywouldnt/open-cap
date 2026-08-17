# OPEN-CAP Mobile — Faz 2 Zaman Çizelgesi Motoru (Timeline Core) Raporu

**Proje:** OPEN-CAP Mobile (Açık Kaynaklı, Yerel Donanımlı CapCut Pro Alternatifi)  
**Aşama:** FAZ 2 — Zaman Çizelgesi Motoru (Timeline Core, Snapping, Ripple Edit & Multi-Track)  
**Tarih:** 2026-08-17  
**Durum:** ✅ Tamamlandı (DoD Doğrulandı)

---

## ⚡ Faz 2 Kapsamında Geliştirilen Mimari Sistemler

### 1. Manyetik Hizalama Motoru (Magnetic Snapping Engine)
- [`SnappingEngine`](file:///D:/projects/open-cap/src/engine/timeline/snapping.ts): Sürükleme ve kırpma esnasında 0.15s tolerans aralığında:
  - Timeline Başlangıcı (`time: 0`)
  - Oynatma Çizgisi (`Playhead`)
  - Proje İşaretçileri (`Markers`)
  - Tüm katmanlardaki komşu klip baş ve son sınırlarını otomatik algılar.
- **Canlı Lazer Kılavuz Çizgisi:** Manyetik yapışma gerçekleştiği anda zaman çizelgesinde kehribar sarısı lazer hizalama çizgisi ve `Hizalandı` etiketi belirir.

### 2. Dalgalı ve Hassas Kurgu Motoru (Ripple & Precision Editing Engine)
- [`RippleEngine`](file:///D:/projects/open-cap/src/engine/timeline/ripple.ts):
  - **Ripple Delete (Boşluksuz Silme):** Bir klip silindiğinde ardındaki tüm klipler otomatik olarak sola kayarak boşluğu kapatır.
  - **Ripple Trim (Dalgalı Kırpma):** Klip boyutu değiştiğinde sağındaki tüm klipleri eşzamanlı öteler.
  - **Roll Edit (Bitişik Klip Kırpma):** İki komşu klip arasındaki kesme noktasını toplam süre değişmeden ayarlar.
  - **Slip Edit (Kaynak Kaydırma):** Klibin zaman çizelgesindeki konumu ve süresi sabit kalırken içindeki medyanın başlangıç (`sourceStartTime`) noktasını kaydırır.
  - **Close Gaps (Boşluk Kapatma):** Kanaldaki dağınık boşlukları tek dokunuşla başa doğru manyetik olarak birleştirir.

### 3. Çok Katmanlı Kanal Yöneticisi (Multi-Track Manager — 8+ Katman)
- [`TrackManagerModal.tsx`](file:///D:/projects/open-cap/src/components/mobile/TrackManagerModal.tsx):
  - Sınırsız Video, PIP (Picture-in-Picture), Ses, Müzik, Altyazı ve Efekt katmanı ekleme/silme.
  - Katmanları yukarı/aşağı dinamik olarak yeniden sıralama (`ReorderTracksCommand`).
  - Her katman için bağımsız **Sessize Alma (Mute)**, **Solo Dinleme (Solo)**, **Kilitleme (Lock)**, **Gizleme (Hide)** ve ses düzeyi kontrolü.

### 4. Gelişmiş Komut Tabanlı Undo / Redo Genişletmesi
- [`commands.ts`](file:///D:/projects/open-cap/src/engine/commands.ts) içerisine eklenen yeni komutlar:
  - `RippleDeleteCommand`
  - `RippleTrimCommand`
  - `RollEditCommand`
  - `SlipClipCommand`
  - `CloseGapsCommand`
  - `DeleteTrackCommand`
  - `ReorderTracksCommand`

---

## 🚦 Bitti Tanımı (Definition of Done - DoD) Tablosu

| Kriter | Durum | Çıktı |
|---|---|---|
| **Rust Backend (`cargo check`)** | ✅ **BAŞARILI** | 0 error, 0 warning (1.59s) |
| **Frontend & TS (`npm run build`)** | ✅ **BAŞARILI** | `tsc && vite build` → 0 error (3.89s) |
| **8+ Katmanlı Timeline Desteği** | ✅ **BAŞARILI** | Video/Audio/Text/Effect katmanları tam yönetilebilir |
| **Manyetik Snapping & Kılavuz Çizgisi** | ✅ **BAŞARILI** | Playhead, marker ve klip sınırlarına manyetik yapışma |
| **Ripple Delete & Slip Edit** | ✅ **BAŞARILI** | Boşluksuz silme ve kaynak kaydırma tam geri alınabilir |
