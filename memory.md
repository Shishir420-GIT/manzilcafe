# memory.md — ManzilCafe 3D Handoff

> Handoff document for Claude Code. Contains full project context: vision, reference analysis, current codebase state, architecture decisions, bugs fixed, verification methodology, integration seams, and roadmap. Drop this in the repo root (or use as CLAUDE.md).

---

## 1. Project Vision

Rebuild **ManzilCafe 2.0** (a 2D React virtual social café) as a **3D explorable game-like place** in the browser — inspired by https://messenger.abeto.co/. Users walk around a warm café as an avatar, sit at booths, talk to an AI barista, order items, and see other users present in the space in real time.

**Visual target:** a specific pixel-art reference image of a cozy café — white brick walls, ivy-wrapped columns and garlands, chalkboard menus, shelves of white cups, a slatted-wood bar with cream stone top and silver espresso machine (with steam), maroon booths, warm pendant lamps, a full-height window wall with sunlight, and an **open entrance** with people walking in and out. The café must NOT be a closed box.

**Original project (2D):** https://github.com/Shishir420-GIT/manzilcafe
- Stack: Vite + React 18 + TS, Tailwind, Radix UI, Supabase (auth/DB/realtime), Google Gemini (`@google/generative-ai`) for the AI bartender, Google OAuth
- Key files to reuse later: `src/lib/gemini.ts`, `src/lib/supabase.ts`, `src/lib/aiSecurity.ts`, `src/lib/rateLimiter.ts`, `src/lib/aiMonitoring.ts`, components `BartenderChat.tsx`, `Chat.tsx`, `OrderPanel.tsx`
- Features to port into 3D: multi-tenant café rooms, realtime chat, AI bartender, voice messages, virtual ordering, presence, OAuth
- Decision: **fresh 3D project**, old repo used as reference only; its backend/AI plugs into seams (see §6)

## 2. Reference Game Analysis (messenger.abeto.co)

- Built with **Three.js + WebGL** (not Unity/Godot export); **three-mesh-bvh** for raycast/collision/spatial queries; **Node.js + WebSockets** for multiplayer; assets via Houdini/Blender/Substance
- Delivery: minimal HTML shell → module entry script (`webgl-*.js`) → preloaded `App3D-*.js` chunk → hashed CSS. ESM-first bundling (Vite-like). Single-page runtime that mounts the game at startup
- Runtime architecture: bootloader → asset loader → renderer → input system → networking client → UI overlay layer
- Load budget: ~5.7 MB initial, ~17.5 MB ceiling (ours is currently ~266 KB gzipped — huge headroom)
- Solo-build strategy adopted: build bounded subsystems with a coding agent, vertical slice first, art pass last

## 3. Current Codebase State (v2 — reference remake DONE)

**Location in original session:** `/home/claude/manzilcafe-3d` — delivered as `manzilcafe-3d-v2.zip`

### Stack
- **Three.js 0.185** via `three/webgpu` — `WebGPURenderer` (auto-falls back to WebGL2), **TSL node materials** (all procedural, zero textures so far)
- **three-mesh-bvh 0.9.10** — merged static collider + capsule character controller via `shapecast`
- **Vite 7 + TypeScript 5.6**, strict mode; framework-free DOM HUD (React mounts into `#hud` later)
- devDep `tsx` for headless smoke tests

### Commands
```bash
npm run dev      # vite dev server
npm run build    # tsc --noEmit && vite build  (both must pass)
npx tsx <file>   # run headless smoke tests
```

