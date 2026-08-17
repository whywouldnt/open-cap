/**
 * OPEN-CAP SRT / VTT Subtitle Parser & Exporter
 * Full bidirectional SRT/VTT parsing, timing converter, and auto-caption styling
 */

import { Clip, TextContent, Track } from '@/types/project';

export interface SubtitleItem {
  id: string;
  startTime: number; // Seconds
  endTime: number; // Seconds
  duration: number; // Seconds
  text: string;
}

export class SubtitleParser {
  /**
   * Parses SRT file string into subtitle items
   */
  public static parseSRT(srtContent: string): SubtitleItem[] {
    const items: SubtitleItem[] = [];
    const blocks = srtContent.trim().split(/\r?\n\r?\n/);

    for (const block of blocks) {
      const lines = block.trim().split(/\r?\n/);
      if (lines.length < 2) continue;

      let timeLine = lines[1];
      let textLines = lines.slice(2);

      // Handle cases where index number is omitted
      if (lines[0].includes('-->')) {
        timeLine = lines[0];
        textLines = lines.slice(1);
      }

      const times = timeLine.split('-->').map((t) => t.trim());
      if (times.length !== 2) continue;

      const startTime = this.parseTimestamp(times[0]);
      const endTime = this.parseTimestamp(times[1]);
      const text = textLines.join('\n').replace(/<[^>]*>/g, '').trim();

      if (text && endTime > startTime) {
        items.push({
          id: `sub-${items.length + 1}-${Date.now()}`,
          startTime,
          endTime,
          duration: endTime - startTime,
          text,
        });
      }
    }

    return items;
  }

  /**
   * Exports subtitle track clips to standard SRT string
   */
  public static exportToSRT(clips: Clip[]): string {
    const sorted = [...clips]
      .filter((c) => c.textContent?.text)
      .sort((a, b) => a.startTime - b.startTime);

    return sorted
      .map((c, i) => {
        const start = this.formatSRTTimestamp(c.startTime);
        const end = this.formatSRTTimestamp(c.startTime + c.duration);
        return `${i + 1}\n${start} --> ${end}\n${c.textContent?.text || ''}\n`;
      })
      .join('\n');
  }

  /**
   * Converts "00:01:23,456" or "00:01:23.456" to seconds
   */
  private static parseTimestamp(ts: string): number {
    const normalized = ts.replace(',', '.');
    const parts = normalized.split(':').map(Number);

    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parseFloat(normalized) || 0;
  }

  /**
   * Formats seconds into "00:01:23,456" SRT timestamp format
   */
  private static formatSRTTimestamp(seconds: number): string {
    const totalMs = Math.round(seconds * 1000);
    const hrs = Math.floor(totalMs / 3600000);
    const mins = Math.floor((totalMs % 3600000) / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;

    return `${('00' + hrs).slice(-2)}:${('00' + mins).slice(-2)}:${('00' + secs).slice(-2)},${('000' + ms).slice(-3)}`;
  }
}
