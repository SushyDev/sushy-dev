import * as THREE from 'three';

const fragmentShader = `\
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform sampler2D iTex;
uniform float speed;
uniform vec3 skyColor;
uniform vec3 cloudColor;
uniform vec3 lightColor;

# define T texture2D(iTex, fract((s*p.zw + ceil(s*p.x)) / 200.0)).y / (s += s) * 4.0

void main(){
    vec2 coord = gl_FragCoord.xy;
    vec4 p, d = vec4(0.8, 0, coord / iResolution.y - 0.65);
    vec3 out1 = skyColor - d.w; // sky gradient
    float s, f, t = 200.0 + sin(dot(coord,coord));
    const float MAX_ITER = 100.0;
    for (float i = 1.0; i <= MAX_ITER; i += 1.0) {
      t -= 2.0; if (t < 0.0) { break; } // march step
      p = 0.05 * t * d;
      p.xz += iTime * 0.50000 * speed; // movement through space
      p.x += sin(iTime * 0.25 * speed) * 0.25;
      s = 2.0;
      f = p.w + 1.0-T-T-T-T;
      // f = p.w + 1.0 - 0.25*noise(p.xyz * 2.0) - 0.25*noise(p.zxy * 2.01) - 0.25*noise(p.yzx * 2.03);
      if (f < 0.0) {
        vec3 cloudColorShading = mix(lightColor, cloudColor, -f);
        out1 = mix(out1, cloudColorShading, -f * 0.4);
      }
    }
    gl_FragColor = vec4(out1, 1.0);
}`;

const scene = new THREE.Scene();
const camera = new THREE.Camera();

scene.add(camera);

async function getTexture() {
    const loader = new THREE.ImageBitmapLoader();

    return new Promise((resolve) => {
        loader.load( '/noise.png', (imageBitmap) => {
            const texture = new THREE.CanvasTexture(imageBitmap);
            resolve(texture);
        });
    });
};

const noiseTexture = await getTexture();
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

self.postMessage({ message: 'ready' });

function init(canvas, ratio, width, height) {
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
        case 'init': {
            const { canvas, ratio, width, height } = data;
            init(canvas, ratio, width, height);
            break;
        }
        case 'resize': {
            const { width, height } = data;
            resize(width, height);
            break;
        }
        case 'pause': {
            state.paused = true;
            break;
        }
        case 'resume': {
            state.paused = false;
            break;
        }
    }
});
