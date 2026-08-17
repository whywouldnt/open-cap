/**
 * OPEN-CAP Mobile LRU Frame Cache
 * Memory-bounded Least Recently Used cache for video frames & waveforms
 * Designed to prevent mobile OOM (Out Of Memory) issues during intensive scrubbing
 */

export interface CachedFrame {
  key: string;
  imageBitmap?: ImageBitmap | HTMLCanvasElement | string;
  waveform?: Float32Array | number[];
  sizeBytes: number;
  timestamp: number;
  lastAccessed: number;
}

export interface CacheStats {
  itemCount: number;
  maxItems: number;
  totalSizeBytes: number;
  maxSizeBytes: number;
  hits: number;
  misses: number;
  evictions: number;
}

export class LRUFrameCache {
  private cache: Map<string, CachedFrame> = new Map();
  private maxItems: number;
  private maxSizeBytes: number; // in bytes (e.g. 80 * 1024 * 1024 = 80MB)
  private currentSizeBytes: number = 0;
  private hits: number = 0;
  private misses: number = 0;
  private evictions: number = 0;

  constructor(maxItems: number = 120, maxSizeBytesMB: number = 80) {
    this.maxItems = maxItems;
    this.maxSizeBytes = maxSizeBytesMB * 1024 * 1024;
  }

  public get(mediaId: string, timestampSeconds: number): CachedFrame | null {
    const key = this.generateKey(mediaId, timestampSeconds);
    const item = this.cache.get(key);

    if (item) {
      this.hits++;
      item.lastAccessed = Date.now();
      // Re-insert to keep map insertion order representing access recency
      this.cache.delete(key);
      this.cache.set(key, item);
      return item;
    }

    this.misses++;
    return null;
  }

  public set(
    mediaId: string,
    timestampSeconds: number,
    data: {
      imageBitmap?: ImageBitmap | HTMLCanvasElement | string;
      waveform?: Float32Array | number[];
      estimatedSizeBytes?: number;
    }
  ): void {
    const key = this.generateKey(mediaId, timestampSeconds);
    const size = data.estimatedSizeBytes || this.estimateSize(data);

    // If item already exists, subtract previous size
    const existing = this.cache.get(key);
    if (existing) {
      this.currentSizeBytes -= existing.sizeBytes;
      this.cache.delete(key);
    }

    // Evict if over budget
    while (
      (this.cache.size >= this.maxItems ||
        this.currentSizeBytes + size > this.maxSizeBytes) &&
      this.cache.size > 0
    ) {
      this.evictOldest();
    }

    const newFrame: CachedFrame = {
      key,
      imageBitmap: data.imageBitmap,
      waveform: data.waveform,
      sizeBytes: size,
      timestamp: timestampSeconds,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, newFrame);
    this.currentSizeBytes += size;
  }

  public has(mediaId: string, timestampSeconds: number): boolean {
    const key = this.generateKey(mediaId, timestampSeconds);
    return this.cache.has(key);
  }

  /**
   * Evicts all cached frames and waveforms for a specific media ID
   */
  public evictMedia(mediaId: string): void {
    const keysToDelete: string[] = [];
    for (const [key, item] of this.cache.entries()) {
      if (key.startsWith(`${mediaId}@`)) {
        if (item.imageBitmap && typeof (item.imageBitmap as any).close === 'function') {
          try {
            (item.imageBitmap as ImageBitmap).close();
          } catch {}
        }
        this.currentSizeBytes -= item.sizeBytes;
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((k) => this.cache.delete(k));
  }

  /**
   * Alias for evictMedia to clean up resources when media is removed
   */
  public delete(mediaId: string): void {
    this.evictMedia(mediaId);
  }

  public clear(): void {
    // Clean up any ImageBitmap memory
    for (const item of this.cache.values()) {
      if (item.imageBitmap && typeof (item.imageBitmap as any).close === 'function') {
        try {
          (item.imageBitmap as ImageBitmap).close();
        } catch {
          // ignore
        }
      }
    }
    this.cache.clear();
    this.currentSizeBytes = 0;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  public getStats(): CacheStats {
    return {
      itemCount: this.cache.size,
      maxItems: this.maxItems,
      totalSizeBytes: this.currentSizeBytes,
      maxSizeBytes: this.maxSizeBytes,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
    };
  }

  private generateKey(mediaId: string, timestamp: number): string {
    // Quantize timestamp to 100ms (10fps preview resolution) to maximize cache hits during scrubbing
    const quantized = Math.round(timestamp * 10) / 10;
    return `${mediaId}@${quantized}s`;
  }

  private estimateSize(data: {
    imageBitmap?: ImageBitmap | HTMLCanvasElement | string;
    waveform?: Float32Array | number[];
  }): number {
    let size = 256; // base struct overhead
    if (data.imageBitmap) {
      if (typeof data.imageBitmap === 'string') {
        size += data.imageBitmap.length * 2; // UTF-16
      } else if (data.imageBitmap instanceof ImageBitmap || data.imageBitmap instanceof HTMLCanvasElement) {
        size += data.imageBitmap.width * data.imageBitmap.height * 4; // RGBA 4 bytes per px
      }
    }
    if (data.waveform) {
      size += data.waveform.length * 4; // Float32
    }
    return size;
  }

  private evictOldest(): void {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      const oldestItem = this.cache.get(oldestKey);
      if (oldestItem) {
        if (
          oldestItem.imageBitmap &&
          typeof (oldestItem.imageBitmap as any).close === 'function'
        ) {
          try {
            (oldestItem.imageBitmap as ImageBitmap).close();
          } catch {
            // ignore
          }
        }
        this.currentSizeBytes -= oldestItem.sizeBytes;
      }
      this.cache.delete(oldestKey);
      this.evictions++;
    }
  }
}

// Global Singleton for Frame Cache
export const globalFrameCache = new LRUFrameCache(120, 80);
