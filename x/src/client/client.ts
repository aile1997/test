import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { renderBloom, bloomRender, renderEffect } from './shader-ts/bloom'
const scene = new THREE.Scene()
var path = '/assets/images/background/cosmos/' //宇宙顺序有问题，
const format = '.jpg'
new THREE.CubeTextureLoader().load(
    [
        path + 'Green-Nebula-Left-TEX' + format,
        path + 'Green-Nebula-Right-TEX' + format,
        path + 'Green-Nebula-Top-TEX' + format,
        path + 'Green-Nebula-Bottom-TEX' + format,
        path + 'Green-Nebula-Front-TEX' + format,
        path + 'Green-Nebula-Back-TEX' + format,
    ],
    function (res) {
        scene.background = res
        scene.layers.toggle(0)
        console.log(scene.background)
    }
)
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.zoomSpeed = 4

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
}

const stars: { [id: number]: Star } = {}

//bsc5.dat @ http://tdc-www.harvard.edu/catalogs/bsc5.readme
const bsc5dat = new XMLHttpRequest()
bsc5dat.open('GET', '/data/bsc5.dat')
bsc5dat.onreadystatechange = function () {
    if (bsc5dat.readyState === 4) {
        const starData = bsc5dat.responseText.split('\n')
        const positions = new Array()
        const colors = new Array()
        const color = new THREE.Color()
        const sizes = new Array()

        starData.forEach((row) => {
            let star: Star = {
                id: Number(row.slice(0, 4)),
                name: row.slice(4, 14).trim(),
                gLon: Number(row.slice(90, 96)),
                gLat: Number(row.slice(96, 102)),
                mag: Number(row.slice(102, 107)),
                spectralClass: row.slice(129, 130),
                v: new THREE.Vector3(),
            }

            stars[star.id] = star

            star.v = new THREE.Vector3().setFromSphericalCoords(
                100,
                ((90 - star.gLat) / 180) * Math.PI,
                (star.gLon / 180) * Math.PI
            )

            positions.push(star.v.x)
            positions.push(star.v.y)
            positions.push(star.v.z)

            switch (star.spectralClass) {
                case 'O':
                    color.setHex(0x91b5ff)
                    break
                case 'B':
                    color.setHex(0xa7c3ff)
                    break
                case 'A':
                    color.setHex(0xd0ddff)
                    break
                case 'F':
                    color.setHex(0xf1f1fd)
                    break
                case 'G':
                    color.setHex(0xfdefe7)
                    break
                case 'K':
                    color.setHex(0xffddbb)
                    break
                case 'M':
                    color.setHex(0xffb466)
                    break
                case 'L':
                    color.setHex(0xff820e)
                    break
                case 'T':
                    color.setHex(0xff3a00)
                    break
                default:
                    color.setHex(0xffffff)
            }

            const s = (star.mag * 26) / 255 + 0.18
            sizes.push(s)
            colors.push(color.r, color.g, color.b, s)
        })

        const starsGeometry = new THREE.BufferGeometry()
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))
        starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

        const starsMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader(),
            fragmentShader: fragmentShader(),
            transparent: true,
        })

        const points = new THREE.Points(starsGeometry, starsMaterial)
        // scene.add(points)

        // load constellationlines
        const constellationLinesDat = new XMLHttpRequest()
        constellationLinesDat.open('GET', '/data/ConstellationLines.dat')
        constellationLinesDat.onreadystatechange = function () {
            if (constellationLinesDat.readyState === 4) {
                const constellationLinesData = constellationLinesDat.responseText.split('\n')
                constellationLinesData.forEach((row) => {
                    if (!row.startsWith('#') && row.length > 1) {
                        const rowData = row.split(/[ ,]+/)
                        var points: THREE.Vector3[] = []
                        for (let i = 0; i < rowData.length - 2; i++) {
                            let starId = parseInt(rowData[i + 2].trim())
                            if (starId in stars) {
                                const star: Star = stars[starId]
                                points.push(star.v)

                                var starDiv = document.createElement('div')
                                starDiv.className = 'starLabel'
                                starDiv.textContent = star.name.substr(0, star.name.length - 3)
                                var starLabel = new CSS2DObject(starDiv)
                                starLabel.position.set(star.v.x, star.v.y, star.v.z)
                                starLabel.userData.type = 'starName'
                                scene.add(starLabel)
                            }
                        }
                        const constellationGeometry = new THREE.BufferGeometry().setFromPoints(
                            points
                        )
                        const constellationMaterial = new THREE.LineBasicMaterial({
                            color: 0xe4dec0,
                        })
                        const constellationLine = new THREE.Line(
                            constellationGeometry,
                            constellationMaterial
                        )
                        constellationLine.userData.type = 'constellationLine'
                        scene.add(constellationLine)

                        //constellation label
                        let constellationLineBox: THREE.Box3 = new THREE.Box3().setFromObject(
                            constellationLine
                        )
                        const center = new THREE.Vector3()
                        constellationLineBox.getCenter(center)
                        var constellationDiv = document.createElement('div')
                        constellationDiv.className = 'constellationLabel'
                        constellationDiv.textContent = rowData[0]
                        var constellationLabel = new CSS2DObject(constellationDiv)
                        constellationLabel.position.set(center.x, center.y, center.z)
                        constellationLabel.userData.type = 'constellationName'
                        scene.add(constellationLabel)
                    }
                })
            }
        }
        constellationLinesDat.send()
    }
}
bsc5dat.send()

