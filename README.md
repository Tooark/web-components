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

| Package                  | Description                                                                                                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tooark/tokens`         | Design primitives: semantic colors (intents), size scale, radii and motion tokens (`--ark-duration-*`, `--ark-ease-*`), exposed as CSS custom properties and Tailwind v4 `@theme` values.                                                                                                   |
| `@tooark/core`           | Shared foundation: TypeScript types (`ArkIntent`, `ArkSize`, …), i18n locales (`en`, `pt`, `es`), the toast and announce services, the dependency-free motion layer (CSS presets + WAAPI helpers `arkEnter`/`arkExit`) and the overlay helpers (`trapFocus`, `openPopover`/`closePopover`). |
| `@tooark/web-components` | The native Custom Elements: `ark-button`, `ark-calendar`, `ark-carousel`, `ark-clock`, `ark-datepicker`, `ark-input`, `ark-scheduler`, `ark-switch`, `ark-toaster`, `ark-toggle` and `ark-toggle-group`.                                                                                    |
| `@tooark/react`          | React wrappers with typed props.                                                                                                                                                                                                                                                            |
| `@tooark/vue`            | Vue 3 wrappers.                                                                                                                                                                                                                                                                             |
| `@tooark/angular`        | Angular wrapper components.                                                                                                                                                                                                                                                                 |
| `@tooark/chart`          | `ark-chart` — charts built on [ECharts](https://echarts.apache.org/) (peer dependency).                                                                                                                                                                                                     |
| `@tooark/wysiwyg`        | `ark-wysiwyg` — rich-text editor and viewer built on [Tiptap](https://tiptap.dev/).                                                                                                                                                                                                         |
| `@tooark/motion`         | **Opt-in** advanced animation helpers built on [Motion](https://motion.dev/): staggered list entrances, scroll reveal, FLIP reordering and swipe gestures with spring physics.                                                                                                              |

---

## Components

| Element            | Package        | Highlights                                                                                                                                                                                                           |
| ------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-alert`        | web-components | Alert/banner: the host is the box in the intent's soft color, your children are the message (free text or elements), `slot="icon"` left, `slot="action"` right, `heading`, `dismissible` with animated exit, `live` region (`status`/`alert`). |
| `ark-badge`        | web-components | Short status/category label: intents, `soft`/`solid`/`outline`, `xs`–`md`, `rounded`, custom `color` via `color-mix`. The host is the badge; icon and text stay as its children.                                     |
| `ark-button`       | web-components | Intents, sizes, style variants (solid/outline/ghost), `rounded` (up to `full`), `loading`/`icon-only`/`full-width` states, `status` feedback (success/error glyph + announcement), link mode (`href`).               |
| `ark-calendar`     | web-components | Inline month grid (MUI DateCalendar-style): localized, WAI-ARIA keyboard navigation, motion, month/year views from the title and colored events (`dots`/`count`/`list`).                                             |
| `ark-card`         | web-components | Card: the host is the box (`surface`, `border`, `rounded`) and a grid: `heading` (h2) or `slot="header"` with `slot="actions"` on the top row, unslotted children as the body, `slot="footer"` last with a divider; `padding` none–lg. |
| `ark-carousel`     | web-components | Native CSS scroll snap (touch/trackpad scroll natively, mouse drag emulated), autoplay, loop, dots and arrows. Slides stay as your direct children.                                                                  |
| `ark-checkbox`     | web-components | Checkbox drawn by the component (`role="checkbox"` button + hidden native input for forms and `<fieldset disabled>`): `checked`, `indeterminate`, `label`/`aria-label`/free children as the label, sizes, intents. Emits `change`. |
| `ark-clock`        | web-components | Time selection with scrollable digital columns (hours/minutes/seconds), 24h/12h, minute step, localized.                                                                                                             |
| `ark-datepicker`   | web-components | Date picker: inline (embeds `ark-calendar`) or `input` mode with field + popup, localized formatting, typed input parsing, forms.                                                                                    |
| `ark-dialog`       | web-components | Modal dialog on the Popover API (top layer, `::backdrop` scrim, no portal): the host is the panel, your children are the body, `slot="footer"` is the footer; header from `label`, focus trap, Esc/scrim, `sm`–`xl`. |
| `ark-empty`        | web-components | Empty state: dashed box with a dimmed `slot="icon"`, `heading` (h3), `description` and an optional `slot="action"` button; children stay in place, ordered by CSS.                                                   |
| `ark-input`        | web-components | Standardized text field: label, helper/error with aria, prefix/suffix via `slot`, password `reveal`, native attributes passed through, sizes, intents, `rounded`.                                                    |
| `ark-menu`         | web-components | Dropdown/context menu on the Popover API (`role="menu"`, `popover="auto"`): anchored to a trigger by `for`, `align`/`direction` with flip, keyboard, `openAt(x, y)`; items stay as children. Emits `ark-select`.     |
| `ark-menu-item`    | web-components | Menu item (the host is the item): free children, `slot="trailing"`, `disabled`, `intent`, `checked` (checkbox item), `divider`, `static` (non-interactive content).                                                  |
| `ark-progress`     | web-components | Progress bar (`role="progressbar"` on the host): `value`/`max` with token-driven width transition, `show-value`, `indeterminate` loop exempt from reduced motion, `label`, sizes, intents.                                      |
| `ark-radio`        | web-components | Radio drawn by the component (`role="radio"` button + hidden native input): groups by `name` in the same form, one tab stop per group, arrows move and check, `label`/children as the label. Emits `change` on the one checked. |
| `ark-scheduler`    | web-components | Scheduler with `week`/`day` views (time grid with overlap resolved into columns), plus `month` and `agenda`; colored, clickable events.                                                                              |
| `ark-select`       | web-components | Native `<select>` styled like `ark-input`: label, helper/error with aria, `placeholder`, options from data (`options` JSON attribute or JS property, `group` → `<optgroup>`), sizes, intents, `rounded`.             |
| `ark-skeleton`     | web-components | Loading placeholder: the host is the block (`.ark-skeleton`, `aria-hidden`), sized by your class/style; `rows` renders bars, `animated` opts into the pulse, `rounded`.                                              |
| `ark-spinner`      | web-components | Standalone loading indicator (`role="status"`): the button's spinner SVG on `.ark-animate-spin` (keeps spinning under reduced motion), screen-reader label by `lang` or `label`, `size`, optional `intent` (inherits the text color otherwise). |
| `ark-switch`       | web-components | Accessible on/off switch (`role="switch"`): optional ON/OFF text and ✓/✕ icons, intents, form participation via hidden checkbox.                                                                                     |
| `ark-tab`          | web-components | Tab item (`role="tab"`, the host is the control): free children, `disabled`, `controls`, `closable` and `dirty` in the editor variant. Emits `ark-close`.                                                            |
| `ark-tabs`         | web-components | Tab strip (`role="tablist"`): `underline`/`chips`/`editor`, roving tabindex with arrows/Home/End, `slot="actions"` at the end, `change` with the active value. Panels stay with the app.                             |
| `ark-textarea`     | web-components | Multi-line field with the `ark-input` grid: `rows`, `autosize` (native `field-sizing`, JS fallback), `monospace`, `resize`, helper/error with aria, sizes, intents, `rounded`.                                       |
| `ark-toaster`      | web-components | Sonner-style toasts: programmatic API, positions, rich colors, actions, animated enter/exit, localized close button.                                                                                                 |
| `ark-toggle`       | web-components | Pressed-state button (`aria-pressed`), standalone (outline/tinted per intent) or as a group item.                                                                                                                    |
| `ark-toggle-group` | web-components | Segmented control: exclusive (default) or multiple selection, synced `value`, propagates `size`/`intent`/`theme`/`disabled` to items.                                                                                |
| `ark-tooltip`      | web-components | Tooltip on the Popover API: wraps your trigger without moving it, text via `content` or rich `slot="content"`, `side` with flip, `delay`, hover/focus/Esc, `aria-describedby` on the trigger.                        |
| `ark-chart`        | chart          | ECharts-powered chart types with theme support.                                                                                                                                                                      |
| `ark-wysiwyg`      | wysiwyg        | Tiptap-based editor + read-only viewer.                                                                                                                                                                              |

