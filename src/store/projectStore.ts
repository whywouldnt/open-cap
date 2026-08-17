import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Project,
  Track,
  Clip,
  Transform,
  AudioSettings,
  Resolution,
  ProjectMediaItem,
  createDefaultProject,
} from '@/types/project';

interface ProjectState {
  project: Project;
  isDirty: boolean;
  savedPath: string | null;

  // Setters & Actions
  setProject: (project: Project) => void;
  updateProjectMetadata: (name: string, resolution?: Resolution, fps?: number) => void;
  resetToDefault: () => void;

  // Track manipulation
  addTrack: (track: Track) => void;
  deleteTrack: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackHidden: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackClips: (trackId: string, clips: Clip[]) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;

  // Clip manipulation
  addClipToTrack: (trackId: string, clip: Clip) => void;
  removeClipFromTrack: (trackId: string, clipId: string) => void;
  insertClipAt: (trackId: string, clip: Clip, index: number) => void;
  moveClip: (clipId: string, fromTrackId: string, toTrackId: string, newStartTime: number) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  updateClipTiming: (
    clipId: string,
    timing: { startTime: number; duration: number; sourceStartTime: number }
  ) => void;
  updateClipTransform: (clipId: string, transform: Transform) => void;
  updateClipAudioSettings: (clipId: string, audioSettings: AudioSettings) => void;
  replaceClipWithTwo: (trackId: string, originalClipId: string, first: Clip, second: Clip) => void;
  restoreMergedClip: (trackId: string, firstId: string, secondId: string, original: Clip) => void;

  // Media bin manipulation
  addMediaToBin: (media: ProjectMediaItem) => void;
  removeMediaFromBin: (mediaId: string) => void;
  getMediaById: (mediaId: string) => ProjectMediaItem | null;

  // Helpers
  getClipById: (clipId: string) => { clip: Clip; track: Track; index: number } | null;
  getTrackById: (trackId: string) => Track | null;
  recalculateDuration: () => void;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    project: createDefaultProject(),
    isDirty: false,
    savedPath: null,

    setProject: (project: Project) =>
      set((state) => {
        state.project = project;
        state.isDirty = false;
      }),

    updateProjectMetadata: (name: string, resolution?: Resolution, fps?: number) =>
      set((state) => {
        state.project.name = name;
        if (resolution) state.project.resolution = resolution;
        if (fps) state.project.fps = fps;
        state.project.updatedAt = new Date().toISOString();
        state.isDirty = true;
      }),

    resetToDefault: () =>
      set((state) => {
        state.project = createDefaultProject();
        state.isDirty = false;
        state.savedPath = null;
      }),

    addTrack: (track: Track) =>
      set((state) => {
        state.project.tracks.push(track);
        state.isDirty = true;
      }),

    deleteTrack: (trackId: string) =>
      set((state) => {
        state.project.tracks = state.project.tracks.filter((t) => t.id !== trackId);
        state.isDirty = true;
      }),

