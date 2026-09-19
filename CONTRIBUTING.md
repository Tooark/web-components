# Contributing to web-components

First off, thank you for considering contributing to **Tooark web-components**! 🎉

This repository is a pnpm monorepo of framework-agnostic Custom Elements
(`ark-*`) built on a design-token layer, with React, Vue and Angular wrappers
and a few side packages (charts, rich text, code editor, motion). This document
explains how to propose changes, report bugs, and submit code. The authoring
rules that every component follows live in [`CLAUDE.md`](CLAUDE.md) — read it
before touching a component.

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Repository layout](#repository-layout)
- [Development workflow](#development-workflow)
- [Adding or changing a component](#adding-or-changing-a-component)
- [Commit convention](#commit-convention)
- [Documentation standards](#documentation-standards)
- [Versioning and releasing](#versioning-and-releasing)
- [Pull Request checklist](#pull-request-checklist)
- [Community](#community)

---

## Ways to contribute

- 🐛 **Report bugs** — open an issue with the `bug` template (a minimal
  reproduction or a Storybook story name helps a lot).
- ✨ **Suggest improvements or new components** — open an issue with the
  `feature` template; describe the problem in generic UI terms (components
  never carry app-specific vocabulary).
- 📖 **Improve documentation** — the READMEs (English and Portuguese) and the
  Storybook docs are first-class.
- ♿ **Review accessibility** — roles, keyboard paths, reduced motion, focus
  management; axe runs on every story.
- 💻 **Write code** — components, wrappers, stories, tokens, helpers.

---

## Repository layout

Packages are layered; a package may only depend on the layers below it:

| Package                                          | Role                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `packages/tokens`                                | `tokens.css` (`@theme`), `Ark*` primitive types, JS mirrors of the motion tokens           |
| `packages/core`                                  | Types, i18n (`en`/`pt`/`es`), toast and announce services, motion helpers, overlay helpers |
| `packages/web-components`                        | The `ark-*` Custom Elements and the only stylesheet a consumer imports                     |
| `packages/react` · `vue` · `angular`             | Thin wrappers, one file per component                                                      |
| `packages/chart` · `wysiwyg` · `code` · `motion` | Side packages (ECharts, Tiptap, CodeMirror, Motion) with their own `registerTooark*()`     |
| `apps/storybook`                                 | Stories, docs and the whole test suite (Vitest + Playwright, real Chromium)                |

Shared, repo-wide files:

- [`CLAUDE.md`](CLAUDE.md) — architecture, CSS pipeline and component authoring rules
- [`biome.json`](biome.json) — lint, formatting and import order
- [`pnpm-workspace.yaml`](pnpm-workspace.yaml) — workspace and dependency policy (security floors)
- [`scripts/`](scripts/) — `check-css.mjs` (CSS smoke test), `sync-versions.mjs` (lockstep versioning)
- [`.github/workflows/`](.github/workflows/) — CI (lint, build, tests)

---

## Development workflow

**Prerequisites:** Node.js ≥ 22 and pnpm 11 (`corepack enable` picks the pinned
version from `packageManager`).

1. **Fork** the repository and clone your fork.
2. Create a feature branch: `git checkout -b feat/short-description`.
3. Install and start Storybook:

   ```bash
   pnpm install
   pnpm exec playwright install chromium   # once, for the test runner
   pnpm dev:storybook                      # http://localhost:6006, runs against package sources
   ```

4. Make your changes. Stories are the documentation **and** the tests: every
   story is a smoke test, `play` functions are the interaction tests.
5. **Verify locally** before pushing:

   ```bash
   pnpm check:fix                # Biome: lint + format + import order (apply safe fixes)
   pnpm -r build                 # TypeScript strict per package + the CSS smoke test
   pnpm --filter storybook test  # the whole suite, or one file:
   pnpm --filter storybook exec vitest run --project storybook stories/ark-switch.stories.ts
   ```

6. Update `README.md` **and** `README.pt-BR.md` if public behavior changed
   (components table, key attributes, E2E hooks).
7. Push and open a Pull Request against `main`.

> On Windows, see the "Windows notes" in `CLAUDE.md` (pnpm flags, the
> `EBUSY` on `dist/styles.css`, the Storybook "Run tests" widget).

---

## Adding or changing a component

The full checklist is in `CLAUDE.md` ("Adding a component: files that must
change together"). In short, a new `ark-x` touches:

1. `packages/web-components/src/components/ark-x.ts` + exports in
   `components/index.ts` and `src/index.ts`, and `customElements.define` in
   `register.ts`.
2. The `:where(...)` host list in `src/styles/base.css` (and structural rules
   in `components.css` when the host is the container).
3. `ArkXStyleOptions` (+ behavior types) in `packages/core/src/types/style.ts`,
   exported from `core/src/index.ts`.
4. Wrappers in react/vue/angular (+ their `index` exports and the React
   `jsx-intrinsics.d.ts`).
5. `apps/storybook/stories/ark-x.stories.ts` (title `Core/ArkX`), with a
   `TestHooks` story and `play` tests for keyboard and events.
6. README (`en` + `pt-BR`): components table, key attributes, E2E hooks table.

Rules that reviewers will check:

- Every utility class is `ark:`-prefixed and appears as a **complete literal**
  in the `.ts` file (lookup tables of full strings, never assembled fragments).
- Light DOM: never move or wrap the user's children; the host is the control
  or container.
- Overlays use the Popover API (no portals, no `z-index`); motion goes through
  the tokens (`arkEnter`/`arkExit` or the `.ark-animate-*` presets).
- Every internal node gets `applyTestHooks(...)`; the hook names go in the
  README table.
- New UI strings go into `core/src/i18n/{types,en,pt,es}.ts`, all three
  languages at once.
- Boolean setters use `coerceBooleanAttr` from core; `/** */` documents
  symbols, `//` explains the why; comments and JSDoc are written in Portuguese.

---

## Commit convention

We use [**Conventional Commits**](https://www.conventionalcommits.org/), with
the subject in **Portuguese without accents** (the project's working language),
and every commit **signed off** ([DCO](https://developercertificate.org/)):

```bash
git commit -s -m "feat(web-components): ark-drawer e token de easing sheet"
```

Format:

```text
<type>(<scope>): <short summary>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `build`, `ci`, `chore`. Use
the package (or `storybook`) as the scope:

```text
feat(web-components): ark-kv-editor
fix(web-components): aria-label observado nao reentra o updateAppearance
feat(core): observeColorScheme e tema auto reativo no chart e no wysiwyg
fix(storybook): relatorios do axe enxutos para o Run tests da UI nao estourar o heap
```

One component (or one concern) per commit; the body says what changed and why,
including the decisions that would otherwise be lost. No `Co-Authored-By` or
tool trailers besides the DCO `Signed-off-by`.

---

## Documentation standards

- The README is **bilingual**: `README.md` in English and `README.pt-BR.md` in
  Portuguese, with the language selector at the top. **Keep both in sync** — a
  change in one requires the same change in the other.
- Each component has three README entries: a row in the components table, a
  **key attributes** paragraph and a row in the **E2E test hooks** table.
- Each package has its own `README.md` (English, the npm page) and `README.pt-BR.md`,
  with the same sections in the same order (contents, overview, installation,
  configuration, components, usage examples, dependencies, contributing, license); a
  new attribute, event or export goes into both.
- Storybook `docs.description` on the component and on non-obvious stories is
  the living documentation; write it in Portuguese without accents, like the
  stories themselves.
- `CLAUDE.md` is the authoring guide: when a new rule or pattern is
  established, add it there.

---

## Versioning and releasing

- All `@tooark/*` packages share **one version** (lockstep). The root
  `package.json` is the source of truth; `pnpm version <patch|minor|major>`
  runs `scripts/sync-versions.mjs` and propagates it to `packages/*`.
- Releases are cut by the maintainers from `main`: `pnpm version <patch|minor|major>`
  (or `prerelease --preid next`), a `chore(release): vX.Y.Z` commit that also adds the
  `## [X.Y.Z]` section to `CHANGELOG.md`, merge. The `release.yml` workflow sees a version
  that is not on npm yet, runs lint, build, `pnpm check:publish` and the test suite, publishes
  every package (`latest`, or `next` for prereleases) with provenance, creates the `vX.Y.Z`
  tag and a GitHub Release with that changelog section. Contributors do not bump versions in PRs.
- `pnpm check:publish` packs every package and runs publint + attw on the tarballs; run it
  when you touch a `package.json`, an `exports` map or a Rollup config.
- Breaking changes must be called out in the PR ("Notes for reviewers") and in
  the commit body (`BREAKING CHANGE:` footer).

---

## Pull Request checklist

Before opening a PR, confirm:

- [ ] Commits follow Conventional Commits (Portuguese, no accents) and carry `Signed-off-by`
- [ ] `pnpm check` is clean
- [ ] `pnpm -r build` passes (includes the CSS smoke test)
- [ ] The Storybook suite passes; new behavior has a `play` test and a `TestHooks` story
- [ ] New component: all the files from the checklist above
- [ ] `README.md` and `README.pt-BR.md` are updated **and in sync**
- [ ] Linked to at least one issue (`Closes #123`) when applicable

---

## Community

- 🐛 [Issues](https://github.com/Tooark/web-components/issues)
- 🔒 [Security policy](SECURITY.md)
- 📜 [Code of Conduct](CODE_OF_CONDUCT.md)
- 🌐 [Tooark](https://tooark.com)

Thank you for making Tooark web-components better! 💙
