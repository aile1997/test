import * as THREE from 'three'; // 加载three核心依赖

export const addPlan = () => {
  const geometry = new THREE.PlaneGeometry(2000, 2000);
  const material = new THREE.MeshBasicMaterial({ color: 0x898d95, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotateX(Math.PI / 2);
  plane.position.set(0, -10, 0);
  plane.castShadow = true;
  plane.receiveShadow = true;
  return plane;
};
