# Changelog

All notable changes to the `@tooark/*` packages are documented here. Every package shares one version and is
published together; the release workflow uses the section matching the root `package.json` version as the GitHub
Release notes.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- The Storybook site (<https://tooark.com/web-components/>) is titled `Tooark Web Components` instead of `Storybook`:
  `manager-head.html` swaps the name the manager writes on every navigation and `scripts/storybook-title.mjs` rewrites
  the static `<title>` after `storybook build`.
- `ark-checkbox` and `ark-radio`: the README documents, and an `InsideOuterLabel` story pins, that a `<label>` wrapped
  around the element names the drawn control and toggles it once per click (no behavior change).

### Fixed

- `ark-file-input`: a folder dropped on the zone is no longer taken as a file (the browser hands it over as an empty
  `File` that cannot be read). It is left out, the files dropped with it are kept, the list shows the new
  `foldersNotAccepted` string (`ArkLocale`, en/pt/es; hook `file-input-rejected`) and the announcement carries it; a
  drop of folders alone keeps the selection and emits no `change`.

## [1.4.0] - 2026-09-29

### Added

- `ark-command-palette`: opt-in `hint`, the message shown instead of `noResults` while the search field is empty (a
  palette that starts with no items), and `busy` (attribute and JS property), an async search in progress: with no
  visible option the message becomes the new `searching` string (`ArkLocale.searching`, en/pt/es; a `locale-json`
  without it falls back to English) and the hidden listbox gets `aria-busy`. `hint` and `busy` props on the React, Vue
  and Angular wrappers. Without them the palette shows `noResults` as before.
- `ark-avatar`: opt-in `variant="solid"` (`ArkAvatarVariant` in core) fills the background with `primary` (initials
  in `primary-fg`) or with `color` (white initials); `soft` stays the default. `variant` prop on the three wrappers.
- `ark-checkbox` and `ark-radio`: opt-in `helper`, a hint below the label that describes the control through
  `aria-describedby` (the host becomes a grid: the box, then the label and the hint stacked); when free children name
  the control the hint is `aria-hidden`, so it stays out of the name. New hooks `checkbox-helper` and `radio-helper`,
  `helper` prop on the three wrappers. Without it the host keeps its flex layout.
- `ark-drawer`: a `slot="actions"` container joins the header row between the title and the close button, centered on
  the title line and sticky with the header; the title reserves the actions' width (measured with a `ResizeObserver`),
  and with the slot the header is rendered even without `label`. New hook `drawer-actions`. A drawer without the slot
  renders as before.

### Changed

- Every README (root and packages, English and Portuguese) gains a Help & Security section pointing to `SUPPORT.md`
  and `SECURITY.md`, and a Support section with the GitHub Sponsors and Ko-fi links.
- Every section heading of every README starts with an icon, the root README's included.

## [1.3.0] - 2026-09-28

### Added

- `ark-mark`: four more shapes, `cross`, `pentagon`, `moon` and `asterisk` (ten in all), with their localized names
  (`shapeCross`, `shapePentagon`, `shapeMoon`, `shapeAsterisk` in en/pt/es); `ARK_MARK_SHAPES` lists the ten.
- `ark-shape-picker`: opt-in `shapes` (comma-separated, or `all`) picks which shapes are offered and in what order;
  `shapes` prop on the React, Vue and Angular wrappers.
- `ark-kv-editor`: opt-in `valueField` JS property (`ArkKvValueField`/`ArkKvValueFieldContext` in core), a function
  that creates each row's value cell in place of the `ark-input`, for a field with `{{variable}}` autocomplete such as
  a single-line `ark-code-editor`. Secret rows keep the password field, returning `null` keeps the `ark-input` in
  that row, a row whose type or padlock changes gets a new cell, and Enter (when the field does not cancel it) or
  `ark-submit` in the last row adds a row. Without it the editor renders and behaves as before. `valueField` prop on
  the three wrappers.
- `@tooark/react`: every wrapper forwards `ref` to its `ark-*` element (`forwardRef`, typed as the element class), so
  `ref.current?.show()` or `focus()` work from the app; the wrapper's own listeners and properties keep working, and
  a React 19 callback ref that returns a cleanup gets the cleanup on unmount.
- `ark-code-editor` and `ark-wysiwyg-editor`: `aria-label` names the editable content (the `role="textbox"`), also as
  the `label` engine option (plus `setLabel` in `@tooark/code`).
- `@tooark/angular`: every wrapper exposes the `ark-*` element it renders as `element`, typed as the element class,
  for its methods and properties; the view children a few wrappers had (`editorRef`, `alertRef`…) stay.
- `ark-chart`: `aria-label`/`aria-labelledby` make the host a `role="img"` with that name (unless the app gave it
  a `role`); without them nothing changes.
- E2E hooks on the side packages that had none: `ark-chart` (`data-ark="chart"` on the chart container) and the
  wysiwyg editor (root, `-toolbar`, `-content`) and viewer (root, `-content`), with `testid` as `data-testid`.

### Fixed

- Every `ark-*` element: a JS property assigned before `registerTooark*()` (a framework binding `rows`, `options`,
  `option`, `value` or `content` to the raw tag before registration) stayed an own property of the node, shadowed
  the class setter after the upgrade and never reached the element; the elements now re-apply every such property
  through its setter when they connect.
- `ark-dialog`, `ark-drawer`, `ark-command-palette`, `ark-menu`, `ark-tooltip`: an overlay upgraded already open (an
  `open` attribute in server-rendered HTML registered later, or `open` assigned before registration) opened
  before `connectedCallback` and dispatched `ark-open` synchronously, before the listeners attached while mounting;
  it now opens in `connectedCallback`, with `ark-open` in a microtask.
- `ark-wysiwyg-editor`: assigning `colors`/`highlights` a JSON string (what React 19 and Vue assign when the template
  writes the attribute) removed the attribute and fell back to the default palette; the setter now takes the string
  like the attribute.
- `@tooark/react` `IntrinsicElements`: `ark-code-editor` gains `size`, `single-line` and `mark-unknown-variables`,
  `ark-chart` and the wysiwyg tags gain `testid`, `ark-shape-picker` gains `shapes`.

### Changed

- `ark-shape-picker` offers all ten `ark-mark` shapes by default (it offered six); set `shapes` to keep a subset,
  e.g. `shapes="circle,square,triangle,diamond,star,hexagon"` for the previous six.
- `@tooark/react`: the wrappers are `forwardRef` components, so their declarations are
  `ForwardRefExoticComponent<Props & RefAttributes<Element>>`; JSX usage and the `Ark*Props` types are unchanged.
- README: the `ark-code-editor` section covers 1.2.0's scoped variables and single-line field; a note on the
  attributes mirrored on the host (`placeholder`, `aria-label` on `ark-input` and the fields built on it) and the test
  queries that find only the control; the side packages and `@tooark/motion` READMEs show how to use them in React,
  Vue and Angular without a wrapper.
- Storybook `Integration/Framework Props` also checks `ark-chart`, `ark-code-editor` and the wysiwyg tags, and new
  stories assign every property of every tag, and `open` on the overlays, before the element is registered.
  `pnpm check:ssr` checks that each Angular wrapper's `element` queries its own tag.
- The dependency tables of every package README list the 1.3.0 ranges.

## [1.2.2] - 2026-09-28

### Changed

- `@tooark/motion` depends on `motion` `^13.4.4` (was `^13.4.0`); its README dependency table follows.
- The root README lists every package with its npm version, downloads and install command.
- Development dependencies updated (Angular 21.2.24, React 19.3, Vue 3.5.43, Vite 8.3.1, Rollup 4.63.5, CodeMirror
  state/view, `@types/node`); the published code does not change.

## [1.2.1] - 2026-09-28

### Fixed

- `@tooark/code` declares the CodeMirror versions it really needs: `@codemirror/view` `>=6.27` (the Ctrl+M /
  Shift+Alt+M tab-focus toggle the README documents needs `setTabFocusMode`, 6.27, and `variables` needs
  `outerDecorations`, 6.23) and `@codemirror/commands` `>=6.6` (the `toggleTabFocusMode` binding). With `>=6`, an
  older copy installed without a warning and those features failed at runtime; the other peers stay at `>=6`.

## [1.2.0] - 2026-09-28

### Added

- `@tooark/code`: opt-in scoped variables and a single-line field; an editor without the new options behaves
  exactly as before (`variableKeys` alone still only completes).
  - `variables` (`ArkCodeVariable[]`: `{ key, scope?, intent?, value? }`) paints each `{{key}}` with the intent's soft
    colors, also inside JSON strings, as a single span with `data-key`/`data-scope`/`data-intent` for CSS overrides
    (`data-ark="code-editor-variable"` for E2E); a variable with `scope` or `value` gets a hover tooltip, and the
    completion shows the scope as detail and the value as info. The scope is free-form and the precedence between
    scopes stays with the app. Needs `@codemirror/view` 6.23 or later.
  - `mark-unknown-variables` paints a `{{key}}` found in neither `variables` nor `variableKeys` as `danger` with a
    wavy underline.
  - `single-line` turns the editor into a one-line field at the height of the controls of the same `size` (no
    gutters or active line, Enter emits `ark-submit`, pasted line breaks are removed, Tab leaves, Ctrl/Cmd+F stays
    with the browser); `size` (`xs` … `xl`, default `md`) also scales the font and side padding in the regular editor.
  - Engine: `setVariables`, `setMarkUnknownVariables`, `setSingleLine`, `setSize` and the `onSubmit` option; completion
    keys also accept `$` (`{{$guid}}`).
- `@tooark/tokens`: `ARK_SIZE_CSS` and `ARK_INTENT_SOFT_CSS`, JS mirrors of `--ark-size-*` and of each intent's
  `-soft`/`-soft-fg` colors for `var()` fallbacks.

### Changed

- `@tooark/code` depends on `@tooark/tokens` 1.2.0 (the new mirrors are its fallbacks); the dependency tables of
  every README list the 1.2.0 ranges.
- Storybook `Code/ArkCodeEditor`: the docs page groups every attribute, property, event and method by topic with
  its type and default, each story is a preset of the same controls, "Show code" prints the HTML and JS for the
  story's args, and the Playground calls `format()`/`focus()` and logs `change`, `ark-submit` and
  `ark-format-error`.

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
- Documentation (READMEs, API comments) aligned with the code after an audit: what each wrapper's handlers receive
  (the `detail` for calendar, clock, datepicker, carousel and scheduler), installing `@tooark/web-components` (and
  `@tooark/core` for `toast`) next to a wrapper with pnpm, the E2E hook names (`calendar-day`, the datepicker
  composition), the variables `tokens.css` really defines, the chart theming (ECharts light/dark, no tree-shaking
  promise), and many defaults, keyboard details and JS members.

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

- `@tooark/tokens`: design primitives (intent colors as `light-dark()`, size scale, a `--text-2xs` type step and
  motion tokens with the `sheet` easing), `resolveColorScheme` and `observeColorScheme`.
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

[Unreleased]: https://github.com/Tooark/web-components/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/Tooark/web-components/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Tooark/web-components/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/Tooark/web-components/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/Tooark/web-components/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Tooark/web-components/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Tooark/web-components/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Tooark/web-components/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Tooark/web-components/releases/tag/v1.0.0
