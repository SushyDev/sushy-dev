import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import playformCompress from '@playform/compress';

// https://astro.build/config
export default defineConfig({
	vite: {
		optimizeDeps: {
			exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
		},
		css: {
			transformer: 'lightningcss',

		},

		plugins: [tailwindcss()],

		build: {
			cssMinify: 'lightningcss',
		}
	},

	build: {
		inlineStylesheets: 'always',
	},

	integrations: [(await import("@playform/compress")).default()],
})
