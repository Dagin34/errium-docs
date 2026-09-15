<script lang="ts">
	import CopyButton from './CopyButton.svelte';

	interface Props {
		command?: string;
	}

	let { command = 'pip install errium' }: Props = $props();
</script>

<div
	class="group flex items-center gap-3 rounded border bg-bg-subtle px-4 py-3 font-mono text-code"
>
	<!-- Decorative: not announced, and not part of what gets copied. -->
	<span aria-hidden="true" class="select-none text-fg-muted">$</span>
	<code class="flex-1 text-fg">{command}</code>
	<CopyButton text={command} what="install command" />
</div>
