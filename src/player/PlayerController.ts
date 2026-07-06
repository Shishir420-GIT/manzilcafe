/**
 * PlayerController — capsule avatar with camera-relative WASD movement,
 * gravity, BVH-backed collision, a third-person orbit-follow camera,
 * and sit/stand behavior for the café seats.
 */
import * as THREE from 'three/webgpu';
import { Input } from '../core/Input';
import { CollisionWorld } from '../systems/Collision';
import { Avatar, AvatarConfig, createAvatar, defaultConfig } from '../avatars/Avatar';

const WALK_SPEED = 3.2;
const RUN_SPEED = 5.5;
const GRAVITY = -18;
const HEIGHT = 1.7;
const RADIUS = 0.35;

export class PlayerController {
  root = new THREE.Group();
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  isSitting = false;

  private yaw = 0;      // camera orbit yaw
  private pitch = 0.35; // camera orbit pitch
  private camDist = 5;
  private avatar: Avatar;
  private mesh: THREE.Group;      // the avatar root — rotated for facing, offset for sit
  private config: AvatarConfig;
  private walkPhase = 0;          // accumulated stride phase
  private walkIntensity = 0;      // eased 0..1 so idle settles to a neutral pose
  private standPos = new THREE.Vector3();
  private targetLook = new THREE.Vector3();

  constructor(
    private camera: THREE.PerspectiveCamera,
    private input: Input,
    private collision: CollisionWorld,
  ) {
    this.config = defaultConfig();
    this.avatar = createAvatar(this.config);
    this.mesh = this.avatar.root;
    this.root.add(this.mesh);
  }

  /** Live re-skin from the customization menu; keeps facing + sit state. */
  setConfig(cfg: AvatarConfig) {
    this.config = cfg;
    const facing = this.mesh.rotation.y;
    const yOff = this.mesh.position.y;
    this.avatar.setConfig(cfg);
    this.mesh.rotation.y = facing;
    this.mesh.position.y = yOff;
    if (this.isSitting) this.avatar.setPose('sit');
  }

  teleport(p: THREE.Vector3) {
    this.position.copy(p);
    this.velocity.set(0, 0, 0);
  }

  toggleSit(seatPos: THREE.Vector3, facing: THREE.Vector3) {
    if (this.isSitting) {
      // stand up next to the seat
      this.isSitting = false;
      this.position.copy(this.standPos);
      this.mesh.position.y = 0;
      this.avatar.setPose('stand');
    } else {
      this.isSitting = true;
      this.standPos.copy(this.position);
      this.position.set(seatPos.x, seatPos.y - 0.55, seatPos.z);
      this.mesh.position.y = -0.35; // lower body into the chair
      this.avatar.setPose('sit');   // bend the legs
      this.yaw = Math.atan2(-facing.x, -facing.z) + Math.PI;
      this.mesh.rotation.y = Math.atan2(facing.x, facing.z);
      this.velocity.set(0, 0, 0);
    }
  }

  update(dt: number) {
    // ---- camera orbit from pointer drag ----
    const drag = this.input.consumeDrag();
    this.yaw -= drag.x * 0.005;
    this.pitch = THREE.MathUtils.clamp(this.pitch + drag.y * 0.004, 0.05, 1.2);

    if (!this.isSitting) {
      // ---- movement input, camera-relative ----
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(-forward.z, 0, forward.x);
      const move = new THREE.Vector3();
      if (this.input.keys.has('KeyW')) move.add(forward);
      if (this.input.keys.has('KeyS')) move.sub(forward);
      if (this.input.keys.has('KeyD')) move.add(right);
      if (this.input.keys.has('KeyA')) move.sub(right);

      const speed = this.input.keys.has('ShiftLeft') ? RUN_SPEED : WALK_SPEED;
      const moving = move.lengthSq() > 0;
      if (moving) {
        move.normalize().multiplyScalar(speed);
        // face movement direction (smoothed)
        const targetRot = Math.atan2(move.x, move.z);
        this.mesh.rotation.y = dampAngle(this.mesh.rotation.y, targetRot, 12, dt);
        // advance the stride faster when running
        this.walkPhase += dt * speed * 2.4;
      }
      // ease limb-swing intensity in/out so idle relaxes to a neutral pose
      const targetIntensity = moving ? 1 : 0;
      this.walkIntensity += (targetIntensity - this.walkIntensity) * Math.min(1, 12 * dt);
      this.avatar.setWalkPhase(this.walkPhase, this.walkIntensity);

      this.velocity.x = move.x;
      this.velocity.z = move.z;
      this.velocity.y += GRAVITY * dt;

      this.position.addScaledVector(this.velocity, dt);

      // ---- resolve against BVH world ----
      const { grounded } = this.collision.resolveCapsule(this.position, HEIGHT, RADIUS);
      if (grounded && this.velocity.y < 0) this.velocity.y = 0;

      // safety net if we somehow fall through
      if (this.position.y < -5) this.teleport(new THREE.Vector3(0, 1.2, 4));
    }

    this.root.position.copy(this.position);

    // ---- third-person follow camera ----
    const lookTarget = this.targetLook.set(
      this.position.x,
      this.position.y + (this.isSitting ? 0.9 : 1.4),
      this.position.z,
    );
    const off = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch),
    ).multiplyScalar(this.isSitting ? 3.2 : this.camDist);

    const desired = lookTarget.clone().add(off);
    this.camera.position.lerp(desired, 1 - Math.exp(-8 * dt));
    this.camera.lookAt(lookTarget);
  }
}

/** exponential smoothing for angles, shortest path */
function dampAngle(current: number, target: number, lambda: number, dt: number) {
  let delta = target - current;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return current + delta * (1 - Math.exp(-lambda * dt));
}
