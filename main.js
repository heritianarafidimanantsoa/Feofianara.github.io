import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import locationsData from './data.json';

const modal = document.getElementById("myModal");
const btn = document.getElementById("submit-btn");
const span = document.getElementsByClassName("close")[0];
const jsonList = document.getElementById("jsonList");
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const loader = new GLTFLoader();
const controls = new MapControls(camera, renderer.domElement);
const scene360 = new THREE.Scene();
const camera360 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);
let is360 = false;
let loadingCount = 0; // Moved outside for visibility
const totalModels = 4; // Update this number according to the number of models to load
const grounds = []; // Declare grounds array to hold ground chunks

// Open/close the modal
btn.onclick = () => modal.style.display = "block";
span.onclick = () => modal.style.display = "none";
window.onclick = (event) => event.target === modal && (modal.style.display = "none");

// Load JSON data
fetch('360.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item.lieu;
      listItem.onclick = () => {
        create360(item);
        modal.style.display = "none";
      };
      jsonList.appendChild(listItem);
    });
  })
  .catch(console.error);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.set(0, 20, 0);
controls.enableDamping = true;

// Initialize the scene
const loadingElement = document.createElement('div');
loadingElement.innerHTML = 'Loading...';
loadingElement.style.position = 'absolute';
loadingElement.style.top = '50%';
loadingElement.style.left = '50%';
loadingElement.style.transform = 'translate(-50%, -50%)';
loadingElement.style.color = 'white';
loadingElement.style.fontSize = '30px';
document.body.appendChild(loadingElement);

function init() {
  loadModels(['half_ground.glb', 'all_buildings.glb', 'roads.glb', 'rivers.glb']);

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      loader.load(`grounds/ground_${i}_${j}.glb`, async function (gltf) {
        const ground_chunk = gltf.scene;
        ground_chunk.scale.set(0.004 * ground_chunk.scale.x, 0.004 * ground_chunk.scale.y, 0.004 * ground_chunk.scale.z);
        ground_chunk.position.y -= 6;

        // Wait until the model can be added to the scene without blocking due to shader compilation
        await renderer.compileAsync(ground_chunk, camera, scene);

        ground_chunk.name = `ground_${i}_${j}`;
        scene.add(ground_chunk);
        grounds.push(ground_chunk);
      }, undefined, console.error);
    }
  }

  // Add a directional light
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 10).normalize();
  scene.add(light);

  window.addEventListener('resize', onWindowResize);
}

// Load multiple models
function loadModels(files) {
  files.forEach(file => {
    loader.load(file, gltf => {
      const model = gltf.scene;
      model.scale.set(0.006, 0.006, 0.006); // Adjust scale
      model.position.y -= 6; // Adjust position
      scene.add(model);

      // Increment the loading counter
      loadingCount++;
      checkLoadingComplete();
    }, undefined, console.error);
  });
}

// Check if loading is complete
function checkLoadingComplete() {
  if (loadingCount === totalModels) {
    document.body.removeChild(loadingElement); // Remove the loading element
  }
}

// Create the 360 scene
function create360(data) {
  if (is360) return;
  is360 = true;
  const texture = new THREE.TextureLoader().load(`./img/360/${data.photo360}`, () => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(10, 30, 30),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
    );
    scene360.add(sphere);
    animate360();
  });
}

// Animate the 360 scene
function animate360() {
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene360, camera360);
  });
}

// Handle window resizing
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize and animate the main scene
init();
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
