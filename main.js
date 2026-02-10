import * as THREE from "three";
import { MapControls } from "./controls/MapControls.js";
import { OrbitControls } from "./controls/OrbitControls.js";
import { Text } from "troika-three-text";
import { GLTFLoader } from "./loaders/GLTFLoader.js";

//import gsap from "gsap";

// import locationsData from "./data.json" assert { type: "json" };

import data from "./360.json" with { type: "json" };

//Modal1
// Récupérer la modale
var modal = document.getElementById("myModal");
var isModal = false;

// Récupérer le bouton qui ouvre la modale
var btn = document.getElementById("submit-btn");

// Récupérer l'élément <span> qui permet de fermer la modale
var span = document.getElementsByClassName("close")[0];

// Quand l'utilisateur clique sur le bouton, ouvrir la modale
if (btn) {
    btn.onclick = function () {
        if (modal) modal.style.display = "block";
        isModal = true;
    };
}

// Quand l'utilisateur clique sur <span> (x), fermer la modale
if (span) {
    span.onclick = function () {
        if (modal) modal.style.display = "none";
        isModal = false;
    };
}

//Modal2
// Récupérer la modale
var modal2 = document.getElementById("myModal2");

// Récupérer le bouton qui ouvre la modale
var btn2 = document.getElementById("submit-btn2");

// Récupérer l'élément <span> qui permet de fermer la modale
var span2 = document.getElementsByClassName("close2")[0];

// Quand l'utilisateur clique sur le bouton, ouvrir la modale
if (btn2) {
    btn2.onclick = function () {
        if (modal2) modal2.style.display = "block";
        isModal = true;
    };
}

// Quand l'utilisateur clique sur <span> (x), fermer la modale
if (span2) {
    span2.onclick = function () {
        if (modal2) modal2.style.display = "none";
        isModal = false;
    };
}

// Quand l'utilisateur clique n'importe où en dehors des modales, fermer la modale
window.addEventListener("click", function (event) {
    if (modal && event.target == modal) {
        modal.style.display = "none";
        isModal = false;
    }
    if (modal2 && event.target == modal2) {
        modal2.style.display = "none";
        isModal = false;
    }
});

// Instruction souris
// Sélection des éléments
const helpButton = document.querySelector(".c-create-help-button");
const popup = document.querySelector(".instructions-popup");
const closeButton = document.querySelector(".close-instructions");

// Afficher la popup quand on clique sur l'icône
if (helpButton && popup) {
    helpButton.addEventListener("click", () => {
        popup.classList.toggle("hidden");
    });
}

// Cacher la popup quand on clique sur "Fermer"
if (closeButton && popup) {
    closeButton.addEventListener("click", () => {
        popup.classList.add("hidden");
    });
}