### File map
```
index.html                  shell + loading screen + HUD/dialogue DOM + all CSS
src/main.ts                 boot; fatal-error overlay (window error/unhandledrejection → loading screen)
src/App3D.ts                orchestrator: renderer, scene, THREE.Timer, systems, loop
src/core/Input.ts           keyboard + pointer-drag; ignores events from text fields;
                            justPressed() one-frame flags; endFrame() called by App3D every frame
src/world/Materials.ts      TSL materials: brickMaterial(axis), floorMaterial, pavementMaterial,
                            chalkboardMaterial, woodMaterial, darkWoodMaterial, creamMaterial,
                            metalMaterial, glassMaterial, bulbMaterial (flicker), backdropMaterial, matte;
                            + toonMaterial (MeshToonNodeMaterial + shared 3-step gradient map) for
                            characters. App3D renders via THREE.PostProcessing → toonOutlinePass(scene,
                            camera): whole scene renders normal, ink outline drawn only on toon meshes
                            (= the characters). post.render() replaces renderer.render() in the loop.
src/world/CafeBlockout.ts   the café; exports { root, colliders, seats, steamSpots };
                            ROOM = 18×14×4.2, DOOR gap z∈[1.6,3.4] on window wall at x=+9
src/world/Ivy.ts            IvyBuilder: wrapColumn / garland / bush → single InstancedMesh
src/world/Steam.ts          CPU-animated rising/fading puffs at emitter Vector3s
src/player/PlayerController.ts  capsule (h=1.7, r=0.35), camera-relative WASD, gravity −18,
                            walk 3.2 / run 5.5, sit/stand (toggleSit), orbit-follow cam,
                            respawn if y < −5
src/systems/Collision.ts    CollisionWorld: merge static meshes (position attr only, toNonIndexed)
                            → MeshBVH; resolveCapsule() via shapecast; grounded if pushout dir.y > 0.7
src/systems/Interactions.ts proximity interactables {id, position, radius, label, onActivate,
                            isActive?, activeLabel?}; nearest-in-range shows prompt; E activates
src/npc/Bartender.ts        NPC behind bar at (−2, 0, −5.6); idle bob; faces player <6u;
                            askAI() = AI INTEGRATION SEAM (canned replies now)
src/npc/Walkers.ts          4 ambient NPCs on a hand-placed waypoint loop: sidewalk → door → 
                            around interior → out; each is createAvatar(randomConfig) with a real
                            limb-swing walk cycle (PATH unchanged from blockout version)
src/avatars/Avatar.ts       SHARED anime-humanoid builder — replaces the old capsule+sphere in
                            player/walkers/bartender. Rigged Groups (hips→torso→arms/head,
                            hips→legs); height≈1.7 so collision/camera/seats unchanged. Cel-shaded
                            (toonMaterial), material cache by hex. AvatarConfig {gender, skin, hair,
                            hairStyle, outfit}; presets defaultConfig/randomConfig/baristaConfig.
                            API: setWalkPhase(phase,intensity), setPose('stand'|'sit'), setConfig()
                            rebuild-in-place for live edit. Female preset = skirt + narrower
                            shoulders; anime face = big eyes+iris+brows+mouth
src/avatars/avatar.smoke.ts headless rig test (npx tsx): per-gender height≈1.7, no-NaN, walk moves
                            limbs, sit→stand returns neutral, setConfig stays valid
src/ui/CharacterMenu.ts     framework-free live avatar editor; "Customize" button (index.html) opens
                            gender/skin/hairstyle/haircolor/outfit; onChange→player.setConfig;
                            isOpen freezes gameplay input (App3D checks it with hud.dialogueOpen)
src/ui/HUD.ts               prompt + dialogue panel; dialogueOpen flag freezes gameplay input
```

### Scene layout (coordinates that matter)
- Interior floor 18×14 centered origin; exterior **sidewalk** x∈[9,15]; sunlit backdrop plane x=15.9
- **Window wall x=+9** with **open doorway z∈[1.6,3.4]** (no collider in gap; collider above header only). Glass segments have invisible full-height collider proxies
- Bar at (−2, −4.6): wood base, cream top, 4 mugs, espresso machine at (0.4, 1.2, −4.6) with steam at (0.4, 2.05, −4.6); back counter + grinder along z=−6.45; chalkboards at x=−6.6/−4.7 on back wall; 3 cup shelves (21 instanced cups)
- Columns (brick + ivy) at (1.8,−0.8) and (−4.6,1.2); 6 ivy garlands; 3 potted plants
- Booths at (4.2,3.0) & (−3.8,3.6) — 4 sittable benches; round table at (−6.4,−1.2) — 2 chairs; **6 seats total**
- 5 pendant lamps (2 cast shadows); hemisphere light; warm directional sun from (14,7,4) with shadows
- Player spawns at (6.5, 1.2, 2.2) just inside the entrance; fog 0x8a6f52 (26→55); background 0xead9b4

## 4. Bugs Found & Fixed (do not reintroduce)

1. **CRITICAL — three-mesh-bvh API contract:** `ExtendedTriangle.closestPointToSegment()` returns **PLAIN DISTANCE**, not squared (`return Math.sqrt(closestDistanceSq)` in source). Original code compared vs `radius²` and sqrt'd again → floor never collided → player fell through in an endless respawn loop. Fix: `const dist = tri.closestPointToSegment(seg, triPoint, capsulePoint); if (dist < radius) { const depth = radius - dist; ... }`
2. **Stale input frames:** `input.endFrame()` must run in App3D's loop **unconditionally** (even when dialogue is open), else `justPressed('KeyE')` stays hot and re-fires when the dialogue closes
3. **Chat typing leaked into game input:** Input listeners ignore events where target is input/textarea/contentEditable
4. `THREE.Clock` deprecated in r185 → use `THREE.Timer` (core export): `timer.update()` then `getDelta()` / `getElapsed()`
5. Favicon 404 → inline SVG data-URI in index.html
6. Silent failures → `main.ts` surfaces uncaught errors/rejections in red on the loading screen. Keep this.

