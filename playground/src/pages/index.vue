<script setup >
import { ref, onMounted } from 'vue';
// import { JsxDemo as CountDemo, Demo } from 'runafe-threejs';
// import { JsxDemo as CountDemo } from 'runafe-threejs';
import ThreeJs from '@/three/galax';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

const root = ref();
onMounted(() => {
  // new ThreeJs({
  //   container: root.value,
  //   model: {
  //     src: '/gltf/scene228242.glb',
  //     DBid: '/gltf/scene228242.glb',
  //   },
  //   texture: {
  //     environmentMap: '/textures/venice_sunset_1k.hdr',
  //   },
  // });

  /**
 * Base
 */
  // Debug
  const gui = new dat.GUI();

  // Canvas
  const canvas = document.createElement('canvas')
      root.value.appendChild(canvas)

  // Scene
  const scene = new THREE.Scene();

  /**
 * Sizes
 */
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  window.addEventListener('resize', () => {
  // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  /**
 * Camera
 */
  // Base camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100,
  );
  camera.position.x = 3;
  camera.position.y = 3;
  camera.position.z = 3;
  scene.add(camera);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  /**
 * Renderer
 */
  const renderer = new THREE.WebGLRenderer({
    canvas,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /**
 * Animate
 */
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
  const params = {
    count: 50000,
    size: 0.009,
    radius: 5,
    branches: 3,
    spin: 3,
    randomness: 0.69,
    randomPower: 2,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
  };
  let geometry = null;
  let points = null;
  let pointsMaterial = null;
  let positions = null;
  let colors = null;
  const generateGalaxy = () => {
    if (points != null) {
      geometry.dispose();
      pointsMaterial.dispose();
      scene.remove(points);
    }
    geometry = new THREE.BufferGeometry();
    positions = new Float32Array(params.count * 3);
    colors = new Float32Array(params.count * 3);
    const insideColor = new THREE.Color(params.insideColor);
    const outsideColor = new THREE.Color(params.outsideColor);
    for (let i = 0; i < params.count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * params.radius;
      const spinAngle = radius * params.spin;
      const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;
      const randomX = Math.random() ** params.randomPower * (Math.random() < 0.5 ? 1 : -1) *
      params.randomness;
      const randomY = Math.random() ** params.randomPower * (Math.random() < 0.5 ? 1 : -1) *
      params.randomness;
      const randomZ = Math.random() ** params.randomPower * (Math.random() < 0.5 ? 1 : -1) *
      params.randomness;
      positions[i3] = Math.sin(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = 0 + randomY;
      positions[i3 + 2] = Math.cos(branchAngle + spinAngle) * radius + randomZ;
      const mixedColor = insideColor.clone();
      mixedColor.lerp(outsideColor, radius / params.radius);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: params.size,
      depthWrite: true,
      vertexColors: true,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });
    points = new THREE.Points(geometry, pointsMaterial);
    // console.log(points)
    scene.add(points);
  };
  generateGalaxy();
  gui.add(params, 'count').min(100).max(100000).step(100)
    .onFinishChange(generateGalaxy);
  gui.add(params, 'size').min(0.001).max(0.1).step(0.001)
    .onFinishChange(generateGalaxy);
  gui.add(params, 'radius').min(0.001).max(20).step(0.001)
    .onFinishChange(generateGalaxy);
  gui.add(params, 'branches').min(2).max(20).step(1)
    .onFinishChange(generateGalaxy);
  gui.add(params, 'spin').min(-5).max(5).step(0.01)
    .onFinishChange(generateGalaxy);
  gui.add(params, 'randomness').min(0).max(2).step(0.01)
    .onFinishChange(generateGalaxy);
  gui.add(params, 'randomPower').min(1).max(10).step(1)
    .onFinishChange(generateGalaxy);
  gui.addColor(params, 'insideColor').onFinishChange(generateGalaxy);
  gui.addColor(params, 'outsideColor').onFinishChange(generateGalaxy);
});
</script>

<template>
  <div>
    <!-- <div py2 px6>
      <button class="mybtn" @click="changeCount">change count value</button>
    </div> -->

    <!-- <Demo :count="count" /> -->

    <div ref="root" class="root" style="display: flex;">
      <!-- <CountDemo /> -->
    </div>
  </div>
</template>

<style lang="postcss">
.mybtn {
  @apply rounded-md border border-light-50 mr-5 p-2 bg-green-500 text-xs text-white;
}

.swarm {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
}

</style>