### Key attributes

**`ark-alert`** — the host is the box (`intent` soft background and border, default `info`; `variant` `box`, default, rounded, or `banner`, full width with a bottom border only) and your children are the message: free text or elements, flowing normally. `slot="icon"` sits on the left and `slot="action"` (your buttons) on the right of the first line, positioned by `components.css` without moving them (the icon and the dismiss button in space reserved by the padding, the action floated so long text wraps around it). `heading` renders the component's own title at the start of the host. `dismissible` adds a dismiss button at the end (labelled by `lang`/`locale-json`, key `dismiss`); dismissing runs the exit (`slide-down`, `quick`), emits `ark-dismiss` and sets `hidden` on the host: removing it is up to the app, and removing `hidden` shows it again. `live` picks the live region: `polite` (`role="status"`), `assertive` (`role="alert"`) or `off` (no role); by default `warning` and `danger` are assertive and the rest polite. `theme`, `testid`. JS: `dismiss()`, `dismissible`.

**`ark-badge`** — the host itself is the badge (`inline-flex`); put an icon and text as its children. `intent` (default `neutral`), `variant` (`soft`, default / `solid` / `outline`), `size` (`xs`/`sm`/`md`; the height comes from font and padding, not from the control size token), `rounded` (default `full`), `color` (any CSS color instead of the intent: text in that color, soft background or outline via `color-mix`, white text on `solid`), `theme`. Not interactive: a clickable badge is a small `ark-button`.

