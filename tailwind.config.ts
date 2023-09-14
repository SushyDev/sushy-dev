import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                'accent': 'rgb(var(--accent))',
                'accent-25': 'rgba(var(--accent), 0.25)',
            },
            backgroundImage: {
                'accent-gradient': 'var(--accent-gradient)',
            },
            backgroundSize: {
                '0%': '0%',
                '400%': '400%',
            }
        }
    }
};

export default config;
