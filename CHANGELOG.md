# Changelog

All notable changes to the `@tooark/*` packages are documented here. Every package shares one version and is
published together; the release workflow uses the section matching the root `package.json` version as the GitHub
Release notes.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- `ark-dialog`, `ark-drawer` and `ark-command-palette` kept mounted and closed through a prop in React lost the
  focus to `<body>` instead of returning it to the opener: a footer button with a synchronous `onClick`, a save
  that closes after an `await`, the form's submit (Enter in a field), a state change outside an event. `open`
  changes inside the commit, the trap returned the focus to the opener right there, and React, at the end of the
  commit, refocused the element that had the focus before it (the button inside the overlay on its way out), which
  then disappeared. `trapFocus` now returns the focus in a microtask, after the commit.
  `ReactOverlayClosedByPropReturnsFocus` story.
- `trapFocus`: a dialog opened on top of another left the one underneath usable. The trap treated every open
  popover as a popover on top of it, the dialog below included, so focus sent there stayed there and a click on one
  of its buttons went through (closing it with the other still open). The container of a trap underneath no longer
  counts, for the focus or the pointer: the focus comes back, and the click is the scrim click of the dialog on
  top. `DialogBelowIsNotOnTop` story.
- `ark-dialog` and `ark-drawer` opened by a prop in React: the focus went to the field, back to the opener and
  to the field again (the 1.9.1 fix brought it back), with `focusin`/`focusout` firing twice on both. With one
  dialog opening another it stayed on the button of the one underneath, behind the new dialog, and Esc then closed
  the one underneath and left the new one open. The trap, the initial focus and `ark-open` now come one microtask
  after `open` changes, after the commit, in `ark-command-palette` as well: the focus goes to the field once.
  `ReactOverlayOpenedByPropFocusesField` and `ReactStackedDialogs` stories.
- React, Vue and Angular wrappers of dialog, drawer, command palette and menu: `onOpen`/`onClose` (`@ark-open`,
  `(arkOpen)`...) also fired for the events of any overlay inside the element, because `ark-open` and `ark-close`
  bubble and the wrapper passed them on without looking at the target. An `ark-menu` that closed inside an
  `ArkDialog`, or a closable tab asking to close, called the dialog's `onClose`, and an app that answers it with
  `setOpen(false)` closed the dialog; one dialog inside another closed both. The handlers now only get the events of
  their own element, and `onClose` of the tabs wrapper only the `ark-close` of its own tabs. The raw tags are
  unchanged: the events still bubble, so a listener on the element checks `event.target`.
  `ReactOverlayEventsAreItsOwn`, `VueOverlayEventsAreItsOwn` and `OverlayEventsAreItsOwn` (Angular) stories.
- `ark-split-pane`: the `sizes` setter threw with `undefined` or `null` (`value.map`). `ArkSplitPane` from
  `@tooark/vue` without the `sizes` prop logged "Failed setting prop" on every mount, and in React taking the prop
  away after it had a value raised an error. Both values now remove the attribute.
  `EverySetterTakesAnAbsentProp` story, which checks every setter of every element.
- `trapFocus`: when the element that gets the focus back can no longer take it (the button of a dialog that
  closed when it opened the next one), the focus goes to the `returnTo` of the trap that contained it instead of
  `<body>`. Closing the second dialog of a swap now lands on the button that opened the first, in both DOM orders.

### Changed

- `trapFocus` (`@tooark/core`): the release function returns the focus to `returnTo` one microtask later instead
  of synchronously, and only when the focus is still inside the container or on `<body>` (an app that moved it
  elsewhere while closing keeps its choice). Code that reads `document.activeElement` right after releasing a trap,
  or right after `close()` on a dialog, drawer or palette, has to wait a microtask (`await Promise.resolve()`).
- `ark-dialog`, `ark-drawer` and `ark-command-palette`: `ark-open` and the initial focus come one microtask after
  `open` changes (`show()`, the `open` property or attribute), as they already did for an overlay inserted open.
  Code that reads the focus or expects the event right after `show()` has to wait a microtask. What does not
  change: `data-ark-state`, the top layer and `ark-close` are still synchronous, opening and closing in the same
  step still emits `ark-open` before `ark-close`, a field the app focuses right after opening keeps the focus, and
  the focus returns on close to the element that had it when `open` changed.
  `OpenSettlesAfterTheCurrentStep` and `ReactOverlayKeepsTheAppFocus` stories.

## [1.9.1] - 2026-11-23

### Fixed

- `ark-dialog` and `ark-drawer` opened by a prop in React (already mounted, `open` going from `false` to `true`)
  ended with the focus on the header's close button instead of the field. The overlay opens inside the commit and
  focuses its field, React then refocuses the element that had the focus before the commit (the opener), and the
  focus trap answered with the first focusable of the panel. `trapFocus` now brings escaped focus back to where it
  was: the last element focused inside the container, else `initial`, else the first focusable. The same goes for
  any other way the focus leaves and comes back (an `ark-menu` that closes, the app calling `focus()`). It only
  showed with a focused opener (a real click or Enter), so the suite did not catch it.
  `ReactOverlayOpenedByPropFocusesField` and `EscapedFocusReturnsWhereItWas` stories.
