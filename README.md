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
| `@tooark/web-components` | The native Custom Elements: `ark-button`, `ark-carousel`, `ark-datepicker`, `ark-toaster`.                                                                                                                   |
| `@tooark/react`          | React wrappers with typed props.                                                                                                                                                                             |
| `@tooark/vue`            | Vue 3 wrappers.                                                                                                                                                                                              |
| `@tooark/angular`        | Angular wrapper components.                                                                                                                                                                                  |
| `@tooark/chart`          | `ark-chart` — charts built on [ECharts](https://echarts.apache.org/) (peer dependency).                                                                                                                      |
| `@tooark/wysiwyg`        | `ark-wysiwyg` — rich-text editor and viewer built on [Tiptap](https://tiptap.dev/).                                                                                                                          |
| `@tooark/motion`         | **Opt-in** advanced animation helpers built on [Motion](https://motion.dev/): staggered list entrances, scroll reveal, FLIP reordering and swipe gestures with spring physics.                               |

---

## Components

| Element          | Package        | Highlights                                                                                                           |
| ---------------- | -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `ark-button`     | web-components | Intents, sizes and style variants (solid/outline/ghost).                                                             |
| `ark-carousel`   | web-components | Pointer drag with snap, autoplay, loop, dots and arrows.                                                             |
| `ark-datepicker` | web-components | Localized (`en`/`pt`/`es` + custom), themes, intents.                                                                |
| `ark-toaster`    | web-components | Sonner-style toasts: programmatic API, positions, rich colors, actions, animated enter/exit, localized close button. |
| `ark-chart`      | chart          | ECharts-powered chart types with theme support.                                                                      |
| `ark-wysiwyg`    | wysiwyg        | Tiptap-based editor + read-only viewer.                                                                              |

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

---

## Conventions

- **Naming**: elements `ark-*`, TypeScript types/classes `Ark*`, helper functions `ark*`, CSS custom properties `--ark-*`, packages `@tooark/*`.
- **Layering**: a package may only depend on layers below it. Animation libraries never enter `@tooark/core` or `@tooark/web-components`.
- **Accessibility**: `prefers-reduced-motion` is honored globally through the motion tokens; stories run axe-core checks.

---

## License

Licensed under the [Apache License 2.0](LICENSE) © 2026 Tooark.

Attribution notices live in [NOTICE](NOTICE); third-party dependency licenses are documented in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
