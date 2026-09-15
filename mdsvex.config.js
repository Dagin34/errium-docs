import { createCssVariablesTheme, createHighlighter } from 'shiki';

const theme = createCssVariablesTheme({
	name: 'errium',
	variablePrefix: '--syn-',
	variableDefaults: {},
	fontStyle: true
});

const langs = ['python', 'bash', 'json', 'javascript', 'typescript', 'html', 'css'];

const highlighterPromise = createHighlighter({ themes: [theme], langs });

/** @type {import('mdsvex').MdsvexOptions} */
export const mdsvexConfig = {
	extensions: ['.md'],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await highlighterPromise;
			const resolved = langs.includes(lang) ? lang : 'text';
			const html = highlighter.codeToHtml(code, { lang: resolved, theme: 'errium' });
			return `{@html \`${html.replace(/`/g, '\`').replace(/\$/g, '\$')}\`}`;
		}
	}
};
