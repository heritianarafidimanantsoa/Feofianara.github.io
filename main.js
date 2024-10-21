import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Text } from "troika-three-text";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import locationsData from "./data.json";
import sphere360 from "./img/vita360_stitch.jpg";
import data from "./360.json";
import { convertSpeed } from "geolib";
// Récupérer la modale
var modal = document.getElementById("myModal");

// Récupérer le bouton qui ouvre la modale
var btn = document.getElementById("submit-btn");

// Récupérer l'élément <span> qui permet de fermer la modale
var span = document.getElementsByClassName("close")[0];

// Quand l'utilisateur clique sur le bouton, ouvrir la modale
btn.onclick = function () {
    modal.style.display = "block";
};

// Quand l'utilisateur clique sur <span> (x), fermer la modale
span.onclick = function () {
    modal.style.display = "none";
};

// Quand l'utilisateur clique n'importe où en dehors de la modale, fermer la modale
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

const progressBar = document.getElementById("progress-bar");
const progressBarContainer = document.querySelector(".progress-bar-container");
const loadingManager = new THREE.LoadingManager();
const startbutton = document.querySelector(".header button");

const buttonMap = document.getElementById("buttonMap");
const title = document.querySelector(".header h1");
const header = document.querySelector(".header");
var show_place = false;

const darkModeIcon = document.getElementById("darkModeIcon");

var isMap = true;
var donnees = "";
var is360 = false;
var sound = "";
var buildings;
var roads;
var rivers;
const loader1 = new GLTFLoader(loadingManager).setPath("/");
var grounds = [];
var cam;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000000
);

const jsonList = document.getElementById("jsonList");

// Charger le fichier JSON
fetch("360.json")
    .then((response) => response.json())
    .then((data) => {
        // Parcourir les données JSON et créer des éléments <li>
        data.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.className = "lieuLi";
            listItem.textContent = `${item.lieu}`;
            listItem.addEventListener("click", function () {
                create360(item);
                // Masquer le navbar après avoir créé la scène 360
                hideNavbarIn360();
                // Supprimer complètement la première scène après avoir créé la deuxième scène
                removeFirstScene();
                // Définir renderScene360 sur true pour indiquer que la scène 360 doit être rendue
                renderScene360 = true;

                modal.style.display = "none";
            });
            jsonList.appendChild(listItem);
        });
    })
    .catch((error) => {
        console.error("Error loading JSON:", error);
    });

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Position initiale en haut
camera.position.set(0, 20, 0);

var controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2.2;
controls.enableZoom = true;
controls.minZoom = 2;
controls.maxZoom = 8;

// Limites pour le contrôle de la caméra
controls.minDistance = 5;
controls.maxDistance = 8;

controls.maxAzimuthAngle = THREE.MathUtils.degToRad(53);
controls.minAzimuthAngle = THREE.MathUtils.degToRad(45);
controls.maxPolarAngle = THREE.MathUtils.degToRad(45);
controls.minPolarAngle = THREE.MathUtils.degToRad(30);

// Définit les limites de déplacement sur l'axe X et Y (gauche, droite, haut, bas)
const minPan = new THREE.Vector3(-7, -7, -7); // Limite minimum de déplacement (gauche, bas)
const maxPan = new THREE.Vector3(7, 7, 7); // Limite maximum de déplacement (droite, haut)

// Fonction pour limiter le mouvement sur le plan
controls.addEventListener("change", () => {
    const offset = controls.target.clone().sub(camera.position);

    // On clone le target actuel
    const newPan = controls.target.clone();

    // Limitation sur l'axe X (gauche, droite)
    newPan.x = Math.max(minPan.x, Math.min(maxPan.x, newPan.x));

    // Limitation sur l'axe Y (haut, bas)
    newPan.y = Math.max(minPan.y, Math.min(maxPan.y, newPan.y));

    newPan.z = Math.max(minPan.z, Math.min(maxPan.z, newPan.z));

    // Ajuster la position de la caméra en fonction des nouvelles limites
    camera.position.copy(newPan.clone().sub(offset));
    controls.target.copy(newPan);
});

