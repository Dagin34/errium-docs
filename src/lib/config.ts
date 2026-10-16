export const SITE = {
	name: 'errium',
	tagline: 'Every error your API returns looks the same, no matter what threw it.',
	description:
		'Errium normalizes uncaught exceptions, HTTP exceptions, and validation errors into one consistent, frontend-safe JSON response — across FastAPI, Flask, Django Ninja, and Django REST Framework.',

	/**
	 * The version the badge shows. Baked in at build time so it renders
	 * immediately with no layout shift, and so it stays correct even when the
	 * live PyPI lookup cannot run — PyPI serves that JSON with
	 * `cache-control: max-age=900`, and the request can also be blocked by an
	 * extension or fail offline.
	 *
	 * This is the guarantee; the fetch is an enhancement on top of it. Bump it
	 * when tracking a release. Verified against pyproject.toml at v0.1.2.
	 */
	versionFallback: '0.2.0',

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
