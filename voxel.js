import * as THREE from '/three.js/build/three.module.js';

const VOXEL_SIZE = 0.03;
const objects = new Set();

export async function init() {
    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 50),
        scene = new THREE.Scene(),
        renderer = new THREE.WebGLRenderer({ antialias: true });

    camera.position.set(0, 0, 0);

    scene.background = new THREE.Color(0x222222);

    scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;

    const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)]

    controllers.forEach(controller => {
        scene.add(controller);

        controller.addEventListener('selectstart', function () {
            this.userData.isSelecting = true;
        });

        controller.addEventListener('selectend', function () {
            this.userData.isSelecting = false;
        });
    });

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);

        controllers.forEach(function (controller) {
            if (this.userData.isSelecting) {
                const { x, y, z } = controller.position,
                    realX = Math.floor(x / VOXEL_SIZE) * VOXEL_SIZE,
                    realY = Math.floor(y / VOXEL_SIZE) * VOXEL_SIZE,
                    realZ = Math.floor(z / VOXEL_SIZE) * VOXEL_SIZE,
                    realPos = [realX, realY, realZ],
                    realPosName = realPos.join(',');

                if (!objects.has(realPosName)) {
                    const cube = new THREE.Mesh(new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE),
                        new THREE.MeshBasicMaterial({ color: 0xffffff }));
                    cube.position.set(...realPos);
                    objects.has(realPosName);
                }
            }
        });
    });

    return { renderer };
}