function vertexShader() {
    return `
        attribute float size;
        attribute vec4 color;
        varying vec4 vColor;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = size * ( 250.0 / -mvPosition.z );
            gl_Position = projectionMatrix * mvPosition;
        }
    `
}

function fragmentShader() {
    return `
        varying vec4 vColor;
            void main() {
                gl_FragColor = vec4( vColor );
            }
    `
}

const stats = Stats()
document.body.appendChild(stats.dom)

const guiData = {
    starNames: true,
    constellationLines: true,
    constellationNames: true,
}

const gui = new GUI()
gui.add(guiData, 'starNames').onChange(() => {
    scene.children.forEach((c: THREE.Object3D) => {
        if (c.userData.type === 'starName') {
            c.visible = guiData.starNames
        }
    })
})
gui.add(guiData, 'constellationLines').onChange(() => {
    scene.children.forEach((c: THREE.Object3D) => {
        if (c.userData.type === 'constellationLine') {
            c.visible = guiData.constellationLines
        }
    })
})
gui.add(guiData, 'constellationNames').onChange(() => {
    scene.children.forEach((c: THREE.Object3D) => {
        if (c.userData.type === 'constellationName') {
            c.visible = guiData.constellationNames
        }
    })
})

const parameters = {
    count: 50000,
    radius: 10,
    branches: 5,
    spin: 1,
    randomness: 0.8,
    randomnessPower: 4,
    insideColor: '#ec5300',
    outsideColor: '#2fb4fc',
}
// TextureLoader
const textureLoader = new THREE.TextureLoader()
const starTexture = textureLoader.load('https://assets.codepen.io/22914/star_02.png')

// const texture = textureLoader.load(
//   "https://assets.codepen.io/22914/eso0932a.jpg",
//   () => {
//     const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
//     rt.fromEquirectangularTexture(renderer, texture);
//     scene.background = rt;
//   }
// );

/**
 * Object
 */
let geometry: THREE.BufferGeometry | null = null
let material: any
let points:
    | THREE.Object3D<THREE.Event>
    | THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>
    | null = null

const generateGalaxy = () => {
    if (points !== null && geometry !== null && material !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count)
    const randomness = new Float32Array(parameters.count * 3)
    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i

        // Position
        const radius = Math.random() * parameters.radius

        const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2

        const randomX =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius
        const randomY =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius
        const randomZ =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius

        positions[i3] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius

        // Randomness
        randomness[i3] = randomX
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scales
        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
    // console.log(new THREE.)
    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: document.getElementById('vertexShader')?.textContent as any,
        fragmentShader: document.getElementById('fragmentShader')?.textContent as any,
        transparent: true,
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 30 * renderer.getPixelRatio() },
            uHoleSize: { value: 0.15 },
            uTexture: { value: starTexture },
            size: { value: 1.0 },
        },
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

gui.add(parameters, 'count')
    .min(100)
    .max(1000000)
    .step(100)
    .onFinishChange(generateGalaxy)
    .name('Star count')
gui.add(parameters, 'radius')
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy)
    .name('Galaxy radius')
gui.add(parameters, 'branches')
    .min(2)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy)
    .name('Galaxy branches')
gui.add(parameters, 'randomness')
    .min(0)
    .max(2)
    .step(0.001)
    .onFinishChange(generateGalaxy)
    .name('Randomness position')
gui.add(parameters, 'randomnessPower')
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy)
    .name('Randomness power')
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy).name('Galaxy inside color')
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy).name('Galaxy outside color')

generateGalaxy()

gui.add(material.uniforms.uSize, 'value')
    .min(1)
    .max(100)
    .step(0.001)
    .name('Point size')
    .onChange(() => {
        material.uniforms.uSize.value = material.uniforms.uSize.value * renderer.getPixelRatio()
    })

gui.add(material.uniforms.uHoleSize, 'value').min(0).max(1).step(0.001).name('Black hole size')
renderEffect(scene)
renderBloom(renderer, scene, camera)
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    bloomRender(scene)
    labelRenderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
