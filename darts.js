import * as THREE from '/three.js/build/three.module.js';
import { STLLoader } from '/three.js/examples/jsm/loaders/STLLoader.js';

export async function init() {
    const dartGeomentry = await new Promise(res => { new STLLoader().load('/enovikov11-apps/dart.stl', res); }),
        dartMatrial = new THREE.MeshStandardMaterial({ flatShading: true }),
        dart = new THREE.Mesh(dartGeomentry, dartMatrial),
        camera = new THREE.PerspectiveCamera(50, 1, 0.01, 50),
        scene = new THREE.Scene(),
        renderer = new THREE.WebGLRenderer({ antialias: true });

    let lastUpdatedAt = Date.now(), flyingDarts = [];

    camera.position.set(0, 0, 5);

    scene.background = new THREE.Color(0x222222);

    scene.add(new THREE.GridHelper(20, 20, 0x111111, 0x111111));
    scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 7, 0);
    scene.add(light);

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;

    [renderer.xr.getController(0), renderer.xr.getController(1)].forEach(controller => {
        scene.add(controller);

        let currentDart = dart.clone(), isReloading = false;
        controller.add(currentDart);

        controller.addEventListener('select', () => {
            if (isReloading) { return; }

            controller.remove(currentDart);
            scene.add(currentDart);
            currentDart.position.copy(controller.position);
            currentDart.quaternion.copy(controller.quaternion);
            flyingDarts.push({ mesh: currentDart, counter: 0 });
            isReloading = true;

            setTimeout(() => {
                isReloading = false;
                currentDart = dart.clone();
                controller.add(currentDart);
            }, 500);
        });
    });

    renderer.setAnimationLoop(() => {
        const newTime = Date.now();
        const timeDelta = newTime - lastUpdatedAt;
        lastUpdatedAt = newTime;

        const translateDelta = -0.0025 * timeDelta;
        flyingDarts.forEach(item => {
            item.counter++;
            item.mesh.translateY(translateDelta);
        });

        flyingDarts = flyingDarts.filter(({ counter }) => counter < 1000);

        renderer.render(scene, camera);
    });

    return { renderer };
}