// Création de la scène 360
var scene360 = new THREE.Scene();
scene360.background = new THREE.Color(0xffffff);

var camera360 = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.001,
    1000
);
camera360.position.z = 3;

// Ajout des contrôles de la caméra
var controls360 = new OrbitControls(camera360, renderer.domElement);
controls360.enableDamping = true;
controls360.dampingFactor = 0.05;
controls360.enableZoom = false;
controls360.screenSpacePanning = false;

function setupLight() {
    var hemiLight = new THREE.HemisphereLight(0x224488, 0xffffff, 0.1);
    hemiLight.color.setHSL(0.6, 0.75, 0.5);
    hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-1, 0.75, 1);
    dirLight.position.multiplyScalar(50);
    dirLight.name = "dirlight";
    dirLight.shadowCameraVisible = true;

    scene.add(dirLight);

    dirLight.castShadow = true;
    dirLight.shadowMapWidth = dirLight.shadowMapHeight = 1024 * 2;

    var d = 300;

    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;

    dirLight.shadowCameraFar = 3500;
    dirLight.shadowBias = -0.0001;
    dirLight.shadowDarkness = 0.35;
}

function loadModel(file, overideMaterial = null) {
    loader1.load(file, async function (gltf) {
        const model = gltf.scene;
        model.scale.set(
            0.004 * model.scale.x,
            0.004 * model.scale.y,
            0.004 * model.scale.z
        );
        // wait until the model can be added to the scene without blocking due to shader compilation
        model.position.y -= 6;

        await renderer.compileAsync(model, camera, scene);
        if (overideMaterial != null) {
            model.traverse((object) => {
                object.material = overideMaterial;
            });
        }
        model.traverse((item) => {
            console.log(item);
        });
        scene.add(model);
    });
}

function init() {
    // build map
    // TODO : build by chunk
    loadModel("Tany.glb");

    // buildings
    loader1.load("Trano.glb", async function (gltf) {
        buildings = gltf.scene;
        buildings.scale.set(
            0.004 * buildings.scale.x,
            0.004 * buildings.scale.y,
            0.004 * buildings.scale.z
        );
        buildings.position.y -= 6;
        // wait until the model can be added to the scene without blocking due to shader compilation
        await renderer.compileAsync(buildings, camera, scene);

        buildings.name = "buildings";
        scene.add(buildings);
    });
    // roads
    loader1.load("Lalana.glb", async function (gltf) {
        roads = gltf.scene;
        roads.scale.set(
            0.004 * roads.scale.x,
            0.004 * roads.scale.y,
            0.004 * roads.scale.z
        );
        roads.position.y -= 6;
        // wait until the model can be added to the scene without blocking due to shader compilation
        await renderer.compileAsync(roads, camera, scene);

        roads.name = "roads";
        scene.add(roads);
    });
    // rivers
    loader1.load("rivers.glb", async function (gltf) {
        rivers = gltf.scene;
        rivers.scale.set(
            0.004 * rivers.scale.x,
            0.004 * rivers.scale.y,
            0.004 * rivers.scale.z
        );
        rivers.position.y -= 6;
        // wait until the model can be added to the scene without blocking due to shader compilation
        await renderer.compileAsync(rivers, camera, scene);

        rivers.name = "rivers";
        scene.add(rivers);
    });

    setupLight();

    initPostprocessing();
    loadPointOfInterest();

    container.appendChild(renderer.domElement);
    container.style.touchAction = "none";
    addMouseEvents();

    //container.addEventListener( 'pointermove', onPointerMove );

    window.addEventListener("resize", onWindowResize);
}

// Chargez le fichier GLTF
const loader = new GLTFLoader(loadingManager);

// Appel de la fonction pour charger le point d'intérêt
loadPointOfInterest();

let exitButton; // Variable globale pour stocker une référence au bouton "Quitter"
let audioPlayPauseButton; // Variable globale pour stocker une référence au bouton "Quitter"

