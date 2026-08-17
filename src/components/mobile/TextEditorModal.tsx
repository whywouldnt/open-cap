import React, { useState } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { TEXT_ANIMATIONS, TextAnimationDefinition } from '@/engine/text/textAnimations';
import { TextContent } from '@/types/project';
import {
  X,
  Type,
  Palette,
  Sparkles,
  Box,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Sliders,
  Check,
} from 'lucide-react';

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TextEditorModal: React.FC<TextEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedClipId } = useTimelineStore();
  const { getClipById, updateClip } = useProjectStore();

  const selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  const clip = selectedData?.clip;

  const [activeTab, setActiveTab] = useState<'text' | 'style' | 'anim' | '3d'>('text');

  if (!isOpen || !clip) return null;

  const textContent: TextContent = clip.textContent || {
    text: 'BURAYA YAZIN',
    fontFamily: 'Inter',
    fontSize: 28,
    fontColor: '#ffffff',
    align: 'center',
    letterSpacing: 2,
    lineHeight: 1.2,
  };

  const handleUpdateText = (updates: Partial<TextContent>) => {
    updateClip(clip.id, {
      textContent: {
        ...textContent,
        ...updates,
      },
    });
  };

  const fonts = [
    'Inter',
    'Montserrat',
    'Poppins',
    'Bebas Neue',
    'Oswald',
    'Anton',
    'Playfair Display',
    'Orbitron',
    'Pacifico',
  ];

  const colorPresets = [
    '#ffffff',
    '#00f0ff',
    '#fde047',
    '#f43f5e',
    '#10b981',
    '#a855f7',
    '#fb923c',
    '#000000',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Metin & Tipografi Editörü</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#1b1b22] p-1 rounded-xl border border-white/5 flex-shrink-0">
          {[
            { id: 'text', label: 'Metin & Font', icon: <Type className="w-3.5 h-3.5" /> },
            { id: 'style', label: 'Renk & Gölge', icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'anim', label: 'Kinetik Animasyon', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: '3d', label: '3D Derinlik', icon: <Box className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Text & Font */}
        {activeTab === 'text' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* Textarea */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-400">Metin İçeriği</span>
              <textarea
                value={textContent.text}
                onChange={(e) => handleUpdateText({ text: e.target.value })}
                rows={2}
                className="w-full bg-[#1b1b22] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-400 resize-none font-bold"
                placeholder="Başlık veya metin yazın..."
              />
            </div>

            {/* Font Picker */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-400">Yazı Tipi (Font Family)</span>
              <div className="grid grid-cols-3 gap-1.5">
                {fonts.map((f) => (
                  <button
                    key={f}
                    onClick={() => handleUpdateText({ fontFamily: f })}
                    style={{ fontFamily: f }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold truncate transition-all ${
                      textContent.fontFamily === f
                        ? 'bg-amber-400 text-black shadow'
                        : 'bg-[#1b1b22] text-zinc-300 hover:text-white border border-white/5'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Alignment */}
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Font Size Slider */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Boyut</span>
                  <span className="font-mono text-amber-400">{textContent.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={textContent.fontSize}
                  onChange={(e) => handleUpdateText({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-amber-400"
                />
              </div>

              {/* Align & Bold / Italic */}
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => handleUpdateText({ align: 'left' })}
                  className={`p-2 rounded-lg border ${
                    textContent.align === 'left' ? 'bg-amber-400 text-black' : 'bg-[#1b1b22] text-zinc-400 border-white/5'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpdateText({ align: 'center' })}
                  className={`p-2 rounded-lg border ${
                    textContent.align === 'center' ? 'bg-amber-400 text-black' : 'bg-[#1b1b22] text-zinc-400 border-white/5'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpdateText({ align: 'right' })}
                  className={`p-2 rounded-lg border ${
                    textContent.align === 'right' ? 'bg-amber-400 text-black' : 'bg-[#1b1b22] text-zinc-400 border-white/5'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleUpdateText({ isBold: !textContent.isBold })}
                  className={`p-2 rounded-lg border ${
                    textContent.isBold ? 'bg-amber-400 text-black' : 'bg-[#1b1b22] text-zinc-400 border-white/5'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Style & Colors */}
        {activeTab === 'style' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* Text Color Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-400">Metin Rengi</span>
              <div className="flex gap-2">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleUpdateText({ fontColor: c })}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full shadow border-2 transition-transform ${
                      textContent.fontColor === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Outline */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Kontur (Stroke) Kalınlığı</span>
                <span className="font-mono text-amber-400">{textContent.strokeWidth || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={textContent.strokeWidth || 0}
                onChange={(e) =>
                  handleUpdateText({
                    strokeWidth: parseInt(e.target.value, 10),
                    strokeColor: textContent.strokeColor || '#000000',
                  })
                }
                className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-amber-400"
              />
            </div>

            {/* Background Box */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-400">Arka Plan Kutusu</span>
              <div className="flex items-center gap-2">
                {['transparent', 'rgba(0,0,0,0.7)', '#fde047', '#f43f5e', '#00f0ff'].map((bg) => (
                  <button
                    key={bg}
                    onClick={() =>
                      handleUpdateText({
                        backgroundColor: bg,
                        fontColor: bg === '#fde047' ? '#000000' : textContent.fontColor,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      textContent.backgroundColor === bg
                        ? 'bg-amber-400 text-black border-white'
                        : 'bg-[#1b1b22] text-zinc-300 border-white/10'
                    }`}
                  >
                    {bg === 'transparent' ? 'Yok' : bg === '#fde047' ? 'Sarı' : bg === '#f43f5e' ? 'Kırmızı' : 'Siyah'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Kinetic Animations */}
        {activeTab === 'anim' && (
          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 min-h-[220px]">
            {TEXT_ANIMATIONS.map((anim) => {
              const isSelected = textContent.animation === anim.id;
              return (
                <button
                  key={anim.id}
                  onClick={() => handleUpdateText({ animation: anim.id })}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-[#1b1b22] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                      {anim.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                    {anim.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 4: 3D Depth */}
        {activeTab === '3d' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-3 rounded-xl bg-[#121216] border border-white/5">
            {/* 3D Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">3D Metin Derinliği (Extrusion)</span>
              <button
                onClick={() =>
                  handleUpdateText({
                    text3D: {
                      enabled: !textContent.text3D?.enabled,
                      depth: textContent.text3D?.depth || 8,
                      extrusionColor: '#000000',
                      lightAngle: 45,
                    },
                  })
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  textContent.text3D?.enabled
                    ? 'bg-amber-400 text-black shadow'
                    : 'bg-white/10 text-zinc-400'
                }`}
              >
                {textContent.text3D?.enabled ? 'Açık' : 'Kapalı'}
              </button>
            </div>

            {/* Depth Slider */}
            {textContent.text3D?.enabled && (
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>3D Kabartma Kalınlığı</span>
                  <span className="font-mono text-amber-400">{textContent.text3D.depth}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={textContent.text3D.depth}
                  onChange={(e) =>
                    handleUpdateText({
                      text3D: {
                        ...textContent.text3D!,
                        depth: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-amber-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex-shrink-0"
        >
          Tamamla
        </button>
      </div>
    </div>
  );
};
