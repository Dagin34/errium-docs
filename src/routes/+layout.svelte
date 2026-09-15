<script lang="ts">
	import { tick } from 'svelte';
	import { X } from 'lucide-svelte';
	import { page } from '$app/state';
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import SearchDialog from '$lib/components/SearchDialog.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import { tabs } from '$lib/stores/tabs.svelte';
	import { theme } from '$lib/stores/theme.svelte';

	let { data, children } = $props();

	let drawerOpen = $state(false);
	let searchOpen = $state(false);
	let menuButton = $state<HTMLElement>();
	let searchButton = $state<HTMLElement>();
	let drawerClose = $state<HTMLElement>();

	// The landing page runs full-bleed; every other route gets the docs shell.
	const isLanding = $derived(page.url.pathname === '/');

	$effect(() => {
		// Reconcile the store with the attribute the pre-paint script stamped,
		// so the first toggle isn't a no-op for readers who chose light.
		theme.init();
		// Load persisted tab choices into reactive state, so a framework picked
		// on one page is already selected on the next.
		tabs.hydrate();
	});

	/**
	 * Close the drawer and hand focus back to the button that opened it.
	 * The focus call has to wait for the DOM to update: until it does, the
	 * shell is still `inert`, and focusing an element inside an inert subtree
	 * silently does nothing.
	 */
	async function closeDrawer() {
		drawerOpen = false;
		await tick();
		menuButton?.focus();
	}

	$effect(() => {
		function onKeydown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				searchOpen = true;
			}

			if (event.key === 'Escape' && drawerOpen) {
				closeDrawer();
			}
		}

		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	// Keep the page behind the drawer from scrolling while it's open.
	$effect(() => {
		document.body.style.overflow = drawerOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	// Move focus into the drawer when it opens, so a keyboard user lands
	// inside it rather than at the top of an inert page.
	$effect(() => {
		if (drawerOpen) tick().then(() => drawerClose?.focus());
	});
</script>

<!--
	`inert` while the drawer is open takes everything behind the backdrop out
	of the tab order and the accessibility tree, so a keyboard or screen reader
	user can't reach content they can't see. It is what makes the drawer an
	actual modal rather than one that only looks like it.
-->
<div class="min-h-dvh" inert={drawerOpen || undefined}>
	<!--
		Lets keyboard and screen reader users jump the header and sidebar
		straight to the page content. Visually hidden until focused.
	-->
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:border focus:bg-bg-elevated focus:px-4 focus:py-2 focus:text-nav focus:text-fg"
	>
		Skip to content
	</a>

	<Header
		bind:menuButton
		bind:searchButton
		{drawerOpen}
		onmenu={() => (drawerOpen = !drawerOpen)}
		onsearch={() => (searchOpen = true)}
	/>

	{#if isLanding}
		<main id="main" tabindex="-1" class="mx-auto w-full max-w-content px-6 py-24">
			{@render children()}
		</main>
		<div class="mx-auto w-full max-w-content px-6">
			<Footer />
		</div>
	{:else}
		<div class="mx-auto flex w-full max-w-shell gap-0 px-6">
			<!-- Sidebar: a sticky column from 1024px up, a drawer below it. -->
			<aside
				class="sticky top-(--header-h) hidden h-(--below-header-h) w-sidebar shrink-0 overflow-y-auto border-r pr-6 lg:block"
			>
				<Sidebar groups={data.navGroups} />
			</aside>

			<main id="main" tabindex="-1" class="min-w-0 flex-1 px-0 py-12 lg:px-12">
				<div class="mx-auto w-full max-w-content">
					{@render children()}
					<Footer />
				</div>
			</main>

			<!-- On-this-page: only from 1280px up. -->
			<aside
				class="sticky top-(--header-h) hidden h-(--below-header-h) w-toc shrink-0 overflow-y-auto xl:block"
			>
				<TableOfContents />
			</aside>
		</div>
	{/if}
</div>

{#if drawerOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm lg:hidden"
		onclick={(e) => e.target === e.currentTarget && closeDrawer()}
		onkeydown={() => {}}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Navigation"
			class="h-full w-sidebar overflow-y-auto border-r bg-bg px-6"
		>
			<div class="flex justify-end py-3">
				<button
					bind:this={drawerClose}
					type="button"
					onclick={closeDrawer}
					aria-label="Close navigation"
					class="grid size-8 place-items-center rounded text-fg-muted transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
				>
					<X size={16} aria-hidden="true" />
				</button>
			</div>
			<Sidebar groups={data.navGroups} onnavigate={() => (drawerOpen = false)} />
		</div>
	</div>
{/if}

<!-- The trigger is the header button regardless of how the dialog was
     opened, so Esc always returns focus somewhere visible. -->
<SearchDialog
	bind:open={searchOpen}
	trigger={searchButton}
	onclose={() => (searchOpen = false)}
/>