**`ark-button`** — the host element itself is the control (`role="button"`, focus, keyboard, form participation via ElementInternals), so `aria-label`, `class` and `id` on `<ark-button>` apply directly and its children are never moved. `variant` (`solid`/`outline`/`ghost` or an intent), `intent`, `size` (`xs`–`xl`), `rounded` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`full` — combined with `icon-only`, `full` yields a circular button), `loading` (spinner + `aria-busy` + blocked clicks), `icon-only` (square: `min-width` equals the size token), `full-width`, `href`/`target` (a stretched `<a>` covers the host, takes the focus and is named by the host content; `_blank` gets `rel="noopener noreferrer"`), `disabled`, `type`, `theme`, `color`/`text-color`. `status` (`idle`, default / `success` / `error`) swaps the leading glyph for a check or an alert circle with `.ark-animate-fade-in`; `loading` wins over it; the app clears it, the button only shows it. When `status` becomes `success` or `error`, the button announces `status-label` to screen readers through the core `announce()` service (`polite` for success, `assertive` for error), so no live region ever enters the button's accessible name; without `status-label` nothing is announced. JS: `status`, `statusLabel`.

**`ark-calendar`** — `value` (`YYYY-MM-DD`, parsed in the LOCAL timezone), `min`/`max`, `lang` (`en`/`pt`/`es`/`custom` + `locale-json`), `theme`, `intent`, `accent-color`. Clickable title cycles days → months → years. Events: `events` attribute (JSON) or JS `events` property with `{ date, label?, color?, intent? }`, rendered per `event-display` (`dots` default, `count`, `list`). Emits `ark-change` with `detail: { value, date, events }`. Keyboard navigation: arrows move between days (crossing months), `Home`/`End` jump to month start/end, `PageUp`/`PageDown` switch months.

**`ark-checkbox`** — the visual box is a `<button role="checkbox">` drawn by the component and a hidden native `<input type="checkbox">` carries `name`/`value` to the form (submitted only when checked; `value` defaults to `on`); both are native controls, so `<fieldset disabled>` disables them with no attribute on the host, and the host dims box and label together. `checked`, `indeterminate` (`aria-checked="mixed"` with a dash; the next click clears it and checks), `disabled`, `name`, `value`, `size` (`xs`–`xl`, box on the spacing scale), `intent`, `theme`, `testid`. Accessible name: `label` renders the component's own `<label for>` (clicking it toggles); without it put `aria-label` on the host (a box alone in a table row), or use free children as the label (text, links) — they name the box through `aria-labelledby` and clicking them toggles, while a link or control inside them keeps its own behavior. Space toggles, Enter does not. Emits `change` with `detail: { checked }`. JS: `checked`, `indeterminate`, `disabled`, `name`, `value`, `toggle()`, `focus()`.

**`ark-clock`** — `value` (`HH:mm[:ss]`, always 24h internally), `seconds` (seconds column), `step-minutes`, `hours-format` (`24` default or `12` with an AM/PM column), `lang`, `theme`, `intent`. Emits `ark-change` with `detail: { value }`.

**`ark-input`** — `type`, `label` (becomes a real `<label for>`), `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message` (with `aria-invalid`/`aria-describedby`), `disabled`, `required`, `readonly`. Prefix and suffix via children with `slot="prefix"`/`slot="suffix"`, positioned over the field's edges without being moved. `reveal` on a `type="password"` field adds a show/hide button (`aria-pressed`, labelled by `lang`/`locale-json`) that toggles the type; it coexists with a user suffix. Native attributes are mirrored onto the inner `<input>` as-is: `autocomplete`, `autofocus`, `inputmode`, `maxlength`, `minlength`, `pattern`, `min`, `max`, `step`, `spellcheck`, `aria-label`. For composition: `focus()` and the `inputElement` getter.

**`ark-datepicker`** — composes `ark-input` + `ark-calendar` + `ark-clock`. `mode`: `datetime` (default, value `YYYY-MM-DDTHH:mm:ss`), `date` (`YYYY-MM-DD`) or `time` (`HH:mm:ss`). Without `input` it renders the panels inline; with `input`, field + popup. `format` with `YYYY`/`MM`/`DD`/`HH`/`mm`/`ss` tokens (case-sensitive; defaults to `MM/DD/YYYY HH:mm` for `en`, `DD/MM/YYYY HH:mm` otherwise), `placeholder`, `seconds`, `name` (form submission with the ISO value via hidden input), `disabled`, and forwards `min`/`max`/`events`/`event-display`/`step-minutes`/`hours-format` to the panels. Typed input is validated (invalid entries revert); in `date` mode selecting closes the popup, in `datetime` it stays open to pick the time; `Esc`/outside click close.

