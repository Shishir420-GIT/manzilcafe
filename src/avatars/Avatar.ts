/**
 * Avatar — one rigged, anime-styled humanoid builder that replaces the
 * three ad-hoc capsule+sphere blockouts (player, walkers, barista).
 *
 * The character is assembled from primitives into a small joint hierarchy
 * (hips → torso → arms/head, hips → legs) so a walk cycle is just joint
 * rotation. Total height ≈ 1.7 to match the collision capsule, so nothing
 * downstream (BVH, camera, seats) has to change.
 *
 * Materials are cel-shaded (MeshToonNodeMaterial) and shared through a
 * module-level cache so a crowd of characters doesn't spawn hundreds of
 * materials. Toon meshes are what ToonOutlinePassNode picks up for the
 * anime ink outline (wired in App3D).
 */
import * as THREE from 'three/webgpu';
import { toonMaterial } from '../world/Materials';

export type Gender = 'female' | 'male' | 'neutral';
export type HairStyle = 'short' | 'bob' | 'ponytail' | 'spiky' | 'bun';

export interface AvatarConfig {
  gender: Gender;
  skin: number;
  hair: number;
  hairStyle: HairStyle;
  outfit: number;
}

export const SKINS = [0xffdcb8, 0xf0c19a, 0xd9a878, 0xb98a62, 0x8a5f42, 0x6a4630];
export const HAIR_COLORS = [0x2a1a12, 0x5a3521, 0x8a5a2b, 0xc9962f, 0xd94f4f, 0x4a4f6a, 0xe8e4de];
export const OUTFITS = [0xc0533a, 0x4a6f8a, 0x5f8a4a, 0x8a5f9c, 0x3f7c6f, 0xd9a13a, 0x37506b];
export const HAIR_STYLES: HairStyle[] = ['short', 'bob', 'ponytail', 'spiky', 'bun'];

export function defaultConfig(): AvatarConfig {
  return { gender: 'neutral', skin: SKINS[1], hair: HAIR_COLORS[1], hairStyle: 'short', outfit: OUTFITS[1] };
}

/** Deterministic varied look for ambient walkers (seeded so a build is stable). */
export function randomConfig(seed = Math.random() * 1e6): AvatarConfig {
  const r = mulberry32(Math.floor(seed) + 1);
  const genders: Gender[] = ['female', 'male', 'neutral'];
  return {
    gender: genders[Math.floor(r() * genders.length)],
    skin: SKINS[Math.floor(r() * SKINS.length)],
    hair: HAIR_COLORS[Math.floor(r() * HAIR_COLORS.length)],
    hairStyle: HAIR_STYLES[Math.floor(r() * HAIR_STYLES.length)],
    outfit: OUTFITS[Math.floor(r() * OUTFITS.length)],
  };
}

export function baristaConfig(): AvatarConfig {
  return { gender: 'male', skin: SKINS[2], hair: HAIR_COLORS[0], hairStyle: 'short', outfit: 0x3f5c46 };
}

export interface Avatar {
  /** Group the owner rotates for facing and positions/offsets for sit. */
  root: THREE.Group;
  config: AvatarConfig;
  /** Drive the walk cycle. intensity 0 → neutral standing pose. */
  setWalkPhase(phase: number, intensity: number): void;
  /** Bend legs/arms for sitting, or reset to standing. */
  setPose(pose: 'stand' | 'sit'): void;
  /** Rebuild the whole avatar in place (live customization). */
  setConfig(cfg: AvatarConfig): void;
  dispose(): void;
}

// ---- shared material cache ---------------------------------------------
const _matCache = new Map<number, THREE.MeshToonNodeMaterial>();
function mat(hex: number): THREE.MeshToonNodeMaterial {
  let m = _matCache.get(hex);
  if (!m) {
    m = toonMaterial(hex);
    _matCache.set(hex, m);
  }
  return m;
}

