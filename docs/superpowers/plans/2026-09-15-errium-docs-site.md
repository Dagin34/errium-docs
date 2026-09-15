# Errium Documentation Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public Errium documentation site — 22 prerendered pages, ~15 components, monochrome design system, ⌘K search — at a level of craft that reads as considered infrastructure documentation rather than a templated docs theme.

**Architecture:** SvelteKit with every route prerendered to static HTML. Content is `.md` files at `src/routes/**/+page.md` compiled by MDsveX, so adding a page means adding one file and routing comes free. The sidebar is generated at build time from page frontmatter via `import.meta.glob`, never hand-maintained. Shiki highlights at build time and emits CSS custom properties, so code blocks re-theme with the rest of the site from a single rendered copy. Theming is one layer of semantic CSS variables mapped into Tailwind with `@theme inline`, so `bg-bg` / `text-fg-muted` resolve correctly in both themes with no `dark:` variant anywhere.

**Tech Stack:** SvelteKit 2.70 · Svelte 5 (runes) · TypeScript · Tailwind CSS v4 (`@tailwindcss/vite`) · MDsveX 0.12 · Shiki 4 · Pagefind 1.5 · lucide-svelte · `@fontsource-variable/geist` + `geist-mono` · `@sveltejs/adapter-vercel`

**Spec:** `specs/2026-09-15-svelte-docs-site-prompt.md`

**Source of truth for all documented facts:** the cloned Errium repository. A verified read of it is summarised in the spec's Content Appendix. Where the two disagree, the repository wins.

---

## Global Constraints

Every task's requirements implicitly include this section.

**Design tokens**

- No chromatic accent colour anywhere in the UI. All hierarchy comes from the neutral ramp and hairline borders.
- Links are distinguished by underline, never by colour.
- Dark is the default theme; light is the opt-in override via `[data-theme="light"]`.
- The complete token layer lives in `src/app.css` and nowhere else.

**Tailwind usage**

- Never use an arbitrary value (`text-[#EDEDED]`, `p-[13px]`) where a theme token exists. If you reach for one, add the missing token instead.
- The single sanctioned arbitrary value on the entire site is inline code sizing: `font-mono text-[0.9em]`.
- `@apply` is allowed in `@layer base` for element defaults and nowhere else. Repeated patterns become Svelte components, not `@apply` bundles.
- No `dark:` variants for colour. `dark:` is acceptable only for a genuine per-theme structural difference such as a code-block shadow.

**Spacing** — Tailwind's 4px scale restricted to `1, 2, 3, 4, 6, 8, 12, 16, 24` (4, 8, 12, 16, 24, 32, 48, 64, 96px). Nothing else.

**Radius** — `rounded-sm` (4px), `rounded` (6px), `rounded-lg` (8px). No `rounded-full` outside dots and avatars.

**Borders** — always `border` (1px) in `border-border`; `border-border-strong` only on hover/focus. A bare `border` / `border-b` is already the right colour because `@layer base` sets the global default.

**Motion** — `transition-colors duration-150 ease-out` for hover, 200ms for the theme transition. The global `prefers-reduced-motion` guard in `app.css` is the only one; never hand-roll a second per component.

**Sections are separated by space, not rules.** `<hr>` should appear essentially never.

**Type** — the hero is the **only** place type goes above 30px; resist scaling anything else up. Weight jumps to 600 **only for headings**, never for emphasis in body copy — express emphasis as `--fg` against `--fg-muted` instead. Comments in code blocks are the only italic on the site.

**Not in scope** (spec §7.4) — do not build any of these, and do not let them creep in: edit-on-GitHub links, last-updated timestamps, versioned docs, i18n, a blog, comments, analytics. Do not invoke the `dataviz` skill; there are no charts on this site.

**Accessibility floor (non-negotiable)**

- Every interactive element gets `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg`.
- Every icon-only button gets an `aria-label`.
- `--fg-subtle` and `--fg-faint` FAIL WCAG AA for small text (3.2–3.9:1 and ~2:1 respectively, measured). They may only be used for non-text decoration. Nav labels, eyebrows and all body copy use `--fg` or `--fg-muted`.
- Every Lucide icon gets an explicit `size` so it renders at fixed dimensions and cannot shift layout.

**Content integrity**

- Do not invent API names, signatures or behaviour. Everything documented must be traceable to the repository or the Content Appendix.
- No placeholder or lorem text anywhere. `<SVELTE_REPO_URL>` is the single exception and lives only in `src/lib/config.ts`.
- Do not copy the repo's `.md` files verbatim — restructure into the 22-page IA.

**Canonical links** — PyPI `https://pypi.org/project/errium/` · library repo `https://github.com/Dagin34/errium` · this site's repo `<SVELTE_REPO_URL>` (placeholder).

### Verified facts (read from the repository, 2026-09-15)

- Version for the `VersionBadge` build-time fallback: **`0.1.1`**.
- Requires Python **3.11+**; `pyproject.toml` classifiers list 3.11, 3.12, 3.13; CI matrixes 3.11 and 3.12 only.
- Extras are exactly `flask`, `ninja`, `drf`. Base install ships core + FastAPI adapter.
- `ErrorCategory` is a `StrEnum` whose **members** are `VALIDATION, AUTHENTICATION, AUTHORIZATION, NOT_FOUND, DUPLICATE, DATABASE, INTERNAL` and whose **values** are `VALIDATION_ERROR, AUTHENTICATION_ERROR, AUTHORIZATION_ERROR, RESOURCE_NOT_FOUND, DUPLICATE_RESOURCE, DATABASE_ERROR, INTERNAL_SERVER_ERROR`. The `code` field carries the value.
- Status→category table: 401→`AUTHENTICATION_ERROR`, 403→`AUTHORIZATION_ERROR`, 404→`RESOURCE_NOT_FOUND`, 409→`DUPLICATE_RESOURCE`, 422→`VALIDATION_ERROR`, everything else→`INTERNAL_SERVER_ERROR`.
- Classifier priorities: `ValidationExceptionClassifier` 150, `DatabaseExceptionClassifier` 140, adapter classifiers 200, adapter *validation* classifiers 210. Ties default to 100. `GenericExceptionClassifier` has **no** priority property — it is the fallback, outside the sorted list.
- `DefaultFormatter` emits `success, status_code, code, message, trace_id, timestamp, details`; adds `debug` only when `ERRIUM_DEBUG` is truthy. The debug block keys are `exception`, `message`, `stack_trace`, `hints` (`hints` is a **list of strings**).
- Production sanitization: `status_code >= 500` has `code`/`message` replaced with `INTERNAL_SERVER_ERROR` / "An unexpected error occurred."
- `ERRIUM_DEBUG` is truthy for `"true"`, `"1"`, `"yes"` (case-insensitive), read at import time.

