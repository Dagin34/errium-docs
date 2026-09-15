import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { mdsvexConfig } from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],

	compilerOptions: {
		// Runes everywhere we write code, but not for MDsveX output: its layout
		// wrapper passes `$$props` through, which runes mode rejects. Scoping it
		// per file keeps every .svelte we author in runes mode regardless.
		runes: ({ filename }) => {
			if (filename.split(/[/\\]/).includes('node_modules')) return undefined;
			if (filename.endsWith('.md')) return false;
			return true;
		}
	},

	kit: {
		adapter: adapter(),
		prerender: {
			// Nothing links to the sitemap, so the crawler would never find it.
			entries: ['*', '/sitemap.xml']
		}
	}
};

export default config;