function create360(data) {
    audioPlayer2.pause();
    sound360 = true;
    if (is360) {
        // Création de la caméra
        camera360.position.set(0, 0, 0);
        camera360.lookAt(0, 0, 0);
    }

    is360 = true;
    // Création de la géométrie de la sphère
    const geometry = new THREE.SphereGeometry(10, 30, 30);

    // Chargement de la texture
    // const texture = new THREE.TextureLoader().load("./img/"+data.photo);
    const texture = new THREE.TextureLoader().load(
        "./img/360/" + data.photo360
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

    //Charement des données descriptions
    document.getElementById("show_description").classList =
        "show_description is_displayed2";
    document.getElementById("nom-lieu").textContent = data.lieu;
    document.getElementById("nom").textContent = data.lieu;
    document.getElementById("desc1").textContent = data.descriptions[0];
    document.getElementById("description").textContent = data.descriptions[1];
    document.getElementById("image_principale").src =
        "img/galery/" + data.photo;

    try {
        audioElement1 = new Audio("./music/audio/" + data.feo[0].audio);
        document.getElementById("nom1").textContent = data.feo[0].name;
        document.getElementById("comment1").textContent = data.feo[0].comment;
    } catch (e) {
        audioElement1 = null;
        document.getElementById("nom1").textContent = "..";
        document.getElementById("comment1").textContent = "...";
    }

    try {
        audioElement2 = new Audio("./music/audio/" + data.feo[1].audio);
        document.getElementById("nom2").textContent = data.feo[1].name;
        document.getElementById("comment2").textContent = data.feo[1].comment;
    } catch (e) {
        audioElement2 = null;
        document.getElementById("nom2").textContent = "..";
        document.getElementById("comment2").textContent = "...";
    }

    // Sélection de l'élément du carrousel
    var images = data.galery;
    // Sélection de l'élément du carrousel
    const carouselList = document.getElementById("carousel-list");
    const prev = document.querySelector(".carousel #prev");
    const next = document.querySelector(".carousel #next");

    // Vérification si l'élément existe
    if (carouselList) {
        // Générer le HTML du carrousel
        let carouselHTML = "";
        images.forEach((imageUrl, index) => {
            const activeClass = index === 0 ? "activ" : ""; // Ajoute la classe "active" au premier élément
            carouselHTML += `
          <li class="slide ${activeClass}">
            <img src="img/galery/${imageUrl}" class="image-cliquable" alt="image carousel">
          </li>
        `;
        });
        // Mettre le HTML généré dans le carrousel
        carouselList.innerHTML = carouselHTML;
    } else {
        console.error("L'élément carousel-list est introuvable.");
    }

    // Sélection des boutons précédent et suivant
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");

    // Ajout des gestionnaires d'événements pour les boutons précédent et suivant
    prevButton.addEventListener("click", () => changeSlide(-1)); // -1 pour la diapositive précédente
    nextButton.addEventListener("click", () => changeSlide(1)); // 1 pour la diapositive suivante

    var sound360 = true;
    document.getElementById("sound").addEventListener("click", () => {
        if (sound360 === true) {
            sound.pause();
            sound360 = false;
        } else {
            sound.play();
            sound360 = true;
        }
    });

    // Fonction pour changer de diapositive
    function changeSlide(direction) {
        const slides = document.querySelectorAll(".slide");
        let currentSlide = document.querySelector(".slide.active");

        if (!currentSlide) {
            currentSlide = slides[0]; // Sélectionne la première diapositive si aucune n'est active
            currentSlide.classList.add("active");
        }

        let newIndex = Array.from(slides).indexOf(currentSlide) + direction;
        newIndex = (newIndex + slides.length) % slides.length; // Permet de boucler les diapositives

        slides.forEach((slide) => slide.classList.remove("active"));
        slides[newIndex].classList.add("active");
    }

    // document.getElementById("desc-description").textContent = data.descriptions[0];
    console.log(data);
    //sound
    sound = new Audio("./music/" + data.audio);
    sound.loop = true;
    sound.play();

    // Création du matériau
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
    });

    // Création de la sphère
    const sphere = new THREE.Mesh(geometry, material);

    // Ajout de la sphère à la scène 360
    scene360.add(sphere);

    // Création de texte
    const myText = new Text();
    scene360.add(myText);

    // Configuration des propriétés du texte
    myText.text = data.lieu;
    myText.anchorX = "center";
    myText.font = "./fonts/Montserrat-Regular.otf";
    myText.color = 0x9ec3e9;

    // Ajustements responsive en fonction de la taille de l'écran
    if (window.innerWidth <= 768) {
        // Pour les écrans mobiles
        myText.fontSize = 0.3; // Taille plus petite sur mobile
        myText.position.z = -2; // Position ajustée pour mobile
    } else if (window.innerWidth <= 1024) {
        // Pour les tablettes
        myText.fontSize = 0.3; // Taille moyenne pour les tablettes
        myText.position.z = -2; // Position ajustée pour tablette
    } else {
        // Pour les grands écrans
        myText.fontSize = 1; // Taille normale pour les grands écrans
        myText.position.z = -4; // Position par défaut
    }

    // Mise à jour du rendu du texte
    myText.sync();

    // Ajouter le bouton "Quitter" seulement si la scène 360 n'est pas déjà ouverte
    if (is360 === true) {
        // Création du bouton lecture/pause pour l'audio
        audioPlayPauseButton = document.createElement("button");
        audioPlayPauseButton.classList.add("button");
        audioPlayPauseButton.style.display = "block";
        audioPlayPauseButton.addEventListener("click", toggleAudioPlayPause); // Ajoute un gestionnaire d'événements clic

        // Création de l'icône pour le bouton lecture/pause
        // Création de l'icône pour le bouton lecture/pause
        const audioIcon = document.createElement("img");
        audioIcon.src = "./img/music.png"; // Chemin vers l'icône "play" ou "pause"

        // Ajustement de la taille de l'icône en fonction de la largeur de la fenêtre
        const screenWidth = window.innerWidth;

        if (screenWidth < 640) {
            // Petit écran (mobile)
            audioIcon.style.width = "25px"; // Définir la largeur de l'icône
            audioIcon.style.height = "24px"; // Définir la hauteur de l'icône
        } else if (screenWidth < 768) {
            // Écrans moyens
            audioIcon.style.width = "30px"; // Définir la largeur de l'icône
            audioIcon.style.height = "29px"; // Définir la hauteur de l'icône
        } else {
            // Grands écrans
            audioIcon.style.width = "35px"; // Définir la largeur de l'icône
            audioIcon.style.height = "34px"; // Définir la hauteur de l'icône
        }

        // Écouter les événements de redimensionnement de la fenêtre
        window.addEventListener("resize", () => {
            const screenWidth = window.innerWidth;

            if (screenWidth < 640) {
                // Petit écran (mobile)
                audioIcon.style.width = "25px"; // Mettre à jour la largeur de l'icône
                audioIcon.style.height = "24px"; // Mettre à jour la hauteur de l'icône
            } else if (screenWidth < 768) {
                // Écrans moyens
                audioIcon.style.width = "30px"; // Mettre à jour la largeur de l'icône
                audioIcon.style.height = "29px"; // Mettre à jour la hauteur de l'icône
            } else {
                // Grands écrans
                audioIcon.style.width = "35px"; // Mettre à jour la largeur de l'icône
                audioIcon.style.height = "34px"; // Mettre à jour la hauteur de l'icône
            }
        });

        // Ajout de l'icône au bouton lecture/pause
        audioPlayPauseButton.appendChild(audioIcon);

        // Ajout du bouton à la page
        document.body.appendChild(audioPlayPauseButton);

        function toggleAudioPlayPause() {
            if (sound.paused) {
                sound.play(); // Si l'audio est actuellement en pause, le reprendre
                audioIcon.src = "./img/music.png"; // Mettre à jour l'icône en "pause"
            } else {
                sound.pause(); // Si l'audio est actuellement en lecture, le mettre en pause
                audioIcon.src = "./img/mute.png"; // Mettre à jour l'icône en "play"
            }
        }

        exitButton = document.createElement("button");
        exitButton.classList.add("exitButton");

        // Créer l'élément img pour l'icône de mute
        const muteIcon = document.createElement("img");
        muteIcon.src = "./img/quitter_rouge.png"; // Chemin vers l'icône de mute

        if (screenWidth < 640) {
            // Petit écran (mobile)
            muteIcon.style.width = "25px"; // Définir la largeur de l'icône
            muteIcon.style.height = "24px"; // Définir la hauteur de l'icône
        } else if (screenWidth < 768) {
            // Écrans moyens
            muteIcon.style.width = "30px"; // Définir la largeur de l'icône
            muteIcon.style.height = "29px"; // Définir la hauteur de l'icône
        } else {
            // Grands écrans
            muteIcon.style.width = "35px"; // Définir la largeur de l'icône
            muteIcon.style.height = "34px"; // Définir la hauteur de l'icône
        }

        // Écouter les événements de redimensionnement de la fenêtre
        window.addEventListener("resize", () => {
            const screenWidth = window.innerWidth;

            if (screenWidth < 640) {
                // Petit écran (mobile)
                muteIcon.style.width = "25px"; // Mettre à jour la largeur de l'icône
                muteIcon.style.height = "24px"; // Mettre à jour la hauteur de l'icône
            } else if (screenWidth < 768) {
                // Écrans moyens
                muteIcon.style.width = "30px"; // Mettre à jour la largeur de l'icône
                muteIcon.style.height = "29px"; // Mettre à jour la hauteur de l'icône
            } else {
                // Grands écrans
                muteIcon.style.width = "35px"; // Mettre à jour la largeur de l'icône
                muteIcon.style.height = "34px"; // Mettre à jour la hauteur de l'icône
            }
        });

        // Ajouter l'icône de mute au bouton "Quitter"
        exitButton.appendChild(muteIcon);

        document.body.appendChild(exitButton);

        // Ajout d'un gestionnaire d'événements clic au bouton "Quitter"
        exitButton.addEventListener("click", exit360Scene);
    } else {
        // Afficher le bouton s'il existe déjà
        exitButton.style.display = "none";
        audioPlayPauseButton.style.display = "none";
    }
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.style.display = "none";
}

