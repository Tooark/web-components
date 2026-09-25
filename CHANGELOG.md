# Changelog

All notable changes to the `@tooark/*` packages are documented here. Every package shares one version and is
published together; the release workflow uses the section matching the root `package.json` version as the GitHub
Release notes.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2026-09-25

### Added

- `HTMLElementTagNameMap` entries for every `ark-*` tag in `@tooark/web-components`, `@tooark/chart`,
  `@tooark/wysiwyg` and `@tooark/code`, so `document.querySelector("ark-dialog")` and `createElement` return the
  element class without a cast.
- `@tooark/react`: `ArkButtonProps` extends `React.HTMLAttributes<HTMLElement>` (typed `onClick`, `onFocus`, `id`,
  `style`, …); the `IntrinsicElements` typings also cover `ark-chart`, `ark-wysiwyg-editor`, `ark-wysiwyg-viewer`
  and `ark-code-editor`.
- `@tooark/vue`: typed `testid` prop on every wrapper and a typed `click` emit on `ArkButton`.
- Wrapper props and events that only the element had: `ark-toaster` `lang` (also in `ArkToasterStyleOptions`) and
  the toast action event (React `onAction`, Vue `@ark-toast-action`, Angular `(arkToastAction)`), `ark-scheduler`
  `localeJson`, `ark-file-input` `error`, `ark-textarea` `wrap`, and Angular `ariaLabel` on the select, checkbox,
  radio, switch, avatar, color-swatches, shape-picker, button, copy-button and toggle wrappers.
- `ark-clock` reads `locale-json` (so `lang="custom"` works), and `ark-datepicker` forwards it to the clock.

### Changed

- The `ark-open` of a dialog, drawer or command palette that is already open when it connects is dispatched in a
  microtask, so listeners attached while mounting receive it.
- `@tooark/vue` `ArkMenuItem`: `checked: false` now renders an unchecked checkbox item, as in React and Angular;
  leave `checked` out for a plain item.

### Fixed

- React 19 and Vue assign props as properties once the elements are registered: every getter without a setter
  threw in React (`<ArkButton type="submit">`, `value` of clock, datepicker, command-item, menu-item, tab and
  toggle, `side`/`mode` of the drawer, `date` of the scheduler, …) and was silently dropped by Vue, so a Vue
  submit button did not submit. Every property named after an observed attribute now reflects it; lists (`events`,
  `colors`, `sizes`, `rows`) accept the JSON string a wrapper passes; `open` on `ark-menu` and `ark-tooltip` set
  before the element is in the DOM opens it on connect.
- Importing the packages during server-side rendering (Next, Nuxt, any Node without a DOM) threw
  `HTMLElement is not defined`: elements extend a base that is an empty class outside the browser,
  `registerTooark*()` is a no-op there, and CI now imports every build and renders the React and Vue wrappers to
  string.
- `@tooark/web-components` exported only 22 of its 41 element classes.
- `@tooark/react`: the `IntrinsicElements` typings did not apply with `@types/react` 19 (every `ark-*` tag was
  TS2339); `autofocus` and `spellcheck={false}` on `ArkInput`/`ArkTextarea` were inverted by React 19; the calendar,
  datepicker, carousel and toaster wrappers dropped `id`, `style`, `data-*` and `aria-*`; `onOpen` of an overlay
  rendered open was never called.
- `@tooark/vue` and `@tooark/angular`: the button and copy-button wrappers defaulted `intent` to `"primary"`, so
  `variant="danger"` rendered primary; `ark-button` also accepts `variant="neutral"`.
