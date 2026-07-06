/**
 * Materials — TSL node materials matching the pixel-art reference:
 * white brick, cream stone, dark chalkboards, warm woods, glass, ivy.
 * All procedural — no textures needed until the art pass.
 */
import * as THREE from 'three/webgpu';
import {
  color,
  time,
  positionWorld,
  sin,
  mix,
  float,
  smoothstep,
} from 'three/tsl';

/** Light tan plank floor (interior) */
export function floorMaterial() {
  const mat = new THREE.MeshStandardNodeMaterial();
  const planks = positionWorld.x.mul(1.4).floor().mod(2.0);
  const grain = sin(positionWorld.z.mul(22.0).add(positionWorld.x.mul(3.0)))
    .mul(0.5).add(0.5).mul(0.05);
  mat.colorNode = mix(color(0xb08a5e), color(0xc09a6a), planks).add(grain);
  mat.roughnessNode = float(0.85);
  return mat;
}

/** Exterior pavement */
export function pavementMaterial() {
  const mat = new THREE.MeshStandardNodeMaterial();
  const tiles = positionWorld.x.mul(0.8).floor().add(positionWorld.z.mul(0.8).floor()).mod(2.0);
  mat.colorNode = mix(color(0xcabd9f), color(0xbfb193), tiles);
  mat.roughnessNode = float(0.95);
  return mat;
}

/**
 * White brick with mortar lines — the signature wall from the reference.
 * axis: which world axis runs along the wall face ('x' or 'z').
 */
export function brickMaterial(axis: 'x' | 'z' = 'x') {
  const mat = new THREE.MeshStandardNodeMaterial();
  const p = axis === 'x' ? positionWorld.x : positionWorld.z;

  const rowF = positionWorld.y.mul(3.4);
  const row = rowF.floor();
  const offset = row.mod(2.0).mul(0.5);
  const colF = p.mul(1.7).add(offset);

  const fx = colF.fract();
  const fy = rowF.fract();
  const inside = smoothstep(0.0, 0.07, fx)
    .mul(smoothstep(0.93, 1.0, fx).oneMinus())
    .mul(smoothstep(0.0, 0.12, fy))
    .mul(smoothstep(0.88, 1.0, fy).oneMinus());

  const tint = sin(row.mul(7.0).add(colF.floor().mul(13.0))).mul(0.025);
  mat.colorNode = mix(color(0xb5a898), color(0xece3d4), inside).add(tint);
  mat.roughnessNode = float(0.9);
  return mat;
}

/** Chalkboard: near-black green with faint chalk scribbles */
export function chalkboardMaterial() {
  const mat = new THREE.MeshStandardNodeMaterial();
  const lines = sin(positionWorld.y.mul(28.0)).mul(0.5).add(0.5).pow(10.0);
  const breaks = sin(positionWorld.x.mul(9.0).add(positionWorld.y.mul(31.0)))
    .mul(0.5).add(0.5);
  mat.colorNode = color(0x1c2822).add(lines.mul(breaks).mul(0.35));
  mat.roughnessNode = float(0.95);
  return mat;
}

/** Reddish slatted wood (bar base, booths' table) */
export function woodMaterial(hex = 0x8a4a2e) {
  const mat = new THREE.MeshStandardNodeMaterial();
  const slats = positionWorld.y.mul(5.0).floor().mod(2.0).mul(0.05);
  const rings = sin(positionWorld.x.mul(12.0).add(positionWorld.z.mul(8.0)))
    .mul(0.5).add(0.5).mul(0.05);
  mat.colorNode = color(hex).add(slats).add(rings);
  mat.roughnessNode = float(0.65);
  return mat;
}

/** Dark ceiling wood */
export function darkWoodMaterial(hex = 0x3a241a) {
  const mat = new THREE.MeshStandardNodeMaterial();
  const grain = sin(positionWorld.x.mul(9.0)).mul(0.5).add(0.5).mul(0.05);
  mat.colorNode = color(hex).add(grain);
  mat.roughnessNode = float(0.9);
  return mat;
}

/** Cream stone (bar top, window sills) */
export function creamMaterial() {
  const mat = new THREE.MeshStandardNodeMaterial();
  mat.colorNode = color(0xeadfc8);
  mat.roughnessNode = float(0.5);
  return mat;
}

/** Brushed metal for the espresso machine */
export function metalMaterial(hex = 0xd8d8d4) {
  const mat = new THREE.MeshStandardNodeMaterial();
  mat.colorNode = color(hex);
  mat.roughnessNode = float(0.35);
  mat.metalnessNode = float(0.8);
  return mat;
}

/** Window glass */
export function glassMaterial() {
  const mat = new THREE.MeshStandardNodeMaterial();
  mat.colorNode = color(0xd6ecef);
  mat.roughnessNode = float(0.08);
  mat.opacityNode = float(0.16);
  mat.transparent = true;
  mat.depthWrite = false;
  return mat;
}

/** Warm glowing lamp bulb — breathes like candlelight */
export function bulbMaterial() {
  const mat = new THREE.MeshStandardNodeMaterial();
  const flicker = sin(time.mul(7.3)).mul(sin(time.mul(3.1).add(1.7))).mul(0.12).add(1.0);
  mat.colorNode = color(0xffe6b8);
  mat.emissiveNode = color(0xffc673).mul(flicker).mul(3.0);
  return mat;
}

/** Warm sunlit backdrop seen through the windows */
export function backdropMaterial() {
  const mat = new THREE.MeshBasicNodeMaterial();
  const h = positionWorld.y.mul(0.12).clamp(0.0, 1.0);
  mat.colorNode = mix(color(0xe8c48f), color(0xf6e3bd), h);
  return mat;
}

/** Simple matte */
export function matte(hex: number, roughness = 0.9) {
  const mat = new THREE.MeshStandardNodeMaterial();
  mat.colorNode = color(hex);
  mat.roughnessNode = float(roughness);
  return mat;
}

// ---- Toon (cel) shading -------------------------------------------------
// A shared gradient map turns smooth diffuse into a few flat bands — the
// core "anime" lighting signal. Built once, reused by every toon material
// and by ToonOutlinePassNode (which detects MeshToonNodeMaterial meshes and
// draws their ink outline).

let _gradientMap: THREE.DataTexture | null = null;

/** 3-step grayscale ramp used as the toon lighting LUT (shadow / mid / lit). */
function toonGradientMap(): THREE.DataTexture {
  if (_gradientMap) return _gradientMap;
  const steps = [90, 176, 255]; // shadow, mid, highlight
  const data = new Uint8Array(steps.length * 4);
  for (let i = 0; i < steps.length; i++) {
    data[i * 4 + 0] = steps[i];
    data[i * 4 + 1] = steps[i];
    data[i * 4 + 2] = steps[i];
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  _gradientMap = tex;
  return tex;
}

/**
 * Flat cel-shaded material for characters (skin, hair, clothes).
 * Meshes using this get an automatic ink outline from ToonOutlinePassNode.
 */
export function toonMaterial(hex: number) {
  const mat = new THREE.MeshToonNodeMaterial();
  mat.colorNode = color(hex);
  mat.gradientMap = toonGradientMap();
  return mat;
}
