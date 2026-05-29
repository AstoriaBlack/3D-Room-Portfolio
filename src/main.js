import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

// ---- CANVAS & SIZES ----
const canvas = document.querySelector('#experience-canvas');
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// ---- SCENE, CAMERA, RENDERER, CONTROLS ----
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(18.308497815998248, 8.340313483552896, 16.733946926439426);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.3;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(-0.044514, 1.9922, -0.26919);
controls.update();

// ---- RESIZE ----
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ---- MODALS ----
const modals = {
  about: document.querySelector(".modal.about"),
  work: document.querySelector(".modal.work"),
  contact: document.querySelector(".modal.contact")
}

const showModel = (modal) => {
  modal.style.display = "block";
  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, { opacity: 1, duration: 0.5 });
}

const hideModel = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    },
  });
}

let touchHappened = false;

document.querySelectorAll(".model-exit-button").forEach((button) => {
  
  button.addEventListener(
    "touchend",
    (e) => {
      touchHappened = true;
      e.preventDefault();
      const modal = e.target.closest(".modal");
      hideModel(modal);
    },
    { passive: false }
  );

  button.addEventListener(
    "click",
    (e) => {
      if (touchHappened) return;
      e.preventDefault();
      const modal = e.target.closest(".modal");
      hideModel(modal);
    },
    { passive: false }
  );
});

// ---- ARRAYS AND RAYCASTER VARIABLES ----
const xAxisFans = [];
const yAxisFans = [];
const raycasterObjects = [];
let currentIntersects = [];

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// ---- SOCIAL LINKS ----
const socialLinks = {
  "Github": "https://github.com/AstoriaBlack",
  "Linkedin": "https://www.linkedin.com",
  "Phone": "+94787719972"
}

// ---- LOADERS ----
const textureLoader = new THREE.TextureLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
  .setPath('/textures/skybox/')
  .load(['px.webp', 'nx.webp', 'py.webp', 'ny.webp', 'pz.webp', 'nz.webp']);

// ---- TEXTURES ----
const textureMap = {
  First: {
    day: "/textures/room/day/TextureSetTwo.webp",
    night: "/textures/room/night/Night_one.webp"
  },
  Second: {
    day: "/textures/room/day/TextureSetThree.webp",
    night: "/textures/room/night/Night_two.webp"
  },
  Third: {
    day: "/textures/room/day/TextureSetFour.webp",
    night: "/textures/room/night/night_three.webp"
  },
};

const loadedTextures = { day: {}, night: {} };

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.NoColorSpace;
  loadedTextures.day[key] = dayTexture;

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false;
  nightTexture.colorSpace = THREE.NoColorSpace;
  loadedTextures.night[key] = nightTexture;
});

// ---- MATERIALS ----
const glassMaterial = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  opacity: 1,
  color: 0xfbfbfb,
  metalness: 0,
  roughness: 0,
  ior: 3,
  thickness: 0.01,
  specularIntensity: 1,
  envMap: environmentMap,
  envMapIntensity: 1,
  depthWrite: false,
  specularColor: 0xfbfbfb,
});

const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

// ---- VIDEO ----
const videoElement = document.createElement('video');
videoElement.src = '/textures/video/screen.mp4';
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.playbackRate = 0.5;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.flipY = false;

// ---- COPY TOAST ----
function showCopyFeedback() {
  const toast = document.querySelector('.copy-toast');
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

// ---- LOAD MODEL ----
loader.load("/models/room_portfolio.glb", (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
      }

      if (child.name.includes("Water")) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x83BDF7,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        });
      } else if (child.name.includes("Glass")) {
        child.material = glassMaterial;
      } else if (child.name.includes("Bubble")) {
        child.material = whiteMaterial;
      } else if (child.name.includes("Screen")) {
        child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
      } else {
        Object.keys(textureMap).forEach((key) => {
          if (child.name.includes(key)) {
            child.material = new THREE.MeshBasicMaterial({
              map: loadedTextures.day[key]
            });

            if (child.name.includes("Fan")) {
              if (child.name.includes("Fan_3") || child.name.includes("Fan_4")) {
                xAxisFans.push(child);
              } else {
                yAxisFans.push(child);
              }
            }

            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
        });
      }
    }
  });

  scene.add(glb.scene);
});

// ---- RAYCASTER INTERACTION ----
function handleRaycasterInteraction() {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    let socialMatched = false;
    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        socialMatched = true;
        if (key === "Phone") {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            window.location.href = `tel:${url}`;
          } else {
            navigator.clipboard.writeText(url).then(() => {
              showCopyFeedback();
            });
          }
        } else {
          const newWindow = window.open();
          newWindow.opener = null;
          newWindow.location = url;
          newWindow.target = "_blank";
          newWindow.rel = "noopener noreferrer";
        }
      }
    });

    if (socialMatched) return;

    if (object.name.includes("Plaque_About")) {
      showModel(modals.about);
    } else if (object.name.includes("Plaque_Projects")) {
      showModel(modals.work);
    } else if (object.name.includes("Plaque_Contact")) {
      showModel(modals.contact);
    }
  }
}

// ---- EVENT LISTENERS ----
window.addEventListener("mousemove", (e) => {
  touchHappened = false;
  pointer.x = (e.clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("touchstart", (e) => {
  pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
  pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
}, { passive: false });

window.addEventListener("touchend", (e) => {
  e.preventDefault();
  handleRaycasterInteraction();
}, { passive: false });

window.addEventListener("click", handleRaycasterInteraction);

// ---- RENDER LOOP ----
const render = () => {
  controls.update();

  xAxisFans.forEach((fan) => { fan.rotation.x += 0.01; });
  yAxisFans.forEach((fan) => { fan.rotation.y += 0.01; });

  raycaster.setFromCamera(pointer, camera);
  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  if (currentIntersects.length > 0) {
    const currentIntersectObject = currentIntersects[0].object;
    if (currentIntersectObject.name.includes("Pointer")) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  } else {
    document.body.style.cursor = "default";
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
};

render();