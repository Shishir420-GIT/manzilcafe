/**
 * InteractionSystem — proximity-based interactables.
 * Nearest one in range shows a prompt; E activates it.
 */
import * as THREE from 'three/webgpu';
import { PlayerController } from '../player/PlayerController';
import { HUD } from '../ui/HUD';
import { Input } from '../core/Input';

export interface Interactable {
  id: string;
  position: THREE.Vector3;
  radius: number;
  label: string;
  onActivate: () => void;
  /** optional: when true, show activeLabel instead (e.g. "Stand up") */
  isActive?: () => boolean;
  activeLabel?: string;
}

export class InteractionSystem {
  private items: Interactable[] = [];

  constructor(
    private player: PlayerController,
    private hud: HUD,
    private input: Input,
  ) {}

  register(item: Interactable) {
    this.items.push(item);
  }

  update() {
    let best: Interactable | null = null;
    let bestDist = Infinity;

    // While sitting, only the seat we can stand from is relevant
    for (const item of this.items) {
      const d = item.position.distanceTo(this.player.position);
      if (d < item.radius && d < bestDist) {
        if (this.player.isSitting && !(item.isActive && item.isActive())) continue;
        best = item;
        bestDist = d;
      }
    }

    if (best) {
      const active = best.isActive?.() ?? false;
      this.hud.showPrompt(active && best.activeLabel ? best.activeLabel : best.label);
      if (this.input.justPressed('KeyE')) best.onActivate();
    } else {
      this.hud.hidePrompt();
    }
  }
}