## 5. Verification Methodology (keep doing this)

No GPU in the build sandbox → **headless functional smoke tests** with `tsx` (geometry/logic only, no render). Proven pattern:
- Build scene via `buildCafe()`, build `CollisionWorld`, then `resolveCapsule()` at probe points asserting displacement/grounded:
  - mid-room → grounded, zero lateral push
  - **doorway (9, 2.5) → zero push (entrance must stay open)**
  - window (9, 0) → pushed back inside (glass solid)
  - sidewalk (11.5, 0) → grounded
- Simulate `Walkers.update()` for 120 virtual seconds, count crossings of x=9 (last run: 10 entries / 9 exits)
- Run `Steam.update()` 300 frames, assert no NaN
- Both `tsc --noEmit` and `vite build` must pass before delivery
Last results: 101 scene children, 32 colliders, 516 BVH tris, 6 seats, 2 steam spots — ALL PASSED

## 6. Integration Seams (M2/M3 work)

1. **AI Barista:** `src/npc/Bartender.ts → askAI(playerText)` — replace canned replies with the Gemini call from old repo's `src/lib/gemini.ts`; keep `aiSecurity.ts` validation + `rateLimiter.ts` in front. HUD already handles async replies + "…" thinking state + error fallback line
2. **Presence:** new `src/systems/Presence.ts` — Supabase Realtime channel; broadcast `{x, z, yaw, sitting}` at ~10 Hz; spawn remote avatars (reuse `buildPerson()` from Walkers or player avatar builder); name tags from profiles
3. **Ordering:** register bar counter as an interactable → opens old `OrderPanel` UI; delivered order spawns a cup mesh at the player's seat (steam emitter optional)
4. **Auth:** gate `boot()` in `main.ts` behind existing Google OAuth (Supabase); profile name → avatar name tag
5. **React HUD:** mount React into `#hud` div; retire `ui/HUD.ts` piecemeal. Keep `hud.dialogueOpen`-style input freeze contract

## 7. Roadmap

- [x] M1 — vertical slice: blockout, BVH movement, sit, dialogue
- [x] M1.5 — pixel-art-reference remake: brick/ivy/booths/espresso/steam, **open entrance + sidewalk + ambient walkers**
- [ ] M2 — real Gemini barista + ordering at the counter
- [ ] M3 — Supabase realtime presence avatars + emoji reactions
- [ ] M4 — polish: TSL post-processing (bloom, vignette; optional **pixelation pass** = low-res render + color quantization to truly match the pixel-art reference), spatial audio, GPU-compute steam particles
- [ ] M5 — art pass: Blender low-poly GLTF (Draco/Meshopt) + KTX2 textures, baked AO; keep the seat/collider contract from CafeBlockout

## 8. Conventions & Gotchas

- Import pattern: `import * as THREE from 'three/webgpu'` + `import { ... } from 'three/tsl'` — never plain `'three'` alongside webgpu entry
- TSL: method chaining (`x.mul(2).add(1).sin()`); falling smoothstep edges are undefined — use `smoothstep(a,b,x).oneMinus()` instead of reversed edges
- Node materials: use `colorNode/roughnessNode/emissiveNode/opacityNode`; `transparent = true` still a plain property
- All static/blocking meshes must be passed into `colliders`; invisible box proxies (`proxy()` helper) for complex props; collider merge strips all attributes except position
- Deps installed with plain npm; on the sandbox, pip needs `--break-system-packages` (not used here)
- Skills used during build (re-clone if needed):
  - https://github.com/dgreenheck/webgpu-claude-skill (webgpu-threejs-tsl: TSL syntax, compute, post-processing)
  - https://github.com/cloudai-x/threejs-skills (10 modular skills: fundamentals/geometry/materials/textures/lighting/loaders/animation/interaction/shaders/postprocessing)
- Controls: WASD move, Shift run, mouse-drag orbit, E interact (sit/stand, talk), Esc closes dialogue
- Perf budget: stay far under abeto's 5.7 MB initial; currently ~266 KB gz. Instance everything repeated (ivy, cups, mugs already are)

## 9. Immediate Next Actions for Claude Code

1. Init git repo, commit v2 as baseline
2. Walk the space; tune proportions/coordinates by feel (all layout constants in `CafeBlockout.ts`)
3. Start M2: port `gemini.ts` + security wrappers into `askAI()`; add ordering interactable at the bar
4. Preserve and extend the smoke-test suite (`npx tsx`) — especially the doorway-open assertion — and run `npm run build` before every commit
