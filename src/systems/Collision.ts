/**
 * CollisionWorld — merges all static geometry into a single mesh,
 * builds a BVH over it (three-mesh-bvh), and resolves a capsule
 * against it via shapecast. Same technique the abeto analysis
 * attributes to three-mesh-bvh: fast spatial queries in a
 * traversable world.
 */
import * as THREE from 'three/webgpu';
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
  MeshBVH,
  MeshBVHHelper,
} from 'three-mesh-bvh';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Install BVH acceleration on all raycasts
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const _tri = new THREE.Triangle();
const _triPoint = new THREE.Vector3();
const _capsulePoint = new THREE.Vector3();
const _box = new THREE.Box3();
const _segment = new THREE.Line3();

export class CollisionWorld {
  collider!: THREE.Mesh;

  build(meshes: THREE.Mesh[]) {
    const geoms: THREE.BufferGeometry[] = [];
    for (const m of meshes) {
      m.updateWorldMatrix(true, false);
      const g = m.geometry.clone().applyMatrix4(m.matrixWorld);
      // keep only position — merged collider doesn't need uv/normals variance
      for (const key of Object.keys(g.attributes)) {
        if (key !== 'position') g.deleteAttribute(key);
      }
      geoms.push(g.toNonIndexed());
    }
    const merged = mergeGeometries(geoms, false);
    merged.boundsTree = new MeshBVH(merged);
    this.collider = new THREE.Mesh(merged);
  }

  /**
   * Resolve a capsule (segment + radius) against the world.
   * Mutates `position` to push the capsule out of geometry.
   * Returns true if the capsule touched ground-ish surfaces.
   */
  resolveCapsule(
    position: THREE.Vector3,
    height: number,
    radius: number,
  ): { grounded: boolean } {
    const bvh = (this.collider.geometry as any).boundsTree as MeshBVH;

    // capsule segment in world space (feet → head)
    _segment.start.copy(position);
    _segment.start.y += radius;
    _segment.end.copy(position);
    _segment.end.y += height - radius;

    _box.makeEmpty();
    _box.expandByPoint(_segment.start);
    _box.expandByPoint(_segment.end);
    _box.min.addScalar(-radius);
    _box.max.addScalar(radius);

    let grounded = false;

    bvh.shapecast({
      intersectsBounds: (box) => box.intersectsBox(_box),
      intersectsTriangle: (tri) => {
        // NOTE: returns plain distance (not squared) — see ExtendedTriangle source
        const dist = tri.closestPointToSegment(_segment, _triPoint, _capsulePoint);
        if (dist < radius) {
          const depth = radius - dist;
          const dir = _capsulePoint.sub(_triPoint).normalize();
          // if the pushout is mostly vertical-up, we're standing on it
          if (dir.y > 0.7) grounded = true;
          _segment.start.addScaledVector(dir, depth);
          _segment.end.addScaledVector(dir, depth);
        }
        return false;
      },
    });

    position.copy(_segment.start);
    position.y -= radius;
    return { grounded };
  }

  /** visual debug helper */
  debugMesh() {
    const helper = new MeshBVHHelper(this.collider, 8);
    return helper;
  }
}
