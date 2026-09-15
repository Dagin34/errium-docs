const PREFIX = 'errium-tab:';

const selections = $state<Record<string, string>>({});

/**
 * Tab selection shared across every group with the same key, site-wide and
 * across reloads. Pick Flask on the install page and the quickstart is
 * already on Flask.
 */
export const tabs = {
	get(group: string, fallback: string): string {
		if (selections[group]) return selections[group];

		if (typeof localStorage !== 'undefined') {
			try {
				const stored = localStorage.getItem(PREFIX + group);
				if (stored) {
					selections[group] = stored;
					return stored;
				}
			} catch {
				/* Private mode: fall through to the in-memory default. */
			}
		}

		return fallback;
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
