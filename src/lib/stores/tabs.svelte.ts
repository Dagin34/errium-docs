const PREFIX = 'errium-tab:';

/**
 * Tab selection shared across every group with the same key, site-wide and
 * across reloads. Pick Flask on the install page and the quickstart is
 * already on Flask.
 *
 * Stored choices are loaded into reactive state once, on the client, by
 * `hydrate()`. Reading localStorage lazily from inside the getter does not
 * work: pages are prerendered, so the first read happens where localStorage
 * does not exist, and nothing the consuming `$derived` depends on changes
 * afterwards to make it recompute.
 */
const selections = $state<Record<string, string>>({});

let hydrated = false;

export const tabs = {
	/** Load every persisted choice into reactive state. Idempotent. */
	hydrate() {
		if (hydrated || typeof localStorage === 'undefined') return;

		try {
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (!key?.startsWith(PREFIX)) continue;
				const value = localStorage.getItem(key);
				if (value) selections[key.slice(PREFIX.length)] = value;
			}
		} catch {
			/* Private mode: fall back to in-memory defaults. */
		}

		hydrated = true;
	},

	get(group: string, fallback: string): string {
		return selections[group] ?? fallback;
	},

	set(group: string, value: string) {
		selections[group] = value;
		try {
			localStorage.setItem(PREFIX + group, value);
		} catch {
			/* Private mode: the choice still applies for this session. */
		}
	}
};
