import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
//tilt 23.4 degrees and convert it to radians
// earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
const moonMaterial = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/moonmap4k.jpg"),
  bumpMap: loader.load("./textures/moonbump4k.jpg"),
  bumpScale: 0.04,
})
const moonMesh = new THREE.Mesh(geometry, moonMaterial);
moonMesh.position.set(-3, 1, 0);
moonMesh.scale.setScalar(0.3);
earthMesh.rotation.z = -23.4 * Math.PI / 180;
earthGroup.add(earthMesh);
earthGroup.add(moonMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
lightsMesh.rotation.z = -23.4 * Math.PI / 180;
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
cloudsMesh.rotation.z = -23.4 * Math.PI / 180;
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
glowMesh.rotation.z = -23.4 * Math.PI / 180;
earthGroup.add(glowMesh);

const stars = getStarfield({ numStars: 20_000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
moonMesh.add(sunLight);
scene.add(sunLight);


function orbitBody(body: THREE.Mesh, orbiter: THREE.Mesh, speed: number, distanceFromBody: number, time: number) {
  const xMovement = Math.cos(time * speed / 1000) * distanceFromBody;
  const zMovement = Math.sin(time * speed / 1000) * distanceFromBody;
  orbiter.position.x = -1 * (xMovement + body.position.x);
  orbiter.position.z = -1 * (zMovement + body.position.z);
}

function animate(t: number = 0) {
  requestAnimationFrame(animate);

  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002;

  //moonMesh.position.x += 0.01;
  orbitBody(earthMesh, moonMesh, 0.5, 3, t);
  renderer.render(scene, camera);
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
