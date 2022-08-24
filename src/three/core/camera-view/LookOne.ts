import * as THREE from 'three';
import TweenUtils from '@/three/core/tween/TweenUtils';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { changeOpacity } from '@/three/core/tool/ChangeAttribute';

const optionsFlag = true;
const lookOneUtils = (scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: OrbitControls, targetName: string) => {
  scene.traverse((child: any) => {
    if (child.name === targetName) {
      const explodeBox = new THREE.Box3();
      explodeBox.setFromObject(child);
      const p = explodeBox.getCenter(new THREE.Vector3());
      TweenUtils.TweenRun(
        camera.position,
        {
          x: p.x - 20,
          y: p.y + 20,
          z: p.z + 20,
        },
        () => {
          controls.target.set(p.x, p.y, p.z);
        },
      );
      changeOpacity(scene, ['_', '_.003', '_.001'], { opacity: 0.05, flage: optionsFlag }, '__454');
    }
  });
};

export { lookOneUtils };
