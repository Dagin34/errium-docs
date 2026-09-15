---
name: Errium Documentation
description: Monochrome, hairline-ruled documentation for a Python error-normalization library.
colors:
  bg: "#0A0A0A"
  bg-subtle: "#111111"
  bg-elevated: "#161616"
  fg: "#EDEDED"
  fg-muted: "#A1A1A1"
  fg-subtle: "#6E6E6E"
  fg-faint: "#4A4A4A"
  border: "#FFFFFF14"
  border-strong: "#FFFFFF24"
  light-bg: "#FFFFFF"
  light-bg-subtle: "#FAFAFA"
  light-bg-elevated: "#F5F5F5"
  light-fg: "#0A0A0A"
  light-fg-muted: "#5A5A5A"
  light-fg-subtle: "#8A8A8A"
  light-fg-faint: "#B4B4B4"
  light-border: "#00000017"
  light-border-strong: "#00000029"
  syn-keyword: "#8AA9C9"
  syn-string: "#B3A48A"
  syn-comment: "#848484"
  syn-punctuation: "#8A8A8A"
  light-syn-keyword: "#4A6B8A"
  light-syn-string: "#7A6A4A"
  light-syn-comment: "#6B6B6B"
  light-syn-punctuation: "#6E6E6E"
typography:
  display:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  nav:
    fontFamily: "Geist Variable, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: "Geist Mono Variable, Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist Mono Variable, Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.bg-subtle}"
    textColor: "{colors.fg}"
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg-muted}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-secondary-hover:
    textColor: "{colors.fg}"
  button-icon:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg-muted}"
    rounded: "{rounded.md}"
    size: "32px"
  button-icon-hover:
    textColor: "{colors.fg}"
  nav-item:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.nav}"
    padding: "8px 0 8px 16px"
  nav-item-active:
    textColor: "{colors.fg}"
  code-block:
    backgroundColor: "{colors.bg-subtle}"
    textColor: "{colors.fg}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "16px"
  callout:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg-muted}"
    padding: "4px 0 4px 16px"
  eyebrow:
    textColor: "{colors.fg-muted}"
    typography: "{typography.label}"
  version-badge:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
---

# Design System: Errium Documentation

## 1. Overview

**Creative North Star: "Infrastructure Documentation Written By Someone With Taste"**

This is a reference manual for a library that makes error responses boring on purpose. The design makes the same argument about itself. There is no chromatic accent anywhere in the interface — not one. Every level of hierarchy is produced by a nine-step neutral ramp and by 1px hairlines, and the reader's attention is therefore never spent on the chrome. It is spent on the JSON payload, the classifier priority table, the one warning that will save them an afternoon.

The system is dark-first because of where it gets read: a developer with an editor open on one side and this on the other, at whatever hour the exception showed up. Light is a genuine second theme, not an afterthought — both are held to the same contrast floor, and neither was designed by inverting the other.

What it rejects: the startup landing page. No hero metric, no gradient mesh, no animated background, no testimonials, no logo wall, no card with a soft wide shadow. Sections are separated by space rather than by horizontal rules; `<hr>` appears essentially never. Where a lesser system would reach for a coloured pill to show state, this one brightens a hairline.

**Key Characteristics:**

- Monochrome by doctrine. Zero chromatic accent in the UI.
- Hairlines over fills. 1px borders are the primary structural device.
- Two themes, one set of utilities. No `dark:` variant exists in the codebase.
- Restricted scales. Nine spacing steps, three radii, nine type roles. Nothing else.
- Quiet motion. 150ms colour transitions, and nothing that moves on its own.

## 2. Colors

A single neutral ramp per theme, plus a desaturated syntax set that reads near-monochrome at a glance.

### Primary

There is no primary accent. This is the system's defining constraint, not an omission. The role a primary colour would play — marking the active item, the focused control, the current section — is played by **Foreground** at full strength against **Muted Foreground**, and by promoting a hairline from `border` to `fg`.

