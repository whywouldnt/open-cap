/**
 * Frame-accurate timecode formatting utility for OPEN-CAP Mobile
 */

export function formatTimecode(seconds: number, fps: number = 60): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;

  const totalFrames = Math.floor(seconds * fps);
  const frames = totalFrames % fps;
  const totalSeconds = Math.floor(seconds);
  const secs = totalSeconds % 60;
  const mins = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number, z: number = 2) => ('00' + n).slice(-z);

  return `${pad(hours)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const totalSeconds = Math.floor(seconds);
  const secs = totalSeconds % 60;
  const mins = Math.floor(totalSeconds / 60);
  const ms = Math.floor((seconds % 1) * 10);

  const pad = (n: number) => ('00' + n).slice(-2);
  return `${pad(mins)}:${pad(secs)}.${ms}s`;
}

export function parseTimecode(tc: string, fps: number = 60): number {
  const parts = tc.split(':').map(Number);
  if (parts.length !== 4) return 0;
  const [hours, mins, secs, frames] = parts;
  return hours * 3600 + mins * 60 + secs + frames / fps;
}
