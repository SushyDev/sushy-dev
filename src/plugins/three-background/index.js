const mainCanvas = document.getElementById('background');

function startBackground() {
    const loaded = document.body.classList.contains('loaded');
    if (loaded) return;

    const shaderWorker = new Worker('src/plugins/three-background/renderer.js', { type: 'module' });

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
            width: window.innerWidth,
            height: window.innerHeight,
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
            width: mainCanvas.width,
            height: mainCanvas.height,
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
