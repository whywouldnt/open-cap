import { ICommand } from './history';
import { Clip, Track, Transform, AudioSettings, SpeedCurve } from '@/types/project';
import { useProjectStore } from '@/store/projectStore';

/**
 * Helper to generate a unique ID
 */
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// -------------------------------------------------------------
// 1. ADD CLIP COMMAND
// -------------------------------------------------------------
export class AddClipCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  constructor(
    private trackId: string,
    private clip: Clip,
    description?: string
  ) {
    this.name = description || `Klip Ekle: ${clip.name}`;
  }

  public execute(): void {
    const store = useProjectStore.getState();
    store.addClipToTrack(this.trackId, this.clip);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.removeClipFromTrack(this.trackId, this.clip.id);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 2. DELETE CLIP COMMAND
// -------------------------------------------------------------
export class DeleteClipCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  constructor(
    private trackId: string,
    private clip: Clip,
    private clipIndex: number
  ) {
    this.name = `Klip Sil: ${clip.name}`;
  }

  public execute(): void {
    const store = useProjectStore.getState();
    store.removeClipFromTrack(this.trackId, this.clip.id);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.insertClipAt(this.trackId, this.clip, this.clipIndex);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 3. MOVE CLIP COMMAND
// -------------------------------------------------------------
export class MoveClipCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Klip Taşı';
  public timestamp: number = Date.now();

  constructor(
    private clipId: string,
    private prevTrackId: string,
    private prevStartTime: number,
    private nextTrackId: string,
    private nextStartTime: number
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.moveClip(this.clipId, this.prevTrackId, this.nextTrackId, this.nextStartTime);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.moveClip(this.clipId, this.nextTrackId, this.prevTrackId, this.prevStartTime);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 4. TRIM CLIP COMMAND
// -------------------------------------------------------------
export class TrimClipCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Klip Kırp';
  public timestamp: number = Date.now();

  constructor(
    private clipId: string,
    private prevTiming: { startTime: number; duration: number; sourceStartTime: number },
    private nextTiming: { startTime: number; duration: number; sourceStartTime: number }
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.updateClipTiming(this.clipId, this.nextTiming);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.updateClipTiming(this.clipId, this.prevTiming);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 5. SPLIT CLIP COMMAND (CapCut Split / Böl)
// -------------------------------------------------------------
export class SplitClipCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Klip Böl (Split)';
  public timestamp: number = Date.now();

  private originalClip: Clip;
  private firstPart: Clip;
  private secondPart: Clip;
  private trackId: string;

  constructor(originalClip: Clip, splitTimestamp: number) {
    this.originalClip = JSON.parse(JSON.stringify(originalClip));
    this.trackId = originalClip.trackId;

    const splitOffset = splitTimestamp - originalClip.startTime;
    const firstDuration = splitOffset;
    const secondDuration = originalClip.duration - splitOffset;

    this.firstPart = {
      ...originalClip,
      id: originalClip.id, // keep original ID for the first part
      duration: firstDuration,
    };

    this.secondPart = {
      ...originalClip,
      id: `clip-${uid()}`,
      startTime: splitTimestamp,
      duration: secondDuration,
      sourceStartTime: originalClip.sourceStartTime + splitOffset,
      name: `${originalClip.name} (Bölüm 2)`,
    };
  }

  public execute(): void {
    const store = useProjectStore.getState();
    store.replaceClipWithTwo(this.trackId, this.originalClip.id, this.firstPart, this.secondPart);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.restoreMergedClip(this.trackId, this.firstPart.id, this.secondPart.id, this.originalClip);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 6. TRANSFORM CLIP COMMAND
// -------------------------------------------------------------
export class TransformClipCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Klip Dönüştür (Transform)';
  public timestamp: number = Date.now();

  constructor(
    private clipId: string,
    private prevTransform: Transform,
    private nextTransform: Transform
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.updateClipTransform(this.clipId, this.nextTransform);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.updateClipTransform(this.clipId, this.prevTransform);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 7. AUDIO SETTINGS COMMAND
// -------------------------------------------------------------
export class UpdateAudioSettingsCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Ses Ayarları';
  public timestamp: number = Date.now();

  constructor(
    private clipId: string,
    private prevSettings: AudioSettings,
    private nextSettings: AudioSettings
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.updateClipAudioSettings(this.clipId, this.nextSettings);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.updateClipAudioSettings(this.clipId, this.prevSettings);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 8. ADD TRACK COMMAND
// -------------------------------------------------------------
export class AddTrackCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  constructor(private track: Track) {
    this.name = `Kanal Ekle: ${track.name}`;
  }

  public execute(): void {
    const store = useProjectStore.getState();
    store.addTrack(this.track);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.deleteTrack(this.track.id);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 8B. DELETE TRACK COMMAND
// -------------------------------------------------------------
export class DeleteTrackCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  private track: Track;
  private trackIndex: number;

  constructor(trackId: string) {
    const store = useProjectStore.getState();
    const t = store.getTrackById(trackId);
    this.track = t ? JSON.parse(JSON.stringify(t)) : null;
    this.trackIndex = store.project.tracks.findIndex((x) => x.id === trackId);
    this.name = `Kanal Sil: ${this.track?.name || trackId}`;
  }

  public execute(): void {
    if (!this.track) return;
    const store = useProjectStore.getState();
    store.deleteTrack(this.track.id);
  }

  public undo(): void {
    if (!this.track) return;
    const store = useProjectStore.getState();
    store.addTrack(this.track);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 9. BATCH COMMAND (Multi-step atomic command)
// -------------------------------------------------------------
export class BatchCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  constructor(
    private commands: ICommand[],
    name: string = 'Toplu İşlem'
  ) {
    this.name = name;
  }

  public execute(): void {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }

  public undo(): void {
    // Undo in reverse execution order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  public redo(): void {
    for (const cmd of this.commands) {
      cmd.redo();
    }
  }
}

// -------------------------------------------------------------
// 10. RIPPLE DELETE COMMAND (Boşluksuz Silme)
// -------------------------------------------------------------
export class RippleDeleteCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  constructor(
    private trackId: string,
    private originalClips: Clip[],
    private updatedClips: Clip[],
    deletedClipName: string
  ) {
    this.name = `Boşluksuz Sil (Ripple): ${deletedClipName}`;
  }

  public execute(): void {
    const store = useProjectStore.getState();
    store.setTrackClips(this.trackId, this.updatedClips);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.setTrackClips(this.trackId, this.originalClips);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 11. RIPPLE TRIM COMMAND (Dalgalı Kırpma)
// -------------------------------------------------------------
export class RippleTrimCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Dalgalı Kırp (Ripple Trim)';
  public timestamp: number = Date.now();

  constructor(
    private trackId: string,
    private originalClips: Clip[],
    private updatedClips: Clip[]
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.setTrackClips(this.trackId, this.updatedClips);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.setTrackClips(this.trackId, this.originalClips);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 12. ROLL EDIT COMMAND (Bitişik Klip Kırpma)
// -------------------------------------------------------------
export class RollEditCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Çift Taraflı Kırp (Roll Edit)';
  public timestamp: number = Date.now();

  constructor(
    private trackId: string,
    private prevFirstClip: Clip,
    private prevSecondClip: Clip,
    private nextFirstClip: Clip,
    private nextSecondClip: Clip
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.nextFirstClip.id, {
      duration: this.nextFirstClip.duration,
    });
    store.updateClip(this.nextSecondClip.id, {
      startTime: this.nextSecondClip.startTime,
      duration: this.nextSecondClip.duration,
      sourceStartTime: this.nextSecondClip.sourceStartTime,
    });
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.prevFirstClip.id, {
      duration: this.prevFirstClip.duration,
    });
    store.updateClip(this.prevSecondClip.id, {
      startTime: this.prevSecondClip.startTime,
      duration: this.prevSecondClip.duration,
      sourceStartTime: this.prevSecondClip.sourceStartTime,
    });
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 13. SLIP EDIT COMMAND (Klip İçi Medya Kaydırma)
// -------------------------------------------------------------
export class SlipClipCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Kaynak Kaydır (Slip Edit)';
  public timestamp: number = Date.now();

  constructor(
    private clipId: string,
    private prevSourceStartTime: number,
    private nextSourceStartTime: number
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.clipId, {
      sourceStartTime: this.nextSourceStartTime,
    });
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.clipId, {
      sourceStartTime: this.prevSourceStartTime,
    });
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 14. CLOSE GAPS COMMAND (Manyetik Boşluk Kapatma)
// -------------------------------------------------------------
export class CloseGapsCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Boşlukları Kapat (Manyetik)';
  public timestamp: number = Date.now();

  constructor(
    private trackId: string,
    private originalClips: Clip[],
    private updatedClips: Clip[]
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.setTrackClips(this.trackId, this.updatedClips);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.setTrackClips(this.trackId, this.originalClips);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 15. REORDER TRACKS COMMAND (Kanal Sıralama)
// -------------------------------------------------------------
export class ReorderTracksCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Kanal Sırası Değiştir';
  public timestamp: number = Date.now();

  constructor(
    private fromIndex: number,
    private toIndex: number
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.reorderTracks(this.fromIndex, this.toIndex);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.reorderTracks(this.toIndex, this.fromIndex);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 16. SET CLIP SPEED COMMAND (Hız Ayarlama)
// -------------------------------------------------------------
export class SetClipSpeedCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  constructor(
    private clipId: string,
    private prevSpeed: number,
    private prevDuration: number,
    private nextSpeed: number,
    private nextDuration: number,
    private preservePitch?: boolean
  ) {
    this.name = `Hız Değiştir: ${nextSpeed.toFixed(1)}x`;
  }

  public execute(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.clipId, {
      speed: this.nextSpeed,
      duration: this.nextDuration,
      preservePitch: this.preservePitch,
    });
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.clipId, {
      speed: this.prevSpeed,
      duration: this.prevDuration,
    });
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 17. SET CLIP SPEED CURVE COMMAND (Hız Eğrisi)
// -------------------------------------------------------------
export class SetClipSpeedCurveCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  constructor(
    private clipId: string,
    private prevCurve: SpeedCurve | undefined,
    private prevDuration: number,
    private nextCurve: SpeedCurve,
    private nextDuration: number
  ) {
    this.name = `Hız Eğrisi: ${nextCurve.preset}`;
  }

  public execute(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.clipId, {
      speedCurve: this.nextCurve,
      duration: this.nextDuration,
    });
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.clipId, {
      speedCurve: this.prevCurve,
      duration: this.prevDuration,
    });
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 18. FREEZE FRAME COMMAND (Donma Karesi)
// -------------------------------------------------------------
export class FreezeFrameCommand implements ICommand {
  public id: string = uid();
  public name: string = 'Donma Karesi Ekle';
  public timestamp: number = Date.now();

  constructor(
    private trackId: string,
    private originalClips: Clip[],
    private updatedClips: Clip[]
  ) {}

  public execute(): void {
    const store = useProjectStore.getState();
    store.setTrackClips(this.trackId, this.updatedClips);
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.setTrackClips(this.trackId, this.originalClips);
  }

  public redo(): void {
    this.execute();
  }
}

// -------------------------------------------------------------
// 19. REVERSE CLIP COMMAND (Ters Oynat)
// -------------------------------------------------------------
export class ReverseClipCommand implements ICommand {
  public id: string = uid();
  public name: string;
  public timestamp: number = Date.now();

  constructor(
    private clipId: string,
    private prevReversed: boolean,
    private nextReversed: boolean
  ) {
    this.name = nextReversed ? 'Ters Oynatmayı Aç' : 'Ters Oynatmayı Kapat';
  }

  public execute(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.clipId, {
      isReversed: this.nextReversed,
    });
  }

  public undo(): void {
    const store = useProjectStore.getState();
    store.updateClip(this.clipId, {
      isReversed: this.prevReversed,
    });
  }

  public redo(): void {
    this.execute();
  }
}
