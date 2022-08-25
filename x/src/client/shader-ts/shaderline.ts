// 引入three.js
import * as THREE from 'three'

import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
// import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'

export const addColor = (
    color: THREE.ColorRepresentation,
    config: { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.Camera }
) => {
    let composer, renderPass, outlinePass, effectFXAA
    //创建一个EffectComposer（效果组合器）对象，然后在该对象上添加后期处理通道
    composer = new EffectComposer(config.renderer)

    //新建一个场景通道 为了覆盖到原来的场景上
    renderPass = new RenderPass(config.scene, config.camera)
    composer.addPass(renderPass)

    //物体边缘发光通道
    outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        config.scene,
        config.camera
    )

    outlinePass.edgeStrength = 2.0 //边缘发光强度,数值大，更亮一些
    outlinePass.edgeGlow = 1.5 //光晕[0,1]，默认0.0
    outlinePass.usePatternTexture = false //是否使用父级的材质,默认false
    outlinePass.edgeThickness = 1 //轮廓边缘描边厚度
    outlinePass.downSampleRatio = 2 //边框弯曲度,默认2
    outlinePass.pulsePeriod = 3 //模型闪烁频率控制，默认0不闪烁
    outlinePass.visibleEdgeColor.set(color) //呼吸显示的颜色
    outlinePass.hiddenEdgeColor.set(color) //呼吸消失的颜色
    outlinePass.clear = true
    composer.addPass(outlinePass)

    //自定义的着色器通道 作为参数
    effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight)
    effectFXAA.renderToScreen = true
    // pass = new SMAAPass( window.innerWidth * config.renderer.getPixelRatio(), window.innerHeight * config.renderer.getPixelRatio() );
    composer.addPass(effectFXAA)
    return {
        composer, //compose在循环函数中调用
        outlinePass, //实例化一次后设置 outlinePass.selectedObjects = selectedObjects
    }
}
