<script lang="ts" module>
	import { getContext, setContext } from 'svelte';

	const KEY = Symbol('tabs');

	export interface TabsContext {
		readonly selected: string;
		readonly uid: string;
	}

	export function getTabsContext(): TabsContext {
		return getContext<TabsContext>(KEY);
	}

	export function setTabsContext(ctx: TabsContext) {
		setContext(KEY, ctx);
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tabs as store } from '$lib/stores/tabs.svelte';

	interface Props {
		/** Shared selection key, e.g. "framework" or "installer". */
		group: string;
		tabs: string[];
		children: Snippet;
	}

	let { group, tabs, children }: Props = $props();

	const uid = $props.id();

	// A stored value may name a tab this group doesn't have — fall back to the
	// first rather than rendering an empty panel.
	const selected = $derived.by(() => {
		const stored = store.get(group, tabs[0]);
		return tabs.includes(stored) ? stored : tabs[0];
	});

	setTabsContext({
		get selected() {
			return selected;
		},
		get uid() {
			return uid;
		}
	});

	let triggers = $state<HTMLButtonElement[]>([]);

	function onKeydown(event: KeyboardEvent, index: number) {
		const last = tabs.length - 1;
		let next: number | null = null;

		if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
		else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = last;

		if (next === null) return;
		event.preventDefault();
		store.set(group, tabs[next]);
		triggers[next]?.focus();
	}
</script>

<div class="my-6">
	<div role="tablist" class="flex gap-4 border-b">
		{#each tabs as tab, i (tab)}
			<button
				bind:this={triggers[i]}
				type="button"
				role="tab"
				id={`${uid}-tab-${i}`}
				aria-selected={selected === tab}
				aria-controls={`${uid}-panel-${i}`}
				tabindex={selected === tab ? 0 : -1}
				onclick={() => store.set(group, tab)}
				onkeydown={(e) => onKeydown(e, i)}
				class="-mb-px border-b px-2 py-2 text-nav transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg
					{selected === tab ? 'border-fg text-fg' : 'border-transparent text-fg-muted hover:text-fg'}"
			>
				{tab}
			</button>
		{/each}
	</div>

	{@render children()}
</div>
