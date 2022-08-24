import type { Object3D, Event } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const igltfexporter = new GLTFExporter();

const exportGltf = (model: Object3D<Event> | Object3D<Event>[], animations?: any) => {
  igltfexporter.parse(
    model,
    (result) => {
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, 'scene.glb');
      } else {
        const output = JSON.stringify(result, null, 2);
        console.log(output);
        saveString(output, 'scene.gltf');
      }
    },
    (error) => {
      console.log('An error happened' + error);
    },
    {
      // true导出位置、缩放、旋转变换，false导出节点的矩阵变换
      trs: true,
      // 是否只导出可见的
      onlyVisible: false,
      truncateDrawRange: false,
      // 是否二进制，true导出glb模型，false导出gltf模型
      binary: true,
      // 最大贴图尺寸
      maxTextureSize: Infinity,
      animations,
    },
  );
};
const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link); // Firefox workaround, see #6594
const save = (blob: Blob | MediaSource, filename: string) => {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

  // URL.revokeObjectURL( url ); breaks Firefox...
};
const saveString = (text: string, filename: string) => {
  save(new Blob([text], { type: 'text/plain' }), filename);
};

const saveArrayBuffer = (buffer: BlobPart, filename: string) => {
  save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
};
export { exportGltf };
