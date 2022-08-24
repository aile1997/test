import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
// 创建一个HTML标签
const tag = (html: HTMLElement, x: number, y: number, z: number) => {
  const div = html;
  div.style.zIndex = '9999999';
  const label = new CSS3DObject(div);
  div.style.pointerEvents = 'none';
  label.name = 'spring';
  // label.scale.set(0.009, 0.009, 0.009);
  label.position.set(x, y, z);
  return label;
};

// 创建一个CSS3渲染器CSS2DRenderer
const labelRenderer = new CSS3DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.className = 'texts';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.zIndex = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

export { tag, labelRenderer };
