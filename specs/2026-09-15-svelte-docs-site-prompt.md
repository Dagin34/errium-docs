# Build Prompt — Errium Documentation Site (SvelteKit)

> Paste everything below the line into a fresh, barebones SvelteKit project.

---

# Build the Errium documentation site

You are building the public documentation site for **Errium**, an open-source Python library. This
brief is the output of a completed design session — the architecture, IA, visual direction, and
feature set are already decided. **Do not re-open those decisions or run a brainstorming skill.**
Your job is to execute this brief at a very high level of craft.

**Errium's repository is public, and reading it is your first task** — see §1.1. The Content
Appendix at the end of this brief is a condensed, verified snapshot of that repo, but the repo
itself is the source of truth and may have moved on. Read the source, then use the appendix to
cross-check that you've understood it correctly.

**Do not invent API names, function signatures, or behaviour.** Everything you document must be
traceable to something you actually read in the repository or in the appendix. If the two disagree,
the repository wins — and note the discrepancy in your final summary so it can be fixed here.

---

## 0. Skills — invoke these, in this order

This project has several design skills installed. Use them deliberately.

**Step 0, before any of them: clone and read the Errium repository (§1.1).** Design decisions made
before you understand the library will be wrong ones.

1. **`ui-ux-pro-max`** — invoke this first among the skills, before writing any code. Use it to
   pull the SvelteKit **and Tailwind** stack guidance, and to sanity-check the monochrome palette
   and the Geist type pairing specified in §3 against its palette/font database. If it surfaces a
   concrete improvement to a token value, take it; do **not** let it talk you into adding a
   chromatic accent colour or a different overall direction — those are locked.

2. **`frontend-design`** — invoke this before building the shell and components (§4–5). Use it for
   aesthetic direction: the details that keep this from reading as a templated docs theme.
   Specifically: the hairline border treatment, the numbered-section motif, vertical rhythm, and
   the hover/focus states. The constraints in §3 are the guardrails it works inside.

3. **`superpowers:writing-plans`** — after the two design skills and before implementation, turn
   this brief into a sequenced implementation plan. There are 22 content pages and ~15 components;
   build the design system and shell first, then one representative page end-to-end, then the
   rest. Do not start at page 1 and grind forward.

4. **`impeccable`** — invoke this at the **end**, as a dedicated audit pass once the site is
   feature-complete. Focus it on: responsive behaviour at 390px / 768px / 1280px / 1600px, focus
   visibility and keyboard traversal, contrast ratios in *both* themes, and any place the design
   has drifted toward generic. Fix what it finds before declaring done.

Do not invoke `dataviz` — there are no charts in this site.

---

## 1. What Errium is (context for you, not copy for the site)

Errium is a lightweight error normalization and translation library for Python APIs. It intercepts
uncaught exceptions, HTTP exceptions, and request validation errors, and standardizes them into a
single consistent, frontend-safe JSON response shape.

It supports four frameworks today — **FastAPI, Flask, Django Ninja, and Django REST Framework** —
via a framework-agnostic core (`errium_core`) plus one thin adapter package per framework.

The pitch, in one sentence: *every error your API returns looks the same, no matter what threw it.*

**Canonical links** (use these exactly):

| What | URL |
|---|---|
| PyPI package | `https://pypi.org/project/errium/` |
| Main library repo | `https://github.com/Dagin34/errium` |
| This site's repo | `<SVELTE_REPO_URL>` — **placeholder, leave as a constant in one config file so it can be filled in later** |

Put the PyPI link and both GitHub links in the footer. Put the PyPI link and the main repo link in
the header too (icon-only, with accessible labels).

### 1.1 Read the repository first — before any design or code

`https://github.com/Dagin34/errium` is public. **Clone it into a scratch directory and read it
before you do anything else**, including before invoking the design skills. You cannot write
accurate documentation for a library you haven't read.

```bash
git clone --depth 1 https://github.com/Dagin34/errium.git /tmp/errium-src
```

Read, in this order:

