import * as THREE from "./build/three.module.js";
//https://unpkg.com/three@latest/build/three.module.js
import { MapControls } from "./controls/MapControls.js";
import { OrbitControls } from "./controls/OrbitControls.js";
import { Text } from "https://unpkg.com/troika-three-text@0.50.2/dist/troika-three-text.esm.js";
import { GLTFLoader } from "./loaders/GLTFLoader.js";


//import gsap from "gsap";


// import locationsData from "./data.json" assert { type: "json" };

import data from "./360.json" with { type: "json" };

// masquer les elements avant de cliquer sur explorer
const explorerBtn = document.getElementById("explorer_bt");
const elementsToToggle = ["navbar", "buttons-container", "helpSection"];

// Masquez d'abord tous les éléments lors du chargement de la page
elementsToToggle.forEach(id => {
  const element = document.getElementById(id);
  element.classList.add("hidden");
});

explorerBtn.addEventListener("click", () => {
  elementsToToggle.forEach(id => {
    const element = document.getElementById(id);
    element.classList.toggle("hidden"); // Bascule la classe hidden
  });
});

//Modal1
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

//Modal2
// Récupérer la modale
var modal2 = document.getElementById("myModal2");

// Récupérer le bouton qui ouvre la modale
var btn2 = document.getElementById("submit-btn2");

// Récupérer l'élément <span> qui permet de fermer la modale
var span2 = document.getElementsByClassName("close2")[0];

// Quand l'utilisateur clique sur le bouton, ouvrir la modale
btn2.onclick = function () {
    modal2.style.display = "block";
};

// Quand l'utilisateur clique sur <span> (x), fermer la modale
span2.onclick = function () {
    modal2.style.display = "none";
};

// Quand l'utilisateur clique n'importe où en dehors de la modale, fermer la modale
window.onclick = function (event) {
    if (event.target == modal2) {
        modal2.style.display = "none";
    }
};

// Instruction souris
// Sélection des éléments
const helpButton = document.querySelector('.c-create-help-button');
const popup = document.querySelector('.instructions-popup');
const closeButton = document.querySelector('.close-instructions');

// Afficher la popup quand on clique sur l'icône
helpButton.addEventListener('click', () => {
  popup.classList.toggle('hidden');
});

// Cacher la popup quand on clique sur "Fermer"
closeButton.addEventListener('click', () => {
  popup.classList.add('hidden');
});
// Instruction souris

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
const jsonList2 = document.getElementById("jsonList2");

// Charger le fichier JSON
fetch("360.json")
    .then((response) => response.json())
    .then((data) => {

        const uniquesNames = [];

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

            item.feo.forEach((person) => {
                if (!uniquesNames.includes(person.name)) {
                    uniquesNames.push(person.name); // Ajoute le nom seulement s'il n'existe pas déjà
                }
            });
        });

        uniquesNames.forEach((nom)=>{
            const listItem2 = document.createElement("li");
            listItem2.classList = "persoLi";
            // listItem2.textContent = nom;

            const nameToFind = nom; // Le nom que vous cherchez
            const ids = data //ids contient la liste des id des lieu qu'apparait une personne
                .filter(item => item.feo.some(fe => fe.name === nameToFind))
                .map(item => item.id);

            const accordionContainer = listItem2;
            const accordionData = [];

            for (let i = 0; i < ids.length; i++) {
                accordionData.push(data[ids[i]-1]);
            }

            
            // Créer le conteneur de l'accordéon
            const accordion = document.createElement('div');
            accordion.className = 'accordion';

            // Créer l'en-tête de l'accordéon
            const header = document.createElement('div');
            header.className = 'accordion-header';
            header.textContent = nom;
            header.onclick = () => {
                const content = header.nextElementSibling;
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            };

            // Créer le contenu de l'accordéon avec plusieurs divs
            const content = document.createElement('div');
            content.className = 'accordion-content';

            accordionData.forEach(acc => {
                const div = document.createElement('div');
                div.className = 'accordion-lieu'
                div.textContent = acc.lieu;
                content.appendChild(div);

                div.addEventListener("click", function () {

                    // console.log(accordionData)
                    create360(acc);
    
                    hideNavbarIn360();
    
                    removeFirstScene();
    
                    renderScene360 = true;
    
                    modal2.style.display = "none";
                });
            });

            // Ajouter l'en-tête et le contenu à l'accordéon
            accordion.appendChild(header);
            accordion.appendChild(content);

            // Ajouter l'accordéon au conteneur
            accordionContainer.appendChild(accordion);
            

            
            

            jsonList2.appendChild(accordionContainer);
        });


        // Récuperation de parametre de l'IRL
        let url = window.location.href;
        let params = url.split("?")[1];
        if (params == undefined) {
        }
        let param = params.split("=")[0];
        let value = decodeURI(params.split("=")[1]);

        if (param == "lieu") {
            // affichage du lieu choisi
            data.forEach((item) => {
                if (item.lieu == value) {
                    create360(item);
                    // Masquer le navbar après avoir créé la scène 360
                    hideNavbarIn360();
                    // Supprimer complètement la première scène après avoir créé la deuxième scène
                    removeFirstScene();
                    // Définir renderScene360 sur true pour indiquer que la scène 360 doit être rendue
                    renderScene360 = true;
                }
            });
        }
    })
    .catch((error) => {
        console.error("Error loading JSON:", error);
    });

