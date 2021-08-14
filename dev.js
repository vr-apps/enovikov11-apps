import * as THREE from '/three.js/build/three.module.js';
import { OrbitControls } from '/three.js/examples/jsm/controls/OrbitControls.js';
import { TubePainter } from '/three.js/examples/jsm/misc/TubePainter.js';
import { VRButton } from '/three.js/examples/jsm/webxr/VRButton.js';
import { STLLoader } from '/three.js/examples/jsm/loaders/STLLoader.js';

let camera, scene, renderer;
let controller1, controller2;

let dart;

let flyingDarts = [];

const cursor = new THREE.Vector3();

let controls;

new STLLoader().load('/enovikov11-apps/dart.stl', loadedDart => {
    dart = loadedDart;
    init();
    animate();
})

setInterval(() => {
    flyingDarts.forEach(item => {
        if (item.counter < 1000) {
            item.counter++;
            item.mesh.translateY(-0.025);
        }

    });
}, 10);

function init() {

    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
    camera.position.set(0, 1.6, 3);

    controls = new OrbitControls(camera, container);
    controls.target.set(0, 1.6, 0);
    controls.update();

    const tableGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
    const tableMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 1.0,
        metalness: 0.0
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = 0.35;
    table.position.z = 0.85;
    scene.add(table);

    const floorGometry = new THREE.PlaneGeometry(4, 4);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 1.0,
        metalness: 0.0
    });
    const floor = new THREE.Mesh(floorGometry, floorMaterial);
    floor.rotation.x = - Math.PI / 2;
    scene.add(floor);

    const grid = new THREE.GridHelper(10, 20, 0x111111, 0x111111);
    // grid.material.depthTest = false; // avoid z-fighting
    scene.add(grid);

    scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 4, 0);
    scene.add(light);

    //

    const painter1 = new TubePainter();
    scene.add(painter1.mesh);

    const painter2 = new TubePainter();
    scene.add(painter2.mesh);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));

    // controllers

    function onSelectStart() {

        this.userData.isSelecting = true;
        this.userData.spawn = true;
    }

    function onSelectEnd() {

        this.userData.isSelecting = false;

    }

    function onSqueezeStart() {

        this.userData.isSqueezing = true;
        this.userData.positionAtSqueezeStart = this.position.y;
        this.userData.scaleAtSqueezeStart = this.scale.x;

    }

    function onSqueezeEnd() {

        this.userData.isSqueezing = false;

    }

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    // controller1.addEventListener('squeezestart', onSqueezeStart);
    // controller1.addEventListener('squeezeend', onSqueezeEnd);
    controller1.userData.painter = painter1;
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    // controller2.addEventListener('squeezestart', onSqueezeStart);
    // controller2.addEventListener('squeezeend', onSqueezeEnd);
    controller2.userData.painter = painter2;
    scene.add(controller2);

    //

    // const geometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 5);
    // dart.rotateX(- Math.PI / 2);
    // dart.scale(0.1);
    const material = new THREE.MeshStandardMaterial({ flatShading: true });
    const mesh = new THREE.Mesh(dart, material);

    const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.0001, 30));
    pivot.name = 'pivot';
    pivot.position.z = - 0.05;
    mesh.add(pivot);

    controller1.add(mesh.clone());
    controller2.add(mesh.clone());

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function handleController(controller) {

    const userData = controller.userData;

    const pivot = controller.getObjectByName('pivot');

    if (userData.spawn) {
        userData.spawn = false;

        const material = new THREE.MeshStandardMaterial({ flatShading: true });
        const mesh = new THREE.Mesh(dart, material);

        // mesh.setFromMatrixPosition(pivot.matrixWorld);

        mesh.position.copy(controller.position);
        mesh.rotation.copy(controller.rotation);

        flyingDarts.push({ mesh, counter: 0 });
        scene.add(mesh);
    }

    // const painter = userData.painter;



    // if (userData.isSqueezing === true) {

    // 	const delta = (controller.position.y - userData.positionAtSqueezeStart) * 5;
    // 	const scale = Math.max(0.1, userData.scaleAtSqueezeStart + delta);

    // 	// pivot.scale.setScalar(scale);
    // 	painter.setSize(scale);

    // }

    // cursor.setFromMatrixPosition(pivot.matrixWorld);

    // if (userData.isSelecting === true) {

    // 	painter.lineTo(cursor);
    // 	painter.update();

    // } else {

    // 	painter.moveTo(cursor);

    // }

}

function animate() {

    renderer.setAnimationLoop(render);

}

function render() {

    handleController(controller1);
    handleController(controller2);

    renderer.render(scene, camera);

}