    toggleTrackMute: (trackId: string) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) track.isMuted = !track.isMuted;
      }),

    toggleTrackLock: (trackId: string) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) track.isLocked = !track.isLocked;
      }),

    toggleTrackHidden: (trackId: string) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) track.isHidden = !track.isHidden;
      }),

    toggleTrackSolo: (trackId: string) =>
      set((state) => {
        const targetTrack = state.project.tracks.find((t) => t.id === trackId);
        if (!targetTrack) return;
        const willSolo = !targetTrack.isMuted;
        for (const t of state.project.tracks) {
          if (t.id === trackId) {
            t.isMuted = false;
          } else {
            t.isMuted = willSolo;
          }
        }
      }),

    setTrackVolume: (trackId: string, volume: number) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) track.volume = Math.max(0, Math.min(2.0, volume));
      }),

    setTrackClips: (trackId: string, clips: Clip[]) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) {
          track.clips = clips;
          state.isDirty = true;
        }
        get().recalculateDuration();
      }),

    reorderTracks: (startIndex: number, endIndex: number) =>
      set((state) => {
        const len = state.project.tracks.length;
        if (startIndex < 0 || startIndex >= len || endIndex < 0 || endIndex >= len) return;
        const [removed] = state.project.tracks.splice(startIndex, 1);
        state.project.tracks.splice(endIndex, 0, removed);
        state.isDirty = true;
      }),

    updateClip: (clipId: string, updates: Partial<Clip>) =>
      set((state) => {
        for (const track of state.project.tracks) {
          const clip = track.clips.find((c) => c.id === clipId);
          if (clip) {
            Object.assign(clip, updates);
            state.isDirty = true;
            break;
          }
        }
        get().recalculateDuration();
      }),

    addClipToTrack: (trackId: string, clip: Clip) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) {
          track.clips.push(clip);
          state.isDirty = true;
        }
        get().recalculateDuration();
      }),

    removeClipFromTrack: (trackId: string, clipId: string) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) {
          track.clips = track.clips.filter((c) => c.id !== clipId);
          state.isDirty = true;
        }
        get().recalculateDuration();
      }),

    insertClipAt: (trackId: string, clip: Clip, index: number) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) {
          track.clips.splice(index, 0, clip);
          state.isDirty = true;
        }
        get().recalculateDuration();
      }),

    moveClip: (clipId: string, fromTrackId: string, toTrackId: string, newStartTime: number) =>
      set((state) => {
        const fromTrack = state.project.tracks.find((t) => t.id === fromTrackId);
        if (!fromTrack) return;

        const clipIndex = fromTrack.clips.findIndex((c) => c.id === clipId);
        if (clipIndex === -1) return;

        const [clip] = fromTrack.clips.splice(clipIndex, 1);
        clip.startTime = Math.max(0, newStartTime);
        clip.trackId = toTrackId;

        const toTrack = state.project.tracks.find((t) => t.id === toTrackId);
        if (toTrack) {
          toTrack.clips.push(clip);
          // Sort clips by startTime for timeline consistency
          toTrack.clips.sort((a, b) => a.startTime - b.startTime);
        }
        state.isDirty = true;
        get().recalculateDuration();
      }),

    updateClipTiming: (clipId: string, timing) =>
      set((state) => {
        for (const track of state.project.tracks) {
          const clip = track.clips.find((c) => c.id === clipId);
          if (clip) {
            clip.startTime = Math.max(0, timing.startTime);
            clip.duration = Math.max(0.1, timing.duration);
            clip.sourceStartTime = Math.max(0, timing.sourceStartTime);
            state.isDirty = true;
            break;
          }
        }
        get().recalculateDuration();
      }),

    updateClipTransform: (clipId: string, transform: Transform) =>
      set((state) => {
        for (const track of state.project.tracks) {
          const clip = track.clips.find((c) => c.id === clipId);
          if (clip) {
            clip.transform = { ...transform };
            state.isDirty = true;
            break;
          }
        }
      }),

    updateClipAudioSettings: (clipId: string, audioSettings: AudioSettings) =>
      set((state) => {
        for (const track of state.project.tracks) {
          const clip = track.clips.find((c) => c.id === clipId);
          if (clip) {
            clip.audioSettings = { ...audioSettings };
            state.isDirty = true;
            break;
          }
        }
      }),

    replaceClipWithTwo: (trackId: string, originalClipId: string, first: Clip, second: Clip) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) {
          const index = track.clips.findIndex((c) => c.id === originalClipId);
          if (index !== -1) {
            track.clips.splice(index, 1, first, second);
            state.isDirty = true;
          }
        }
        get().recalculateDuration();
      }),

    restoreMergedClip: (trackId: string, firstId: string, secondId: string, original: Clip) =>
      set((state) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) {
          const firstIdx = track.clips.findIndex((c) => c.id === firstId);
          track.clips = track.clips.filter((c) => c.id !== firstId && c.id !== secondId);
          if (firstIdx !== -1) {
            track.clips.splice(firstIdx, 0, original);
          } else {
            track.clips.push(original);
          }
          track.clips.sort((a, b) => a.startTime - b.startTime);
          state.isDirty = true;
        }
        get().recalculateDuration();
      }),

    addMediaToBin: (media: ProjectMediaItem) =>
      set((state) => {
        const exists = state.project.mediaBin.some((m) => m.id === media.id);
        if (!exists) {
          state.project.mediaBin.push(media);
          state.isDirty = true;
        }
      }),

    removeMediaFromBin: (mediaId: string) =>
      set((state) => {
        state.project.mediaBin = state.project.mediaBin.filter((m) => m.id !== mediaId);
        state.isDirty = true;
      }),

    getMediaById: (mediaId: string) => {
      const state = get();
      return state.project.mediaBin.find((m) => m.id === mediaId) || null;
    },

    getClipById: (clipId: string) => {
      const state = get();
      for (const track of state.project.tracks) {
        const index = track.clips.findIndex((c) => c.id === clipId);
        if (index !== -1) {
          return { clip: track.clips[index], track, index };
        }
      }
      return null;
    },

    getTrackById: (trackId: string) => {
      const state = get();
      return state.project.tracks.find((t) => t.id === trackId) || null;
    },

    recalculateDuration: () =>
      set((state) => {
        let maxEndTime = 5.0; // Minimum 5 seconds
        for (const track of state.project.tracks) {
          for (const clip of track.clips) {
            const end = clip.startTime + clip.duration;
            if (end > maxEndTime) {
              maxEndTime = end;
            }
          }
        }
        state.project.duration = Math.ceil(maxEndTime + 1.0); // Add 1s padding
      }),
  }))
);