- `trapFocus`: a popover on its way out through `closePopover` no longer holds the focus as a popover opened on top
  of the trap (it still matches `:popover-open` during the exit animation). With one dialog closing and another
  opening in the same step, focus sent back into the closing one (React refocusing the button that made the swap)
  stayed there and was lost to `<body>` when it disappeared; it now goes to the open dialog. Pointer events on the
  closing popover still reach it, as before. `ReactDialogSwapKeepsFocus`, `FocusLeavesTheClosingDialog` and
  `ClosingDialogOnTopKeepsThePointer` stories.
- `ark-dialog` and `ark-drawer`: the initial focus skipped an `ark-checkbox`, `ark-radio`, `ark-file-input` or
  `ark-kv-editor` at the top of the body and went to the footer (to the close button without one). The choice left
  out every node marked `data-ark-chrome`, meant for the overlay's own header, and the control those components
  draw carries the same mark. Only the header of the dialog or drawer itself is left out now. A body whose first
  focusable is some other component's own control (the dismiss button of an `ark-alert` above a form) gets the
  focus there too: put `autofocus` on the field to choose. `InitialFocusOnDrawnControls` story.

## [1.9.0] - 2026-11-23

### Added

- `ark-button-group`: new element. The host is the `role="group"` and the app's `ark-button` children stay in
  place. Joined by default (one outline: the outer corners follow `rounded`, each button overlaps the previous one
  by 1 px, and the variants without a border get a divider in the text color), `spaced` separates them by the gap of
  the `size`; `orientation` (`horizontal`/`vertical`), `full-width`, `label` (the `aria-label`). `variant`,
  `intent`, `size`, `rounded`, `theme` and `disabled` on the group apply to every button and win over the
  button's own attribute while the group has them (the Vue and Angular wrappers always write a default on the
  button); what a button had comes back when the group loses the attribute or the button leaves. No event of its
  own. A split button is this group plus an `ark-menu` (`SplitButton` story, README example). Hook `button-group`.
- `ark-radio-group`: new element. The host is the `role="radiogroup"` and the app's `ark-radio` children stay in
  place, forming one group by being in that host, with or without `name`. `value` is synced with the checked radio
  (setting it checks without emitting `change`), and the group emits a single `change` with `detail: { value }`.
  `label` (own legend, `aria-labelledby`), `helper`, `error` and `error-message` (`aria-describedby`,
  `aria-invalid`), `orientation` (`vertical`/`horizontal`), `required` (`aria-required`), and `name`, `size`,
  `intent`, `theme` and `disabled` for every radio. Hooks `radio-group`, `radio-group-label`,
  `radio-group-helper` and `radio-group-error`.
- `ArkButtonGroup` and `ArkRadioGroup` in `@tooark/react` and `@tooark/vue`, `ArkButtonGroupComponent`
  (`ark-button-group-wrapper`) and `ArkRadioGroupComponent` (`ark-radio-group-wrapper`) in `@tooark/angular`, the
  raw tags' JSX typing, and the types `ArkOrientation`, `ArkButtonGroupStyleOptions` and
  `ArkRadioGroupStyleOptions` in `@tooark/core`.

### Changed

- `ark-radio`: inside an `ark-radio-group` the siblings are the radios of that host instead of the radios with the
  same `name`. Outside a group nothing changes.
- `ark-button`: reads `data-ark-group-pos` and `data-ark-group-dir`, written by `ark-button-group`, to square its
  inner corners and draw the divider. Without them it renders as before.

## [1.8.0] - 2026-11-23

### Added

- `ark-button`: `variant="soft"`, the intent's soft background with its text color (the look of the default
  `ark-badge`). The border is transparent at rest and takes the intent's border color on hover, so the box has the
  size of the other variants. Before, `soft` was not a variant and the button fell back to `solid`: an app that
  already wrote `variant="soft"` now gets the soft look. `ArkStyleVariant` (`@tooark/tokens`) gains `"soft"`.
  `Soft` story, with the contrast of the seven intents in both themes checked by axe.
- `ark-tree`: `icons` (opt-in). `files` draws the component's own outline icons on the nodes without a
  `slot="icon"` (a folder on branches, open while expanded, a file on leaves); `none` hides every icon, the app's
  `slot="icon"` included, and leaves only the names. Without the attribute nothing changes: a node shows only the
  icon the app gives it, and mounting about 2,200 open nodes takes the same time as before (147 ms, measured
  without the accessibility tree; 231 ms with `icons="files"`).
- `ark-tree-item`: `icon` (`folder`, `file`, `none`) names the built-in icon of one node, with or without
  `icons` on the tree; `iconElement` and the `tree-item-icon` hook (`data-ark-icon` says which icon is drawn).
