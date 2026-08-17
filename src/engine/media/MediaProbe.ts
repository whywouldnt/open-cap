import { ProjectMediaItem, MediaType } from '@/types/project';
import { WaveformExtractor } from './WaveformExtractor';

export class MediaProbe {
  /**
   * Probe a browser File or Blob to extract comprehensive media metadata
   */
  public static async probeBrowserFile(file: File): Promise<ProjectMediaItem> {
    const mediaType = this.detectMediaType(file.type, file.name);
    const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const objectUrl = URL.createObjectURL(file);

    try {
      if (mediaType === 'video') {
        return await this.probeVideo(file, objectUrl, mediaId);
      } else if (mediaType === 'audio') {
        return await this.probeAudio(file, objectUrl, mediaId);
      } else {
        return await this.probeImage(file, objectUrl, mediaId);
      }
    } finally {
      // Don't revoke immediately if thumbnail needs it, but base64 thumbnails are generated
    }
  }

  private static detectMediaType(mimeType: string, fileName: string): MediaType {
    if (mimeType.startsWith('video/') || /\.(mp4|mov|mkv|webm|avi|flv|m4v)$/i.test(fileName)) {
      return 'video';
    }
    if (mimeType.startsWith('audio/') || /\.(mp3|wav|aac|m4a|ogg|flac|wma)$/i.test(fileName)) {
      return 'audio';
    }
    return 'image';
  }

  private static async probeVideo(
    file: File,
    objectUrl: string,
    id: string
  ): Promise<ProjectMediaItem> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1.0, video.duration * 0.2);
      };

      video.onseeked = async () => {
        // Capture thumbnail via canvas
        let thumbnailUri = '';
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 180;
          canvas.height = Math.round((180 * (video.videoHeight || 1920)) / (video.videoWidth || 1080));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            thumbnailUri = canvas.toDataURL('image/jpeg', 0.8);
          }
        } catch (e) {
          console.warn('Video thumbnail capture warning:', e);
        }

        // Try extracting audio waveform if available
        let waveform: number[] | undefined;
        try {
          waveform = await WaveformExtractor.extractWaveformFromBlob(file, 48);
        } catch {
          waveform = WaveformExtractor.generateSyntheticWaveform(48);
        }

        const codec = file.name.endsWith('.mov')
          ? 'Apple ProRes / H.264'
          : file.name.endsWith('.webm')
          ? 'VP9 / AV1'
          : 'H.264 / AVC';

        resolve({
          id,
          name: file.name,
          path: objectUrl,
          mimeType: file.type || 'video/mp4',
          mediaType: 'video',
          size: file.size,
          duration: Math.max(0.5, video.duration || 5.0),
          width: video.videoWidth || 1080,
          height: video.videoHeight || 1920,
          fps: 60,
          codec,
          audioChannels: 2,
          sampleRate: 48000,
          bitrate: Math.round((file.size * 8) / (video.duration || 1)),
          thumbnailUri,
          thumbnails: thumbnailUri ? [thumbnailUri] : [],
          waveform,
          createdAt: new Date().toISOString(),
        });
      };

      video.onerror = () => {
        // Fallback for unsupported codecs or browser errors
        resolve({
          id,
          name: file.name,
          path: objectUrl,
          mimeType: file.type || 'video/mp4',
          mediaType: 'video',
          size: file.size,
          duration: 5.0,
          width: 1080,
          height: 1920,
          fps: 30,
          codec: 'H.264 / Generic',
          thumbnailUri: '',
          waveform: WaveformExtractor.generateSyntheticWaveform(48),
          createdAt: new Date().toISOString(),
        });
      };
    });
  }

  private static async probeAudio(
    file: File,
    objectUrl: string,
    id: string
  ): Promise<ProjectMediaItem> {
    const waveform = await WaveformExtractor.extractWaveformFromBlob(file, 64);

    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = objectUrl;

      audio.onloadedmetadata = () => {
        const codec = file.name.endsWith('.wav')
          ? 'PCM WAV (16/24-bit)'
          : file.name.endsWith('.aac') || file.name.endsWith('.m4a')
          ? 'AAC-LC'
          : 'MP3 (MPEG Audio)';

        resolve({
          id,
          name: file.name,
          path: objectUrl,
          mimeType: file.type || 'audio/wav',
          mediaType: 'audio',
          size: file.size,
          duration: Math.max(0.5, audio.duration || 10.0),
          codec,
          audioChannels: 2,
          sampleRate: 48000,
          bitrate: Math.round((file.size * 8) / (audio.duration || 1)),
          waveform,
          createdAt: new Date().toISOString(),
        });
      };

      audio.onerror = () => {
        resolve({
          id,
          name: file.name,
          path: objectUrl,
          mimeType: file.type || 'audio/mpeg',
          mediaType: 'audio',
          size: file.size,
          duration: 15.0,
          codec: 'Audio / Fallback',
          audioChannels: 2,
          sampleRate: 44100,
          waveform,
          createdAt: new Date().toISOString(),
        });
      };
    });
  }

  private static async probeImage(
    file: File,
    objectUrl: string,
    id: string
  ): Promise<ProjectMediaItem> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = objectUrl;

      img.onload = () => {
        resolve({
          id,
          name: file.name,
          path: objectUrl,
          mimeType: file.type || 'image/png',
          mediaType: 'image',
          size: file.size,
          duration: 3.0, // Default 3s still photo timeline duration
          width: img.naturalWidth || 1080,
          height: img.naturalHeight || 1920,
          codec: file.name.split('.').pop()?.toUpperCase() || 'PNG',
          thumbnailUri: objectUrl,
          createdAt: new Date().toISOString(),
        });
      };

      img.onerror = () => {
        resolve({
          id,
          name: file.name,
          path: objectUrl,
          mimeType: file.type || 'image/png',
          mediaType: 'image',
          size: file.size,
          duration: 3.0,
          width: 1080,
          height: 1920,
          thumbnailUri: objectUrl,
          createdAt: new Date().toISOString(),
        });
      };
    });
  }
}