1. `README.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `CHANGELOG.md` — the prose.
2. `CLAUDE.md` — the maintainer's own notes on how the codebase is organised. Dense and useful.
3. `src/errium_core/` — especially `contracts/categories.py`, `classifiers/engine.py`,
   `classifiers/status_mapping.py`, `formatters/default.py`, `normalizers/validation.py`,
   `config/settings.py`. These define every fact the Concepts pages document.
4. `src/errium/`, `src/errium_flask/`, `src/errium_ninja/`, `src/errium_drf/` — the four adapters,
   for the Frameworks and Architecture pages.
5. `examples/` and `tests/integration/` — real working usage. **The integration tests are the best
   available proof of what the library actually does**, and are worth mining for accurate code
   samples on the framework pages.
6. `pyproject.toml` — the real extras names, dependency constraints, and supported Python versions.

Specific things to verify against the source rather than trusting this brief:

- The exact `ErrorCategory` members and their string values.
- The exact status-code → category table in `status_mapping.py`.
- The real default priorities on every classifier.
- The exact keys the formatter emits, in both normal and debug mode.
- The current version in `pyproject.toml` (this becomes the `VersionBadge` build-time fallback).

Do **not** copy the repo's own `.md` files into the site verbatim. The whole point of this rebuild
is a proper information architecture — you are restructuring that content into the 22 pages in §6,
not re-rendering five long documents.

---

## 2. Stack

- **SvelteKit** (latest) + **TypeScript**
- **MDsveX** for content — `.md` files that can render Svelte components inline
- **`@sveltejs/adapter-vercel`**, with every route prerendered (`export const prerender = true` in
  the root layout). Deploys to Vercel. No base-path config needed.
- **Tailwind CSS v4**, via `@tailwindcss/vite`. **Required — all styling goes through Tailwind.**
  The design tokens in §3 are wired into Tailwind's theme so they're reachable as normal utilities
  (`bg-bg`, `text-fg-muted`, `border-border`, `text-body`). Write utilities in markup; do not build
  a parallel stylesheet of hand-written classes alongside it.
- **`lucide-svelte`** for icons
- **`shiki`** for syntax highlighting, wired into the MDsveX pipeline at build time (not runtime)
- **`pagefind`** for search, as a postbuild step

Keep the dependency list to roughly that. Every added dependency should be justifiable.

---

## 3. Design system — this is locked, implement it exactly

### 3.1 Direction

Monochrome, quiet, engineered. The reference points are `better-auth.com` (three-column docs
shell, small type, hairline borders) and `dagmawi.et` (numbered section markers, whitespace as the
divider instead of rules). The site should feel like infrastructure documentation written by
someone with taste — not like a startup landing page.

**Dark is the default theme.** Persist the user's choice in `localStorage`, apply it before first
paint via an inline script in `app.html` so there is no flash. Both themes must be equally
polished — `impeccable` will check this.

### 3.2 Tokens — the single Tailwind theme file

There is **no chromatic accent colour in the UI.** All hierarchy comes from the neutral ramp and
hairline borders. Links are distinguished by underline-on-hover, not by colour.

Theming works by declaring semantic CSS custom properties per theme, then mapping them into
Tailwind's theme with `@theme inline` — so a single set of utilities (`bg-bg`, `text-fg-muted`)
resolves correctly in both themes with no `dark:` variant needed on every element. Dark is the
base; light is the opt-in override.

This is the entire theme layer. Put it in `src/app.css`:

```css
@import "tailwindcss";

/* Dark is the default. Light is the opt-in override. */
:root {
  --bg:            #0A0A0A;
  --bg-subtle:     #111111;
  --bg-elevated:   #161616;
  --border-c:      rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.14);
  --fg:            #EDEDED;
  --fg-muted:      #A1A1A1;
  --fg-subtle:     #6E6E6E;
  --fg-faint:      #4A4A4A;

  /* syntax — deliberately desaturated, reads near-monochrome at a glance */
  --syn-keyword:     #8AA9C9;
  --syn-string:      #B3A48A;
  --syn-comment:     #5A5A5A;
  --syn-number:      #B3A48A;
  --syn-punctuation: #8A8A8A;
  --syn-plain:       #EDEDED;
}

[data-theme="light"] {
  --bg:            #FFFFFF;
  --bg-subtle:     #FAFAFA;
  --bg-elevated:   #F5F5F5;
  --border-c:      rgba(0, 0, 0, 0.09);
  --border-strong: rgba(0, 0, 0, 0.16);
  --fg:            #0A0A0A;
  --fg-muted:      #5A5A5A;
  --fg-subtle:     #8A8A8A;
  --fg-faint:      #B4B4B4;

  --syn-keyword:     #4A6B8A;
  --syn-string:      #7A6A4A;
  --syn-comment:     #9A9A9A;
  --syn-number:      #7A6A4A;
  --syn-punctuation: #8A8A8A;
  --syn-plain:       #0A0A0A;
}

@theme inline {
  --color-bg:            var(--bg);
  --color-bg-subtle:     var(--bg-subtle);
  --color-bg-elevated:   var(--bg-elevated);
  --color-border:        var(--border-c);
  --color-border-strong: var(--border-strong);
  --color-fg:            var(--fg);
  --color-fg-muted:      var(--fg-muted);
  --color-fg-subtle:     var(--fg-subtle);
  --color-fg-faint:      var(--fg-faint);

  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, monospace;

  /* type scale — see 3.3 */
  --text-hero:    44px;
  --text-hero--line-height:    1.1;
  --text-hero--letter-spacing: -0.03em;
  --text-hero--font-weight:    600;

  --text-h1:      30px;
  --text-h1--line-height:    1.25;
  --text-h1--letter-spacing: -0.02em;
  --text-h1--font-weight:    600;

  --text-h2:      20px;
  --text-h2--line-height:    1.35;
  --text-h2--letter-spacing: -0.01em;
  --text-h2--font-weight:    600;

  --text-h3:      16px;
  --text-h3--line-height: 1.4;
  --text-h3--font-weight: 600;

  --text-body:    14px;
  --text-body--line-height: 1.7;

  --text-nav:     13px;
  --text-nav--line-height: 1.5;

  --text-code:    13px;
  --text-code--line-height: 1.6;

  --text-eyebrow: 11px;
  --text-eyebrow--line-height:    1.4;
  --text-eyebrow--letter-spacing: 0.08em;
  --text-eyebrow--font-weight:    500;

  --radius-sm: 4px;
  --radius:    6px;
  --radius-lg: 8px;
}

