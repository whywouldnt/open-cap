/**
 * OPEN-CAP 3D LUT (.cube) Parser & Cinematic Look Library
 * Parses DaVinci Resolve / Adobe .cube files and generates 3D LUT color grading arrays
 */

export interface LUTPreset {
  id: string;
  name: string;
  category: 'Hollywood' | 'Analog Film' | 'Vintage' | 'Cyberpunk' | 'Monochrome';
  description: string;
  previewColor: string;
  cubeData?: string;
}

export const BUILTIN_LUTS: LUTPreset[] = [
  {
    id: 'none',
    name: 'LUT Yok (Doğal)',
    category: 'Hollywood',
    description: 'Orijinal kamera renk profili.',
    previewColor: '#71717a',
  },
  {
    id: 'tealOrange',
    name: 'Teal & Orange Hollywood',
    category: 'Hollywood',
    description: 'Turuncu ten tonları ve turkuaz gölgelerle sinematik gişe filmi görünümü.',
    previewColor: '#06b6d4',
  },
  {
    id: 'kodakPortra',
    name: 'Kodak Portra 400',
    category: 'Analog Film',
    description: 'Yumuşak pastel ten tonları ve analog fotoğraf hissi.',
    previewColor: '#f59e0b',
  },
  {
    id: 'fujiVelvia',
    name: 'Fuji Velvia 50',
    category: 'Analog Film',
    description: 'Canlı doğa renkleri, derin yeşiller ve zengin doygunluk.',
    previewColor: '#10b981',
  },
  {
    id: 'cyberpunkNeon',
    name: 'Cyberpunk Neon Matrix',
    category: 'Cyberpunk',
    description: 'Gece sahneleri için neon mor ve elektrik mavisi tonlama.',
    previewColor: '#a855f7',
  },
  {
    id: 'vintageWarm70s',
    name: '1970s Sıcak Nostalji',
    category: 'Vintage',
    description: 'Sıcak sarımsı retro renk paleti ve yumuşak siyahlar.',
    previewColor: '#d97706',
  },
  {
    id: 'noirMonochrome',
    name: 'Sinema Noir (High Contrast B&W)',
    category: 'Monochrome',
    description: 'Klasik dedektif ve polisiye filmleri için derin gölgeli siyah-beyaz.',
    previewColor: '#ffffff',
  },
  {
    id: 'bleachBypass',
    name: 'Bleach Bypass (Aksiyon Grisi)',
    category: 'Hollywood',
    description: 'Düşük doygunluk, gümüşi parlaklık ve yüksek kontrast.',
    previewColor: '#94a3b8',
  },
];

export class LUTParser {
  /**
   * Parses standard .cube file content
   */
  public static parseCube(cubeString: string): {
    title: string;
    size: number;
    data: Float32Array;
  } {
    const lines = cubeString.split(/\r?\n/);
    let title = 'Untitled LUT';
    let size = 32;
    const dataPoints: number[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('TITLE')) {
        title = line.replace('TITLE', '').replace(/"/g, '').trim();
      } else if (line.startsWith('LUT_3D_SIZE')) {
        size = parseInt(line.split(/\s+/)[1], 10) || 32;
      } else {
        const parts = line.split(/\s+/).map(Number);
        if (parts.length === 3 && !isNaN(parts[0])) {
          dataPoints.push(parts[0], parts[1], parts[2], 1.0);
        }
      }
    }

    return {
      title,
      size,
      data: new Float32Array(dataPoints),
    };
  }

