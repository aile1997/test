/* eslint-disable no-multi-assign */
/* eslint-disable max-len */
import * as THREE from 'three';

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
// import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';

export const Water = (texture1:string, texture2:string) => {
  let clock: THREE.Clock | null = null;
  let uniforms:any = null;
  // let mesh;

  // const container = document.getElementById('waterContainer');

  // camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 3000);
  // camera.position.z = 4;

  // scene = new THREE.Scene();

  clock = new THREE.Clock();

  const textureLoader = new THREE.TextureLoader();

  uniforms = {
    fogDensity: { value: 0.05 },
    fogColor: { value: new THREE.Vector3(0, 0, 0) },
    time: { value: 1.0 },
    uvScale: { value: new THREE.Vector2(0.2, 0.5) },
    texture1: { value: textureLoader.load(texture1) },
    texture2: { value: textureLoader.load(texture2) },
  };

  uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
  uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.RepeatWrapping;

  // const size = 0.65;

  const fragmentShader = `uniform float time;
  
          uniform float fogDensity;
          uniform vec3 fogColor;
    
          uniform sampler2D texture1;
          uniform sampler2D texture2;
    
          varying vec2 vUv;
    
          void main( void ) {
    
            vec2 position = - 1.0 + 2.0 * vUv;
    
            vec4 noise = texture2D( texture1, vUv );
            vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.08;
            vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.08;
    
            T1.x += noise.x * 1.0;
            T1.y += noise.y * 8.0;
            T2.x += noise.y * 1.0;
            T2.y += noise.z * 8.0;
    
            float p = texture2D( texture1, T1 * 2.0 ).a;
    
            vec4 color = texture2D( texture2, T2 * 2.0 );
            vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );
    
            if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
            if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
            if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }
    
            gl_FragColor = temp;
    
            float depth = gl_FragCoord.z / gl_FragCoord.w;
            const float LOG2 = 1.442695;
            float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
            fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
    
            gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
    
          }`;

  const vertexShader = `uniform vec2 uvScale;
          varying vec2 vUv;
    
          void main()
          {
    
            vUv = uvScale * uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
    
          }`;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
  });

  return material;
};
