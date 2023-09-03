import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const baseURL = 'https://unpkg.com/@ffmpeg/core/dist/esm'

const instance = new FFmpeg();

export default async function(): Promise<FFmpeg> {
    if (instance.loaded) return instance

    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

    await instance.load({ coreURL, wasmURL });

    return instance;
}
