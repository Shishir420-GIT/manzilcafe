/**
 * CafeBlockout — the café interior modeled on the pixel-art reference:
 * white-brick walls, ivy-wrapped columns and garlands, chalkboard menus,
 * shelves of cups, a slatted-wood bar with a cream top and espresso
 * machine, maroon booths, pendant lamps — and crucially an OPEN
 * ENTRANCE in the window wall leading to an exterior sidewalk, so
 * people can come and go.
 */
import * as THREE from 'three/webgpu';
import {
  floorMaterial,
  pavementMaterial,
  brickMaterial,
  chalkboardMaterial,
  woodMaterial,
  darkWoodMaterial,
  creamMaterial,
  metalMaterial,
  glassMaterial,
  bulbMaterial,
  backdropMaterial,
  matte,
} from './Materials';
import { IvyBuilder } from './Ivy';

export interface Seat {
  id: string;
  position: THREE.Vector3;
  facing: THREE.Vector3;
}

export interface CafeWorld {
  root: THREE.Group;
  colliders: THREE.Mesh[];
  seats: Seat[];
  steamSpots: THREE.Vector3[];
}

const ROOM = { w: 18, d: 14, h: 4.2 };
const DOOR = { z0: 1.6, z1: 3.4 }; // doorway gap on the window wall (x = +9)