### Three corrections to the spec's Content Appendix

These are verified against source — apply them.

1. `ErriumFlask` also supports the app-factory pattern: `errium = ErriumFlask()` then `errium.init_app(app)`. Document on the Flask page.
2. The DRF adapter builds its `ClassificationEngine` **once at module import** (module-level `_engine`), unlike the other three which build per instance or per call. Sharpen the "every entry point builds its own engine" warning accordingly.
3. `DRFValidationErrorClassifier` passes through `exc.status_code` rather than hardcoding 400 — the 400 is DRF's own default, not an Errium constant.

---

## File Structure

```
mdsvex.config.js              MDsveX + Shiki build-time highlighting
svelte.config.js              extensions ['.svelte','.md'], preprocess, adapter-vercel
vite.config.ts                tailwindcss() + sveltekit()
package.json                  scripts incl. postbuild pagefind

src/app.css                   THE token layer: themes, @theme inline, base, shiki bridge
src/app.html                  pre-paint theme script (no flash)

src/lib/config.ts                  canonical URLs, version fallback, site metadata
src/lib/nav.ts                     sidebar generation from frontmatter
src/lib/types.ts                   PageMeta, NavGroup
src/lib/stores/theme.svelte.ts     theme rune store + localStorage
src/lib/stores/tabs.svelte.ts      cross-site tab selection persistence

src/lib/components/
  CodeBlock.svelte    Tabs.svelte        TabPanel.svelte   Callout.svelte
  Sidebar.svelte      TableOfContents.svelte               SearchDialog.svelte
  ThemeToggle.svelte  VersionBadge.svelte                  BeforeAfter.svelte
  PrevNext.svelte     FeatureGrid.svelte FeatureCard.svelte
  FrameworkRow.svelte Hero.svelte        InstallCommand.svelte
  Header.svelte       Footer.svelte      CopyButton.svelte
  MarkdownLayout.svelte

src/routes/
  +layout.svelte      shell: header, sidebar, content, TOC, footer
  +layout.ts          export const prerender = true
  +page.svelte        landing
  docs/+page.md ... docs/trace-ids/+page.md                (10 pages)
  architecture/+page.md ... architecture/testing/+page.md  (4 pages)
  roadmap/+page.md  contributing/+page.md  changelog/+page.md
```

---

### Task 1: Token layer, fonts, and theme without flash

**Files:**

- Modify: `src/app.css`
- Modify: `src/app.html`
- Create: `src/lib/stores/theme.svelte.ts`
- Create: `src/lib/components/ThemeToggle.svelte`

**Interfaces:**

- Produces: `theme` store exporting `current: 'dark'|'light'`, `toggle()`, `init()`. Tailwind utilities `bg-bg`, `bg-bg-subtle`, `bg-bg-elevated`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-fg-faint`, `border-border`, `border-border-strong`, and text tokens `text-hero|h1|h2|h3|body|nav|code|eyebrow`.

- [ ] **Step 1: Write `src/app.css`** — the complete and only theme layer.

Use the spec §3.2 block verbatim **except** these three contrast corrections. The spec explicitly invited concrete token improvements; these were measured and the originals fail WCAG AA:

| Token | Spec value | Use this | Measured |
|---|---|---|---|
| dark `--syn-comment` | `#5A5A5A` | `#848484` | 2.87:1 → 4.84:1 |
| light `--syn-comment` | `#9A9A9A` | `#6B6B6B` | 2.58:1 → 4.89:1 |
| light `--syn-punctuation` | `#8A8A8A` | `#6E6E6E` | 3.17:1 → 4.68:1 |

Import the fonts at the very top, above `@import "tailwindcss"`:

```css
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";
@import "tailwindcss";
```

Add these three layout tokens inside `@theme inline`. The spec fixes these dimensions, and without tokens the shell would need arbitrary values like `max-w-[720px]`, which the Task 13 audit forbids:

```css
  --container-content: 720px;  /* -> max-w-content */
  --container-sidebar: 240px;  /* -> w-sidebar    */
  --container-toc:     200px;  /* -> w-toc        */
```

Append the Shiki bridge and the italic-comment rule below `@theme inline`. Shiki's css-variables theme emits its own variable names; this maps them onto the spec's token names so the spec's names stay the source of truth:

```css
/* Shiki css-variables theme -> our tokens. Shiki emits --syn-token-*; the
   design tokens above are --syn-*. This is the bridge between them. */
:root {
  --syn-background:              transparent;
  --syn-foreground:              var(--syn-plain);
  --syn-token-keyword:           var(--syn-keyword);
  --syn-token-string:            var(--syn-string);
  --syn-token-string-expression: var(--syn-string);
  --syn-token-comment:           var(--syn-comment);
  --syn-token-constant:          var(--syn-number);
  --syn-token-function:          var(--syn-plain);
  --syn-token-parameter:         var(--syn-plain);
  --syn-token-punctuation:       var(--syn-punctuation);
  --syn-token-link:              var(--syn-keyword);
  --syn-token-inserted:          var(--syn-plain);
  --syn-token-deleted:           var(--syn-plain);
  --syn-token-changed:           var(--syn-plain);
}

/* Comments are the only italic on the site. */
.shiki span[style*="--syn-token-comment"] { font-style: italic; }
```

