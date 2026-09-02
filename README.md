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
| `ark-carousel`     | web-components | Pointer drag with snap, autoplay, loop, dots and arrows.                                                                                                                 |
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

**`ark-button`** — `variant` (`solid`/`outline`/`ghost` or an intent), `intent`, `size` (`sm`–`xl`), `rounded` (`none`/`sm`/`md`/`lg`/`xl`/`full` — combined with `icon-only`, `full` yields a circular button), `loading` (spinner + `aria-busy` + blocked clicks), `icon-only` (symmetric padding), `full-width`, `href`/`target` (renders `<a role="button">`; `_blank` gets `rel="noopener noreferrer"`), `disabled`, `type`, `theme`, `color`/`text-color`.

**`ark-calendar`** — `value` (`YYYY-MM-DD`, parsed in the LOCAL timezone), `min`/`max`, `lang` (`en`/`pt`/`es`/`custom` + `locale-json`), `theme`, `intent`, `accent-color`. Clickable title cycles days → months → years. Events: `events` attribute (JSON) or JS `events` property with `{ date, label?, color?, intent? }`, rendered per `event-display` (`dots` default, `count`, `list`). Emits `ark-change` with `detail: { value, date, events }`. Keyboard navigation: arrows move between days (crossing months), `Home`/`End` jump to month start/end, `PageUp`/`PageDown` switch months.

**`ark-clock`** — `value` (`HH:mm[:ss]`, always 24h internally), `seconds` (seconds column), `step-minutes`, `hours-format` (`24` default or `12` with an AM/PM column), `lang`, `theme`, `intent`. Emits `ark-change` with `detail: { value }`.

**`ark-input`** — `type`, `label` (becomes a real `<label for>`), `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message` (with `aria-invalid`/`aria-describedby`), `disabled`, `required`, `readonly`. Suffix via a child with `slot="suffix"`. For composition: `focus()` and the `inputElement` getter.

**`ark-datepicker`** — composes `ark-input` + `ark-calendar` + `ark-clock`. `mode`: `datetime` (default, value `YYYY-MM-DDTHH:mm:ss`), `date` (`YYYY-MM-DD`) or `time` (`HH:mm:ss`). Without `input` it renders the panels inline; with `input`, field + popup. `format` with `YYYY`/`MM`/`DD`/`HH`/`mm`/`ss` tokens (case-sensitive; defaults to `MM/DD/YYYY HH:mm` for `en`, `DD/MM/YYYY HH:mm` otherwise), `placeholder`, `seconds`, `name` (form submission with the ISO value via hidden input), `disabled`, and forwards `min`/`max`/`events`/`event-display`/`step-minutes`/`hours-format` to the panels. Typed input is validated (invalid entries revert); in `date` mode selecting closes the popup, in `datetime` it stays open to pick the time; `Esc`/outside click close.

**`ark-scheduler`** — `view` (`week` default, `day`, `month`, `agenda`), `date` (reference date, kept in sync while navigating), `events` (JSON attribute or JS property) with `{ id?, title, start, end?, allDay?, location?, color?, intent? }`, `views` (limits the switcher, e.g. `"day,week"`), `hour-start`/`hour-end`, `slot-minutes` (15–60), `hours-format`, `lang`, `theme`, `intent`. Emits `ark-event-click` (`{ event, id }`), `ark-slot-click` (`{ start, end, allDay }` — clicking an empty slot or a day), `ark-view-change` (`{ view }`) and `ark-range-change` (`{ start, end, view }`). Time views position events by time, resolve overlaps into side-by-side columns and mark the current time.

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

<ark-input
  label="Name"
  placeholder="Your full name"
  helper="As on your ID"
></ark-input>

<!-- Field + popup; the form receives the ISO value under name="date" -->
<ark-datepicker input mode="date" lang="en" name="date"></ark-datepicker>

<!-- Inline panels (no `input`): date + time -->
<ark-datepicker lang="en"></ark-datepicker>

<ark-calendar lang="en" event-display="count"></ark-calendar>

