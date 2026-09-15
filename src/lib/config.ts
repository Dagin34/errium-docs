export const SITE = {
	name: 'errium',
	tagline: 'Every error your API returns looks the same, no matter what threw it.',
	description:
		'Errium normalizes uncaught exceptions, HTTP exceptions, and validation errors into one consistent, frontend-safe JSON response — across FastAPI, Flask, Django Ninja, and Django REST Framework.',

	/**
	 * Baked in at build time so the header badge renders immediately and never
	 * causes layout shift. Verified against pyproject.toml.
	 */
	versionFallback: '0.1.1',

	/** Where this site is served from. Used for canonical and og:url tags. */
	url: 'https://errium.dagmawi.et',

	links: {
		pypi: 'https://pypi.org/project/errium/',
		pypiJson: 'https://pypi.org/pypi/errium/json',
		repo: 'https://github.com/Dagin34/errium',
		issues: 'https://github.com/Dagin34/errium/issues',
		/** Replace once this site has its own repository. Separate from `url`
		 *  above: that is where the site is deployed, this is its source. */
		siteRepo: '<SVELTE_REPO_URL>'
	}
} as const;
