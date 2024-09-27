import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Text } from "troika-three-text";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import GeoTIFF from "geotiff";
import * as GEOLIB from "geolib";
import { BufferGeometry } from "three";
import gsap from "gsap";
import GUI from "lil-gui";
import sphere360 from "./img/vita360_stitch.jpg";
import earth from "./img/cartedemode360.jpg";

function calcPosFromLatLonRad(lat, lon) {
  var phi = lat * (Math.PI / 180);
  var theta = (lon + 180) * (Math.PI / 180);
  var theta1 = (270 - lon) * (Math.PI / 180);
  let x = Math.cos(phi) * Math.cos(theta);
  let z = Math.cos(phi) * Math.sin(theta);
  let y = Math.sin(phi);
  let vector = { x, y, z };
  let euler = new THREE.Euler(phi, theta1, 0, "XYZ");
  let quaternion = new THREE.Quaternion().setFromEuler(euler);
  return { vector, quaternion };
}

let points = [
  {
    title: "Lapan'ny Tanàna",
    coords: {
      lat: -21.4553308,
      lng: 47.0852686,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Monument aux morts",
    coords: {
      lat: -21.455889,
      lng: 47.0831,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Lettres FIANARANTSOA",
    coords: {
      lat: -21.45535,
      lng: 47.0844,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Porte d’entrée de la vieille ville",
    coords: {
      lat: -21.45495,
      lng: 47.076303,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Cathédrale Saint Nom de Jésus Ambozontany",
    coords: {
      lat: -21.4542,
      lng: 47.0759999,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Rova",
    coords: {
      lat: -21.451839,
      lng: 47.0769,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Gare FCE",
    coords: {
      lat: -21.4639999,
      lng: 47.0901,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Jardin botanique d’Anosy",
    coords: {
      lat: -21.451508,
      lng: 47.071397,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: " Lac d’Anosy",
    coords: {
      lat: -21.450919,
      lng: 47.070562,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: " Point de vue sur la colline de Kianjosoa",
    coords: {
      lat: -21.465999,
      lng: 47.078015,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: " Marché du Zoma",
    coords: {
      lat: -21.456263,
      lng: 47.085703,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: " Bâtiment de la poste",
    coords: {
      lat: -21.456623,
      lng: 47.084814,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: " Escalier mort-homme",
    coords: {
      lat: -21.457447,
      lng: 47.078855,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: " Faculté des Sciences",
    coords: {
      lat: -21.4466208,
      lng: 47.110388,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: " emit",
    coords: {
      lat: -21.4479998,
      lng: 47.1099985,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Faculté de Droit, Économie, Gestion et Sciences Sociales",
    coords: {
      lat: -21.4473408,
      lng: 47.1090995,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "confesus",
    coords: {
      lat: -21.447098,
      lng: 47.1088035,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Faculté des medicine",
    coords: {
      lat: -21.4487998,
      lng: 47.1096985,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Faculté des Lettres et Sciences Humaines",
    coords: {
      lat: -21.448803,
      lng: 47.1089467,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
  {
    title: "Faculté des Lettres et Sciences Humaines",
    coords: {
      lat: -21.448301,
      lng: 47.107711,
    },
    texture: sphere360,
    modelPath: "./assets/arendrinatsymirehatra.glb",
  },
];

const fragment = `
uniform float time;
uniform float progress;
uniform sampler2D scene360;
uniform sampler2D sceneplanet;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.141592653589793238;

vec2 distort(vec2 olduv, float pr, float expo){
  vec2 p0 = 2. * olduv - 1.;
  vec2 p1 = p0 / (1. - pr * length(p0) * expo);

  return (p1 + 1.) * 0.5;
}

void main() {
  float progress1 = smoothstep(0.75,1.,progress);


  vec2 uv1 = distort(vUv, 
    -10.*pow(0.5 + 0.5*progress,32.),
    progress*4.);
  vec2 uv2 = distort(vUv, 
    -10.*(1. - progress1)
    ,progress*4.);


  vec4 s360 = texture2D(scene360, uv2);
  vec4 sPlanet = texture2D(sceneplanet, uv1);
  float mixer = progress1;
  vec4 finalTexture = mix(sPlanet, s360, mixer);

  gl_FragColor = vec4(uv1, 0.0, 1.);
  gl_FragColor = finalTexture;
}

 
         
  
`;

const vertex = `
  varying vec2 vUv;
  varying vec2 vCoordinates;
  attribute vec3 aCoordinates;
 
  void main() {
    vUv = uv;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
    gl_PointSize = 4000. * (1. / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vCoordinates = aCoordinates.xy;
  }
`;

const center = [47.0852686, -21.4563308];
let scene,
  camera,
  renderer,
  controls,
  scene360,
  camera360,
  controls360,
  raycaster,
  MAT_BUILDING,
  MAT_ROADS = null,
  collider_building = [];
var Animated_Line_Distances = [];
const FLAG_ROAD_ANI = true;
let iR;
let iR_Roads = null;
var iR_Line = null;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.getElementById("cont").appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);
  //scene.fog = new THREE.FogExp2(0x222222, 0.04);

  camera = new THREE.PerspectiveCamera(
    25,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.set(8, 4, 0);

  // Create the new scene
  scene360 = new THREE.Scene();
  scene360.background = new THREE.Color(0xffffff);

  // Create the new camera
  camera360 = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.001,
    1000
  );
  camera360.position.x = -3;

  // Create the new controls
  controls360 = new OrbitControls(camera360, renderer.domElement);
  controls360.enableDamping = true;
  controls360.dampingFactor = 0.05;
  controls360.screenSpacePanning = false;
  controls360.enableZoom = false;
  controls360.maxPolarAngle = Math.PI / 1.5; // par exemple, 90 degrés
  controls360.minPolarAngle = 0.9;
  // Init group
  iR = new THREE.Group();
  iR.name = "Interactive Root";
  iR_Roads = new THREE.Group();
  iR_Roads.name = "Roads";
  iR_Line = new THREE.Group();
  iR_Line.name = "Animated Line on Roads";
  scene.add(iR);
  scene.add(iR_Roads);
  scene.add(iR_Line);

  raycaster = new THREE.Raycaster();

  // Créer un groupe pour les routes
  iR_Roads = new THREE.Group();
  iR_Roads.name = "Roads";

  // Ajouter le groupe directement à la scène
  scene.add(iR_Roads);

  // Lights

  let light0 = new THREE.AmbientLight(0xfafafa, 0.25);

  let light1 = new THREE.PointLight(0xfafafa, 0.4);
  light1.position.set(200, 90, 40);

  let light2 = new THREE.PointLight(0xfafafa, 0.4);
  light2.position.set(200, 90, -40);

  scene.add(light0);
  scene.add(light1);
  scene.add(light2);

  const gridHelper = new THREE.GridHelper(
    80,
    100,
    new THREE.Color(0x555555),
    new THREE.Color(0x333333)
  );
  scene.add(gridHelper);

  controls = new OrbitControls(camera, renderer.domElement);

  // controls.addEventListener( 'change', render ); // Call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true; // An animation loop is required when either damping or auto-rotation is enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;
  controls.minDistance = 3.5;
  controls.maxDistance = 55;

  controls.maxPolarAngle = Math.PI / 2.1;

  controls.update();

  MAT_BUILDING = new THREE.MeshPhongMaterial();

  create360();
  createPOIs();

  getGeoJson();
}

function loadGLBModel(modelPath, callback) {
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      // Ajustez l'échelle du modèle
      model.scale.set(0.1, 0.1, 0.1); // Ajustez le facteur d'échelle selon les besoins

      // Enregistrez le modèle dans l'objet POI
      callback(model);
    },
    undefined,
    (error) => {
      console.error("Erreur lors du chargement du modèle GLB :", error);
    }
  );
}

function createPOIs() {
  points.forEach((poi) => {
    // Chargez le modèle GLB pour chaque POI
    loadGLBModel(poi.modelPath, (model) => {
      // Ajustez l'échelle du modèle
      model.scale.set(0.1, 0.1, 0.1); // Ajustez le facteur d'échelle selon les besoins

      // Utilisez les coordonnées du fichier GeoJSON comme nouvelles coordonnées
      const position = GPSRelativePosition(
        [poi.coords.lng, poi.coords.lat],
        center
      );

      // Ajustez la hauteur (coordonnée y) selon vos besoins
      model.position.set(position[0], 0.3, position[1]);

      // Ajoutez le modèle à la scène
      scene.add(model);

      // Enregistrez une référence au modèle dans l'objet POI
      poi.model = model;

      // Démarrez l'animation de rotation automatique
      startRotationAnimation(poi);
    });
  });
}

function getBuildingHeight(position) {
  const raycaster = new THREE.Raycaster();
  const direction = new THREE.Vector3(0, -1, 0); // vers le bas

  raycaster.set(position, direction);
  const intersects = raycaster.intersectObjects(collider_building, true);

  if (intersects.length > 0) {
    return intersects[0].point.y; // La hauteur du bâtiment à cet endroit
  }

  return 0; // Aucun bâtiment trouvé, utilisez une valeur par défaut
}

function startRotationAnimation(poi) {
  // Vitesse de rotation en radians par trame
  const rotationSpeed = 0.01;

  // Fonction d'animation pour faire tourner l'objet GLB automatiquement
  function animate() {
    poi.model.rotation.y += rotationSpeed;

    // Appelez la fonction animate à chaque trame
    requestAnimationFrame(animate);
  }

  // Appelez la fonction animate pour commencer l'animation
  animate();
}

function create360() {
  const geometry = new THREE.SphereGeometry(10, 30, 30);
  const texture = new THREE.TextureLoader().load(sphere360);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
  });
  const sphere = new THREE.Mesh(geometry, material);
  scene360.add(sphere);

  // Create:
  const myText = new Text();
  scene360.add(myText);

  // Set properties to configure:
  myText.text = "Studio EMIT";
  myText.fontSize = 1;
  myText.anchorX = "center";
  // Utilisez 'fontFace' au lieu de 'font'
  myText.position.z = -4;
  myText.color = new THREE.Color(0x9ec3e9); // Utilisez THREE.Color pour la couleur

  // Update the rendering:
  myText.sync();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  //renderer.render(scene360, camera360);
  controls.update();
  UpdateAniLine();
}

function onWindowResize() {
  // Update the original camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update the new camera
  camera360.aspect = window.innerWidth / window.innerHeight;
  camera360.updateProjectionMatrix();

  // Resize the renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

document.getElementById("cont").addEventListener("mousedown", (event) => {
  let mouse = {
    x: (event.clientX / window.innerWidth) * 2 - 1,
    y: -(event.clientY / window.innerHeight) * 2 + 1,
  };

  let hitted = Fire(mouse);
  if (hitted && hitted.info) {
    console.log(hitted.info);
  } else {
    console.log(hitted);
  }
});

function getGeoJson() {
  fetch("./assets/edinburgh_road.geojson")
    .then((res) => res.json())
    .then((data) => {
      loadBuildings(data);
    })
    .catch((error) => {
      console.error("Error fetching GeoJSON:", error);
    });
}

function loadBuildings(data) {
  const features = data.features;
  const matRoads = new THREE.LineBasicMaterial({ color: 0x2a5175 });

  for (let i = 0; i < features.length; i++) {
    const feature = features[i];

    if (!feature.properties) {
      console.warn("Invalid GeoJSON feature:", feature);
      continue;
    }

    const info = feature.properties;

    if (info.building) {
      addBuilding(feature.geometry.coordinates, info, info["building:levels"]);
    } else if (info.highway) {
      if (
        feature.geometry.type == "LineString" &&
        info["highway"] != "pedestrian" &&
        info["highway"] != "footway" &&
        info["highway"] != "path"
      ) {
        addRoad(feature.geometry.coordinates, info, matRoads);
      }
    }
  }
}

function addBuilding(data, info, Height = 1) {
  let shape, geometry;
  let holes = [];

  for (let i = 0; i < data.length; i++) {
    const el = data[i];

    if (i === 0) {
      shape = genShape(el, center);
    } else {
      holes.push(genShape(el, center));
    }
  }

  for (let h = 0; h < holes.length; h++) {
    shape.holes.push(holes[h]);
  }

  geometry = genGeometry(shape, {
    curveSegments: 1,
    depth: 0.1 * Height,
    bevelEnabled: false,
  });

  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(Math.PI);

  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
  scene.add(mesh);

  let helper = genHelper(geometry);
  if (helper) {
    helper.name = info["name"] ? info["name"] : "Building";
    helper.info = info;
    collider_building.push(helper);
  }
}

function addRoad(data, info, matRoads) {
  let points = [];

  for (let i = 0; i < data.length; i++) {
    if (!data[0][1]) return;

    let el = data[i];

    if (!el[0] || !el[1]) return;

    let elp = [el[0], el[1]];

    elp = GPSRelativePosition(elp, center);

    points.push(new THREE.Vector3(elp[0], 0.5, elp[1]));
  }

  let geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.rotateZ(Math.PI);

  let line = new THREE.Line(geometry, matRoads);
  line.info = info;

  // Instead of using computeBoundingBox, calculate dimensions manually
  let boundingBox = new THREE.Box3().setFromBufferAttribute(
    geometry.attributes.position
  );
  line.userData.dimensions = boundingBox.getSize(new THREE.Vector3());

  iR_Roads.add(line);

  line.position.set(line.position.x, 0.5, line.position.Z);

  if (FLAG_ROAD_ANI) {
    // Calculate the length of the line
    let lineLength = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const point1 = points[i];
      const point2 = points[i + 1];
      lineLength += point1.distanceTo(point2);
    }

    if (lineLength > 0.8) {
      let aniLine = AddAniLine(geometry, lineLength);
      iR_Line.add(aniLine);
    }
  }
}

function AddAniLine(geometry, length) {
  let aniLine = new THREE.Line(
    geometry,
    new THREE.LineDashedMaterial({ color: 0x00ffff, linewidth: 5 })
  );
  aniLine.material.transparent = true;
  aniLine.position.y = 0.5;
  aniLine.material.dashSize = 0;
  aniLine.material.gapSize = 1000;
  Animated_Line_Distances.push(length);
  return aniLine;
}

function UpdateAniLine() {
  if (iR_Line.children.length <= 0) return;

  for (let i = 0; i < iR_Line.children.length; i++) {
    let line = iR_Line.children[i];

    let dash = parseInt(line.material.dashSize);
    let length = parseInt(Animated_Line_Distances[i]);

    if (dash > length) {
      line.material.dashSize = 0;
      line.material.opacity = 1;
    } else {
      line.material.dashSize += 0.004;
      line.material.opacity =
        line.material.opacity > 0 ? line.material.opacity - 0.002 : 0;
    }
  }
}

function genHelper(geometry) {
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }
  let box3 = geometry.boundingBox;
  if (!isFinite(box3.max.x)) {
    return null; // Return null if the bounding box is not valid
  }
  let helper = new THREE.Box3Helper(box3, 0xffff00);
  helper.updateMatrixWorld();
  return helper;
}

function genShape(points, center) {
  const shape = new THREE.Shape();

  for (let i = 0; i < points.length; i++) {
    let elp = points[i];

    elp = GPSRelativePosition(elp, center);

    if (i === 0) {
      shape.moveTo(elp[0], elp[1]);
    } else {
      shape.lineTo(elp[0], elp[1]);
    }
  }

  return shape;
}

function genGeometry(shape, config) {
  const geometry = new THREE.ExtrudeGeometry(shape, config);
  geometry.computeBoundingBox();

  return geometry;
}

function Fire(pointer) {
  raycaster.setFromCamera(pointer, camera);

  let intersects = raycaster.intersectObjects(collider_building, true);
  if (intersects.length > 0) {
    return intersects[0].object;
  } else {
    return null;
  }
}

function GPSRelativePosition(objPosi, centerPosi) {
  // Get GPS distance
  const dis = GEOLIB.getDistance(objPosi, centerPosi);

  // Get direction angle
  const bearing = GEOLIB.getRhumbLineBearing(objPosi, centerPosi);

  // Calculate x by centerPosi.x + distance * cos(rad)
  const x = centerPosi[0] + dis * Math.cos((bearing * Math.PI) / 180);

  // Calculate y by centerPosi.y + distance * sin(rad)
  const y = centerPosi[1] + dis * Math.sin((bearing * Math.PI) / 180);

  // Invert x (it works)
  return [-x / 100, y / 100];
}