// ---- proportions per gender (all metres, foot at y=0) ------------------
const HIP_Y = 0.86; // hip pivot height above the floor

interface Dims {
  shoulderR: number; waistR: number; hipX: number; shoulderX: number; hipR: number;
}
function dims(g: Gender): Dims {
  switch (g) {
    case 'female': return { shoulderR: 0.165, waistR: 0.125, hipX: 0.085, shoulderX: 0.185, hipR: 0.16 };
    case 'male':   return { shoulderR: 0.215, waistR: 0.175, hipX: 0.10,  shoulderX: 0.235, hipR: 0.17 };
    default:       return { shoulderR: 0.19,  waistR: 0.15,  hipX: 0.092, shoulderX: 0.21,  hipR: 0.165 };
  }
}

function darken(hex: number, f = 0.62): number {
  const r = ((hex >> 16) & 255) * f, g = ((hex >> 8) & 255) * f, b = (hex & 255) * f;
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}

function mesh(geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const mo = new THREE.Mesh(geo, m);
  mo.position.set(x, y, z);
  mo.castShadow = true;
  return mo;
}

interface Joints {
  hips: THREE.Group; torso: THREE.Group; head: THREE.Group;
  shoulderL: THREE.Group; shoulderR: THREE.Group;
  elbowL: THREE.Group; elbowR: THREE.Group;
  thighL: THREE.Group; thighR: THREE.Group;
  shinL: THREE.Group; shinR: THREE.Group;
}

