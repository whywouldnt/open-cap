import React, { useState, useEffect } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { TTSEngine, TTS_VOICES, TTSVoiceProfile } from '@/engine/ai/TTSEngine';
import { AddClipCommand, AddTrackCommand } from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { Track } from '@/types/project';
import {
  X,
  Mic,
  Play,
  Square,
  Sparkles,
  Sliders,
  Check,
  PlusCircle,
  Volume2,
  Globe,
} from 'lucide-react';

interface TTSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TTSModal: React.FC<TTSModalProps> = ({ isOpen, onClose }) => {
  const { selectedClipId, currentTime } = useTimelineStore();
  const { getClipById, project } = useProjectStore();

  const selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  const activeText = selectedData?.clip?.textContent?.text || 'OPEN-CAP ile yapay zeka seslendirmesi.';

  const [text, setText] = useState<string>(activeText);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('tr-ahmet-viral');
  const [rate, setRate] = useState<number>(1.1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeLang, setActiveLang] = useState<'all' | 'tr' | 'en'>('all');

  useEffect(() => {
    if (isOpen && selectedData?.clip?.textContent?.text) {
      setText(selectedData.clip.textContent.text);
    }
  }, [isOpen, selectedClipId]);

  if (!isOpen) return null;

  const selectedVoice = TTS_VOICES.find((v) => v.id === selectedVoiceId) || TTS_VOICES[0];
  const estimatedSeconds = TTSEngine.estimateDuration(text, rate);

  const filteredVoices = TTS_VOICES.filter((v) => {
    if (activeLang === 'tr') return v.lang === 'tr-TR';
    if (activeLang === 'en') return v.lang === 'en-US';
    return true;
  });

  const handlePreview = () => {
    if (isPlaying) {
      TTSEngine.stopPreview();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      TTSEngine.previewSpeech(text, selectedVoice, rate);
      // Auto stop toggle after estimated time
      setTimeout(() => {
        setIsPlaying(false);
      }, estimatedSeconds * 1000 + 400);
    }
  };

  const handleAddToTimeline = () => {
    TTSEngine.stopPreview();

    // Find or create Audio track for voiceover
    let audioTrack = project.tracks.find((t) => t.type === 'audio');
    if (!audioTrack) {
      const newTrack: Track = {
        id: `track-audio-${Date.now()}`,
        name: 'AI Seslendirme',
        type: 'audio',
        isMuted: false,
        isLocked: false,
        isHidden: false,
        volume: 1.0,
        zIndex: 2,
        clips: [],
      };
      const addTrkCmd = new AddTrackCommand(newTrack);
      historyManager.execute(addTrkCmd);
      audioTrack = newTrack;
    }

    const ttsClip = TTSEngine.createVoiceoverClip(
      text,
      selectedVoice,
      currentTime,
      audioTrack.id,
      rate
    );

    const addClipCmd = new AddClipCommand(
      audioTrack.id,
      ttsClip,
      `AI Ses: ${selectedVoice.name}`
    );
    historyManager.execute(addClipCmd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Yapay Zeka Seslendirme (TTS)</h3>
          </div>
          <button
            onClick={() => {
              TTSEngine.stopPreview();
              onClose();
            }}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Input */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <div className="flex justify-between text-xs text-zinc-400 font-medium">
            <span>Seslendirilecek Metin</span>
            <span className="font-mono text-cyan-400 font-bold">~{estimatedSeconds}s</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="w-full bg-[#121216] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none font-medium"
            placeholder="Seslendirilecek metni buraya yazın..."
          />
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {[
            { id: 'all', label: 'Tüm Diller' },
            { id: 'tr', label: '🇹🇷 Türkçe' },
            { id: 'en', label: '🇬🇧 English' },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLang(l.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeLang === l.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'bg-[#1b1b22] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Voice Profiles Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 min-h-[160px]">
          {filteredVoices.map((v) => {
            const isSelected = selectedVoiceId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVoiceId(v.id)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-[#1b1b22] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <div
                      style={{ backgroundColor: v.avatarColor }}
                      className="w-3 h-3 rounded-full shadow"
                    />
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                      {v.name}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                  {v.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Speed Slider */}
        <div className="flex flex-col gap-1 text-xs p-2.5 rounded-xl bg-[#121216] border border-white/5 flex-shrink-0">
          <div className="flex justify-between text-zinc-300 font-medium">
            <span>Konuşma Hızı</span>
            <span className="font-mono text-cyan-400 font-bold">{rate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.5"
            step="0.05"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-700 rounded-lg cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0 pt-1">
          {/* Preview Listen Button */}
          <button
            onClick={handlePreview}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              isPlaying
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-[#1b1b22] text-zinc-300 border-white/10 hover:text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-rose-400" />
                <span>Durdur</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                <span>Önizle</span>
              </>
            )}
          </button>

          {/* Add to Timeline CTA */}
          <button
            onClick={handleAddToTimeline}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Seslendirmeyi Kanala Ekle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
