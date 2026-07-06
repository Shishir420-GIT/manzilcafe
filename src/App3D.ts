/**
 * App3D — the orchestrator. Owns the renderer, scene, camera,
 * and all game systems. Everything else is a bounded subsystem.
 */
import * as THREE from 'three/webgpu';
import { toonOutlinePass } from 'three/tsl';
import { Input } from './core/Input';
import { buildCafe } from './world/CafeBlockout';
import { CollisionWorld } from './systems/Collision';
import { PlayerController } from './player/PlayerController';
import { InteractionSystem } from './systems/Interactions';
import { Bartender } from './npc/Bartender';
import { Walkers } from './npc/Walkers';
import { Steam } from './world/Steam';
import { HUD } from './ui/HUD';
import { CharacterMenu } from './ui/CharacterMenu';

export class App3D {
  renderer!: THREE.WebGPURenderer;
  post!: THREE.PostProcessing;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  timer = new THREE.Timer();

  input = new Input();
  hud = new HUD();
  menu!: CharacterMenu;
  collision = new CollisionWorld();
  player!: PlayerController;
  interactions!: InteractionSystem;
  bartender!: Bartender;
  walkers!: Walkers;
  steam!: Steam;

  constructor(private container: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
  }

  async init(onProgress: (msg: string) => void) {
    // WebGPU renderer — automatically falls back to WebGL2 where
    // WebGPU isn't available, so nobody gets locked out.
    this.renderer = new THREE.WebGPURenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    await this.renderer.init();
    this.container.appendChild(this.renderer.domElement);

    onProgress('BUILDING THE CAFÉ…');
    const cafe = buildCafe();
    this.scene.add(cafe.root);
    this.scene.fog = new THREE.Fog(0x8a6f52, 26, 55);
    this.scene.background = new THREE.Color(0xead9b4);

    onProgress('COMPUTING COLLISION (BVH)…');
    this.collision.build(cafe.colliders);
    // Uncomment to see the merged collider + BVH bounds:
    // this.scene.add(this.collision.debugMesh());

    onProgress('SEATING THE BARISTA…');
    this.bartender = new Bartender(new THREE.Vector3(-2, 0, -5.6));
    this.scene.add(this.bartender.root);

    onProgress('INVITING THE REGULARS…');
    this.walkers = new Walkers(4);
    this.scene.add(this.walkers.root);
    this.steam = new Steam(cafe.steamSpots);
    this.scene.add(this.steam.root);

    this.player = new PlayerController(this.camera, this.input, this.collision);
    this.player.teleport(new THREE.Vector3(6.5, 1.2, 2.2));
    this.scene.add(this.player.root);

    // Live avatar customization — re-skins the player in place.
    this.menu = new CharacterMenu((cfg) => this.player.setConfig(cfg));

    // Cel-shaded ink outline: ToonOutlinePassNode renders the whole scene and
    // draws outlines only on MeshToonNodeMaterial meshes (i.e. the characters).
    this.post = new THREE.PostProcessing(this.renderer);
    this.post.outputNode = toonOutlinePass(
      this.scene,
      this.camera,
      new THREE.Color(0x140b08),
      0.006,
      1,
    );

    this.interactions = new InteractionSystem(this.player, this.hud, this.input);
    this.interactions.register(this.bartender.interactable(this.hud));
    for (const seat of cafe.seats) {
      this.interactions.register({
        id: seat.id,
        position: seat.position,
        radius: 1.4,
        label: 'Sit down',
        onActivate: () => this.player.toggleSit(seat.position, seat.facing),
        isActive: () => this.player.isSitting,
        activeLabel: 'Stand up',
      });
    }

    window.addEventListener('resize', this.onResize);
  }

  start() {
    this.renderer.setAnimationLoop(this.update);
  }

  private update = () => {
    this.timer.update();
    const dt = Math.min(this.timer.getDelta(), 1 / 30);
    const t = this.timer.getElapsed();

    // Dialogue or customization menu open = player input frozen
    if (!this.hud.dialogueOpen && !this.menu.isOpen) {
      this.player.update(dt);
      this.interactions.update();
    }
    this.bartender.update(t, this.player.position);
    this.walkers.update(dt, t);
    this.steam.update(dt);

    // Always close out the input frame, even when gameplay input is
    // frozen (dialogue open) — otherwise justPressed() flags go stale
    // and re-fire the moment the dialogue closes.
    this.input.endFrame();

    this.post.render();
  };

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}
