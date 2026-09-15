<script lang="ts">
	import { Check, Copy } from 'lucide-svelte';

	interface Props {
		text: string;
		/** Describes what is being copied, e.g. "code" or "install command". */
		what?: string;
	}

	let { text, what = 'code' }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 2000);
		} catch {
			/* Clipboard unavailable (insecure origin, denied permission). */
		}
	}
</script>

<!--
	Revealed on hover for pointer users but never removed from the document,
	so it stays in the tab order for keyboard users.
-->
<button
	type="button"
	onclick={copy}
	aria-label={copied ? 'Copied' : `Copy ${what}`}
	class="grid size-8 place-items-center rounded-sm border bg-bg-subtle text-fg-muted transition-colors duration-150 ease-out pointer-fine:opacity-0 group-hover:opacity-100 hover:border-border-strong hover:text-fg focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
>
	{#if copied}
		<Check size={14} aria-hidden="true" />
	{:else}
		<Copy size={14} aria-hidden="true" />
	{/if}
</button>
