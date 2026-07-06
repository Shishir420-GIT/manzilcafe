/**
 * Ivy — instanced leaf clusters. Two generators:
 *  - wrapColumn(): helix of leaves climbing a pillar
 *  - garland(): sagging vine strung between two ceiling points
 * All leaves go into one InstancedMesh for a single draw call.
 */
import * as THREE from 'three/webgpu';
import { matte } from './Materials';

const _dummy = new THREE.Object3D();

export class IvyBuilder {
  private transforms: THREE.Matrix4[] = [];

  wrapColumn(base: THREE.Vector3, height: number, radius: number) {
    const turns = 3.5;
    const count = Math.floor(height * 26);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * turns * Math.PI * 2 + Math.sin(i * 12.9898) * 0.7;
      const r = radius + 0.05 + Math.random() * 0.05;
      _dummy.position.set(
        base.x + Math.cos(angle) * r,
        base.y + t * height,
        base.z + Math.sin(angle) * r,
      );
      this.pushLeaf();
    }
  }

  garland(a: THREE.Vector3, b: THREE.Vector3, sag = 0.5) {
    const count = Math.floor(a.distanceTo(b) * 9);
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      _dummy.position.lerpVectors(a, b, t);
      _dummy.position.y -= Math.sin(t * Math.PI) * sag;
      _dummy.position.x += (Math.random() - 0.5) * 0.12;
      _dummy.position.z += (Math.random() - 0.5) * 0.12;
      this.pushLeaf();
      // occasional dangling strand
      if (Math.random() < 0.12) {
        const drop = 0.15 + Math.random() * 0.3;
        _dummy.position.y -= drop;
        this.pushLeaf();
      }
    }
  }

  /** loose bush of leaves (potted plants) */
  bush(center: THREE.Vector3, radius: number, count: number) {
    for (let i = 0; i < count; i++) {
      const dir = new THREE.Vector3().randomDirection();
      dir.y = Math.abs(dir.y);
      _dummy.position.copy(center).addScaledVector(dir, radius * (0.4 + Math.random() * 0.6));
      this.pushLeaf();
    }
  }

  private pushLeaf() {
    _dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );
    const s = 0.07 + Math.random() * 0.08;
    _dummy.scale.set(s, s * 0.7, s);
    _dummy.updateMatrix();
    this.transforms.push(_dummy.matrix.clone());
  }

  build(): THREE.InstancedMesh {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const mesh = new THREE.InstancedMesh(geo, matte(0x4a7a3a, 0.9), this.transforms.length);
    this.transforms.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = true;
    return mesh;
  }
}