- [ ] **Step 2: Create the theme store** `src/lib/stores/theme.svelte.ts`

```ts
type Theme = 'dark' | 'light';
const STORAGE_KEY = 'errium-theme';

function createTheme() {
	let current = $state<Theme>('dark');

	return {
		get current() {
			return current;
		},
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
				/* private mode — the in-memory value still applies for this session */
			}
		}
	};
}

export const theme = createTheme();
```

- [ ] **Step 3: Add the pre-paint script to `src/app.html`**

Inside `<head>`, before `%sveltekit.head%`. Dark is the default, so only an explicit `light` choice stamps the attribute:

```html
<script>
	try {
		if (localStorage.getItem('errium-theme') === 'light') {
			document.documentElement.dataset.theme = 'light';
		}
	} catch (e) {}
</script>
```

- [ ] **Step 4: Build `ThemeToggle.svelte`**

Lucide `Sun` / `Moon` at `size={16}`. The `aria-label` reflects the **action**, not the state — "Switch to light theme" while dark is active. Standard focus ring. `transition-colors duration-150 ease-out`.

**`theme.init()` must be called from `+layout.svelte` in `$effect` / `onMount`** (wired in Task 5, Step 7). The inline script in Step 3 sets the DOM attribute before paint, but the store still defaults to `dark`. Without `init()` reconciling the store against the DOM, a reader who had persisted *light* would find their first toggle click a no-op — the store would flip `dark → light` and re-apply the theme already showing.

- [ ] **Step 5: Verify no flash and both themes render**

Run `npm run dev`, load a page, toggle, then hard-reload.
Expected: the chosen theme paints on the first frame, with no white flash in either direction.

- [ ] **Step 6: Commit**

```bash
git add src/app.css src/app.html src/lib/stores/theme.svelte.ts src/lib/components/ThemeToggle.svelte
git commit -m "feat(design): token layer, self-hosted Geist, flash-free theming"
```

---

### Task 2: Site config and frontmatter-driven navigation

**Files:**

- Create: `src/lib/config.ts`, `src/lib/types.ts`, `src/lib/nav.ts`

**Interfaces:**

- Produces: `SITE` config object; `PageMeta { title, description, group, order, href }`; `NavGroup { index, label, pages }`; `getNavGroups(): NavGroup[]`; `getFlatPages(): PageMeta[]`; `getPrevNext(href): { prev, next }`.

- [ ] **Step 1: `src/lib/config.ts`** — the one place the placeholder lives.

```ts
export const SITE = {
	name: 'errium',
	description: 'Every error your API returns looks the same, no matter what threw it.',
	/** Baked at build time so the badge never causes layout shift. Verified from pyproject.toml. */
	versionFallback: '0.1.1',
	links: {
		pypi: 'https://pypi.org/project/errium/',
		pypiJson: 'https://pypi.org/pypi/errium/json',
		repo: 'https://github.com/Dagin34/errium',
		/** Replace once this site has its own repository. */
		siteRepo: '<SVELTE_REPO_URL>'
	}
} as const;
```

- [ ] **Step 2: `src/lib/types.ts`**

```ts
export interface PageMeta {
	title: string;
	description: string;
	group: string;
	order: number;
	href: string;
}

export interface NavGroup {
	/** Zero-padded display index, e.g. "01". */
	index: string;
	label: string;
	pages: PageMeta[];
}
```

- [ ] **Step 3: `src/lib/nav.ts`** — the sidebar is generated here and never hand-maintained.

Group order is fixed and defines the numbered motif. Page order inside a group comes from frontmatter `order`.

```ts
import type { PageMeta, NavGroup } from './types';

const GROUP_ORDER = [
	'Getting Started',
	'Frameworks',
	'Concepts',
	'Architecture',
	'Project'
] as const;

interface FrontmatterModule {
	metadata: Omit<PageMeta, 'href'>;
}

const modules = import.meta.glob<FrontmatterModule>('../routes/**/+page.md', {
	eager: true
});

function hrefFor(path: string): string {
	const route = path.replace('../routes', '').replace('/+page.md', '');
	return route === '' ? '/' : route;
}

export function getNavGroups(): NavGroup[] {
	const pages: PageMeta[] = Object.entries(modules).map(([path, mod]) => ({
		...mod.metadata,
		href: hrefFor(path)
	}));

	return GROUP_ORDER.map((label, i) => ({
		index: String(i + 1).padStart(2, '0'),
		label,
		pages: pages.filter((p) => p.group === label).sort((a, b) => a.order - b.order)
	})).filter((g) => g.pages.length > 0);
}

export function getFlatPages(): PageMeta[] {
	return getNavGroups().flatMap((g) => g.pages);
}

export function getPrevNext(href: string) {
	const flat = getFlatPages();
	const i = flat.findIndex((p) => p.href === href);
	return {
		prev: i > 0 ? flat[i - 1] : null,
		next: i >= 0 && i < flat.length - 1 ? flat[i + 1] : null
	};
}
```

- [ ] **Step 4: Verify**

Temporarily log `getNavGroups()` in the layout during `npm run dev`.
Expected: five groups in the fixed order, each page sorted by `order`, `href` values matching real routes. Remove the log afterwards.

- [ ] **Step 5: Commit**

```bash
git add src/lib/config.ts src/lib/types.ts src/lib/nav.ts
git commit -m "feat(nav): frontmatter-driven navigation and site config"
```

---

### Task 3: CodeBlock, CopyButton, Callout

**Files:**

- Create: `src/lib/components/CopyButton.svelte`, `CodeBlock.svelte`, `Callout.svelte`

**Interfaces:**

- Produces: `<CodeBlock filename?: string>` wrapping highlighted markup; `<Callout variant: 'note'|'warning'|'tip'>`.

- [ ] **Step 1: `CopyButton.svelte`**

Props: `text: string`. Behaviour: `navigator.clipboard.writeText`, then a transient "Copied" state for 2000ms.

