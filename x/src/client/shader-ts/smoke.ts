/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
import { BufferAttribute, BufferGeometry, Points, PointsMaterial, Texture, TextureLoader, Vector3 } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
// import Mark from "../mark/Mark"
// import { formateTime } from "./until"

interface vec {
  x: number,
  y: number,
  z: number
}

// 定义Partical类
class Partical {
  range: number;

  center: vec;

  life: number;

  createTime: number;

  updateTime: number;

  size: number;

  opacityFactor: number;

  opacity: number;

  scaleFactor: number;

  scale: number;

  position: vec;

  speed: vec;

  constructor(range = 10, center = { x: 0, y: 0, z: 0 }) {
    this.range = range; // 粒子的分布半径
    this.center = center; // 粒子的分布中心
    this.life = 5000; // 粒子的存活时间，毫秒
    this.createTime = Date.now(); // 粒子创建时间
    this.updateTime = Date.now(); // 上次更新时间
    this.size = 30; // 粒子大小

    // 粒子透明度，及系数
    this.opacityFactor = 0.4;
    this.opacity = 1 * this.opacityFactor;

    // 粒子放大量，及放大系数
    this.scaleFactor = 2;
    this.scale = 1 + (this.scaleFactor * (this.updateTime - this.createTime)) / this.life; // 初始1，到达生命周期时为3

    // 粒子位置
    this.position = {
      // x: Math.random() * 2 * this.range + this.center.x - this.range,
      // y: this.center.y,
      // z: Math.random() * 2 * this.range + this.center.z - this.range,
      x: this.center.x,
      y: this.center.y,
      z: this.center.z,
    };

    // 水平方向的扩散
    const speedAround = Math.random() * 5;
    // if (speedAround < 5) speedAround -= 10
    // if (speedAround > 5) speedAround += 2

    // 粒子的扩散速度
    this.speed = {
      x: speedAround,
      y: Math.random() * 100,
      z: speedAround,
    };
  }

  // 更新粒子
  update() {
    const now = Date.now();
    const time = now - this.updateTime;

    // 更新位置
    this.position.x += this.speed.x * time / 8000;
    this.position.y += this.speed.y * time / 8000;
    this.position.z += this.speed.z * time / 8000;

    // 计算粒子透明度
    this.opacity = 1 - (now - this.createTime) / this.life;
    this.opacity *= this.opacityFactor;
    if (this.opacity < 0) this.opacity = 0;

    // 计算放大量
    this.scale = 1 + this.scaleFactor * (now - this.createTime) / this.life;
    if (this.scale > 1 + this.scaleFactor) this.scale = 1 + this.scaleFactor;

    // 重置更新时间
    this.updateTime = now;
  }
}

// const mark = new Mark()

export class Smoke extends Points {
  color = '#666';

  initializationPosition = { x: 0, y: 55, z: 0 };

  time1: number;

  time2: number;

  map: Texture;

  material: PointsMaterial;

  constructor() {
    super();
    this.map = new TextureLoader().load('/textures/shader/texture-smoke.png');
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute('position', new BufferAttribute(new Float32Array([]), 3)); // 一个顶点由3个坐标构成
    this.geometry.setAttribute('a_opacity', new BufferAttribute(new Float32Array([]), 1)); // 点的透明度，用1个浮点数表示
    this.geometry.setAttribute('a_size', new BufferAttribute(new Float32Array([]), 1)); // 点的初始大小，用1个浮点数表示
    this.geometry.setAttribute('a_scale', new BufferAttribute(new Float32Array([]), 1)); // 点的放大量，用1个浮点数表示

    this.material = new PointsMaterial({
      color: this.color,
      map: this.map, // 纹理图
      transparent: true, // 开启透明度
      depthWrite: false, // 禁止深度写入
    });

    this.time1 = 0;
    this.time2 = 0;
    // this.name = '烟雾_' + formateTime()
    this.name = '烟雾_';

    this.material.onBeforeCompile = function (shader) {
      const vertexShader_attribute = `
        attribute float a_opacity;
        attribute float a_size;
        attribute float a_scale;
        varying float v_opacity;
        void main() {
          v_opacity = a_opacity;
        `;
      const vertexShader_size = `
        gl_PointSize = a_size * a_scale;
        `;
      shader.vertexShader = shader.vertexShader.replace('void main() {', vertexShader_attribute);
      shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size;', vertexShader_size);

      const fragmentShader_varying = `
        varying float v_opacity;
        void main() {          
      `;
      const fragmentShader_opacity = `
        gl_FragColor = vec4( outgoingLight, diffuseColor.a * v_opacity );         
      `;
      shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragmentShader_varying);
      shader.fragmentShader = shader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', fragmentShader_opacity);
    };

    // this.add(mark.createLabel(this.name).obj)
  }

  start() {
    const that = this;
    // 创建粒子
    let particals: Partical[] = [];
    (this.time1 as any) = setInterval(() => {
      particals.push(new Partical(5, that.initializationPosition));
    }, 300);

    // 校验粒子，并更新粒子位置等数据
    (this.time2 as any) = setInterval(() => {
      particals = particals.filter(partical => {
        partical.update();
        if (partical.updateTime - partical.createTime > partical.life) {
          return false;
        } else {
          return true;
        }
      });
      if (!particals.length) return;

      // 遍历粒子,收集属性
      const positionList: number[] = [];
      const opacityList: number[] = [];
      const scaleList: number[] = [];
      const sizeList: number[] = [];
      particals.forEach(partical => {
        const { x, y, z } = partical.position;
        positionList.push(x, y, z);
        opacityList.push(partical.opacity);
        scaleList.push(partical.scale);
        sizeList.push(partical.size);
      });

      // 粒子属性写入
      that.geometry.setAttribute('position', new BufferAttribute(new Float32Array(positionList), 3));
      that.geometry.setAttribute('a_opacity', new BufferAttribute(new Float32Array(opacityList), 1));
      that.geometry.setAttribute('a_scale', new BufferAttribute(new Float32Array(scaleList), 1));
      that.geometry.setAttribute('a_size', new BufferAttribute(new Float32Array(sizeList), 1));
    }, 20);
  }

  setColor(value: string) {
    this.color = value;
    this.material.color.set(this.color);
  }

  setPosition(position: Vector3) {
    this.position.copy(position);
  }

  destory() {
    this.map.dispose();
    this.material.dispose();
    this.geometry.dispose();
    this.removeFromParent();

    this.children.forEach(t => {
      if (t instanceof CSS2DObject) {
        t.removeFromParent();
      }
    });

    clearInterval(this.time1);
    clearInterval(this.time2);
  }
}