### Neutral

- **Ink** (`#0A0A0A` dark bg / `#0A0A0A` light fg): The near-black that anchors both themes. It is the page in dark and the body text in light.
- **Paper** (`#FFFFFF`): The light theme's ground. True white at zero chroma — deliberately not a warm off-white.
- **Recessed Surface** (`#111111` / `#FAFAFA`): Code blocks and inset panels. One step away from the page, never two.
- **Elevated Surface** (`#161616` / `#F5F5F5`): The search dialog and the highest layer. The darkest-contrast surface in dark mode, which is why it is the worst case every contrast check is run against.
- **Foreground** (`#EDEDED` / `#0A0A0A`): Headings, active nav, body emphasis. 15.46:1 at worst.
- **Muted Foreground** (`#A1A1A1` / `#5A5A5A`): Body copy, inactive nav, every eyebrow. Carries most of the words on the site at 7.00:1 / 6.33:1.
- **Subtle Foreground** (`#6E6E6E` / `#8A8A8A`): Non-text decoration only. Measures 3.2–3.9:1 and is therefore **forbidden for text**.
- **Faint Foreground** (`#4A4A4A` / `#B4B4B4`): Non-informational marks only. Roughly 2:1. Forbidden for any text at any size.
- **Hairline** (`rgba(255,255,255,0.08)` / `rgba(0,0,0,0.09)`): The default border colour, set once globally so a bare `border` is already correct.
- **Strong Hairline** (`rgba(255,255,255,0.14)` / `rgba(0,0,0,0.16)`): Hover and focus only. Never at rest.

### Tertiary

The syntax set is the only place the palette leaves pure grey, and it barely does.

- **Slate Keyword** (`#8AA9C9` / `#4A6B8A`): Keywords and links inside code.
- **Clay String** (`#B3A48A` / `#7A6A4A`): Strings and numbers.
- **Grey Comment** (`#848484` / `#6B6B6B`): Comments, and the only italic on the site.
- **Grey Punctuation** (`#8A8A8A` / `#6E6E6E`): Braces, dots, commas.

### Named Rules

**The No Accent Rule.** There is no chromatic accent colour in the UI. Not for primary actions, not for the active nav item, not for focus, not for callout variants. If a change needs colour to read, the change is wrong. Rework it with weight, hairline strength, or space.

**The Text Floor Rule.** `fg-subtle` and `fg-faint` are measured below 4.5:1 in both themes and are prohibited for text of any size. Body copy and labels use `fg` or `fg-muted`, full stop. Every syntax token is held to the same 4.5:1 floor against `bg-elevated`, the worst-case surface — which is why `syn-comment` is `#848484` and not the darker grey it looks like it wants to be.

**The Hairline-As-State Rule.** State lives in the border, not in a fill. The active sidebar item promotes its own left rule from `border` to `fg`. The selected tab promotes its bottom rule. No background pill, no tinted row, anywhere.

## 3. Typography

**Display Font:** Geist Variable (fallback `ui-sans-serif`, `system-ui`, `sans-serif`)
**Body Font:** Geist Variable — the same family, at different weights
**Label/Mono Font:** Geist Mono Variable (fallback `ui-monospace`, `SFMono-Regular`, `monospace`)

**Character:** One family carries everything sans, so there is no pairing to get wrong. The contrast axis is sans against mono, not serif against sans — and mono is load-bearing rather than decorative: it marks every piece of structural metadata (section indices, group labels, filenames, the version badge, install commands) as distinct from prose. Both faces are self-hosted; nothing is hotlinked.

### Hierarchy

