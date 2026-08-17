import React, { useState, useRef } from 'react';
import { useTimelineStore } from '@/store/timelineStore';
import { useProjectStore } from '@/store/projectStore';
import { SubtitleParser } from '@/engine/text/SubtitleParser';
import { SpeechToTextEngine, TranscribedSentence } from '@/engine/ai/SpeechToTextEngine';
import { AddClipCommand, AddTrackCommand } from '@/engine/commands';
import { historyManager } from '@/engine/history';
import { Clip, Track, DEFAULT_AUDIO_SETTINGS } from '@/types/project';
import {
  X,
  Sparkles,
  FileText,
  Upload,
  Download,
  Check,
  Zap,
  Layers,
  Mic,
  Activity,
  Globe,
  Play,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';

interface AutoCaptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoCaptionsModal: React.FC<AutoCaptionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedClipId } = useTimelineStore();
  const { project, getClipById, getMediaById } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedData = selectedClipId ? getClipById(selectedClipId) : null;
  const clip = selectedData?.clip;
  const mediaMeta = clip?.mediaId ? getMediaById(clip.mediaId) : null;

  const [activeTab, setActiveTab] = useState<'stt' | 'templates' | 'srt'>('stt');
  const [selectedStyle, setSelectedStyle] = useState<string>('hormozi');
  const [selectedLang, setSelectedLang] = useState<'tr-TR' | 'en-US' | 'auto'>('tr-TR');

  // STT Transcription State
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribeProgress, setTranscribeProgress] = useState<number>(0);
  const [transcribeStage, setTranscribeStage] = useState<string>('');
  const [transcribedSentences, setTranscribedSentences] = useState<TranscribedSentence[] | null>(null);

  if (!isOpen) return null;

  const captionStyles = [
    {
      id: 'hormozi',
      name: 'Alex Hormozi Vurgulu',
      description: 'Sarı/Yeşil büyük kelimeler, kalın siyah kontur ve kelime sıçraması.',
      fontFamily: 'Anton',
      fontSize: 32,
      fontColor: '#fde047',
      strokeColor: '#000000',
      strokeWidth: 4,
      animation: 'karaokeHormozi',
      colorLabel: '#facc15',
    },
    {
      id: 'tiktokYellow',
      name: 'TikTok Viral Kutu',
      description: 'Sarı fosforlu arkaplan kutusu ve siyah kalın başlık.',
      fontFamily: 'Montserrat',
      fontSize: 26,
      fontColor: '#000000',
      backgroundColor: '#fde047',
      backgroundPadding: 10,
      backgroundRadius: 6,
      animation: 'karaokeBox',
      colorLabel: '#eab308',
    },
    {
      id: 'karaokeGlow',
      name: 'Neon Karaoke',
      description: 'Mavi neon ışıltılı, konuşulan kelimeyi parlatan altyazı.',
      fontFamily: 'Poppins',
      fontSize: 28,
      fontColor: '#ffffff',
      shadowColor: '#00f0ff',
      shadowBlur: 20,
      animation: 'karaokeGlow',
      colorLabel: '#06b6d4',
    },
    {
      id: 'cinemaMinimal',
      name: 'Sinematik Minimalist',
      description: 'Alt kısımda zarif beyaz harfler ve şeffaf siyah gölge.',
      fontFamily: 'Inter',
      fontSize: 22,
      fontColor: '#ffffff',
      shadowColor: 'rgba(0,0,0,0.8)',
      shadowBlur: 10,
      animation: 'none',
      colorLabel: '#94a3b8',
    },
  ];

  const currentStyleDef = captionStyles.find((s) => s.id === selectedStyle) || captionStyles[0];

  // 1. Run AI Speech-to-Text Transcription on Video
  const handleStartTranscription = async () => {
    setIsTranscribing(true);
    setTranscribedSentences(null);
    setTranscribeProgress(0);

    const targetDuration = clip?.duration || project.duration || 12.0;
    const clipName = clip?.name || project.name || 'Video';
    const waveform = mediaMeta?.waveform || [];

    const results = await SpeechToTextEngine.transcribeVideoClip(
      clipName,
      targetDuration,
      waveform,
      {
        language: selectedLang,
        includeWordTimings: true,
        minSentenceDuration: 1.5,
        maxSentenceDuration: 3.5,
      },
      (prog, stage) => {
        setTranscribeProgress(prog);
        setTranscribeStage(stage);
      }
    );

    setTranscribedSentences(results);
    setIsTranscribing(false);
  };

  // 2. Apply Transcribed Sentences to Timeline
  const handleApplyToTimeline = () => {
    if (!transcribedSentences || transcribedSentences.length === 0) return;

    let textTrack = project.tracks.find((t) => t.type === 'text');
    if (!textTrack) {
      const newTrack: Track = {
        id: `track-subtitles-${Date.now()}`,
        name: 'AI Altyazı Kanalı',
        type: 'text',
        isMuted: false,
        isLocked: false,
        isHidden: false,
        volume: 1.0,
        zIndex: 10,
        clips: [],
      };
      const addTrkCmd = new AddTrackCommand(newTrack);
      historyManager.execute(addTrkCmd);
      textTrack = newTrack;
    }

    const subtitleClips = SpeechToTextEngine.createSubtitleClipsFromTranscription(
      transcribedSentences,
      textTrack.id,
      currentStyleDef
    );

    subtitleClips.forEach((subClip) => {
      const addCmd = new AddClipCommand(textTrack!.id, subClip, 'AI Altyazı Ekle');
      historyManager.execute(addCmd);
    });

    onClose();
  };

  // 3. SRT File Upload
  const handleSRTUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (!content) return;

      const items = SubtitleParser.parseSRT(content);
      if (items.length === 0) {
        alert('Geçerli bir SRT altyazı dosyası bulunamadı.');
        return;
      }

      let textTrack = project.tracks.find((t) => t.type === 'text');
      if (!textTrack) {
        const newTrack: Track = {
          id: `track-subtitles-${Date.now()}`,
          name: 'Altyazı Kanalı',
          type: 'text',
          isMuted: false,
          isLocked: false,
          isHidden: false,
          volume: 1.0,
          zIndex: 10,
          clips: [],
        };
        const addTrkCmd = new AddTrackCommand(newTrack);
        historyManager.execute(addTrkCmd);
        textTrack = newTrack;
      }

      items.forEach((item) => {
        const subClip: Clip = {
          id: `clip-srt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          mediaId: '',
          trackId: textTrack!.id,
          name: item.text.substring(0, 15),
          startTime: item.startTime,
          duration: item.duration,
          sourceStartTime: 0,
          sourceDuration: item.duration,
          speed: 1.0,
          isMuted: true,
          transform: {
            x: 0,
            y: 180,
            scaleX: 1.0,
            scaleY: 1.0,
            rotation: 0,
            opacity: 1.0,
            anchorX: 0.5,
            anchorY: 0.5,
          },
          blendMode: 'normal',
          keyframes: [],
          effects: [],
          audioSettings: { ...DEFAULT_AUDIO_SETTINGS },
          textContent: {
            text: item.text,
            fontFamily: currentStyleDef.fontFamily,
            fontSize: currentStyleDef.fontSize,
            fontColor: currentStyleDef.fontColor,
            strokeColor: currentStyleDef.strokeColor,
            strokeWidth: currentStyleDef.strokeWidth,
            align: 'center',
            letterSpacing: 2,
            lineHeight: 1.2,
            animation: currentStyleDef.animation,
          },
          colorLabel: currentStyleDef.colorLabel,
        };

        const addCmd = new AddClipCommand(textTrack!.id, subClip, 'SRT Altyazı Ekle');
        historyManager.execute(addCmd);
      });

      onClose();
    };

    reader.readAsText(file);
  };

  // 4. SRT Export
  const handleExportSRT = () => {
    const textTrack = project.tracks.find((t) => t.type === 'text');
    if (!textTrack || textTrack.clips.length === 0) {
      alert('Projede dışa aktarılacak altyazı klibi bulunamadı.');
      return;
    }

    const srtString = SubtitleParser.exportToSRT(textTrack.clips);
    const blob = new Blob([srtString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'project'}_subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-lg bg-[#16161b] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">AI Konuşma Tanıma & Altyazı Motoru</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input for SRT */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".srt,.vtt,.txt"
          onChange={handleSRTUpload}
          className="hidden"
        />

        {/* Tab Navigation */}
        <div className="flex bg-[#1b1b22] p-1 rounded-xl border border-white/5 flex-shrink-0">
          {[
            { id: 'stt', label: '🎙️ Konuşmayı Yazıya Dök', icon: <Mic className="w-3.5 h-3.5" /> },
            { id: 'templates', label: 'Şablon Stilleri', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'srt', label: 'SRT Dosyası', icon: <FileText className="w-3.5 h-3.5" /> },
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
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: AI Speech-to-Text Transcription */}
        {activeTab === 'stt' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3">
            {/* Language & Target Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-zinc-400 font-medium">Konuşma Dili</span>
                <div className="flex gap-1">
                  {[
                    { id: 'tr-TR', label: '🇹🇷 Türkçe' },
                    { id: 'en-US', label: '🇬🇧 English' },
                    { id: 'auto', label: '🌍 Otomatik' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLang(l.id as any)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                        selectedLang === l.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                          : 'bg-[#1b1b22] text-zinc-400 border-white/5'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <span className="text-zinc-400 font-medium">Hedef Kaynak</span>
                <span className="p-2 rounded-lg bg-[#1b1b22] border border-white/5 text-[11px] font-mono text-zinc-300 truncate">
                  {clip ? `Seçili: ${clip.name}` : `Tüm Proje (${project.duration}s)`}
                </span>
              </div>
            </div>

            {/* Active Transcription Progress Bar */}
            {isTranscribing && (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#121216] border border-amber-400/30 animate-pulse">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    {transcribeStage}
                  </span>
                  <span className="font-mono">{Math.round(transcribeProgress * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${transcribeProgress * 100}%` }}
                    className="h-full bg-amber-400 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Transcribed Sentences List */}
            {transcribedSentences && !isTranscribing && (
              <div className="flex flex-col gap-2 p-2 rounded-xl bg-[#121216] border border-white/5 flex-1 min-h-[140px] max-h-[200px] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {transcribedSentences.length} Cümle Çıkarıldı
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Kelime Zamanlamalı</span>
                </div>

                {transcribedSentences.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex flex-col p-2 rounded-lg bg-[#1b1b22] border border-white/5 text-xs gap-0.5"
                  >
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Cümle {idx + 1}</span>
                      <span>{s.startTime}s - {s.endTime}s</span>
                    </div>
                    <span className="text-white font-medium">{s.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trigger Button */}
            {!transcribedSentences ? (
              <button
                onClick={handleStartTranscription}
                disabled={isTranscribing}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Mic className="w-4 h-4 fill-black" />
                <span>{isTranscribing ? 'Ses Analiz Ediliyor...' : '🎙️ Videodaki Konuşmaları Altyazıya Dönüştür'}</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleStartTranscription}
                  className="px-3 py-2.5 bg-[#1b1b22] border border-white/10 text-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleApplyToTimeline}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Altyazıları Timeline'a Ekle ({transcribedSentences.length} Cümle)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Style Templates */}
        {activeTab === 'templates' && (
          <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 min-h-[220px]">
            {captionStyles.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-[#1b1b22] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                      {style.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                    {style.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 3: SRT Import / Export */}
        {activeTab === 'srt' && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 p-2">
            <p className="text-xs text-zinc-300">
              Harici altyazı dosyalarınızı (.srt / .vtt) içe aktarabilir veya projedeki altyazıları standart SRT formatında dışa aktarabilirsiniz.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-3 bg-[#1b1b22] border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>SRT Dosyası Yükle</span>
              </button>

              <button
                onClick={handleExportSRT}
                className="flex items-center justify-center gap-1.5 py-3 bg-[#1b1b22] border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>SRT Olarak İndir</span>
              </button>
            </div>
          </div>
        )}

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
