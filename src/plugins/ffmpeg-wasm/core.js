import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const baseURL = 'https://unpkg.com/@ffmpeg/core/dist/esm'

const instance = new FFmpeg();

export default async function() {
    if (instance.loaded) return instance

    await instance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    return instance;
}
