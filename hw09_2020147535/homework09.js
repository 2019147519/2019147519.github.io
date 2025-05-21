// 05-both-cameras.js
// - PerspectiveCamera vs OrthographicCamera
// - OrbitControl change when camera changes

import * as THREE from 'three';  
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();

// Camera를 perspective와 orthographic 두 가지로 switching 해야 해서 const가 아닌 let으로 선언
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 120;
camera.position.y = 60;
camera.position.z = 180;
camera.lookAt(scene.position);
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0x000000));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
document.body.appendChild(stats.dom);

// Camera가 바뀔 때 orbitControls도 바뀌어야 해서 let으로 선언
let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

// texture
const textureLoader = new THREE.TextureLoader(); 
function loadWithFallback(path, fallbackColor) {
    return new Promise((resolve) => {
        textureLoader.load(
            path,
            (texture) => {
                resolve(new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.8,
                    metalness: 0.2
                }));
            },
            undefined,
            () => {
                console.warn(`Failed to load ${path}, using fallback color.`);
                resolve(new THREE.MeshStandardMaterial({
                    color: fallbackColor,
                    roughness: 0.8,
                    metalness: 0.2
                }));
            }
        );
    });
}


const earthMaterial = await loadWithFallback('Earth.jpg', '#3498db');
const MarsMaterial = await loadWithFallback('Mars.jpg', '#c0392b');
const MercuryMaterial = await loadWithFallback('Mercury.jpg', '#a6a6a6');
const VenusMaterial = await loadWithFallback('Venus.jpg', '#e39e1c');


// 각 행성 생성

const sunGeometry = new THREE.SphereGeometry(10); // radius 10
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);

const EarthGeometry = new THREE.SphereGeometry(3.5); 
const Earth = new THREE.Mesh(EarthGeometry, earthMaterial);

const MarsGeometry = new THREE.SphereGeometry(2.5); 
const Mars = new THREE.Mesh(MarsGeometry, MarsMaterial);

const MercuryGeometry = new THREE.SphereGeometry(1.5); 
const Mercury = new THREE.Mesh(MercuryGeometry, MercuryMaterial);

const VenusGeometry = new THREE.SphereGeometry(3);
const Venus = new THREE.Mesh(VenusGeometry, VenusMaterial);

// 초기위치
sun.position.set(0, 0, 0);
Earth.position.set(50, 0, 0);
Mars.position.set(65, 0, 0);
Mercury.position.set(20, 0, 0);
Venus.position.set(35, 0, 0);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(-20, 40, 60);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x292929);
scene.add(ambientLight);

scene.add(sun);
scene.add(Earth);
scene.add(Mars);
scene.add(Mercury);
scene.add(Venus);

let step = 0;
let earthO = 0;
let MarsO = 0;
let MercuryO = 0;
let VenusO = 0;

// GUI
const gui = new GUI();
const Controls = new function () {
    this.perspective = "Perspective";
    this.switchCamera = function () {
        if (camera instanceof THREE.PerspectiveCamera) {
            scene.remove(camera);
            camera = null; // 기존의 camera 제거    
            // OrthographicCamera(left, right, top, bottom, near, far)
            camera = new THREE.OrthographicCamera(window.innerWidth / -16, 
                window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
            camera.position.x = 120;
            camera.position.y = 60;
            camera.position.z = 180;
            camera.lookAt(scene.position);
            orbitControls.dispose(); // 기존의 orbitControls 제거
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Orthographic";
        } else {
            scene.remove(camera);
            camera = null; 
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.x = 120;
            camera.position.y = 60;
            camera.position.z = 180;
            camera.lookAt(scene.position);
            orbitControls.dispose(); // 기존의 orbitControls 제거
            orbitControls = null;
            orbitControls = new OrbitControls(camera, renderer.domElement);
            orbitControls.enableDamping = true;
            this.perspective = "Perspective";
        }
    };
};

const Speed = {
    EarthrotationSpeed: 0.01,
    EarthorbitSpeed: 0.01,
    MarsrotationSpeed: 0.008,
    MarsorbitSpeed: 0.008,
    MercuryrotationSpeed: 0.02,
    MercuryorbitSpeed: 0.02,
    VenusrotationSpeed: 0.015,
    VenusorbitSpeed: 0.015,
};

const Cam = gui.addFolder('Camera');
Cam.add(Controls, 'switchCamera').name("Switch Camera Type");
Cam.add(Controls, 'perspective').name("Current Camera").listen();

const MercuryOption = gui.addFolder('Mercury');
MercuryOption.add(Speed, 'MercuryrotationSpeed', 0.0, 0.1, 0.001).name('Rotation Speed');
MercuryOption.add(Speed, 'MercuryorbitSpeed', 0.0, 0.1, 0.001).name('Orbit Speed');

const VenusOption = gui.addFolder('Venus');
VenusOption.add(Speed, 'VenusrotationSpeed', 0.0, 0.1, 0.001).name('Rotation Speed');
VenusOption.add(Speed, 'VenusorbitSpeed', 0.0, 0.1, 0.001).name('Orbit Speed');

const EarthOption = gui.addFolder('Earth');
EarthOption.add(Speed, 'EarthrotationSpeed', 0.0, 0.1, 0.001).name('Rotation Speed');
EarthOption.add(Speed, 'EarthorbitSpeed', 0.0, 0.1, 0.001).name('Orbit Speed');

const MarsOption = gui.addFolder('Mars');
MarsOption.add(Speed, 'MarsrotationSpeed', 0.0, 0.1, 0.001).name('Rotation Speed');
MarsOption.add(Speed, 'MarsorbitSpeed', 0.0, 0.1, 0.001).name('Orbit Speed');

render();

function render() {
    orbitControls.update();
    stats.update();
    // 자전
    Earth.rotation.y += Speed.EarthrotationSpeed;
    Mars.rotation.y += Speed.MarsrotationSpeed;
    Mercury.rotation.y += Speed.MercuryrotationSpeed;
    Venus.rotation.y += Speed.VenusrotationSpeed;

    //공전
    earthO += Speed.EarthorbitSpeed;
    Earth.position.x = 50 * Math.sin((Math.PI / 2) + earthO);
    Earth.position.z = 50 * Math.cos((Math.PI / 2) + earthO);

    MarsO += Speed.MarsorbitSpeed;
    Mars.position.x = 65 * Math.sin((Math.PI / 2) + MarsO);
    Mars.position.z = 65 * Math.cos((Math.PI / 2) + MarsO);

    MercuryO += Speed.MercuryorbitSpeed;
    Mercury.position.x = 20 * Math.sin((Math.PI / 2) + MercuryO);
    Mercury.position.z = 20 * Math.cos((Math.PI / 2) + MercuryO);

    VenusO += Speed.VenusorbitSpeed;
    Venus.position.x = 35 * Math.sin((Math.PI / 2) + VenusO);
    Venus.position.z = 35 * Math.cos((Math.PI / 2) + VenusO);

    // render using requestAnimationFrame
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}