- `@tooark/angular`: `(arkOpen)` of an overlay rendered open was never emitted (also with SSR hydration);
  `ArkCommandItemComponent` did not work inside `ArkCommandPaletteComponent`; `ArkKvEditorComponent` reset `rows`
  (discarding the user's edits) whenever any other input changed.
- `ark-menu-item`: removing `checked` (React sets it to `undefined`) left a checkbox item instead of a plain one.
- `ark-wysiwyg-editor`: changing `toolbar`, `lang`, the palettes or `uploadFile`, or moving the element in the DOM,
  discarded what had been typed.
- `ark-toaster`: toasts beyond `max-visible` were dropped instead of waiting in the queue; they now wait, with their
  timer paused, and show up as others leave.
- `ark-tooltip`: the pointer can reach and rest on the bubble without closing it (WCAG 1.4.13); leaving closes it
  after a 100 ms grace period instead of immediately.
- `ark-datepicker` inline: `name` submits the value with the form and `disabled` blocks the panels.
- `ark-scheduler` emits `ark-range-change` when the view changes, not only when navigating.
- `ark-kv-editor`: the value field follows the type the row's select shows when the row has no `type`.
- `ark-calendar` and `ark-scheduler` announce the period through the shared announcer instead of an `aria-live` on
  the header, which sat inside the title button's name and was rebuilt on every render.
- `@tooark/motion`: `arkStaggerEnter`/`arkReveal` read `--ark-duration-*`, `--ark-ease-*` and
  `--ark-motion-distance` from the page before falling back to the JS mirrors.
- `@tooark/chart`: `createChart` honors `autoResize` (it was ignored), and an `option` set before `ark-chart` is
  connected no longer initializes ECharts on a detached, zero-width container.
- `@tooark/core`: `resolveLocale(lang)` no longer requires the second argument.

### Security

- `ark-wysiwyg-editor`: with `uploadFile` set, `<img>`/`<video>` in pasted HTML became nodes without the URL
  allowlist (`blob:` and `data:` sources got into the document); pasted media now needs an allowed `src`, and an
  unsafe `poster` is dropped. Non-media files pasted or dropped are refused with `ark-wysiwyg-upload-error`
  (`unsupported-type`) instead of being ignored.

## [1.0.1] - 2026-09-20

### Fixed

- `ark-wysiwyg-editor`: toolbar buttons no longer take focus from the editor on mouse click, so the selection
  stays visible while formatting and a key pressed right after a click reaches the editor, not the button
  (Tiptap restores focus only on the next frame). Keyboard access through the toolbar is unchanged.
- `ark-carousel`: a `next()`/`prev()` or arrow click in the same frame as the mount was undone by the deferred
  initial positioning (it went back to `start-index`), which let the smooth scroll finish on its own and fire a second
  `ark-slide-change`. The initial positioning now starts from the current index, and the pending frame is cancelled
  when the element is removed.
- `ark-toggle-group`: removing `disabled` from the group re-enabled items that were disabled on their own, because
  the group marked every item as disabled by it. An item already disabled keeps its own `disabled`.
- `ark-toaster`: every new toast rebuilt the whole stack, so keyboard focus on a toast's button was dropped to the
  page (contrary to the documented behavior) and a toast leaving the stack lost its exit animation. Rendering is now
  incremental: existing cards stay, only the new card is created (at the top) and dismissed ones are removed. Changing
  a host attribute (`position`, `rich-colors`, `close-button`, `lang`, `testid`) still rebuilds the cards.

## [1.0.0] - 2026-09-19

First public release of the Tooark Web Components family.

### Added

- `@tooark/tokens`: design primitives (intent colors as `light-dark()`, size scale, radii, motion tokens with a
  `--text-2xs` step and the `sheet` easing), `resolveColorScheme` and `observeColorScheme`.
- `@tooark/core`: types, i18n (`en`, `pt`, `es`), `toast` and `announce` services, dependency-free motion
  (`arkEnter`/`arkExit`), overlay helpers (`trapFocus`, `openPopover`/`closePopover` with `lockScroll`,
  `positionAnchored`), `coerceBooleanAttr`.
- `@tooark/web-components`: `ark-alert`, `ark-avatar`, `ark-badge`, `ark-button`, `ark-calendar`, `ark-card`,
  `ark-carousel`, `ark-checkbox`, `ark-clock`, `ark-color-swatches`, `ark-command-palette`/`ark-command-item`,
  `ark-copy-button`, `ark-datepicker`, `ark-dialog`, `ark-drawer`, `ark-empty`, `ark-file-input`, `ark-input`,
  `ark-kbd`, `ark-kv-editor`, `ark-mark`, `ark-menu`/`ark-menu-item`, `ark-progress`, `ark-radio`,
  `ark-scheduler`, `ark-select`, `ark-shape-picker`, `ark-skeleton`, `ark-spinner`, `ark-split-pane`,
  `ark-status-dot`, `ark-switch`, `ark-tabs`/`ark-tab`, `ark-textarea`, `ark-toaster`, `ark-toggle`,
  `ark-toggle-group`, `ark-tooltip` — every overlay on the Popover API, no `z-index`, one `styles.css`.
- `@tooark/react`, `@tooark/vue`, `@tooark/angular`: typed wrappers for every component.
- `@tooark/chart` (`ark-chart` on ECharts), `@tooark/wysiwyg` (`ark-wysiwyg-editor`/`-viewer` on Tiptap with
  sanitized JSON content, opt-in toolbar groups and external media through `uploadFile`), `@tooark/code`
  (`ark-code-editor` on CodeMirror 6 with completions, formatting, indentation and line-ending options),
  `@tooark/motion` (stagger, reveal, FLIP and swipe on the Motion library).

[Unreleased]: https://github.com/Tooark/web-components/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Tooark/web-components/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Tooark/web-components/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Tooark/web-components/releases/tag/v1.0.0
