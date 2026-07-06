/**
 * Bartender — the café's NPC. Stands behind the bar, idles,
 * turns to face the player when near, and opens a dialogue on E.
 *
 * askAI() is the seam where the existing ManzilCafe Gemini
 * integration (src/lib/gemini.ts in the old repo) plugs in:
 * replace the canned responses with a call to your endpoint,
 * keeping the same security/rate-limit wrappers.
 */
import * as THREE from 'three/webgpu';
import { createAvatar, baristaConfig } from '../avatars/Avatar';
import { Interactable } from '../systems/Interactions';
import { HUD } from '../ui/HUD';

const CANNED = [
  'Welcome to Manzil! First visit? The house special is a cardamom latte.',
  'Take any seat you like — the window tables get the best light.',
  "I'd recommend the masala chai if you're here to unwind.",
  'Regulars say the corner table is lucky. No promises though.',
  'One cardamom latte, coming right up. Well — once the kitchen is wired in.',
];

export class Bartender {
  root = new THREE.Group();
  private body: THREE.Group;
  private baseY = 0;
  private cannedIndex = 0;

  constructor(position: THREE.Vector3) {
    const avatar = createAvatar(baristaConfig());
    this.body = avatar.root;
    this.root.add(this.body);
    this.root.position.copy(position);
  }

  interactable(hud: HUD): Interactable {
    return {
      id: 'bartender',
      position: this.root.position,
      radius: 2.6,
      label: 'Talk to the Barista',
      onActivate: () => {
        hud.openDialogue('BARISTA', (playerText) => this.askAI(playerText));
        hud.pushNpcMessage('Hey there! What can I get you?');
      },
    };
  }

  /**
   * >>> AI INTEGRATION SEAM <<<
   * Swap this for the Gemini call from the original ManzilCafe:
   *   const reply = await generateBartenderResponse(playerText, context);
   * Keep aiSecurity.ts validation + rateLimiter.ts in front of it.
   */
  private async askAI(_playerText: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 450)); // simulate latency
    const reply = CANNED[this.cannedIndex % CANNED.length];
    this.cannedIndex++;
    return reply;
  }

  update(t: number, playerPos: THREE.Vector3) {
    // idle breathing bob
    this.body.position.y = this.baseY + Math.sin(t * 1.6) * 0.02;

    // face the player when they're close
    const dx = playerPos.x - this.root.position.x;
    const dz = playerPos.z - this.root.position.z;
    if (dx * dx + dz * dz < 36) {
      const target = Math.atan2(dx, dz);
      let delta = target - this.body.rotation.y;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      this.body.rotation.y += delta * 0.06;
    }
  }
}
