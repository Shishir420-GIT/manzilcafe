/**
 * Headless smoke test for the avatar rig — no GPU needed (geometry + Groups
 * only; toon materials construct without compiling a shader).
 *
 *   npx tsx src/avatars/avatar.smoke.ts
 *
 * Asserts: correct height per gender, no NaN in any world transform, the walk
 * cycle actually moves limbs, and sit → stand returns to the neutral pose.
 */
import * as THREE from 'three/webgpu';
import { createAvatar, defaultConfig, randomConfig, Gender } from './Avatar';

let failures = 0;
function check(name: string, cond: boolean) {
  console.log(`${cond ? '  ✓' : '  ✗'} ${name}`);
  if (!cond) failures++;
}

function allFinite(root: THREE.Object3D): boolean {
  let ok = true;
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    const p = new THREE.Vector3();
    o.getWorldPosition(p);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) ok = false;
  });
  return ok;
}

function height(root: THREE.Object3D): number {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  return box.max.y - box.min.y;
}

console.log('avatar rig smoke test');

// 1. Build one per gender — height ≈ 1.7, everything finite.
for (const g of ['female', 'male', 'neutral'] as Gender[]) {
  const a = createAvatar({ ...defaultConfig(), gender: g });
  const h = height(a.root);
  check(`${g}: height ${h.toFixed(2)} within 1.55..1.95`, h > 1.55 && h < 1.95);
  check(`${g}: all world positions finite`, allFinite(a.root));
}

// 2. Walk cycle stays finite across a full stride and actually moves a limb.
{
  const a = createAvatar(defaultConfig());
  a.root.updateMatrixWorld(true);
  const foot = deepestMesh(a.root);
  const y0 = worldY(foot);
  let finite = true;
  for (let i = 0; i < 120; i++) {
    a.setWalkPhase((i / 120) * Math.PI * 4, 1);
    if (!allFinite(a.root)) finite = false;
  }
  a.setWalkPhase(Math.PI / 2, 1);
  const y1 = worldY(foot);
  check('walk cycle: finite across 120 steps', finite);
  check('walk cycle: limb actually moves', Math.abs(y1 - y0) > 0.01);
}

// 3. Sit then stand → pose returns to neutral (same height as a fresh avatar).
{
  const neutral = height(createAvatar(defaultConfig()).root);
  const a = createAvatar(defaultConfig());
  a.setPose('sit');
  const sitH = height(a.root);
  a.setPose('stand');
  const standH = height(a.root);
  check('sit lowers the silhouette', sitH < neutral - 0.1);
  check('stand restores neutral height', Math.abs(standH - neutral) < 0.02);
}

// 4. Live setConfig keeps the rig valid and roughly the same height.
{
  const a = createAvatar(defaultConfig());
  const h0 = height(a.root);
  a.setConfig({ ...randomConfig(42), gender: 'female', hairStyle: 'ponytail' });
  const h1 = height(a.root);
  check('setConfig: still finite', allFinite(a.root));
  check('setConfig: height stable', Math.abs(h1 - h0) < 0.15);
}

function deepestMesh(root: THREE.Object3D): THREE.Object3D {
  let best = root;
  let bestDepth = -1;
  root.traverse((o) => {
    let d = 0;
    let p: THREE.Object3D | null = o;
    while (p) { d++; p = p.parent; }
    if ((o as THREE.Mesh).isMesh && d > bestDepth) { best = o; bestDepth = d; }
  });
  return best;
}
function worldY(o: THREE.Object3D): number {
  const p = new THREE.Vector3();
  o.updateMatrixWorld(true);
  o.getWorldPosition(p);
  return p.y;
}

if (failures === 0) {
  console.log('\nALL PASSED');
} else {
  throw new Error(`\n${failures} FAILED`); // non-zero exit for CI
}
