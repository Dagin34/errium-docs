<script lang="ts">
	import { ArrowLeft, ArrowRight } from 'lucide-svelte';
	import type { PageMeta } from '$lib/types';

	interface Props {
		prev: PageMeta | null;
		next: PageMeta | null;
	}

	let { prev, next }: Props = $props();
</script>

{#if prev || next}
	<nav aria-label="Previous and next page" class="mt-24 flex gap-4 border-t pt-8">
		{#if prev}
			<a
				href={prev.href}
				class="flex flex-1 flex-col gap-1 rounded border p-4 transition-colors duration-150 ease-out hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
			>
				<span class="flex items-center gap-2 font-mono text-eyebrow uppercase text-fg-muted">
					<ArrowLeft size={12} aria-hidden="true" /> Previous
				</span>
				<span class="text-fg">{prev.title}</span>
			</a>
		{/if}

		{#if next}
			<a
				href={next.href}
				class="flex flex-1 flex-col items-end gap-1 rounded border p-4 text-right transition-colors duration-150 ease-out hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
			>
				<span class="flex items-center gap-2 font-mono text-eyebrow uppercase text-fg-muted">
					Next <ArrowRight size={12} aria-hidden="true" />
				</span>
				<span class="text-fg">{next.title}</span>
			</a>
		{/if}
	</nav>
{/if}