// Cacher la popup quand on clique en dehors
document.addEventListener("click", (event) => {
    if (!popup || !helpButton) return;
    // Vérifie si le clic est en dehors de la popup et du bouton
    if (!popup.contains(event.target) && !helpButton.contains(event.target)) {
        popup.classList.add("hidden");
    }
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
    1000000,
);

const jsonList = document.getElementById("jsonList");
const jsonList2 = document.getElementById("jsonList2");

// ✅ Fallback loader (sans changer tes liens)
function safeLoadGLB(loader, file, onLoad, onProgress) {
    const tried = new Set();

    function tryLoad(path) {
        if (tried.has(path)) return;
        tried.add(path);

        loader.load(path, onLoad, onProgress, function (err) {
            // 1) "/xxx.glb" -> "/public/xxx.glb"
            if (path.startsWith("/") && !path.startsWith("/public/")) {
                return tryLoad("/public" + path);
            }
            // 2) "public/xxx.glb" -> "/xxx.glb"
            if (path.startsWith("public/")) {
                return tryLoad("/" + path.replace(/^public\//, ""));
            }
            // 3) "/public/xxx.glb" -> "/xxx.glb"
            if (path.startsWith("/public/")) {
                return tryLoad(path.replace(/^\/public\//, "/"));
            }

            console.error(
                "GLB load failed for:",
                file,
                "Tried:",
                [...tried],
                err,
            );
        });
    }

    tryLoad(file);
}

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
                hideNavbarIn360();
                removeFirstScene();
                renderScene360 = true;

                if (modal) modal.style.display = "none";
            });
            if (jsonList) jsonList.appendChild(listItem);

            item.feo.forEach((person) => {
                if (!uniquesNames.includes(person.name)) {
                    uniquesNames.push(person.name);
                }
            });
        });

        uniquesNames.forEach((nom) => {
            const listItem2 = document.createElement("li");
            listItem2.classList = "persoLi";

            const nameToFind = nom;
            const ids = data
                .filter((item) => item.feo.some((fe) => fe.name === nameToFind))
                .map((item) => item.id);

            const accordionContainer = listItem2;
            const accordionData = [];

            for (let i = 0; i < ids.length; i++) {
                accordionData.push(data[ids[i] - 1]);
            }

            const accordion = document.createElement("div");
            accordion.className = "accordion";

            const header = document.createElement("div");
            header.className = "accordion-header";
            header.style.display = "flex";
            header.style.justifyContent = "space-between";
            header.style.alignItems = "center";
            header.textContent = nom;

            const icon = document.createElement("span");
            icon.textContent = " + ";
            header.appendChild(icon);

            header.onclick = () => {
                const content = header.nextElementSibling;
                const isVisible = content.style.display === "block";
                content.style.display = isVisible ? "none" : "block";
                icon.textContent = isVisible ? " + " : " - ";
            };

            const content = document.createElement("div");
            content.className = "accordion-content";

            accordionData.forEach((acc) => {
                const div = document.createElement("div");
                div.className = "accordion-lieu";
                div.textContent = acc.lieu;
                content.appendChild(div);

                div.addEventListener("click", function () {
                    create360(acc);
                    hideNavbarIn360();
                    removeFirstScene();
                    renderScene360 = true;

                    if (modal2) modal2.style.display = "none";
                });
            });

            accordion.appendChild(header);
            accordion.appendChild(content);
            accordionContainer.appendChild(accordion);

            if (jsonList2) jsonList2.appendChild(accordionContainer);
        });

        let url = window.location.href;
        let params = url.split("?")[1];

        if (params) {
            let param = params.split("=")[0];
            let value = decodeURI(params.split("=")[1]);

            if (param === "lieu") {
                data.forEach((item) => {
                    if (item.lieu === value) {
                        create360(item);
                        hideNavbarIn360();
                        removeFirstScene();
                        renderScene360 = true;
                    }
                });
            }
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
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2.2;
controls.enableZoom = true;
controls.minZoom = 2;
controls.maxZoom = 8;

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener("resize", onWindowResize, false);

controls.minDistance = 5;
controls.maxDistance = 8;

const minPan = new THREE.Vector3(-7, -7, -6);
const maxPan = new THREE.Vector3(4, 7, 7);

controls.addEventListener("change", () => {
    const offset = controls.target.clone().sub(camera.position);
    const newPan = controls.target.clone();

    newPan.x = Math.max(minPan.x, Math.min(maxPan.x, newPan.x));
    newPan.y = Math.max(minPan.y, Math.min(maxPan.y, newPan.y));
    newPan.z = Math.max(minPan.z, Math.min(maxPan.z, newPan.z));

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
    1000,
);
camera360.position.z = 3;

var controls360 = new OrbitControls(camera360, renderer.domElement);
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
    safeLoadGLB(loader1, file, async function (gltf) {
        const model = gltf.scene;
        model.scale.set(
            0.004 * model.scale.x,
            0.004 * model.scale.y,
            0.004 * model.scale.z,
        );
        model.position.y -= 6;
        model.rotation.set(0, Math.PI / -5, 0);

        await renderer.compileAsync(model, camera, scene);
        if (overideMaterial != null) {
            model.traverse((object) => {
                object.material = overideMaterial;
            });
        }
        scene.add(model);
    });
}

function init() {
    loadModel("public/Tany.glb");

    // ✅ buildings (safeLoadGLB)
    safeLoadGLB(loader1, "public/Trano.glb", async function (gltf) {
        buildings = gltf.scene;
        buildings.scale.set(
            0.004 * buildings.scale.x,
            0.004 * buildings.scale.y,
            0.004 * buildings.scale.z,
        );
        buildings.position.y -= 6;
        buildings.rotation.set(0, Math.PI / -5, 0);

        await renderer.compileAsync(buildings, camera, scene);

        buildings.name = "buildings";
        scene.add(buildings);
    });

    // ✅ roads (safeLoadGLB)
    safeLoadGLB(loader1, "/Lalana.glb", async function (gltf) {
        roads = gltf.scene;
        roads.scale.set(
            0.004 * roads.scale.x,
            0.004 * roads.scale.y,
            0.004 * roads.scale.z,
        );
        roads.position.y -= 6;
        roads.rotation.set(0, Math.PI / -5, 0);

        await renderer.compileAsync(roads, camera, scene);

        roads.name = "roads";
        scene.add(roads);
    });

    // ✅ Lanitra (safeLoadGLB)
    safeLoadGLB(loader1, "public/Lanitra.glb", async function (gltf) {
        roads = gltf.scene;
        roads.scale.set(
            0.004 * roads.scale.x,
            0.004 * roads.scale.y,
            0.004 * roads.scale.z,
        );
        roads.position.y -= 1.4;
        roads.rotation.set(0, Math.PI / -5, 0);

        await renderer.compileAsync(roads, camera, scene);

        roads.name = "Lanitra";
        scene.add(roads);
    });

    setupLight();

    if (typeof initPostprocessing === "function") initPostprocessing();
    loadPointOfInterest();

    if (typeof container !== "undefined" && container) {
        if (renderer.domElement.parentNode !== container) {
            container.appendChild(renderer.domElement);
        }
        container.style.touchAction = "none";
    }

    if (typeof addMouseEvents === "function") addMouseEvents();

    window.addEventListener("resize", onWindowResize);
}

// Chargez le fichier GLTF
const loader = new GLTFLoader(loadingManager);

// Appel de la fonction pour charger le point d'intérêt (ne fait rien si pas de data)
loadPointOfInterest();

let exitButton;
let audioPlayPauseButton;

function create360(data) {
    document.getElementById("titre_lieu").style.display = "none";
    controls360.enabled = true;
    controls.enabled = false;

    // ✅ protections (sinon crash et pas d’entrée en 360)
    if (typeof backGroundIsPlaying !== "undefined") backGroundIsPlaying = true;

    if (
        typeof audioPlayer2 !== "undefined" &&
        audioPlayer2 &&
        audioPlayer2.pause
    ) {
        audioPlayer2.pause();
    }

    if (typeof sound360 !== "undefined") sound360 = true;

    if (helpButton) helpButton.style.display = "none";

    if (is360) {
        camera360.position.set(-6, 0, -1);
        camera360.lookAt(0, 0, 0);
    }

    camera360.position.set(-6, 0, -1);
    camera360.lookAt(0, 0, -1);
    controls360.target.set(0, 0, -1);
    controls360.update();

    is360 = true;

    const geometry = new THREE.SphereGeometry(25, 70, 70);

    const texture = new THREE.TextureLoader().load(
        "./img/360/" + data.photo360,
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;

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

    const carouselList = document.getElementById("carousel-list");
    const images = data.galery;
    const delayIntervals = [4000, 5000, 4500, 6000];

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

    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");

    let currentIndex = 0;
    let intervalId;

    function changeSlide(step) {
        const slides = document.querySelectorAll(".slide");
        if (!slides || slides.length === 0) return;

        slides[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + step + slides.length) % slides.length;
        slides[currentIndex].classList.add("active");

        resetAutoScroll();
    }

    function autoScroll() {
        changeSlide(1);
        intervalId = setTimeout(
            autoScroll,
            delayIntervals[currentIndex % delayIntervals.length],
        );
    }

    function resetAutoScroll() {
        clearTimeout(intervalId);
        intervalId = setTimeout(
            autoScroll,
            delayIntervals[currentIndex % delayIntervals.length],
        );
    }

    autoScroll();

    if (prevButton) prevButton.addEventListener("click", () => changeSlide(-1));
    if (nextButton) nextButton.addEventListener("click", () => changeSlide(1));

    var sound360 = true;
    const soundBtn = document.getElementById("sound");
    if (soundBtn) {
        soundBtn.addEventListener("click", () => {
            if (typeof sound === "undefined" || !sound) return;

            if (sound360 === true) {
                sound.pause();
                sound360 = false;
            } else {
                sound.play();
                sound360 = true;
            }
        });
    }

    sound = new Audio("./music/" + data.audio);
    sound.loop = true;
    sound.volume = 0.3;
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
    myText.color = 0xffffff;

    myText.isText = true;

    scene360.traverse((object) => {
        if (!object.isText && object.isMesh) {
            object.customDepthMaterial = new THREE.MeshDepthMaterial();
        }
    });

    myText.position.set(10, -5, 2.5);
    myText.lookAt(camera.position);

    if (window.innerWidth <= 768) {
        myText.fontSize = 0.7;
        myText.position.z = 0;
    } else if (window.innerWidth <= 1024) {
        myText.fontSize = 0.7;
        myText.position.z = 0;
    } else {
        myText.fontSize = 1.2;
        myText.position.z = -1;
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
        exitButton.id = "bt_exit360";

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

        exitButton.addEventListener("click", () => {
            exit360Scene();
            if (helpButton) helpButton.style.display = "block";
        });
    } else {
        if (exitButton) exitButton.style.display = "none";
        if (audioPlayPauseButton) audioPlayPauseButton.style.display = "none";
    }

    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) submitBtn.style.display = "none";

    const submitBtn2 = document.getElementById("submit-btn2");
    if (submitBtn2) submitBtn2.style.display = "none";
}

function exit360Scene() {
    document.getElementById("titre_lieu").style.display = "block";
    controls360.enabled = false;
    controls.enabled = true;

    if (
        typeof audioPlayer2 !== "undefined" &&
        audioPlayer2 &&
        audioPlayer2.play
    ) {
        audioPlayer2.play();
    }
    is360 = false;

    document.getElementById("show_description").classList = "show_description";

    if (typeof sound !== "undefined" && sound) {
        sound.pause();
        sound.currentTime = 0;
    }

    if (audioElement1) audioElement1.pause();
    if (audioElement2) audioElement2.pause();

    const soundImage1 = document.querySelector(".play1");
    const soundImage2 = document.querySelector(".play2");
    if (soundImage1) soundImage1.src = "img/play.png";
    if (soundImage2) soundImage2.src = "img/play.png";
    if (typeof isPlaying !== "undefined") isPlaying = false;

    while (scene360.children.length > 0) {
        scene360.remove(scene360.children[0]);
    }

    camera = cam;

    if (exitButton) {
        exitButton.style.display = "none";
        if (audioPlayPauseButton) audioPlayPauseButton.style.display = "none";
        exitButton.classList.add("moveLeft");
        if (helpButton) helpButton.style.display = "block";
    }

    renderScene360 = false;

    const navbar = document.querySelector(".navbar");
    if (navbar) navbar.style.display = "flex";

    var submitButton = document.getElementById("submit-btn");
    if (submitButton) submitButton.style.display = "flex";

    var submitButton2 = document.getElementById("submit-btn2");
    if (submitButton2) submitButton2.style.display = "flex";

    animate();

    setupLight();
    for (let i = 0; i < data.length; i++) {
        loadPointOfInterest(data[i].x, data[i].y, data[i].z, data[i]);
    }
    init();
}

let ringMesh;

const lanternes = [];
let lanternLight;
let lant = [];
let currentGLBId = 0;

function createTextSprite(message, parameters) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    const fontSize = parameters.fontSize || 32;
    const scaleFactor = 2;
    const baseWidth = 512;
    const baseHeight = 128;
    canvas.width = baseWidth * scaleFactor;
    canvas.height = baseHeight * scaleFactor;

    context.fillStyle = parameters.backgroundColor || "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = parameters.textColor || "white";
    context.font = `${fontSize * scaleFactor}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(2, 0.5, 1);
    return sprite;
}

function loadPointOfInterest(x, y, z, data) {
    if (!data) return;

    safeLoadGLB(loader, "public/paper_lantern.glb", (poiGltf) => {
        const pointOfInterest = poiGltf.scene;

        pointOfInterest.position.set(x, y, z);
        pointOfInterest.scale.set(0.2, 0.2, 0.2);
        pointOfInterest.position.y -= 0.5;

        pointOfInterest.userData.id = currentGLBId++;
        pointOfInterest.userData.data = data;

        const lanternLight = new THREE.PointLight(0xffff88, 1, 0.9, 0.1);
        lanternLight.name = "lanternLight";
        lanternLight.castShadow = true;

        const sprite = createTextSprite(data.lieu, {
            fontSize: 30,
            backgroundColor: "rgba(0, 0, 0, 0)",
            textColor: "white",
        });

        sprite.position.set(x, y, z);
        sprite.userData.ignoreRaycast = true;
        scene.add(sprite);

        scene.add(pointOfInterest);

        if (ringMesh) {
            scene.add(ringMesh);
        }

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

let renderScene360 = false;

function onClick(event, data) {
    if (data != "") {
        console.log(data);
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const objectsToIntersect = scene.children.filter(
        (obj) => obj.type !== "Sprite",
    );
    const intersects = raycaster.intersectObjects(objectsToIntersect, true);

    if (intersects.length > 0 && isModal === false) {
        const object = intersects[0].object;
        if (object.userData.onClick !== undefined) {
            object.userData.onClick();

            if (!renderScene360) {
                create360(donnees);
                hideNavbarIn360();
                removeFirstScene();
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

    const intersects = raycaster.intersectObjects(lant, true);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.onClick !== undefined) {
            activePlace(object.userData.data.lieu);
        }
    } else {
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

function hideNavbarIn360() {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
        navbar.style.display = "none";
    }
}

function removeFirstScene() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    cam = camera;
    camera = new THREE.PerspectiveCamera(
        80,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(0, 20, 0);
}

loadingManager.onProgress = function (url, loaded, total) {
    if (progressBar) progressBar.value = (loaded / total) * 100;
};

loadingManager.onLoad = function () {
    if (progressBarContainer) progressBarContainer.style.display = "none";
};

function mikatona() {
    if (header) header.style.zIndex = -100;
}

if (startbutton) {
    startbutton.addEventListener("mousedown", function () {
        if (typeof gsap === "undefined") return;

        const tl = gsap.timeline();

        setTimeout(mikatona, 500);

        const navbarEl = document.getElementById("navbar");
        const buttonsContainer = document.getElementById("buttons-container");
        const helpSection = document.getElementById("helpSection");
        const bgExplorer = document.getElementById("backgroundExplorer");

        if (navbarEl) navbarEl.style.marginTop = 0;
        if (buttonsContainer) buttonsContainer.style.opacity = 1;
        if (helpSection) helpSection.style.opacity = 1;

        if (bgExplorer) {
            bgExplorer.style.width = 0;
            bgExplorer.style.height = 0;
        }

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
                0,
            )
            .to(
                camera.position,
                {
                    x: 0,
                    y: 3,
                    z: 2,
                    duration: 2.5,
                },
                0,
            )
            .to(
                camera.rotation,
                {
                    z: -0.4,
                    y: 44,
                    duration: 0.5,
                },
                0,
            );
    });
}

setTimeout(function () {
    console.log("Minuteurs déclenché");
}, 500);

if (buttonMap) {
    buttonMap.addEventListener("mousedown", function () {
        isMap = !isMap;
        controls.enabled = false;

        if (typeof gsap === "undefined") {
            controls.enabled = true;
            return;
        }

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
                    0,
                )
                .to(
                    camera.position,
                    {
                        y: Math.max(
                            controls.minDistance,
                            Math.min(20, controls.maxDistance),
                        ),
                        z: Math.max(
                            controls.minDistance,
                            Math.min(0.1, controls.maxDistance),
                        ),
                        duration: 2,
                        onUpdate: function () {
                            controls.update();
                        },
                    },
                    0,
                )
                .to(
                    camera.rotation,
                    {
                        z: -0.4,
                        y: 44,
                        duration: 4,
                        onComplete: function () {
                            controls.enabled = true;
                        },
                    },
                    0,
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
                    0,
                )
                .to(
                    camera.position,
                    {
                        y: Math.max(
                            controls.minDistance,
                            Math.min(5, controls.maxDistance),
                        ),
                        z: Math.max(
                            controls.minDistance,
                            Math.min(0.1, controls.maxDistance),
                        ),
                        duration: 2,
                        onUpdate: function () {
                            controls.update();
                        },
                    },
                    0,
                )
                .to(
                    camera.rotation,
                    {
                        z: -0.4,
                        y: 44,
                        duration: 4,
                        onComplete: function () {
                            controls.enabled = true;
                        },
                    },
                    0,
                );
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    if (renderScene360) {
        renderer.render(scene360, camera360);
    } else {
        renderer.render(scene, camera);
    }
}

animate();
setupLight();
init();

//create360();
