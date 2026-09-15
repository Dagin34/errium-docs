import type { NavGroup, PageMeta } from './types';

/**
 * Pure helpers over the navigation groups. Kept separate from `nav.ts` so
 * components can derive from the nav without pulling in its `import.meta.glob`,
 * which would create a cycle back through the very pages they render inside.
 */

/** Every page in sidebar order — the sequence prev/next navigation follows. */
export function flattenPages(groups: NavGroup[]): PageMeta[] {
	return groups.flatMap((group) => group.pages);
}

export function prevNext(
	groups: NavGroup[],
	href: string
): { prev: PageMeta | null; next: PageMeta | null } {
	const flat = flattenPages(groups);
	const i = flat.findIndex((p) => p.href === href);

	if (i === -1) return { prev: null, next: null };

	return {
		prev: i > 0 ? flat[i - 1] : null,
		next: i < flat.length - 1 ? flat[i + 1] : null
	};
}
