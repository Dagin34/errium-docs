<script lang="ts">
	import { SITE } from '$lib/config';

	// The site's own repo URL is still a placeholder. Rendering it would ship a
	// broken link and make the prerenderer crawl it as a relative path, so the
	// row is dropped until a real URL is filled in — at which point it appears
	// on its own with no further change.
	const siteRepoReady = !SITE.links.siteRepo.startsWith('<');

	const columns = [
		{
			label: 'Docs',
			links: [
				{ title: 'Introduction', href: '/docs' },
				{ title: 'Installation', href: '/docs/installation' },
				{ title: 'Quickstart', href: '/docs/quickstart' },
				{ title: 'The response contract', href: '/docs/response-shape' }
			]
		},
		{
			label: 'Project',
			links: [
				{ title: 'Architecture', href: '/architecture' },
				{ title: 'Roadmap', href: '/roadmap' },
				{ title: 'Contributing', href: '/contributing' },
				{ title: 'Changelog', href: '/changelog' }
			]
		},
		{
			label: 'Links',
			links: [
				{ title: 'PyPI', href: SITE.links.pypi },
				{ title: 'GitHub', href: SITE.links.repo },
				{ title: 'Issues', href: SITE.links.issues },
				...(siteRepoReady ? [{ title: 'This site', href: SITE.links.siteRepo }] : [])
			]
		}
	];
</script>

<footer class="mt-24 border-t py-12">
	<div class="flex flex-wrap gap-12">
		{#each columns as column (column.label)}
			<div class="flex min-w-32 flex-col gap-3">
				<!-- Not a heading: labels a link list, not a document section. -->
				<p id={`footer-${column.label}`} class="font-mono text-eyebrow uppercase text-fg-muted">
					{column.label}
				</p>
				<ul aria-labelledby={`footer-${column.label}`} class="flex flex-col gap-1">
					{#each column.links as link (link.title)}
						<li>
							<a
								href={link.href}
								class="block py-1 text-nav text-fg-muted transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
							>
								{link.title}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<p class="mt-12 font-mono text-eyebrow uppercase text-fg-muted">
		MIT licensed · Errium is open source
	</p>
</footer>
