// import * as THREE from 'three';
// import TweenUtils from '@/core/tween/TweenUtils';
// import { guiChanged } from '@/core/shader-ts/Sky';
// import { bloomRender } from '@/core/shader-ts/bloom';
// import TWEEN from 'tween';
// import { labelRenderer } from '@/core/css-render/Css3dRender';
// import _ from "lodash";

// const effectControllerDay = {
//   turbidity: 14.8,
//   rayleigh: 0.214,
//   mieCoefficient: 0,
//   mieDirectionalG: 0.7,
//   elevation: 8.1,
//   azimuth: 140.2,
// };
// const effectControllerNight = {
//   turbidity: 6.5,
//   rayleigh: 0,
//   mieCoefficient: 0.015,
//   mieDirectionalG: 0.226,
//   elevation: 15.9,
//   azimuth: 0,
// };

// const changeTime = (that: any) => {
//   let hefeiHouse = that.HouseGltf?.getObjectByName("合肥建筑FX001");
//   if (that.optionsFlag.timeFlage) {
//     let effectControllerClone = _.cloneDeep(effectControllerDay);
//     TweenUtils.TweenRun(effectControllerClone, effectControllerNight, function () {
//       guiChanged(effectControllerClone);
//     });

//     TweenUtils.TweenRun(that.directionalLight?.position, {
//       x: 10,
//       y: 5,
//     });
//     TweenUtils.TweenRun(that.directionalLight, {
//       intensity: 0.1,
//     });
//     TweenUtils.TweenRun(that.renderer, {
//       toneMappingExposure: 1.2,
//     });
//     let colorHex = new THREE.Color(0x576d77);
//     hefeiHouse?.traverse((child: any) => {
//       if (child.isMesh) {
//         let initial = new THREE.Color(child.material.color.getHex());
//         TweenUtils.TweenRun(
//           initial,
//           {
//             r: colorHex.r,
//             g: colorHex.g,
//             b: colorHex.b,
//           },
//           function () {
//             child.material.color = initial;
//           },
//           null,
//         );
//       }
//     });
//     setTimeout(() => {
//       if (!that.renderer) return;
//       that.renderer.shadowMap.enabled = false;
//       that.render = () => {
//         if (that.renderer && that.scene && that.camera && that.controls) {
//           that.controls.update();
//           // that.renderer.render(that.scene, that.camera);
//           labelRenderer.render(that.scene, that.camera);
//           bloomRender(that.scene);
//           TWEEN.update();
//         }
//         requestAnimationFrame(that.render.bind(this));
//       };
//     }, 800);

//     // that.animate();

//     // if (AnimationIdDay) cancelAnimationFrame(AnimationIdDay);
//     that.optionsFlag.timeFlage = !that.optionsFlag.timeFlage;
//   } else {
//     if (!that.renderer) return;
//     that.renderer.shadowMap.enabled = true;
//     that.render = () => {
//       if (that.renderer && that.scene && that.camera && that.controls) {
//         that.controls.update();
//         that.renderer.render(that.scene, that.camera);
//         labelRenderer.render(that.scene, that.camera);
//         // bloomRender(that.scene);
//         TWEEN.update();
//       }
//       requestAnimationFrame(that.render.bind(that));
//     };
//     // that.animate();
//     let effectControllerClone = _.cloneDeep(effectControllerNight);
//     TweenUtils.TweenRun(effectControllerClone, effectControllerDay, function () {
//       guiChanged(effectControllerClone);
//     });
//     TweenUtils.TweenRun(that.directionalLight?.position, {
//       x: 190,
//       y: 110,
//       z: -190,
//     });
//     TweenUtils.TweenRun(that.directionalLight, {
//       intensity: 1,
//     });
//     TweenUtils.TweenRun(that.renderer, {
//       toneMappingExposure: 2,
//     });
//     let colorHex = new THREE.Color(0xffffff);
//     hefeiHouse?.traverse((child: any) => {
//       if (child.isMesh) {
//         let initial = new THREE.Color(child.material.color.getHex());
//         TweenUtils.TweenRun(
//           initial,
//           {
//             r: colorHex.r,
//             g: colorHex.g,
//             b: colorHex.b,
//           },
//           function () {
//             child.material.color = initial;
//           },
//           null,
//         );
//       }
//     });
//     // if (AnimationIdNight) cancelAnimationFrame(AnimationIdNight);

//     that.optionsFlag.timeFlage = !that.optionsFlag.timeFlage;
//   }
// };
export {};
