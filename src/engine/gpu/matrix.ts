/**
 * OPEN-CAP Matrix & Transform Math
 * 3x3 and 4x4 matrix operations for GPU orthographic rendering
 */

import { Transform } from '@/types/project';

export class Matrix3x3 {
  // Column-major 3x3 matrix [m00, m10, m20, m01, m11, m21, m02, m12, m22]
  public elements: Float32Array;

  constructor() {
    this.elements = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);
  }

  public static identity(): Matrix3x3 {
    return new Matrix3x3();
  }

  /**
   * Creates a 3x3 transformation matrix from position, scale, rotation, and anchor
   */
  public static fromTransform(
    transform: Transform,
    viewportWidth: number,
    viewportHeight: number
  ): Float32Array {
    const rad = (transform.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const sx = transform.scaleX;
    const sy = transform.scaleY;

    // Convert pixel/percentage offset to normalized device coordinates (-1 to 1)
    const tx = (transform.x / viewportWidth) * 2;
    const ty = -(transform.y / viewportHeight) * 2;

    const m00 = cos * sx;
    const m01 = -sin * sy;
    const m02 = tx;

    const m10 = sin * sx;
    const m11 = cos * sy;
    const m12 = ty;

    const m20 = 0;
    const m21 = 0;
    const m22 = 1;

    return new Float32Array([
      m00, m10, m20, 0,
      m01, m11, m21, 0,
      m02, m12, m22, 0,
      0,   0,   0,   1,
    ]);
  }
}
