import { createCssVariablesTheme, createHighlighter } from 'shiki';

/**
 * Shiki emits inline styles by default, which would fight the theme. This
 * theme emits CSS custom properties instead, bound to the --syn-* tokens in
 * app.css, so one rendered copy of each block re-themes with the rest of the
 * site instead of needing a light and a dark render.
 */
const theme = createCssVariablesTheme({
	name: 'errium',
	variablePrefix: '--syn-',
	variableDefaults: {},
	fontStyle: true
});

export const LANGS = [
	'python',
	'bash',
	'json',
	'javascript',
	'typescript',
	'html',
	'css',
	'text'
];

/**
 * Shiki generates the <pre> and <code> itself, so this is how they get
 * Tailwind utilities rather than a hand-written stylesheet beside them.
 * The block scrolls inside its own container so the page never scrolls
 * horizontally.
 */
const transformers = [
	{
		pre(node) {
			this.addClassToHast(node, 'overflow-x-auto p-4 font-mono text-code');
		},
		code(node) {
			this.addClassToHast(node, 'grid');
		}
	}
];

let highlighterPromise;

function getHighlighter() {
	highlighterPromise ??= createHighlighter({ themes: [theme], langs: LANGS });
	return highlighterPromise;
}

/**
 * Highlight a snippet at build time.
 *
 * @param {string} code
 * @param {string} lang
 * @returns {Promise<string>} `<pre class="shiki …">…</pre>`
 */
export async function highlightToHtml(code, lang = 'text') {
	const highlighter = await getHighlighter();
	const resolved = LANGS.includes(lang) ? lang : 'text';
	return highlighter.codeToHtml(code, { lang: resolved, theme: 'errium', transformers });
}
