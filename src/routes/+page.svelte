<script lang="ts">
	import { SITE } from '$lib/config';
</script>

<svelte:head>
	<title>{SITE.name} · {SITE.description}</title>
	<meta name="description" content={SITE.description} />
</svelte:head>

<h1 class="text-hero text-fg">{SITE.tagline}</h1>
