/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-continue */
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// import { matrixAutoUpdate } from "@/core/Constants";
import GeometryUtils from './subclass/GeometryUtils';
import MaterialUtils from './subclass/MaterialUtils';

const matrixAutoUpdate = true;

/**
 * MergeHelper 类用于合并给定对象的子对象
 */
export default class MergeHelper {
  object: THREE.Object3D;

  counter = 0; // 用于避免打印过多日志

  constructor(object: THREE.Object3D) {
    this.object = object;
  }

  /**
   * 合并给定对象的子对象。
   * @param deepMerge与deepMerge是假的，它会尝试合并同一级别和相同父级中的对象;
   *   对于deepMerge，它试图在整个根对象的所有级别上合并;
   */
  public merge(deepMerge = true) {
    this.counter = 0;
    const startTime = Date.now();
    this.mergeInner(this.object);
    if (deepMerge) {
      this.deepMerge(this.object);
    }
    console.log(`[Merge] merge() costed ${(Date.now() - startTime) / 1000}s`);
  }

  /**
   * 合并给定对象的子对象。
   * 如果对象的材质相同，则可以将它们合并。
   */
  private mergeInner(object: THREE.Object3D) {
    if (!object.children || object.children.length === 0) {
      return;
    }
    const childCount = object.children.length;

    // 对可合并的索引进行分组。例如 {0： { 索引： [0， 3， 4]}}
    // 意味着0、3、4具有相同的材料可以合并
    const dict: { [firstIndex: number]: { indexes: number[] } } = {};
    // 存储能够但尚未找到相同材质的对象的索引。
    // 非InstIndexes用于提高性能（时间空间），有了这个，它可以检查更少的对象。
    const nonMergeIndexes: number[] = [];
    for (let i = 0; i < childCount; ++i) {
      const oi = object.children[i] as THREE.Mesh; // 对象 i
      // 递归调用，深度优先，先处理后代
      this.mergeInner(oi);
      if (oi.children && oi.children.length > 0) continue; // 仅合并叶节点，跳过父节点
      if (!oi.geometry) continue; // 小品任何一个没有几何

      let foundMergeableObject = false;
      // 为了获得更好的命中率（性能），首先要找出字典中是否存在相同的几何形状和材料
      const values = Object.values(dict);
      for (let j = values.length - 1; j >= 0; --j) {
        // 从后到前搜索以获得更好的命中率
        const k = values[j].indexes[0];
        foundMergeableObject = this.tryHandleMergeableObjects(object, i, k, dict, nonMergeIndexes);
        if (foundMergeableObject) {
          break;
        }
      }

      for (let j = nonMergeIndexes.length - 1; !foundMergeableObject && j >= 0; --j) {
        const k = nonMergeIndexes[j];
        foundMergeableObject = this.tryHandleMergeableObjects(object, i, k, dict, nonMergeIndexes);
        if (foundMergeableObject) {
          break;
        }
      }
      if (!foundMergeableObject) {
        nonMergeIndexes.push(i);
      }
    }
    if (Object.keys(dict).length <= 0) {
      return;
    }
    // 控制台.log（字典）

    // 创建新的合并几何图形
    const mergedMeshes: THREE.Mesh[] = [];
    const indexesToBeRemoved: number[] = []; // 存储以后要删除的所有索引
    Object.values(dict).forEach((value: any) => {
      const { indexes } = value;
      const firstObj = object.children[indexes[0]] as THREE.Mesh;
      let geometries: THREE.BufferGeometry[] = [];
      indexes.forEach((index: number) => {
        const obj = object.children[index];
        obj.updateMatrixWorld(true);
        if (obj instanceof THREE.Mesh) {
          const geom = obj.geometry.clone(); // 需要克隆几何图形，因为一个几何体可以由许多对象共享
          GeometryUtils.tryConvertInterleavedBufferAttributes(geom);
          geom.applyMatrix4(obj.matrix);

          if (!geom.hasAttribute('uv')) {
            this.applyBoxUV(geom, undefined, undefined);
            geom.attributes.uv.needsUpdate = true;
          }
          geometries.push(geom);
          indexesToBeRemoved.push(index);
        }
      });
      if (geometries.length > 0) {
        const mergedBufferGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
        if (!mergedBufferGeometry) return;
        geometries.forEach((geom: THREE.BufferGeometry) => geom.dispose()); // 尽快处置
        geometries = [];
        const mergedMesh = new THREE.Mesh(mergedBufferGeometry, firstObj.material);
        mergedMesh.name = `[Merged] ${firstObj.name}`; // 现在，使用了第一个对象的名称
        mergedMesh.userData.selectable = false; // 将“可选”设置为 false，因为选择合并对象没有意义
        mergedMesh.matrixAutoUpdate = matrixAutoUpdate;
        if (!matrixAutoUpdate) {
          mergedMesh.updateMatrix();
        }
        mergedMesh.updateMatrixWorld(true);
        mergedMesh.updateWorldMatrix(true, true);
        mergedMeshes.push(mergedMesh);
      }
    });

    // 删除原始对象
    indexesToBeRemoved.sort((a, b) => b - a); // 需要从后到前删除，顺序降序
    indexesToBeRemoved.forEach((i) => {
      const o = object.children[i];
      object.remove(o);
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
      }
    });

