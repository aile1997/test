import '@vue/runtime-core';
import {
  Demo,
  JsxDemo,
} from 'runafe-threejs';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Demo: typeof Demo;
    JsxDemo: typeof JsxDemo;
  }
}

declare module 'esbuild-plugin-glsl'

export {};
