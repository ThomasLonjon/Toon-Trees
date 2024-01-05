import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as dat from "lil-gui";
import treesVertexShader from "./shaders/trees/vertex.glsl";
import treesFragmentShader from "./shaders/trees/fragment.glsl";
import outlineVertexShader from "./shaders/outline/vertex.glsl";
import outlineFragmentShader from "./shaders/outline/fragment.glsl";

// THREE.ColorManagement.enabled = false

// -----------------------------------------------------------------
// Base
// -----------------------------------------------------------------
// Debug
const debugObject = {
  color: "#fffffa",
};
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9e9e9e);

// -----------------------------------------------------------------
// Lights
// -----------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = 7;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

gui.add(directionalLight.position, "y").min(0).max(100).step(11).name("height");

// -----------------------------------------------------------------
// Models
// -----------------------------------------------------------------

// -------------
// Trees
// -------------
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;

// material

const material = new THREE.MeshToonMaterial();
// material.color.set(0xebebc6);

const toonMaterial = new THREE.ShaderMaterial({
  vertexShader: treesVertexShader,
  fragmentShader: treesFragmentShader,
  uniforms: {
    lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
    color: { value: new THREE.Color(debugObject.color) },
  },
  side: THREE.DoubleSide,
});

const outlineMaterial = new THREE.ShaderMaterial({
  vertexShader: outlineVertexShader,
  fragmentShader: outlineFragmentShader,
  uniforms: {
    lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
    color: { value: new THREE.Color("black") },
    outlineThickness: { value: 0.015 },
  },
  side: THREE.BackSide,
});

gltfLoader.load("/trees.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      // Appliquer le matériau principal
      child.material = material;

      // Créer un nouveau mesh pour le contour
      const outlineMesh = new THREE.Mesh(child.geometry, outlineMaterial);
      outlineMesh.position.copy(child.position);
      outlineMesh.rotation.copy(child.rotation);
      outlineMesh.scale.copy(child.scale);

      // Agrandir légèrement le mesh du contour
      const scaleIncrease = 1.0; // L'augmentation d'échelle pour le contour, ajustez selon besoin
      outlineMesh.scale.multiplyScalar(scaleIncrease);

      // Ajouter le mesh du contour au même parent que le mesh original
      child.parent.add(outlineMesh);
    }
  });

  scene.add(gltf.scene);
});

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

debugObject.color = "#fffffa";
renderer.setClearColor(debugObject.color);

gui.addColor(debugObject, "color").onChange(() => {
  const color = new THREE.Color(debugObject.color);
  toonMaterial.uniforms.color.value = color;
});

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

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
