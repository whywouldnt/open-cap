import React, { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useAppSettingsStore } from '@/store/appSettingsStore';
import { useTauriIpc } from '@/hooks/useTauriIpc';
import { Resolution } from '@/types/project';
import { HapticEngine } from '@/engine/mobile/HapticEngine';
import {
  X,
  Settings,
  Sliders,
  Smartphone,
  Cpu,
  Save,
  CheckCircle,
  Activity,
  Palette,
  BatteryCharging,
  Vibrate,
  Trash2,
  Globe,
  RotateCcw,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';

import { AutoUpdaterEngine, UpdateInfo } from '@/engine/updater/AutoUpdaterEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiagnostics?: () => void;
  onCheckUpdate?: (info: UpdateInfo) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenDiagnostics,
  onCheckUpdate,
}) => {
  const { project, updateProjectMetadata } = useProjectStore();
  const { capabilities, saveCurrentProject, statusMessage, isLoading } = useTauriIpc();

  const appSettings = useAppSettingsStore();

  const [activeTab, setActiveTab] = useState<'app' | 'project' | 'hardware'>('app');

  // Active Project Form State
  const [projectName, setProjectName] = useState(project.name);
  const [fps, setFps] = useState(project.fps);
  const [aspectRatio, setAspectRatio] = useState<Resolution['aspectRatio']>(
    project.resolution.aspectRatio
  );

  const [cacheMessage, setCacheMessage] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyProjectSettings = () => {
    HapticEngine.impactMedium();
    let width = 1080;
    let height = 1920;
    if (aspectRatio === '16:9') {
      width = 1920;
      height = 1080;
    } else if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (aspectRatio === '4:5') {
      width = 1080;
      height = 1350;
    }

    updateProjectMetadata(projectName, { width, height, aspectRatio }, fps);
    onClose();
  };

  const handleClearCache = () => {
    const res = appSettings.clearAppCache();
    setCacheMessage(res.message);
    setTimeout(() => setCacheMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg card-stack-sheet p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Swipe Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl accent-gradient flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white tracking-wide">Uygulama & Proje Ayarları</h3>
              <span className="text-[10px] text-zinc-400 font-mono">OPEN-CAP Mobile v1.0.0</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#121216] p-1 rounded-full border border-white/5 flex-shrink-0">
          {[
            { id: 'app', label: '📱 Genel Ayarlar', icon: <Smartphone className="w-3.5 h-3.5" /> },
            { id: 'project', label: '🎬 Aktif Proje', icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: 'hardware', label: '⚡ Donanım & Test', icon: <Cpu className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                HapticEngine.snapTick();
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'accent-gradient text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: GENEL UYGULAMA AYARLARI (GLOBAL APP SETTINGS) */}
        {activeTab === 'app' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-1">
            {/* 1. Appearance & Theme */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#16161f] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Görünüm & Tema</span>
              </div>

              {/* Theme Selector */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { id: 'oledBlack', label: 'OLED Siyahı' },
                  { id: 'midnight', label: 'Gece Grisi' },
                  { id: 'slate', label: 'Uzay Grisi' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      HapticEngine.snapTick();
                      appSettings.setTheme(t.id as any);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      appSettings.theme === t.id
                        ? 'accent-gradient text-white shadow'
                        : 'bg-[#1b1b22] text-zinc-400 border-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Language Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Uygulama Dili</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { id: 'tr-TR', label: '🇹🇷 TR' },
                    { id: 'en-US', label: '🇬🇧 EN' },
                    { id: 'de-DE', label: '🇩🇪 DE' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        HapticEngine.snapTick();
                        appSettings.setLanguage(l.id as any);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        appSettings.language === l.id
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                          : 'bg-[#1b1b22] text-zinc-500 border-white/5'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Touch & Haptic Feedback */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#16161f] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Vibrate className="w-4 h-4 text-cyan-400" />
                <span>Dokunma & Haptik Titreşim</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-200">Haptik Titreşim Geri Bildirimi</span>
                  <span className="text-[10px] text-zinc-400">Manyetik kenetlenme ve kesimlerde dokunsal titreşim</span>
                </div>
                <button
                  onClick={() => {
                    const next = !appSettings.hapticsEnabled;
                    appSettings.setHapticsEnabled(next);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    appSettings.hapticsEnabled
                      ? 'accent-gradient text-white shadow'
                      : 'bg-zinc-800 text-zinc-500 border-white/5'
                  }`}
                >
                  {appSettings.hapticsEnabled ? 'Açık' : 'Kapalı'}
                </button>
              </div>
            </div>

            {/* 3. Performance & Cache */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#16161f] border border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span>Performans & Bellek Yönetimi</span>
              </div>

              {/* Battery Saver */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-200">Pil Tasarrufu Modu</span>
                  <span className="text-[10px] text-zinc-400">Boşta dururken GPU döngüsünü duraklatır</span>
                </div>
                <button
                  onClick={() => {
                    HapticEngine.snapTick();
                    appSettings.setBatterySaverEnabled(!appSettings.batterySaverEnabled);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    appSettings.batterySaverEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-zinc-800 text-zinc-500 border-white/5'
                  }`}
                >
                  {appSettings.batterySaverEnabled ? 'Aktif' : 'Pasif'}
                </button>
              </div>

              {/* Cache Limit */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-zinc-300 font-medium">LRU Bellek Sınırı</span>
                <div className="flex gap-1">
                  {[80, 150, 250].map((limit) => (
                    <button
                      key={limit}
                      onClick={() => {
                        HapticEngine.snapTick();
                        appSettings.setCacheLimitMB(limit);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        appSettings.cacheLimitMB === limit
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                          : 'bg-[#1b1b22] text-zinc-500 border-white/5'
                      }`}
                    >
                      {limit} MB
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Cache Button */}
              <button
                onClick={handleClearCache}
                className="w-full mt-1 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-white/5 text-xs text-zinc-300 font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Önbelleği ve Geçici Kareleri Temizle</span>
              </button>

              {cacheMessage && (
                <span className="text-[10px] text-emerald-400 text-center font-semibold animate-pulse">
                  {cacheMessage}
                </span>
              )}
            </div>

            {/* Reset to Factory Defaults */}
            <button
              onClick={() => appSettings.resetToDefaults()}
              className="w-full py-2 rounded-xl spatial-glass text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tüm Uygulama Ayarlarını Sıfırla</span>
            </button>
          </div>
        )}

        {/* TAB 2: AKTİF PROJE AYARLARI (CURRENT PROJECT) */}
        {activeTab === 'project' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-1">
            {/* Project Name */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-zinc-300 font-bold">Proje Başlığı</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-[#1b1b22] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-400 font-medium"
              />
            </div>

            {/* Aspect Ratio Presets */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-zinc-300 font-bold">En-Boy Oranı (Aspect Ratio)</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '9:16', desc: 'TikTok / Reels', val: '9:16' as const },
                  { label: '16:9', desc: 'YouTube', val: '16:9' as const },
                  { label: '1:1', desc: 'Kare / Post', val: '1:1' as const },
                  { label: '4:5', desc: 'Instagram', val: '4:5' as const },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      HapticEngine.snapTick();
                      setAspectRatio(item.val);
                    }}
                    className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                      aspectRatio === item.val
                        ? 'accent-gradient text-white shadow-md'
                        : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold text-xs">{item.label}</span>
                    <span className="text-[9px] opacity-75">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate (FPS) Selector */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-zinc-300 font-bold">Kare Hızı (FPS)</label>
              <div className="grid grid-cols-4 gap-2">
                {[24, 30, 60, 120].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      HapticEngine.snapTick();
                      setFps(rate);
                    }}
                    className={`py-2 rounded-2xl border text-xs font-bold transition-all ${
                      fps === rate
                        ? 'accent-gradient text-white shadow-md'
                        : 'bg-[#1b1b22] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {rate} FPS
                  </button>
                ))}
              </div>
            </div>

            {/* Save .opencap Project File to Disk */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <button
                onClick={async () => {
                  HapticEngine.impactHeavy();
                  await saveCurrentProject();
                }}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl spatial-glass-pill hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4 text-purple-400" />
                <span>Projeyi .opencap Olarak Diske Kaydet</span>
              </button>

              {statusMessage && (
                <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            {/* Apply Project Changes Button */}
            <button
              onClick={handleApplyProjectSettings}
              className="w-full py-3 accent-gradient text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 active:scale-95 transition-all mt-2"
            >
              Proje Değişikliklerini Uygula
            </button>
          </div>
        )}

        {/* TAB 3: DONANIM, TANILAMA & HAKKINDA (HARDWARE & DIAGNOSTICS) */}
        {activeTab === 'hardware' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-1">
            {/* Rust Tauri Backend Info Card */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#16161f] border border-white/5 text-xs">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Cpu className="w-4 h-4" />
                <span>Yerel Donanım Hızlandırma Durumu (Rust IPC)</span>
              </div>

              {capabilities ? (
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-1">
                  <div>
                    <span className="text-zinc-500">Platform: </span>
                    <span className="font-bold text-white">{capabilities.platform} ({capabilities.arch})</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Hızlandırıcı: </span>
                    <span className="text-emerald-400 font-bold">Aktif (NVENC/MediaCodec)</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-500">Desteklenen Kodlayıcılar: </span>
                    <span className="font-mono text-[10px] text-purple-300">
                      {capabilities.supportedEncoders.join(', ')}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-zinc-500 text-[11px]">Donanım bilgisi alınıyor...</span>
              )}
            </div>

            {/* E2E Automated Diagnostic Trigger */}
            {onOpenDiagnostics && (
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#16161f] border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Otomatik E2E Stres & Tanılama Testi</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">4 Modül</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  50-kanal ölçeklenebilirlik, 1000 adımlı undo/redo ve ses DSP bütünlük testlerini canlı çalıştırır.
                </p>
                <button
                  onClick={onOpenDiagnostics}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold text-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>E2E Tanılama Testini Başlat</span>
                </button>
              </div>
            )}

            {/* OTA GitHub Auto-Updater Card */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#16161f] border border-white/5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Zap className="w-4 h-4 text-pink-400" />
                  <span>Otomatik Güncelleme (GitHub OTA)</span>
                </div>
                <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-500/20 px-1.5 py-0.5 rounded">
                  v{AutoUpdaterEngine.CURRENT_VERSION}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Google Play olmadan doğrudan GitHub üzerinden tek tıkla en son sürüme güncelleyin.
              </p>
              <button
                onClick={async () => {
                  HapticEngine.impactMedium();
                  setIsCheckingUpdate(true);
                  setUpdateStatus('GitHub üzerinden denetleniyor...');
                  try {
                    const info = await AutoUpdaterEngine.checkForUpdates();
                    setIsCheckingUpdate(false);
                    if (info.hasUpdate) {
                      setUpdateStatus(null);
                      if (onCheckUpdate) {
                        onCheckUpdate(info);
                      }
                    } else {
                      setUpdateStatus('Harika! En son sürümü kullanıyorsunuz (v1.0.0).');
                      setTimeout(() => setUpdateStatus(null), 4000);
                    }
                  } catch (e) {
                    setIsCheckingUpdate(false);
                    setUpdateStatus('Güncelleme sunucusuna bağlanılamadı.');
                  }
                }}
                disabled={isCheckingUpdate}
                className="w-full py-2.5 rounded-xl accent-gradient border border-white/20 text-xs font-bold text-white active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Denetleniyor...' : 'Güncellemeleri Denetle'}</span>
              </button>
              {updateStatus && (
                <span className="text-[10px] text-pink-300 text-center font-semibold animate-pulse">
                  {updateStatus}
                </span>
              )}
            </div>

            {/* About & License */}
            <div className="flex flex-col p-3 rounded-2xl bg-[#16161f] border border-white/5 text-xs gap-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>OPEN-CAP Mobile Hakkında</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                Açık kaynaklı, sıfır abonelikli ve internetsiz mobil video düzenleyici.
              </span>
              <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>Lisans: MIT Open Source</span>
                <span>Sürüm: 1.0.0 Pro</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 spatial-glass-pill text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex-shrink-0"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