**`ark-dialog`** — the host is the panel, opened as `popover="manual"` (top layer, `::backdrop` as the scrim, no portal and no `z-index`); your children are the body and stay in place, and a child with `slot="footer"` becomes the footer (actions aligned to the end, sticky at the bottom of the scrolling panel, or at the bottom of the panel when it is taller than its content) by CSS only. The component adds the header (an `h2` from `label` plus the close button) as its first child, so reading starts at the title. `open` (reflected, the source of truth: `show()`, `close(reason)` and the `open` property only toggle it, so a framework removing the attribute still gets the exit animation), `size` (`sm` / `md`, default / `lg` / `xl` / `full`, which fills the viewport without corners), `width`/`height` (a CSS length, a bare number meaning px; each overrides the preset on its axis and stays capped by the viewport margin; without `height` the panel is as tall as its content), `label` (title and accessible name via `aria-labelledby`; without it give the host an `aria-label`, otherwise the component warns once), `no-close-button`, `persistent` (Esc and the scrim do not close), `theme`, `lang`/`locale-json` (close label), `testid`. Focus goes to the first child with `autofocus`, else the first focusable in the body, else the close button, else the panel, and returns to the opener on close. Emits `ark-open` and `ark-close` with `detail: { reason: "escape" | "backdrop" | "close-button" | "api" }` when the close starts. Motion: `scale` in, `fade` out (run before leaving the top layer), scrim by opacity; override the scrim color with `--ark-dialog-scrim`. **Limit:** the Popover API does not make the rest of the page `inert`. The trap keeps keyboard focus inside and cancels pointer events that start outside the panel (popovers opened on top, such as a menu or the toaster, stay usable), but a screen reader browsing with its virtual cursor can still reach the content behind the dialog.

**`ark-empty`** — the host is the dashed box; your children stay in place: a child with `slot="icon"` (dimmed, an `svg` inside is sized to 2.5rem) and one with `slot="action"` (an `ark-button`, or several). `heading` (an `h3`) and `description` (a `p`) are created by the component. The visual order is icon, heading, description, any other child, action, whatever the DOM order. `theme`, `testid`. Not interactive and without a role of its own.

