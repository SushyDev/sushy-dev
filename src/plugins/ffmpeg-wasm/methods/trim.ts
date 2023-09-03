import getFFmpeg from '@ffmpeg-wasm/core'
import { fetchFile } from '@ffmpeg/util';

export default async function (file: File, start: string, end: string, keep = false): Promise<File> {
    if (+start === +end || +end < +start) {
        throw new Error('Start and end must be different and end must be greater than start');
    }

    const ffmpeg = await getFFmpeg();

    const { name } = file;
    const outName = `out_${name}`;

    const args = keep ? ['-map', '0', '-c', 'copy'] : [];

    await ffmpeg.writeFile(file.name, await fetchFile(file));
    await ffmpeg.exec(['-i', file.name, '-ss', start, '-to', end, outName, ...args]);
    const output = await ffmpeg.readFile(outName);

    return new File([output], outName, file);
}
