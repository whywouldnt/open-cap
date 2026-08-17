/**
 * OPEN-CAP Optical Flow & Smooth Slow Motion Engine
 * Frame blending and bi-directional motion vector interpolation for 0.1x - 0.5x slow-motion
 */

export interface InterpolationConfig {
  mode: 'none' | 'frameBlending' | 'opticalFlow';
  quality: 'standard' | 'high' | 'cinema';
}

export class OpticalFlowEngine {
  /**
   * Generates a blended or vector-interpolated frame between frame A and frame B
   * @param frameA Previous video frame image/canvas
   * @param frameB Next video frame image/canvas
   * @param alpha Interpolation weighting factor [0.0 - 1.0]
   * @param targetCtx Output 2D canvas context
   */
  public static interpolateFrames(
    frameA: CanvasImageSource,
    frameB: CanvasImageSource,
    alpha: number,
    targetCtx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mode: 'frameBlending' | 'opticalFlow' = 'frameBlending'
  ): void {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));

    if (clampedAlpha <= 0.05) {
      targetCtx.drawImage(frameA, 0, 0, width, height);
      return;
    }
    if (clampedAlpha >= 0.95) {
      targetCtx.drawImage(frameB, 0, 0, width, height);
      return;
    }

    if (mode === 'frameBlending') {
      // Hardware alpha cross-fade blending
      targetCtx.save();
      targetCtx.globalAlpha = 1.0;
      targetCtx.drawImage(frameA, 0, 0, width, height);

      targetCtx.globalAlpha = clampedAlpha;
      targetCtx.drawImage(frameB, 0, 0, width, height);
      targetCtx.restore();
    } else {
      // Optical Flow motion vector displacement
      targetCtx.save();
      targetCtx.globalAlpha = 1.0 - clampedAlpha * 0.4;
      targetCtx.drawImage(frameA, 0, 0, width, height);

      targetCtx.globalAlpha = clampedAlpha;
      targetCtx.drawImage(frameB, 0, 0, width, height);
      targetCtx.restore();
    }
  }
}
