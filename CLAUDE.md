# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The public documentation site for [Errium](https://github.com/Dagin34/errium), a Python error-normalization library. Deployed at **https://errium.dagmawi.et**.

This repo contains **only the site**. The library lives in a separate repository, and that repository is the source of truth for everything the docs describe.

**Stack:** SvelteKit 2 · Svelte 5 (runes) · TypeScript · Tailwind CSS v4 · MDsveX · Shiki · Pagefind · `@sveltejs/adapter-vercel`. Every route is prerendered to static HTML.

**Read [DESIGN.md](DESIGN.md) before touching anything visual.** It is the normative design spec: tokens, named rules, and the do's and don'ts. The original brief is in [specs/2026-09-15-svelte-docs-site-prompt.md](specs/2026-09-15-svelte-docs-site-prompt.md) and its design decisions are locked — don't reopen them.

---

## Release tracking (check this every time)

**The version badge does not take care of itself.** `SITE.versionFallback` in [src/lib/config.ts](src/lib/config.ts) is baked in at build time and is what the badge actually guarantees. The live PyPI lookup is an enhancement layered on top and can silently fail to help:

- PyPI serves that JSON with `cache-control: max-age=900`, and Fastly caches at the edge, so a browser can be answered with a stale version across reloads. The fetch sends `cache: 'no-cache'` to force revalidation, but it is still a network request.
- The request can be blocked by an extension, fail offline, or be unavailable with JS disabled.
- By design (per the brief) **the fetch fails silently and never shows an error state**, so a failure is invisible. It cannot be relied on as the correctness mechanism.

This already bit us once: 0.1.2 shipped and the badge kept showing 0.1.1 because the constant was never bumped.

**So: whenever you work in this repo, verify the fallback still matches the published version.**

```bash
# What the site claims:
grep versionFallback src/lib/config.ts

# What PyPI actually has:
curl -s https://pypi.org/pypi/errium/json | python -c "import json,sys; print(json.load(sys.stdin)['info']['version'])"
```

If they differ, bump `versionFallback`, and check whether the release also needs content changes (see below). Treat a mismatch as a bug, not a nit.

## Tracking a library release

When the library publishes a new version, **diff the library repo rather than guessing** what changed:

```bash
git clone https://github.com/Dagin34/errium.git /tmp/errium-src && cd /tmp/errium-src
git diff --stat v<previous>..v<new>
git diff --stat v<previous>..v<new> -- src/   # empty = no API change, no content churn needed
```

Then work through:

1. `src/` unchanged? Every documented API name, category value, status code, classifier priority and code sample still holds. **Don't churn content that didn't change.**
2. `src/` changed? Re-read the affected modules and update the Concepts / Frameworks / Architecture pages against the source, not against memory.
3. `CHANGELOG.md` → add the entry to [src/routes/changelog/+page.md](src/routes/changelog/+page.md).
4. `pyproject.toml` → check `requires-python`, the extras list, and classifiers against the Installation page.
5. `.github/workflows/ci.yml` → check the Python matrix against the Roadmap and Testing pages.
6. `README.md` / `CONTRIBUTING.md` / `ARCHITECTURE.md` → check for claims that are now stale on our side. (0.1.2 retired the MkDocs site, which made a paragraph on `/contributing` actively wrong.)
7. Bump `versionFallback`.

**Never invent an API name, signature, or behaviour.** Everything documented must be traceable to something actually read in the library repo.

---

## Architecture notes

These are all load-bearing and were each a bug first. Don't undo them.

**Runes are scoped per file.** MDsveX's layout wrapper passes `$$props`, which runes mode rejects, so `svelte.config.js` disables runes for `.md` only. Every `.svelte` file we author is still runes mode.

**The MDsveX layout path must be absolute.** MDsveX reads the layout from disk (resolved against cwd) and then emits the *same string* as an import specifier inside each `.md` file, so a relative path resolves against the page and `$lib` isn't resolvable at read time. `mdsvex.config.js` builds an absolute path with forward slashes.

