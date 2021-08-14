import * as THREE from '/three.js/build/three.module.js';
import { TubePainter } from '/three.js/examples/jsm/misc/TubePainter.js';
import { STLLoader } from '/three.js/examples/jsm/loaders/STLLoader.js';

export async function init() {
    const dart = await new Promise(res => { new STLLoader().load('/enovikov11-apps/dart.stl', res); });

    let camera, scene, renderer = new THREE.WebGLRenderer({ antialias: true });
    let controller1, controller2;
    let flyingDarts = [];

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
    camera.position.set(0, 1.6, 3);

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

    scene.add(grid);

    scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 4, 0);
    scene.add(light);

    const painter1 = new TubePainter();
    scene.add(painter1.mesh);

    const painter2 = new TubePainter();
    scene.add(painter2.mesh);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;

    function onSelectStart() {
        this.userData.isSelecting = true;
        this.userData.spawn = true;
    }

    function onSelectEnd() {
        this.userData.isSelecting = false;
    }

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    controller1.userData.painter = painter1;
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    controller2.userData.painter = painter2;
    scene.add(controller2);

    const material = new THREE.MeshStandardMaterial({ flatShading: true });
    const mesh = new THREE.Mesh(dart, material);

    const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.0001, 30));
    pivot.name = 'pivot';
    pivot.position.z = - 0.05;
    mesh.add(pivot);

    controller1.add(mesh.clone());
    controller2.add(mesh.clone());

    window.addEventListener('resize', onWindowResize);

    renderer.setAnimationLoop(render);

    setInterval(() => {
        flyingDarts.forEach(item => {
            if (item.counter < 1000) {
                item.counter++;
                item.mesh.translateY(-0.025);
            }

        });
    }, 10);

    function render() {
        handleController(controller1);
        handleController(controller2);

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function handleController(controller) {
        const userData = controller.userData;

        if (userData.spawn) {
            userData.spawn = false;

            const material = new THREE.MeshStandardMaterial({ flatShading: true });
            const mesh = new THREE.Mesh(dart, material);

            mesh.position.copy(controller.position);
            mesh.rotation.copy(controller.rotation);

            flyingDarts.push({ mesh, counter: 0 });
            scene.add(mesh);
        }
    }

    return { renderer };
}
