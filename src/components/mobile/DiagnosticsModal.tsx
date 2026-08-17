import React, { useState } from 'react';
import { E2EStressTestSuite, StressTestReport } from '@/tests/e2eStressTest';
import { HapticEngine } from '@/engine/mobile/HapticEngine';
import {
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Zap,
  BatteryCharging,
  Vibrate,
  Play,
  RotateCcw,
} from 'lucide-react';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testReports, setTestReports] = useState<StressTestReport[] | null>(null);
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(HapticEngine.getEnabled());
  const [batterySaver, setBatterySaver] = useState(true);

  if (!isOpen) return null;

  const handleRunTests = () => {
    setIsRunningTests(true);
    HapticEngine.impactHeavy();

    setTimeout(() => {
      const results = E2EStressTestSuite.runAllTests();
      setTestReports(results);
      setIsRunningTests(false);
      HapticEngine.notificationSuccess();
    }, 300);
  };

  const handleToggleHaptics = () => {
    const next = !isHapticsEnabled;
    setIsHapticsEnabled(next);
    HapticEngine.setEnabled(next);
    if (next) HapticEngine.snapTick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Sistem Tanılama & E2E Stres Testi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System & Hardware Stats */}
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1b22] border border-white/5">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Haptik Titreşim</span>
            </div>
            <button
              onClick={handleToggleHaptics}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                isHapticsEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'bg-white/5 text-zinc-500'
              }`}
            >
              {isHapticsEnabled ? 'Açık' : 'Kapalı'}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1b22] border border-white/5">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Pil Koruma</span>
            </div>
            <button
              onClick={() => setBatterySaver(!batterySaver)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                batterySaver
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-white/5 text-zinc-500'
              }`}
            >
              {batterySaver ? 'Aktif' : 'Pasif'}
            </button>
          </div>
        </div>

        {/* Run Test Suite Action Card */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#121216] border border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Otomatik E2E Test Paketi</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">4 Test Modülü</span>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{isRunningTests ? 'Testler Çalıştırılıyor...' : 'Tüm E2E Testlerini Başlat'}</span>
          </button>
        </div>

        {/* Test Results Output */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 min-h-[160px]">
          {testReports ? (
            testReports.map((report, idx) => (
              <div
                key={idx}
                className="flex flex-col p-2.5 rounded-xl bg-[#1b1b22] border border-white/5 gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {report.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span className="text-xs font-bold text-white">{report.testName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {report.durationMs}ms
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400">{report.details}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-zinc-500 text-xs">
              <span>Test sonuçları burada listelenecektir.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#1b1b22] border border-white/10 text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex-shrink-0"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