- `ark-tree`: `icon-color`, an intent (the token, so it follows the brand override and the theme), `current` (the
  tree's text color) or a CSS color, written to `--ark-tree-icon-color` on the host. The built-in icons default to
  `fg-muted`; the app's own `slot="icon"` takes the color only while the attribute is present.
- `ark-tree-item`: `--ark-tree-icon-size` (14 / 14 / 16 / 18 / 20 px for `xs` … `xl`), so icons follow the tree's
  `size`: the built-in ones use it and an app icon reads it (`width: var(--ark-tree-icon-size)`).
- `icons`, `iconColor` and `icon` on the tree wrappers of `@tooark/react`, `@tooark/vue` and `@tooark/angular`, and
  on the raw tags' JSX typing; `ArkTreeIcons` and `ArkTreeItemIcon` types in `@tooark/core`.
- `ark-input`: `list` is mirrored onto the inner `<input>`, so a `<datalist>` on the page offers its suggestions.
  `list` prop on `ArkInput` (React, Vue) and `ArkInputComponent` (Angular), and on the raw tag's JSX typing.
- `ark-button`: `form` (the id of a form the button sits outside of, as on a native `<button form>`) is a prop of
  `ArkButton` (React, Vue) and `ArkButtonComponent` (Angular), and of the raw tag's JSX typing. The attribute already
  worked on the element; see the fix below for the property.

### Fixed

- `ark-checkbox`: a mouse click in the middle of a checked box toggled it twice (`change` with `false`, then `true`)
  and left it checked, and from `indeterminate` it ended unchecked. The click lands on the glyph, the redraw removes
  that `<svg>` from the DOM, and the host's own click handler no longer found it inside the box. The handler now
  reads the event path. Clicks on the edge of the box, on the label and the Space key were not affected, nor were
  `ark-radio` and `ark-switch`, which now read the event path too. `GlyphClickTogglesOnce` story.
- `ark-button`: `form` only had a getter. React 19 assigns a prop as a property when the element defines it, so
  `<ArkButton form="id">` threw ("Cannot set property form … which has only a getter") and unmounted the tree. The
  property now has a setter that writes the attribute (`null`/`undefined` remove it).
- `ark-dialog`, `ark-drawer`: inserted already open (a framework that renders the overlay only while it is open, with
  the elements registered), the initial focus went to the close button when the first field of the body was an
  `ark-input`, `ark-select` or another `ark-*` field. The focus was chosen in the overlay's `connectedCallback`,
  before its children connected and built their native controls. The focus trap and the initial focus now wait for
  the same microtask as `ark-open`. Opening after mount was not affected.
- `ark-card`: stretched to a taller row (a grid of cards, a height on the host), the host split the extra height among
  its rows, so the title moved down (87 px in a 372 px card) and the footer row grew. A card with a heading, a header,
  actions or a footer now keeps its title at the top. A body made of a single child takes the extra height (it used
  to get only a share of it) and the footer sits at the bottom; a body of several children stays together at the top
  with the extra below. A body-only card renders exactly as before, and so does any card that is not stretched.
  `Stretched` story.
- `ark-card` with `wrap-actions`: on a page that sets `overflow-wrap: anywhere`, the inherited value reduced the
  minimum width of the title to one character, so the own `h2` became one letter per line. The `h2` now sets
  `overflow-wrap: break-word`, which breaks a word that does not fit without changing the minimum width.
- `ark-textarea` with `autosize`: `rows` was ignored (`field-sizing: content` drops it), so `rows="4"` rendered one
  line. An explicit `rows` is now the minimum height. Without the attribute `autosize` still starts at one line.
  The bulk mode of `ark-kv-editor`, which asks for `rows="4"`, now opens with those four lines.
- `ark-menu`: `align="end"` right-aligned the group labels and any free content. Chromium maps the `align` attribute
  of every HTML element to `text-align`; the host now sets `text-align: start`.
- `ark-alert`: a `slot="action"` that is not on the first line (placed after a paragraph, or after text that wrapped
  in a narrow alert) kept the negative offset that centers it on the first line and covered 3 px of the line above.
  The host now measures where the action landed and drops the offset there, so the action moves 4 px down in that
  case; on the first line nothing changes.
- `@tooark/react`: a boolean `aria-*` prop (`aria-pressed={true}`) reached the element as an empty attribute, an
  invalid ARIA value, because React 19 writes booleans on custom elements as present or absent. Every wrapper now
  passes those as `"true"`/`"false"`, as React does on native elements.

### Changed

- README: `slot="actions"` of `ark-card` is a single container (two children with that slot share one cell and
  overlap), as the drawer's section already said; `flex-wrap: wrap` on the `ark-toggle-group` host wraps the options
  in a narrow container; `ark-alert` states where the action lands by its place in the DOM.
- README: why only a single body child of a stretched `ark-card` takes the extra height, with the structure that
  pins the footer; a "Bundle size" note under Getting started (one registration for every element: a wrapper
  from `@tooark/react` adds about 415 kB minified in 1.7.0; per-element entry points are a planned, opt-in
  improvement).

## [1.7.0] - 2026-11-22

### Added

- `ark-pagination`: new element. The host is the `role="navigation"`; it renders the range summary (`31–40 of 134`),
  an optional page-size select (`page-sizes`, an `ark-select`) and the page strip with previous, next, ellipses and a
  constant number of items (`siblings` around the current page). `page`, `page-size` and `total` are the source of
  truth: a click rewrites `page`, emits `ark-page-change` with `detail: { page, pageSize, pageCount }` and announces
  the page; changing the page size keeps the first visible item on screen. `disabled`, `size`, `intent`, `lang`.
  `ArkPagination` wrappers for React, Vue and Angular (`ArkPaginationComponent`, with `ariaLabel`).
- `ark-data-view`: new element, a collection of records shown as a real `<table>` or as a list of cards. `rows` (your
  objects, kept by reference) and `columns` are JS properties; a column picks a field (`key`, dotted paths included),
  where it shows (`show`), how it sorts (`sortable`, `compare`), its place in the card (`cardRole`, `cardSpan`,
  `cardLabel`) and its content through `render`, which returns a DOM node (an `ark-avatar`, two lines of text) or a
  text, never HTML; `cardRender` draws a whole card body. `view="auto"` (the default) shows cards while the component
  itself is narrower than `breakpoint`, `table` and `cards` pin one; the selector in the corner rewrites `view`
  (`ark-view-change`) and `no-view-selector` hides it while `view` keeps deciding. `mode="client"` searches, sorts
  and pages `rows`; `mode="server"` only publishes the query in `ark-query-change`
  (`{ page, pageSize, sort, search, reason }`) and shows what the app hands back, with `total` and `loading`. With
  nothing else set it is a plain table with the view selector; everything else is opt-in: `searchable`, `page-size`
  (composes `ark-pagination`), `selectable` (checkboxes, select all with a mixed state, `selected`,
  `ark-selection-change`, and a `slot="selection"` for bulk actions that shows only while something is selected),
  `reorderable` (a handle per record: pointer drag with a drop mark and auto-scroll near the edges of the scrolling
  area, arrow keys, and a move menu on click with up, down, to start and to end, the alternative to dragging;
  `ark-reorder`) and `clickable` (focusable rows and cards, `ark-row-click`). Slots `toolbar`, `selection` and
  `empty`: the component's own nodes fit around your children, also when a framework adds one later, so the tab
  order follows the visual one. `ark-render` (does not bubble) follows every redraw of the content.
- `ark-data-view` wrappers with the cell content in each framework's own terms, same result in all of them: React
  `ArkDataView` (generic over the record type, `<ArkDataView<User> … />`) draws a column's `render` and `cardRender`
  as JSX through portals, re-run on every render, so `columns` needs no `useMemo`; Vue `ArkDataView` takes the scoped
  slots `#cell-<key>` and `#card` (or a column `render` returning VNodes), teleported into the cells and reactive;
  Angular `ArkDataViewComponent` takes `<ng-template arkDataViewCell="<key>" let-row>` and
  `<ng-template arkDataViewCard let-row>` (`ArkDataViewCellDirective`, `ArkDataViewCardDirective`), checked with the
  component that declares them. Plain HTML/JS returns a DOM node from `render`.
- `@tooark/core`: the `ArkDataView*` types (`ArkDataViewColumn`, `ArkDataViewRow`, `ArkDataViewSort`,
  `ArkDataViewQuery`, the event details, `ArkDataViewStyleOptions`), `ArkPageChangeDetail`,
  `ArkPaginationStyleOptions`, and 25 strings in `ArkLocale` (en/pt/es) for both elements (`pagination`,
  `previousPage`, `nextPage`, `pageNumber`, `pageOf`, `perPage`, `rangeOf`, `viewMode`, `viewTable`, `viewCards`,
  `sortBy`, `sortAscending`, `sortDescending`, `sortedBy`, `sortCleared`, `selectAll`, `selectRow`, `selectedCount`,
  `clearSelection`, `reorder`, `movedTo`, `moveUp`, `moveDown`, `moveToStart`, `moveToEnd`); a `locale-json` without
  them falls back to English.
- `ark-nav`, `ark-nav-item` and `ark-nav-group`: app navigation in three presentations, `sidebar` (default: a column
  where `slot="header"` for the logo, `slot="footer"` for the avatar and the collapse button stay pinned to the ends
  and only the items scroll between them), `navbar` (a horizontal bar, no visible scrollbar) and `tabbar` (mobile
  bottom tabs, icon above the label). The sidebar collapses (`collapsed`, reflected) to an icon rail, header and
  footer centered, the labels visually hidden but still naming the links and a `title` on each item, or, with
  `collapsible="hidden"`, to the logo and the expand button alone; `collapsible` also adds the component's collapse
  button (new `collapse`/`expand` strings in `ArkLocale`, en/pt/es), whose click emits `ark-collapse`; `collapsed` on
  the navbar turns the items icon-only.
  Each item is a real stretched `<a href>` (Ctrl+click and new tab work; `aria-current="page"` when `current`) or a
  `role="button"` without `href`, emits a cancelable `ark-navigate` for SPA routing, and takes `slot="icon"` and
  `slot="trailing"`; `value` on the nav marks the current item by its `value` or `href`. Groups have a heading from
  `label`, `expandable` with `open` and `ark-toggle`. Widths come from `--ark-nav-width`/`--ark-nav-rail-width`. React,
  Vue and Angular wrappers (`ArkNav`, `ArkNavItem`, `ArkNavGroup`) and hooks `nav`, `nav-toggle`, `nav-header`,
  `nav-footer`, `nav-item`, `nav-item-link`, `nav-item-label`, `nav-item-icon`, `nav-item-trailing`, `nav-divider`,
  `nav-group`, `nav-group-heading`.
- `heading-level` (1–6) on `ark-card`, `ark-dialog`, `ark-drawer` and `ark-empty`: the component's own title
  (`heading`, or the `label` of dialog and drawer) takes that level so it fits the page outline; without it, or outside
  1–6, the defaults stay (`h2`, and `h3` in `ark-empty`). Changing it swaps the node in place, keeping its id (so
  `aria-labelledby` still points at it), classes and test hooks. `headingLevel` on the React, Vue and Angular wrappers,
  `ArkHeadingLevel` in core. `Core/Headings` story.
- `ark-card`: `wrap-actions` (opt-in, CSS only). Actions that do not fit beside the title wrap into more lines, flush
  right, and the card's own `h2` never gets narrower than its longest word, instead of the title being squeezed to
  nothing or to one letter per line. A `slot="header"` still shrinks as before (a title truncated with an ellipsis
  keeps truncating) and takes the same floor with `min-width: auto` on the element; a single word wider than the card
  widens the title column, so break it in the content. Without the attribute the card renders as before.
  `wrapActions` on the wrappers. `WrapActions` story.
- `ark-button` with `href`: `download` reaches the stretched `<a>` (empty keeps the URL's file name, a value names
  the file, a `blob:` URL saves generated content), and a plain click emits a cancelable `ark-navigate`
  (`detail: { href }`, `ArkButtonNavigateDetail`) before the browser follows the link, as `ark-nav-item` does, so an
  SPA calls `preventDefault()` and routes. Modifier keys, the middle button, a `target` other than `_self`,
  `download` and a click the app already cancelled stay with the browser, so code that intercepts the click itself
  keeps working. `download` and `onNavigate` (React), `download` and `@ark-navigate` (Vue), `download` and
  `(arkNavigate)` (Angular). `LinkNavigateAndDownload` story.
- `ark-switch`: children become a visible label, the pattern `ark-checkbox` already has.
  `<ark-switch>Email alerts</ark-switch>` lays the host out as a row with the track first (flex order, no node moves),
  names the switch from the text through `aria-labelledby` (the host gets an id when it has none) and toggles on a
  click on the text, while a link or control inside the label keeps its own behavior and a disabled switch ignores
  it. `aria-label` and `label` still take precedence for the name. A switch without children gets no class and no
  layout, as before. The React, Vue and Angular wrappers now pass children. `ChildrenAsLabel` story; the new wrapper
  props are covered by `ReactNewAttributes`, `VueNewAttributes` and the Angular `NewAttributes` integration stories.
- `ark-menu-group`: new element. Groups `ark-menu-item`s under a label (`role="group"`): `label` renders the
  component's own heading at the start of the host and names the group through `aria-labelledby` (without it, an
  `aria-label` on the host names it). The menu's arrows, Home and End cross groups as if the items were loose, a choice
  inside a group still comes out once as the menu's `ark-select`, and `size`/`theme` are propagated from the menu, also
  to a group added later. `ArkMenuGroup` (React, Vue), `ArkMenuGroupComponent` (`ark-menu-group-wrapper`, Angular),
  `ArkMenuGroupStyleOptions` in core; hooks `menu-group` and `menu-group-label`. `Groups` and `GroupSizes` stories.
