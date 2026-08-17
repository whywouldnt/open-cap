import { create } from 'zustand';
import { ProjectMediaItem, MediaType } from '@/types/project';
import { MediaProbe } from '@/engine/media/MediaProbe';
import { useProjectStore } from './projectStore';
import { globalFrameCache } from '@/engine/cache/LRUFrameCache';

export type MediaFilterCategory = 'all' | 'video' | 'audio' | 'image';

interface MediaState {
  isImporting: boolean;
  importProgress: number; // 0 to 100
  importStatus: string | null;
  searchQuery: string;
  activeFilter: MediaFilterCategory;
  selectedMediaId: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: MediaFilterCategory) => void;
  setSelectedMediaId: (id: string | null) => void;

  // Importers
  importFiles: (files: FileList | File[]) => Promise<ProjectMediaItem[]>;
  removeMedia: (id: string) => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  isImporting: false,
  importProgress: 0,
  importStatus: null,
  searchQuery: '',
  activeFilter: 'all',
  selectedMediaId: null,

  setSearchQuery: (searchQuery: string) => set({ searchQuery }),

  setActiveFilter: (activeFilter: MediaFilterCategory) => set({ activeFilter }),

  setSelectedMediaId: (selectedMediaId: string | null) => set({ selectedMediaId }),

  importFiles: async (files: FileList | File[]): Promise<ProjectMediaItem[]> => {
    if (get().isImporting) {
      console.warn('Import already in progress, queuing files...');
    }

    const fileArray = Array.from(files);
    if (fileArray.length === 0) return [];

    set({ isImporting: true, importProgress: 0, importStatus: 'Dosyalar analiz ediliyor (FFprobe / WebCodecs)...' });

    const importedResults: ProjectMediaItem[] = [];
    const projectStore = useProjectStore.getState();

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      set({
        importProgress: Math.round(((i) / fileArray.length) * 100),
        importStatus: `${file.name} taranıyor...`,
      });

      try {
        const metadata = await MediaProbe.probeBrowserFile(file);
        projectStore.addMediaToBin(metadata);
        importedResults.push(metadata);

        // Warm up LRU Cache with initial frame & waveform
        if (metadata.thumbnailUri) {
          globalFrameCache.set(metadata.id, 0, {
            imageBitmap: metadata.thumbnailUri,
            waveform: metadata.waveform,
          });
        }
      } catch (err) {
        console.error(`Failed to import ${file.name}:`, err);
      }
    }

    set({
      isImporting: false,
      importProgress: 100,
      importStatus: `${importedResults.length} dosya başarıyla içe aktarıldı!`,
    });

    setTimeout(() => {
      set({ importStatus: null, importProgress: 0 });
    }, 3000);

    return importedResults;
  },

  removeMedia: (id: string) => {
    useProjectStore.getState().removeMediaFromBin(id);
    globalFrameCache.delete(id);
    set((state) => ({
      selectedMediaId: state.selectedMediaId === id ? null : state.selectedMediaId,
    }));
  },
}));
