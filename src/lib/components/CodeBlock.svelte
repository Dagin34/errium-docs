<script lang="ts">
	import CopyButton from './CopyButton.svelte';

	interface Props {
		/** Pre-highlighted markup from `highlightToHtml`. */
		html: string;
		/** Raw source, used for copying. */
		code: string;
		filename?: string;
	}

	let { html, code, filename }: Props = $props();
</script>

<!--
	Mirrors the markup the MDsveX highlighter emits for fenced blocks, so a
	block written in .svelte and one written in .md are indistinguishable.
-->
<div class="group relative my-6 overflow-hidden rounded border bg-bg-subtle">
	{#if filename}
		<div class="border-b px-4 py-2 font-mono text-eyebrow text-fg-muted">{filename}</div>
	{/if}
	<div class="absolute right-2 top-2 z-10">
		<CopyButton text={code} />
	</div>
	{@html html}
</div>
