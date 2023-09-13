import ShaderWorker from './shader-worker?worker';
const shaderWorker = new ShaderWorker();

const mainCanvas = document.getElementById('background');

function onResize() {
    shaderWorker.postMessage({
        message: 'resize',
        width: window.innerWidth,
        height: window.innerHeight,
    })
}

function onVisibilityChange() {
    shaderWorker.postMessage({
        message: `visibilitychange:${document.visibilityState}`
    });
}

const offscreen = mainCanvas.transferControlToOffscreen();

const response = await fetch('/noise.webp');
const blob = await response.blob();
const bitmap = await createImageBitmap(blob);

shaderWorker.postMessage({
    message: 'initialize',
    canvas: offscreen,
    texture: bitmap,
    width: window.innerWidth,
    height: window.innerHeight,
}, [offscreen])

mainCanvas.classList.add('drawing');

window.addEventListener('resize', onResize);
document.addEventListener('visibilitychange', onVisibilityChange);
