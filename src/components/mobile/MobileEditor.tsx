import React, { useState, useEffect } from 'react';
import { MobileTopBar } from './MobileTopBar';
import { MobilePreviewPlayer } from './MobilePreviewPlayer';
import { MobileTimeline } from './MobileTimeline';
import { MobileActionDrawer } from './MobileActionDrawer';
import { TransformModal } from './TransformModal';
import { AudioModal } from './AudioModal';
import { SettingsModal } from './SettingsModal';
import { ExportModal } from './ExportModal';
import { MediaBinDrawer } from './MediaBinDrawer';
import { SlipEditModal } from './SlipEditModal';
import { TrackManagerModal } from './TrackManagerModal';
import { BlendModeModal } from './BlendModeModal';
import { MaskModal } from './MaskModal';
import { SpeedModal } from './SpeedModal';
import { VFXModal } from './VFXModal';
import { TransitionsModal } from './TransitionsModal';
import { ColorGradingModal } from './ColorGradingModal';
import { TextEditorModal } from './TextEditorModal';
import { AutoCaptionsModal } from './AutoCaptionsModal';
import { TemplatePickerModal } from './TemplatePickerModal';
import { SmartCutoutModal } from './SmartCutoutModal';
import { DiagnosticsModal } from './DiagnosticsModal';
import { TTSModal } from './TTSModal';
import { StickerModal } from './StickerModal';
import { MultiCamModal } from './MultiCamModal';
import { UpdateModal } from './UpdateModal';
import { AutoUpdaterEngine, UpdateInfo } from '@/engine/updater/AutoUpdaterEngine';
import { useTimelineStore } from '@/store/timelineStore';

export const MobileEditor: React.FC = () => {
  const { previewMode } = useTimelineStore();

  const [isTransformOpen, setIsTransformOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMediaBinOpen, setIsMediaBinOpen] = useState(false);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [isTrackManagerOpen, setIsTrackManagerOpen] = useState(false);
  const [isBlendModesOpen, setIsBlendModesOpen] = useState(false);
  const [isMaskOpen, setIsMaskOpen] = useState(false);
  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const [isVFXOpen, setIsVFXOpen] = useState(false);
  const [isTransitionsOpen, setIsTransitionsOpen] = useState(false);
  const [isColorGradingOpen, setIsColorGradingOpen] = useState(false);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [isAutoCaptionsOpen, setIsAutoCaptionsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSmartCutoutOpen, setIsSmartCutoutOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isTTSOpen, setIsTTSOpen] = useState(false);
  const [isStickersOpen, setIsStickersOpen] = useState(false);
  const [isMultiCamOpen, setIsMultiCamOpen] = useState(false);

  // OTA Auto-Updater State
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  // Background check for updates on app startup
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        const info = await AutoUpdaterEngine.checkForUpdates();
        if (info.hasUpdate) {
          setUpdateInfo(info);
          setIsUpdateOpen(true);
        }
      } catch (e) {
        // Silently ignore network failures on startup
      }
    };
    const timer = setTimeout(checkUpdates, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-[#000000] text-white overflow-hidden select-none relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* 1. Mobile Top Bar */}
      <MobileTopBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenMediaBin={() => setIsMediaBinOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />

      {/* 2. Player Preview Area (9:16 vertical canvas + frame scrubbing controls) */}
      <MobilePreviewPlayer />

      {/* 3. Multi-Track Timeline Container */}
      <MobileTimeline
        onOpenMediaBin={() => setIsMediaBinOpen(true)}
        onOpenTrackManager={() => setIsTrackManagerOpen(true)}
      />

      {/* 4. Bottom CapCut Action Drawer */}
      <MobileActionDrawer
        onOpenTransform={() => setIsTransformOpen(true)}
        onOpenAudio={() => setIsAudioOpen(true)}
        onOpenMediaBin={() => setIsMediaBinOpen(true)}
        onOpenSlip={() => setIsSlipOpen(true)}
        onOpenTrackManager={() => setIsTrackManagerOpen(true)}
        onOpenBlendModes={() => setIsBlendModesOpen(true)}
        onOpenMask={() => setIsMaskOpen(true)}
        onOpenSpeed={() => setIsSpeedOpen(true)}
        onOpenVFX={() => setIsVFXOpen(true)}
        onOpenTransitions={() => setIsTransitionsOpen(true)}
        onOpenColorGrading={() => setIsColorGradingOpen(true)}
        onOpenTextEditor={() => setIsTextEditorOpen(true)}
        onOpenAutoCaptions={() => setIsAutoCaptionsOpen(true)}
        onOpenSmartCutout={() => setIsSmartCutoutOpen(true)}
        onOpenTTS={() => setIsTTSOpen(true)}
        onOpenStickers={() => setIsStickersOpen(true)}
        onOpenMultiCam={() => setIsMultiCamOpen(true)}
      />

      {/* Modals & Sub-drawers */}
      <TransformModal
        isOpen={isTransformOpen}
        onClose={() => setIsTransformOpen(false)}
      />

      <AudioModal
        isOpen={isAudioOpen}
        onClose={() => setIsAudioOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenDiagnostics={() => {
          setIsSettingsOpen(false);
          setIsDiagnosticsOpen(true);
        }}
        onCheckUpdate={(info) => {
          setUpdateInfo(info);
          setIsUpdateOpen(true);
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <MediaBinDrawer
        isOpen={isMediaBinOpen}
        onClose={() => setIsMediaBinOpen(false)}
      />

      <SlipEditModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
      />

      <TrackManagerModal
        isOpen={isTrackManagerOpen}
        onClose={() => setIsTrackManagerOpen(false)}
      />

      <BlendModeModal
        isOpen={isBlendModesOpen}
        onClose={() => setIsBlendModesOpen(false)}
      />

      <MaskModal
        isOpen={isMaskOpen}
        onClose={() => setIsMaskOpen(false)}
      />

      <SpeedModal
        isOpen={isSpeedOpen}
        onClose={() => setIsSpeedOpen(false)}
      />

      <VFXModal
        isOpen={isVFXOpen}
        onClose={() => setIsVFXOpen(false)}
      />

      <TransitionsModal
        isOpen={isTransitionsOpen}
        onClose={() => setIsTransitionsOpen(false)}
      />

      <ColorGradingModal
        isOpen={isColorGradingOpen}
        onClose={() => setIsColorGradingOpen(false)}
      />

      <TextEditorModal
        isOpen={isTextEditorOpen}
        onClose={() => setIsTextEditorOpen(false)}
      />

      <AutoCaptionsModal
        isOpen={isAutoCaptionsOpen}
        onClose={() => setIsAutoCaptionsOpen(false)}
      />

      <TemplatePickerModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      <SmartCutoutModal
        isOpen={isSmartCutoutOpen}
        onClose={() => setIsSmartCutoutOpen(false)}
      />

      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      <TTSModal
        isOpen={isTTSOpen}
        onClose={() => setIsTTSOpen(false)}
      />

      <StickerModal
        isOpen={isStickersOpen}
        onClose={() => setIsStickersOpen(false)}
      />

      <MultiCamModal
        isOpen={isMultiCamOpen}
        onClose={() => setIsMultiCamOpen(false)}
      />

      <UpdateModal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        updateInfo={updateInfo}
      />
    </div>
  );
};
