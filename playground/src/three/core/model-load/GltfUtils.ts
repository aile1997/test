/* eslint-disable no-promise-executor-return */
/* eslint-disable max-len */
import * as THREE from 'three'; // 加载three核心依赖
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { getModel } from './indexedDB';

// import { tag } from '@/core/css-render/Css3dRender';
// import MergeHelper from '@/core/performance/MakeMerged';
// import InstantiateHelper from '@/core/performance/MakeInstantiate';
// import { filtHelp } from '@/core/performance/FiltModle';

// import emitter from '@/stores/mitt';
// import { GetWater } from '@/core/shader-ts/WaterTest';
// import { LoadingManager } from 'three';
// import { exportGltf } from '@/core/model-load/ExporGltf';

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
// const setTimeArr: any = [];
dracoLoader.setDecoderPath('/draco/');
dracoLoader.preload();
loader.setDRACOLoader(dracoLoader);
const requestAnimationFramer: number = 0;
let model: THREE.Group;
const loadedModels: { [name: string]: { uuid: string; bbox?: THREE.BoxHelper } } = {};
// const texture = new THREE.TextureLoader().load('textures/nao4.png');

const actions: {
  timeScale: number;
  play: () => void;
}[] = [];
const otherGroup = new THREE.Group();
// const arrGroup: any[] = [];
const house = (src:string, DBId:string, number?:number): Promise<THREE.Group> => new Promise((resolve) => getModel(src, DBId, number).then((blob: any) => {
  const url = URL.createObjectURL(new Blob([blob]));
  loader.load(url, (gltf) => {
    model = gltf.scene;

    const { animations } = gltf;
    const mixerCold = new THREE.AnimationMixer(model);
    for (let i = 0; i < animations.length; i++) {
      actions[i] = mixerCold.clipAction(animations[i]);
      actions[i].timeScale = 5;
      actions[i].play();
    }
    const clock = new THREE.Clock();

    const tick = () => {
      const dt = clock.getDelta();
      mixerCold.update(dt);
      window.requestAnimationFrame(tick);
    };
    tick();

    // new InstantiateHelper(model).instantiate();
    // new MergeHelper(model).merge();
    // loadedModels[gltf.scene.name] = {
    //   uuid: model.uuid,
    // };

    model.traverse((child: any) => {
      if (child.isPoints) {
        // child.material.metalness = 0.7;
        // child.material.roughness = 0.15;
        // child.material.clearcoat = 1.0;
        // child.material.clearcoatRoughness = 0.08;
        // // child.material.emissiveIntensity = 3;
        // child.material.sheen = 1;
        // child.castShadow = true;
        // child.receiveShadow = true;
        // child.material.side = 0;
      }
    });
    model.scale.set(5, 5, 5);
    model.add(otherGroup);
    // exportGltf(model, gltf.animations);
    resolve(model);
  });
}));

const dispose = () => {
  cancelAnimationFrame(requestAnimationFramer);
  Object.keys(loadedModels).forEach((key) => {
    delete loadedModels[key];
  });
};

export { house, dispose };
