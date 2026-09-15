<script lang="ts">
	interface Props {
		without: string;
		withErrium: string;
	}

	let { without, withErrium }: Props = $props();

	const states = [
		{ id: 'without', label: 'Without Errium' },
		{ id: 'with', label: 'With Errium' }
	] as const;

	let selected = $state<'without' | 'with'>('without');

	const uid = $props.id();

	let triggers = $state<HTMLButtonElement[]>([]);

	function onKeydown(event: KeyboardEvent, index: number) {
		let next: number | null = null;

		if (event.key === 'ArrowRight') next = index === 1 ? 0 : 1;
		else if (event.key === 'ArrowLeft') next = index === 0 ? 1 : 0;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = 1;

		if (next === null) return;
		event.preventDefault();
		selected = states[next].id;
		triggers[next]?.focus();
	}
</script>

<div class="overflow-hidden rounded-lg border bg-bg-subtle">
	<div role="tablist" aria-label="Response comparison" class="flex border-b">
		{#each states as state, i (state.id)}
			<button
				bind:this={triggers[i]}
				type="button"
				role="tab"
				id={`${uid}-tab-${i}`}
				aria-selected={selected === state.id}
				aria-controls={`${uid}-panel`}
				tabindex={selected === state.id ? 0 : -1}
				onclick={() => (selected = state.id)}
				onkeydown={(e) => onKeydown(e, i)}
				class="-mb-px border-b px-4 py-3 font-mono text-eyebrow uppercase transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg
					{selected === state.id ? 'border-fg text-fg' : 'border-transparent text-fg-muted hover:text-fg'}"
			>
				{state.label}
			</button>
		{/each}
	</div>

	<!--
		Both payloads occupy the same grid cell, so the container is always as
		tall as the longer one and switching never reflows the page. The hidden
		one keeps its space but is removed from the accessibility tree.
	-->
	<div
		role="tabpanel"
		id={`${uid}-panel`}
		aria-labelledby={`${uid}-tab-${selected === 'without' ? 0 : 1}`}
		class="stack"
	>
		<div
			class="transition-opacity duration-150 ease-out {selected === 'without'
				? 'opacity-100'
				: 'pointer-events-none opacity-0'}"
			aria-hidden={selected !== 'without'}
		>
			{@html without}
		</div>

		<div
			class="transition-opacity duration-150 ease-out {selected === 'with'
				? 'opacity-100'
				: 'pointer-events-none opacity-0'}"
			aria-hidden={selected !== 'with'}
		>
			{@html withErrium}
		</div>
	</div>
</div>

<style>
	.stack {
		display: grid;
	}

	.stack > * {
		grid-area: 1 / 1;
	}
</style>