function rand(p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Fonction pour quitter la scène 360 et revenir à la scène principale
function exit360Scene() {
    audioPlayer2.play();
    is360 = false;

    //Cacher le bouton show description
    document.getElementById("show_description").classList = "show_description";

    //sound stop
    sound.pause();
    sound.currentTime = 0;
    // Nettoyer la scène 360
    scene360.children = [];

    camera = cam;

    // Masquer le bouton "Quitter" s'il existe
    if (exitButton) {
        exitButton.style.display = "none";
        audioPlayPauseButton.style.display = "none";
        exitButton.classList.add("moveLeft");
    }

    // Réinitialiser renderScene360 à false pour indiquer que la scène 360 n'est plus rendue
    renderScene360 = false;

    const navbar = document.querySelector(".navbar");
    navbar.style.display = "flex";

    // Afficher le bouton submit-btn
    var submitButton = document.getElementById("submit-btn");
    submitButton.style.display = "flex";

    animate();
    // lighting(darkness);
    //francky
    setupLight();
    for (let i = 0; i < data.length; i++) {
        loadPointOfInterest(data[i].x, data[i].y, data[i].z, data[i]);
    }
    init();
}

let ringMesh;

// Déclarer une variable pour stocker les lanternes avec leurs coordonnées
const lanternes = [];
let lanternLight;
let lant = [];

// Variable pour suivre l'ID du GLB
let currentGLBId = 0;

// Ajouter une deuxième point d'intérêt
//loadPointOfInterest(0, 0, 0);

for (let i = 0; i < data.length; i++) {
    loadPointOfInterest(data[i].x, data[i].y, data[i].z, data[i]);
}

function loadPointOfInterest(x, y, z, data) {
    loader.load("paper_lantern.glb", (poiGltf) => {
        const pointOfInterest = poiGltf.scene;

        pointOfInterest.position.set(x, y, z);
        pointOfInterest.scale.set(0.15, 0.15, 0.15);
        pointOfInterest.position.y -= 0.5;

        // Attribution d'un ID unique à chaque GLB
        pointOfInterest.userData.id = currentGLBId++;
        pointOfInterest.userData.data = data;

        lanternLight = new THREE.PointLight(0xffff88, 1, 0.9, 0.1);
        lanternLight.name = "lanternLight";
        lanternLight.castShadow = true;
        pointOfInterest.add(lanternLight);

        lanternes.push({
            id: lanternes.length,
            x: x,
            y: y,
            z: z,
            object: pointOfInterest, // Stockez la référence à l'objet dans l'array lanternes
        });

        scene.add(pointOfInterest);
        scene.add(ringMesh);
        // Rendre le modèle GLB interactif
        pointOfInterest.userData.onClick = function () {
            // console.log("GLB cliqué ! ID:", pointOfInterest.userData.id);
            donnees = data;
            // Ajoutez ici votre logique supplémentaire lors du clic sur le GLB
        };

        // Ajoute un gestionnaire d'événements de clic au point d'intérêt (GLB)
        pointOfInterest.traverse((child) => {
            if (child.isMesh) {
                child.userData.onClick = pointOfInterest.userData.onClick;
                child.userData.data = pointOfInterest.userData.data;
            }
        });

        lant.push(pointOfInterest);
    });
}

//cercle(0, 0, 0)

function cercle(x, y, z) {
    loader.load("./assets/arendrinatsymirehatra.glb", (poiGltf) => {
        const pointOfInterest = poiGltf.scene;

        pointOfInterest.position.set(x, y, z);
        pointOfInterest.scale.set(0.3, 0.3, 0.3);

        // Attribution d'un ID unique à chaque GLB
        pointOfInterest.userData.id = currentGLBId++;

        const ringGeometry = new THREE.RingGeometry(20.5, 0.6, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide,
        });
        ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

        ringMesh.position.copy(pointOfInterest.position);

        lanternes.push({
            id: lanternes.length,
            x: x,
            y: y,
            z: z,
            object: pointOfInterest, // Stockez la référence à l'objet dans l'array lanternes
        });

        // scene.add(pointOfInterest);
        scene.add(ringMesh);
    });
}
// Ajouter un gestionnaire d'événements pour le clic
// document.addEventListener('click', onClick);

