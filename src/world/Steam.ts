/**
 * Steam — small CPU-animated puffs rising from emitters
 * (espresso machine, coffee cups), like the wisps in the reference art.
 */
import * as THREE from 'three/webgpu';

interface Puff {
  mesh: THREE.Mesh;
  emitter: THREE.Vector3;
  phase: number;
  speed: number;
}

const LIFE = 2.2; // seconds per rise cycle
const RISE = 0.7;

export class Steam {
  root = new THREE.Group();
  private puffs: Puff[] = [];
  private t = 0;

  constructor(emitters: THREE.Vector3[], puffsPerEmitter = 3) {
    const geo = new THREE.SphereGeometry(0.05, 8, 6);
    for (const emitter of emitters) {
      for (let i = 0; i < puffsPerEmitter; i++) {
        const mat = new THREE.MeshBasicNodeMaterial();
        mat.color = new THREE.Color(0xfff6e8);
        mat.transparent = true;
        mat.depthWrite = false;
        mat.opacity = 0;
        const mesh = new THREE.Mesh(geo, mat);
        this.root.add(mesh);
        this.puffs.push({
          mesh,
          emitter,
          phase: (i / puffsPerEmitter) * LIFE + Math.random() * 0.5,
          speed: 0.85 + Math.random() * 0.3,
        });
      }
    }
  }

  update(dt: number) {
    this.t += dt;
    for (const p of this.puffs) {
      const life = ((this.t * p.speed + p.phase) % LIFE) / LIFE; // 0..1
      const wobble = Math.sin((this.t + p.phase) * 3.0) * 0.04;
      p.mesh.position.set(
        p.emitter.x + wobble,
        p.emitter.y + life * RISE,
        p.emitter.z + Math.cos((this.t + p.phase) * 2.3) * 0.03,
      );
      const s = 0.6 + life * 1.6;
      p.mesh.scale.set(s, s, s);
      // fade in fast, fade out slow
      (p.mesh.material as THREE.MeshBasicNodeMaterial).opacity =
        Math.min(life * 4, 1) * (1 - life) * 0.5;
    }
  }
}