It must be **always present for keyboard users** and merely revealed on hover for pointer users. Implement with `opacity-0 group-hover:opacity-100 focus-visible:opacity-100` — never `hidden` or `display:none`, which would remove it from the tab order. `aria-label="Copy code"`, switching to `aria-label="Copied"` in the copied state. Lucide `Copy` / `Check` at `size={14}`.

- [ ] **Step 2: `CodeBlock.svelte`**

Props: `filename?: string`, `highlight?: number[]`. Renders an optional header bar (mono, `text-eyebrow`, `text-fg-muted`, `border-b`) above the code. The whole thing in `border rounded overflow-hidden bg-bg-subtle`, with the code area `overflow-x-auto` so it never scrolls the page. Root carries `class="group relative"` so the copy button reveals on hover; button absolutely positioned top-right.

**Optional line highlighting** (spec §5.1): when `highlight` is provided, mark those 1-indexed lines. Shiki wraps each line in `<span class="line">`, so apply a `bg-bg-elevated` band plus a 1px left rule in `--border-strong` to the listed lines via a `:global(.line:nth-child(n))` rule generated from the prop. Because the highlight is purely visual, the emphasis must not be the only signal — reserve it for lines the surrounding prose already calls out by name.

- [ ] **Step 3: `Callout.svelte`**

Props: `variant: 'note' | 'warning' | 'tip'`. Monochrome: distinguished **only** by a Lucide icon and a 1px left border — no coloured background, no coloured border.

Icons: `note` → `Info`, `warning` → `TriangleAlert`, `tip` → `Lightbulb`, all `size={16}` and `aria-hidden="true"`, with the variant name exposed to screen readers as visually hidden text (`<span class="sr-only">Warning</span>`) so meaning never depends on the icon alone.

Layout: `border-l pl-4 py-1 my-6`, icon in `text-fg-muted`, body copy in `text-fg-muted`.

- [ ] **Step 4: Verify in both themes**

Render one of each variant on a scratch route at 390px.
Expected: no horizontal scroll, copy button reachable by Tab, focus ring visible, comments italic inside the code block. Delete the scratch route.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/CopyButton.svelte src/lib/components/CodeBlock.svelte src/lib/components/Callout.svelte
git commit -m "feat(components): code blocks with copy, and monochrome callouts"
```

---

### Task 4: Persistent Tabs

**Files:**

- Create: `src/lib/stores/tabs.svelte.ts`, `src/lib/components/Tabs.svelte`, `src/lib/components/TabPanel.svelte`

**Interfaces:**

- Produces: `<Tabs group="framework" tabs={['FastAPI','Flask','Django Ninja','DRF']}>` containing `<TabPanel value="FastAPI">` children. Selection persists across every tab group sharing the same `group` key, site-wide, via `localStorage`.

- [ ] **Step 1: `tabs.svelte.ts`** — one selection per group key, restored on load.

```ts
const PREFIX = 'errium-tab:';
const selections = $state<Record<string, string>>({});

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
				/* private mode */
			}
		}
		return fallback;
	},
	set(group: string, value: string) {
		selections[group] = value;
		try {
			localStorage.setItem(PREFIX + group, value);
		} catch {
			/* private mode */
		}
	}
};
```

- [ ] **Step 2: `Tabs.svelte`** — proper ARIA tabs.

`role="tablist"`; each trigger `role="tab"` with `aria-selected` and `aria-controls`; panels `role="tabpanel"`. Arrow-key navigation between tabs (Left/Right, wrapping), `Home` / `End` to jump to first/last.

Active tab marked by `text-fg` plus a 1px bottom border in `--fg`; inactive `text-fg-muted` with `hover:text-fg`. **No background pill — the hairline carries the state.**

A stored value may name a tab that does not exist in a given group, so fall back to the first tab whenever `tabs.get()` returns a value not present in `tabs`.

- [ ] **Step 3: Verify persistence**

Pick Flask on one page, navigate to another page with a framework tab group.
Expected: Flask already selected. Arrow keys move between tabs. Focus ring visible on each trigger.

- [ ] **Step 4: Commit**

```bash
git add src/lib/stores/tabs.svelte.ts src/lib/components/Tabs.svelte src/lib/components/TabPanel.svelte
git commit -m "feat(components): tabs with site-wide persistent selection"
```

---

### Task 5: The three-column shell

**Files:**

- Create: `src/lib/components/Header.svelte`, `Sidebar.svelte`, `TableOfContents.svelte`, `Footer.svelte`, `VersionBadge.svelte`, `PrevNext.svelte`
- Modify: `src/routes/+layout.svelte`

**Interfaces:**

- Consumes: `getNavGroups()`, `getPrevNext()` from Task 2; `theme` from Task 1.
- Produces: the layout every content page renders into.

- [ ] **Step 1: `VersionBadge.svelte`**

Renders `SITE.versionFallback` immediately — never empty, so there is no layout shift. On mount, fetch `SITE.links.pypiJson` and replace with `info.version` if it differs. On any failure, keep the fallback **silently**; never render an error state. Links to the PyPI page. Mono, `text-eyebrow`.

- [ ] **Step 2: `Sidebar.svelte`**

Groups come from `getNavGroups()`. Each group header is the numbered eyebrow — `text-eyebrow font-mono uppercase text-fg-muted` — rendered as `01 — GETTING STARTED`. The numeral hangs in the left margin rather than sitting inline with the label.

Active page: `text-fg` plus its 1px left rule promoted from `border-border` to `--fg`. Inactive: `text-fg-muted hover:text-fg`. **No background pill — the hairline is the interaction surface.** Mark the active link `aria-current="page"`.

240px wide, sticky, independently scrollable, 1px right border.

- [ ] **Step 3: `TableOfContents.svelte`**

Build from the rendered page's `h2` / `h3`. Query headings on mount, observe them with `IntersectionObserver` for scroll-spy, and highlight the active one with `text-fg` against `text-fg-muted`. 200px, sticky. Wrap in `<nav aria-label="On this page">`. **Disconnect the observer on destroy.**

- [ ] **Step 4: `Header.svelte`**

Sticky, 1px bottom border, `bg-bg` with backdrop blur. Order: wordmark `errium` (Geist Mono, 600) · `VersionBadge` · spacer · search trigger · GitHub icon · PyPI icon · `ThemeToggle`. Every icon-only control needs an `aria-label`. Below 1024px the hamburger appears here and opens the sidebar as a slide-over drawer.

- [ ] **Step 5: `Footer.svelte`**

Three columns of links (Docs / Project / Links), the MIT licence line, and all three canonical URLs from `SITE.links`.

- [ ] **Step 6: `PrevNext.svelte`**

Derived from `getPrevNext()`, so it always matches sidebar order.

- [ ] **Step 7: `+layout.svelte`** — assemble the shell.

Breakpoints, exactly as specified:

- **≥1280px:** sidebar `w-sidebar` · content `max-w-content` · TOC `w-toc`. Use the Task 1 tokens, never arbitrary pixel values.
- **1024–1279px:** drop the TOC, keep sidebar + content.
- **<1024px:** sidebar becomes a drawer behind the header hamburger; content full width with a **minimum 20px side gutter**.

The drawer must trap focus while open, close on `Esc`, and restore focus to the hamburger.

**Call `theme.init()` here** in `onMount` / `$effect`, reconciling the store with the attribute the pre-paint script stamped. See Task 1, Step 4 for why this is load-bearing.

- [ ] **Step 8: Verify at all four widths** — 390px, 768px, 1280px, 1600px.

Expected: **no horizontal scroll at any width.** Tab traversal reaches every control in visual order.

- [ ] **Step 9: Commit**

```bash
git add src/lib/components src/routes/+layout.svelte
git commit -m "feat(shell): three-column responsive layout, header, sidebar, TOC, footer"
```

---

### Task 6: One page end-to-end — `/docs/installation`

This is the representative page. Get it right, then the rest follow its shape. Do **not** start at page 1 and grind forward.

**Files:**

- Create: `src/lib/components/MarkdownLayout.svelte`
- Create: `src/routes/docs/installation/+page.md`
- Modify: `mdsvex.config.js`
- Confirm: `src/routes/+layout.ts` contains `export const prerender = true`

- [ ] **Step 1: Give MDsveX a layout**

So every `.md` page gets heading anchors (needed by both the TOC and Pagefind) and shared chrome without importing components one by one.

Install: `npm i -D rehype-slug`

In `mdsvex.config.js`:

The complete file after this change — the `highlight` block already exists and is verified working; reproduced here in full so this task stands alone:

```js
import rehypeSlug from 'rehype-slug';
import { createCssVariablesTheme, createHighlighter } from 'shiki';

