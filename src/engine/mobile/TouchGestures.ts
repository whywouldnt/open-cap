/**
 * OPEN-CAP Multi-Touch Gestures Engine
 * Recognizes pinch-to-zoom, two-finger rotation, pan velocity, and long-press haptics
 */

import { HapticEngine } from './HapticEngine';

export interface TouchGestureState {
  scale: number; // Delta scale from pinch
  rotation: number; // Delta rotation in degrees
  panX: number;
  panY: number;
  isPinching: boolean;
}

export class TouchGestures {
  private static initialDistance: number = 0;
  private static initialAngle: number = 0;
  private static initialScale: number = 1.0;
  private static longPressTimer: any = null;

  /**
   * Calculates distance between two touch points
   */
  public static getTouchDistance(touch1: React.Touch | Touch, touch2: React.Touch | Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates angle between two touch points in degrees
   */
  public static getTouchAngle(touch1: React.Touch | Touch, touch2: React.Touch | Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

  /**
   * Starts two-finger pinch gesture
   */
  public static startPinch(touch1: Touch, touch2: Touch, currentScale: number) {
    this.initialDistance = this.getTouchDistance(touch1, touch2);
    this.initialAngle = this.getTouchAngle(touch1, touch2);
    this.initialScale = currentScale;
    HapticEngine.snapTick();
  }

  /**
   * Calculates current scale multiplier from active pinch
   */
  public static updatePinch(touch1: Touch, touch2: Touch): { scale: number; deltaRotation: number } {
    if (this.initialDistance <= 0) return { scale: this.initialScale, deltaRotation: 0 };

    const currentDist = this.getTouchDistance(touch1, touch2);
    const currentAngle = this.getTouchAngle(touch1, touch2);

    const scaleFactor = currentDist / this.initialDistance;
    const newScale = Math.max(0.2, Math.min(5.0, this.initialScale * scaleFactor));
    const deltaRot = currentAngle - this.initialAngle;

    return {
      scale: newScale,
      deltaRotation: deltaRot,
    };
  }

  /**
   * Starts a long press listener with haptic impact heavy on trigger
   */
  public static startLongPress(onTrigger: () => void, delayMs: number = 400) {
    this.cancelLongPress();
    this.longPressTimer = setTimeout(() => {
      HapticEngine.impactHeavy();
      onTrigger();
    }, delayMs);
  }

  public static cancelLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}
