import * as THREE from 'three';
import TweenUtils from '@/three/core/tween/TweenUtils';

// 创建一个HTML标签

const initExplodeModel = (modelObject: THREE.Object3D) => {
  if (!modelObject) return;

  // 计算模型中心
  const explodeBox = new THREE.Box3();
  explodeBox.setFromObject(modelObject);
  const explodeCenter = explodeBox.getCenter(new THREE.Vector3());

  const meshBox = new THREE.Box3();

  // 遍历整个模型，保存数据到userData上，以便爆炸函数使用
  modelObject.traverse((value: any) => {
    if (value.isMark || value.isMarkChild || value.isLine || value.isSprite) return;
    if (value.isMesh) {
      meshBox.setFromObject(value);

      const meshCenter = meshBox.getCenter(new THREE.Vector3());
      // 爆炸方向
      value.userData.worldDir = new THREE.Vector3().subVectors(meshCenter, explodeCenter).normalize();
      // 爆炸距离 mesh中心点到爆炸中心点的距离
      value.userData.worldDistance = new THREE.Vector3().subVectors(meshCenter, explodeCenter);
      // 原始坐标
      value.userData.originPosition = value.getWorldPosition(new THREE.Vector3());
      // mesh中心点
      value.userData.meshCenter = meshCenter.clone();
      value.userData.explodeCenter = explodeCenter.clone();
    }
  });
};

// 模型爆炸函数
const explodeModel = (model: THREE.Object3D, scalar: number) => {
  model.traverse((value) => {
    // @ts-ignore
    if (!value.isMesh || !value.userData.originPosition) return;
    const distance = value.userData.worldDir.clone().multiplyScalar(value.userData.worldDistance.length() * scalar);
    const offset = new THREE.Vector3().subVectors(value.userData.meshCenter, value.userData.originPosition);
    const center = value.userData.explodeCenter;
    const newPos = new THREE.Vector3().copy(center).add(distance).sub(offset);
    const localPosition = value.parent?.worldToLocal(newPos.clone());
    if (localPosition) {
      TweenUtils.TweenRun(value.position, {
        x: localPosition.x,
        y: localPosition.y,
        z: localPosition.z,
      });
    }
  });
};

export { initExplodeModel, explodeModel };