/* One global default so borders never need a colour utility repeated everywhere. */
@layer base {
  * { border-color: var(--color-border); }
  body { @apply bg-bg text-fg font-sans text-body antialiased; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Comments in code blocks are italic. That's the only italic on the site.

**Tailwind usage rules:**

- Never use an arbitrary value (`text-[#EDEDED]`, `p-[13px]`) where a theme token exists. If you
  reach for one, the token set is missing something — add the token instead.
- `@apply` is allowed in `@layer base` for element defaults (above) and nowhere else. Repeated
  component patterns become Svelte components, not `@apply` bundles.
- No `dark:` variants for colour. The `@theme inline` mapping already handles both themes. `dark:`
  is only acceptable for a genuine per-theme structural difference, such as a code-block shadow.

### 3.3 Type

**Geist Sans** for everything, **Geist Mono** for code and structural metadata. Self-host both
(`@fontsource` or the Geist npm package) — do not hotlink Google Fonts.

Every row below is already declared as a Tailwind text token in §3.2, so it carries its size,
weight, tracking, and line-height in one utility — `text-h2` is the whole heading style.

| Role | Utility | Size | Weight | Tracking | Line height |
|---|---|---|---|---|---|
| hero `h1` (landing only) | `text-hero` | 44px | 600 | -0.03em | 1.1 |
| `h1` | `text-h1` | 30px | 600 | -0.02em | 1.25 |
| `h2` | `text-h2` | 20px | 600 | -0.01em | 1.35 |
| `h3` | `text-h3` | 16px | 600 | 0 | 1.4 |
| body | `text-body` | 14px | 400 | 0 | 1.7 |
| code (block) | `text-code font-mono` | 13px | 400 | 0 | 1.6 |
| code (inline) | `font-mono text-[0.9em]` | 0.9em | 400 | 0 | inherit |
| sidebar / nav | `text-nav` | 13px | 400 | 0 | 1.5 |
| eyebrow | `text-eyebrow font-mono uppercase` | 11px | 500 | 0.08em | 1.4 |

Inline code is the one sanctioned arbitrary value on the site — it must scale relative to its
parent, which a fixed token can't express.

The hero is the **only** place type goes above 30px. Resist scaling anything else up. Weight jumps
to 600 only for headings — never for emphasis in body copy (use `--fg` against `--fg-muted`
instead).

### 3.4 Space, radius, motion

- **Spacing:** use Tailwind's default 4px-based scale, but restrict yourself to
  `1, 2, 3, 4, 6, 8, 12, 16, 24` (= 4, 8, 12, 16, 24, 32, 48, 64, 96px). Nothing else. A design
  this quiet falls apart when spacing is ad hoc.
- **Radius:** `rounded-sm` (4px), `rounded` (6px), `rounded-lg` (8px). Nothing rounder, and no
  `rounded-full` outside of avatars or dots.
- **Borders:** always `border` (1px) in `border-border`. Because §3.2 sets the default border
  colour globally, a bare `border` or `border-b` is already correct — reach for
  `border-border-strong` only on hover/focus.
- **Motion:** `transition-colors duration-150 ease-out` for hover states, 200ms for the theme
  transition. The global `prefers-reduced-motion` guard in §3.2 covers disabling it — don't
  hand-roll a second one per component.
- **Separate sections with space, not horizontal rules.** `<hr>` should appear essentially never.

### 3.5 The numbered-section motif

Each sidebar nav group is labelled with an eyebrow carrying a zero-padded index, in Geist Mono:

```
01 — GETTING STARTED
02 — FRAMEWORKS
03 — CONCEPTS
04 — ARCHITECTURE
05 — PROJECT
```

Reuse the same motif for the landing page's major sections. This is the site's signature — apply
it consistently, but don't extend it to every list on every page.

---

## 4. Layout shell

**≥1280px — three columns:**

- Left: sidebar, 240px, sticky, independently scrollable, 1px right border.
- Centre: content, `max-width: 720px`, generous horizontal padding.
- Right: on-this-page TOC, 200px, sticky, scroll-spy highlighting the active heading.

**1024–1279px:** drop the TOC, keep sidebar + content.

**<1024px:** sidebar becomes a slide-over drawer behind a hamburger in the header. Content goes
full-width with a minimum 20px side gutter. Never let the page scroll horizontally — put code
blocks and tables in their own `overflow-x: auto` containers.

**Header** (sticky, 1px bottom border, `--bg` with backdrop blur):
wordmark `errium` (Geist Mono, 600) · PyPI version badge · spacer · search trigger · GitHub icon ·
PyPI icon · theme toggle.

**Footer:** three columns of links (Docs / Project / Links), the MIT licence line, and the three
canonical URLs from §1.

---

## 5. Components to build

1. `CodeBlock` — Shiki-highlighted, copy button top-right that appears on hover and is always
   present for keyboard users, optional filename header bar, optional line highlighting.
2. `Tabs` — used for framework switching and for `pip` vs `uv` install commands. **Selection
   persists across all tab groups on the site via `localStorage`** — if a reader picks Flask on the
   install page, the quickstart page should already be on Flask. This is a small thing that makes
   the site feel considered.
3. `Callout` — variants `note`, `warning`, `tip`. Monochrome: distinguished by a Lucide icon and a
   1px left border, not by a coloured background.
4. `Sidebar` — nav generated from page frontmatter (see §6), grouped, with the numbered eyebrows.
5. `TableOfContents` — built from `h2`/`h3` in the rendered page, with `IntersectionObserver`
   scroll-spy.
6. `SearchDialog` — ⌘K / Ctrl+K palette. Full keyboard navigation, focus trap, `Esc` to close,
   restores focus to the trigger on close.
7. `ThemeToggle` — sun/moon Lucide icons, `aria-label` reflects the action.
8. `VersionBadge` — see §7.2.
9. `BeforeAfter` — the landing page's centrepiece, see §7.3.
10. `PrevNext` — footer navigation derived from sidebar order.
11. `FeatureGrid` + `FeatureCard` — landing page, Lucide icons at 16px.
12. `FrameworkRow` — landing page, the four supported frameworks as monochrome wordmarks or labels.
13. `Hero` — landing page.
14. `InstallCommand` — `$ pip install errium` in mono with a copy button; used in the hero.
15. `Breadcrumb` — optional, only if it earns its place on deep architecture pages.

Build each of these as a Svelte component styled with Tailwind utilities in its markup. Every
interactive element needs a visible focus ring — standardise on
`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg` — and every
icon-only button needs an `aria-label`.

Shiki emits inline styles by default, which will fight the theme. Configure it to emit CSS
variables instead and bind those to the `--syn-*` tokens from §3.2, so code blocks re-theme with
the rest of the site rather than needing two rendered copies.

---

## 6. Sitemap — 22 pages

Content lives as `.md` files under `src/content/` (or `src/routes/**/+page.md` — your call, but be
consistent). **The sidebar is generated from frontmatter, never hand-maintained**, so adding a page
means adding one file.

Frontmatter schema:

```yaml
---
title: Installation
description: Install Errium and its framework extras.
group: Getting Started
order: 2
---
```

### Structure

```
/                          Landing

01 — GETTING STARTED
/docs                      Introduction
/docs/installation         Installation
/docs/quickstart           Quickstart

02 — FRAMEWORKS
/docs/fastapi              FastAPI
/docs/flask                Flask
/docs/django-ninja         Django Ninja
/docs/drf                  Django REST Framework

03 — CONCEPTS
/docs/response-shape       The response contract
/docs/categories           Error categories
/docs/classification       The classification engine
/docs/custom-classifiers   Writing a custom classifier
/docs/validation           Validation normalization
/docs/debug-mode           Debug vs. production
/docs/trace-ids            Trace IDs

04 — ARCHITECTURE
/architecture              Core vs. adapters
/architecture/core         Core building blocks
/architecture/adapters     Adapter internals
/architecture/testing      Testing layout

05 — PROJECT
/roadmap                   Roadmap
/contributing              Contributing
/changelog                 Changelog
```

### Per-page briefs

Write real, complete prose for each of these using the facts in the Content Appendix. Aim for
clarity over volume — a docs page that says the right thing in 200 words beats one that pads to
600.

- **`/` Landing** — Hero: headline on Errium's one-sentence pitch, one-line subhead, the
  `InstallCommand`, and two CTAs (*Get started* → `/docs/quickstart`, *GitHub* → repo). Then the
  `BeforeAfter` demo immediately — it's the whole argument. Then the five-item feature grid (the
  five bullets in Appendix A.2). Then the framework support row. Then footer. No testimonials, no
  company logos, no gradient mesh, no animated background.
- **`/docs` Introduction** — The problem (three bullets from A.1), then the solution (the
  four-stage pipeline from A.1). Close with a link to Quickstart.
- **`/docs/installation`** — Python 3.11+ requirement, base install, the three extras, the
  `fastapi` vs `fastapi[standard]` note as a `warning` callout, and the `py.typed` note. Use `Tabs`
  for `pip` / `uv`.
- **`/docs/quickstart`** — The fastest possible path to a working setup, tabbed across all four
  frameworks, ending with the before/after JSON.
- **`/docs/fastapi`, `/docs/flask`, `/docs/django-ninja`, `/docs/drf`** — One page each: install
  command, integration code, what exactly gets caught, and any framework-specific caveats. The DRF
  page **must** call out the 400-vs-422 status code decision (A.6).
- **`/docs/response-shape`** — The JSON contract field by field, in a table, plus the debug block.
- **`/docs/categories`** — The seven `ErrorCategory` values in a table, with the status-code
  mapping from A.5.
- **`/docs/classification`** — How the engine resolves an exception: priority ordering, the
  `ExceptionClassifier` protocol, the always-registered classifiers, and the generic fallback.
- **`/docs/custom-classifiers`** — A worked example of writing and registering one. **Include the
  warning that each entry point builds its own engine**, so a classifier meant to apply everywhere
  must be registered on every entry point. Make this a `warning` callout — it's the single easiest
  thing for a user to get wrong.
- **`/docs/validation`** — The three normalization steps, and `custom_mappings`.
- **`/docs/debug-mode`** — `ERRIUM_DEBUG`, what the debug block contains, and the 5xx sanitization
  rule. A `warning` callout that debug mode must not be on in production.
- **`/docs/trace-ids`** — Short page. What they are, why they matter for log correlation.
- **`/architecture*`** — Four pages from Appendix B. Audience is contributors and adapter authors.
- **`/roadmap`** — Done vs. Planned, from Appendix C.
- **`/contributing`** — From Appendix D.
- **`/changelog`** — From Appendix E.

---

## 7. Feature specs

### 7.1 Search (⌘K)

Use **Pagefind**, indexing the built HTML as a postbuild step (`npm run build && pagefind --site
build`). This means the index can never drift from the content.

- Triggered by ⌘K / Ctrl+K anywhere, or by clicking the header search control.
- Results grouped by page, showing the matched heading and a text excerpt.
- Arrow keys navigate, Enter opens, Esc closes, focus returns to the trigger.
- Focus-trapped while open, `aria-modal`, and an empty state that isn't a dead end.

### 7.2 PyPI version badge

Fetch `https://pypi.org/pypi/errium/json` on mount and show `info.version` in the header.

- **Bake the known version in as a fallback constant at build time** so the badge renders
  immediately and never causes layout shift.
- If the fetch fails, silently keep the fallback. Never show an error state for this.
- It links to the PyPI page.

### 7.3 The before/after toggle

The most important element on the site. A single panel showing a JSON response, with a two-state
control flipping between **Without Errium** and **With Errium** (Appendix A.3 has both payloads
verbatim).

- The container height must not jump between states — size it to the taller payload and hold.
- Cross-fade the content; keep it under 200ms; disable under `prefers-reduced-motion`.
- Both states syntax-highlighted identically so the *shape* difference is what stands out.
- It must be operable by keyboard and make sense to a screen reader.
- Consider annotating the "after" state's `trace_id` and `details` fields with subtle mono labels —
  but only if it stays clean. Don't clutter the hero moment.

### 7.4 Assumed, build them properly

Copy buttons on every code block (with a transient "Copied" state), the scroll-spy TOC, prev/next
footer links, and the persistent framework tabs from §5.2.

**Not in scope:** edit-on-GitHub links, last-updated timestamps, versioned docs, i18n, blog,
comments, analytics.

---

## 8. Definition of done

- [ ] `npm run build` completes clean; every one of the 22 routes prerenders to static HTML.
- [ ] No horizontal scroll at 390px, 768px, 1280px, or 1600px.
- [ ] Both themes pass WCAG AA for body text; no theme flash on load.
- [ ] Full keyboard traversal: every interactive element reachable, visible focus ring, search
      dialog traps and restores focus.
- [ ] Every page has a unique `<title>` and meta description from its frontmatter.
- [ ] Search returns sensible results for `classifier`, `debug`, `flask`, `422`.
- [ ] Lighthouse ≥ 95 on Performance and Accessibility.
- [ ] `impeccable` has been run as a final audit and its findings addressed.
- [ ] No Tailwind arbitrary values except the sanctioned inline-code size; no `@apply` outside
      `@layer base`; no `dark:` colour variants.
- [ ] Every documented API name, category value, status code, and code sample has been checked
      against the cloned repository (§1.1). Any disagreement between the repo and this brief's
      appendix is reported in your final summary.
- [ ] No placeholder or lorem text anywhere. `<SVELTE_REPO_URL>` is the single exception, and it
      lives in one config file.

---

# Content Appendix — verified snapshot, cross-check against the repo

Everything below was read directly out of the Errium repository and is accurate as of this brief's
writing. Use it to confirm you've read the source correctly and to save yourself re-deriving the
structure — but where it and the cloned repo disagree, **the repo wins**.

## A. Product

### A.1 Problem and solution

**The problem** — modern API frameworks yield inconsistent error responses:

- **Ugly validation errors** — deeply nested, verbose Pydantic output that's painful to parse.
- **Inconsistent backend responses** — uncaught internal exceptions leak stack traces or return
  plain text, depending on where they occurred.
- **Frontend integration pain** — frontend engineers write a custom parser for every microservice.

**The solution** — a unified classification, normalization, and formatting pipeline:

1. **Intelligent middleware** (`ErriumMiddleware`) — transparently intercepts the request lifecycle.
2. **Classification engine** (`ClassificationEngine`) — resolves error categories, status codes,
   and user-facing messages.
3. **Beautification & normalization** — turns nested, complex errors into flat, friendly key-value
   details.
4. **Environment-aware sanitization** — full tracebacks in development, sealed internals in
   production.

### A.2 Features (use these five for the landing page grid)

- **Unified error format** — every API error response uses the exact same structured JSON contract.
- **Validation beautifier** — maps common validation types (`missing`, invalid emails, nulls) into
  clean, human-readable messages.
- **Trace IDs** — correlates client-facing responses with server-side logs.
- **Dev vs. prod mode** — tracebacks, exception names, and actionable hints in development;
  sanitized in production.
- **Extensible plugin classifiers** — register custom classifiers with priority-based resolution.

### A.3 Before / after (verbatim — for the `BeforeAfter` component)

**Without Errium** — raw FastAPI validation error:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "password"],
      "msg": "Field required",
      "input": null
    }
  ]
}
```

**With Errium:**

```json
{
  "success": false,
  "status_code": 422,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed.",
  "trace_id": "87b003a8-7c15-4a6c-9c76-a05b22b109e2",
  "timestamp": "2026-05-27T12:00:00Z",
  "details": {
    "password": "Password is required."
  }
}
```

### A.4 Installation

Requires **Python 3.11+**. Base install ships the core plus the FastAPI adapter; every other
framework is an extra.

```bash
uv pip install errium
# or
pip install errium
```

```bash
uv pip install "errium[flask]"   # Flask
uv pip install "errium[ninja]"   # Django Ninja
uv pip install "errium[drf]"     # Django REST Framework
```

Two notes worth surfacing as callouts:

- Errium depends on `fastapi`, **not** `fastapi[standard]`, so it stays light for Flask and Django
  users. If you were relying on Errium to pull in a server, install one yourself
  (`uv pip install uvicorn`).
- All five packages ship a `py.typed` marker, so type checkers see Errium's annotations directly.

### A.5 Integration per framework (verbatim)

**FastAPI** — two lines:

```python
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from errium import ErriumMiddleware
from errium.handlers.validation_handler import validation_exception_handler

