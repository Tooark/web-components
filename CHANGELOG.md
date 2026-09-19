# Changelog

All notable changes to the `@tooark/*` packages are documented here. Every package shares one version and is
published together; the release workflow uses the section matching the root `package.json` version as the GitHub
Release notes.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- `ark-carousel`: a `next()`/`prev()` or arrow click in the same frame as the mount was undone by the deferred
  initial positioning (it went back to `start-index`), which let the smooth scroll finish on its own and fire a second
  `ark-slide-change`. The initial positioning now starts from the current index, and the pending frame is cancelled
  when the element is removed.

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

[Unreleased]: https://github.com/Tooark/web-components/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Tooark/web-components/releases/tag/v1.0.0