<ark-clock hours-format="12" step-minutes="15"></ark-clock>

<ark-scheduler
  view="week"
  lang="en"
  hour-start="8"
  hour-end="18"
></ark-scheduler>

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
import {
  ArkButton,
  ArkDatepicker,
  ArkScheduler,
  ArkToaster,
} from "@tooark/react";
```

Wrapper props are camelCase and typed (`eventDisplay`, `stepMinutes`, `hoursFormat`, `hourStart`…); object props (`events`, `localeJson`) are serialized to the attribute for you, and custom events arrive as `onChange`/`onEventClick`/`onSlotClick`/`onViewChange`/`onRangeChange` receiving the event `detail`.

### Vue 3

```ts
import {
  ArkButton,
  ArkDatepicker,
  ArkScheduler,
  ArkToaster,
} from "@tooark/vue";
```

Events keep their native names (`@ark-change`, `@ark-event-click`, …) and deliver the `detail` directly.

### Angular

Import the wrapper components from `@tooark/angular` (`ArkDatepickerComponent`, `ArkSchedulerComponent`, …). Each one is standalone, uses the `<ark-*-wrapper>` selector and re-emits the custom events as `@Output()` (`arkChange`, `arkEventClick`, `arkSlotClick`, `arkViewChange`, `arkRangeChange`).

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

| Component          | Main element   | Internal parts                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-button`       | `button`       | `button-spinner`                                                                                                                                                                                                                                                                                                                                                                              |
| `ark-scheduler`    | `scheduler`    | `scheduler-header`, `scheduler-today`, `scheduler-prev`, `scheduler-next`, `scheduler-title`, `scheduler-views`, `scheduler-view-{view}`, `scheduler-body`, `scheduler-scroller`, `scheduler-grid`, `scheduler-day` (+ `data-date`), `scheduler-slot` (+ `data-start`), `scheduler-event` (+ `data-event-id`), `scheduler-event-more`, `scheduler-allday`, `scheduler-now`, `scheduler-empty` |
| `ark-switch`       | `switch`       | `switch-thumb`, `switch-label-on`, `switch-label-off`, `switch-input`                                                                                                                                                                                                                                                                                                                         |
| `ark-toggle`       | `toggle`       | —                                                                                                                                                                                                                                                                                                                                                                                             |
| `ark-toggle-group` | `toggle-group` | —                                                                                                                                                                                                                                                                                                                                                                                             |
| `ark-calendar`     | `calendar`     | `calendar-prev`, `calendar-next`, `calendar-title`, `calendar-grid`, `calendar-day` (+ `data-date`), `calendar-months`/`calendar-month` (+ `data-month`), `calendar-years`/`calendar-year` (+ `data-year`), `calendar-event`, `calendar-event-more`, `calendar-today`, `calendar-clear`                                                                                                       |
| `ark-clock`        | `clock`        | `clock-hours`, `clock-minutes`, `clock-seconds`, `clock-meridiem` (options via `data-value`)                                                                                                                                                                                                                                                                                                  |
| `ark-input`        | `input`        | `input-label`, `input-suffix`, `input-helper`/`input-error`                                                                                                                                                                                                                                                                                                                                   |
| `ark-carousel`     | `carousel`     | `carousel-viewport`, `carousel-track`, `carousel-slide-{i}`, `carousel-arrow-prev`, `carousel-arrow-next`, `carousel-dots`, `carousel-dot-{i}`                                                                                                                                                                                                                                                |
| `ark-datepicker`   | `datepicker`   | Composition: the field carries the `ark-input` hooks (testid forwarded), inner panels get testid suffixed `-calendar`/`-clock`; its own: `datepicker-toggle`, `datepicker-popup`.                                                                                                                                                                                                             |
| `ark-toaster`      | `toaster`      | `toaster-toast` (+ `data-toast-id`), `toaster-toast-title`, `toaster-toast-description`, `toaster-toast-close`, `toaster-toast-action`, `toaster-toast-cancel`                                                                                                                                                                                                                                |

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
