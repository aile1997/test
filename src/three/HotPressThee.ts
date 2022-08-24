/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import TWEEN from 'tween';
// import { tag, labelRenderer } from "@/three/core/css-render/Css2dRender";
import { labelRenderer } from '@/three/core/css-render/Css3dRender';
// import { initExplodeModel, explodeModel } from '@/three/core/explode/ExplodeModel';
import Viewer3DUtils, { Views } from '@/three/core/camera-view/Viewer3DUtils';
import { addSky } from '@/three/core/shader-ts/Sky';
import { addPlan } from '@/three/core/geometry-my/Plan';

import { house } from '@/three/core/model-load/GltfUtils';
import { raycaster } from '@/three/core/tool/Raycaster';
import { eventGudge, even } from '@/three/core/tool/Event';

import { changeOpacity, changeColor } from '@/three/core/tool/ChangeAttribute';
// import { renderBloom, bloomRender, renderEffect } from "@/three/core/shader-ts/bloom";
// import { changeTime } from "@/three/core/tool/ChangeTime";
import { lookOneUtils } from '@/three/core/camera-view/LookOne';
// import { mainStore } from "@/three/stores/counter";
// import emitter from '@/three/stores/mitt';

// import { GetWater } from "@/three/core/water";

const defaultConfig = {
  container: document.getElementById('app'),
};
export default class ThreeJs {
  container: HTMLElement | undefined = undefined;

  css2dRender: HTMLElement | undefined = undefined;

  css3dRender: HTMLElement | undefined = undefined;

  scene: THREE.Scene | null = null;

  group: THREE.Group = new THREE.Group();

  camera: THREE.PerspectiveCamera | null = null;

  renderer: THREE.WebGLRenderer | null = null;

  directionalLight: THREE.DirectionalLight | null = null;

  HouseGltf: THREE.Group | null = null;

  sky: any;

  mesh: THREE.Mesh | null = null;

  controls: OrbitControls | null = null;

  store: any = null;

  setTimeArr: any = [];

  saveMaterial: THREE.Material | null = null;

  saveObj: THREE.Mesh | null = null;

  modelOption:any;

  textureOption:any;

  optionsFlag = {
    opFlage: true,
    colorFlage: true,
    timeFlage: true,
    clickFlage: true,
    clickNumber: 1,
  };

  constructor(params:any) {
    const paramsNow = { ...defaultConfig, ...params };
    this.container = paramsNow.container;
    this.modelOption = paramsNow.model;
    this.textureOption = paramsNow.texture;
    this.init();
  }

  init(): void {
    this.setScene();
    this.setCamera();
    this.setControls();
    this.setLight();
    this.setGltf();
    this.setRenderer();
    // renderBloom(this.renderer, this.scene, this.camera);
    this.render();
    // this.animate();
    // console.log(this.container);

    window.addEventListener('resize', this.onWindowResize.bind(this));
    if (this.container) {
      eventGudge(this.container, this.chooseClick.bind(this));
    }

    // window.addEventListener("click", this.chooseClick.bind(this));
  }

  // 新建场景
  setScene(): void {
    // 第一步新建一个场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06090d);
    this.scene.environment = new RGBELoader().load(this.textureOption.environmentMap, () => {});
    this.scene.environment.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.updateMatrixWorld(true);
    this.scene.fog = new THREE.Fog(0x8b919e, 200, 500);
  }

  // 新建透视相机
  setCamera(): void {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(-106.49, 139.5, 198.12);
  }

  // 新建控制器
  setControls(): void {
    if (!this.camera || !this.container) return;
    this.controls = new OrbitControls(this.camera, this.container);
    this.controls.maxDistance = 1000;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.controls.enableDamping = true;
    // this.controls.dampingFactor = 0.5;
    this.controls.enabled = true;

    this.controls.screenSpacePanning = false;
    // this.controls.minPolarAngle =
    this.controls.maxPolarAngle = Math.PI / 2.2;
    // this.controls.target.set(2.37, -9.33, -30.53);
    this.controls.update();
    // this.controls.addEventListener("change", () => {
    //   console.log(this.camera?.position);
    //   console.log(this.controls?.target);
    // });
  }

