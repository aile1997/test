import * as THREE from 'three'; // 加载three核心依赖

const createText = (src:string): Promise<HTMLCanvasElement> => {
  // 绘制画布做为Sprite的材质
  const canvasText = document.createElement('canvas');
  const ctx: any = canvasText.getContext('2d');
  // 添加背景图片，进行异步操作
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    // 图片加载之后的方法
    img.onload = () => {
      // 将画布处理为透明
      ctx.clearRect(0, 0, 300, 300);
      // 绘画图片
      ctx.drawImage(img, 0, 0, 300, 50);

      resolve(makeText(ctx, canvasText));
    };
    // 图片加载失败的方法
    img.onerror = (e) => {
      reject(e);
    };
  });
};

function makeText(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  // 文字
  const x = 55;
  const y = 30;
  ctx.font = '14px Arial';
  ctx.fillText('我要举报，供热不均匀！！', x, y);
  return canvas;
}

const addSprite = async (text: string, text2: string, positions: any, src:string) => {
  // let texture = new THREE.Texture();
  // const texture = new THREE.TextureLoader();
  const texture = new THREE.CanvasTexture(await createText(src));
  // return new Promise((resolve) =>
  // texture.load(createText("李小龙", "14", "#fff", "#1890FF55").url, (texture) => {
  texture.minFilter = THREE.NearestFilter; // 这语句解决图片的失真问题，最近渲染
  texture.needsUpdate = true;
  // 创建sprite精灵
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture, // 此处引用图片，可设置为背景
    color: 0xffffff,
    transparent: true, // 透明度得开启    使得图片有透明的色阶背景
    side: THREE.DoubleSide, // 双面打开
    depthTest: false, // 关闭这个深重影方法转动时不会有影子
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(500, 500, 500);
  sprite.position.set(positions.x, positions.y + 0.7, positions.z);
  sprite.name = 'sprite';

  return sprite;
  // resolve(sprite);
  // }),
  // );
};

export { addSprite };
