<script lang="ts">
	import { page } from '$app/state';

	interface Heading {
		id: string;
		text: string;
		level: number;
	}

	let headings = $state<Heading[]>([]);
	let activeId = $state<string>('');

	$effect(() => {
		// Re-read on navigation.
		page.url.pathname;

		const nodes = Array.from(
			document.querySelectorAll<HTMLHeadingElement>('article h2[id], article h3[id]')
		);

		headings = nodes.map((node) => ({
			id: node.id,
			text: node.textContent ?? '',
			level: Number(node.tagName[1])
		}));

		if (nodes.length === 0) {
			activeId = '';
			return;
		}

		// Track which headings are on screen and treat the topmost as active,
		// so the highlight follows reading position rather than jumping to
		// whichever heading fired last.
		const visible = new Set<string>();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target.id);
					else visible.delete(entry.target.id);
				}

				const first = nodes.find((n) => visible.has(n.id));
				if (first) activeId = first.id;
			},
			{ rootMargin: '0px 0px -70% 0px' }
		);

		for (const node of nodes) observer.observe(node);

		return () => observer.disconnect();
	});
</script>

{#if headings.length > 0}
	<nav aria-label="On this page" class="flex flex-col gap-3 py-8">
		<!-- Not a heading: it labels a nav region, not a document section. -->
		<p class="font-mono text-eyebrow uppercase text-fg-muted">On this page</p>
		<ul class="flex flex-col gap-2">
			{#each headings as heading (heading.id)}
				<li>
					<a
						href={`#${heading.id}`}
						aria-current={activeId === heading.id ? 'location' : undefined}
						class="block text-nav transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg
							{heading.level === 3 ? 'pl-4' : ''}
							{activeId === heading.id ? 'text-fg' : 'text-fg-muted hover:text-fg'}"
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
