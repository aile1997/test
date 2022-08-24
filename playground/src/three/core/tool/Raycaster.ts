/* eslint-disable @typescript-eslint/no-shadow */
import * as THREE from 'three';
// 加载three核心依赖
const raycaster = (event: MouseEvent, scene: THREE.Scene | THREE.Group, camera: THREE.PerspectiveCamera) => {
  const Sx = event.clientX; // 鼠标单击位置横坐标
  const Sy = event.clientY; // 鼠标单击位置纵坐标
  // 屏幕坐标转WebGL标准设备坐标
  const x = (Sx / window.innerWidth) * 2 - 1; // WebGL标准设备横坐标
  const y = -(Sy / window.innerHeight) * 2 + 1; // WebGL标准设备纵坐标
  // 创建一个射线投射器`Raycaster`
  const raycaster = new THREE.Raycaster();
  // raycaster.layers.enable(1);
  // 通过鼠标单击位置标准设备坐标和相机参数计算射线投射器`Raycaster`的射线属性.ray
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  (raycaster as any).params.Line.threshold = 0.3;
  // 返回.intersectObjects()参数中射线选中的网格模型对象
  // 未选中对象返回空数组[],选中一个数组1个元素，选中两个数组两个元素
  const intersects = raycaster.intersectObjects(scene.children, true);
  // console.log(intersects[0]);
  // console.log(intersects);

  return intersects;
};
export { raycaster };
