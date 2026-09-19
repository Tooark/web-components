# @tooark/web-components

[![npm](https://img.shields.io/npm/v/@tooark/web-components?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/web-components)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

The native Custom Elements (`ark-*`) of the Tooark design system, styled with Tailwind v4 on top of design tokens — accessibility, keyboard support and motion built in, one stylesheet, no framework required.

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

The `@tooark/web-components` package provides:

- 41 elements: buttons and toggles, form fields (input, textarea, select, checkbox, radio, switch, file input, datepicker, key/value editor), overlays on the Popover API (dialog, drawer, menu, tooltip, command palette, toaster), layout (card, tabs, split pane, carousel), feedback (alert, badge, progress, spinner, skeleton, empty, status dot) and the calendar/clock/scheduler family;
- light DOM: components never move or wrap your children; the host is the control or container;
- `styles.css` is the only stylesheet you need: tokens, motion presets and component styles, all prefixed (`ark:*`, `--ark-*`), with no global reset;
- themes by `color-scheme` (`theme="light|dark"` per element), sizes `xs…xl`, intents `primary…neutral`, `rounded`;
- events as `CustomEvent`s (`change`, `ark-change`, `ark-select`, …), `testid` forwarded as `data-testid` on every internal part for E2E.

---

## 🔧 Installation

```bash
pnpm add @tooark/web-components   # brings @tooark/core and @tooark/tokens
```

Using React, Vue or Angular? Install `@tooark/react`, `@tooark/vue` or `@tooark/angular` instead: they depend on this package and add typed wrappers.

---

## ⚙️ Configuration

Import the stylesheet once and register the elements before using them:

```ts
import { registerTooarkComponents } from "@tooark/web-components";
import "@tooark/web-components/styles.css";

registerTooarkComponents(); // idempotent
```

Declare the page's `color-scheme` to pick the theme (`light`, `dark` or `light dark` to follow the system); set `theme="light|dark"` on an element to force one side, and `lang="en|pt|es"` (or `locale-json`) on the elements that show text.

---

## 📦 Components

- `ark-alert` — Alert/banner: the host is the box in the intent's soft color, your children are the message (free text or elements), `slot="icon"` left, `slot="action"` right, `heading`, `dismissible` with animated exit, `live` region (`status`/`alert`).
- `ark-avatar` — Avatar (`role="img"` named by `name`): initials from `name`, `src` image that falls back to the initials on load error, `size`, `shape` circle/square, custom `color`.
- `ark-badge` — Short status/category label: intents, `soft`/`solid`/`outline`, `xs`–`md`, `rounded`, custom `color` via `color-mix`. The host is the badge; icon and text stay as its children.
- `ark-button` — Intents, sizes, style variants (solid/outline/ghost), `rounded` (up to `full`), `loading`/`icon-only`/`full-width` states, `status` feedback (success/error glyph + announcement), link mode (`href`).
- `ark-calendar` — Inline month grid (MUI DateCalendar-style): localized, WAI-ARIA keyboard navigation, motion, month/year views from the title and colored events (`dots`/`count`/`list`).
- `ark-card` — Card: the host is the box (`surface`, `border`, `rounded`) and a grid: `heading` (h2) or `slot="header"` with `slot="actions"` on the top row, unslotted children as the body, `slot="footer"` last with a divider; `padding` none–lg.
- `ark-carousel` — Native CSS scroll snap (touch/trackpad scroll natively, mouse drag emulated), autoplay, loop, dots and arrows. Slides stay as your direct children.
- `ark-checkbox` — Checkbox drawn by the component (`role="checkbox"` button + hidden native input for forms and `<fieldset disabled>`): `checked`, `indeterminate`, `label`/`aria-label`/free children as the label, sizes, intents. Emits `change`.
- `ark-clock` — Time selection with scrollable digital columns (hours/minutes/seconds), 24h/12h, minute step, localized.
- `ark-color-swatches` — Color palette as a `radiogroup`: swatches from `colors` (`{ name, value }[]`, JSON attribute or JS property), `value`, arrows navigate, `disabled`, `size`. Emits `change` with the value.
- `ark-command-item` — Command palette item (the host is the `role="option"`): free children, `slot="trailing"` for a shortcut, `value`, `group`, `label` (filter text), `disabled`. Emits `ark-select`.
- `ark-command-palette` — Command palette on the Popover API: search field (an `ark-input` of its own), `ark-command-item` children grouped and filtered (`filter`) or searched by the app (`ark-query`), arrows + Enter, `hotkey` (`/`, `mod+k`). Emits `ark-select`, `ark-query`, `ark-open`, `ark-close`.
- `ark-copy-button` — Copy button: extends `ark-button` (same variants, sizes, `icon-only`, forms, hooks); copies `value` or the `for` element, swaps the icon for a check and the text/`title` for "copied" for `feedback-ms`, announces it. Emits `ark-copy`.
- `ark-datepicker` — Date picker: inline (embeds `ark-calendar`) or `input` mode with field + popup, localized formatting, typed input parsing, forms.
- `ark-dialog` — Modal dialog on the Popover API (top layer, `::backdrop` scrim, no portal): the host is the panel, your children are the body, `slot="footer"` is the footer; header from `label`, focus trap, Esc/scrim, `sm`–`xl`.
- `ark-drawer` — Drawer anchored to an edge: `overlay` (Popover API, scrim, focus trap, Esc) or `inline` (in the page flow, e.g. a bottom console); `side`, `size` preset or CSS length, header from `label`, `slot="footer"`, slide with the `sheet` easing. Emits `ark-open`/`ark-close`.
- `ark-empty` — Empty state: dashed box with a dimmed `slot="icon"`, `heading` (h3), `description` and an optional `slot="action"` button; children stay in place, ordered by CSS.
- `ark-file-input` — File field with the `ark-input` grid (label, helper/error): hidden native `<input type="file">` for forms, drop zone with `dragover` highlight, keyboard-accessible choose button, list of selected names, `accept`/`multiple`. Emits `change` with the files and announces them.
- `ark-input` — Standardized text field: label, helper/error with aria, prefix/suffix via `slot`, password `reveal`, native attributes passed through, sizes, intents, `rounded`.
- `ark-kbd` — Keyboard key: the host is the key (mono, border, `surface-muted`, bottom edge) around your text; `size`.
- `ark-kv-editor` — Key/value editor: rows `{ id, key, value, enabled }` (JS property) to enable, edit, delete and add, optional `types`/`secret`/`description` columns, bulk mode as `key:value` lines or JSON. Composes other ark-\* controls. Emits `change`, `ark-add`, `ark-delete`.
- `ark-mark` — Scope mark: one of six shapes (`circle`, `square`, `triangle`, `diamond`, `star`, `hexagon`) in a `color`, color and shape together so identity never relies on color alone; `size`, `label`.
- `ark-menu` — Dropdown/context menu on the Popover API (`role="menu"`, `popover="auto"`): anchored to a trigger by `for`, `align`/`direction` with flip, keyboard, `openAt(x, y)`; items stay as children. Emits `ark-select`.
- `ark-menu-item` — Menu item (the host is the item): free children, `slot="trailing"`, `disabled`, `intent`, `checked` (checkbox item), `divider`, `static` (non-interactive content).
- `ark-progress` — Progress bar (`role="progressbar"` on the host): `value`/`max` with token-driven width transition, `show-value`, `indeterminate` loop exempt from reduced motion, `label`, sizes, intents.
- `ark-radio` — Radio drawn by the component (`role="radio"` button + hidden native input): groups by `name` in the same form, one tab stop per group, arrows move and check, `label`/children as the label. Emits `change` on the one checked.
- `ark-scheduler` — Scheduler with `week`/`day` views (time grid with overlap resolved into columns), plus `month` and `agenda`; colored, clickable events.
- `ark-select` — Native `<select>` styled like `ark-input`: label, helper/error with aria, `placeholder`, options from data (`options` JSON attribute or JS property, `group` → `<optgroup>`), sizes, intents, `rounded`.
- `ark-shape-picker` — Shape picker as a `radiogroup`: the six `ark-mark` shapes drawn in `color`, `value`, arrows navigate, localized shape names, `disabled`, `size`. Emits `change` with the shape.
- `ark-skeleton` — Loading placeholder: the host is the block (`.ark-skeleton`, `aria-hidden`), sized by your class/style; `rows` renders bars, `animated` opts into the pulse, `rounded`.
- `ark-spinner` — Standalone loading indicator (`role="status"`): the button's spinner SVG on `.ark-animate-spin` (keeps spinning under reduced motion), screen-reader label by `lang` or `label`, `size`, optional `intent` (inherits the text color otherwise).
- `ark-split-pane` — Resizable panels: your children are the panels, the handles are the component's own nodes at the end of the host; `direction`, `sizes` (percentages, rewritten on every change), `data-min`/`data-max` per panel, keyboard and pointer-capture drag. Emits `ark-resize`.
- `ark-status-dot` — Status dot: the host is the circle in the intent color (default `neutral`); `label` makes it a named `role="img"`, without it it is decorative; `size`. Static, never pulses.
- `ark-switch` — Accessible on/off switch (`role="switch"`): optional ON/OFF text and ✓/✕ icons, intents, form participation via hidden checkbox.
- `ark-tab` — Tab item (`role="tab"`, the host is the control): free children, `disabled`, `controls`, `closable` and `dirty` in the editor variant. Emits `ark-close`.
- `ark-tabs` — Tab strip (`role="tablist"`): `underline`/`chips`/`editor`, roving tabindex with arrows/Home/End, `slot="actions"` at the end, `change` with the active value. Panels stay with the app.
- `ark-textarea` — Multi-line field with the `ark-input` grid: `rows`, `autosize` (native `field-sizing`, JS fallback), `monospace`, `resize`, helper/error with aria, sizes, intents, `rounded`.
- `ark-toaster` — Sonner-style toasts: programmatic API, positions, rich colors, actions, animated enter/exit, localized close button.
- `ark-toggle` — Pressed-state button (`aria-pressed`), standalone (outline/tinted per intent) or as a group item.
- `ark-toggle-group` — Segmented control: exclusive (default) or multiple selection, synced `value`, propagates `size`/`intent`/`theme`/`disabled` to items.
- `ark-tooltip` — Tooltip on the Popover API: wraps your trigger without moving it, text via `content` or rich `slot="content"`, `side` with flip, `delay`, hover/focus/Esc, `aria-describedby` on the trigger.

Full attribute reference, theming guide and E2E hooks: [https://github.com/Tooark/web-components#readme](https://github.com/Tooark/web-components#readme) · live examples with interaction tests: [Storybook](https://tooark.github.io/web-components/).

---

## 📝 Usage examples

### A form with a confirmation dialog and a toast

```html
<form id="profile">
  <ark-input name="name" label="Name" placeholder="Your full name" required></ark-input>
  <ark-select
    name="role"
    label="Role"
    options='[{"value":"dev","label":"Developer"},{"value":"ops","label":"Operations"}]'
  ></ark-select>
  <ark-datepicker input mode="date" lang="en" name="since"></ark-datepicker>
  <ark-button type="submit" intent="primary">Save</ark-button>
</form>

<ark-dialog id="confirm" label="Publish changes?">
  <p>Your profile will be visible to the whole team.</p>
  <div slot="footer">
    <ark-button variant="ghost" data-action="cancel">Cancel</ark-button>
    <ark-button intent="primary" data-action="publish">Publish</ark-button>
  </div>
</ark-dialog>

<ark-toaster position="bottom-right"></ark-toaster>
```

### Wiring it up

```ts
import { toast } from "@tooark/core";

const form = document.querySelector<HTMLFormElement>("#profile")!;
const dialog = document.querySelector("ark-dialog")!;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  dialog.show(); // top layer, focus trapped, Esc and the scrim close it
});

dialog.addEventListener("click", (event) => {
  const action = (event.target as HTMLElement).closest("[data-action]")?.getAttribute("data-action");
  if (action === "publish") {
    const data = Object.fromEntries(new FormData(form)); // { name, role, since }
    toast.success("Profile published", { description: `Welcome, ${data.name}.` });
  }
  if (action) dialog.close();
});
```

### Data through JS properties and consolidated events

```ts
const editor = document.querySelector("ark-kv-editor")!;
editor.rows = [{ id: "1", key: "Accept", value: "application/json", enabled: true }];
editor.addEventListener("change", (event) => save((event as CustomEvent<{ rows: unknown[] }>).detail.rows));

const menu = document.querySelector("ark-menu")!; // for="trigger-id"
menu.addEventListener("ark-select", (event) => run((event as CustomEvent<{ value: string }>).detail.value));
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                          | Version | Description                                                      |
| ---------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)     | ^1.0.0  | Types, i18n, toast/announce services, motion and overlay helpers |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens) | ^1.0.0  | Design tokens (colors, sizes, radii, motion) and primitive types |
| [`tslib`](https://www.npmjs.com/package/tslib)                   | ^2.8.1  | TypeScript runtime helpers                                       |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/web-components` is released in lockstep with every other `@tooark/*` package.

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
