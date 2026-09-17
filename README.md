# Tooark Web Components

[![Tests](https://github.com/Tooark/web-components/actions/workflows/tests.yml/badge.svg)](https://github.com/Tooark/web-components/actions/workflows/tests.yml)
[![License](https://img.shields.io/github/license/Tooark/web-components?color=blue)](LICENSE)
[![Version](https://img.shields.io/github/package-json/v/Tooark/web-components?label=version&color=informational)](package.json)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-339933?logo=node.js&logoColor=white)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)](pnpm-workspace.yaml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](tsconfig.base.json)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](packages/tokens/tokens.css)
[![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?logo=storybook&logoColor=white)](apps/storybook)

A framework-agnostic component library built on native **Web Components** (Custom Elements), with first-class wrappers for **React**, **Vue** and **Angular**. Components follow the **Ark** family naming convention (`ark-*` elements, `Ark*` types, `--ark-*` CSS tokens) and are styled with **Tailwind CSS v4** on top of a shared design-token layer.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](https://github.com/Tooark/web-components/blob/main/README.pt-BR.md)

---

## Architecture

The monorepo is organized in layers — each package only depends on the layers below it:

```text
┌─────────────────────────────────────────────────────────┐
│                    Framework wrappers                   │
│   @tooark/react   ·   @tooark/vue   ·   @tooark/angular │
├─────────────────────────────────────────────────────────┤
│                 @tooark/web-components                  │
│        Native Custom Elements (ark-* components)        │
├──────────────┬──────────────────────────┬───────────────┤
│ @tooark/chart│      @tooark/core        │@tooark/wysiwyg│
│  (ECharts)   │ types · i18n · services  │   (Tiptap)    │
│              │   motion presets/WAAPI   │               │
├──────────────┴──────────────────────────┴───────────────┤
│                     @tooark/tokens                      │
│    design primitives · CSS custom properties (--ark-*)  │
├─────────────────────────────────────────────────────────┤
│                     @tooark/motion                      │
│       opt-in animation package (Motion lib)             │
└─────────────────────────────────────────────────────────┘
```

---

## Packages

| Package                  | Description                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@tooark/tokens`         | Design primitives: semantic colors (intents), size scale, radii and motion tokens (`--ark-duration-*`, `--ark-ease-*`), exposed as CSS custom properties and Tailwind v4 `@theme` values.                    |
| `@tooark/core`           | Shared foundation: TypeScript types (`ArkIntent`, `ArkSize`, …), i18n locales (`en`, `pt`, `es`), the toast and announce services and the dependency-free motion layer (CSS presets + WAAPI helpers `arkEnter`/`arkExit`). |
| `@tooark/web-components` | The native Custom Elements: `ark-button`, `ark-calendar`, `ark-carousel`, `ark-clock`, `ark-datepicker`, `ark-input`, `ark-scheduler`, `ark-switch`, `ark-toaster`, `ark-toggle` and `ark-toggle-group`.     |
| `@tooark/react`          | React wrappers with typed props.                                                                                                                                                                             |
| `@tooark/vue`            | Vue 3 wrappers.                                                                                                                                                                                              |
| `@tooark/angular`        | Angular wrapper components.                                                                                                                                                                                  |
| `@tooark/chart`          | `ark-chart` — charts built on [ECharts](https://echarts.apache.org/) (peer dependency).                                                                                                                      |
| `@tooark/wysiwyg`        | `ark-wysiwyg` — rich-text editor and viewer built on [Tiptap](https://tiptap.dev/).                                                                                                                          |
| `@tooark/motion`         | **Opt-in** advanced animation helpers built on [Motion](https://motion.dev/): staggered list entrances, scroll reveal, FLIP reordering and swipe gestures with spring physics.                               |

---

## Components

| Element            | Package        | Highlights                                                                                                                                                               |
| ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ark-button`       | web-components | Intents, sizes, style variants (solid/outline/ghost), `rounded` (up to `full`), `loading`/`icon-only`/`full-width` states, link mode (`href`).                           |
| `ark-calendar`     | web-components | Inline month grid (MUI DateCalendar-style): localized, WAI-ARIA keyboard navigation, motion, month/year views from the title and colored events (`dots`/`count`/`list`). |
| `ark-carousel`     | web-components | Native CSS scroll snap (touch/trackpad scroll natively, mouse drag emulated), autoplay, loop, dots and arrows. Slides stay as your direct children.                      |
| `ark-clock`        | web-components | Time selection with scrollable digital columns (hours/minutes/seconds), 24h/12h, minute step, localized.                                                                 |
| `ark-datepicker`   | web-components | Date picker: inline (embeds `ark-calendar`) or `input` mode with field + popup, localized formatting, typed input parsing, forms.                                        |
| `ark-input`        | web-components | Standardized text field: label, helper/error with aria, suffix via `slot="suffix"`, sizes, intents, `rounded`.                                                           |
| `ark-scheduler`    | web-components | Scheduler with `week`/`day` views (time grid with overlap resolved into columns), plus `month` and `agenda`; colored, clickable events.                                  |
| `ark-switch`       | web-components | Accessible on/off switch (`role="switch"`): optional ON/OFF text and ✓/✕ icons, intents, form participation via hidden checkbox.                                         |
| `ark-toaster`      | web-components | Sonner-style toasts: programmatic API, positions, rich colors, actions, animated enter/exit, localized close button.                                                     |
| `ark-toggle`       | web-components | Pressed-state button (`aria-pressed`), standalone (outline/tinted per intent) or as a group item.                                                                        |
| `ark-toggle-group` | web-components | Segmented control: exclusive (default) or multiple selection, synced `value`, propagates `size`/`intent`/`theme`/`disabled` to items.                                    |
| `ark-chart`        | chart          | ECharts-powered chart types with theme support.                                                                                                                          |
| `ark-wysiwyg`      | wysiwyg        | Tiptap-based editor + read-only viewer.                                                                                                                                  |

### Key attributes

**`ark-button`** — the host element itself is the control (`role="button"`, focus, keyboard, form participation via ElementInternals), so `aria-label`, `class` and `id` on `<ark-button>` apply directly and its children are never moved. `variant` (`solid`/`outline`/`ghost` or an intent), `intent`, `size` (`xs`–`xl`), `rounded` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`full` — combined with `icon-only`, `full` yields a circular button), `loading` (spinner + `aria-busy` + blocked clicks), `icon-only` (square: `min-width` equals the size token), `full-width`, `href`/`target` (a stretched `<a>` covers the host, takes the focus and is named by the host content; `_blank` gets `rel="noopener noreferrer"`), `disabled`, `type`, `theme`, `color`/`text-color`.

**`ark-calendar`** — `value` (`YYYY-MM-DD`, parsed in the LOCAL timezone), `min`/`max`, `lang` (`en`/`pt`/`es`/`custom` + `locale-json`), `theme`, `intent`, `accent-color`. Clickable title cycles days → months → years. Events: `events` attribute (JSON) or JS `events` property with `{ date, label?, color?, intent? }`, rendered per `event-display` (`dots` default, `count`, `list`). Emits `ark-change` with `detail: { value, date, events }`. Keyboard navigation: arrows move between days (crossing months), `Home`/`End` jump to month start/end, `PageUp`/`PageDown` switch months.

**`ark-clock`** — `value` (`HH:mm[:ss]`, always 24h internally), `seconds` (seconds column), `step-minutes`, `hours-format` (`24` default or `12` with an AM/PM column), `lang`, `theme`, `intent`. Emits `ark-change` with `detail: { value }`.

**`ark-input`** — `type`, `label` (becomes a real `<label for>`), `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message` (with `aria-invalid`/`aria-describedby`), `disabled`, `required`, `readonly`. Suffix via a child with `slot="suffix"`. For composition: `focus()` and the `inputElement` getter.

**`ark-datepicker`** — composes `ark-input` + `ark-calendar` + `ark-clock`. `mode`: `datetime` (default, value `YYYY-MM-DDTHH:mm:ss`), `date` (`YYYY-MM-DD`) or `time` (`HH:mm:ss`). Without `input` it renders the panels inline; with `input`, field + popup. `format` with `YYYY`/`MM`/`DD`/`HH`/`mm`/`ss` tokens (case-sensitive; defaults to `MM/DD/YYYY HH:mm` for `en`, `DD/MM/YYYY HH:mm` otherwise), `placeholder`, `seconds`, `name` (form submission with the ISO value via hidden input), `disabled`, and forwards `min`/`max`/`events`/`event-display`/`step-minutes`/`hours-format` to the panels. Typed input is validated (invalid entries revert); in `date` mode selecting closes the popup, in `datetime` it stays open to pick the time; `Esc`/outside click close.

**`ark-scheduler`** — `view` (`week` default, `day`, `month`, `agenda`), `date` (reference date, kept in sync while navigating), `events` (JSON attribute or JS property) with `{ id?, title, start, end?, allDay?, location?, color?, intent? }`, `views` (limits the switcher, e.g. `"day,week"`), `hour-start`/`hour-end`, `slot-minutes` (15–60), `hours-format`, `lang`, `theme`, `intent`. Emits `ark-event-click` (`{ event, id }`), `ark-slot-click` (`{ start, end, allDay }` — clicking an empty slot or a day), `ark-view-change` (`{ view }`) and `ark-range-change` (`{ start, end, view }`). Time views position events by time, resolve overlaps into side-by-side columns and mark the current time.

**`ark-switch`** — `checked`, `disabled`, `size`, `intent`, `theme`, `color`, `labels` (shows ON/OFF inside the track; customizable via `label-on`/`label-off`), `icons` (✓/✕ on the thumb), `label` (accessible name), `name`/`value` (form submission when checked). Emits `change` with `detail: { checked }`.

**`ark-toggle`** — `pressed`, `value`, `disabled`, `size`, `intent`, `theme`. Emits `change` with `detail: { pressed, value }`.

**`ark-toggle-group`** — `value` (selected value(s), synced with items), `multiple`, `disabled`, `size`, `intent`, `theme`. Emits `change` with `detail: { value }` (exclusive) or `detail: { values }` (multiple).

**`ark-carousel`** — the host is the scroll container and your slides are its direct children. `slides-per-view`, `gap` (px), `start-index`, `loop`, `autoplay`/`autoplay-delay` (paused on hover/focus and disabled under `prefers-reduced-motion`), `show-dots`/`show-arrows` (`"false"` hides), `drag-free`, `snap` (`mandatory`/`proximity`), `intent`, `accent-color`, `theme`. JS API: `index`, `slides`, `next()`, `prev()`. Emits `ark-slide-change` with `detail: { index }`.

**`ark-toaster`** — `position` (`top-left` … `bottom-right`), `rich-colors`, `close-button` (`"false"` hides), `max-visible`, `duration` (ms; `0` keeps toasts until dismissed), `lang`, `theme`. Fed by the `toast` service from `@tooark/core` (or the `toast()`/`dismiss()` methods); emits `ark-toast-action` with `detail: { id, actionId }` when an action button is clicked.

**`announce()`** (service, `@tooark/core`) — `announce(text, politeness = "polite")` speaks a message to screen readers through a single hidden live region appended to `document.body` (`data-ark="announcer"`, with a `role="status"` child for `polite` and a `role="alert"` child for `assertive`). Components use it to announce a result in place (a button's `status`, "copied", chosen files) without creating live regions inside the host, where the text would join the control's accessible name. Calling it again with the same text announces it again; it is a no-op without a DOM.

---

## Motion system

Motion is designed in three layers so the components stay dependency-free:

1. **Tokens** (`@tooark/tokens`) — durations (`--ark-duration-none/instant/quick/default/moderate/gentle/slow/long`, 0–1000 ms), easing curves (`--ark-ease-linear/standard/in/out/in-out/overshoot`) and the slide distance. `prefers-reduced-motion` zeroes every duration at the token level, covering the whole system at once.
2. **Presets** (`@tooark/core`) — zero-dependency CSS keyframes/classes (`.ark-animate-*`, `.ark-skeleton`, `.ark-skeleton-animated`) and WAAPI helpers (`arkEnter`, `arkExit`) used by the components themselves (e.g. toast enter/exit).
3. **`@tooark/motion`** (opt-in) — `arkStaggerEnter`, `arkReveal`, `arkFlip` and `arkSwipe` on top of the Motion library, for spring physics and scroll-driven effects. Only projects that install this package pay for the library.

Duration scale (`ArkDuration` in TypeScript, `--ark-duration-*` in CSS, `ARK_DURATION_MS` as the JS mirror). Every helper (`arkEnter`, `arkExit`, `@tooark/motion`) accepts either a token name or a raw number in milliseconds:

| Token      | Value   | Intended use                                                                              |
| ---------- | ------- | ----------------------------------------------------------------------------------------- |
| `none`     | 0 ms    | Disables the transition (what every token becomes under `prefers-reduced-motion`).        |
| `instant`  | 75 ms   | Micro-feedback: hover, focus ring, pressed state.                                         |
| `quick`    | 150 ms  | Small elements entering/leaving (popups, tooltips, calendar grid); default for `arkExit`. |
| `default`  | 250 ms  | Default for `arkEnter`, `arkStaggerEnter` and the `.ark-animate-*` presets.               |
| `moderate` | 350 ms  | Emphatic feedback (`.ark-animate-shake`) and medium-sized surfaces.                       |
| `gentle`   | 500 ms  | Large surfaces: panels, drawers, page-level transitions.                                  |
| `slow`     | 700 ms  | Orchestrated sequences and staggered lists.                                               |
| `long`     | 1000 ms | Ambient motion: loaders, progress, attention loops.                                       |

Easing curves (`ArkEasing` in TypeScript, `--ark-ease-*` in CSS, `ARK_EASING_CSS` as the JS mirror). The helpers also accept any CSS timing function as a string, and `@tooark/motion` accepts a cubic-bezier array or a Motion easing name:

| Token       | Curve                               | Intended use                                                                                                 |
| ----------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `linear`    | `linear`                            | Continuous motion: spinners, progress, marquee (`.ark-animate-spin`).                                        |
| `standard`  | `cubic-bezier(0.2, 0, 0, 1)`        | General-purpose transitions between on-screen states.                                                        |
| `in`        | `cubic-bezier(0.4, 0, 1, 1)`        | Accelerating exits; default for `arkExit`.                                                                   |
| `out`       | `cubic-bezier(0, 0, 0.2, 1)`        | Decelerating enters; default for `arkEnter`, `arkStaggerEnter` and the `.ark-animate-*` presets.             |
| `in-out`    | `cubic-bezier(0.4, 0, 0.2, 1)`      | Symmetric state changes: shake, pulse, skeleton.                                                             |
| `overshoot` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful enters that overshoot and settle (Motion's `backOut`). For real spring physics use `@tooark/motion`. |

Motion tokens are overridden like the color tokens, with one rule: keep duration overrides inside `@media (prefers-reduced-motion: no-preference)`. Under `reduce` everything the library animates stops: the `.ark-animate-*` presets and the JS helpers run at 0 ms regardless of `--ark-animate-duration` or of a token redefined on a subtree, and the root tokens are zeroed with `!important`, so a `:root` override written outside that media query cannot re-enable your own token-driven CSS by accident. To deliberately keep motion under reduced motion, declare the token with `!important` (or override the preset's `animation-duration`) inside your own `@media (prefers-reduced-motion: reduce)` block.

```css
@media (prefers-reduced-motion: no-preference) {
  :root {
    --ark-duration-default: 180ms;
    --ark-duration-gentle: 400ms;
  }
}
```

**Continuous loaders are exempt from reduced motion by design.** `.ark-animate-spin` (the spinner inside `ark-button`) keeps spinning under `prefers-reduced-motion: reduce`: reduced motion exists to avoid vestibular discomfort, which a 1 em rotation does not cause, while a frozen spinner removes the only sign that something is in progress. That is also why it runs on a fixed `1s` instead of a duration token, which the zeroing would freeze. Attention loops do stop: `.ark-animate-shake`, `.ark-animate-pulse` and `.ark-skeleton-animated`. `.ark-skeleton` itself is static by default (an infinite pulse on the one region with nothing to read draws the eye and falls under WCAG 2.2.2); add `.ark-skeleton-animated` to opt into the pulse, and give the content that replaces a skeleton `.ark-animate-fade-in` if you want it to ease in.

---

## Getting started

### Vanilla / any framework

```ts
import { registerTooarkComponents } from "@tooark/web-components";
import "@tooark/web-components/styles.css";

registerTooarkComponents();
```

`styles.css` is the only stylesheet you need: it bundles the design tokens, the motion presets and the component styles. It is safe to load next to your own CSS framework:

- **No global reset.** Tailwind's preflight is not shipped; a scoped reset applies only inside `ark-*` elements.
- **Prefixed utilities and variables.** Every component class is `ark:*` (e.g. `ark:inline-flex`) and theme variables are `--ark-*` (e.g. `--ark-color-primary`), so nothing collides with a Tailwind v3/v4 setup in your app.

```html
<ark-button intent="primary" size="md">Save</ark-button>
<ark-button icon-only rounded="full" intent="success" aria-label="Confirm">✓</ark-button>

<ark-switch labels icons intent="success" label="Notifications"></ark-switch>

<ark-toggle-group value="day">
  <ark-toggle value="day">Day</ark-toggle>
  <ark-toggle value="week">Week</ark-toggle>
  <ark-toggle value="month">Month</ark-toggle>
</ark-toggle-group>

<ark-input label="Name" placeholder="Your full name" helper="As on your ID"></ark-input>

<!-- Field + popup; the form receives the ISO value under name="date" -->
<ark-datepicker input mode="date" lang="en" name="date"></ark-datepicker>

<!-- Inline panels (no `input`): date + time -->
<ark-datepicker lang="en"></ark-datepicker>

<ark-calendar lang="en" event-display="count"></ark-calendar>

<ark-clock hours-format="12" step-minutes="15"></ark-clock>

<ark-scheduler view="week" lang="en" hour-start="8" hour-end="18"></ark-scheduler>

<ark-toaster position="bottom-right" lang="pt"></ark-toaster>
```

`events` on `ark-calendar`/`ark-scheduler` also accepts the JS property, which avoids serializing JSON into the attribute:

```ts
document.querySelector("ark-scheduler").events = [
  {
    id: "1",
    title: "Daily",
    start: "2026-09-01T09:00",
    end: "2026-09-01T09:15",
    intent: "info",
  },
];
```

```ts
import { toast } from "@tooark/core";

toast.success("Saved", { description: "Your changes were published." });
```

### React

```tsx
import { ArkButton, ArkDatepicker, ArkScheduler, ArkToaster } from "@tooark/react";
```

Wrapper props are camelCase and typed (`eventDisplay`, `stepMinutes`, `hoursFormat`, `hourStart`…); object props (`events`, `localeJson`) are serialized to the attribute for you, and custom events arrive as `onChange`/`onEventClick`/`onSlotClick`/`onViewChange`/`onRangeChange` receiving the event `detail`.

### Vue 3

```ts
import { ArkButton, ArkDatepicker, ArkScheduler, ArkToaster } from "@tooark/vue";
```

Events keep their native names (`@ark-change`, `@ark-event-click`, …) and deliver the `detail` directly.

### Angular

Import the wrapper components from `@tooark/angular` (`ArkDatepickerComponent`, `ArkSchedulerComponent`, …). Each one is standalone, uses the `<ark-*-wrapper>` selector and re-emits the custom events as `@Output()` (`arkChange`, `arkEventClick`, `arkSlotClick`, `arkViewChange`, `arkRangeChange`).

The package is built with `ng-packagr` in partial Ivy compilation, so it works in AOT production builds. It requires Angular ≥ 21.2.19 (the same floor the workspace enforces for security fixes). The custom elements are registered lazily in each wrapper constructor and skipped on the server, so the wrappers are SSR-safe.

### Theming and design tokens

Every color the components use is a semantic token with a light and a dark value (`light-dark()`), so theming is pure CSS:

- **Theme**: by default components inherit the page's `color-scheme`, like native controls: a light page gets light components even on a dark OS, and an app that declares `:root { color-scheme: light dark }` follows the system. `theme="light"` or `theme="dark"` on an element forces one side for it and its descendants. No JavaScript is involved.
- **Brand**: override the tokens in your own CSS. Inside the component stylesheet they carry the `ark` prefix:

```css
:root {
  --ark-color-primary: light-dark(oklch(45% 0.2 264), oklch(80% 0.15 264));
  --ark-color-primary-fg: #fff;
  --ark-color-primary-hover: light-dark(oklch(40% 0.2 264), oklch(85% 0.15 264));
}
```

Each intent (`primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`) has `<intent>`, `-fg`, `-hover`, `-soft`, `-soft-fg`, `-border` and `-ring`; neutral surfaces are `surface`, `surface-muted`, `surface-strong`, `surface-raised`, `fg`, `fg-soft`, `fg-muted`, `fg-faint`, `fg-placeholder`, `border`, `border-strong`, `muted` and `ring`. The full list with its roles lives in [tokens.css](packages/tokens/tokens.css).

Two more scales are shared by the form controls:

- **`size`** (`xs`/`sm`/`md`/`lg`/`xl`) maps to the `--ark-size-*` tokens (1.5 / 1.75 / 2.25 / 2.75 / 3.25 rem, i.e. 24 to 52 px). `ark-button`, `ark-input` and `ark-toggle` apply the token as `min-height` (and as `min-width` on icon-only buttons), so controls of the same size line up in a row and overriding `--ark-size-md` resizes every control at once; `ark-switch` uses proportional track dimensions instead.
- **`rounded`** (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`full`) maps to Tailwind's radius scale (`--ark-radius-xs` … `--ark-radius-xl`, 0.125 to 0.75 rem).

#### Integrating with an existing theme

If your app already has its own design variables (a generated theme, another design system), bridge them to the `--ark-*` tokens instead of duplicating values. Three things decide how the components look:

1. **`color-scheme` on the page.** The tokens are `light-dark()` values, so the components read the page's `color-scheme` and nothing else: without a declaration every component renders light, whatever the OS preference. Declare it wherever your app toggles its theme:

   ```css
   html {
     color-scheme: light;
   }
   html.dark {
     color-scheme: dark;
   } /* or [data-theme="dark"]; `light dark` follows the system */
   ```

2. **Brand bridge.** Point the tokens at your variables. `light-dark()` is not needed when your variables already switch with the theme, and every token you leave alone keeps its default:

   ```css
   :root {
     --ark-color-primary: var(--brand);
     --ark-color-primary-fg: var(--brand-fg);
     --ark-color-primary-hover: var(--brand-hover);
     --ark-color-primary-soft: var(--brand-soft);
     --ark-color-primary-soft-fg: var(--brand-soft-fg);
     --ark-color-primary-border: var(--brand-border);
     --ark-color-primary-ring: var(--brand-ring);
   }
   ```

   If your theme also defines neutrals, bridge `--ark-color-surface*`, `--ark-color-fg*` and `--ark-color-border*` as well; otherwise your greys and the components' greys come from two sources.

3. **Density.** `--ark-size-*` sets the control heights and `--ark-text-xs`/`--ark-text-sm` most of the text inside the controls (a few micro-labels in the calendar, clock, scheduler and switch use fixed pixel sizes):

   ```css
   :root {
     --ark-size-sm: 2rem; /* 32 px */
     --ark-size-md: 2.5rem; /* 40 px */
     --ark-size-lg: 3rem; /* 48 px */
     --ark-text-sm: 0.75rem;
   }
   ```

Duration and easing overrides follow the rule from the [motion system](#motion-system): keep them inside `@media (prefers-reduced-motion: no-preference)`.

`ark-chart` and `ark-wysiwyg` cannot be themed by CSS alone (ECharts and Tiptap paint their own colors), so their `theme="auto"` resolves the host's computed `color-scheme` when the element is created: a page that forces `dark` gets a dark chart, a page that leaves it at `light dark` (or undeclared) follows the system preference. That resolution is not re-run when the page toggles later, so an app that switches theme at runtime should drive `theme="light|dark"` on these two elements together with the page.

To reuse the same tokens as utilities (`bg-primary`, `text-fg-muted`, …) in your own Tailwind v4 project, import them in your CSS entry:

```css
@import "tailwindcss";
@import "@tooark/tokens/tokens.css";
```

This is independent from the component stylesheet: the components carry their own prefixed copy of the theme, so your app's Tailwind configuration never changes how the components look.

---

## Development

Requirements: **Node.js ≥ 22** and **pnpm 11** (version pinned via `packageManager`).

```bash
pnpm install          # install all workspace dependencies
pnpm build            # build every package
pnpm dev:storybook    # run Storybook at http://localhost:6006
pnpm clean            # remove build outputs
pnpm check            # lint, formatting and import order (Biome)
pnpm check:fix        # apply Biome fixes and formatting
```

Library packages build with Rollup (`tsc` for the React and Vue wrappers, `ng-packagr` for Angular). `@tooark/core` and `@tooark/web-components` additionally compile their CSS entry (`src/styles/index.css`) with the Tailwind CLI into `dist/styles.css`, then run `scripts/check-css.mjs`, a smoke test that fails the build if the stylesheet was not compiled or is missing expected classes. Component classes must be written with the `ark:` prefix (`ark:flex`, `ark:hover:bg-surface-muted`); unprefixed utilities are not generated. Storybook processes the same CSS through the `@tailwindcss/vite` plugin, so there is no PostCSS configuration in the repo.

Linting, formatting and import ordering are handled by [Biome](https://biomejs.dev/) (`biome.json` at the root: 120-column lines, double quotes, no trailing commas). CI runs `biome ci` before the build, so run `pnpm check:fix` before committing.

### Tests

Component tests run with the **Storybook Vitest addon**: every story is executed as a smoke test in a real Chromium browser (Playwright), plus interaction tests (`play` functions) and accessibility checks (axe-core via `@storybook/addon-a11y`).

```bash
pnpm exec playwright install chromium        # one-time browser download
pnpm --filter storybook test                 # run the suite
pnpm --filter storybook exec vitest run --project storybook --coverage
```

Tests can also be triggered from the Storybook UI ("Run tests" widget). CI builds every package (including the CSS smoke test) and then runs the same suite on every push/PR via [GitHub Actions](.github/workflows/tests.yml).

### E2E test hooks

Every internal element a component creates carries stable hooks for end-to-end tests, in two layers:

1. **`data-ark` (static, zero configuration)** — the main element gets `data-ark="<component>"` and each internal part gets `data-ark="<component>-<part>"`. These selectors never break when utility classes change.
2. **`testid` (per instance)** — declare `testid="..."` on the host and the value is propagated as `data-testid` to the main element, suffixed with `-<part>` on internal parts — the format `getByTestId` (Playwright, Cypress, Testing Library) looks for by default. Also available as a typed `testid` prop on the React/Vue/Angular wrappers.

```html
<ark-switch testid="notifications"></ark-switch>
<!-- renders: -->
<button data-ark="switch" data-testid="notifications" role="switch">
  <span data-ark="switch-thumb" data-testid="notifications-thumb"></span>
  ...
</button>
```

```ts
// Playwright
await page.getByTestId("notifications").click();
await expect(page.locator('[data-ark="switch-thumb"]')).toBeVisible();
await page.locator('[data-ark="datepicker-day"][data-date="2026-09-15"]').click();
```

Hooks per component:

| Component          | Main element   | Internal parts                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-button`       | `button`       | `button-spinner`, `button-link` (href mode)                                                                                                                                                                                                                                                                                                                                                   |
| `ark-scheduler`    | `scheduler`    | `scheduler-header`, `scheduler-today`, `scheduler-prev`, `scheduler-next`, `scheduler-title`, `scheduler-views`, `scheduler-view-{view}`, `scheduler-body`, `scheduler-scroller`, `scheduler-grid`, `scheduler-day` (+ `data-date`), `scheduler-slot` (+ `data-start`), `scheduler-event` (+ `data-event-id`), `scheduler-event-more`, `scheduler-allday`, `scheduler-now`, `scheduler-empty` |
| `ark-switch`       | `switch`       | `switch-thumb`, `switch-label-on`, `switch-label-off`, `switch-input`                                                                                                                                                                                                                                                                                                                         |
| `ark-toggle`       | `toggle`       | —                                                                                                                                                                                                                                                                                                                                                                                             |
| `ark-toggle-group` | `toggle-group` | —                                                                                                                                                                                                                                                                                                                                                                                             |
| `ark-calendar`     | `calendar`     | `calendar-prev`, `calendar-next`, `calendar-title`, `calendar-grid`, `calendar-day` (+ `data-date`), `calendar-months`/`calendar-month` (+ `data-month`), `calendar-years`/`calendar-year` (+ `data-year`), `calendar-event`, `calendar-event-more`, `calendar-today`, `calendar-clear`                                                                                                       |
| `ark-clock`        | `clock`        | `clock-hours`, `clock-minutes`, `clock-seconds`, `clock-meridiem` (options via `data-value`)                                                                                                                                                                                                                                                                                                  |
| `ark-input`        | `input`        | `input-label`, `input-suffix`, `input-helper`/`input-error`                                                                                                                                                                                                                                                                                                                                   |
| `ark-carousel`     | `carousel`     | `carousel-overlay`, `carousel-slide-{i}` (on your own slide elements), `carousel-arrow-prev`, `carousel-arrow-next`, `carousel-dots`, `carousel-dot-{i}`                                                                                                                                                                                                                                      |
| `ark-datepicker`   | `datepicker`   | Composition: the field carries the `ark-input` hooks (testid forwarded), inner panels get testid suffixed `-calendar`/`-clock`; its own: `datepicker-toggle`, `datepicker-popup`.                                                                                                                                                                                                             |
| `ark-toaster`      | `toaster`      | `toaster-toast` (+ `data-toast-id`), `toaster-toast-title`, `toaster-toast-description`, `toaster-toast-close`, `toaster-toast-action`, `toaster-toast-cancel`                                                                                                                                                                                                                                |

For `ark-button`, `ark-toggle`, `ark-toggle-group` and `ark-carousel` the main hook sits on the host element itself, since the host is the control; `input-suffix` is applied to your own `slot="suffix"` element and `carousel-slide-{i}` to your own slides.

Always prefer semantic selectors (`getByRole("switch", { name: "..." })`) when possible — the hooks are the safety net for repeated instances and visual assertions.

---

## Conventions

- **Naming**: elements `ark-*`, TypeScript types/classes `Ark*`, helper functions `ark*`, CSS custom properties `--ark-*`, packages `@tooark/*`.
- **Layering**: a package may only depend on layers below it. Animation libraries never enter `@tooark/core` or `@tooark/web-components`.
- **Light DOM**: components never move or wrap the children you declare. The host element is the styled control or container (`ark-button`, `ark-toggle`, `ark-toggle-group`, `ark-input`, `ark-carousel`), so frameworks keep full ownership of their children.
- **Accessibility**: `prefers-reduced-motion` is honored globally through the motion tokens; stories run axe-core checks.

---

## License

Licensed under the [Apache License 2.0](LICENSE) © 2026 Tooark.

Attribution notices live in [NOTICE](NOTICE); third-party dependency licenses are documented in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