- `ark-code-editor`: `max-height` (CSS length, opt-in). Above it the content scrolls inside the editor with the
  gutters, as in a file view; without it the editor grows with its content, as before. Below `min-height` the minimum
  wins, as in CSS, and `single-line` ignores it. `maxHeight` on the element, the `maxHeight` option and
  `setMaxHeight()` in the `createCodeEditor` engine. `MaxHeight` story.
- `setArkLocale(lang, localeJson?)` (opt-in): the language of every component without its own `lang`, one call per
  app instead of a `lang` on each element. Mounted components redraw at once (one that was out of the DOM during the
  change redraws on its next connect) and an element's own `lang` still wins. It takes the tag as the app has it
  (`pt-BR`), `custom` with the app's strings as an object or JSON (invalid JSON throws at the call) and `null` to go
  back to English; `<html lang>` is never read. The `@tooark/wysiwyg` editor follows it too: the setting lives in
  `@tooark/tokens` on a `globalThis` symbol, so the ESM and CJS builds and the side packages share it. The
  datepicker's default field format follows the default language as it follows `lang`. `getArkLocale()` and
  `observeArkLocale(onChange)` read and watch it; core re-exports the three, and so do the React, Vue and Angular
  packages, next to `toast`. Without the call nothing changes. `DefaultLocale` (every tag that observes `lang`) and
  `DefaultLocaleRules` stories, plus the `MenuGroupAndLocale` integration stories in the three frameworks.