// Initialisation du renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Position initiale de la caméra
camera.position.set(0, 20, 0);

// Initialisation des contrôles de la carte
var controls = new MapControls(camera, renderer.domElement);
// controls.mouseButtons.RIGHT = null;
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2.2;
controls.enableZoom = true;
controls.minZoom = 2;
controls.maxZoom = 8;

// Fonction pour mettre à jour la taille du renderer et de la caméra
function onWindowResize() {
    // Met à jour la taille du renderer
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Met à jour le rapport d'aspect de la caméra
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Nécessaire pour que la caméra prenne en compte le nouveau rapport d'aspect
}

// Écouteur d'événements pour le redimensionnement de la fenêtre
window.addEventListener("resize", onWindowResize, false);

// Limites pour le contrôle de la caméra
controls.minDistance = 5;
controls.maxDistance = 10;

// controls.maxAzimuthAngle = THREE.MathUtils.degToRad(45);
// controls.minAzimuthAngle = THREE.MathUtils.degToRad(45);
// controls.maxPolarAngle = THREE.MathUtils.degToRad(45);
// controls.minPolarAngle = THREE.MathUtils.degToRad(45);

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

controls360.mouseButtons.RIGHT = null;
controls360.enableDamping = true;
controls360.dampingFactor = 0.05;
controls360.enableZoom = false;
controls360.screenSpacePanning = false;

controls360.enabled = false;



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
            // console.log(item);
        });
        scene.add(model);
    });
}

