<script lang="ts">
	import { Menu, Package, Search } from 'lucide-svelte';
	import GithubMark from './GithubMark.svelte';
	import { SITE } from '$lib/config';
	import ThemeToggle from './ThemeToggle.svelte';
	import VersionBadge from './VersionBadge.svelte';

	interface Props {
		onmenu: () => void;
		onsearch: (trigger: HTMLElement) => void;
		drawerOpen: boolean;
		/** Exposed so the drawer can return focus here when it closes. */
		menuButton?: HTMLElement;
	}

	let { onmenu, onsearch, drawerOpen, menuButton = $bindable() }: Props = $props();

	let searchTrigger = $state<HTMLButtonElement>();
</script>

<header
	class="sticky top-0 z-40 border-b bg-bg/80 backdrop-blur-md"
>
	<div class="flex items-center gap-4 px-6 py-3">
		<button
			bind:this={menuButton}
			type="button"
			onclick={onmenu}
			aria-label="Open navigation"
			aria-expanded={drawerOpen}
			class="grid size-8 place-items-center rounded text-fg-muted transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg lg:hidden"
		>
			<Menu size={16} aria-hidden="true" />
		</button>

		<a
			href="/"
			class="font-mono font-semibold text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
		>
			{SITE.name}
		</a>

		<VersionBadge />

		<div class="flex-1"></div>

		<button
			bind:this={searchTrigger}
			type="button"
			onclick={() => searchTrigger && onsearch(searchTrigger)}
			aria-label="Search documentation"
			class="flex items-center gap-2 rounded border px-2 py-1 text-nav text-fg-muted transition-colors duration-150 ease-out hover:border-border-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
		>
			<Search size={14} aria-hidden="true" />
			<span class="hidden sm:inline">Search</span>
			<kbd class="hidden font-mono text-eyebrow text-fg-muted sm:inline">⌘K</kbd>
		</button>

		<a
			href={SITE.links.repo}
			aria-label="Errium on GitHub"
			class="grid size-8 place-items-center rounded text-fg-muted transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
		>
			<GithubMark size={16} />
		</a>

		<a
			href={SITE.links.pypi}
			aria-label="Errium on PyPI"
			class="grid size-8 place-items-center rounded text-fg-muted transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
		>
			<Package size={16} aria-hidden="true" />
		</a>

		<ThemeToggle />
	</div>
</header>
