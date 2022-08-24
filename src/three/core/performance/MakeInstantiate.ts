/* eslint-disable max-len */
/* eslint-disable no-continue */
import * as THREE from 'three';
// import { matrixAutoUpdate } from "@/core/Constants";
import GeometryUtils from './subclass/GeometryUtils';
import MaterialUtils from './subclass/MaterialUtils';

const matrixAutoUpdate = true;
/**
 * 实例化帮助器类用于实例化给定对象的子对象
 */
export default class InstantiateHelper {
  object: THREE.Object3D;

  constructor(object: THREE.Object3D) {
    this.object = object;
  }

  /**
   * 初始化给定对象的子对象。
   */
  public instantiate() {
    const startTime = Date.now();
    this.instantiateInner(this.object);
    console.log(`[Inst] instantiate() costed ${(Date.now() - startTime) / 1000}s`);
  }

  /**
   * 初始化给定对象的子对象。
   * 如果对象的几何图形和材质相同，则可以对其进行实例化。
   */
  private instantiateInner(object: THREE.Object3D) {
    if (!object.children || object.children.length === 0) {
      return;
    }
    const childCount = object.children.length;

    // 对可实例化的索引进行分组。例如 {0： { 索引： [0， 3， 4]}}
    // 意味着0，3，4具有相同的几何形状，并且可以实例化材料
    const dict: { [firstIndex: number]: { indexes: number[] } } = {};
    // 存储能够但尚未找到相同几何图形和材质的对象的索引。
    // 非InstIndexes用于提高性能（时间空间），有了这个，它可以检查更少的对象。
    const nonInstIndexes: number[] = [];
    for (let i = 0; i < childCount; ++i) {
      const oi = object.children[i] as THREE.Mesh; // 对象 i
      // 递归调用，深度优先，先处理后代
      this.instantiateInner(oi);

      if (oi.children && oi.children.length > 0) continue; // 仅实例化叶节点，跳过父节点
      if (!oi.geometry) continue; // 小品任何一个没有几何

      let foundInstantableObject = false;
      // 为了获得更好的命中率（性能），首先要找出字典中是否存在相同的几何形状和材料
      const values = Object.values(dict);
      for (let j = values.length - 1; j >= 0; --j) {
        // 从后到前搜索以获得更好的命中率
        const k = values[j].indexes[0];
        const ok = object.children[k] as THREE.Mesh; // 对象 k
        // 如果几何形状和材料相同，则可以对它们进行实例化
        if (this.geometryEquals(oi.geometry, ok.geometry) && MaterialUtils.materialsEquals(oi.material, ok.material)) {
          if (!dict[k]) {
            dict[k] = { indexes: [k] };
            this.removeFromArray(nonInstIndexes, k);
          }
          dict[k].indexes.push(i);
          foundInstantableObject = true;
          break; // 中断，因为已经找到了相同的实例
        }
      }

      for (let j = nonInstIndexes.length - 1; !foundInstantableObject && j >= 0; --j) {
        const k = nonInstIndexes[j];
        const ok = object.children[k] as THREE.Mesh; // 对象 k
        // 如果几何形状和材料相同，则可以对它们进行实例化
        if (this.geometryEquals(oi.geometry, ok.geometry) && MaterialUtils.materialsEquals(oi.material, ok.material)) {
          if (!dict[k]) {
            dict[k] = { indexes: [k] };
            this.removeFromArray(nonInstIndexes, k);
          }
          dict[k].indexes.push(i);
          foundInstantableObject = true;
          break; // 中断，因为已经找到了相同的实例
        }
      }
      if (!foundInstantableObject) {
        nonInstIndexes.push(i);
      }
    }
    if (Object.keys(dict).length <= 0) {
      return;
    }
    // 控制台.log（字典）

    // 创建新实例
    const instances: THREE.InstancedMesh[] = [];
    const indexesToBeRemoved: number[] = []; // 存储以后要删除的所有索引
    Object.values(dict).forEach((value: any) => {
      const { indexes } = value;
      indexesToBeRemoved.push(...indexes);
      const firstObj = object.children[indexes[0]] as THREE.Mesh;
      let mat = firstObj.material;
      if (mat instanceof THREE.Material) {
        mat = (mat as THREE.Material).clone();
      } else if (Array.isArray(mat)) {
        const arr: THREE.Material[] = [];
        mat.forEach((m) => arr.push(m.clone()));
        mat = arr;
      }
      const instance = new THREE.InstancedMesh(firstObj.geometry, mat, indexes.length);
      instance.name = `[Instanced] ${firstObj.name}`; // 现在，使用了第一个对象的名称
      for (let i = 0; i < indexes.length; ++i) {
        const index = indexes[i];
        const obj = object.children[index];
        obj.updateMatrixWorld(true); // 需要更新矩阵，否则，对于某些模型来说会出错！
        instance.setMatrixAt(i, obj.matrix);
      }
      instance.matrixAutoUpdate = matrixAutoUpdate;
      if (!matrixAutoUpdate) {
        instance.updateMatrixWorld(true);
      }
      instances.push(instance);
    });

    // 删除原始对象
    indexesToBeRemoved.sort((a, b) => b - a); // 需要从后到前删除，顺序降序
    indexesToBeRemoved.forEach((i) => object.remove(object.children[i]));

    // 添加新实例
    instances.forEach((instance) => {
      // object.children.push（） 比 object.add（） 具有更好的性能，因为前者没有调度事件等。
      instance.parent = object;
      object.children.push(instance);
    });
    object.updateMatrix(); // 需要调用它，因为object.matrixAutoUpdate是假的
    console.log(`[Inst] ${indexesToBeRemoved.length}(out of ${childCount}) objects instanced to ${instances.length} InstancedMesh`);
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

  /**
   * 检查两个几何图形是否相等
   */
  private geometryEquals(g1: THREE.BufferGeometry, g2: THREE.BufferGeometry) {
    // 返回 g1 === g2
    return GeometryUtils.geometryEquals(g1, g2);
  }
}
