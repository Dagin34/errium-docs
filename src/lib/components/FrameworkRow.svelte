<script lang="ts">
	const frameworks = [
		{ name: 'FastAPI', href: '/docs/fastapi', note: 'base install' },
		{ name: 'Flask', href: '/docs/flask', note: 'errium[flask]' },
		{ name: 'Django Ninja', href: '/docs/django-ninja', note: 'errium[ninja]' },
		{ name: 'Django REST Framework', href: '/docs/drf', note: 'errium[drf]' }
	];
</script>

<!--
	Monochrome wordmarks, not vendor logos: no brand assets to misuse.

	The 1px gaps let the container's border colour show through between opaque
	cells, so the dividers are hairlines that hold at any column count rather
	than per-cell borders that need unpicking at each breakpoint.
-->
<ul class="grid gap-px overflow-hidden rounded border bg-border sm:grid-cols-2 lg:grid-cols-4">
	{#each frameworks as framework (framework.name)}
		<li class="flex">
			<a
				href={framework.href}
				class="flex flex-1 flex-col gap-2 bg-bg p-6 transition-colors duration-150 ease-out hover:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg"
			>
				<span class="text-h3 text-balance text-fg">{framework.name}</span>
				<span class="font-mono text-eyebrow text-fg-muted">{framework.note}</span>
			</a>
		</li>
	{/each}
</ul>