const theme = createCssVariablesTheme({
	name: 'errium',
	variablePrefix: '--syn-',
	variableDefaults: {},
	fontStyle: true
});

const langs = ['python', 'bash', 'json', 'javascript', 'typescript', 'html', 'css'];
const highlighterPromise = createHighlighter({ themes: [theme], langs });

/** @type {import('mdsvex').MdsvexOptions} */
export const mdsvexConfig = {
	extensions: ['.md'],
	layout: { _: './src/lib/components/MarkdownLayout.svelte' },
	rehypePlugins: [rehypeSlug],
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const highlighter = await highlighterPromise;
			const resolved = langs.includes(lang) ? lang : 'text';
			const html = highlighter.codeToHtml(code, { lang: resolved, theme: 'errium' });
			// Escape for interpolation into a Svelte template literal.
			return `{@html \`${html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`}`;
		}
	}
};
```

`MarkdownLayout.svelte` receives frontmatter as props. It renders the `h1` from `title`, a lede from `description` in `text-fg-muted`, then `{@render children()}`, then `<PrevNext />`. It also sets `<svelte:head>` with a unique `<title>` and meta description from frontmatter.

- [ ] **Step 2: Style markdown elements** in `MarkdownLayout.svelte`, respecting the vertical rhythm.

`h2` `text-h2 mt-12 mb-4` · `h3` `text-h3 mt-8 mb-3` · `p` `text-fg-muted mb-4` · `ul` / `ol` `mb-4 space-y-2` · inline `code` `font-mono text-[0.9em]` (the one sanctioned arbitrary value) · `table` wrapped in `overflow-x-auto` · `a` with a persistent hairline underline in `--border-strong` strengthening to `--fg` on hover.

The persistent underline is deliberate: with no colour cue available, a link indistinguishable from body text until hover would fail WCAG. The spec's rule is that underline — never colour — is the signal, and this honours it.

- [ ] **Step 3: Write the page content**

Frontmatter:

```yaml
---
title: Installation
description: Install Errium and the adapter for your framework.
group: Getting Started
order: 2
---
```

Content must cover, all verified against source:

- Python **3.11+** requirement.
- Base install (`pip install errium` / `uv pip install errium`) in a `Tabs` group keyed `installer` with `pip` and `uv`.
- The three extras: `errium[flask]`, `errium[ninja]`, `errium[drf]`. Base ships core + the FastAPI adapter.
- A **`warning` callout** for the `fastapi` vs `fastapi[standard]` note: Errium depends on `fastapi`, not `fastapi[standard]`, so it stays light for Flask and Django users; install a server yourself (`uv pip install uvicorn`).
- The `py.typed` note: all five packages ship the marker, so type checkers see Errium's annotations directly.

Aim for clarity over volume — 200 words that say the right thing beat 600 that pad.

- [ ] **Step 4: Build and confirm it prerenders**

```bash
npm run build
```

Expected: build completes; `.vercel/output/static/docs/installation.html` exists and contains the rendered prose and highlighted code.

- [ ] **Step 5: Commit**

```bash
git add mdsvex.config.js src/lib/components/MarkdownLayout.svelte src/routes/docs/installation/+page.md package.json
git commit -m "feat(docs): markdown layout and the installation page end-to-end"
```

