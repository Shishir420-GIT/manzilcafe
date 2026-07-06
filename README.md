# ManzilCafe 3D ☕

A 3D, explorable rebuild of [ManzilCafe 2.0](https://github.com/Shishir420-GIT/manzilcafe) — a virtual café you walk around in, sit down in, and talk to the barista in. Architecture inspired by the [messenger.abeto.co](https://messenger.abeto.co/) pattern: minimal HTML shell → boot module → App3D runtime with bounded subsystems.

## Run it

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # type-check + production bundle
```

## Controls

| Input | Action |
|---|---|
| `W A S D` | Move |
| `Shift` | Run |
| Mouse drag | Orbit camera |
| `E` | Interact (sit on chairs, talk to the barista) |
| `Esc` | Close dialogue |

## Stack

- **Three.js `WebGPURenderer`** with TSL node materials — auto-falls back to WebGL2 on unsupported browsers
- **three-mesh-bvh** — all static geometry merged into one BVH collider; capsule character controller resolves against it via shapecast
- **Vite + TypeScript**, zero framework in the slice (React mounts into `#hud` later)
- Procedural TSL materials (wood planks, flickering lamps) — no textures needed until the art pass

## Architecture

```
src/
  main.ts                  boot: loading screen → App3D
  App3D.ts                 orchestrator: renderer, scene, loop, systems
  core/Input.ts            keyboard + pointer-drag state
  world/CafeBlockout.ts    greybox interior; exports colliders + seats
  world/Materials.ts       TSL node materials (the warm look)
  player/PlayerController.ts  capsule movement, gravity, sit, follow-cam
  systems/Collision.ts     merged BVH collider + capsule resolution
  systems/Interactions.ts  proximity prompts + E activation
  npc/Bartender.ts         NPC idle/facing + dialogue (AI seam inside)
  ui/HUD.ts                DOM overlay: prompt + dialogue panel
```

## Wiring in the original ManzilCafe backend

The old repo's non-3D systems plug into clearly marked seams:

1. **AI Barista** — `npc/Bartender.ts → askAI()` currently returns canned lines. Replace with the Gemini call from `src/lib/gemini.ts` (keep `aiSecurity.ts` validation and `rateLimiter.ts` in front, as before).
2. **Presence** — add a `systems/Presence.ts` that subscribes to a Supabase Realtime channel (`src/lib/supabase.ts`), broadcasting `{x, z, yaw, sitting}` ~10Hz and spawning remote avatars (reuse the player avatar builder).
3. **Ordering** — register the bar counter as an interactable that opens the old `OrderPanel` UI; delivered orders spawn a cup mesh at the player's seat.
4. **Auth** — gate `boot()` behind the existing Google OAuth flow; use the profile name for avatar name tags.

## Roadmap (abeto-style milestones)

- [x] **M1 — Vertical slice**: blockout café, BVH movement, sit, barista dialogue
- [x] **M1.5 — Reference remake**: white-brick walls, ivy columns & garlands, chalkboards, cup shelves, espresso machine with steam, maroon booths, window wall with an OPEN ENTRANCE, exterior sidewalk, ambient NPCs walking in and out *(you are here)*
- [ ] **M2 — Real AI**: Gemini barista + ordering at the counter
- [ ] **M3 — Presence**: Supabase realtime avatars + emoji reactions
- [ ] **M4 — Polish**: TSL post-processing (bloom, vignette), spatial audio, steam particles via compute
- [ ] **M5 — Art pass**: Blender low-poly assets → Draco/Meshopt GLTF + KTX2 textures, baked AO
