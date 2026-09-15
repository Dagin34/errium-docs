<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		icon: Component;
		title: string;
		body: string;
	}

	let { icon: Icon, title, body }: Props = $props();
</script>

<div class="flex flex-col gap-3 border-l pl-4">
	<span class="text-fg-muted">
		<Icon size={16} aria-hidden="true" />
	</span>
	<h3 class="text-h3 text-fg">{title}</h3>
	<p class="text-fg-muted">{body}</p>
</div>