function init() {
    // build map
    // TODO : build by chunk
    loadModel("public/Tany.glb");

    // buildings
    loader1.load("public/Trano.glb", async function (gltf) {
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
    loader1.load("/Lalana.glb", async function (gltf) {
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

    loader1.load("public/Lanitra.glb", async function (gltf) {
        roads = gltf.scene;
        roads.scale.set(
            0.004 * roads.scale.x,
            0.004 * roads.scale.y,
            0.004 * roads.scale.z
        );
        roads.position.y -= 1.4;
        // wait until the model can be added to the scene without blocking due to shader compilation
        await renderer.compileAsync(roads, camera, scene);

        roads.name = "Lanitra";
        scene.add(roads);
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
    document.getElementById("titre_lieu").style.display = "none";
    controls360.enabled = true;
    controls.enabled = false;

    backGroundIsPlaying = true;

    audioPlayer2.pause();
    sound360 = true;

    // Cacher le bouton d'aide
    helpButton.style.display = 'none';

    if (is360) {
        // Création de la caméra
        camera360.position.set(0, 0, 0);
        camera360.lookAt(0, 0, 0);
    }

    // Réinitialisation de la caméra 360
    camera360.position.set(0, 0, 0);
    camera360.lookAt(0, 0, -1); // Oriente vers l'axe Z négatif

    // Réinitialiser les contrôles pour prendre en compte la nouvelle position de la caméra
    controls360.target.set(0, 0, -1); // Définit la cible de focus des contrôles
    controls360.update(); // Met à jour les contrôles pour appliquer les changements

    is360 = true;
    // Création de la géométrie de la sphère
    const geometry = new THREE.SphereGeometry(10, 30, 30);

    // Chargement de la texture
    const texture = new THREE.TextureLoader().load(
        "./img/360/" + data.photo360
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

    // Chargement des données de description
    document.getElementById("show_description").classList = "show_description is_displayed2";
    document.getElementById("nom-lieu").textContent = data.lieu;
    document.getElementById("nom").textContent = data.lieu;
    document.getElementById("desc1").textContent = data.descriptions[0];
    document.getElementById("description").textContent = data.descriptions[1];
    document.getElementById("image_principale").src = "img/galery/" + data.photo;

    // Chargement des éléments audio
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
const carouselList = document.getElementById("carousel-list");
const images = data.galery;
const delayIntervals = [5000, 6000, 5500, 7000]; // Intervalle individuel pour chaque image (en ms)

if (carouselList) {
    let carouselHTML = "";
    images.forEach((imageUrl, index) => {
        const activeClass = index === 0 ? "active" : "";
        carouselHTML += `
            <li class="slide ${activeClass}">
                <img src="img/galery/${imageUrl}" class="image-cliquable" alt="image carousel">
            </li>
        `;
    });
    carouselList.innerHTML = carouselHTML;
} else {
    console.error("L'élément carousel-list est introuvable.");
}

// Sélection des boutons précédent et suivant
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

let currentIndex = 0;
let intervalId;

function changeSlide(step) {
    const slides = document.querySelectorAll(".slide");
    slides[currentIndex].classList.remove("active"); // Retire la classe active de l'élément actuel sans transition

    currentIndex = (currentIndex + step + slides.length) % slides.length;
    slides[currentIndex].classList.add("active"); // Ajoute la classe active au nouvel élément sans transition

    resetAutoScroll();
}

function autoScroll() {
    changeSlide(1);
    intervalId = setTimeout(autoScroll, delayIntervals[currentIndex % delayIntervals.length]);
}

function resetAutoScroll() {
    clearTimeout(intervalId);
    intervalId = setTimeout(autoScroll, delayIntervals[currentIndex % delayIntervals.length]);
}

// Lancement du défilement automatique
autoScroll();

prevButton.addEventListener("click", () => changeSlide(-1));
nextButton.addEventListener("click", () => changeSlide(1));



    // Gestion du son
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

    function changeSlide(direction) {
        const slides = document.querySelectorAll(".slide");
        let currentSlide = document.querySelector(".slide.active");

        if (!currentSlide) {
            currentSlide = slides[0];
            currentSlide.classList.add("active");
        }

        let newIndex = Array.from(slides).indexOf(currentSlide) + direction;
        newIndex = (newIndex + slides.length) % slides.length;

        slides.forEach((slide) => slide.classList.remove("active"));
        slides[newIndex].classList.add("active");
    }

    sound = new Audio("./music/" + data.audio);
    sound.loop = true;
    sound.volume = 0.30;
    sound.play();

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene360.add(sphere);

    const myText = new Text();
    scene360.add(myText);
    myText.text = data.lieu;
    myText.anchorX = "center";
    myText.font = "./fonts/Montserrat-Regular.otf";
    myText.color = 0x9ec3e9;

    if (window.innerWidth <= 768) {
        myText.fontSize = 0.3; 
        myText.position.z = -2; 
    } else if (window.innerWidth <= 1024) {
        myText.fontSize = 0.3; 
        myText.position.z = -2; 
    } else {
        myText.fontSize = 0.6; 
        myText.position.z = -4; 
    }

    myText.sync();

    if (is360 === true) {
        audioPlayPauseButton = document.createElement("button");
        audioPlayPauseButton.classList.add("button");
        audioPlayPauseButton.style.display = "block";
        audioPlayPauseButton.addEventListener("click", toggleAudioPlayPause); 

        const audioIcon = document.createElement("img");
        audioIcon.src = "./img/music.png"; 

        const screenWidth = window.innerWidth;

        if (screenWidth < 640) {
            audioIcon.style.width = "25px"; 
            audioIcon.style.height = "24px"; 
        } else if (screenWidth < 768) {
            audioIcon.style.width = "30px"; 
            audioIcon.style.height = "29px"; 
        } else {
            audioIcon.style.width = "35px"; 
            audioIcon.style.height = "34px"; 
        }

        window.addEventListener("resize", () => {
            const screenWidth = window.innerWidth;

            if (screenWidth < 640) {
                audioIcon.style.width = "25px"; 
                audioIcon.style.height = "24px"; 
            } else if (screenWidth < 768) {
                audioIcon.style.width = "30px"; 
                audioIcon.style.height = "29px"; 
            } else {
                audioIcon.style.width = "35px"; 
                audioIcon.style.height = "34px"; 
            }
        });

        audioPlayPauseButton.appendChild(audioIcon);
        document.body.appendChild(audioPlayPauseButton);

        function toggleAudioPlayPause() {
            if (sound.paused) {
                sound.play(); 
                audioIcon.src = "./img/music.png"; 
            } else {
                sound.pause(); 
                audioIcon.src = "./img/mute.png"; 
            }
        }

        exitButton = document.createElement("button");
        exitButton.classList.add("exitButton");
        exitButton.id="bt_exit360";

        const muteIcon = document.createElement("img");
        muteIcon.src = "./img/quitter_rouge.png"; 

        if (screenWidth < 640) {
            muteIcon.style.width = "25px"; 
            muteIcon.style.height = "24px"; 
        } else if (screenWidth < 768) {
            muteIcon.style.width = "30px"; 
            muteIcon.style.height = "29px"; 
        } else {
            muteIcon.style.width = "35px"; 
            muteIcon.style.height = "34px"; 
        }

        window.addEventListener("resize", () => {
            const screenWidth = window.innerWidth;

            if (screenWidth < 640) {
                muteIcon.style.width = "25px"; 
                muteIcon.style.height = "24px"; 
            } else if (screenWidth < 768) {
                muteIcon.style.width = "30px"; 
                muteIcon.style.height = "29px"; 
            } else {
                muteIcon.style.width = "35px"; 
                muteIcon.style.height = "34px"; 
            }
        });

        exitButton.appendChild(muteIcon);
        document.body.appendChild(exitButton);

        // Événement de clic sur le exitButton
        exitButton.addEventListener("click", () => {

            exit360Scene();

            // Afficher le bouton d'aide lorsque l'utilisateur quitte la scène
            helpButton.style.display = 'block';
        });
    } else {
        exitButton.style.display = "none";
        audioPlayPauseButton.style.display = "none";
    }
    
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.style.display = "none";

    const submitBtn2 = document.getElementById("submit-btn2");
    submitBtn2.style.display = "none";
}





// Fonction pour quitter la scène 360 et revenir à la scène principale
function exit360Scene() {
    document.getElementById("titre_lieu").style.display = "block";
    controls360.enabled = false;
    controls.enabled = true;

    audioPlayer2.play();
    is360 = false;

    //Cacher le bouton show description
    document.getElementById("show_description").classList = "show_description";

    //sound stop
    sound.pause();
    sound.currentTime = 0;

    audioElement1.pause();
    audioElement2.pause();

    const soundImage1 = document.querySelector(".play1");
    const soundImage2 = document.querySelector(".play2");
    soundImage1.src = "img/play.png";
    soundImage2.src = "img/play.png";
    isPlaying = false;

    // Nettoyer la scène 360
    scene360.children = [];

    camera = cam;

    // Masquer le bouton "Quitter" s'il existe
    if (exitButton) {
        exitButton.style.display = "none";
        audioPlayPauseButton.style.display = "none";
        exitButton.classList.add("moveLeft");
        // Afficher le bouton d'aide lorsque l'utilisateur quitte la scène
        helpButton.style.display = 'block';
    }

    // Réinitialiser renderScene360 à false pour indiquer que la scène 360 n'est plus rendue
    renderScene360 = false;

    const navbar = document.querySelector(".navbar");
    navbar.style.display = "flex";

    // Afficher le bouton submit-btn
    var submitButton = document.getElementById("submit-btn");
    submitButton.style.display = "flex";

    var submitButton2 = document.getElementById("submit-btn2");
    submitButton2.style.display = "flex";

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

function createTextSprite(message, parameters) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Configurer le canvas
    const fontSize = parameters.fontSize || 32;
    const scaleFactor = 2; // Facteur d'échelle pour le fond
    const baseWidth = 512; // Augmentez la largeur de base
    const baseHeight = 128; // Hauteur de base
    canvas.width = baseWidth * scaleFactor; // Largeur doublée
    canvas.height = baseHeight * scaleFactor; // Hauteur doublée

    // Dessiner le rectangle de fond
    context.fillStyle = parameters.backgroundColor || "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner le texte
    context.fillStyle = parameters.textColor || "white";
    context.font = `${fontSize * scaleFactor}px Arial`; // Ajuster la taille de la police
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Positionner le texte en tenant compte des nouvelles dimensions
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    // Créer la texture à partir du canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // Créer le sprite
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Ajuster la taille du sprite
    sprite.scale.set(2, 0.5, 1); // Ajustez la taille selon vos besoins
    return sprite;
}



function loadPointOfInterest(x, y, z, data) {
    loader.load("public/paper_lantern.glb", (poiGltf) => {
        const pointOfInterest = poiGltf.scene;

        pointOfInterest.position.set(x, y, z);
        pointOfInterest.scale.set(0.16, 0.16, 0.16);
        pointOfInterest.position.y -= 0.5;

        // Assign unique ID and data
        pointOfInterest.userData.id = currentGLBId++;
        pointOfInterest.userData.data = data;

        // Add light to the model
        const lanternLight = new THREE.PointLight(0xffff88, 1, 0.9, 0.1);
        lanternLight.name = "lanternLight";
        lanternLight.castShadow = true;
        pointOfInterest.add(lanternLight);

        // Create a sprite with text
        const sprite = createTextSprite(data.lieu, {
            fontSize: 30,
            backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent black
            textColor: 'white',
        });

        // Position the sprite above the model
        sprite.position.set(x, y , z); // Adjust y offset as needed
        scene.add(sprite);

        // Add the 3D model to the scene
        scene.add(pointOfInterest);
        scene.add(ringMesh);

        // Optional: make the model clickable
        pointOfInterest.userData.onClick = function () {
            donnees = data;
        };
        pointOfInterest.traverse((child) => {
            if (child.isMesh) {
                child.userData.onClick = pointOfInterest.userData.onClick;
                child.userData.data = pointOfInterest.userData.data;
            }
        });

        lant.push(pointOfInterest);

        // Add to lanternes array
        lanternes.push({
            id: lanternes.length,
            x: x,
            y: y,
            z: z,
            object: pointOfInterest,
        });
    });
}


for (let i = 0; i < data.length; i++) {
    loadPointOfInterest(data[i].x, data[i].y, data[i].z, data[i]);
}

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
                x: 0,
                y: 3,
                z: 2,
                duration: 2.5,
            },
            0
        )
        .to(
            camera.rotation,
            {
                z: -0.4,
                y: 44,
                duration: 0.5,
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
    // alert("lasa")

    // Désactiver les contrôles pendant l'animation
    controls.enabled = false;

    if (isMap === false) {
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
                    y: Math.max(
                        controls.minDistance,
                        Math.min(20, controls.maxDistance)
                    ), // Limiter dans l'intervalle des distances
                    z: Math.max(
                        controls.minDistance,
                        Math.min(0.1, controls.maxDistance)
                    ),
                    duration: 2,
                    onUpdate: function () {
                        controls.update(); // Mettre à jour les contrôles pendant l'animation
                    },
                },
                0
            )
            .to(
                camera.rotation,
                {
                    z: -0.4,
                    y: 44,
                    duration: 4,
                    onComplete: function () {
                        controls.enabled = true; // Réactiver les contrôles après l'animation
                    },
                },
                0
            );
    } else {
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
                    y: Math.max(
                        controls.minDistance,
                        Math.min(5, controls.maxDistance)
                    ), // Limiter dans l'intervalle des distances
                    z: Math.max(
                        controls.minDistance,
                        Math.min(0.1, controls.maxDistance)
                    ),
                    duration: 2,
                    onUpdate: function () {
                        controls.update(); // Mettre à jour les contrôles pendant l'animation
                    },
                },
                0
            )
            .to(
                camera.rotation,
                {
                    z: -0.4,
                    y: 44,
                    duration: 4,
                    onComplete: function () {
                        controls.enabled = true; // Réactiver les contrôles après l'animation
                    },
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
