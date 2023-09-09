import * as THREE from 'three';
import fragmentShader from './shader.frag?raw';

const scene = new THREE.Scene();

const camera = new THREE.Camera();
scene.add(camera);

const loader = new THREE.ImageBitmapLoader();
const imageBitmap = await new Promise((resolve => { loader.load('/noise.png', resolve) }))
const noiseTexture = new THREE.CanvasTexture(imageBitmap);

const geometry = new THREE.PlaneGeometry(2, 2);

const material = new THREE.ShaderMaterial({
    uniforms: {
        iResolution: { value: new THREE.Vector2() },
        iMouse: { value: new THREE.Vector2() },
        iTime: { value: 0 },
        iTex: { value: noiseTexture },
        speed: { value: 1.0 },
        skyColor: { value: new THREE.Vector3(0.173,0.365,0.502) },
        cloudColor: { value: new THREE.Vector3(0.051,0.122,0.306) },
        lightColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
    },
    fragmentShader,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const state = { paused: false };

self.postMessage({ message: 'loaded' });

function initialize(canvas, ratio, width, height) {
    self.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
    self.renderer.setPixelRatio(ratio);

    resize(width, height);

    animate(self.renderer);

    self.postMessage({ message: 'drawing' });
};

function resize(width, height) {
    self.renderer.setSize(width, height, false);

    material.uniforms.iResolution.value.x = width;
    material.uniforms.iResolution.value.y = height;

    self.renderer.render(scene, camera);
}

function animate(renderer) {
    requestAnimationFrame(() => animate(renderer));

    if (state.paused) return;

    const time = performance.now() * 0.001;
    material.uniforms.iTime.value = time

    renderer.render(scene, camera);
}

self.addEventListener('message', ({ data }) => {
    const { message } = data;

    switch (message) {
        case 'initialize': {
            const { canvas, ratio, width, height } = data;
            initialize(canvas, ratio, width, height);
            break;
        }
        case 'resize': {
            const { width, height } = data;
            resize(width, height);
            break;
        }
        case 'visibilitychange:hidden': {
            state.paused = true;
            break;
        }
        case 'visibilitychange:visible': {
            state.paused = false;
            break;
        }
    }
});