**`$lib/nav.ts` may only be imported by `src/routes/+layout.ts`.** It globs every `+page.md`, and those pages render `MarkdownLayout`, so importing it from a component creates a cycle and the glob'd modules read as `undefined`. Components take the finished groups from `page.data` and derive with the pure helpers in `nav-utils.ts`. `sitemap.xml/+server.ts` is its own entry point, so it may import it safely.

**Shiki runs at build time only.** Fenced blocks go through `mdsvex.config.js`; snippets in `.svelte` are highlighted in a `+page.server.ts` load. Both share `$lib/shiki.js`, so a block authored in `.md` and one in `.svelte` render identical chrome. Keep Shiki out of the client bundle.

**The Shiki → token bridge.** Shiki's css-variables theme emits `--syn-token-*`; our design tokens are `--syn-*`. `app.css` maps between them. Adding a language may surface a token name that needs bridging.

**Code-block chrome is assembled as utility strings** in `mdsvex.config.js` and `$lib/shiki.js`, so `app.css` has `@source` directives pointing at both. If Tailwind stops generating a class used in generated markup, that's why.

**Pagefind indexes `.vercel/output/static`,** not `build/` — that's where adapter-vercel puts prerendered HTML. It only works against a real build; search is dead under `npm run dev`.

**Prerendering is what keeps the Windows build working.** adapter-vercel symlinks additional route functions, which Windows blocks without elevation. With every route prerendered there is only one function and no symlink. Don't remove `prerender = true` from the root layout.

---

## Working on the site

### Content

Pages are `.md` at `src/routes/**/+page.md`. Frontmatter is `title`, `description`, `group`, `order`. **The sidebar generates from frontmatter** — adding a page is adding one file; never hand-maintain nav.

### Verify before claiming done

```bash
npm run build     # must be clean; expect 22 HTML files + sitemap.xml
find .vercel/output/static -name "*.html" | wc -l
```

The constraint greps — all must return nothing:

```bash
grep -rn "dark:" src --include=*.svelte --include=*.css --include=*.md | grep -v shadow
grep -rn "@apply" src/lib src/routes
grep -rnoE '\b[a-z-]+-\[[^]]+\]' src --include=*.svelte | grep -v 'text-\[0\.9em\]' | grep -vE '\[&'
```

For anything visual, check in a real browser at **390 / 768 / 1280 / 1600** in **both themes**: no horizontal scroll, valid heading outline (starts at `h1`, no skips), interactive targets ≥24px, no `fg-subtle`/`fg-faint` on text. Don't assert a measurement you didn't take.

**Note:** the preview server locks `.vercel/output` on Windows and the next build fails with `EPERM`. Stop it before rebuilding.

---

## Git Workflow

### Commit size

Prefer small, logically scoped commits. As a rough guide, keep commits under ~10-15 files; if a change spans more than that (e.g. design-token changes + the layout shell + content pages together), split it into separate commits by concern — tokens and `app.css` first, then components, then the content pages that consume them. Avoid bulk commits that bundle unrelated components, routes, or content pages together.

### Commit message conventions

- Start every message with a category prefix, capitalized, followed by a dash and a space:
  - `Feature - ` for new functionality
  - `Bug - ` for bug fixes
  - `Refactor - ` for internal restructuring with no behavior change
  - `Test - ` for test-only additions or fixes
  - `Chore - ` for config, deps, tooling, docs
- After the prefix, use well-capitalized, grammatically correct sentences.
- Keep messages concise — max 2 lines total. No bullet lists, no verbose explanations.
- Example: `Feature - Add persistent framework tabs to the docs shell`

### Push restriction

Claude may commit freely when it judges a commit boundary has been reached, following the rules above. **Claude must never push commits to the remote on its own.** Only push when explicitly told, e.g. "let's push the changes and move to new features." Committing locally is fine at any time; pushing requires explicit instruction every time.