- **Display** (600, 44px, 1.1, -0.03em): The landing hero. Appears exactly once on the entire site.
- **Headline** (600, 30px, 1.25, -0.02em): The page title on every content page.
- **Title** (600, 20px, 1.35, -0.01em): `h2` section headings, 48px above and 16px below.
- **Subtitle** (600, 16px, 1.4): `h3`, the deepest heading level used.
- **Body** (400, 14px, 1.7): All prose, capped at a 720px measure — about 75 characters.
- **Nav** (400, 13px, 1.5): Sidebar, table of contents, footer links, tab triggers.
- **Code** (400, 13px, 1.6, mono): Block code. Inline code is the one relative size on the site, at `0.9em`, because it must scale to whatever it sits inside.
- **Label** (500, 11px, 1.4, +0.08em, uppercase, mono): Eyebrows, section indices, filename bars, the version badge.

### Named Rules

**The One Display Rule.** 44px appears once, in the landing hero, and nowhere else. Nothing on any other page goes above 30px. Resist scaling anything up to create emphasis.

**The No Bold Body Rule.** Weight reaches 600 only for headings. Emphasis inside prose is expressed as `fg` against `fg-muted` — never by bolding a word, never by enlarging it.

**The One Italic Rule.** Code comments are italic. Nothing else on the site is italic, which is why Geist Mono's real italic face is loaded and Geist Sans' is not.

## 4. Elevation

There are no shadows. Depth is tonal and linear: three background steps (`bg` → `bg-subtle` → `bg-elevated`) plus 1px hairlines, and that is the entire vocabulary. A code block is not a card sitting above the page; it is a recessed surface cut into it.

The only non-tonal depth cue is `backdrop-blur` on the two elements that genuinely overlay content — the sticky header and the search dialog scrim — where the blur signals "there is content behind this," which is exactly the job the technique should do and the only one.

Stacking is deliberately shallow: `z-40` for the sticky header, `z-50` for the drawer and the search dialog. Nothing else establishes a layer.

### Named Rules

**The No Shadow Rule.** `box-shadow` is not part of this system. A 1px border plus a soft wide shadow on the same element — the ghost-card pattern — is prohibited outright. If an element needs to separate from the page, move it one tonal step and give it a hairline.

**The Blur Has A Job Rule.** `backdrop-filter` appears only where content passes behind the element. It is never decoration.

## 5. Components

### Buttons

- **Shape:** Gently curved (6px, `rounded`). Pills are reserved for nothing; `rounded-full` is not used outside dots.
- **Primary:** A 1px `border-strong` on the page background with `fg` text, 16px horizontal and 8px vertical padding. It reads as the emphasized action because its border is brighter, not because it is filled.
- **Secondary / Ghost:** The same shape with a default `border` hairline and `fg-muted` text; the border strengthens and the text brightens on hover.
- **Hover / Focus:** `transition-colors` at 150ms `ease-out`. Focus is always the standard ring: a 2px `fg` outline at 2px offset, on `focus-visible` only so it never fires on a mouse click.
- **Icon-only:** A 32px square grid-centred target with a 16px Lucide glyph. Every one carries an `aria-label`; the glyph is always `aria-hidden`.

### Cards / Containers

- **Corner Style:** 6px, or 8px (`rounded-lg`) for the search dialog and the before/after panel.
- **Background:** `bg-subtle` for code and inset panels; `bg-elevated` for the dialog.
- **Shadow Strategy:** None. See Elevation.
- **Border:** A single 1px `border` hairline. Never a nested border inside another bordered box.
- **Internal Padding:** 16px (code), 24px (framework cells).

### Inputs / Fields

- **Style:** The search field is borderless inside an already-bordered dialog, separated from the results by one hairline. Placeholder is `fg-muted`, held to the same 4.5:1 floor as body text.
- **Focus:** The field is auto-focused when the dialog opens; its own outline is suppressed because the dialog border already frames it.

### Navigation

