import { fileURLToPath } from 'node:url';
import rehypeSlug from 'rehype-slug';
import { highlightToHtml } from './src/lib/shiki.js';

/**
 * MDsveX reads the layout from disk (resolved against cwd) and then emits the
 * same string as an import specifier inside each .md file. A relative path
 * therefore resolves against the page, and `$lib` isn't resolvable at read
 * time — so it has to be absolute. Forward slashes keep it valid as a
 * specifier on Windows.
 */
const MARKDOWN_LAYOUT = fileURLToPath(
	new URL('./src/lib/components/MarkdownLayout.svelte', import.meta.url)
).replace(/\\/g, '/');

/**
 * Wrap Shiki's output so fenced blocks in .md render the same chrome as the
 * CodeBlock component used in .svelte files: a bordered shell, an optional
 * filename bar, and a copy button.
 *
 * The raw source travels in data-code so one delegated handler in
 * MarkdownLayout can serve every block on the page — the button is in the
 * prerendered HTML, so it is keyboard-reachable before any JS runs.
 *
 * MDsveX feeds the fence's info string through as `lang`, so ```python:main.py
 * arrives as "python:main.py" and gives us an optional filename.
 */
function escapeAttr(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

const COPY_ICON =
	'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

const CHECK_ICON =
	'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/** @type {import('mdsvex').MdsvexOptions} */
export const mdsvexConfig = {
	extensions: ['.md'],
	// Aliased, not relative: MDsveX injects this path verbatim into each .md
	// file, so a relative path would resolve against the page, not the root.
	layout: {
		_: MARKDOWN_LAYOUT
	},
	rehypePlugins: [rehypeSlug],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const [language, filename] = String(lang ?? 'text').split(':');
			const pre = await highlightToHtml(code, language);

			const header = filename
				? `<div class="border-b px-4 py-2 font-mono text-eyebrow text-fg-muted">${escapeAttr(filename)}</div>`
				: '';

			const button =
				`<button type="button" data-copy aria-label="Copy code" ` +
				`class="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-sm border ` +
				`bg-bg-subtle text-fg-muted transition-colors duration-150 ease-out pointer-fine:opacity-0 ` +
				`group-hover:opacity-100 hover:border-border-strong hover:text-fg ` +
				`focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg">` +
				`<span data-copy-idle>${COPY_ICON}</span>` +
				`<span data-copy-done hidden>${CHECK_ICON}</span>` +
				`</button>`;

			const html =
				`<div class="group relative my-6 overflow-hidden rounded border bg-bg-subtle" ` +
				`data-code="${escapeAttr(code)}">` +
				header +
				button +
				pre +
				`</div>`;

			// Escape for interpolation into a Svelte template literal.
			return `{@html \`${html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`}`;
		}
	}
};