document.addEventListener("click", function (event) {
    onClick(event, donnees);
});

window.addEventListener("mousemove", onMouseMove, false);

// Déclarez une variable pour suivre si la scène 360 doit être rendue ou non
let renderScene360 = false;

// Fonction onClick
function onClick(event, data) {
    if (data != "") {
        console.log(data);
    }
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.onClick !== undefined) {
            object.userData.onClick();
            console.log(intersects);
            // Vérifier si la scène 360 a déjà été créée
            if (!renderScene360) {
                // Exécuter la fonction create360 uniquement si le clic est fait sur un GLB
                create360(donnees);
                // Masquer le navbar après avoir créé la scène 360
                hideNavbarIn360();
                // Supprimer complètement la première scène après avoir créé la deuxième scène
                removeFirstScene();
                // Définir renderScene360 sur true pour indiquer que la scène 360 doit être rendue
                renderScene360 = true;
            }
        }
    } else {
        console.log("Aucun GLB cliqué !");
    }
}

function onMouseMove(event, dat) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // const intersects = raycaster.intersectObjects(scene.children, true);
    // var tris = [];
    // for (let i = 0; i < data.length; i++) {
    //   tris = lanternes[i].object;
    // }

    const intersects = raycaster.intersectObjects(lant, true);
    // console.log(intersects)
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.onClick !== undefined) {
            // object.position.z -= 1;
            //evenement collision
            activePlace(object.userData.data.lieu);
            // console.log(object.userData.data)
        }
    } else {
        //console.log("Aucun contact");
        desactivePlace();
    }
}