---

### Task 7: BeforeAfter — the landing page centrepiece

**Files:**

- Create: `src/lib/components/BeforeAfter.svelte`

This is the most important element on the site. It is the whole argument.

- [ ] **Step 1: Build it**

A single panel showing a JSON response, with a two-state control flipping between **Without Errium** and **With Errium**. Both payloads verbatim from Content Appendix A.3.

Hard requirements:

- **The container height must not jump between states.** Render both payloads into the same CSS grid cell and keep the inactive one `invisible` and `aria-hidden`, so the container height is the max of the two and never reflows.
- Cross-fade the content, under 200ms. Disabled under `prefers-reduced-motion` — the global guard in `app.css` handles this; do **not** add a second guard.
- **Both states highlighted identically**, so the *shape* difference is what stands out.
- Operable by keyboard and coherent to a screen reader: implement the control as a real ARIA tablist (two tabs, one panel each) so state changes are announced, not as two unlabelled buttons.

- [ ] **Step 2: Optional annotation — only if it stays clean**

Subtle mono labels on the "after" state's `trace_id` and `details` fields. If it clutters the hero moment, leave it out. This is a judgement call; err toward restraint.

- [ ] **Step 3: Verify**

Toggle repeatedly at 390px and 1600px.
Expected: zero height jump, no horizontal scroll, both themes legible, screen reader announces the selected state.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/BeforeAfter.svelte
git commit -m "feat(landing): before/after response comparison"
```

---

### Task 8: Landing page

**Files:**

- Create: `src/lib/components/Hero.svelte`, `InstallCommand.svelte`, `FeatureGrid.svelte`, `FeatureCard.svelte`, `FrameworkRow.svelte`
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: `InstallCommand.svelte`**

`$ pip install errium` in mono with a copy button. The `$` is decorative: mark it `aria-hidden` and exclude it from the copied text.

- [ ] **Step 2: `Hero.svelte`**

Headline on Errium's one-sentence pitch — *every error your API returns looks the same, no matter what threw it* — a one-line subhead, the `InstallCommand`, and two CTAs: *Get started* → `/docs/quickstart`, *GitHub* → `SITE.links.repo`.

`text-hero` is used here and **nowhere else on the site**.

- [ ] **Step 3: `FeatureCard` + `FeatureGrid`**

The five features from Appendix A.2, Lucide icons at `size={16}`: unified error format · validation beautifier · trace IDs · dev vs. prod mode · extensible plugin classifiers.

- [ ] **Step 4: `FrameworkRow.svelte`**

The four supported frameworks as monochrome wordmarks: FastAPI, Flask, Django Ninja, Django REST Framework.

- [ ] **Step 5: Assemble `+page.svelte`**

In exactly this order: Hero → `BeforeAfter` (immediately; it is the argument) → feature grid → framework row → footer.

Reuse the numbered-section motif for the landing page's major sections. **No testimonials, no company logos, no gradient mesh, no animated background.**

- [ ] **Step 6: Verify** at 390 / 768 / 1280 / 1600 in both themes.

- [ ] **Step 7: Commit**

```bash
git add src/lib/components src/routes/+page.svelte
git commit -m "feat(landing): hero, feature grid, framework row"
```

---

### Task 9: Getting Started and Frameworks pages (6 pages)

**Files:**

- Create: `src/routes/docs/+page.md` (Introduction, order 1)
- Create: `src/routes/docs/quickstart/+page.md` (order 3)
- Create: `src/routes/docs/fastapi/+page.md`, `flask/+page.md`, `django-ninja/+page.md`, `drf/+page.md` (group `Frameworks`, orders 1–4)

- [ ] **Step 1: `/docs` Introduction**

The problem — the three bullets from A.1: ugly validation errors, inconsistent backend responses, frontend integration pain. Then the solution — the four-stage pipeline: intelligent middleware → classification engine → beautification & normalization → environment-aware sanitization. Close with a link to Quickstart.

- [ ] **Step 2: `/docs/quickstart`**

The fastest path to a working setup, tabbed across all four frameworks with `group="framework"`, ending with the before/after JSON. Use the verbatim integration snippets from A.5.

- [ ] **Step 3: The four framework pages**

Each one: install command, integration code, what exactly gets caught, and framework-specific caveats.

**FastAPI** — two entry points, deliberately. `ErriumMiddleware` wraps `call_next` and catches anything escaping normal handling. `validation_exception_handler` is registered *separately* because Starlette resolves `RequestValidationError` through FastAPI's exception-handler mechanism, **not** through middleware exception propagation. This is why FastAPI needs two lines where the others need one — **explain that, don't just show it.** Classifiers: `FastAPIHTTPExceptionClassifier` (priority 200), `FastAPIValidationErrorClassifier` (210).

**Flask** — one call. A single `app.register_error_handler(Exception, ...)` covers both `HTTPException`s (from `flask.abort()`) and uncaught exceptions, since Flask dispatches both to a registered `Exception` handler when nothing more specific exists. It runs `ValidationNormalizer` when the caught exception is a pydantic `ValidationError`, since Flask has no request-validation exception type of its own. Ships `WerkzeugHTTPExceptionClassifier`. **Document the app-factory pattern** — `errium = ErriumFlask()` then `errium.init_app(app)`.

**Django Ninja** — `register_errium(api)` registers one shared handler against four types: `ninja.errors.ValidationError`, `ninja.errors.HttpError`, `django.http.Http404`, and base `Exception`. It must **override** Ninja's built-in defaults because **Ninja's default `Exception` handler re-raises when Django's `DEBUG` is off rather than returning JSON.** It also strips a Ninja quirk: for a single-Schema body or form param, Ninja's `loc` includes a synthetic segment equal to the endpoint's *parameter name* (e.g. `("body", "payload", "password")`); `_flatten_ninja_errors()` drops that segment so `details` keys match the other adapters instead of leaking the parameter name.

**DRF** — a settings hook, no middleware. **Must call out the 400-vs-422 decision:** a validation error returns 422 on FastAPI, Flask and Ninja but 400 on DRF, because `DRFValidationErrorClassifier` passes through `exc.status_code` — DRF's own default — rather than forcing uniformity. The response *shape* is identical across all four either way. Also cover: DRF's own default handler returns `None` for anything that isn't `APIException` / `Http404` / `PermissionDenied`, which makes `handle_exception` re-raise into Django's plain 500 handling; `errium_exception_handler` never returns `None`, so it achieves full catch-everything parity through the settings hook alone. It mirrors DRF's `WWW-Authenticate` / `Retry-After` header behaviour.

- [ ] **Step 4: Build and verify** all six prerender.

- [ ] **Step 5: Commit**

```bash
git add src/routes/docs
git commit -m "docs: introduction, quickstart, and four framework pages"
```

---

### Task 10: Concepts pages (7 pages)

**Files:**

- Create under `src/routes/docs/`: `response-shape/`, `categories/`, `classification/`, `custom-classifiers/`, `validation/`, `debug-mode/`, `trace-ids/` — each a `+page.md`, group `Concepts`, orders 1–7.

- [ ] **Step 1: `/docs/response-shape`**

The JSON contract field by field in a table (from A.8), plus the debug block. Repeat the 400-vs-422 note here. Use `tabular-nums` on the status-code column.

- [ ] **Step 2: `/docs/categories`**

The seven `ErrorCategory` values in a table with the status-code mapping from A.6. Note the distinction between enum **member** names and their **string values** — the `code` field carries the value.

- [ ] **Step 3: `/docs/classification`**

How the engine resolves an exception: priority ordering (highest first, ties default to 100), the `ExceptionClassifier` protocol, the always-registered classifiers (`ValidationExceptionClassifier` 150, `DatabaseExceptionClassifier` 140), and the generic fallback which sits outside the sorted list. State the contract explicitly: **a classifier must return `None`, never raise**, when it does not handle an exception.

- [ ] **Step 4: `/docs/custom-classifiers`**

A worked example of writing and registering one. **The `warning` callout is mandatory here:** each entry point builds its own `ClassificationEngine`, so a classifier meant to apply everywhere must be registered on every entry point. Note that the DRF adapter's engine is module-level, built once at import. This is the single easiest thing for a user to get wrong.

- [ ] **Step 5: `/docs/validation`**

The three normalization steps — strip the leading `body` / `query` / `header` / `path` / `formData` segment; look up a template by error `type`, then by `msg` (exact, then substring); format `{field_name}` placeholders and normalize punctuation — and `custom_mappings` via `ValidationNormalizer(custom_mappings={...})`.

Note that the DRF adapter does **not** use it: `flatten_drf_errors` does its own recursive flattening because DRF's `detail` is a different shape — a recursive tree of already human-readable `ErrorDetail` strings.

- [ ] **Step 6: `/docs/debug-mode`**

`ERRIUM_DEBUG` (truthy for `"true"` / `"1"` / `"yes"`, read at import time), what the debug block contains (`exception`, `message`, `stack_trace`, `hints` — a list of strings), and the 5xx sanitization rule. **`warning` callout that debug mode must not be on in production.**

- [ ] **Step 7: `/docs/trace-ids`**

Short page. A fresh `uuid4` per error; why that matters for correlating a client-facing response with server logs. Resist padding it.

- [ ] **Step 8: Build, verify, commit**

```bash
git add src/routes/docs
git commit -m "docs: seven concepts pages"
```

---

### Task 11: Architecture and Project pages (7 pages)

**Files:**

- Create: `src/routes/architecture/+page.md`, `architecture/core/+page.md`, `architecture/adapters/+page.md`, `architecture/testing/+page.md`
- Create: `src/routes/roadmap/+page.md`, `contributing/+page.md`, `changelog/+page.md`

Audience for the architecture pages is contributors and adapter authors.

- [ ] **Step 1: `/architecture`** — core vs. adapters

The central design decision, worth explaining well: `errium_core` never imports FastAPI, Starlette or Flask. Where it needs to recognise a framework's exception type without depending on it, it **duck-types** — checking `exc.__class__.__name__` or walking `type(exc).__mro__` for a known module path. That is why the core stays dependency-light and why adding a framework never requires touching it.

- [ ] **Step 2: `/architecture/core`**

Contracts, classification, formatting, normalization, settings, tracing, from Appendix B.2. Include the duplicate-marker list for `DatabaseExceptionClassifier` (`unique constraint`, `duplicate key`, `duplicate entry`, `already exists` → `DUPLICATE_RESOURCE` / 409; any other SQLAlchemy error → `DATABASE_ERROR` / 500), detected by walking the MRO for a `sqlalchemy.` module path with no SQLAlchemy dependency.

- [ ] **Step 3: `/architecture/adapters`**

Adapter internals from B.3. Include the deliberate trade-off: `DjangoHttp404Classifier` and `DjangoPermissionDeniedClassifier` are **duplicated, not shared**, between `errium_ninja` and `errium_drf`, so each adapter package stays self-contained and depends only on `errium_core`, never on another adapter.

- [ ] **Step 4: `/architecture/testing`**

`tests/unit/` (pure, no running app); `tests/integration/` (drives a real app through the adapter's actual wiring — `fastapi.testclient.TestClient`, `flask.Flask.test_client()`, `ninja.testing.TestClient`, DRF's `APIRequestFactory` against `@api_view` views — asserting on the full JSON response shape); and `tests/conftest.py`, which configures a minimal Django settings module and calls `django.setup()` before collection so `errium_ninja` and `errium_drf` are importable at all.

- [ ] **Step 5: `/roadmap`**

Done vs. Planned, from Appendix C. CI runs `ruff check`, `ruff format --check`, `mypy`, and `pytest` across Python 3.11 and 3.12 on every push and PR to `main`.

- [ ] **Step 6: `/contributing`**

From Appendix D: `uv` setup, testing, code style, the Angular commit convention table, branch naming, PR rules. Mention the library repo's own mkdocs site **briefly** — one line, not a focus.

- [ ] **Step 7: `/changelog`**

From Appendix E. Keep a Changelog format, SemVer. 0.1.1 (2026-09-03, documentation-only) and 0.1.0 (2026-09-03, first public release). MIT licence.

- [ ] **Step 8: Decide on `Breadcrumb`**

The spec lists it as component 15, "optional, only if it earns its place on deep architecture pages." The deepest route here is two segments (`/architecture/adapters`), and the sidebar already shows the active page inside its numbered group, so a breadcrumb would restate what is already on screen. **Default decision: do not build it.** Build it only if, having seen the finished architecture pages, orientation genuinely feels lost — and say so in the final summary either way.

- [ ] **Step 9: Build, verify all 22 routes prerender, commit**

```bash
git add src/routes
git commit -m "docs: architecture and project pages"
```

---

### Task 12: Search (⌘K) with Pagefind

**Files:**

- Create: `src/lib/components/SearchDialog.svelte`
- Modify: `package.json`, `.gitignore`

- [ ] **Step 1: Wire the postbuild step**

Pagefind indexes the built HTML, so the index can never drift from the content.

```json
"scripts": {
	"build": "vite build",
	"postbuild": "pagefind --site .vercel/output/static"
}
```

Note the path: with `adapter-vercel`, prerendered HTML lands in `.vercel/output/static`, not `build/`.

- [ ] **Step 2: Build `SearchDialog.svelte`**

- Triggered by ⌘K / Ctrl+K anywhere, or by the header search control.
- Load Pagefind lazily at runtime with a dynamic import Vite must not resolve at build time: `await import(/* @vite-ignore */ '/pagefind/pagefind.js')`.
- Results grouped by page, showing the matched heading and a text excerpt.
- Arrow keys navigate, Enter opens, Esc closes.
- **Focus-trapped while open**, `role="dialog"` with `aria-modal="true"` and an accessible name, and **focus returns to the trigger on close**.
- An empty state that is not a dead end — offer links to Introduction and Quickstart rather than a bare "no results".

- [ ] **Step 3: Verify the required queries**

```bash
npm run build && npx serve .vercel/output/static
```

Search `classifier`, `debug`, `flask`, `422`.
Expected: each returns relevant pages. Pagefind only works against a built site — it will **not** work under `npm run dev`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/SearchDialog.svelte package.json .gitignore
git commit -m "feat(search): Pagefind-backed command palette"
```

