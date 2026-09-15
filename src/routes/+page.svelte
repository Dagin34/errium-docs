<script lang="ts">
	import BeforeAfter from '$lib/components/BeforeAfter.svelte';
	import FeatureGrid from '$lib/components/FeatureGrid.svelte';
	import FrameworkRow from '$lib/components/FrameworkRow.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import { SITE } from '$lib/config';

	let { data } = $props();

	const title = `${SITE.name} — consistent API errors for Python`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={SITE.description} />
	<link rel="canonical" href={SITE.url} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE.url} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={SITE.description} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={SITE.description} />
</svelte:head>

<!--
	One grid for the whole page: the numbered markers sit in the margin column
	and everything else shares the content column, so the hero and the sections
	below it align to the same left edge. Below 1024px it collapses to a single
	column and each marker simply sits above its section.
-->
<div class="lg:grid lg:grid-cols-landing lg:gap-x-12">
	<div class="lg:col-start-2">
		<Hero />
	</div>

	<h2
		class="mt-24 flex gap-2 font-mono text-eyebrow uppercase text-fg-muted lg:col-start-1 lg:row-start-2"
	>
		<span aria-hidden="true">01</span>
		<span aria-hidden="true">—</span>
		<span>The difference</span>
	</h2>

	<div class="mt-6 flex flex-col gap-6 lg:col-start-2 lg:row-start-2 lg:mt-24">
		<p class="max-w-content text-fg-muted">
			The same failed request — a body missing its <code class="font-mono text-[0.9em]"
				>password</code
			> field — before and after.
		</p>

		<BeforeAfter without={data.without} withErrium={data.withErrium} />
	</div>

	<h2
		class="mt-24 flex gap-2 font-mono text-eyebrow uppercase text-fg-muted lg:col-start-1 lg:row-start-3"
	>
		<span aria-hidden="true">02</span>
		<span aria-hidden="true">—</span>
		<span>What you get</span>
	</h2>

	<div class="mt-6 lg:col-start-2 lg:row-start-3 lg:mt-24">
		<FeatureGrid />
	</div>

	<h2
		class="mt-24 flex gap-2 font-mono text-eyebrow uppercase text-fg-muted lg:col-start-1 lg:row-start-4"
	>
		<span aria-hidden="true">03</span>
		<span aria-hidden="true">—</span>
		<span>Supported frameworks</span>
	</h2>

	<div class="mt-6 lg:col-start-2 lg:row-start-4 lg:mt-24">
		<FrameworkRow />
	</div>
</div>
