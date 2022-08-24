import * as THREE from 'three';

/**
 * 关于场景的利用方法
 */
export default class SceneUtils {
  /**
   * 获取场景中所有可见对象的边界框。
   * @param场景
   */
  static getVisibleObjectBoundingBox(scene: THREE.Scene): THREE.Box3 {
    const bbox = new THREE.Box3();
    scene.traverseVisible((object) => {
      if (object instanceof THREE.Mesh && object.userData.selectable !== false) {
        bbox.expandByObject(object);
      }
    });
    return bbox;
  }

  public static getObjectsBoundingBox(scene: THREE.Scene | THREE.Group, objectUuids: string[]): THREE.Box3 {
    const bbox = new THREE.Box3();
    objectUuids.forEach((uuid) => {
      const object = scene.getObjectByProperty('uuid', uuid);
      if (object) {
        const box = SceneUtils.getBoundingBox(object); // 使用 getBoundingBox 而不是 expandByObject 来为 InstancedMesh 工作
        if (!box.isEmpty()) {
          bbox.union(box);
        }
      }
    });
    return bbox;
  }

  /**
   * Box3.expandByObject() doesn't work well in some case.
   * E.g. when object's position is far away from object's center?
   * When objects are instanced?
   * That's why we need a method to find bounding box by object's children!
   * And, better to do sampling in case there are too many children.
   */
  public static getBoundingBox(object: THREE.Object3D, sampling = true): THREE.Box3 {
    const bbox = new THREE.Box3();
    if (object instanceof THREE.InstancedMesh) {
      return SceneUtils.getInstancedMeshBoundingBox(object);
    }
    if (object.children.length === 0) {
      bbox.expandByObject(object); // 对于叶对象，直接调用 expandByObject
      return bbox;
    }
    // now, need to get geometry from children
    const count = object.children.length;
    let divisor = 1; // 用于采样
    if (count > 20) divisor = 3; // sampling 1/3
    if (count > 100) divisor = 5;
    if (count > 200) divisor = 10;
    if (count > 1000) divisor = 100; // sampling 1/100
    object.updateMatrixWorld(false);
    // const matrixWorld = object.matrixWorld
    for (let i = 0; i < count; ++i) {
      const child = object.children[i] as any;
      // if don't do sampling, expand by each children; Otherwise, only expand by some children
      if (!sampling || i % divisor === 0) {
        child.updateMatrix();
        if (child instanceof THREE.InstancedMesh) {
          const box = SceneUtils.getInstancedMeshBoundingBox(child);
          // box.applyMatrix4（matrixWorld） // 需要考虑父级的世界矩阵
          bbox.union(box);
        } else {
          bbox.expandByObject(child);
        }
      }
    }
    return bbox;
  }

  /**
   * InstancedMesh是不同的，我们需要获取它的子网格才能获得边界框
   */
  public static getInstancedMeshBoundingBox(mesh: THREE.InstancedMesh): THREE.Box3 {
    const bbox = new THREE.Box3();
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < mesh.count; ++i) {
      mesh.getMatrixAt(i, matrix);
      const geom = mesh.geometry.clone();
      if (geom.boundingBox) {
        const box = geom.boundingBox.applyMatrix4(matrix);
        // eslint-disable-next-line max-len
        if (!box.isEmpty() && !isNaN(box.min.x) && !isNaN(box.min.y) && !isNaN(box.min.z) && !isNaN(box.max.x) && !isNaN(box.max.y) && !isNaN(box.max.z)) {
          bbox.union(box);
        }
      }
    }
    bbox.applyMatrix4(mesh.matrixWorld); // 需要应用矩阵世界
    return bbox;
  }
}