export function buildCafe(): CafeWorld {
  const root = new THREE.Group();
  const colliders: THREE.Mesh[] = [];
  const seats: Seat[] = [];
  const steamSpots: THREE.Vector3[] = [];
  const ivy = new IvyBuilder();

  const add = (m: THREE.Mesh, collide = true) => {
    root.add(m);
    if (collide) colliders.push(m);
    return m;
  };
  /** invisible collision proxy */
  const proxy = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matte(0));
    p.position.set(x, y, z);
    p.visible = false;
    add(p);
  };

  // ================= FLOORS =================
  const floor = new THREE.Mesh(new THREE.BoxGeometry(ROOM.w, 0.2, ROOM.d), floorMaterial());
  floor.position.y = -0.1;
  floor.receiveShadow = true;
  add(floor);

  // exterior sidewalk beyond the entrance (x: 9 → 15)
  const pavement = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 18), pavementMaterial());
  pavement.position.set(12, -0.1, 0);
  pavement.receiveShadow = true;
  add(pavement);

  // invisible fences so nobody wanders off the sidewalk edge
  proxy(6, 2, 0.3, 12, 1, 9);
  proxy(6, 2, 0.3, 12, 1, -9);
  proxy(0.3, 2, 18, 15, 1, 0);

  // sunlit street backdrop
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), backdropMaterial());
  backdrop.position.set(15.9, 5, 0);
  backdrop.rotation.y = -Math.PI / 2;
  add(backdrop, false);

  // ================= CEILING + BEAMS =================
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(ROOM.w, 0.2, ROOM.d), darkWoodMaterial(0x2e1c12));
  ceiling.position.y = ROOM.h + 0.1;
  add(ceiling, false);

  for (const bz of [-5, -1.5, 2, 5.5]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(ROOM.w, 0.2, 0.34), darkWoodMaterial(0x241509));
    beam.position.set(0, ROOM.h - 0.1, bz);
    add(beam, false);
  }

  // ================= WALLS =================
  const mkWall = (
    mat: THREE.Material, w: number, h: number, x: number, y: number, z: number, ry = 0,
  ) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.3), mat);
    wall.position.set(x, y, z);
    wall.rotation.y = ry;
    wall.receiveShadow = true;
    add(wall);
    return wall;
  };

  mkWall(brickMaterial('x'), ROOM.w, ROOM.h, 0, ROOM.h / 2, -ROOM.d / 2); // back
  mkWall(brickMaterial('x'), ROOM.w, ROOM.h, 0, ROOM.h / 2, ROOM.d / 2);  // front
  mkWall(brickMaterial('z'), ROOM.d, ROOM.h, -ROOM.w / 2, ROOM.h / 2, 0, Math.PI / 2); // left

  // ---- right wall = WINDOW WALL with the entrance ----
  buildWindowWall(root, colliders, proxy);

  // ================= COLUMNS (brick + ivy) =================
  for (const [cx, cz] of [[1.8, -0.8], [-4.6, 1.2]] as const) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.6, ROOM.h, 0.6), brickMaterial('x'));
    col.position.set(cx, ROOM.h / 2, cz);
    col.castShadow = col.receiveShadow = true;
    add(col);
    ivy.wrapColumn(new THREE.Vector3(cx, 0.1, cz), ROOM.h - 0.4, 0.32);
  }

  // ================= BAR =================
  const barX = -2, barZ = -4.6;
  const barBase = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.1, 1.3), woodMaterial());
  barBase.position.set(barX, 0.55, barZ);
  barBase.castShadow = barBase.receiveShadow = true;
  add(barBase);

  const barTop = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.1, 1.6), creamMaterial());
  barTop.position.set(barX, 1.15, barZ);
  barTop.castShadow = true;
  add(barTop, false);

  // mugs lined up on the bar
  const mugGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.12, 12);
  const mugs = new THREE.InstancedMesh(mugGeo, creamMaterial(), 4);
  const dummy = new THREE.Object3D();
  [-4.3, -3.7, -3.1, -0.6].forEach((mx, i) => {
    dummy.position.set(mx, 1.26, barZ + 0.15);
    dummy.updateMatrix();
    mugs.setMatrixAt(i, dummy.matrix);
  });
  root.add(mugs);

  // ---- espresso machine on the bar ----
  const machine = new THREE.Group();
  const mBody = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.6, 0.72), metalMaterial());
  mBody.position.y = 0.36;
  mBody.castShadow = true;
  machine.add(mBody);
  const mTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.76), metalMaterial(0xbfbfba));
  mTop.position.y = 0.7;
  machine.add(mTop);
  for (let i = 0; i < 3; i++) { // warming cups on top
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.08, 10), creamMaterial());
    c.position.set(-0.3 + i * 0.3, 0.78, 0);
    machine.add(c);
  }
  for (const gx of [-0.25, 0.25]) { // group heads
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 10), metalMaterial(0x9a9a94));
    head.position.set(gx, 0.12, 0.34);
    machine.add(head);
  }
  machine.position.set(0.4, 1.2, barZ);
  root.add(machine);
  proxy(1.1, 0.9, 0.8, 0.4, 1.65, barZ);
  steamSpots.push(new THREE.Vector3(0.4, 2.05, barZ));

  // ---- back counter + appliances ----
  const backCounter = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.95, 0.8), darkWoodMaterial(0x4a2c1a));
  backCounter.position.set(barX, 0.475, -6.45);
  backCounter.receiveShadow = true;
  add(backCounter);
  const grinder = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.3), matte(0x2c2c2c, 0.5));
  grinder.position.set(-4.2, 1.25, -6.45);
  grinder.castShadow = true;
  add(grinder, false);

  // ================= CHALKBOARDS (back wall) =================
  for (const bx of [-6.6, -4.7]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.0, 0.08), darkWoodMaterial(0x5a3620));
    frame.position.set(bx, 2.7, -6.8);
    add(frame, false);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 0.09), chalkboardMaterial());
    board.position.set(bx, 2.7, -6.79);
    add(board, false);
  }

  // ================= SHELVES + CUPS (back wall) =================
  const cupGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.11, 10);
  const shelfCups: THREE.Matrix4[] = [];
  for (const sy of [2.1, 2.7, 3.3]) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.07, 0.35), darkWoodMaterial(0x5a3620));
    shelf.position.set(0.6, sy, -6.7);
    shelf.castShadow = true;
    add(shelf, false);
    for (let i = 0; i < 7; i++) {
      dummy.position.set(-1.2 + i * 0.6, sy + 0.09, -6.7);
      dummy.updateMatrix();
      shelfCups.push(dummy.matrix.clone());
    }
    // tiny shelf plant on each end
    ivy.bush(new THREE.Vector3(2.6, sy + 0.14, -6.7), 0.12, 10);
  }
  const cups = new THREE.InstancedMesh(cupGeo, creamMaterial(), shelfCups.length);
  shelfCups.forEach((m, i) => cups.setMatrixAt(i, m));
  root.add(cups);

  // ================= BOOTHS =================
  buildBooth(4.2, 3.0, 'boothA');
  buildBooth(-3.8, 3.6, 'boothB');
  // steaming cup on booth A's table
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.11, 12), creamMaterial());
  cup.position.set(4.0, 0.86, 3.0);
  root.add(cup);
  steamSpots.push(new THREE.Vector3(4.0, 0.98, 3.0));

  function buildBooth(x: number, z: number, id: string) {
    const maroon = matte(0x8a3a2e, 0.75);
    // table
    const tTop = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 1.5), woodMaterial(0x6a3a22));
    tTop.position.set(x, 0.78, z);
    tTop.castShadow = true;
    root.add(tTop);
    const tLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.14), darkWoodMaterial());
    tLeg.position.set(x, 0.39, z);
    root.add(tLeg);
    proxy(1.1, 1.0, 1.5, x, 0.5, z);

    // benches facing each other across the table (±x)
    for (const side of [-1, 1]) {
      const bx = x + side * 1.05;
      const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 1.5), maroon);
      seatMesh.position.set(bx, 0.275, z);
      seatMesh.castShadow = true;
      add(seatMesh);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 1.5), maroon);
      back.position.set(bx + side * 0.28, 0.575, z);
      back.castShadow = true;
      add(back);
      seats.push({
        id: `${id}-${side}`,
        position: new THREE.Vector3(bx, 0.55, z),
        facing: new THREE.Vector3(-side, 0, 0),
      });
    }
  }

  // ================= ROUND TABLE + CHAIRS =================
  {
    const x = -6.4, z = -1.2;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.07, 24), woodMaterial(0x6a3a22));
    top.position.set(x, 0.78, z);
    top.castShadow = true;
    root.add(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.78, 12), darkWoodMaterial());
    leg.position.set(x, 0.39, z);
    root.add(leg);
    proxy(1.4, 1.0, 1.4, x, 0.5, z);

    for (const side of [-1, 1]) {
      const cz = z + side * 1.15;
      const chair = buildChair();
      chair.position.set(x, 0, cz);
      chair.rotation.y = side > 0 ? Math.PI : 0;
      root.add(chair);
      proxy(0.55, 1.0, 0.55, x, 0.5, cz);
      seats.push({
        id: `chair-${side}`,
        position: new THREE.Vector3(x, 0.55, cz),
        facing: new THREE.Vector3(0, 0, -side),
      });
    }
  }

  // ================= PENDANT LAMPS =================
  const lampSpots: Array<[number, number, boolean]> = [
    [-3.6, -4.6, true],   // over the bar (shadow)
    [-0.4, -4.6, false],
    [4.2, 3.0, true],     // over booth A (shadow)
    [-3.8, 3.6, false],
    [1.8, 0.8, false],
  ];
  for (const [x, z, shadow] of lampSpots) {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.2, 6), matte(0x2a1a10));
    cord.position.set(x, ROOM.h - 0.6, z);
    add(cord, false);
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), matte(0xcaa15e, 0.4));
    shade.position.set(x, ROOM.h - 1.2, z);
    add(shade, false);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), bulbMaterial());
    bulb.position.set(x, ROOM.h - 1.32, z);
    add(bulb, false);

    const light = new THREE.PointLight(0xffb35c, 11, 8.5, 1.9);
    light.position.set(x, ROOM.h - 1.5, z);
    if (shadow) {
      light.castShadow = true;
      light.shadow.mapSize.set(512, 512);
    }
    root.add(light);
  }

  // ================= PLANTS =================
  for (const [px, pz] of [[-4.6, 2.4], [7.9, 6.0], [-8.2, 5.9]] as const) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.42, 14), matte(0xb0572f, 0.85));
    pot.position.set(px, 0.21, pz);
    pot.castShadow = true;
    add(pot);
    ivy.bush(new THREE.Vector3(px, 0.55, pz), 0.34, 40);
  }

  // ================= IVY GARLANDS =================
  const H = ROOM.h - 0.25;
  ivy.garland(new THREE.Vector3(1.8, H, -0.8), new THREE.Vector3(-4.6, H, 1.2), 0.6);
  ivy.garland(new THREE.Vector3(1.8, H, -0.8), new THREE.Vector3(8.8, H, 2.0), 0.7);
  ivy.garland(new THREE.Vector3(-4.6, H, 1.2), new THREE.Vector3(-8.8, H, -1.5), 0.5);
  ivy.garland(new THREE.Vector3(-5.2, H, -4.6), new THREE.Vector3(1.4, H, -4.6), 0.55);
  ivy.garland(new THREE.Vector3(8.8, H, -6.0), new THREE.Vector3(8.8, H, 1.2), 0.6);
  ivy.garland(new THREE.Vector3(-8.8, H, 2.5), new THREE.Vector3(-2.0, H, 6.8), 0.6);
  // vine climbing the door frame
  ivy.wrapColumn(new THREE.Vector3(9.0, 0.1, DOOR.z0 - 0.15), 3.2, 0.12);

  root.add(ivy.build());

  // ================= LIGHTING =================
  root.add(new THREE.HemisphereLight(0xf2dfbb, 0x4a3626, 0.75));

  const sun = new THREE.DirectionalLight(0xffdda6, 2.2);
  sun.position.set(14, 7, 4);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  root.add(sun, sun.target);

  return { root, colliders, seats, steamSpots };
}

