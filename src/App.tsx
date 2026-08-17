import React, { useEffect, useState } from 'react';
import { MobileEditor } from './components/mobile/MobileEditor';
import { useTimelineStore } from './store/timelineStore';
import { Sparkles, Wifi, Battery, Undo2, Redo2 } from 'lucide-react';

export function App() {
  const { previewMode, lastActionName } = useTimelineStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show a momentary toast on undo/redo command execution
  useEffect(() => {
    if (lastActionName) {
      setToastMessage(lastActionName);
      const t = setTimeout(() => setToastMessage(null), 2200);
      return () => clearTimeout(t);
    }
  }, [lastActionName]);

  return (
    <div className="w-screen h-screen bg-[#070709] flex items-center justify-center overflow-hidden font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 z-50 px-3.5 py-1.5 rounded-full bg-cyan-500/90 text-black text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-bounce backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {previewMode === 'mobile-frame' ? (
        /* Phone Frame Wrapper (Simulated iPhone / Android 9:16 Canvas) */
        <div className="relative w-full max-w-[430px] h-full max-h-[920px] bg-black rounded-[40px] shadow-[0_0_60px_rgba(0,240,255,0.15)] border-[8px] border-[#1e1e24] flex flex-col overflow-hidden">
          {/* Simulated Mobile Status Bar */}
          <div className="h-6 bg-[#111115] px-6 flex items-center justify-between text-[11px] text-zinc-400 z-40 select-none flex-shrink-0">
            <span className="font-semibold text-white font-mono">09:41</span>
            {/* Dynamic Island / Camera Notch */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Main Mobile App Viewport */}
          <div className="flex-1 w-full overflow-hidden flex flex-col">
            <MobileEditor />
          </div>

          {/* Mobile Home Bar Indicator */}
          <div className="h-4 bg-[#141418] flex items-center justify-center flex-shrink-0">
            <div className="w-28 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      ) : (
        /* Native Fullscreen Touch Viewport */
        <div className="w-full h-full flex flex-col overflow-hidden">
          <MobileEditor />
        </div>
      )}
    </div>
  );
}

export default App;
