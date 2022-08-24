import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
// 创建一个HTML标签
const tag = (html: HTMLElement, x: number, y: number, z: number) => {
  html.style.zIndex = '9999999';
  const label = new CSS2DObject(html);
  html.style.pointerEvents = 'all'; // 避免HTML标签遮挡三维场景的鼠标事件
  // 设置HTML元素标签在three.js世界坐标中位置
  label.position.set(x, y, z);
  return label; // 返回CSS2模型标签
};

// 创建一个CSS2渲染器CSS2DRenderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.className = 'texts';
// // 避免renderer.domElement影响HTMl标签定位，设置top为0px
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.zIndex = '0';

// //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

export { tag, labelRenderer };