- `--ark-syntax-*` tokens (`keyword`, `string`, `number`, `property`, `comment`, `atom`, `punctuation`, `invalid`):
  the code editor's syntax colors as `light-dark()` pairs in `tokens.css`, outside `@theme`, with the values the
  editor already used. `ark-code-editor` reads them with those values built in as fallbacks, so nothing changes until
  an app overrides one, and an app can color a `<pre>` of its own with them. `SyntaxTokens` story.
- `ark-chart`: `palette="tokens"` (opt-in). The ECharts theme is built from the page's `--ark-color-*` tokens on the
  side `theme` resolves: series in the intents (primary, info, success, warning, danger, neutral), text, axes and
  legend in `fg`/`fg-muted`, grid lines in `border`, tooltip in `surface-raised`, and a transparent background instead
  of the built-in dark theme's opaque one. Each color is read through a probe (the tokens are `light-dark()`) and
  converted to sRGB on a 1×1 canvas, since most tokens compute to `oklch()`, which ECharts does not parse. A theme
  toggle re-reads them, `option.color` still wins, and without the tokens CSS on the page it falls back to the default
  palette. `resolvedPalette` on the element; the `palette` option, `setPalette()` and `resolvedPalette()` in the
  `createChart` engine; `ArkChartPalette`. `TokensPalette` story.
