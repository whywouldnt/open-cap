/**
 * OPEN-CAP Mobile Haptic Feedback Engine
 * Ultra low-latency tactile vibrations for magnetic snapping, cuts, and scrubbing
 */

export class HapticEngine {
  private static isEnabled: boolean = true;

  public static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public static getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Light vibration tick for magnetic snapping to playhead, clip edges, or beat markers
   */
  public static snapTick() {
    if (!this.isEnabled || typeof navigator === 'undefined') return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate(8); // 8ms crisp micro-tick
      }
    } catch (e) {
      // Ignore vibration errors
    }
  }

  /**
   * Medium vibration for button taps, split, and tool selection
   */
  public static impactMedium() {
    if (!this.isEnabled || typeof navigator === 'undefined') return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate(18);
      }
    } catch (e) {}
  }

  /**
   * Heavy vibration for clip drag start, long press, or ripple delete
   */
  public static impactHeavy() {
    if (!this.isEnabled || typeof navigator === 'undefined') return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate(35);
      }
    } catch (e) {}
  }

  /**
   * Success pattern for export completed and project saved
   */
  public static notificationSuccess() {
    if (!this.isEnabled || typeof navigator === 'undefined') return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate([15, 60, 25]); // Dual celebratory pulse
      }
    } catch (e) {}
  }

  /**
   * Warning / Error vibration pattern
   */
  public static notificationError() {
    if (!this.isEnabled || typeof navigator === 'undefined') return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate([30, 40, 30, 40, 50]);
      }
    } catch (e) {}
  }
}
