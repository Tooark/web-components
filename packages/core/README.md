# @tooark/core

[![npm](https://img.shields.io/npm/v/@tooark/core?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/core)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Shared foundation of the Tooark components: types, i18n, the toast and announce services, dependency-free motion and the overlay helpers the components are built from.

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

The `@tooark/core` package provides:

- the `Ark*StyleOptions` types of every component (what the framework wrappers extend) and the shared primitives re-exported from `@tooark/tokens`;
- i18n: `en`, `pt`, `es` locales and `resolveLocale(lang, localeJson?)`, which merges custom JSON over English for `lang="custom"`;
- services: `toast()` (fed to `ark-toaster` through window events) and `announce()` (one screen-reader live region for the whole page);
- motion: `arkEnter`/`arkExit` (WAAPI on the design tokens, reduced-motion aware) and the `.ark-animate-*` CSS presets;
- overlay helpers on the Popover API: `trapFocus`, `openPopover`/`closePopover` (with `lockScroll`), `positionAnchored`, `focusableElements`, `isPopoverOpen`;
- `coerceBooleanAttr` for boolean setters that must accept `""`/`"false"` (React 19 sets properties).

---

## 🔧 Installation

```bash
pnpm add @tooark/core
```

`@tooark/web-components` depends on it, but only as a transitive dependency: with pnpm (isolated `node_modules`) your app cannot import it from there. Add it yourself whenever your code imports from `@tooark/core` (`toast`, `announce`, the motion or overlay helpers), with or without the components; the React, Vue and Angular wrappers re-export `toast`, `showToast` and `dismissToast`.

---

## ⚙️ Configuration

The motion presets need the tokens and the `.ark-animate-*` classes on the page. They are part of `@tooark/web-components/styles.css`; without the components, import the core stylesheet:

```ts
import "@tooark/core/styles.css"; // tokens + motion presets
```

---

## 📦 Components

### Services

- `toast(title, options?)`, `toast.success|info|warning|error|loading(...)`, `toast.custom(options)`, `toast.dismiss(id?)` / `dismissToast(id?)` (no `id` dismisses every toast), `showToast(options)` — options: `id`, `title`, `description`, `type`, `duration` (ms, `0` keeps it), `actionLabel`/`actionId`, `cancelLabel`.
- `announce(text, politeness = "polite")` — `"polite" | "assertive"`.

### Motion

- `arkEnter(element, preset, options)` / `arkExit(element, preset, options)` → `Promise<void>`; presets `fade`, `slide-up`, `slide-down`, `slide-left`, `slide-right`, `scale`; options `duration` (token or ms), `easing` (token or CSS), `distance`.
- `prefersReducedMotion()`.

### Overlay helpers

- `trapFocus(container, { initial, returnTo, onOutsidePointer })` → release function.
- `openPopover(host, preset, { ...motion, lockScroll })` / `closePopover(host, preset, options)`; `lockScroll(owner)`, `unlockScroll(owner)`, `isScrollLocked()`.
- `positionAnchored(panel, anchor, { side, align, offset, padding, onPlace })` → dispose function.
- `focusableElements(root)`, `isPopoverOpen(host)`.

### i18n and types

- `resolveLocale(lang, localeJson?)`, `en`, `pt`, `es`, `ArkLocale`.
- `coerceBooleanAttr(value)`; every `Ark*StyleOptions` and behavior type (`ArkKvRow`, `ArkSelectOption`, `ArkCalendarEvent`, `ArkToastOptions`, …).

---

## 📝 Usage examples

### Toasts and announcements

```ts
import { announce, toast } from "@tooark/core";

toast.success("Saved", { description: "Your changes were published." });
const id = toast.loading("Uploading…", { duration: 0 });
// later
toast.dismiss(id);

announce("3 items selected"); // read by screen readers, no visual change
```

### Animating your own element with the tokens

```ts
import { arkEnter, arkExit } from "@tooark/core";

await arkEnter(panel, "slide-up", { duration: "quick" }); // 150 ms, --ark-ease-out
await arkExit(panel, "fade", { duration: "quick", easing: "in" });
panel.remove();
```

### A modal overlay of your own on the Popover API

```ts
import { closePopover, openPopover, trapFocus } from "@tooark/core";

const panel = document.querySelector<HTMLElement>("#panel")!; // has popover="manual"
let release: (() => void) | null = null;

async function open() {
  await openPopover(panel, "scale", { duration: "quick", lockScroll: true });
  release = trapFocus(panel, { onOutsidePointer: close });
}

async function close() {
  release?.();
  await closePopover(panel, "fade", { duration: "quick" }); // exit animates before leaving the top layer
}
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                          | Version | Description                                               |
| ---------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens) | ^1.1.0  | Design tokens (colors, sizes, motion) and primitive types |
| [`tslib`](https://www.npmjs.com/package/tslib)                   | ^2.8.1  | TypeScript runtime helpers                                |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/core` is released in lockstep with every other `@tooark/*` package.

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
