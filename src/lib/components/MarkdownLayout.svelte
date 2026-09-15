<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { copyCode } from '$lib/actions/copyCode';
	import { SITE } from '$lib/config';
	import { prevNext } from '$lib/nav-utils';
	import PrevNext from './PrevNext.svelte';

	interface Props {
		title: string;
		description: string;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();

	// From page data, not from $lib/nav directly — importing the glob here
	// would cycle back through the pages this layout renders.
	const siblings = $derived(prevNext(page.data.navGroups ?? [], page.url.pathname));
</script>

<svelte:head>
	<title>{title} · {SITE.name}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={`${title} · ${SITE.name}`} />
	<meta property="og:description" content={description} />
</svelte:head>

<article data-pagefind-body>
	<header class="mb-12">
		<h1 class="text-h1 text-fg">{title}</h1>
		<p class="mt-3 text-fg-muted">{description}</p>
	</header>

	<!--
		Markdown generates bare elements that can't carry classes of their own,
		so they're styled here with descendant variants. This keeps every style
		decision in the markup as a Tailwind utility rather than in a parallel
		hand-written stylesheet.
	-->
	<div
		use:copyCode
		class="text-body
			[&_a]:underline [&_a]:decoration-border-strong [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-150 [&_a]:ease-out hover:[&_a]:decoration-fg
			[&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-fg [&_a]:focus-visible:rounded-sm
			[&_blockquote]:my-6 [&_blockquote]:border-l [&_blockquote]:pl-4 [&_blockquote]:text-fg-muted
			[&_code:not(pre_code)]:rounded-sm [&_code:not(pre_code)]:border [&_code:not(pre_code)]:bg-bg-subtle [&_code:not(pre_code)]:px-1 [&_code:not(pre_code)]:font-mono [&_code:not(pre_code)]:text-[0.9em] [&_code:not(pre_code)]:break-words
			[&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-h2 [&_h2]:text-fg
			[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:scroll-mt-24 [&_h3]:text-h3 [&_h3]:text-fg
			[&_li]:text-fg-muted
			[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6
			[&_p]:mb-4 [&_p]:text-fg-muted
			[&_strong]:text-fg
			[&_table]:w-full [&_table]:text-left
			[&_td]:border-t [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_td]:text-fg-muted
			[&_th]:pb-2 [&_th]:pr-4 [&_th]:font-mono [&_th]:text-eyebrow [&_th]:uppercase [&_th]:text-fg-muted
			[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
	>
		{@render children()}
	</div>

	<PrevNext prev={siblings.prev} next={siblings.next} />
</article>

<style>
	/* Tables are the one thing that may exceed the measure, so each one gets
	   its own scroll container and the page never scrolls sideways. */
	article :global(table) {
		display: block;
		overflow-x: auto;
	}

	/* Numerals in data columns align when they're tabular. */
	article :global(td),
	article :global(th) {
		font-variant-numeric: tabular-nums;
	}
</style>
