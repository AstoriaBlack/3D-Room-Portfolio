import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

const canvas = document.querySelector('#experience-canvas');
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const modals = {
  about: document.querySelector("model.about"),
  work: document.querySelector("model.work"),
  contact: document.querySelector("model.contact")
}

//models transitions
const showModel = (modal) => {
  modal.style.display = "block";

  gsap.set(modelDirection, { opacity: 0});

  gsap.to(modelDirection, {
    opacity: 1,
    duration: 0.5
  });
}

const hideModel = (modal) => {
  gsap.to(modelDirection, {
    opacity: 0,
    duration: 0.5,
    onComplete: ()=> {
      modal.style.display = "none";
    },
  });
}

//fans array to animate
const xAxisFans = [];
const yAxisFans = [];

const raycasterObjects = [];
let currentIntersects = [];

const socialLinks = {
  "Github" : "https://github.com/AstoriaBlack",
  "Linkedin" : "https://www.linkedin.com",
  "Contact" : "+94787719972"
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//Loaders
const textureLoader = new THREE.TextureLoader();

//Model Loaders
const dracoLoader = new DRACOLoader();

//specify path to a folder containing WASM/JS decoding libraries
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
  .setPath('/textures/skybox/')
  .load( [
    'px.webp',
    'nx.webp',
    'py.webp',
    'ny.webp',
    'pz.webp',
    'nz.webp'
  ]);
  

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

const loadedTextures = {
  day: {},
  night: {}
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false; // Adjust this based on your model's UV mapping
  // Keep SRGBColorSpace on the texture (correct)
  dayTexture.colorSpace = THREE.NoColorSpace;

  loadedTextures.day[key] = dayTexture;

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false; // Adjust this based on your model's UV mapping
  nightTexture.colorSpace = THREE.NoColorSpace;
  loadedTextures.night[key] = nightTexture;
});

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

const whiteMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});

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

function showCopyFeedback() {
  const toast = document.querySelector('.copy-toast');
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}

window.addEventListener("mousemove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", (e) => {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        if (key === "Contact") {
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

          if (isMobile) {
            window.location.href = `tel:${url}`;
            return;
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
  }
});

loader.load("/models/room_portfolio.glb", (glb)=> {
  glb.scene.traverse((child) => {
    if (child.isMesh) {

      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
      }
      if (child.name.includes("Water")) {
          child.material = new THREE.MeshBasicMaterial({
            color:0x83BDF7,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
          })
        }else if (child.name.includes("Glass")) {
          child.material = glassMaterial;

        }else if (child.name.includes("Bubble")) {
        child.material = whiteMaterial;
        
        }else if (child.name.includes("Screen")) {
          child.material = new THREE.MeshBasicMaterial({
            map: videoTexture
          });

        } else
          Object.keys(textureMap).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key]
          });

          child.material = material;

          if (child.name.includes("Fan")) {
            if (child.name.includes("Fan_3") || child.name.includes("Fan_4")) 
              {
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
  });
  scene.add(glb.scene);
  
});


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 
  45, 
  sizes.width/ sizes.height, 
  0.1, 
  1000 
);

camera.position.set(18.308497815998248,8.340313483552896,16.733946926439426)

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.update();
controls.target.set(-0.044514,1.9922,-0.26919);

//Event listeners
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //update rendere
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

});


function animate() {
};

const render = () => {
  //orbit controls
  controls.update();
  
  // console.log(camera.position);
  // console.log("000000000");
  // console.log(controls.target);

  //Animating fans
  xAxisFans.forEach((fan) => {
    fan.rotation.x += 0.01;
  });

  yAxisFans.forEach((fan) => {
    fan.rotation.y += 0.01;
  });

  //Raycaster
  raycaster.setFromCamera(pointer, camera);

  // Get all the objects the raycaster is currently shooting through / intersecting with
  currentIntersects = raycaster.intersectObjects(raycasterObjects);

  for (let i =0; i < currentIntersects.length; i++) {
    
  }

  if(currentIntersects.length > 0) {
    const currentIntersectObject = currentIntersects[0].object;

    if (currentIntersectObject.name.includes("Pointer")) {
        document.body.style.cursor = "pointer";
    } else {
        document.body.style.cursor = "default";
    }
  } else {
        document.body.style.cursor = "default";
  }
    

  renderer.render( scene, camera );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.3;

  window.requestAnimationFrame( render );

};

render();
