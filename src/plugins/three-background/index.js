const mainCanvas = document.getElementById('background');
const DOWNSCALE = 2;

async function startBackground() {
    const loaded = document.body.classList.contains('loaded');

    if (loaded) return;

    const Renderer = await import('@/plugins/three-background/renderer.js?worker');
    const shaderWorker = new Renderer.default();

    shaderWorker.onmessage = ({ data }) => {
        const { message } = data;

        switch (message) {
            case 'ready':
                ready()
                break;
            case 'drawing':
                mainCanvas.classList.add('loaded')
                break;

        }
    }

    function onWindowResize() {
        shaderWorker.postMessage({
            message: 'resize',
            width: window.innerWidth / DOWNSCALE,
            height: window.innerHeight / DOWNSCALE,
        })
    }

    function ready() {
        mainCanvas.width = window.innerWidth;
        mainCanvas.height = window.innerHeight;
        const offscreen = mainCanvas.transferControlToOffscreen();

        shaderWorker.postMessage({
            message: 'init',
            canvas: offscreen,
            ratio: window.devicePixelRatio,
            width: mainCanvas.width / DOWNSCALE,
            height: mainCanvas.height / DOWNSCALE,
        }, [offscreen])

        window.addEventListener('resize', onWindowResize);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                shaderWorker.postMessage({ message: 'pause' });
            } else {
                shaderWorker.postMessage({ message: 'resume' });
            }
        });
    }
}

document.addEventListener('mousemove', startBackground, { once: true });
document.addEventListener('touchstart', startBackground, { once: true });
