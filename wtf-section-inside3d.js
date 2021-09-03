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

    const basicSize = 0.03, cubes = [], x = 0, y = 1, z = -0.5;

    for (let i = -10; i <= 10; i++) {
        for (let j = -10; j <= 10; j++) {
            const cube = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            scene.add(cube);
            cubes.push({ cube, i, j });
        }
    }

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;

    let k = -10;

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);

        k = Math.floor(Math.random() * 21) - 10;

        cubes.forEach(({ cube, i, j }) => {
            const dxy = Math.sqrt((i * i + j * j + k * k) / 3) / 10,
                color = Math.floor(dxy * 16) * 0x111111;

            cube.material.color.setHex(color);
            cube.position.set(x + i * basicSize, y + j * basicSize, z + k * basicSize);
        });

    });

    return { renderer };
}