function activePlace(text) {
    var ti = document.getElementById("titre_lieu");
    ti.style.opacity = 1;
    ti.textContent = text;
    show_place = true;
}

function desactivePlace() {
    if (show_place === true) {
        var ti = document.getElementById("titre_lieu");
        ti.style.opacity = 0;
        setTimeout(mikatona2, 500);
    }
    show_place = false;
}

function mikatona2() {
    if (show_place === false) {
        var ti = document.getElementById("titre_lieu");
        ti.textContent = "";
    }
}

// Fonction pour masquer le navbar après avoir créé la scène 360
function hideNavbarIn360() {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        navbar.style.display = "none"; // Masquer le navbar
    }
}

// Fonction pour supprimer complètement la première scène
function removeFirstScene() {
    // Supprimer tous les enfants de la première scène
    scene.children = [];

    // Réinitialiser la caméra
    cam = camera;
    camera = new THREE.PerspectiveCamera(
        80,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 20, 0);
}

loadingManager.onProgress = function (url, loaded, total) {
    progressBar.value = (loaded / total) * 100;
};

loadingManager.onLoad = function () {
    progressBarContainer.style.display = "none";
};

function mikatona() {
    header.style.zIndex = -100;
}

startbutton.addEventListener("mousedown", function () {
    const tl = gsap.timeline();

    setTimeout(mikatona, 500);

    document.getElementById("backgroundExplorer").style.width = 0;
    document.getElementById("backgroundExplorer").style.height = 0;

    tl.to(startbutton, {
        autoAlpha: 0,
        y: "-=20",
        duration: 0.5,
    })
        .to(
            title,
            {
                autoAlpha: 0,
                y: "-=20",
                duration: 1,
            },
            0
        )
        .to(
            camera.position,
            {
                y: 2,
                z: 6,
                duration: 2,
            },
            0
        )
        .to(
            camera.rotation,
            {
                z: -0.4,
                y: 44,
                duration: 4,
            },
            0
        );
});

