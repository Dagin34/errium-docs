export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'errium-theme';

function createTheme() {
	let current = $state<Theme>('dark');

	return {
		get current(): Theme {
			return current;
		},

		/**
		 * Reconcile the store with the attribute the pre-paint script in app.html
		 * already stamped. Without this the store would always start on 'dark',
		 * so a reader who had persisted 'light' would find their first toggle a
		 * no-op. Called from the root layout.
		 */
		init() {
			if (typeof document === 'undefined') return;
			current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
		},

		toggle() {
			current = current === 'dark' ? 'light' : 'dark';
			document.documentElement.dataset.theme = current;
			try {
				localStorage.setItem(STORAGE_KEY, current);
			} catch {
				/* Private mode: the in-memory choice still applies for this session. */
			}
		}
	};
}

export const theme = createTheme();
