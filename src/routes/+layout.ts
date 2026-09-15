import { getNavGroups } from '$lib/nav';

export const prerender = true;

// Built once here and shared through page data. This is the only place that
// imports `$lib/nav` — see the note at the top of that file.
export function load() {
	return { navGroups: getNavGroups() };
}
