<script lang="ts">
	import { SITE } from '$lib/config';

	// Starts at the build-time constant so the badge has its final width on
	// first paint and never shifts layout.
	let version = $state(SITE.versionFallback);

	$effect(() => {
		let cancelled = false;

		(async () => {
			try {
				const res = await fetch(SITE.links.pypiJson);
				if (!res.ok) return;
				const data = await res.json();
				if (!cancelled && data?.info?.version) version = data.info.version;
			} catch {
				// Keep the fallback silently. A version badge is never worth an
				// error state.
			}
		})();

		return () => {
			cancelled = true;
		};
	});
</script>

<a
	href={SITE.links.pypi}
	class="rounded-sm border px-2 py-1 font-mono text-eyebrow text-fg-muted transition-colors duration-150 ease-out hover:border-border-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
>
	v{version}
</a>
