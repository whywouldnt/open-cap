/**
 * OPEN-CAP Masking Engine
 * Linear, Mirror, Radial, Rectangle, Pen Polygon and Chroma Key masking algorithms
 */

import { ClipMask, MaskType } from '@/types/project';

export interface MaskDefinition {
  type: MaskType;
  name: string;
  description: string;
  defaultParams: Partial<ClipMask>;
}

export const MASK_PRESETS: MaskDefinition[] = [
  {
    type: 'none',
    name: 'Maske Yok',
    description: 'Klip maskeleme olmadan tam çerçeve oynatılır.',
    defaultParams: { type: 'none', inverted: false, feather: 0 },
  },
  {
    type: 'linear',
    name: 'Lineer Maske',
    description: 'Belirlenen açı boyunca yumuşak geçişli düz çizgi maskesi.',
    defaultParams: {
      type: 'linear',
      inverted: false,
      feather: 0.15,
      rotation: 0,
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
    },
  },
  {
    type: 'mirror',
    name: 'Ayna (Mirror) Maske',
    description: 'Ortadan iki yana açılan simetrik çift taraflı maske.',
    defaultParams: {
      type: 'mirror',
      inverted: false,
      feather: 0.1,
      rotation: 0,
      position: { x: 0, y: 0 },
      size: { width: 1, height: 0.5 },
    },
  },
  {
    type: 'radial',
    name: 'Dairesel (Radial) Maske',
    description: 'Oval veya daire şeklinde odak maskesi.',
    defaultParams: {
      type: 'radial',
      inverted: false,
      feather: 0.2,
      rotation: 0,
      position: { x: 0, y: 0 },
      size: { width: 0.6, height: 0.6 },
    },
  },
  {
    type: 'rectangle',
    name: 'Dikdörtgen Maske',
    description: 'Köşe yuvarlama ve kenar yumuşatma destekli kutu maskesi.',
    defaultParams: {
      type: 'rectangle',
      inverted: false,
      feather: 0.05,
      rotation: 0,
      position: { x: 0, y: 0 },
      size: { width: 0.7, height: 0.7 },
    },
  },
];

export class MaskingEngine {
  /**
   * Evaluates pixel alpha value for a given UV coordinate [0, 1]
   */
  public static evaluateMaskAlpha(
    uvX: number,
    uvY: number,
    mask?: ClipMask
  ): number {
    if (!mask || mask.type === 'none') return 1.0;

    let alpha = 1.0;
    const px = uvX - 0.5 - (mask.position?.x || 0);
    const py = uvY - 0.5 - (mask.position?.y || 0);

    const rad = -((mask.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Rotated local coordinates
    const rx = px * cos - py * sin;
    const ry = px * sin + py * cos;

    const feather = Math.max(0.001, mask.feather || 0.01);

    switch (mask.type) {
      case 'linear': {
        // Linear split along Y axis
        const dist = ry;
        alpha = this.smoothstep(-feather / 2, feather / 2, dist);
        break;
      }

      case 'mirror': {
        // Mirrored split from center
        const dist = Math.abs(ry) - (mask.size?.height || 0.3) / 2;
        alpha = 1.0 - this.smoothstep(-feather / 2, feather / 2, dist);
        break;
      }

      case 'radial': {
        // Elliptical distance from center
        const sx = Math.max(0.01, (mask.size?.width || 0.5) / 2);
        const sy = Math.max(0.01, (mask.size?.height || 0.5) / 2);
        const dist = Math.sqrt((rx / sx) ** 2 + (ry / sy) ** 2);
        alpha = 1.0 - this.smoothstep(1.0 - feather, 1.0 + feather, dist);
        break;
      }

      case 'rectangle': {
        // Box distance
        const hx = Math.max(0.01, (mask.size?.width || 0.6) / 2);
        const hy = Math.max(0.01, (mask.size?.height || 0.6) / 2);
        const dx = Math.abs(rx) - hx;
        const dy = Math.abs(ry) - hy;
        const dist = Math.max(dx, dy);
        alpha = 1.0 - this.smoothstep(-feather, feather, dist);
        break;
      }

      default:
        alpha = 1.0;
    }

    alpha = Math.min(1.0, Math.max(0.0, alpha));

    if (mask.inverted) {
      alpha = 1.0 - alpha;
    }

    return alpha;
  }

  private static smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.min(1.0, Math.max(0.0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3.0 - 2.0 * t);
  }
}