  // 设置环境光
  setLight(): void {
    if (!this.scene) return;
    this.directionalLight = new THREE.DirectionalLight(0xffffff);
    this.directionalLight.position.set(190, 110, -190);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.top = 400;
    this.directionalLight.shadow.camera.bottom = -400;
    this.directionalLight.shadow.camera.right = 400;
    this.directionalLight.shadow.camera.left = -400;
    this.directionalLight.shadow.mapSize.set(9600, 9600);
    // this.directionalLight.shadow.bias = 0.001;

    this.scene.add(this.directionalLight);
  }

  // 创建模型
  async setGltf(): Promise<void> {
    if (!this.scene || !this.camera) return;
    const { src, DBid, number } = this.modelOption;
    this.HouseGltf = await house(src, DBid, number);
    this.scene.add(this.HouseGltf);
    this.scene.updateMatrixWorld(true);
    //   // explodeModel(model, 2);
    const eye = new THREE.Vector3();
    const look = new THREE.Vector3();
    Viewer3DUtils.getCameraPositionByObjectUuids(
      this.scene,
      (Object as any).values(this.HouseGltf).map((obj: any) => obj.uuid),
      Views.Front,
      eye,
      look,
    );
    this.camera && this.controls && Viewer3DUtils.flyTo(eye, look, this.camera, this.controls);
    this.sky = addSky();
    this.scene.add(this.sky);
    const plan = addPlan();
    this.scene.add(plan);

    // renderEffect(this.HouseGltf);
  }

  // 渲染
  render(): void {
    if (this.renderer && this.scene && this.camera && this.controls) {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      labelRenderer.render(this.scene, this.camera);
      // bloomRender(this.scene);
      TWEEN.update();
    }
    requestAnimationFrame(this.render.bind(this));
  }

  animate() {
    this.renderer?.setAnimationLoop(this.render.bind(this));
  }

  // 设置渲染器
  setRenderer(): void {
    if (!this.container) return;
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2;
    this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // THREE.PCFShadowMap (default)
    // this.renderer.physicallyCorrectLights = true;
    // this.renderer.gammaInput = true;
    // this.renderer.gammaOutput = true;
    // this.renderer.toneMappingExposure = Math.pow(0.09, 0.4);
    this.container.appendChild(this.renderer.domElement);

    // this.renderer.xr.enabled = true;
    // this.renderer.xr.setReferenceSpaceType("local");

    // document.body.appendChild(VRButton.createButton(this.renderer));
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  showPipe() {
    if (!this.scene) return;
    changeOpacity(this.scene, ['_', '_.003', '_.001'], {
      opacity: 0.2,
      flage: this.optionsFlag.opFlage,
    });
    this.optionsFlag.opFlage = !this.optionsFlag.opFlage;
  }

  showTemperature() {
    if (!this.scene) return;
    changeColor(this.scene, ['_'], {
      color: [0xff0000, 0xeeff00, 0xeeff00, 0x003783],
      flage: this.optionsFlag.colorFlage,
    });
    this.optionsFlag.colorFlage = !this.optionsFlag.colorFlage;
  }

  lookOne() {
    if (!this.scene || !this.camera || !this.controls) return;
    lookOneUtils(this.scene, this.camera, this.controls, '__454');
  }

  chooseClick() {
    if (!this.scene || !this.camera || !this.HouseGltf) return;
    const chooseObjArr: any = raycaster(even, this.scene, this.camera);

    // let tags = null;
    const chooseObj = chooseObjArr[0].object;
    console.log(chooseObj);
  }

  setTimeouts(fun: any, num: number, name: any) {
    name = setTimeout(() => {
      fun.show();
    }, num);
    this.setTimeArr.push(name);
  }
}