  /**
   * Samples a 3D LUT Float32Array using true 3D Trilinear Interpolation
   * @param lutData Float32Array containing RGBA 3D LUT points
   * @param size Grid dimension (e.g. 32)
   * @param r Normalized red [0.0 - 1.0]
   * @param g Normalized green [0.0 - 1.0]
   * @param b Normalized blue [0.0 - 1.0]
   */
  public static sample3DLUT(
    lutData: Float32Array,
    size: number,
    r: number,
    g: number,
    b: number
  ): [number, number, number] {
    const maxIdx = size - 1;
    const rx = Math.max(0, Math.min(maxIdx, r * maxIdx));
    const gy = Math.max(0, Math.min(maxIdx, g * maxIdx));
    const bz = Math.max(0, Math.min(maxIdx, b * maxIdx));

    const r0 = Math.floor(rx);
    const r1 = Math.min(maxIdx, r0 + 1);
    const dr = rx - r0;

    const g0 = Math.floor(gy);
    const g1 = Math.min(maxIdx, g0 + 1);
    const dg = gy - g0;

    const b0 = Math.floor(bz);
    const b1 = Math.min(maxIdx, b0 + 1);
    const db = bz - b0;

    const getPixel = (ri: number, gi: number, bi: number): [number, number, number] => {
      // Standard .cube coordinate indexing: r changes fastest, then g, then b
      const idx = (bi * size * size + gi * size + ri) * 4;
      return [lutData[idx] || 0, lutData[idx + 1] || 0, lutData[idx + 2] || 0];
    };

    // 8 cube corners for trilinear interpolation
    const c000 = getPixel(r0, g0, b0);
    const c100 = getPixel(r1, g0, b0);
    const c010 = getPixel(r0, g1, b0);
    const c110 = getPixel(r1, g1, b0);
    const c001 = getPixel(r0, g0, b1);
    const c101 = getPixel(r1, g0, b1);
    const c011 = getPixel(r0, g1, b1);
    const c111 = getPixel(r1, g1, b1);

    const lerp = (v0: number, v1: number, t: number) => v0 + t * (v1 - v0);

    const out: [number, number, number] = [0, 0, 0];
    for (let c = 0; c < 3; c++) {
      const c00 = lerp(c000[c], c100[c], dr);
      const c01 = lerp(c001[c], c101[c], dr);
      const c10 = lerp(c010[c], c110[c], dr);
      const c11 = lerp(c011[c], c111[c], dr);

      const c0 = lerp(c00, c10, dg);
      const c1 = lerp(c01, c11, dg);

      out[c] = lerp(c0, c1, db);
    }

    return out;
  }

  /**
   * Applies simulated LUT color transformation on an RGBA pixel [r, g, b, a] in 0-255 range
   */
  public static applyPresetToRGB(
    r: number,
    g: number,
    b: number,
    presetId: string
  ): [number, number, number] {
    let nr = r / 255;
    let ng = g / 255;
    let nb = b / 255;

    switch (presetId) {
      case 'tealOrange': {
        // Boost orange in highlights, teal in shadows
        const lum = 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;
        nr = nr + (1 - lum) * -0.1 + lum * 0.15;
        ng = ng + (1 - lum) * 0.05 + lum * 0.02;
        nb = nb + (1 - lum) * 0.2 + lum * -0.15;
        break;
      }

      case 'kodakPortra': {
        nr = nr * 1.05 + 0.02;
        ng = ng * 0.98 + 0.01;
        nb = nb * 0.92;
        break;
      }

      case 'fujiVelvia': {
        nr = Math.pow(nr, 0.9) * 1.1;
        ng = Math.pow(ng, 0.85) * 1.15;
        nb = Math.pow(nb, 0.9) * 1.05;
        break;
      }

      case 'cyberpunkNeon': {
        nr = nr * 1.2;
        ng = ng * 0.7;
        nb = nb * 1.4 + 0.05;
        break;
      }

      case 'vintageWarm70s': {
        nr = nr * 1.1 + 0.05;
        ng = ng * 1.02 + 0.02;
        nb = nb * 0.8;
        break;
      }

      case 'noirMonochrome': {
        const gray = 0.299 * nr + 0.587 * ng + 0.114 * nb;
        const contrast = (gray - 0.5) * 1.4 + 0.5;
        nr = contrast;
        ng = contrast;
        nb = contrast;
        break;
      }

      case 'bleachBypass': {
        const lum = 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;
        nr = (nr + lum) * 0.5;
        ng = (ng + lum) * 0.5;
        nb = (nb + lum) * 0.5;
        break;
      }
    }

    return [
      Math.min(255, Math.max(0, Math.round(nr * 255))),
      Math.min(255, Math.max(0, Math.round(ng * 255))),
      Math.min(255, Math.max(0, Math.round(nb * 255))),
    ];
  }
}
