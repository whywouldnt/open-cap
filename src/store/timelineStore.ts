import { create } from 'zustand';
import { historyManager } from '@/engine/history';

export type DrawerTab =
  | 'main'
  | 'edit'
  | 'audio'
  | 'text'
  | 'effects'
  | 'filters'
  | 'canvas'
  | 'transform'
  | 'keyframes';

export type TimelineEditMode = 'select' | 'ripple' | 'roll' | 'slip';

interface TimelineState {
  currentTime: number; // In seconds
  isPlaying: boolean;
  zoom: number; // Pixels per second (e.g. 80px/s)
  selectedClipId: string | null;
  selectedTrackId: string | null;
  isSnappingEnabled: boolean;
  editMode: TimelineEditMode;
  snapLineTime: number | null; // For rendering cyan magnetic snap line
  activeDrawerTab: DrawerTab;
  canUndo: boolean;
  canRedo: boolean;
  lastActionName: string | null;
  previewMode: 'mobile-frame' | 'fullscreen-touch';
  isSettingsOpen: boolean;
  isExportOpen: boolean;
  isMediaBinOpen: boolean;
  isSlipModalOpen: boolean;
  isTrackManagerOpen: boolean;

  // Actions
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  selectClip: (clipId: string | null, trackId?: string) => void;
  selectTrack: (trackId: string | null) => void;
  toggleSnapping: () => void;
  setEditMode: (mode: TimelineEditMode) => void;
  setSnapLineTime: (time: number | null) => void;
  setActiveDrawerTab: (tab: DrawerTab) => void;
  setPreviewMode: (mode: 'mobile-frame' | 'fullscreen-touch') => void;
  setSettingsOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setMediaBinOpen: (open: boolean) => void;
  setSlipModalOpen: (open: boolean) => void;
  setTrackManagerOpen: (open: boolean) => void;

  // Undo/Redo triggers
  undo: () => void;
  redo: () => void;
  syncHistoryState: () => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => {
  // Subscribe to history manager changes
  historyManager.subscribe(() => {
    set({
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      lastActionName: historyManager.getLastActionName(),
    });
  });

  return {
    currentTime: 0,
    isPlaying: false,
    zoom: 90, // 90px per second default
    selectedClipId: 'clip-demo-1', // Select first clip by default for instant interactivity
    selectedTrackId: 'track-video-main',
    isSnappingEnabled: true,
    editMode: 'select',
    snapLineTime: null,
    activeDrawerTab: 'edit',
    canUndo: false,
    canRedo: false,
    lastActionName: null,
    previewMode: 'mobile-frame',
    isSettingsOpen: false,
    isExportOpen: false,
    isMediaBinOpen: false,
    isSlipModalOpen: false,
    isTrackManagerOpen: false,

    setCurrentTime: (time: number) =>
      set({ currentTime: Math.max(0, Math.round(time * 1000) / 1000) }),

    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setZoom: (zoom: number) =>
      set({ zoom: Math.min(300, Math.max(30, zoom)) }),

    zoomIn: () => set((state) => ({ zoom: Math.min(300, state.zoom * 1.25) })),

    zoomOut: () => set((state) => ({ zoom: Math.max(30, state.zoom / 1.25) })),

    selectClip: (clipId: string | null, trackId?: string) =>
      set((state) => ({
        selectedClipId: clipId,
        selectedTrackId: trackId || (clipId ? state.selectedTrackId : null),
        activeDrawerTab: clipId ? 'edit' : 'main',
      })),

    selectTrack: (trackId: string | null) => set({ selectedTrackId: trackId }),

    toggleSnapping: () =>
      set((state) => ({ isSnappingEnabled: !state.isSnappingEnabled })),

    setEditMode: (editMode: TimelineEditMode) => set({ editMode }),

    setSnapLineTime: (snapLineTime: number | null) => set({ snapLineTime }),

    setActiveDrawerTab: (tab: DrawerTab) => set({ activeDrawerTab: tab }),

    setPreviewMode: (mode: 'mobile-frame' | 'fullscreen-touch') =>
      set({ previewMode: mode }),

    setSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),

    setExportOpen: (open: boolean) => set({ isExportOpen: open }),

    setMediaBinOpen: (open: boolean) => set({ isMediaBinOpen: open }),

    setSlipModalOpen: (open: boolean) => set({ isSlipModalOpen: open }),

    setTrackManagerOpen: (open: boolean) => set({ isTrackManagerOpen: open }),

    undo: () => {
      historyManager.undo();
      get().syncHistoryState();
    },

    redo: () => {
      historyManager.redo();
      get().syncHistoryState();
    },

    syncHistoryState: () => {
      set({
        canUndo: historyManager.canUndo(),
        canRedo: historyManager.canRedo(),
        lastActionName: historyManager.getLastActionName(),
      });
    },
  };
});
