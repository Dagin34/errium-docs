<script lang="ts">
	import { page } from '$app/state';
	import type { NavGroup } from '$lib/types';

	interface Props {
		groups: NavGroup[];
		/** Called after a link activates, so the mobile drawer can close itself. */
		onnavigate?: () => void;
	}

	let { groups, onnavigate }: Props = $props();

	const uid = $props.id();
</script>

<nav aria-label="Documentation" class="flex flex-col gap-8 py-8">
	{#each groups as group (group.label)}
		<div>
			<!--
				The numbered motif. The numeral hangs in the left margin rather
				than prefixing the label inline, so the indices read as structural
				markers down the edge of the nav.

				Deliberately not a heading: these label nav groups, not document
				sections. As headings they would sit above the page's own h1 in
				the outline, so anyone navigating by heading would pass five nav
				labels before reaching the page title. The list is associated
				with its label through aria-labelledby instead.
			-->
			<p
				id={`${uid}-${group.index}`}
				class="mb-3 flex gap-2 font-mono text-eyebrow uppercase text-fg-muted"
			>
				<span aria-hidden="true">{group.index}</span>
				<span aria-hidden="true">—</span>
				<span>{group.label}</span>
			</p>

			<ul aria-labelledby={`${uid}-${group.index}`}>
				{#each group.pages as item (item.href)}
					{@const active = page.url.pathname === item.href}
					<li>
						<!--
							The hairline is the interaction surface: the active page
							promotes its own left rule to full contrast. No background
							pill, which keeps the nav monochrome and quiet.
						-->
						<a
							href={item.href}
							aria-current={active ? 'page' : undefined}
							onclick={onnavigate}
							class="block border-l py-2 pl-4 text-nav transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg
								{active ? 'border-fg text-fg' : 'text-fg-muted hover:border-border-strong hover:text-fg'}"
						>
							{item.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
