<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';
	import { SITE } from '$lib/config';
	import GithubMark from './GithubMark.svelte';
	import InstallCommand from './InstallCommand.svelte';
</script>

<section class="flex flex-col gap-8">
	<h1 class="text-hero text-fg">
		Every error your API returns looks the same, no matter what threw it.
	</h1>

	<p class="max-w-content text-fg-muted">
		Errium normalizes uncaught exceptions, HTTP exceptions and validation errors into one
		consistent, frontend-safe JSON response — across FastAPI, Flask, Django Ninja and Django
		REST Framework.
	</p>

	<InstallCommand />

	<div class="flex flex-wrap gap-3">
		<a
			href="/docs/quickstart"
			class="flex items-center gap-2 rounded border border-border-strong px-4 py-2 text-nav text-fg transition-colors duration-150 ease-out hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
		>
			Get started
			<ArrowRight size={14} aria-hidden="true" />
		</a>

		<a
			href={SITE.links.repo}
			class="flex items-center gap-2 rounded border px-4 py-2 text-nav text-fg-muted transition-colors duration-150 ease-out hover:border-border-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
		>
			<GithubMark size={14} />
			GitHub
		</a>
	</div>
</section>
