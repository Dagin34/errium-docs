/**
 * One delegated handler for every code block inside `node`.
 *
 * Fenced blocks in .md are emitted as static HTML by the MDsveX highlighter,
 * so their copy buttons are already in the prerendered markup and reachable by
 * keyboard before this runs. This only adds the behaviour.
 */
export function copyCode(node: HTMLElement) {
	const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

	async function onClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const button = target?.closest<HTMLElement>('[data-copy]');
		if (!button || !node.contains(button)) return;

		const code = button.closest<HTMLElement>('[data-code]')?.dataset.code;
		if (!code) return;

		try {
			await navigator.clipboard.writeText(code);
		} catch {
			/* Clipboard unavailable (insecure origin, denied permission). */
			return;
		}

		const idle = button.querySelector<HTMLElement>('[data-copy-idle]');
		const done = button.querySelector<HTMLElement>('[data-copy-done]');
		if (!idle || !done) return;

		idle.hidden = true;
		done.hidden = false;
		button.setAttribute('aria-label', 'Copied');

		clearTimeout(timers.get(button));
		timers.set(
			button,
			setTimeout(() => {
				idle.hidden = false;
				done.hidden = true;
				button.setAttribute('aria-label', 'Copy code');
			}, 2000)
		);
	}

	node.addEventListener('click', onClick);

	return {
		destroy() {
			node.removeEventListener('click', onClick);
		}
	};
}