---

### Task 13: Full verification pass

- [ ] **Step 1: Clean build, all 22 routes**

```bash
rm -rf .vercel .svelte-kit && npm run build
find .vercel/output/static -name "*.html" | wc -l
```

Expected: build completes with no errors, and **22 HTML files** (21 content routes + landing). If the count is off, a page is missing or failed to prerender — find which one.

- [ ] **Step 2: Constraint grep** — these must all return nothing

```bash
grep -rn "dark:" src --include=*.svelte --include=*.css | grep -v shadow
grep -rn "@apply" src/lib src/routes
grep -rniE "TODO|FIXME|lorem|placeholder" src | grep -v SVELTE_REPO_URL
```

- [ ] **Step 3: Arbitrary-value audit**

```bash
grep -rnoE "\b(text|bg|p|m|w|h|gap|border)-\[[^]]+\]" src --include=*.svelte | grep -v "text-\[0.9em\]"
```

Expected: nothing. `text-[0.9em]` on inline code is the only sanctioned arbitrary value — the shell's dimensions come from the `max-w-content` / `w-sidebar` / `w-toc` tokens defined in Task 1.

- [ ] **Step 4: Responsive check** at 390px, 768px, 1280px, 1600px in **both** themes

Expected: no horizontal scroll at any width. Code blocks and tables scroll inside their own containers, never the page.

