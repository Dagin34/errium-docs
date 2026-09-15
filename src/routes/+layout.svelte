<script lang="ts">
	import { X } from 'lucide-svelte';
	import { page } from '$app/state';
	import '../app.css';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import SearchDialog from '$lib/components/SearchDialog.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import { theme } from '$lib/stores/theme.svelte';

	let { data, children } = $props();

	let drawerOpen = $state(false);
	let searchOpen = $state(false);
	let searchTrigger = $state<HTMLElement>();
	let menuButton = $state<HTMLElement>();

	// The landing page runs full-bleed; every other route gets the docs shell.
	const isLanding = $derived(page.url.pathname === '/');

	$effect(() => {
		// Reconcile the store with the attribute the pre-paint script stamped,
		// so the first toggle isn't a no-op for readers who chose light.
		theme.init();
	});

	$effect(() => {
		function onKeydown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				searchOpen = true;
			}

			if (event.key === 'Escape' && drawerOpen) {
				drawerOpen = false;
				menuButton?.focus();
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
</script>

<div class="min-h-dvh">
	<Header
		bind:menuButton
		{drawerOpen}
		onmenu={() => (drawerOpen = !drawerOpen)}
		onsearch={(trigger) => {
			searchTrigger = trigger;
			searchOpen = true;
		}}
	/>

	{#if isLanding}
		<main class="mx-auto w-full max-w-content px-6 py-24">
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

			<main class="min-w-0 flex-1 px-0 py-12 lg:px-12">
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
		onclick={(e) => e.target === e.currentTarget && (drawerOpen = false)}
		onkeydown={() => {}}
	>
		<div class="h-full w-sidebar overflow-y-auto border-r bg-bg px-6">
			<div class="flex justify-end py-3">
				<button
					type="button"
					onclick={() => {
						drawerOpen = false;
						menuButton?.focus();
					}}
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

<SearchDialog
	bind:open={searchOpen}
	trigger={searchTrigger}
	onclose={() => (searchOpen = false)}
/>
