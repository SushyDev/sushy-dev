import { 
    Scene,
    Camera,
    ImageBitmapLoader,
    CanvasTexture,
    PlaneGeometry,
    Vector2,
    Vector3,
    ShaderMaterial,
    Mesh,
    WebGLRenderer,
} from 'three';
import fragmentShader from './shader.frag?raw';

const scene = new Scene();

const camera = new Camera();
scene.add(camera);

const loader = new ImageBitmapLoader();
const imageBitmap = await new Promise((resolve => { loader.load('/noise.webp', resolve) }))
const noiseTexture = new CanvasTexture(imageBitmap);

const geometry = new PlaneGeometry(2, 2);

const uniforms = {
    iResolution: { value: new Vector2() },
    iMouse: { value: new Vector2() },
    iTime: { value: 0 },
    iTex: { value: noiseTexture },
    speed: { value: 3.33 },
    skyColor: { value: new Vector3(0.17,0.35,0.50) },
    cloudColor: { value: new Vector3(0.05,0.12,0.30) },
    lightColor: { value: new Vector3(1.00, 1.00, 1.00) },
}

const material = new ShaderMaterial({
    uniforms,
    fragmentShader,
});

const mesh = new Mesh(geometry, material);
scene.add(mesh);

const state = { paused: false };

self.postMessage({ message: 'loaded' });

function initialize(canvas, ratio, width, height) {
    self.renderer = new WebGLRenderer({ alpha: true, antialias: true, canvas });
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
