/* eslint-disable no-multi-assign */
import * as THREE from 'three'; // 加载three核心依赖

import { Water } from 'three/examples/jsm/objects/Water';
// import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js"; //性能优化扩展
// let geos_water = []; //建筑网格集合 用于性能优化
export const GetWater = (src: string, child: THREE.Mesh) => {
  // 初始化建筑物贴图
  const MAT_WATER_NORMALE = new THREE.TextureLoader().load(src, (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  });
  // 初始化水材质
  const MAT_WATER = {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: MAT_WATER_NORMALE,
    alpha: 1,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x007acc,
    distortionScale: 6.7,
    fog: false,
  };

  const mesh = new Water(child.geometry, MAT_WATER);
  mesh.name = 'water';
  setInterval(() => {
    mesh.material.uniforms.time.value -= 0.1 / 25;
  }, 20);

  return mesh;
};