export function createAvatar(cfg: AvatarConfig): Avatar {
  const root = new THREE.Group();
  const geoms: THREE.BufferGeometry[] = []; // tracked for disposal on rebuild
  let joints!: Joints;

  const build = (c: AvatarConfig) => {
    const d = dims(c.gender);
    const skinMat = mat(c.skin);
    const topMat = mat(c.outfit);
    const bottomMat = mat(darken(c.outfit, 0.55));
    const shoeMat = mat(0x2a2830);
    const hairMat = mat(c.hair);

    const track = <T extends THREE.BufferGeometry>(g: T): T => { geoms.push(g); return g; };

    const hips = new THREE.Group();
    hips.position.y = HIP_Y;
    root.add(hips);

    // ---- torso / clothes ----
    const torso = new THREE.Group();
    hips.add(torso);
    // pelvis (shorts / waistband)
    torso.add(mesh(track(new THREE.CylinderGeometry(d.waistR, d.hipR, 0.18, 14)), bottomMat, 0, -0.02, 0));
    // chest (shirt), tapered up to the shoulders
    torso.add(mesh(track(new THREE.CylinderGeometry(d.shoulderR, d.waistR, 0.44, 16)), topMat, 0, 0.24, 0));
    // neck
    torso.add(mesh(track(new THREE.CylinderGeometry(0.052, 0.06, 0.09, 10)), skinMat, 0, 0.5, 0));

    // ---- head + anime face ----
    const head = new THREE.Group();
    head.position.y = 0.66; // world ≈ 1.52
    torso.add(head);
    head.add(mesh(track(new THREE.SphereGeometry(0.18, 20, 16)), skinMat));
    buildFace(head, c, track);
    buildHair(head, c.hairStyle, hairMat, track);

    // ---- arms (shoulder → elbow → hand) ----
    const arm = (side: 1 | -1): [THREE.Group, THREE.Group] => {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * d.shoulderX, 0.4, 0);
      torso.add(shoulder);
      shoulder.add(mesh(track(new THREE.CylinderGeometry(0.05, 0.045, 0.26, 10)), topMat, 0, -0.13, 0)); // sleeve
      const elbow = new THREE.Group();
      elbow.position.y = -0.26;
      shoulder.add(elbow);
      elbow.add(mesh(track(new THREE.CylinderGeometry(0.043, 0.038, 0.24, 10)), skinMat, 0, -0.12, 0)); // forearm
      elbow.add(mesh(track(new THREE.SphereGeometry(0.05, 10, 8)), skinMat, 0, -0.26, 0)); // hand
      return [shoulder, elbow];
    };
    const [shoulderL, elbowL] = arm(1);
    const [shoulderR, elbowR] = arm(-1);

    // ---- legs (hip → knee → foot) ----
    const female = c.gender === 'female';
    const legMat = female ? skinMat : bottomMat; // bare legs under a skirt, else trousers
    const leg = (side: 1 | -1): [THREE.Group, THREE.Group] => {
      const thigh = new THREE.Group();
      thigh.position.set(side * d.hipX, 0, 0);
      hips.add(thigh);
      thigh.add(mesh(track(new THREE.CylinderGeometry(0.075, 0.06, 0.44, 12)), legMat, 0, -0.22, 0));
      const shin = new THREE.Group();
      shin.position.y = -0.44;
      thigh.add(shin);
      shin.add(mesh(track(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 12)), legMat, 0, -0.21, 0));
      shin.add(mesh(track(new THREE.BoxGeometry(0.1, 0.07, 0.22)), shoeMat, 0, -0.44, 0.05)); // shoe
      return [thigh, shin];
    };
    const [thighL, shinL] = leg(1);
    const [thighR, shinR] = leg(-1);

    // skirt sits over the top of the thighs
    if (female) {
      const skirt = mesh(track(new THREE.CylinderGeometry(d.hipR, d.hipR + 0.14, 0.3, 16, 1, true)), bottomMat, 0, -0.13, 0);
      hips.add(skirt);
    }

    joints = { hips, torso, head, shoulderL, shoulderR, elbowL, elbowR, thighL, thighR, shinL, shinR };
  };

  build(cfg);

  const setWalkPhase = (phase: number, intensity: number) => {
    const s = Math.sin(phase) * intensity;
    joints.thighL.rotation.x = s * 0.7;
    joints.thighR.rotation.x = -s * 0.7;
    // knees bend on the backswing of each leg
    joints.shinL.rotation.x = Math.max(0, -Math.sin(phase)) * 0.9 * intensity;
    joints.shinR.rotation.x = Math.max(0, Math.sin(phase)) * 0.9 * intensity;
    // arms swing opposite the legs, elbows slightly bent
    joints.shoulderL.rotation.x = -s * 0.55;
    joints.shoulderR.rotation.x = s * 0.55;
    joints.elbowL.rotation.x = -0.2 * intensity;
    joints.elbowR.rotation.x = -0.2 * intensity;
    // subtle vertical bob
    joints.hips.position.y = HIP_Y + Math.abs(Math.sin(phase)) * 0.03 * intensity;
  };

  const setPose = (pose: 'stand' | 'sit') => {
    if (pose === 'sit') {
      joints.thighL.rotation.x = -Math.PI / 2;
      joints.thighR.rotation.x = -Math.PI / 2;
      joints.shinL.rotation.x = Math.PI / 2;
      joints.shinR.rotation.x = Math.PI / 2;
      joints.shoulderL.rotation.x = -0.15;
      joints.shoulderR.rotation.x = -0.15;
    } else {
      joints.thighL.rotation.x = joints.thighR.rotation.x = 0;
      joints.shinL.rotation.x = joints.shinR.rotation.x = 0;
      joints.shoulderL.rotation.x = joints.shoulderR.rotation.x = 0;
      joints.elbowL.rotation.x = joints.elbowR.rotation.x = 0;
      joints.hips.position.y = HIP_Y;
    }
  };

  const dispose = () => {
    for (const g of geoms) g.dispose();
    geoms.length = 0;
    root.clear();
  };

  const avatar: Avatar = {
    root,
    config: cfg,
    setWalkPhase,
    setPose,
    dispose,
    setConfig(next: AvatarConfig) {
      dispose();
      avatar.config = next;
      build(next);
    },
  };
  return avatar;
}

