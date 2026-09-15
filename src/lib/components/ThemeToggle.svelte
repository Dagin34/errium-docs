<script lang="ts">
	import { Moon, Sun } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme.svelte';

	// The label names the action, not the current state.
	const label = $derived(
		theme.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
	);
</script>

<button
	type="button"
	aria-label={label}
	onclick={() => theme.toggle()}
	class="grid size-8 place-items-center rounded text-fg-muted transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
>
	{#if theme.current === 'dark'}
		<Sun size={16} aria-hidden="true" />
	{:else}
		<Moon size={16} aria-hidden="true" />
	{/if}
</button>
