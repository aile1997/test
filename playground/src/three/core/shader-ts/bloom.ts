/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FocusShader } from 'three/examples/jsm/shaders/FocusShader.js';

let bloomComposer: any;
let finalComposer: any;

// 区分辉光与非辉光层
// const ENTIRE_SCENE = 0;
const BLOOM_SCENE = 1;
const materials: any = {};
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const bloomParams = {
  exposure: 2,
  bloomThreshold: 0.1,
  bloomStrength: 1.6,
  bloomRadius: 0.4,
};

const bloomVertext = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const bloomFragment = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
varying vec2 vUv;
void main() {
  gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
}
`;

const renderBloom = (renderer: any, scene: any, camera: any) => {
  const focusShader = new ShaderPass(FocusShader);
  focusShader.uniforms.screenWidth.value = window.innerWidth;
  focusShader.uniforms.screenHeight.value = window.innerHeight;
  focusShader.uniforms.sampleDistance.value = 1;

  // 添加效果合成器
  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;

  const taaRenderPass = new (TAARenderPass as any)(scene, camera);
  taaRenderPass.sampleLevel = 1;

  // 添加基本的渲染通道
  const renderPass = new RenderPass(scene, camera);

  const bloomPass = new (UnrealBloomPass as any)(new THREE.Vector2(window.innerWidth, window.innerHeight));
  bloomPass.threshold = bloomParams.bloomThreshold;
  bloomPass.strength = bloomParams.bloomStrength;
  bloomPass.radius = bloomParams.bloomRadius;
  const copyPass = new ShaderPass(CopyShader);
  bloomComposer.addPass(renderPass);
  // bloomComposer.addPass(taaRenderPass);
  // 把通道加入到组合器
  bloomComposer.addPass(focusShader);
  bloomComposer.addPass(bloomPass);
  bloomComposer.addPass(copyPass);

  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: bloomVertext,
      fragmentShader: bloomFragment,
      defines: {},
    }),
    'baseTexture',
  );
  finalPass.needsSwap = true;
  // 初始化实际效果合成器
  finalComposer = new EffectComposer(renderer);

  finalComposer.addPass(renderPass);
  finalComposer.addPass(taaRenderPass);
  finalComposer.addPass(finalPass);
  finalComposer.addPass(copyPass);
};

const renderEffect = (model: any) => {
  // const edgeGroup = new THREE.Group();
  model.traverse((child: any) => {
    if (child.isMesh) {
      //   // 将扫描框转为辉光材质
      //   let shaderMaterial = new THREE.ShaderMasterial({
      //     transparent: true,
      //     side: THREE.DoubleSide,
      //     uniforms: {
      //       height: scanConfig,
      //       uFlowColor: {
      //         value: new THREE.Vector4(0.0, 1.0, 1.0, 1.0),
      //       },
      //       uModelColor: {
      //         value: new THREE.Vector4(0.0, 0.0, 0.0, 0.0),
      //       },
      //     },
      //     vertexShader: uperVertext,
      //     fragmentShader: uperFragment,
      //   });
      //   obj.material = shaderMaterial;
      //   let boundingBox = obj.geometry.boundingBox;
      //   // 初始化扫描配置,y轴上下需留出一定空间，防止把上下平面扫描出来
      //   scanConfig.start = boundingBox.min.y + 0.1 || 0;
      //   scanConfig.end = boundingBox.max.y - 0.1 || 0;
      //   scanConfig.value = scanConfig.start;
      if (child.material.name === '_88.001') {
        +child.layers.toggle(BLOOM_SCENE);
      }
    }

    // 设置样式
    // else if (obj.type === "Mesh") edgeGroup.add(_renderFrameMesh(obj));
  });
  // scene.add(edgeGroup);
  // 重置变换
  // const _renderFrameMesh = (obj: any) => {
  //   const edges = new THREE.EdgesGeometry(obj.geometry);
  //   let color = new THREE.Color(0.1, 0.3, 1);
  //   var lineBasematerial = new THREE.LineBasicMaterial({
  //     color: color,
  //     side: THREE.FrontSide,
  //     linecap: "round", //ignored by WebGLRenderer
  //     linejoin: "round", //ignored by WebGLRenderer
  //   });
  //   const line = new THREE.LineSegments(edges, lineBasematerial);
  //   // 将外框转为辉光材质
  //   +line.layers.toggle(BLOOM_SCENE);
  //   return line;
  // };
};

// 将材质转为黑色材质
const darkenNonBloomed = (obj: any) => {
  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
};

// 还原材质
const restoreMaterial = (obj: any) => {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
};

const bloomRender = (scene: any) => {
  scene.traverse((obj: any) => darkenNonBloomed(obj));
  bloomComposer.render();
  scene.traverse((obj: any) => restoreMaterial(obj));
  finalComposer.render();
  // return { bloomComposer, finalComposer };
};

const onWindowResize = () => {
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  finalComposer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener('resize', onWindowResize.bind(this));
export { renderBloom, bloomRender, renderEffect };
// init();
// render()
// bloomRender();
