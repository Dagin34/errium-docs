<script lang="ts">
	import BeforeAfter from '$lib/components/BeforeAfter.svelte';
	import FeatureGrid from '$lib/components/FeatureGrid.svelte';
	import FrameworkRow from '$lib/components/FrameworkRow.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import { SITE } from '$lib/config';

	let { data } = $props();

	// The same numbered motif the sidebar uses, continued onto the landing page.
	const sections = [
		{ index: '01', label: 'The difference' },
		{ index: '02', label: 'What you get' },
		{ index: '03', label: 'Supported frameworks' }
	];
</script>

<svelte:head>
	<title>{SITE.name} — consistent API errors for Python</title>
	<meta name="description" content={SITE.description} />
	<meta property="og:title" content={`${SITE.name} — consistent API errors for Python`} />
	<meta property="og:description" content={SITE.description} />
</svelte:head>

<Hero />

<section class="mt-24 flex flex-col gap-6">
	<h2 class="flex gap-2 font-mono text-eyebrow uppercase text-fg-muted">
		<span aria-hidden="true">{sections[0].index}</span>
		<span aria-hidden="true">—</span>
		<span>{sections[0].label}</span>
	</h2>

	<p class="text-fg-muted">
		The same failed request — a body missing its <code class="font-mono text-[0.9em]"
			>password</code
		> field — before and after.
	</p>

	<BeforeAfter without={data.without} withErrium={data.withErrium} />
</section>

<section class="mt-24 flex flex-col gap-8">
	<h2 class="flex gap-2 font-mono text-eyebrow uppercase text-fg-muted">
		<span aria-hidden="true">{sections[1].index}</span>
		<span aria-hidden="true">—</span>
		<span>{sections[1].label}</span>
	</h2>

	<FeatureGrid />
</section>

<section class="mt-24 flex flex-col gap-8">
	<h2 class="flex gap-2 font-mono text-eyebrow uppercase text-fg-muted">
		<span aria-hidden="true">{sections[2].index}</span>
		<span aria-hidden="true">—</span>
		<span>{sections[2].label}</span>
	</h2>

	<FrameworkRow />
</section>
