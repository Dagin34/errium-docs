<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getTabsContext } from './Tabs.svelte';

	interface Props {
		value: string;
		/** Position within the parent's tab list, for the aria wiring. */
		index: number;
		children: Snippet;
	}

	let { value, index, children }: Props = $props();

	const ctx = getTabsContext();
	const active = $derived(ctx.selected === value);
</script>

<div
	role="tabpanel"
	id={`${ctx.uid}-panel-${index}`}
	aria-labelledby={`${ctx.uid}-tab-${index}`}
	hidden={!active}
	class="[&>:first-child]:mt-0"
>
	{@render children()}
</div>
