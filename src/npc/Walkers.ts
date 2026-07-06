/**
 * Walkers — ambient NPCs that make the café feel alive, like the
 * pedestrians in the reference: they stroll the sidewalk outside,
 * come in through the entrance, wander past the bar, and head out again.
 *
 * Waypoints are hand-placed to route through the door gap and around
 * furniture, so walkers don't need collision.
 */
import * as THREE from 'three/webgpu';
import { Avatar, createAvatar, randomConfig } from '../avatars/Avatar';

// Loop: sidewalk (outside, x>9) → door at (9, 2.5) → inside loop → back out
const PATH: THREE.Vector3[] = [
  new THREE.Vector3(11.5, 0, 6.5),
  new THREE.Vector3(11.0, 0, 2.6),
  new THREE.Vector3(9.0, 0, 2.5),   // ← the doorway
  new THREE.Vector3(7.0, 0, 1.8),
  new THREE.Vector3(4.5, 0, -0.5),
  new THREE.Vector3(1.5, 0, -3.2),  // pause-ish point near the bar
  new THREE.Vector3(-2.0, 0, -2.6),
  new THREE.Vector3(-1.5, 0, 0.8),
  new THREE.Vector3(2.0, 0, 2.2),
  new THREE.Vector3(6.5, 0, 2.4),
  new THREE.Vector3(9.0, 0, 2.5),   // ← out the door
  new THREE.Vector3(11.0, 0, 3.5),
  new THREE.Vector3(11.5, 0, -5.5), // stroll down the sidewalk
  new THREE.Vector3(11.5, 0, 6.5),
];

interface Walker {
  root: THREE.Group;
  avatar: Avatar;
  body: THREE.Group;  // avatar.root — rotated for facing
  seg: number;        // current path segment
  segT: number;       // 0..1 along segment
  speed: number;
  walkPhase: number;
}

export class Walkers {
  root = new THREE.Group();
  private walkers: Walker[] = [];

  constructor(count = 4) {
    for (let i = 0; i < count; i++) {
      const avatar = createAvatar(randomConfig(i * 977 + 13));
      const root = new THREE.Group();
      root.add(avatar.root);
      this.root.add(root);

      // spread walkers around the loop
      const seg = Math.floor((i / count) * PATH.length);
      this.walkers.push({
        root,
        avatar,
        body: avatar.root,
        seg: seg % (PATH.length - 1),
        segT: Math.random(),
        speed: 0.9 + Math.random() * 0.5,
        walkPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(dt: number, _t: number) {
    for (const w of this.walkers) {
      const a = PATH[w.seg];
      const b = PATH[(w.seg + 1) % PATH.length];
      const segLen = a.distanceTo(b);
      w.segT += (w.speed * dt) / Math.max(segLen, 0.001);

      while (w.segT >= 1) {
        w.segT -= 1;
        w.seg = (w.seg + 1) % (PATH.length - 1);
      }

      const na = PATH[w.seg];
      const nb = PATH[(w.seg + 1) % PATH.length];
      w.root.position.lerpVectors(na, nb, w.segT);

      // face walking direction, smoothed
      const target = Math.atan2(nb.x - na.x, nb.z - na.z);
      let delta = target - w.body.rotation.y;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      w.body.rotation.y += delta * Math.min(1, 10 * dt);

      // animate the stride from actual walking speed
      w.walkPhase += dt * w.speed * 6.5;
      w.avatar.setWalkPhase(w.walkPhase, 1);
    }
  }
}
