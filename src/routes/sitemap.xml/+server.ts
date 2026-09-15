import { SITE } from '$lib/config';
import { getNavGroups } from '$lib/nav';
import { flattenPages } from '$lib/nav-utils';

export const prerender = true;

/**
 * Generated from the same frontmatter that builds the sidebar, so the sitemap
 * cannot drift from the site: adding a page adds its entry.
 *
 * Importing `$lib/nav` is safe here even though it globs every `+page.md`.
 * This is its own entry point, not part of the page import graph, so there is
 * no cycle back through the pages the glob loads.
 */
export function GET() {
	const routes = ['/', ...flattenPages(getNavGroups()).map((p) => p.href)];

	// The landing page is the entry point; content pages sit below it.
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(href) => `\t<url>
\t\t<loc>${SITE.url}${href === '/' ? '' : href}</loc>
\t\t<priority>${href === '/' ? '1.0' : '0.8'}</priority>
\t</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
