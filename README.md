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
| `@tooark/core`           | Shared foundation: TypeScript types (`ArkIntent`, `ArkSize`, …), i18n locales (`en`, `pt`, `es`), the toast service and the dependency-free motion layer (CSS presets + WAAPI helpers `arkEnter`/`arkExit`). |
| `@tooark/web-components` | The native Custom Elements: `ark-button`, `ark-carousel`, `ark-datepicker`, `ark-switch`, `ark-toaster`, `ark-toggle` and `ark-toggle-group`.                                                                |
| `@tooark/react`          | React wrappers with typed props.                                                                                                                                                                             |
| `@tooark/vue`            | Vue 3 wrappers.                                                                                                                                                                                              |
| `@tooark/angular`        | Angular wrapper components.                                                                                                                                                                                  |
| `@tooark/chart`          | `ark-chart` — charts built on [ECharts](https://echarts.apache.org/) (peer dependency).                                                                                                                      |
| `@tooark/wysiwyg`        | `ark-wysiwyg` — rich-text editor and viewer built on [Tiptap](https://tiptap.dev/).                                                                                                                          |
| `@tooark/motion`         | **Opt-in** advanced animation helpers built on [Motion](https://motion.dev/): staggered list entrances, scroll reveal, FLIP reordering and swipe gestures with spring physics.                               |

---

## Components

| Element            | Package        | Highlights                                                                                                                                     |
| ------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-button`       | web-components | Intents, sizes, style variants (solid/outline/ghost), `rounded` (up to `full`), `loading`/`icon-only`/`full-width` states, link mode (`href`). |
| `ark-carousel`     | web-components | Pointer drag with snap, autoplay, loop, dots and arrows.                                                                                       |
| `ark-datepicker`   | web-components | Localized (`en`/`pt`/`es` + custom), themes, intents.                                                                                          |
| `ark-switch`       | web-components | Accessible on/off switch (`role="switch"`): optional ON/OFF text and ✓/✕ icons, intents, form participation via hidden checkbox.               |
| `ark-toaster`      | web-components | Sonner-style toasts: programmatic API, positions, rich colors, actions, animated enter/exit, localized close button.                           |
| `ark-toggle`       | web-components | Pressed-state button (`aria-pressed`), standalone (outline/tinted per intent) or as a group item.                                              |
| `ark-toggle-group` | web-components | Segmented control: exclusive (default) or multiple selection, synced `value`, propagates `size`/`intent`/`theme`/`disabled` to items.          |
| `ark-chart`        | chart          | ECharts-powered chart types with theme support.                                                                                                |
| `ark-wysiwyg`      | wysiwyg        | Tiptap-based editor + read-only viewer.                                                                                                        |

### Key attributes

**`ark-button`** — `variant` (`solid`/`outline`/`ghost` or an intent), `intent`, `size` (`sm`–`xl`), `rounded` (`none`/`sm`/`md`/`lg`/`xl`/`full` — combined with `icon-only`, `full` yields a circular button), `loading` (spinner + `aria-busy` + blocked clicks), `icon-only` (symmetric padding), `full-width`, `href`/`target` (renders `<a role="button">`; `_blank` gets `rel="noopener noreferrer"`), `disabled`, `type`, `theme`, `color`/`text-color`.

**`ark-switch`** — `checked`, `disabled`, `size`, `intent`, `theme`, `color`, `labels` (shows ON/OFF inside the track; customizable via `label-on`/`label-off`), `icons` (✓/✕ on the thumb), `label` (accessible name), `name`/`value` (form submission when checked). Emits `change` with `detail: { checked }`.

**`ark-toggle`** — `pressed`, `value`, `disabled`, `size`, `intent`, `theme`. Emits `change` with `detail: { pressed, value }`.

**`ark-toggle-group`** — `value` (selected value(s), synced with items), `multiple`, `disabled`, `size`, `intent`, `theme`. Emits `change` with `detail: { value }` (exclusive) or `detail: { values }` (multiple).

---

## Motion system

Motion is designed in three layers so the components stay dependency-free:

1. **Tokens** (`@tooark/tokens`) — durations (`--ark-duration-instant…slower`), easing curves (`--ark-ease-standard/in/out/in-out/spring`) and the slide distance. `prefers-reduced-motion` zeroes every duration at the token level, covering the whole system at once.
2. **Presets** (`@tooark/core`) — zero-dependency CSS keyframes/classes (`.ark-animate-*`, `.ark-skeleton`) and WAAPI helpers (`arkEnter`, `arkExit`) used by the components themselves (e.g. toast enter/exit).
3. **`@tooark/motion`** (opt-in) — `arkStaggerEnter`, `arkReveal`, `arkFlip` and `arkSwipe` on top of the Motion library, for spring physics and scroll-driven effects. Only projects that install this package pay for the library.

---

## Getting started

### Vanilla / any framework

```ts
import { registerTooarkComponents } from "@tooark/web-components";
import "@tooark/web-components/styles.css";

registerTooarkComponents();
```

```html
<ark-button intent="primary" size="md">Save</ark-button>
<ark-button icon-only rounded="full" intent="success" aria-label="Confirm"
  >✓</ark-button
>

<ark-switch labels icons intent="success" label="Notifications"></ark-switch>

<ark-toggle-group value="day">
  <ark-toggle value="day">Day</ark-toggle>
  <ark-toggle value="week">Week</ark-toggle>
  <ark-toggle value="month">Month</ark-toggle>
</ark-toggle-group>

<ark-toaster position="bottom-right" lang="pt"></ark-toaster>
```

```ts
import { toast } from "@tooark/core";

toast.success("Saved", { description: "Your changes were published." });
```

### React

```tsx
import { ArkButton, ArkToaster } from "@tooark/react";
```

### Vue 3

```ts
import { ArkButton, ArkToaster } from "@tooark/vue";
```

### Angular

Import the wrapper components from `@tooark/angular`.

### Design tokens with Tailwind v4

```css
@import "tailwindcss";
@import "@tooark/tokens/tokens.css";
```

---

## Development

Requirements: **Node.js ≥ 22** and **pnpm 11** (version pinned via `packageManager`).

```bash
pnpm install          # install all workspace dependencies
pnpm build            # build every package
pnpm dev:storybook    # run Storybook at http://localhost:6006
pnpm clean            # remove build outputs
```

### Tests

Component tests run with the **Storybook Vitest addon**: every story is executed as a smoke test in a real Chromium browser (Playwright), plus interaction tests (`play` functions) and accessibility checks (axe-core via `@storybook/addon-a11y`).

```bash
pnpm exec playwright install chromium        # one-time browser download
pnpm --filter storybook test                 # run the suite
pnpm --filter storybook exec vitest run --project storybook --coverage
```

Tests can also be triggered from the Storybook UI ("Run tests" widget). CI runs the same suite on every push/PR via [GitHub Actions](.github/workflows/tests.yml).

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
await page
  .locator('[data-ark="datepicker-day"][data-date="2026-09-15"]')
  .click();
```

Hooks per component:

| Component          | Main element   | Internal parts                                                                                                                                                     |
| ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ark-button`       | `button`       | `button-spinner`                                                                                                                                                   |
| `ark-switch`       | `switch`       | `switch-thumb`, `switch-label-on`, `switch-label-off`, `switch-input`                                                                                              |
| `ark-toggle`       | `toggle`       | —                                                                                                                                                                  |
| `ark-toggle-group` | `toggle-group` | —                                                                                                                                                                  |
| `ark-carousel`     | `carousel`     | `carousel-viewport`, `carousel-track`, `carousel-slide-{i}`, `carousel-arrow-prev`, `carousel-arrow-next`, `carousel-dots`, `carousel-dot-{i}`                     |
| `ark-datepicker`   | `datepicker`   | `datepicker-prev`, `datepicker-next`, `datepicker-title`, `datepicker-grid`, `datepicker-day` (+ `data-date="YYYY-MM-DD"`), `datepicker-today`, `datepicker-clear` |
| `ark-toaster`      | `toaster`      | `toaster-toast` (+ `data-toast-id`), `toaster-toast-title`, `toaster-toast-description`, `toaster-toast-close`, `toaster-toast-action`, `toaster-toast-cancel`     |

Always prefer semantic selectors (`getByRole("switch", { name: "..." })`) when possible — the hooks are the safety net for repeated instances and visual assertions.

---

## Conventions

- **Naming**: elements `ark-*`, TypeScript types/classes `Ark*`, helper functions `ark*`, CSS custom properties `--ark-*`, packages `@tooark/*`.
- **Layering**: a package may only depend on layers below it. Animation libraries never enter `@tooark/core` or `@tooark/web-components`.
- **Accessibility**: `prefers-reduced-motion` is honored globally through the motion tokens; stories run axe-core checks.

---

## License

Licensed under the [Apache License 2.0](LICENSE) © 2026 Tooark.

Attribution notices live in [NOTICE](NOTICE); third-party dependency licenses are documented in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
