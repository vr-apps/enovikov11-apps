import * as THREE from '/three.js/build/three.module.js';


export async function init() {
    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 50),
        scene = new THREE.Scene(),
        renderer = new THREE.WebGLRenderer({ antialias: true });

    camera.position.set(0, 0, 5);

    scene.background = new THREE.Color(0x222222);

    scene.add(new THREE.GridHelper(20, 20, 0x111111, 0x111111));
    scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 7, 0);
    scene.add(light);

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;

    const controller1 = renderer.xr.getController(0), controller2 = renderer.xr.getController(1);

    scene.add(controller1);
    scene.add(controller2);


    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.03),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(cube);
    cube.position.set(0, 1, -2);

    renderer.setAnimationLoop(() => {
        cube.setRotationFromQuaternion(controller1.quaternion.multiply(controller2.quaternion));
        renderer.render(scene, camera);
    });

    return { renderer };
}