app = FastAPI()

# 1. Add middleware to catch raw & HTTP exceptions
app.add_middleware(ErriumMiddleware)

# 2. Add validation exception handler to capture validation errors
app.add_exception_handler(RequestValidationError, validation_exception_handler)
```

**Flask** — one call, covering HTTP exceptions, uncaught exceptions, and pydantic validation
errors:

```python
from flask import Flask
from errium_flask import ErriumFlask

app = Flask(__name__)
ErriumFlask(app)
```

**Django Ninja** — covers Ninja's `ValidationError` and `HttpError` (including its
`AuthenticationError` / `AuthorizationError` / `Throttled` subclasses), Django's `Http404`, and
generic exceptions:

```python
from ninja import NinjaAPI
from errium_ninja import register_errium

api = NinjaAPI()
register_errium(api)
```

**Django REST Framework** — a settings hook, no middleware:

```python
# settings.py
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "errium_drf.errium_exception_handler",
}
```

### A.6 Status-code mapping

`category_for_status_code()` is the shared table used by the FastAPI, Flask, Ninja, and DRF HTTP
exception classifiers:

| Status | Category |
|---|---|
| 401 | `AUTHENTICATION_ERROR` |
| 403 | `AUTHORIZATION_ERROR` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `DUPLICATE_RESOURCE` |
| 422 | `VALIDATION_ERROR` |
| anything else | `INTERNAL_SERVER_ERROR` |

**The one deliberate inconsistency:** a validation error returns **422** on FastAPI, Flask, and
Django Ninja, but **400** on DRF — the DRF adapter preserves DRF's own established convention
rather than forcing uniformity. The response *shape* is identical across all four adapters either
way. Call this out explicitly on the DRF page and on the response-shape page.

### A.7 Error categories

The closed set of values the response's `code` field can take:

`VALIDATION_ERROR`, `AUTHENTICATION_ERROR`, `AUTHORIZATION_ERROR`, `RESOURCE_NOT_FOUND`,
`DUPLICATE_RESOURCE`, `DATABASE_ERROR`, `INTERNAL_SERVER_ERROR`

### A.8 Response contract fields

| Field | Type | Notes |
|---|---|---|
| `success` | boolean | Always `false` on an error response |
| `status_code` | integer | HTTP status |
| `code` | string | One of the seven `ErrorCategory` values |
| `message` | string | User-facing summary |
| `trace_id` | string | Fresh `uuid4` per error, for log correlation |
| `timestamp` | string | ISO 8601 |
| `details` | object | Flat `{field: message}` map; present on validation errors |
| `debug` | object | **Only** when `ERRIUM_DEBUG=true` — exception class name, message, full stack trace, contextual hints |

---

## B. Architecture

### B.1 Core vs. adapters

```
src/
├── errium_core/     # framework-agnostic: classification, contracts, formatting, settings
├── errium/          # FastAPI / Starlette adapter
├── errium_flask/    # Flask adapter
├── errium_ninja/    # Django Ninja adapter
└── errium_drf/      # Django REST Framework adapter
```

`errium_core` never imports FastAPI, Starlette, or Flask. Where it needs to recognize a framework's
exception type without depending on it, it **duck-types** — checking `exc.__class__.__name__` or
walking `type(exc).__mro__` for a known module path. This is the central design decision worth
explaining well: it's why the core stays dependency-light and why adding a framework never requires
touching it.

Each adapter package contributes:

- One or more `ExceptionClassifier` implementations for framework-specific exception types.
- An integration point hooking into the framework's error-handling mechanism, which builds a
  `ClassificationEngine`, classifies the exception, wraps it in a `StandardizedError`, formats it
  with `DefaultFormatter`, and returns the framework's native JSON response type.

### B.2 Core building blocks

**Contracts** (`errium_core/contracts/`)

- `ErrorCategory` — the closed set of category strings (A.7).
- `ClassifiedError` — minimal classification output: `category`, `status_code`, `message`.
- `StandardizedError` — full internal representation before formatting: adds `trace_id`, `success`,
  `timestamp`, optional `details`, and the original `exception`.

**Classification** (`errium_core/classifiers/`)

- `ExceptionClassifier` — a `Protocol`: a `priority: int` property and
  `classify(exc) -> ClassifiedError | None`. Returning `None` means "not my exception type, try the
  next classifier." A classifier must **return `None`, never raise**, when it doesn't handle an
  exception.
- `ClassificationEngine` — holds classifiers sorted by priority, highest first; ties default to
  100. `classify(exc)` runs each in order and returns the first non-`None` result, falling back to
  `GenericExceptionClassifier` if nothing matches. On construction it always registers
  `ValidationExceptionClassifier` (priority 150) and `DatabaseExceptionClassifier` (priority 140).
  Adapters register their own framework-specific classifiers at priority 200+.
- `ValidationExceptionClassifier` — matches Pydantic `ValidationError` or anything named
  `RequestValidationError`; always `VALIDATION_ERROR` / 422.
- `DatabaseExceptionClassifier` — matches SQLAlchemy exceptions by walking the MRO for a
  `sqlalchemy.` module path, with **no SQLAlchemy dependency**. An `IntegrityError` whose message
  looks like a uniqueness violation (`unique constraint`, `duplicate key`, `duplicate entry`,
  `already exists`) maps to `DUPLICATE_RESOURCE` / 409; any other SQLAlchemy error maps to
  `DATABASE_ERROR` / 500.
- `GenericExceptionClassifier` — the fallback, always `INTERNAL_SERVER_ERROR` / 500. Not part of
  the priority-sorted list.
- `status_mapping.py` — `category_for_status_code()`, the shared table in A.6.

> **Important, and the easiest thing to get wrong:** each adapter entry point (the FastAPI
> middleware, the FastAPI validation handler, the Flask extension, the Ninja registration function,
> the DRF exception handler) constructs its **own** `ClassificationEngine`. A custom classifier
> meant to apply everywhere must be registered on every entry point.

**Formatting** (`errium_core/formatters/`)

- `ErrorFormatter` — a `Protocol`: `format(error: StandardizedError) -> dict[str, Any]`.
- `DefaultFormatter` — the only implementation. Produces `success`, `status_code`, `code`,
  `message`, `trace_id`, `timestamp`, `details`, and reads `get_settings().debug`:
  - Production (`debug=False`): any `status_code >= 500` has its `code`/`message` sanitized to a
    generic `INTERNAL_SERVER_ERROR` / "An unexpected error occurred." regardless of what the
    classifier produced, so internals never leak.
  - Debug (`debug=True`): adds a `debug` block with the exception class name, its message, a full
    formatted stack trace, and contextual hints keyed off the status code.

**Normalization** (`errium_core/normalizers/validation.py`)

`ValidationNormalizer.normalize(errors)` turns a raw Pydantic/FastAPI `errors()` list (dicts with
`loc`, `type`, `msg`) into a flat `{field_path: message}` dict:

1. Strips a leading `body` / `query` / `header` / `path` / `formData` location segment.
2. Looks up a human-readable message template by error `type`, then by `msg` (exact match, then
   substring match), falling back to the raw message if nothing matches.
3. Formats `{field_name}` placeholders (`password` → "Password") and normalizes punctuation.

Custom mappings inject via `ValidationNormalizer(custom_mappings={...})`. The FastAPI validation
handler, the Flask extension, and the Ninja adapter all use it. **The DRF adapter does not** — DRF's
`ValidationError.detail` is a different shape (a recursive tree of already human-readable
`ErrorDetail` strings), so `errium_drf.normalizers.flatten_drf_errors` does its own recursive
flattening.

**Settings** (`errium_core/config/settings.py`)

`ErriumSettings(debug: bool)` is a process-global singleton sourced from the `ERRIUM_DEBUG` env var
at import time (`"true"` / `"1"` / `"yes"`, case-insensitive). `get_settings()` / `set_settings()`
read and replace it.

**Tracing** (`errium_core/tracing/trace.py`)

`generate_trace_id()` returns a fresh `uuid4()` string per error.

### B.3 Adapter internals

**FastAPI (`errium`)** — two entry points, deliberately:

1. `ErriumMiddleware` (a Starlette `BaseHTTPMiddleware`) wraps `call_next` in try/except, catching
   anything escaping normal request handling. Registers `FastAPIHTTPExceptionClassifier` and
   `FastAPIValidationErrorClassifier`.
2. `validation_exception_handler` is registered *separately* via
   `app.add_exception_handler(RequestValidationError, ...)` — **because Starlette resolves
   `RequestValidationError` through FastAPI's exception-handler mechanism, not through middleware
   exception propagation.** It additionally runs `ValidationNormalizer`. This is why FastAPI needs
   two lines where the other frameworks need one; explain that, don't just show it.

**Flask (`errium_flask`)** — simpler: a single
`app.register_error_handler(Exception, ...)` registration covers both `HTTPException`s (from
`flask.abort()`) and uncaught exceptions, since Flask dispatches both to a registered `Exception`
handler when no more specific handler exists. It also runs `ValidationNormalizer` when the caught
exception is a pydantic `ValidationError`, since Flask has no built-in request-validation exception
type of its own. Ships `WerkzeugHTTPExceptionClassifier`.

**Django Ninja (`errium_ninja`)** — `register_errium(api)` registers one shared handler against
four exception types via `api.exception_handler(...)`: `ninja.errors.ValidationError`,
`ninja.errors.HttpError`, `django.http.Http404`, and the base `Exception`. It must **override**
Ninja's own built-in defaults for those four types, because **Ninja's default `Exception` handler
re-raises when Django's `DEBUG` is off rather than returning JSON.** It also strips a Ninja-specific
quirk: for a single-Schema body/form param, Ninja's `loc` includes a synthetic segment equal to the
endpoint's *parameter name* (e.g. `("body", "payload", "password")`); `_flatten_ninja_errors()`
drops that segment so `details` keys match the other adapters instead of leaking the parameter
name. Classifiers: `NinjaValidationErrorClassifier`, `NinjaHttpErrorClassifier`,
`DjangoHttp404Classifier`.

**DRF (`errium_drf`)** — `errium_exception_handler(exc, context)` is a plain function, not a class
or a registration call; DRF resolves it via `REST_FRAMEWORK["EXCEPTION_HANDLER"]`.
`APIView.dispatch()` wraps every view call in `except Exception: self.handle_exception(exc)`, which
calls this function. **DRF's own default handler returns `None` for anything that isn't
`APIException` / `Http404` / `PermissionDenied`, which makes `handle_exception` re-raise into
Django's plain 500 handling.** `errium_exception_handler` never returns `None` — the
`GenericExceptionClassifier` fallback covers everything else — so it achieves full
catch-everything parity with the other adapters purely through the settings hook, no extra
middleware required. It also mirrors DRF's `WWW-Authenticate` / `Retry-After` header behaviour for
auth challenges and throttling. Classifiers: `DRFValidationErrorClassifier`,
`DRFAPIExceptionClassifier`, `DjangoHttp404Classifier`, `DjangoPermissionDeniedClassifier`.

Note that `DjangoHttp404Classifier` and `DjangoPermissionDeniedClassifier` are **duplicated, not
shared**, between `errium_ninja` and `errium_drf` — each adapter package stays self-contained and
depends only on `errium_core`, never on another adapter. That's a deliberate trade-off worth
mentioning on the adapters page.

### B.4 Testing layout

- `tests/unit/` — pure unit tests against classifiers, normalizers, and the formatter, no running
  app.
- `tests/integration/` — drives a real app end-to-end through the adapter's actual wiring
  (`fastapi.testclient.TestClient`, `flask.Flask.test_client()`, `ninja.testing.TestClient`, or
  DRF's `rest_framework.test.APIRequestFactory` against `@api_view`-decorated views), asserting on
  the full JSON response shape.
- `tests/conftest.py` — configures a minimal Django settings module (including
  `REST_FRAMEWORK["EXCEPTION_HANDLER"]`) and calls `django.setup()` before collection, so
  `errium_ninja` and `errium_drf` are importable at all. No-op for the FastAPI/Flask suites.

---

## C. Roadmap

### Done

- **Core classification pipeline** — `ClassificationEngine`, the `ExceptionClassifier` protocol,
  `StandardizedError` / `ClassifiedError` contracts, `DefaultFormatter`, `ValidationNormalizer`,
  dev/prod sanitization via `ERRIUM_DEBUG`.
- **FastAPI adapter** — `ErriumMiddleware` plus `validation_exception_handler` with beautified
  `details`.
- **Flask adapter** — `ErriumFlask`, covering Werkzeug HTTP exceptions, generic exceptions, and
  pydantic validation errors raised manually inside views.
- **Django Ninja adapter** — `register_errium(api)`, overriding Ninja's built-in defaults, and
  stripping Ninja's synthetic parameter-name wrapper from validation error locations.
- **Django REST Framework adapter** — `errium_exception_handler`, with full catch-everything
  coverage including raw uncaught exceptions, its own `flatten_drf_errors` normalizer, and DRF
  header behaviour mirrored.
- **Database error classification** — SQLAlchemy errors → `DATABASE_ERROR`, uniqueness violations
  → `DUPLICATE_RESOURCE`, with no hard SQLAlchemy dependency.
- **Published on PyPI** — with `flask`, `ninja`, and `drf` extras; all five packages ship
  `py.typed`.
- **CI** — GitHub Actions running `ruff check`, `ruff format --check`, `mypy`, and `pytest` across
  Python 3.11 and 3.12 on every push and PR to `main`.

### Planned

- **Express.js adapter (JavaScript port)** — a separate package outside the Python distribution;
  needs its own port of the core contracts, not just an adapter.
- **AI-powered developer suggestions & self-healing hints** — extending the formatter's debug hints
  (currently a static, status-code-keyed lookup) with more context-aware, possibly model-generated
  suggestions in debug mode.

### Note for contributors

When picking up a new framework adapter, follow the core-vs-adapters pattern: a new
`src/errium_<framework>` package containing framework-specific `ExceptionClassifier`s plus one
integration point that builds a `ClassificationEngine`, classifies, formats, and returns the
framework's native response type. **Nothing in `errium_core` should need to change to support a new
framework.**

---

## D. Contributing

**Development setup** — Errium uses `uv`:

```bash
git clone https://github.com/Dagin34/errium.git
cd errium
uv sync
uv pip install -e .
```

**Testing** — high coverage is expected on all core operations; changes need unit and integration
tests under `tests/`:

```bash
uv run pytest
uv run pytest --tb=short
```

**Code style** — PEP 8, strong static typing, structural cleanliness:

```bash
uv run ruff check .
```

**Documentation** — note for the site: the library repo currently also builds an mkdocs site from
its root `.md` files. Mention it briefly; don't make it a focus.

**Commit conventions** — Angular style, `<type>(<scope>): <subject>`:

| Type | Use |
|---|---|
| `feat` | A new feature — `feat(core): implement validation beautifier` |
| `fix` | A bug fix — `fix(fastapi): correct HTTPException status mapping` |
| `docs` | Documentation-only changes |
| `style` | Changes that don't affect logic (whitespace, formatting) |
| `refactor` | Neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |

**Branch naming** — `feature/short-desc` or `feat/short-desc`, `bugfix/short-desc` or
`fix/short-desc`, `docs/short-desc`.

**Pull requests** — before submitting: tests pass, no lint errors, changes are minimal and focused
(don't combine unrelated features in one PR), and the description explains what the change does and
why it was needed.

---

## E. Changelog

Format is Keep a Changelog; the project adheres to Semantic Versioning.

**[0.1.1] — 2026-09-03** — Documentation-only release. No code changes; published so the updated
README renders on the PyPI project page, which snapshots it per version.

- *Changed* — README gained PyPI, Python version, licence, and CI badges; documents the
  `flask`/`ninja`/`drf` extras together; notes the shipped `py.typed` markers; flags that a server
  (`uvicorn`) must be installed separately since Errium depends on `fastapi`, not
  `fastapi[standard]`.
- *Added* — a changelog.

**[0.1.0] — 2026-09-03** — First public release, published on PyPI.

- *Added* — the core pipeline (`errium_core`), and the FastAPI, Flask, Django Ninja, and Django
  REST Framework adapters, as described in Appendix B.

Licence: **MIT**.
