/* eslint-disable @typescript-eslint/no-shadow */
import * as THREE from 'three'; // 加载three核心依赖
import { Sky } from 'three/examples/jsm/objects/Sky.js';
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const sky = new Sky();
const effectController = {
  turbidity: 0,
  rayleigh: 0.012,
  mieCoefficient: 0,
  mieDirectionalG: 0,
  elevation: 0.4,
  azimuth: 0,
  exposure: 0.1,
};
const sun = new THREE.Vector3();
export const guiChanged = (effectController: any) => {
  const { uniforms } = sky.material;
  uniforms.turbidity.value = effectController.turbidity;
  uniforms.rayleigh.value = effectController.rayleigh;
  uniforms.mieCoefficient.value = effectController.mieCoefficient;
  uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
  const theta = THREE.MathUtils.degToRad(effectController.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms.sunPosition.value.copy(sun);
};

export const addSky = () => {
  // Add Sky

  sky.scale.setScalar(10000);

  // var effectController = {
  //   turbidity: 5.4,
  //   rayleigh: 0.001,
  //   mieCoefficient: 0.004,
  //   mieDirectionalG: 0.001,
  //   elevation: 3.4,
  //   azimuth: -110,
  //   exposure: 0.0007,
  // };

  // const gui = new GUI();

  // gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
  // gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
  // gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).listen();
  // gui.add(effectController, "rayleigh", 0.0, 4, 0.001).listen();
  // gui.add(effectController, "mieCoefficient", 0.0, 0.1, 0.001).listen();
  // gui.add(effectController, "mieDirectionalG", 0.0, 1, 0.001).listen();
  // gui.add(effectController, "elevation", 0, 90, 0.1).listen();
  // gui.add(effectController, "azimuth", -180, 180, 0.1).listen();
  // gui.add(effectController, "exposure", 0, 1, 0.0001).listen();

  guiChanged(effectController);

  return sky;
};
