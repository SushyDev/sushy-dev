import Renderer from './renderer.js?worker';
const shaderWorker = new Renderer();

const mainCanvas = document.getElementById('background');
const DOWNSCALE = 2;

shaderWorker.onmessage = ({ data }) => {
    const { message } = data;

    switch (message) {
        case 'loaded':
            onLoad()
            break;
        case 'drawing':
            mainCanvas.classList.add('drawing')
            break;

    }
}

function onResize() {
    shaderWorker.postMessage({
        message: 'resize',
        width: window.innerWidth / DOWNSCALE,
        height: window.innerHeight / DOWNSCALE,
    })
}

function onVisibilityChange() {
    shaderWorker.postMessage({
        message: `visibilitychange:${document.visibilityState}`
    });
}

function onLoad() {
    const offscreen = mainCanvas.transferControlToOffscreen();

    shaderWorker.postMessage({
        message: 'initialize',
        canvas: offscreen,
        ratio: 2,
        width: window.innerWidth / DOWNSCALE,
        height: window.innerHeight / DOWNSCALE,
    }, [offscreen])

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);
}
