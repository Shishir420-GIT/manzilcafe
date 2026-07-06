/**
 * Input — keyboard + pointer-drag state. Pure state container;
 * systems read from it each frame.
 */
export class Input {
  keys = new Set<string>();
  /** accumulated drag deltas since last consume */
  dragX = 0;
  dragY = 0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private pressedThisFrame = new Set<string>();

  constructor() {
    const fromTextField = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      return t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t.isContentEditable;
    };
    window.addEventListener('keydown', (e) => {
      if (e.repeat || fromTextField(e)) return;
      this.keys.add(e.code);
      this.pressedThisFrame.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    window.addEventListener('pointerdown', (e) => {
      // ignore drags that start on UI (dialogue etc.)
      if ((e.target as HTMLElement).closest('#dialogue')) return;
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });
    window.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      this.dragX += e.clientX - this.lastX;
      this.dragY += e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });
    window.addEventListener('pointerup', () => (this.dragging = false));
  }

  /** true only on the frame the key went down */
  justPressed(code: string) {
    return this.pressedThisFrame.has(code);
  }

  /** read & reset accumulated drag */
  consumeDrag() {
    const d = { x: this.dragX, y: this.dragY };
    this.dragX = 0;
    this.dragY = 0;
    return d;
  }

  /** call at end of frame */
  endFrame() {
    this.pressedThisFrame.clear();
  }
}
