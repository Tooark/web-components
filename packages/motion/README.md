# @tooark/motion

[![npm](https://img.shields.io/npm/v/@tooark/motion?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/motion)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Opt-in animation helpers on the Motion library, calibrated by the Tooark motion tokens: staggered entrances, scroll reveal, FLIP reordering and swipe gestures with spring physics.

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

The `@tooark/motion` package provides:

- `arkStaggerEnter(targets, options)`: entrance of a list with the `fade`/`slide-*`/`scale` presets, `interval` and `from` (`first`, `last`, `center`);
- `arkReveal(targets, options)`: enter animation when the elements scroll into view (`once`, `amount`, `margin`), returns a stop function;
- `arkFlip(targets, mutate, options)`: measure, apply your DOM mutation (reorder, insert, filter) and animate each item to its new place with a spring (`stiffness`, `damping`);
- `arkSwipe(element, options)`: pointer gesture on an axis with `threshold`, `velocityThreshold`, drag `feedback` and `resistance`, calling `onSwipe(direction, { delta, velocity })`;
- every helper honors `prefers-reduced-motion`; `arkStaggerEnter` and `arkReveal` also read the `--ark-duration-*`/`--ark-ease-*`/`--ark-motion-distance` tokens (`arkFlip` and `arkSwipe` animate with springs, not token durations or easings); the Motion primitives (`animate`, `spring`, `stagger`, `inView`, …) are re-exported;
- nothing here is required by the components: `@tooark/core` already ships a dependency-free motion layer.

---

## 🔧 Installation

```bash
pnpm add @tooark/motion   # brings motion, @tooark/core and @tooark/tokens
```

---

## ⚙️ Configuration

No registration: import the helpers you use. The durations, easings and slide distance of `arkStaggerEnter`/`arkReveal` come from the tokens on the page (`@tooark/web-components/styles.css` or `@tooark/core/styles.css`); without them the JS mirrors apply (durations and distance from `@tooark/tokens`, curves from the package's own bezier table).

---

## 📦 Components

- `arkStaggerEnter(targets, { preset?, duration?, ease?, distance?, interval?, from? })` → `Promise<void>`.
- `arkReveal(targets, { preset?, duration?, ease?, distance?, once?, amount?, margin? })` → stop function.
- `arkFlip(targets, mutate, { stiffness?, damping? })` → `Promise<void>`.
- `arkSwipe(element, { axis?, threshold?, velocityThreshold?, feedback?, resistance?, onSwipe })` → dispose function.
- `targets`: a selector, an element, an array or a `NodeList` (`ArkMotionTargets`).
- Re-exports from Motion: `animate`, `hover`, `inView`, `press`, `scroll`, `spring`, `stagger`.
- Types: `ArkMotionPlusOptions`, `ArkStaggerOptions`, `ArkRevealOptions`, `ArkFlipOptions`, `ArkSwipeOptions`, `ArkSwipeDirection`, `ArkSwipeInfo`, `ArkMotionPreset`, `ArkMotionTargets`.

---

## 📝 Usage examples

### Staggered list entrance and scroll reveal

```ts
import { arkReveal, arkStaggerEnter } from "@tooark/motion";

await arkStaggerEnter(".results > li", { preset: "slide-up", interval: 40, from: "first" });

const stop = arkReveal(".card", { preset: "fade", once: true, amount: 0.3 });
// on teardown: stop();
```

### FLIP reordering and a swipe-to-dismiss row

```ts
import { arkFlip, arkSwipe } from "@tooark/motion";

const list = document.querySelector("ul")!;
await arkFlip(Array.from(list.children), () => {
  list.prepend(list.lastElementChild!); // any DOM mutation: reorder, insert, filter
});

const dispose = arkSwipe(row, {
  axis: "x",
  threshold: 64,
  onSwipe: (direction) => {
    if (direction === "left") archive(row);
  },
});
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                          | Version | Description                                                      |
| ---------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)     | ^1.1.0  | Types, i18n, toast/announce services, motion and overlay helpers |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens) | ^1.1.0  | Design tokens (colors, sizes, motion) and primitive types        |
| [`motion`](https://www.npmjs.com/package/motion)                 | ^13.4.0 | Motion animation library (spring physics, scroll, gestures)      |
| [`tslib`](https://www.npmjs.com/package/tslib)                   | ^2.8.1  | TypeScript runtime helpers                                       |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/motion` is released in lockstep with every other `@tooark/*` package.

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