- `ark-time`: new element, date and time through `Intl` with no dependency. `datetime` takes an ISO string with a
  zone, a local time without one (read in the local zone) or a date alone (counted in calendar days); the property also
  takes a `Date` or milliseconds. `format="relative"` (default: "3 minutes ago", "yesterday") updates itself at the next
  point the text changes and stops out of the document or with the tab hidden; `date`, `time` and `datetime` are
  absolute. The content is the component's own `<time datetime>`, with the full date as `title` unless the host has
  one. The language is `lang` (any tag, `pt-BR` included, straight to `Intl`), else `setArkLocale()`'s, else `en`.
  `ArkTime` (React, Vue), `ArkTimeComponent` (`ark-time-wrapper`, Angular), whose `datetime` also takes a `Date` or
  milliseconds; `ArkTimeFormat` and `ArkTimeStyleOptions` in core; hooks `time` and `time-value`. Stories
  `Core/ArkTime` and the `ReactTime`, `VueTime` and Angular `Time` integration stories.
- Wrappers for the side packages in subpath entry points, so ECharts, CodeMirror and Tiptap only reach the apps that
  import them: `@tooark/react/chart`, `/code` and `/wysiwyg` (`ArkChart`, `ArkCodeEditor`, `ArkWysiwygEditor`,
  `ArkWysiwygViewer`), the same in `@tooark/vue`, and the Angular secondary entries `@tooark/angular/chart`, `/code`
  and `/wysiwyg` (`ark-chart-wrapper`, `ark-code-editor-wrapper`, `ark-wysiwyg-editor-wrapper`,
  `ark-wysiwyg-viewer-wrapper`). The side packages are optional peers of the wrapper packages (`@tooark/chart` and
  `@tooark/wysiwyg` `>=1.0.0`, `@tooark/code` `>=1.6.0`, so upgrading a wrapper package alone raises no peer conflict),
  and the main entries do not import them (`check:ssr` fails if any other dist file mentions them; `typesVersions`
  keeps the subpaths resolvable under `node10`). Object and function props go in as properties only when the reference
  changes, and a controlled code or wysiwyg editor keeps its cursor when the value or JSON its change event delivered
  comes back. Importing a React subpath also types the raw tag's JS properties in JSX (`option`, `value`,
  `extensions`, `variables`, `completions`, `formatter`, `uploadFile`; the wysiwyg `content` stays on the wrapper,
  since React types `content` as the `<meta>` text attribute). `ReactSidePackages`, `VueSidePackages` and the Angular
  `SidePackages` integration stories, and `typecheck/side-packages.tsx` in the React build.
