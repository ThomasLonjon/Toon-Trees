import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as dat from "lil-gui";
import firefliesVertexShader from "./shaders/fireflies/vertex.glsl";
import firefliesFragmentShader from "./shaders/fireflies/fragment.glsl";
import fireVertexShader from "./shaders/fire/vertex.glsl";
import fireFragmentShader from "./shaders/fire/fragment.glsl";

// THREE.ColorManagement.enabled = false

// -----------------------------------------------------------------
// Base
// -----------------------------------------------------------------
// Debug
// const debugObject = {};
// const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x16221f);

// -----------------------------------------------------------------
// Lights
// -----------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
// directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = 7;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2);
// directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = 7;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = 7;
directionalLight.position.set(5, 5, -5);
scene.add(directionalLight2);

// -----------------------------------------------------------------
// Models
// -----------------------------------------------------------------

// -------------
// Forest
// -------------
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;

// material
const fireShader = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uScale: { value: 0.6 },
  },
  vertexShader: fireVertexShader,
  fragmentShader: fireFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

// gui.add(fireShader.uniforms.uScale, "value").min(0).max(1).step(0.1).name("flames size");

gltfLoader.load("/forest.glb", (gltf) => {
  gltf.scene.rotation.y = Math.PI;
  const fireAMesh = gltf.scene.children.find((child) => child.name === "FireA");
  const fireBMesh = gltf.scene.children.find((child) => child.name === "FireB");

  fireAMesh.material = fireShader;
  fireBMesh.material = fireShader;

  scene.add(gltf.scene);
});

// -------------
// Fireflies
// -------------
// Geometry
const firefliesGeometry = new THREE.BufferGeometry();
const firefliesCount = 40;
const positionArray = new Float32Array(firefliesCount * 3);
const scaleArray = new Float32Array(firefliesCount * 1);

for (let i = 0; i < firefliesCount; i++) {
  positionArray[i * 3 + 0] = (Math.random() - 0.5) * 0.2 + 0.4;
  positionArray[i * 3 + 1] = Math.random() * 2;
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 0.2 + 0.7;

  scaleArray[i] = Math.random();
}

firefliesGeometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
firefliesGeometry.setAttribute("aScale", new THREE.BufferAttribute(scaleArray, 1));

// Material
const firefliesMaterial = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uSize: { value: 100 } },
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

// gui.add(firefliesMaterial.uniforms.uSize, "value").min(0).max(500).step(1).name("firefliesSize");

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
scene.add(fireflies);

// -----------------------------------------------------------------
// Render
// -----------------------------------------------------------------

// -------------
// Sizes
// -------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Update fireflies
  firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
});

// -------------
// Camera
// -------------
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 15, 20);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

controls.maxPolarAngle = Math.PI / 2; // 90 degrees in radians
controls.minPolarAngle = 0; // 0 degrees in radians

// -------------
// Renderer
// -------------
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
// renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// debugObject.clearColor = "#16221f";
// renderer.setClearColor(debugObject.clearColor);
// gui.addColor(debugObject, "clearColor").onChange(() => {
//   renderer.setClearColor(debugObject.clearColor);
// });

// -------------
// Animate
// -------------
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  if (mixer) {
    mixer.update(deltaTime);
  }

  // Update Fire
  fireShader.uniforms.uTime.value = elapsedTime;

  // Update materials
  firefliesMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