**`ark-menu`** — the host is the panel (`role="menu"`), opened as `popover="auto"` (top layer, native light dismiss and Esc, no portal and no `z-index`); your `ark-menu-item` children stay in place. Wire a trigger with `for="<id>"`: the component only writes `aria-haspopup`, `aria-expanded` and `aria-controls` on it (and an `id` when missing), names the menu after it with `aria-labelledby`, toggles on click and opens with ArrowDown/ArrowUp; the trigger may mount after the menu (resolved on connect and watched until found). `align` (`start`, default / `end`), `direction` (`down`, default / `up`; flips when there is no room), `open` (reflected from the popover state), `size` and `theme` (propagated to the items), `testid`. JS: `show()`, `hide()`, `openAt(x, y)` for a context menu at a point (the menu switches to `popover="manual"` while open at a point and dismisses on outside pointerdown itself). Inside: arrows with wrap skipping disabled, divider and static items, Home/End, Enter/Space select, Esc closes and returns focus to the trigger, Tab closes. Emits `ark-select` with `detail: { value }` (the item's own event is consumed; the menu closes right after), `ark-open` and `ark-close`. Positioned by JS from `getBoundingClientRect()` (`positionAnchored`, see the overlay helpers); enter/exit are CSS transitions (`scale` from the origin corner in, `fade` out), so light dismiss animates too.

**`ark-menu-item`** — the host is the item (`role="menuitem"`, focus, keyboard); put an icon and text as children and a shortcut or badge in a child with `slot="trailing"`. `value`, `disabled`, `intent` (`danger` for destructive actions; any intent colors text and hover), `checked` (turns it into a `menuitemcheckbox` with `aria-checked` and a check at the end; `checked="false"` is an unchecked one), `divider` (`role="separator"`), `static` (non-interactive content such as the user's name and e-mail; `role="presentation"`, outside the arrow cycle; it inherits the muted text color, so color your own children with the tokens, e.g. `var(--ark-color-fg)` for the name). JS: `select()`.

**`ark-progress`** — the host is the `role="progressbar"` (`aria-valuenow`/`aria-valuemin`/`aria-valuemax`, name from `label` or your own `aria-label`/`aria-labelledby`): a row with the track (`bg-muted`, height by `size` `xs`–`xl`: 0.25 to 1 rem) and, with `show-value`, the rounded percentage beside it. `value` (0 to `max`, clamped; `max` defaults to 100) sets the bar width with a transition on the `default` duration and `out` easing tokens (instant under reduced motion). `indeterminate` removes `aria-valuenow`, hides the value and swaps the bar for a 40% segment sweeping the track in a loop; like the spinner it is a continuous loader, so it runs on a fixed duration and keeps moving under `prefers-reduced-motion` (it is the only sign of progress). `intent` colors the bar. `theme`, `testid`. JS: `value`, `max`, `indeterminate`, `showValue`.

**`ark-radio`** — same construction as `ark-checkbox` (a `<button role="radio">` and a hidden native `<input type="radio">` that groups by `name` in the form; `<fieldset disabled>` works). The group is every `ark-radio` with the same `name` inside the same `<form>`, or in the same root when there is no form: checking one unchecks the others silently (also when you set `checked` from JS or the attribute), and `change` fires only on the one that gained the check, with `detail: { value }`; clicking the checked one emits nothing. Keyboard follows the native radio: a single tab stop per group (the checked option, else the first enabled one), arrows (all four) move focus and check, wrapping and skipping disabled options, Space checks the focused one, Enter does nothing. Put the options in a container with `role="radiogroup"` and a label. `checked`, `disabled`, `name`, `value` (default `on`), `label`/`aria-label`/free children as in `ark-checkbox`, `size`, `intent`, `theme`, `testid`. JS: `checked`, `disabled`, `name`, `value`, `select()`, `focus()`.

**`ark-scheduler`** — `view` (`week` default, `day`, `month`, `agenda`), `date` (reference date, kept in sync while navigating), `events` (JSON attribute or JS property) with `{ id?, title, start, end?, allDay?, location?, color?, intent? }`, `views` (limits the switcher, e.g. `"day,week"`), `hour-start`/`hour-end`, `slot-minutes` (15–60), `hours-format`, `lang`, `theme`, `intent`. Emits `ark-event-click` (`{ event, id }`), `ark-slot-click` (`{ start, end, allDay }` — clicking an empty slot or a day), `ark-view-change` (`{ view }`) and `ark-range-change` (`{ start, end, view }`). Time views position events by time, resolve overlaps into side-by-side columns and mark the current time.

**`ark-select`** — a native `<select>` with the `ark-input` grid (label, field, message) and a chevron drawn by the component, so keyboard, screen reader and mobile pickers come for free. Options come from data, never from children: the `options` attribute (JSON) or JS property (`{ value, label, disabled?, group? }[]`; `group` renders an `<optgroup>`). `label`, `placeholder` (a disabled, hidden empty option shown until something is chosen), `value`, `name`, `size` (`xs`–`xl`), `intent`, `rounded`, `helper`, `error`/`error-message`, `disabled`, `required`, `theme`. JS: `selectElement`, `value`, `options`, `focus()`. Emits `change` with `detail: { value }` (the native change does not bubble a second time) and `input`.

**`ark-skeleton`** — the host is the block (core's `.ark-skeleton`: soft muted background and radius; `aria-hidden` since there is nothing to read). Width and height come from your `class` or `style` (default height 1rem). `rows` above 1 replaces the block with that many bars in a column, the last one shorter; `animated` opts into the shimmer (`.ark-skeleton-animated`: a highlight sweeping across, phase-shifted per block and per bar so nothing blinks in sync; static by default and stopped under `prefers-reduced-motion`); `rounded` (`none`–`full`, default the preset's `lg`), `color` (any CSS color as the base tint instead of `muted`, for skeletons on colored surfaces), `ratio` (`16/9`, `9/16`, `1/1`, `16:9` or a number: an image placeholder whose height follows the width; `ratio="1/1" rounded="full"` is an avatar; ignored with `rows`), `theme`, `testid`. There is no reveal element: give the content that replaces the skeleton `.ark-animate-fade-in`. JS: `rows`, `animated`.

**`ark-spinner`** — the host is the `role="status"`, with the same SVG as the `ark-button` spinner (the only spinner in the lib) turning on core's `.ark-animate-spin`, which keeps running under `prefers-reduced-motion` because it is the only sign of progress. `size` (`xs`–`xl`: 0.75 to 2 rem), `intent` (color token; without it the spinner inherits the surrounding text color, so it fits inline text or a colored button), `label` (screen-reader-only text; default the `loading` string of `lang`/`locale-json`), `theme`, `testid`.

**`ark-switch`** — `checked`, `disabled`, `size`, `intent`, `theme`, `color`, `labels` (shows ON/OFF inside the track; customizable via `label-on`/`label-off`), `icons` (✓/✕ on the thumb), `label` (accessible name), `name`/`value` (form submission when checked). Emits `change` with `detail: { checked }`.

**`ark-toggle`** — `pressed`, `value`, `disabled`, `size`, `intent`, `theme`. Emits `change` with `detail: { pressed, value }`.

**`ark-toggle-group`** — `value` (selected value(s), synced with items), `multiple`, `disabled`, `size`, `intent`, `theme`. Emits `change` with `detail: { value }` (exclusive) or `detail: { values }` (multiple).

**`ark-card`** — the host is the container (`surface` background, `border`, corners by `rounded`, default `lg`) laid out as a grid from `components.css`, so your children stay where they are: `slot="header"` and `slot="actions"` share the top row (title left, actions right, vertically centered), every child without a slot is the body, full width and in DOM order, and `slot="footer"` is always the last row, with a divider above it. `heading` renders the component's own `h2` at the start of the host; when it is present, your `slot="header"` child becomes the next header row, full width (a description, filters, tabs). `padding` (`none`/`sm`/`md`, default/`lg` = 0 / 0.75 / 1 / 1.5 rem) sets the host padding and the gap between rows together; with `none` the content reaches the edges (add `overflow-hidden` to the host `class` to clip an image to the corners and pad the text yourself). `theme`, `testid`. Not interactive and no role of its own; add `role="region"` and a label when the card is a landmark.

**`ark-carousel`** — the host is the scroll container and your slides are its direct children. `slides-per-view`, `gap` (px), `start-index`, `loop`, `autoplay`/`autoplay-delay` (paused on hover/focus and disabled under `prefers-reduced-motion`), `show-dots`/`show-arrows` (`"false"` hides), `drag-free`, `snap` (`mandatory`/`proximity`), `intent`, `accent-color`, `theme`. JS API: `index`, `slides`, `next()`, `prev()`. Emits `ark-slide-change` with `detail: { index }`.

**`ark-tabs`** — the host is the `role="tablist"`; its `ark-tab` children stay in place and a child with `slot="actions"` (e.g. a "+" `ark-button`) is moved to the end of the strip by CSS only. `value` (active tab; without it the first enabled tab is selected silently), `variant` (`underline`, default / `chips` / `editor`), `size`, `intent`, `rounded` (tab corners: chips default to `full`, `editor` rounds only the top, the others default to `none`), `fill` (how the active tab is painted: `none`, `soft` or `solid` with the intent color and contrast text; chips default to `soft`, the others to `none`), `theme`, `label` (→ `aria-label`), `lang`/`locale-json` (for the close and unsaved labels); `variant`, `size`, `intent`, `rounded`, `fill`, `theme` and language are propagated to the tabs. Keyboard: arrows, Home and End move focus and select (automatic activation), skipping disabled tabs. Emits `change` with `detail: { value }` (the tab's own event is consumed). When the active tab is removed from the DOM, the neighbour becomes active and `change` fires. No motion on switch. Panels are the app's: point each tab at its panel with `controls`.

**`ark-tab`** — the host is the `role="tab"` (`aria-selected`, roving `tabindex`); put an icon, text or badge as children. `value`, `disabled`, `controls` (→ `aria-controls`), and in the `editor` variant `closable` (a close button outside the tab order, plus middle click and the Delete key; emits `ark-close` with `detail: { value }` — removing the tab is up to the app) and `dirty` (a static unsaved dot named for screen readers). JS: `select()`, `close()`.

**`ark-textarea`** — the `ark-input` grid and attributes (`label`, `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message`, `disabled`, `required`, `readonly`) on a native `<textarea>`, plus `rows` (default 3), `autosize` (grows with the content: `field-sizing: content` where supported, measured by JS elsewhere), `monospace` and `resize` (`vertical`, default, or `none`). One row lines up with an `ark-input` of the same size. Mirrored native attributes: `autocomplete`, `autofocus`, `maxlength`, `minlength`, `spellcheck`, `wrap`, `aria-label`. Emits native `input`/`change`; JS: `value`, `textareaElement`, `focus()`.

**`ark-tooltip`** — the host wraps your trigger (its first child without a `slot`; it must be focusable on its own, e.g. a button) without moving it, and creates the bubble (`role="tooltip"`, `popover="manual"`, so it escapes `overflow` and sits in the top layer). Text via `content`, or rich content in a child with `slot="content"`, which then is the bubble itself (the component only adds `popover`, `role`, an `id` and the hook to it; its look comes from CSS). `side` (`top`, default / `bottom` / `left` / `right`; flips when there is no room), `delay` (ms before opening on hover, default 200; focus opens immediately), `open` (reflected), `theme`, `testid`. Opens on hover and focus, closes on leave, blur, Esc and pointerdown on the trigger; hovering the bubble keeps it open. The trigger gets `aria-describedby` pointing at the bubble. Motion: `fade` in with `quick`, no exit animation. JS: `show()`, `hide()`.

**`ark-toaster`** — `position` (`top-left` … `bottom-right`), `rich-colors`, `close-button` (`"false"` hides), `max-visible`, `duration` (ms; `0` keeps toasts until dismissed), `lang`, `theme`. Fed by the `toast` service from `@tooark/core` (or the `toast()`/`dismiss()` methods); emits `ark-toast-action` with `detail: { id, actionId }` when an action button is clicked.

**`announce()`** (service, `@tooark/core`) — `announce(text, politeness = "polite")` speaks a message to screen readers through a single hidden live region appended to `document.body` (`data-ark="announcer"`, with a `role="status"` child for `polite` and a `role="alert"` child for `assertive`). Components use it to announce a result in place (a button's `status`, "copied", chosen files) without creating live regions inside the host, where the text would join the control's accessible name. Calling it again with the same text announces it again; it is a no-op without a DOM.

**Overlay helpers** (`@tooark/core`) — the pieces `ark-dialog` is built from, for overlays of your own on the Popover API. `trapFocus(container, { initial, returnTo, onOutsidePointer })` returns a release function: Tab and Shift+Tab cycle through the container's focusables, focus that escapes comes back, pointer events that start outside are cancelled at capture for the whole gesture, so a scrim click that closes the overlay never activates what is behind it (the `pointerdown` is reported to `onOutsidePointer`, e.g. to close on the scrim), popovers opened on top are left alone, nested traps stack, and releasing restores focus to `returnTo` (default: the element focused at activation). `openPopover(host, preset, options)` calls `showPopover()` then `arkEnter`; `closePopover(host, preset, options)` runs `arkExit` first and only then `hidePopover()`, and a reopen during the exit abandons it. `positionAnchored(panel, anchor, { side, align, offset, padding, onPlace })` places a `position: fixed` panel next to an element or a `{ x, y, width, height }` rect from `getBoundingClientRect()`: preferred side with a flip to the opposite one when there is no room, alignment along that side, sliding to stay inside the viewport; it writes `left`/`top`/`transform-origin` inline plus `data-ark-side`/`data-ark-align` on the panel and repositions on scroll and resize until the returned dispose runs. `focusableElements(root)` lists the tabbable elements in DOM order; `isPopoverOpen(host)` checks `:popover-open`.

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

**Continuous loaders are exempt from reduced motion by design.** `.ark-animate-spin` (the spinner inside `ark-button`) keeps spinning under `prefers-reduced-motion: reduce`: reduced motion exists to avoid vestibular discomfort, which a 1 em rotation does not cause, while a frozen spinner removes the only sign that something is in progress. That is also why it runs on a fixed `1s` instead of a duration token, which the zeroing would freeze. Attention loops do stop: `.ark-animate-shake`, `.ark-animate-pulse` and `.ark-skeleton-animated`. `.ark-skeleton` itself is static by default (an infinite pulse on the one region with nothing to read draws the eye and falls under WCAG 2.2.2); add `.ark-skeleton-animated` to opt into the shimmer (a highlight sweeping left to right; shift its phase with a negative `animation-delay` so neighbours do not sweep together, as `ark-skeleton` does), and give the content that replaces a skeleton `.ark-animate-fade-in` if you want it to ease in.

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

- **`size`** (`xs`/`sm`/`md`/`lg`/`xl`) maps to the `--ark-size-*` tokens (1.5 / 1.75 / 2.25 / 2.75 / 3.25 rem, i.e. 24 to 52 px). `ark-button`, `ark-input` and `ark-toggle` apply the token as `min-height` (and as `min-width` on icon-only buttons), so controls of the same size line up in a row and overriding `--ark-size-md` resizes every control at once; `ark-switch`, `ark-checkbox` and `ark-radio` use proportional dimensions on the spacing scale instead (track and box are glyphs beside text, not full-height controls).
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

| Component          | Main element   | Internal parts                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-alert`        | `alert`        | `alert-heading`, `alert-dismiss`; `alert-icon` / `alert-action` (mark your slot children)                                                                                                                                                                                                                                                                                                                       |
| `ark-badge`        | `badge`        | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-button`       | `button`       | `button-spinner`, `button-status-icon`, `button-link` (href mode)                                                                                                                                                                                                                                                                                                                                               |
| `ark-checkbox`     | `checkbox`     | `checkbox-label` (when `label` is set), `checkbox-input` (the hidden native input)                                                                                                                                                                                                                                                                                                                              |
| `ark-scheduler`    | `scheduler`    | `scheduler-header`, `scheduler-today`, `scheduler-prev`, `scheduler-next`, `scheduler-title`, `scheduler-views`, `scheduler-view-{view}`, `scheduler-body`, `scheduler-scroller`, `scheduler-days`, `scheduler-grid`, `scheduler-day` (+ `data-date`), `scheduler-slot` (+ `data-start`), `scheduler-event` (+ `data-event-id`), `scheduler-event-more`, `scheduler-allday`, `scheduler-now`, `scheduler-empty` |
| `ark-select`       | `select`       | `select-label`, `select-chevron`, `select-helper`, `select-error`                                                                                                                                                                                                                                                                                                                                               |
| `ark-skeleton`     | `skeleton`     | `skeleton-row` (each bar when `rows` > 1)                                                                                                                                                                                                                                                                                                                                                                       |
| `ark-spinner`      | `spinner`      | `spinner-icon`, `spinner-label` (visually hidden)                                                                                                                                                                                                                                                                                                                                                               |
| `ark-switch`       | `switch`       | `switch-thumb`, `switch-label-on`, `switch-label-off`, `switch-input`                                                                                                                                                                                                                                                                                                                                           |
| `ark-toggle`       | `toggle`       | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-toggle-group` | `toggle-group` | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-calendar`     | `calendar`     | `calendar-prev`, `calendar-next`, `calendar-title`, `calendar-grid`, `calendar-day` (+ `data-date`), `calendar-months`/`calendar-month` (+ `data-month`), `calendar-years`/`calendar-year` (+ `data-year`), `calendar-event`, `calendar-event-more`, `calendar-today`, `calendar-clear`                                                                                                                         |
| `ark-clock`        | `clock`        | `clock-hours`, `clock-minutes`, `clock-seconds`, `clock-meridiem` (options via `data-value`)                                                                                                                                                                                                                                                                                                                    |
| `ark-input`        | `input`        | `input-label`, `input-prefix`, `input-suffix`, `input-reveal`, `input-helper`/`input-error`                                                                                                                                                                                                                                                                                                                     |
| `ark-card`         | `card`         | `card-heading` (the `heading` h2); `card-header`, `card-actions`, `card-footer` (mark your slot children). The body is not marked: it is free content, possibly another `ark-*` with its own hooks                                                                                                                                                                                                              |
| `ark-carousel`     | `carousel`     | `carousel-overlay`, `carousel-slide-{i}` (on your own slide elements), `carousel-arrow-prev`, `carousel-arrow-next`, `carousel-dots`, `carousel-dot-{i}`                                                                                                                                                                                                                                                        |
| `ark-datepicker`   | `datepicker`   | Composition: the field carries the `ark-input` hooks (testid forwarded), inner panels get testid suffixed `-calendar`/`-clock`; its own: `datepicker-toggle`, `datepicker-popup`.                                                                                                                                                                                                                               |
| `ark-dialog`       | `dialog`       | `dialog-header`, `dialog-title`, `dialog-close`, `dialog-footer` (marks the user's `slot="footer"` child)                                                                                                                                                                                                                                                                                                       |
| `ark-empty`        | `empty`        | `empty-heading`, `empty-description`, `empty-icon` / `empty-action` (mark the user's slot children)                                                                                                                                                                                                                                                                                                             |
| `ark-menu`         | `menu`         | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-menu-item`    | `menu-item`    | `menu-item-check`; `divider` and `static` items carry `menu-divider` / `menu-static` as their main hook                                                                                                                                                                                                                                                                                                         |
| `ark-progress`     | `progress`     | `progress-track`, `progress-bar`, `progress-value`                                                                                                                                                                                                                                                                                                                                                              |
| `ark-radio`        | `radio`        | `radio-dot`, `radio-label` (when `label` is set), `radio-input` (the hidden native input)                                                                                                                                                                                                                                                                                                                       |
| `ark-tab`          | `tab`          | `tab-close`, `tab-dirty`                                                                                                                                                                                                                                                                                                                                                                                        |
| `ark-tabs`         | `tabs`         | `tabs-actions` (marks the user's `slot="actions"` child)                                                                                                                                                                                                                                                                                                                                                        |
| `ark-textarea`     | `textarea`     | `textarea-label`, `textarea-helper`/`textarea-error`                                                                                                                                                                                                                                                                                                                                                            |
| `ark-tooltip`      | `tooltip`      | `tooltip-bubble` (the component's bubble or your `slot="content"` child)                                                                                                                                                                                                                                                                                                                                        |
| `ark-toaster`      | `toaster`      | `toaster-toast` (+ `data-toast-id`), `toaster-toast-title`, `toaster-toast-description`, `toaster-toast-close`, `toaster-toast-action`, `toaster-toast-cancel`                                                                                                                                                                                                                                                  |

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