/** Window wall (x = +9): cream sills, glass panes, frames — and the open doorway */
function buildWindowWall(
  root: THREE.Group,
  colliders: THREE.Mesh[],
  proxy: (w: number, h: number, d: number, x: number, y: number, z: number) => void,
) {
  const X = 9;
  const segments = [
    { z0: -7, z1: DOOR.z0 },
    { z0: DOOR.z1, z1: 7 },
  ];

  for (const { z0, z1 } of segments) {
    const len = z1 - z0;
    const cz = (z0 + z1) / 2;

    // cream sill + lintel
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.55, len), creamMaterial());
    sill.position.set(X, 0.275, cz);
    root.add(sill);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.65, len), brickMaterial('z'));
    lintel.position.set(X, 3.88, cz);
    root.add(lintel);

    // glass
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, len), glassMaterial());
    glass.position.set(X, 2.05, cz);
    root.add(glass);

    // frame posts
    const posts = Math.max(2, Math.round(len / 1.8) + 1);
    for (let i = 0; i < posts; i++) {
      const pz = z0 + (len * i) / (posts - 1);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.1, 0.16), darkWoodMaterial(0x4a2c1a));
      post.position.set(X, 2.05, pz);
      post.castShadow = true;
      root.add(post);
    }

    // one invisible collider covering the whole segment
    proxy(0.4, 4.2, len, X, 2.1, cz);
  }

  // door frame around the open gap
  const frameMat = darkWoodMaterial(0x4a2c1a);
  for (const pz of [DOOR.z0 - 0.08, DOOR.z1 + 0.08]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.3, 0.24), frameMat);
    post.position.set(X, 1.65, pz);
    post.castShadow = true;
    root.add(post);
  }
  const header = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, DOOR.z1 - DOOR.z0 + 0.5), frameMat);
  header.position.set(X, 3.35, (DOOR.z0 + DOOR.z1) / 2);
  root.add(header);
  // collider above the doorway only (the gap itself stays open!)
  proxy(0.4, 1.0, DOOR.z1 - DOOR.z0, X, 3.7, (DOOR.z0 + DOOR.z1) / 2);
}

function buildChair(): THREE.Group {
  const g = new THREE.Group();
  const mat = matte(0x6b3f22, 0.8);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), mat);
  seat.position.y = 0.5;
  seat.castShadow = true;
  g.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.06), mat);
  back.position.set(0, 0.8, -0.22);
  back.castShadow = true;
  g.add(back);

  for (const [lx, lz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]] as const) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), mat);
    leg.position.set(lx, 0.25, lz);
    g.add(leg);
  }
  return g;
}