- `ark-tree` and `ark-tree-item`: new elements, a declarative tree. Nested `ark-tree-item`s stay where the app puts
  them; each item's own row is the `treeitem`, a flat tree for assistive tech with `aria-level`, `aria-setsize` and
  `aria-posinset` set explicitly (the host is `role="none"`, so no child is moved or wrapped). Simple by default: no
  `selection` only navigates, expands and activates; `single` selects and activates on a row click, `multiple` toggles
  rows, and `checkboxes` (with `multiple`) checks through boxes, with `propagate` to descendants and `mixed` parents
  (disabled descendants keep their state; children loaded later under a checked parent arrive checked). `value` (one
  value in `single`, a JSON list in `multiple`) and JS `values` follow the selection both ways. `lazy` and `loading`
  for on-demand children. WAI-ARIA keyboard: one tab stop, arrows, Home/End, typeahead, `*`, Enter activates, Space
  selects or checks, and collapsing a branch that holds the focus brings it to the collapsed item. Events on the
  tree: `ark-toggle`, `ark-selection-change`, `ark-activate`. `ArkTree`/`ArkTreeItem` (React, Vue),
  `ArkTreeComponent`/`ArkTreeItemComponent` (`ark-tree-wrapper`, `ark-tree-item-wrapper` with `display: contents`,
  Angular), `ArkTreeSelection` and the style options in core; hooks `tree`, `tree-item` and its parts. Known limit: a
  control in `slot="trailing"` is a sibling of the treeitem and axe flags `aria-required-children`, so the trailing is
  meant for badges, and the trailing becomes the row's description (`aria-describedby`) so a badge is read with the
  row. Measured with about 2,000 open nodes: under a second to mount, about 3.5 s while Chromium's accessibility tree
  is active (the row chrome is built before it enters the DOM, which halved that). The tree stories run axe as an
  error. `Core/ArkTree` and the `ReactTree`, `VueTree` and Angular `Tree` integration stories.

### Changed

- The Vue and Angular wrappers of `ark-calendar`, `ark-clock`, `ark-datepicker` and `ark-scheduler` no longer write
  `lang="en"` when the app passes no `lang`, as React and every other wrapper already did, so these components follow
  `setArkLocale()`. The strings stay the same English, but the element carries no `lang` attribute, like the raw tag:
  a `[lang="en"]` selector or an E2E assertion on it no longer matches, and screen readers read those strings in the
  language the page declares (pass `lang`, or call `setArkLocale()`, to keep the two in step).
- The Storybook suite now runs the Angular wrappers too (`Integration/Angular Wrappers`): they are JIT-compiled from
  source (the Storybook Vite config turns on legacy decorators for them) and mounted in a zoneless application, next
  to the React and Vue integration stories. `pnpm check:ssr` also renders the React and Vue `ArkDataView`.
- Portuguese accents fixed in the Storybook stories (docs descriptions and demo texts) and in source comments,
  including the JSDoc of the React and Vue wrappers that reaches the editor tooltip and the published `.d.ts`. Text
  only: no attribute, event, test id or locale string changed.
- Dependencies: `@tooark/motion` depends on `motion` ^14.14.0 (was ^14.1.0), `@tooark/wysiwyg` on `@tiptap/*`
  ^3.34.0 (was ^3.31.4), and the packages that use `tslib` on ^2.9.1 (was ^2.8.1). Minor and patch releases of
  those libraries; the suite passes on them. The dependency tables of the package READMEs match their manifests
  again.

### Fixed

- `ark-input`, `ark-select`, `ark-file-input`, `ark-textarea`, and `ark-checkbox`/`ark-radio` with `helper`: stretched
  to a taller row (a flex row with the default `align-items: stretch`, or a grid row), the host split the extra
  height among label, field and message, so the label floated and the box moved down. With a visible label or
  message, the extra height now goes below the message, so everything sits where it would on its own, and
  `ark-textarea` grows between label and message instead (also when the host is given a height; with `autosize` it
  keeps measuring its content and the extra height goes below, like the others). A field with neither label nor
  message renders exactly as before (an input next to a taller button stays centered), and fields that are not
  stretched measure the same. `StretchedRow` story in `Core/Alignment`.
- `lang` with a region (`pt-BR`, `es-419`, `en_US`, any case) fell back to English, because `resolveLocale` and the
  wysiwyg toolbar labels only knew `en`, `pt` and `es`. The base language now picks the table, so the values of
  `<html lang>` and `navigator.language` work without mapping: a page that passed `lang="pt-BR"` and got English now
  gets Portuguese. A language without a table still falls back to English, `custom` is unchanged and the wrapper props
  stay typed as `ArkLang`. `Core/I18n` story.

## [1.6.1] - 2026-10-16

### Fixed

- `ark-button`: Enter in a text field of a form submits it through the first `type="submit"` `ark-button`, as with a
  native submit button. The browser never makes a custom element the form's default button, so a form whose only
  submit control was an `ark-button` did not submit on Enter when it had two or more text fields (a login form), and
  with a single field it submitted without going through the button (its `click` listeners and the `loading` block
  were skipped). Enter now takes the click path (`click` listeners, `preventDefault()`, then `requestSubmit()` with
  validation): a native submit button in the form keeps the role, a `disabled` or `loading` default button blocks
  the submission, and an Enter already cancelled by the app or a component, a `textarea`, IME composition and
  Ctrl/Alt/Meta+Enter are left alone. Such forms now submit on Enter, as they would with a native submit button; an
  app that worked around it by calling `requestSubmit()` on Enter should drop that code (or cancel the keydown) so
  the form is not submitted twice. `EnterSubmitsForm` and `EnterSubmitRules` stories, plus `ReactEnterSubmitsForm`
  with the React wrappers.
- `ark-datepicker`: Enter in the field applied the typed text but always cancelled the key, so a form never
  submitted from it. With the popup closed and a valid (or empty) entry, Enter now applies the text and goes on to
  the form, as `<input type="date">` does; an invalid entry (which reverts) or an open popup still keeps the Enter.
  `EnterSubmitsForm` story.

