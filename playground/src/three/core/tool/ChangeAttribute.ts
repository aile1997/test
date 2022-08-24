import * as THREE from 'three'; // 加载three核心依赖
import TweenUtils from '@/three/core/tween/TweenUtils';
import type { Object3D } from 'three';

let newOpMaterial: THREE.Material | THREE.MeshStandardMaterial;
let newColorMaterial: THREE.Material | THREE.MeshStandardMaterial;
let index = 0;
// 改变透明度的子主函数
const opFun = (value: any, child: any, option: any) => {
  if (value === '_' && option.opacity === 0.2) {
    newOpMaterial = child.material.clone();
  }
  const MaterialCopy = child.material.clone();
  child.material = MaterialCopy;
  child.material.transparent = true;
  TweenUtils.TweenRun(
    child.material,
    {
      opacity: option.opacity,
    },
    undefined,
    undefined,
    () => {
      index++;
      // child.visible = false;
      child.renderOrder = 1;
      if (child.parent.parent.name.slice(0, 4) === 'Line' || child.parent.name.slice(0, 4) === 'Line') {
        child.material.opacity = 0.1;
        child.scale.set(0.999, 0.999, 0.999);
        child.renderOrder += index;
      }
    },
  );
};
// 改变透明度
const changeOpacity = (father: THREE.Group | Object3D | undefined, name: any, option: any, nameOne?: string) => {
  if (!father) return;
  if (option.flage === false) {
    // 点击切换回去时触发
    father.traverse((child: any) => {
      name.forEach((value: any) => {
        if (child.isMesh && child.material.name === value) {
          child.visible = true;
          child.material.opacity = newOpMaterial.opacity;
          child.material.transparent = newOpMaterial.transparent;
          child.renderOrder = 0;
          child.scale.set(1, 1, 1);
        }
      });
    });
  } else {
    father.traverse((child: any) => {
      // 点击时触发
      name.forEach((value: any) => {
        // 遍历出符合name数组的全部Obj
        if (child.name === nameOne) {
          // 查看单体模式
          child.traverse((childOne: any) => {
            if (childOne.isMesh && childOne.material.name === value) {
              opFun(value, childOne, option);
            }
          });
        }
        if (!nameOne && child.isMesh && child.material.name === value) {
          // 整体模式
          opFun(value, child, option);
        }
      });
    });
  }
};

const changeColor = (father: THREE.Group | Object3D | undefined, name: any, option: any) => {
  if (!father) return;
  let index2 = -1;
  const colorHex: THREE.Color[] = [];
  option.color.forEach((element: any) => {
    colorHex.push(new THREE.Color(element));
  });
  if (option.flage === false) {
    father.traverse((child: any) => {
      name.forEach((value: any) => {
        if (child.isMesh && child.material.name === value) {
          child.material.color = (newColorMaterial as any).color;
        }
      });
    });
  } else {
    father.traverse((child: any) => {
      name.forEach((value: any) => {
        if (child.isMesh && child.material.name === value && child.parent.name.slice(0, 9) === 'Rectangle') {
          index2 += 1;
          if (index2 >= 3) index2 = 3;
          if (value === '_') {
            newColorMaterial = child.material.clone();
          }
          const MaterialCopy = child.material.clone();
          child.material = MaterialCopy;
          const initial = new THREE.Color(child.material.color.getHex());
          TweenUtils.TweenRun(
            initial,
            {
              r: colorHex[index2].r,
              g: colorHex[index2].g,
              b: colorHex[index2].b,
            },
            () => {
              child.material.color = initial;
            },
          );
        }
      });
    });
  }
};
export { changeOpacity, changeColor };