- [ ] **Step 5: Keyboard traversal** on a content page and the landing page

Expected: every interactive element reachable in visual order with a visible focus ring; the search dialog traps focus and restores it to the trigger; the mobile drawer does the same.

- [ ] **Step 6: Metadata** — every page has a unique `<title>` and meta description

```bash
grep -h "<title>" $(find .vercel/output/static -name "*.html") | sort | uniq -d
```

Expected: no duplicates.

- [ ] **Step 7: Lighthouse** ≥ 95 Performance and Accessibility on the landing page and one docs page.

- [ ] **Step 8: Commit any fixes**

---

### Task 14: `impeccable` audit

- [ ] **Step 1: Invoke the `impeccable` skill** as a dedicated audit pass, now that the site is feature-complete

Focus it on exactly these, per the spec:

- Responsive behaviour at 390px / 768px / 1280px / 1600px.
- Focus visibility and keyboard traversal.
- Contrast ratios in **both** themes.
- Any place the design has drifted toward generic.

- [ ] **Step 2: Fix everything it finds** before declaring done. Do not defer findings.

- [ ] **Step 3: Final commit**

```bash
git commit -m "polish: address impeccable audit findings"
```

---

## Definition of Done

- [ ] `npm run build` completes clean; all 22 routes prerender to static HTML.
- [ ] No horizontal scroll at 390px, 768px, 1280px, or 1600px.
- [ ] Both themes pass WCAG AA for body text; no theme flash on load.
- [ ] Full keyboard traversal; the search dialog traps and restores focus.
- [ ] Every page has a unique `<title>` and meta description from its frontmatter.
- [ ] Search returns sensible results for `classifier`, `debug`, `flask`, `422`.
- [ ] Lighthouse ≥ 95 Performance and Accessibility.
- [ ] `impeccable` run and its findings addressed.
- [ ] No arbitrary values except `text-[0.9em]`; no `@apply` outside `@layer base`; no `dark:` colour variants.
- [ ] Every documented API name, category value, status code and code sample checked against the cloned repository.
- [ ] No placeholder text. `<SVELTE_REPO_URL>` is the only exception and lives only in `src/lib/config.ts`.