### Changed

- `@tooark/motion` depends on `motion` ^14.1.0 (was ^13.5.0). Motion 14.0 only removed internal APIs; the re-exported
  primitives (`animate`, `hover`, `inView`, `press`, `scroll`, `spring`, `stagger`) are unchanged. The dependency
  tables of the `@tooark/motion` and `@tooark/wysiwyg` READMEs now match their manifests.

## [1.6.0] - 2026-10-13

### Added

- `ark-code-editor`: opt-in `extensions` (a JS property; the `extensions` option and `setExtensions()` of the
  `createCodeEditor` engine; type `ArkCodeExtension`) adds the app's own CodeMirror extensions after the package's.
  This covers a grammar the package does not ship, such as one `@codemirror/language-data` loads by file name (with
  `language` left at `text`; it is highlighted with the package's syntax colors), a gutter such as blame
  (`Prec.high` puts it before the line numbers), or decorations such as search hits. A new value reconfigures the
  same editor, keeping text, history and selection, and the same reference does nothing. The extensions also come
  back when the element is recreated after moving in the DOM, which a one-off `view.dispatch` from the app would
  lose. Without it the editor is unchanged. An `Extensions` story shows a code viewer: a grammar from outside the
  package, a blame gutter and highlighted search hits.

## [1.5.0] - 2026-10-01

### Added

- `ark-file-input`: opt-in `directory` (attribute and JS property) picks a whole folder. The hidden input gets
  `webkitdirectory` plus `multiple`, so a browser without folder selection (older mobile ones) falls back to choosing
  the folder's files; a folder dropped on the zone is read to the end, subfolders included; the list becomes one
  summary line (new hook `file-input-summary`) and `change` carries `detail: { files, paths }`, with the `paths`
  property giving the path of each file from the folder name down. New strings `chooseFolder`, `dropFolderHint`,
  `noFolder` and `fileCount` (`ArkLocale`, en/pt/es; a `locale-json` without them falls back to English) and a
  `directory` prop on the React, Vue and Angular wrappers. Without it the field picks files as before.
- `@tooark/react`: every wrapper's props type takes React's DOM attributes and handlers (`id`, `style`, `title`,
  `tabIndex`, `aria-*`, `onClick`, `onKeyDown`, ...), as `ArkButtonProps` already did. The wrappers always forwarded
  them to the element; only the types refused them, so `<ArkCheckbox onClick={...} />` no longer needs the raw tag.
  Props the wrapper defines win over the React ones of the same name (`onChange` stays the element's `CustomEvent`),
  and wrappers of elements without content still take no children. Types only, no runtime change; a type-check step
  in the package build (`typecheck/`) pins it.

### Changed

- The Storybook site (<https://tooark.com/web-components/>) is titled `Tooark Web Components` instead of `Storybook`:
  `manager-head.html` swaps the name the manager writes on every navigation and `scripts/storybook-title.mjs` rewrites
  the static `<title>` after `storybook build`.
- `ark-checkbox` and `ark-radio`: the README documents, and an `InsideOuterLabel` story pins, that a `<label>` wrapped
  around the element names the drawn control and toggles it once per click (no behavior change).
- READMEs: the Angular notes (root and package) state that only the inputs reach the element, since an `id`, `class`,
  `style` or `data-*` written on the `<ark-*-wrapper>` tag stays on the wrapper, and the React section of the root
  README mentions the typed DOM attributes.

### Fixed

- `ark-clock` wrappers (React, Vue, Angular) and the `ark-clock` JSX typing: `localeJson` (a JSON string) was missing,
  so a standalone clock with `lang="custom"` could not get its `hours`/`minutes`/`seconds` labels through a wrapper.
- `ark-file-input`: a folder dropped on the zone is no longer taken as a file (the browser hands it over as an empty
  `File` that cannot be read). It is left out, the files dropped with it are kept, the list shows the new
  `foldersNotAccepted` string (`ArkLocale`, en/pt/es; hook `file-input-rejected`) and the announcement carries it; a
  drop of folders alone keeps the selection and emits no `change`.
- `ark-file-input`: a long file name is cut with an ellipsis instead of overflowing the drop zone of a narrow field (a
  phone screen); the list was as wide as its longest name, so the truncation of its items never applied.

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

[Unreleased]: https://github.com/Tooark/web-components/compare/v1.9.1...HEAD
[1.9.1]: https://github.com/Tooark/web-components/compare/v1.9.0...v1.9.1
[1.9.0]: https://github.com/Tooark/web-components/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/Tooark/web-components/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/Tooark/web-components/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/Tooark/web-components/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/Tooark/web-components/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/Tooark/web-components/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/Tooark/web-components/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Tooark/web-components/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/Tooark/web-components/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/Tooark/web-components/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/Tooark/web-components/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Tooark/web-components/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Tooark/web-components/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Tooark/web-components/releases/tag/v1.0.0
