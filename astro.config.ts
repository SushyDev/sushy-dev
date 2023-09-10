import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    integrations: [
        tailwind({
            configFile: 'tailwind.config.ts',
            applyBaseStyles: false,
        }),
    ],
    vite: {
        optimizeDeps: {
            exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
        },
        worker: {
            format: "es",
        },
        build: {
            target: "es2022",
        }
    }
});