- **Sidebar:** 240px, sticky, independently scrollable, 1px right border. Groups are labelled with a mono eyebrow carrying a zero-padded index. **The numeral hangs in the left margin** rather than prefixing the label inline, so the indices read as markers down the edge of the nav.
- **Active state:** `fg` text plus the item's own left hairline promoted to `fg`. No pill, no fill.
- **Table of contents:** 200px, sticky, `IntersectionObserver` scroll-spy, active heading in `fg`.
- **Mobile:** Below 1024px the sidebar becomes a slide-over drawer. The page behind it is marked `inert`, which is what makes it an actual modal rather than one that only looks like it.

### Chips

Not used. Framework and category labels are set in mono at label size against the page; there is no chip vocabulary to keep consistent.

### The Numbered Margin Grid

The site's signature. Five sidebar groups are numbered `01`–`05`, and the landing page is laid out on a two-column grid — a 200px margin column holding the numbered markers, and a content column holding everything else, including the hero. Every piece of content therefore shares one left edge while the numerals live outside it.

The numbering is legitimate here specifically because the groups **are** a sequence: `01 Getting Started` through `05 Project` is a real progression from first install to internals, and the order carries information the reader needs. Applied to a set of sections that merely coexist, this device would be scaffolding-by-reflex.

### The Before/After Panel

The landing page's centrepiece and the whole argument for the library. Two JSON payloads occupy the same CSS grid cell, so the container is always as tall as the longer one and switching states cannot reflow the page. Both are highlighted identically, so the *shape* difference is what stands out. The control is a real ARIA tablist, not two buttons, so the state change is announced.

## 6. Do's and Don'ts

### Do:

- **Do** express every level of hierarchy with the neutral ramp, hairline weight, and space.
- **Do** promote a hairline from `border` to `border-strong` on hover, and to `fg` for active state.
- **Do** keep body copy and labels on `fg` or `fg-muted`, which are the only text-safe foreground tokens.
- **Do** hold every colour pair to 4.5:1 against `bg-elevated`, the worst-case surface, in **both** themes.
- **Do** restrict spacing to the nine steps `1 2 3 4 6 8 12 16 24` (4–96px) and radii to 4/6/8px.
- **Do** put the standard focus ring — `focus-visible:outline-2 outline-offset-2 outline-fg` — on every interactive element, including links generated from markdown.
- **Do** give body-prose links a persistent hairline underline that strengthens on hover. With no colour cue available, a link indistinguishable from body text until hover fails WCAG.
- **Do** add a theme token when reaching for an arbitrary value. `max-w-[720px]` was wrong; `--container-content` was the fix.
- **Do** separate sections with space.

### Don't:

- **Don't** introduce a chromatic accent colour for any UI purpose. This is the locked constraint.
- **Don't** distinguish a link by colour. Underline is the only signal.
- **Don't** use `fg-subtle` or `fg-faint` for text at any size. Both measure below 4.5:1.
- **Don't** write a `dark:` colour variant. The `@theme inline` mapping resolves both themes from one set of utilities; `dark:` is admissible only for a genuine structural difference.
- **Don't** use `@apply` outside `@layer base`. A repeated pattern becomes a Svelte component, not an `@apply` bundle.
- **Don't** use an arbitrary value. The sole sanctioned exception on the entire site is inline code at `text-[0.9em]`, which must scale relative to its parent.
- **Don't** add a `box-shadow`, and never pair a 1px border with a soft wide shadow on the same element.
- **Don't** round a container past 8px.
- **Don't** build a startup landing page: no hero metric, no gradient mesh, no animated background, no testimonials, no logo wall.
- **Don't** convey a callout's variant with a coloured background or border. Icon plus a 1px left rule, with the variant name exposed to screen readers so meaning never rests on the icon alone.
- **Don't** use `<hr>`.
- **Don't** hand-roll a second `prefers-reduced-motion` guard. One global guard exists; per-component duplicates are noise.
- **Don't** extend the numbered-marker motif to lists or sections that are not genuinely a sequence.
- **Don't** make a heading out of something that labels navigation. Sidebar, TOC and footer labels are paragraphs tied to their lists with `aria-labelledby`; as headings they sat above the page's own `h1` in the outline.
