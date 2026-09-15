<script lang="ts">
	import { Braces, Fingerprint, Plug, ShieldCheck, Sparkles } from 'lucide-svelte';
	import FeatureCard from './FeatureCard.svelte';

	const features = [
		{
			icon: Braces,
			title: 'Unified error format',
			body: 'Every API error response uses the exact same structured JSON contract, whatever threw it.'
		},
		{
			icon: Sparkles,
			title: 'Validation beautifier',
			body: 'Nested Pydantic output collapses into a flat, readable map of field to message.'
		},
		{
			icon: Fingerprint,
			title: 'Trace IDs',
			body: 'A fresh identifier per error, so a client-facing response maps to a server-side log line.'
		},
		{
			icon: ShieldCheck,
			title: 'Dev vs. prod mode',
			body: 'Tracebacks, exception names and hints in development; sealed internals in production.'
		},
		{
			icon: Plug,
			title: 'Extensible classifiers',
			body: 'Register your own domain exceptions with priority-based resolution.'
		}
	];
</script>

<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
	{#each features as feature (feature.title)}
		<FeatureCard icon={feature.icon} title={feature.title} body={feature.body} />
	{/each}
</div>
