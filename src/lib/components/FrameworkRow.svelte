<script lang="ts">
	const frameworks = [
		{ name: 'FastAPI', href: '/docs/fastapi', note: 'base install' },
		{ name: 'Flask', href: '/docs/flask', note: 'errium[flask]' },
		{ name: 'Django Ninja', href: '/docs/django-ninja', note: 'errium[ninja]' },
		{ name: 'Django REST Framework', href: '/docs/drf', note: 'errium[drf]' }
	];
</script>

<!-- Monochrome wordmarks, not vendor logos: no brand assets to misuse. -->
<ul class="grid gap-px overflow-hidden rounded border sm:grid-cols-2">
	{#each frameworks as framework (framework.name)}
		<li>
			<a
				href={framework.href}
				class="flex h-full flex-col gap-1 border-b p-6 transition-colors duration-150 ease-out hover:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg"
			>
				<span class="text-h3 text-fg">{framework.name}</span>
				<span class="font-mono text-eyebrow text-fg-muted">{framework.note}</span>
			</a>
		</li>
	{/each}
</ul>