// Exécute une fonction après un délai de 2 secondes (2000 millisecondes)
setTimeout(function () {
    console.log("Minuteurs déclenché");
}, 500);

buttonMap.addEventListener("mousedown", function () {
    isMap = !isMap;

    //camera.position.set(0, 20, 0);
    if (isMap === false) {
        // document.getElementById("backgroundExplorer").style.width = "100%";
        // document.getElementById("backgroundExplorer").style.height = "100%";
        const tl = gsap.timeline();
        tl.to(startbutton, {
            autoAlpha: 0,
            y: "-=20",
            duration: 0.5,
        })
            .to(
                title,
                {
                    autoAlpha: 0,
                    y: "-=20",
                    duration: 1,
                },
                0
            )
            .to(
                camera.position,
                {
                    x: 0,
                    y: 20,
                    z: 0,
                    duration: 2,
                },
                0
            )
            .to(
                camera.rotation,
                {
                    x: 0,
                    z: -0.4,
                    y: 44,
                    duration: 4,
                },
                0
            );
    } else {
        // document.getElementById("backgroundExplorer").style.width = 0;
        // document.getElementById("backgroundExplorer").style.height = 0;
        const tl = gsap.timeline();
        tl.to(startbutton, {
            autoAlpha: 0,
            y: "-=20",
            duration: 0.5,
        })
            .to(
                title,
                {
                    autoAlpha: 0,
                    y: "-=20",
                    duration: 1,
                },
                0
            )
            .to(
                camera.position,
                {
                    y: 2,
                    z: 6,
                    duration: 2,
                },
                0
            )
            .to(
                camera.rotation,
                {
                    z: -0.4,
                    y: 44,
                    duration: 4,
                },
                0
            );
    }
});

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    if (renderScene360) {
        renderer.render(scene360, camera360); // Rend la scène 360
    } else {
        // Ajoutez une console log pour vérifier si la scène principale est rendue
        console.log("Rendu de la scène principale");
        renderer.render(scene, camera); // Rend la scène principale
    }
}

animate();
setupLight();
// lighting(darkness);
init();

//create360();