    // 添加新网格
    mergedMeshes.forEach((mesh) => {
      // object.children.push（） 比 object.add（） 具有更好的性能，因为前者没有调度事件等。
      mesh.parent = object;
      object.children.push(mesh);
    });
    object.updateMatrix(); // 需要调用它，因为object.matrixAutoUpdate是假的
    if (this.counter++ < 2) {
      console.log(`[Merge] ${indexesToBeRemoved.length}(out of ${childCount}) objects merged to ${mergedMeshes.length} Meshes`);
    } else {
      console.log(`[Merge] ${indexesToBeRemoved.length}/${childCount} -> ${mergedMeshes.length}`);
    }
  }

  /**
   * @param对象父对象
   * @param i index of for object.children[]
   * @param k 索引 for object.children[]
   * @param用于存储可合并对象的命令
   * @param用于提高性能的非合并索引
   */
  private tryHandleMergeableObjects(
    object: THREE.Object3D,
    i: number,
    k: number,
    dict: { [firstIndex: number]: { indexes: number[] } },
    nonMergeIndexes: number[],
  ) {
    // 如果材料相同，则可以合并它们
    let foundMergeableObject = false;
    const oi = object.children[i] as THREE.Mesh;
    const ok = object.children[k] as THREE.Mesh;
    if (MaterialUtils.materialsEquals(oi.material, ok.material)) {
      // 调用 MaterialUtils.materialsEquals（） 仅用于深度合并
      if (!dict[k]) {
        dict[k] = { indexes: [k] };
        this.removeFromArray(nonMergeIndexes, k);
      }
      dict[k].indexes.push(i);
      foundMergeableObject = true;
    }
    return foundMergeableObject;
  }

  /**
   * 合并给定对象的所有对象，不仅是直接子对象，还包括后代（跨所有级别）。
   * 如果对象的材质相同，则可以将它们合并。
   * 最好先调用 mergeInner，然后再调用 deepMerge 以获得更好的性能。
   */
  private deepMerge(object: THREE.Object3D) {
    // 以对可合并的对象进行分组。例如 {objectId0： { objects： [object0， object2， object8]}}
    // 表示对象0、对象2、对象8具有相同的材料可以合并。
    // 在这里，我们存储Object3D而不是id，因为当有很多对象时，它更快。
    const dict: {
      [firstObjectId: number]: { material: any; objects: THREE.Object3D[] };
    } = {};
    // 首先遍历所有对象以找到可合并的对象
    let totalCount = 0;
    object.traverse((obj: THREE.Object3D) => {
      if (!(obj instanceof THREE.Mesh) || !obj.geometry || !obj.material) {
        return;
      }
      obj.updateMatrixWorld(true);
      GeometryUtils.tryConvertInterleavedBufferAttributes(obj.geometry); // 尝试处理交错缓冲区属性
      let foundMergeableObject = false;
      const values = Object.values(dict);
      for (let i = values.length - 1; i >= 0; --i) {
        // 从后到前搜索以获得更好的命中率
        if (MaterialUtils.materialsEquals(values[i].material, obj.material)) {
          values[i].objects.push(obj);
          foundMergeableObject = true;
          break;
        }
      }
      if (!foundMergeableObject) {
        dict[obj.id] = {
          material: obj.material,
          objects: [obj] /* ， geometry geometry： [obj.geometry.clone（）] */,
        };
      }
      totalCount++;
    });

    // 由于我们将几何体移动到组下的另一个合并网格，因此以下是结构：
    // - 根对象
    //  - 合并对象组
    //    - 合并对象 1
    // 需要考虑每个祖先级别的几何矩阵
    const applyMatrix = (geom: THREE.BufferGeometry, obj: THREE.Object3D): THREE.BufferGeometry => {
      geom.applyMatrix4(obj.matrix);
      obj.updateMatrixWorld(true);
      if (obj.parent && obj.parent !== object) {
        // 还应用父矩阵，直到到达“对象”
        applyMatrix(geom, obj.parent);
      }
      return geom;
    };

    // 创建合并网格
    const group = new THREE.Group();
    const values = Object.values(dict).filter((value) => value.objects.length > 1); // 仅当材料被 1 个以上的 ojbect 使用时才合并
    group.name = `Merged objects (${values.length})`;

    for (let i = values.length - 1; i >= 0; --i) {
      // 从后到前搜索以获得更好的命中率
      const value = values[i];
      let geometries: THREE.BufferGeometry[] = [];
      for (let j = 0; j < value.objects.length; ++j) {
        const obj: any = value.objects[j];
        // child.name == "Obj3d66-4385389-1-502" || child.name == "物体1823"
        const geom: any = applyMatrix((obj as THREE.Mesh).geometry.clone(), obj); // 需要克隆几何图形，因为一个几何体可以由许多对象共享
        if (!geom.hasAttribute('uv')) {
          if (obj.material.name !== '_12323.001') {
            this.applyBoxUV(geom, undefined, undefined);
            // let three.js know
            geom.attributes.uv.needsUpdate = true;
          } else {
            geom.deleteAttribute('uv');
          }
        }
        // geom.deleteAttribute("uv");
        geometries.push(geom);
      }
      const geom = BufferGeometryUtils.mergeBufferGeometries(geometries);

      geometries.forEach((geom: THREE.BufferGeometry) => geom.dispose()); // 尽快处置
      geometries = [];
      if (geom) {
        if (
          value.material.name === 'qiang.001' ||
          value.material.name === 'qiang2.001' ||
          value.material.name === 'hei.001' ||
          value.material.name === '_031.001'
        ) {
          value.objects = [];
          continue;
        }

        const mergedMesh = new THREE.Mesh(geom, value.material);
        mergedMesh.name = `[Merged] ${value.material.name}`; // 现在，使用了第一个对象的名称
        mergedMesh.userData.selectable = false; // 将“可选”设置为 false，因为选择合并对象没有意义
        mergedMesh.matrixAutoUpdate = matrixAutoUpdate;
        if (!matrixAutoUpdate) {
          mergedMesh.updateMatrix();
        }
        group.updateMatrix();
        mergedMesh.parent = group;
        group.children.push(mergedMesh);
      } else {
        // 它可能无法合并，因为交错BufferAttributes，position等。
        // 在这种情况下，请清理 id，以便它不会删除这些对象
        value.objects = [];
      }
    }

    // delete original meshes
    let removedCount = 0;
    for (let i = values.length - 1; i >= 0; --i) {
      // 从后到前搜索以获得更好的命中率
      values[i].objects.forEach((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.removeFromParent(); // removeFromParent 是从 r129 添加的
          obj.geometry.dispose();

          removedCount++;
        }
      });
      values[i].objects = [];
    }

    if (group.children.length) {
      group.matrixAutoUpdate = matrixAutoUpdate;
      if (!matrixAutoUpdate) {
        group.updateMatrix();
      }
      group.parent = object;
      object.children.push(group);
      console.log(object);
    }
    console.log(`[Merge] ${removedCount}(out of ${totalCount}) objects merged to ${group.children.length} Meshes during deepMerge`);
  }

  /**
   * 从数组中删除数字
   */
  removeFromArray(arr: number[], toBeRemoved: number) {
    for (let i = arr.length - 1; i >= 0; --i) {
      // 从后到前做，以获得更好的命中率
      if (arr[i] === toBeRemoved) {
        arr.splice(i, 1);
        return;
      }
    }
  }

  _applyBoxUV(
    geom: {
      attributes: { position: { array: string | any[] }; uv: { array: any } | undefined };
      addAttribute: (arg0: string, arg1: THREE.Float32BufferAttribute) => void;
      index: { array: string | any[] };
    },
    transformMatrix: THREE.Matrix4,
    bbox: THREE.Box3,
    bbox_max_size: number,
  ) {
    const coords: any = [];
    coords.length = (2 * geom.attributes.position.array.length) / 3;

    // geom.removeAttribute('uv');
    if (geom.attributes.uv === undefined) {
      geom.attributes.uv = new THREE.Float32BufferAttribute(coords, 2);
    }

    // maps 3 verts of 1 face on the better side of the cube
    // side of the cube can be XY, XZ or YZ
    const makeUVs = function (v0: THREE.Vector3, v1: THREE.Vector3, v2: THREE.Vector3) {
      // pre-rotate the model so that cube sides match world axis
      v0.applyMatrix4(transformMatrix);
      v1.applyMatrix4(transformMatrix);
      v2.applyMatrix4(transformMatrix);

      // get normal of the face, to know into which cube side it maps better
      const n = new THREE.Vector3();
      n.crossVectors(v1.clone().sub(v0), v1.clone().sub(v2)).normalize();

      n.x = Math.abs(n.x);
      n.y = Math.abs(n.y);
      n.z = Math.abs(n.z);

      const uv0 = new THREE.Vector2();
      const uv1 = new THREE.Vector2();
      const uv2 = new THREE.Vector2();
      // xz mapping
      if (n.y > n.x && n.y > n.z) {
        uv0.x = (v0.x - bbox.min.x) / bbox_max_size;
        uv0.y = (bbox.max.z - v0.z) / bbox_max_size;

        uv1.x = (v1.x - bbox.min.x) / bbox_max_size;
        uv1.y = (bbox.max.z - v1.z) / bbox_max_size;

        uv2.x = (v2.x - bbox.min.x) / bbox_max_size;
        uv2.y = (bbox.max.z - v2.z) / bbox_max_size;
      } else if (n.x > n.y && n.x > n.z) {
        uv0.x = (v0.z - bbox.min.z) / bbox_max_size;
        uv0.y = (v0.y - bbox.min.y) / bbox_max_size;

        uv1.x = (v1.z - bbox.min.z) / bbox_max_size;
        uv1.y = (v1.y - bbox.min.y) / bbox_max_size;

        uv2.x = (v2.z - bbox.min.z) / bbox_max_size;
        uv2.y = (v2.y - bbox.min.y) / bbox_max_size;
      } else if (n.z > n.y && n.z > n.x) {
        uv0.x = (v0.x - bbox.min.x) / bbox_max_size;
        uv0.y = (v0.y - bbox.min.y) / bbox_max_size;

        uv1.x = (v1.x - bbox.min.x) / bbox_max_size;
        uv1.y = (v1.y - bbox.min.y) / bbox_max_size;

        uv2.x = (v2.x - bbox.min.x) / bbox_max_size;
        uv2.y = (v2.y - bbox.min.y) / bbox_max_size;
      }

      return {
        uv0,
        uv1,
        uv2,
      };
    };

    if (geom.index) {
      // is it indexed buffer geometry?
      for (let vi = 0; vi < geom.index.array.length; vi += 3) {
        const idx0 = geom.index.array[vi];
        const idx1 = geom.index.array[vi + 1];
        const idx2 = geom.index.array[vi + 2];

        const vx0 = geom.attributes.position.array[3 * idx0];
        const vy0 = geom.attributes.position.array[3 * idx0 + 1];
        const vz0 = geom.attributes.position.array[3 * idx0 + 2];

        const vx1 = geom.attributes.position.array[3 * idx1];
        const vy1 = geom.attributes.position.array[3 * idx1 + 1];
        const vz1 = geom.attributes.position.array[3 * idx1 + 2];

        const vx2 = geom.attributes.position.array[3 * idx2];
        const vy2 = geom.attributes.position.array[3 * idx2 + 1];
        const vz2 = geom.attributes.position.array[3 * idx2 + 2];

        const v0 = new THREE.Vector3(vx0, vy0, vz0);
        const v1 = new THREE.Vector3(vx1, vy1, vz1);
        const v2 = new THREE.Vector3(vx2, vy2, vz2);

        const uvs = makeUVs(v0, v1, v2);

        coords[2 * idx0] = uvs.uv0.x;
        coords[2 * idx0 + 1] = uvs.uv0.y;

        coords[2 * idx1] = uvs.uv1.x;
        coords[2 * idx1 + 1] = uvs.uv1.y;

        coords[2 * idx2] = uvs.uv2.x;
        coords[2 * idx2 + 1] = uvs.uv2.y;
      }
    } else {
      for (let vi = 0; vi < geom.attributes.position.array.length; vi += 9) {
        const vx0 = geom.attributes.position.array[vi];
        const vy0 = geom.attributes.position.array[vi + 1];
        const vz0 = geom.attributes.position.array[vi + 2];

        const vx1 = geom.attributes.position.array[vi + 3];
        const vy1 = geom.attributes.position.array[vi + 4];
        const vz1 = geom.attributes.position.array[vi + 5];

        const vx2 = geom.attributes.position.array[vi + 6];
        const vy2 = geom.attributes.position.array[vi + 7];
        const vz2 = geom.attributes.position.array[vi + 8];

        const v0 = new THREE.Vector3(vx0, vy0, vz0);
        const v1 = new THREE.Vector3(vx1, vy1, vz1);
        const v2 = new THREE.Vector3(vx2, vy2, vz2);

        const uvs = makeUVs(v0, v1, v2);

        const idx0 = vi / 3;
        const idx1 = idx0 + 1;
        const idx2 = idx0 + 2;

        coords[2 * idx0] = uvs.uv0.x;
        coords[2 * idx0 + 1] = uvs.uv0.y;

        coords[2 * idx1] = uvs.uv1.x;
        coords[2 * idx1 + 1] = uvs.uv1.y;

        coords[2 * idx2] = uvs.uv2.x;
        coords[2 * idx2 + 1] = uvs.uv2.y;
      }
    }

    geom.attributes.uv.array = new Float32Array(coords);
  }

  applyBoxUV(bufferGeometry: any, transformMatrix: THREE.Matrix4 | undefined, boxSize: number | undefined) {
    if (transformMatrix === undefined) {
      transformMatrix = new THREE.Matrix4();
    }

    if (boxSize === undefined) {
      const geom = bufferGeometry;
      geom.computeBoundingBox();
      const bbox = geom.boundingBox;

      const bbox_size_x = bbox.max.x - bbox.min.x;
      const bbox_size_z = bbox.max.z - bbox.min.z;
      const bbox_size_y = bbox.max.y - bbox.min.y;

      boxSize = Math.max(bbox_size_x, bbox_size_y, bbox_size_z);
    }

    const uvBbox = new THREE.Box3(new THREE.Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2), new THREE.Vector3(boxSize / 2, boxSize / 2, boxSize / 2));

    this._applyBoxUV(bufferGeometry, transformMatrix, uvBbox, boxSize);
  }
}
