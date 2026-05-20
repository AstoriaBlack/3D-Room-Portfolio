import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#experience-canvas');
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

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

loader.load("/models/room_portfolio.glb", (glb)=> {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Water")) {
          child.material = new THREE.MeshBasicMaterial({
            color:0x558BC6,
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


const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

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
    
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render( scene, camera );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.3;

  window.requestAnimationFrame( render );

};

render();
