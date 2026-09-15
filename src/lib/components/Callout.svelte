<script lang="ts">
	import { Info, Lightbulb, TriangleAlert } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'note' | 'warning' | 'tip';
		children: Snippet;
	}

	let { variant = 'note', children }: Props = $props();

	const icons = { note: Info, warning: TriangleAlert, tip: Lightbulb };
	const labels = { note: 'Note', warning: 'Warning', tip: 'Tip' };

	const Icon = $derived(icons[variant]);
</script>

<!--
	Monochrome by design: the variant is carried by the icon and a 1px left
	rule, never by a coloured background. The icon alone can't convey meaning,
	so the variant name is also exposed to screen readers.
-->
<aside class="my-6 flex gap-3 border-l pl-4">
	<span class="mt-1 shrink-0 text-fg-muted">
		<Icon size={16} aria-hidden="true" />
	</span>
	<div class="text-fg-muted [&>:first-child]:mt-0 [&>:last-child]:mb-0">
		<span class="sr-only">{labels[variant]}:</span>
		{@render children()}
	</div>
</aside>