// ---- face --------------------------------------------------------------
function buildFace(head: THREE.Group, c: AvatarConfig, track: <T extends THREE.BufferGeometry>(g: T) => T) {
  const white = mat(0xffffff);
  const iris = mat(irisColor(c.hair));
  const dark = mat(0x181014);
  const highlight = mat(0xfbfbff);
  const browMat = mat(darken(c.hair, 0.8));

  const eye = (side: 1 | -1) => {
    const x = side * 0.072;
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), white);
    track(sclera.geometry);
    sclera.position.set(x, 0.015, 0.15);
    sclera.scale.set(0.85, 1.15, 0.5);
    head.add(sclera);
    head.add(mesh(track(new THREE.SphereGeometry(0.03, 12, 10)), iris, x, 0.0, 0.185));
    head.add(mesh(track(new THREE.SphereGeometry(0.016, 10, 8)), dark, x, -0.005, 0.2));
    head.add(mesh(track(new THREE.SphereGeometry(0.009, 8, 6)), highlight, x + 0.012, 0.03, 0.205));
    // eyebrow
    head.add(mesh(track(new THREE.BoxGeometry(0.05, 0.012, 0.02)), browMat, x, 0.085, 0.175));
  };
  eye(1);
  eye(-1);

  // small mouth
  head.add(mesh(track(new THREE.BoxGeometry(0.04, 0.012, 0.02)), mat(0x9c5a52), 0, -0.09, 0.175));
}

function irisColor(hair: number): number {
  // warm iris that harmonises with hair; keep it lively
  const table: Record<number, number> = {
    0x4a4f6a: 0x3a5a8a, // cool hair → blue eyes
    0xd94f4f: 0x7a2f6a,
    0xe8e4de: 0x5a8a8a,
  };
  return table[hair] ?? 0x5a3a24;
}

// ---- hair --------------------------------------------------------------
function buildHair(head: THREE.Group, style: HairStyle, hairMat: THREE.Material, track: <T extends THREE.BufferGeometry>(g: T) => T) {
  // base cap common to every style
  const cap = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.195, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62)),
    hairMat,
  );
  cap.position.y = 0.02;
  cap.castShadow = true;
  head.add(cap);
  // fringe
  head.add(mesh(track(new THREE.BoxGeometry(0.3, 0.09, 0.12)), hairMat, 0, 0.11, 0.13));

  switch (style) {
    case 'short':
      break;
    case 'bob': {
      head.add(mesh(track(new THREE.BoxGeometry(0.09, 0.22, 0.18)), hairMat, 0.16, -0.02, 0.02));
      head.add(mesh(track(new THREE.BoxGeometry(0.09, 0.22, 0.18)), hairMat, -0.16, -0.02, 0.02));
      break;
    }
    case 'ponytail': {
      const tail = mesh(track(new THREE.CylinderGeometry(0.06, 0.03, 0.4, 10)), hairMat, 0, -0.06, -0.2);
      tail.rotation.x = 0.5;
      head.add(tail);
      head.add(mesh(track(new THREE.SphereGeometry(0.07, 12, 10)), hairMat, 0, 0.12, -0.14)); // tie bump
      break;
    }
    case 'spiky': {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const spike = mesh(
          track(new THREE.ConeGeometry(0.05, 0.16, 6)),
          hairMat,
          Math.cos(a) * 0.1,
          0.16,
          Math.sin(a) * 0.1,
        );
        spike.rotation.z = Math.cos(a) * -0.5;
        spike.rotation.x = Math.sin(a) * 0.5;
        head.add(spike);
      }
      break;
    }
    case 'bun': {
      head.add(mesh(track(new THREE.SphereGeometry(0.09, 14, 12)), hairMat, 0, 0.16, -0.1));
      break;
    }
  }
}

// small seeded PRNG for stable walker variety
function mulberry32(a: number): () => number {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
