import React, { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useTimelineStore } from '@/store/timelineStore';
import { TEMPLATE_LIBRARY, TemplateDefinition } from '@/engine/templates/templateLibrary';
import {
  X,
  Sparkles,
  LayoutGrid,
  Zap,
  Check,
  Film,
  Music,
  ArrowRight,
  Download,
  Upload,
} from 'lucide-react';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { project } = useProjectStore();
  const { setCurrentTime, selectClip } = useTimelineStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tiktokVelocity');
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');

  if (!isOpen) return null;

  const categories = ['Tümü', 'TikTok Trend', 'Reels / Shorts', 'Sinematik Vlog'];

  const filteredTemplates = TEMPLATE_LIBRARY.filter((t) => {
    if (activeCategory === 'Tümü') return true;
    return t.category === activeCategory;
  });

  const activeTemplate = TEMPLATE_LIBRARY.find((t) => t.id === selectedTemplateId) || TEMPLATE_LIBRARY[0];

  const handleApplyTemplate = (templateDef: TemplateDefinition) => {
    // Collect available media IDs or placeholder IDs
    const availableMediaIds = (project.mediaBin || []).map((m) => m.id);
    if (availableMediaIds.length === 0) {
      availableMediaIds.push('demo-sample-1', 'demo-sample-2', 'demo-sample-3');
    }

    const generatedProject = templateDef.buildProject(availableMediaIds);

    // Load generated project into store
    useProjectStore.setState({ project: generatedProject });
    setCurrentTime(0);
    selectClip(null);
    onClose();
  };

  // Export Template JSON (.opencap_template)
  const handleExportTemplate = () => {
    const templateJson = JSON.stringify(project, null, 2);
    const blob = new Blob([templateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'template'}.opencap_template`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Hazır Video Şablonları (Templates)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'bg-[#1b1b22] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2.5">
          {filteredTemplates.map((t) => {
            const isSelected = selectedTemplateId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-[#1b1b22] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ backgroundColor: t.previewColor }}
                      className="w-3 h-3 rounded-full shadow"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{t.name}</h4>
                      <span className="text-[10px] text-zinc-400">{t.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                    <Music className="w-3 h-3 text-cyan-400" />
                    <span>{t.bpm} BPM</span>
                    <span className="text-zinc-600">•</span>
                    <span>{t.duration}s</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-300 line-clamp-2">
                  {t.description}
                </p>

                {/* Slots requirement tags */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                  <span className="text-[10px] text-zinc-500">Gereken Klipler:</span>
                  <div className="flex gap-1">
                    {t.slots.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 font-mono"
                      >
                        {s.label} ({s.suggestedDuration}s)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0 pt-1">
          <button
            onClick={handleExportTemplate}
            className="px-3 py-2.5 bg-[#1b1b22] border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            title="Mevcut Projeyi Şablon Olarak İndir"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Şablonu İndir</span>
          </button>

          <button
            onClick={() => handleApplyTemplate(activeTemplate)}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>Şablonu 1-Tıkla Uygula</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
