# @tooark/tokens

[![npm](https://img.shields.io/npm/v/@tooark/tokens?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/tokens)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Design primitives of the Tooark design system: colors by intent and the size scale as a Tailwind v4 `@theme`, motion tokens as CSS custom properties, and TypeScript types.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](./README.pt-BR.md)

---

## Contents

- [Overview](#-overview)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Components](#-components)
- [Usage examples](#-usage-examples)
- [Dependencies](#-dependencies)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

The `@tooark/tokens` package provides:

- `tokens.css`: a `@theme static` block with semantic colors (`primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, plus `surface*`, `fg*`, `border*`, `muted`, `ring`) as `light-dark()` values, the size scale (`--size-xs…xl`) and the `--text-2xs` step (no radii: the `rounded` scale is Tailwind's own, `ArkRounded` only types it);
- motion tokens outside `@theme`: `--ark-duration-*` (eight steps), `--ark-ease-*` (`linear`, `standard`, `in`, `out`, `in-out`, `overshoot`, `sheet`) and `--ark-motion-distance`, zeroed under `prefers-reduced-motion`;
- JS mirrors of the motion tokens (`ARK_DURATION_MS`, `ARK_EASING_CSS`, `ARK_MOTION_DISTANCE`) for WAAPI fallbacks;
- `resolveColorScheme(element)` and `observeColorScheme(element, onChange)` to resolve and follow the page theme;
- the primitive types every package shares: `ArkIntent`, `ArkSize`, `ArkRounded`, `ArkTheme`, `ArkDuration`, `ArkEasing`.

---

## 🔧 Installation

```bash
pnpm add @tooark/tokens
```

Not needed directly when you use `@tooark/web-components`: its `styles.css` already bundles the tokens.

---

## ⚙️ Configuration

`tokens.css` is written for the Tailwind v4 compiler: the colors, sizes and `--text-2xs` live in a `@theme` block, which a browser reading the file as plain CSS drops (only the motion tokens survive). Two ways to get them:

- through the Tooark stylesheets: `@tooark/web-components/styles.css` (or `@tooark/core/styles.css` without the components) already carries them, compiled with the `ark` prefix (`--ark-color-*`, `--ark-size-*`, `--ark-text-2xs`);
- in your own Tailwind v4 entry: import `tokens.css` after Tailwind and they become `--color-*`, `--size-*` and `--text-2xs` variables plus utilities (`bg-primary`, `text-primary-fg`, `border-border`, `text-2xs`).

Either way, declare the page's `color-scheme` (the colors are `light-dark()` values, so the theme is pure CSS). In a Tailwind entry:

```css
@import "tailwindcss";
@import "@tooark/tokens/tokens.css";

:root {
  color-scheme: light dark; /* follow the system; or "light" / "dark" to force a side */
}
```

---

## 📦 Components

### CSS custom properties

Names as the Tooark stylesheets expose them; in your own Tailwind entry the `@theme` ones have no `ark-` prefix (`--color-surface`, `--size-md`, `--text-2xs`).

- Colors: `--ark-color-<intent>`, `-fg`, `-hover`, `-soft`, `-soft-fg`, `-border`, `-ring`; neutrals `--ark-color-surface`, `-surface-muted`, `-surface-strong`, `-surface-raised`, `-fg`, `-fg-soft`, `-fg-muted`, `-fg-faint`, `-fg-placeholder`, `-border`, `-border-strong`, `-muted`, `-ring`.
- Sizes: `--ark-size-xs…xl` (1.5 / 1.75 / 2.25 / 2.75 / 3.25 rem, the min-height of form controls); `--ark-text-2xs` (0.6875 rem) for micro-labels.
- Motion (plain custom properties outside `@theme`: the same name everywhere, even with `tokens.css` as plain CSS): `--ark-duration-none|instant|quick|default|moderate|gentle|slow|long`, `--ark-ease-*`, `--ark-motion-distance`.

### JavaScript

- `resolveColorScheme(element?)` → `"light" | "dark"` from the element's computed `color-scheme` (system preference when the page leaves it at `light dark`).
- `observeColorScheme(element, onChange)` → dispose function; watches `class`, `style`, `data-theme` and `theme` on `<html>`/`<body>` plus the system preference.
- `ARK_DURATION_MS`, `ARK_EASING_CSS`, `ARK_MOTION_DISTANCE`.
- Types: `ArkIntent`, `ArkSize`, `ArkRounded`, `ArkStyleVariant`, `ArkTheme`, `ArkThemeSelected`, `ArkDuration`, `ArkEasing`.

---

## 📝 Usage examples

### Styling your own component with the tokens

```css
/* with @tooark/web-components/styles.css (or @tooark/core/styles.css) on the page */
.card {
  background: var(--ark-color-surface);
  color: var(--ark-color-fg);
  border: 1px solid var(--ark-color-border);
  border-radius: 0.5rem;
  transition: opacity var(--ark-duration-quick) var(--ark-ease-out);
}

.card--danger {
  background: var(--ark-color-danger-soft);
  color: var(--ark-color-danger-soft-fg);
}
```

### Following the page theme from JavaScript

```ts
import { observeColorScheme, resolveColorScheme } from "@tooark/tokens";

const host = document.querySelector("#chart")!;
applyTheme(resolveColorScheme(host)); // "light" | "dark"

const stop = observeColorScheme(host, (theme) => applyTheme(theme)); // runtime toggles
// later: stop();
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                        | Version | Description                |
| ---------------------------------------------- | ------- | -------------------------- |
| [`tslib`](https://www.npmjs.com/package/tslib) | ^2.8.1  | TypeScript runtime helpers |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/tokens` is released in lockstep with every other `@tooark/*` package.

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
