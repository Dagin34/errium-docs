import type { NavGroup, PageMeta } from './types';

/**
 * Builds the navigation by globbing every content page's frontmatter.
 *
 * This module must only ever be imported by `src/routes/+layout.ts`. The glob
 * eagerly imports every `+page.md`, and those pages render MarkdownLayout — so
 * if a component in that tree imported this file, the glob would be re-entered
 * while those modules were still initialising and their exports would read as
 * undefined. Components get the finished groups from `page.data` instead, and
 * derive from them with the pure helpers in `nav-utils.ts`.
 */

/**
 * Fixed group order. This is the numbered motif in the sidebar:
 * 01 — GETTING STARTED through 05 — PROJECT. It encodes a real progression,
 * from first install through to internals.
 */
const GROUP_ORDER = [
	'Getting Started',
	'Frameworks',
	'Concepts',
	'Architecture',
	'Project'
] as const;

interface FrontmatterModule {
	metadata: Omit<PageMeta, 'href'>;
}

const modules = import.meta.glob<FrontmatterModule>('../routes/**/+page.md', {
	eager: true
});

function hrefFor(path: string): string {
	const route = path.replace('../routes', '').replace('/+page.md', '');
	return route === '' ? '/' : route;
}

// The sidebar is generated from frontmatter, never hand-maintained:
// adding a page means adding one file.
export function getNavGroups(): NavGroup[] {
	const pages: PageMeta[] = Object.entries(modules)
		.filter(([, mod]) => mod?.metadata)
		.map(([path, mod]) => ({
			...mod.metadata,
			href: hrefFor(path)
		}));

	return GROUP_ORDER.map((label, i) => ({
		index: String(i + 1).padStart(2, '0'),
		label,
		pages: pages.filter((p) => p.group === label).sort((a, b) => a.order - b.order)
	})).filter((group) => group.pages.length > 0);
}
