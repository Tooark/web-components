# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

pnpm monorepo for **Tooark Web Components**: framework-agnostic Custom Elements (`ark-*`) styled with Tailwind v4 on top of a design-token layer, plus React/Vue/Angular wrappers. Source comments and commit messages are written in Portuguese (Conventional Commits, no accents, e.g. `feat(web-components): ...`); the README is bilingual (`README.md` / `README.pt-BR.md`) and both must be kept in sync when public behavior changes.

Requirements: Node >= 22, pnpm 11 (pinned via `packageManager`). Lint, formatting and import ordering are enforced by Biome (`biome.json` at the root: 120-column lines, double quotes, no trailing commas, `organizeImports` on, `noNonNullAssertion` off). The formatter cannot keep a space before the function parenthesis, so `name(): void` is the style. Suppress a deliberate violation in place with `// biome-ignore lint/<group>/<rule>: reason` (CSS uses the `/* */` form). Type checking is `tsc --strict` inside each package build.

### Comment convention

`/** */` documents a **symbol** — anything named that shows in the editor tooltip and survives into the bundled `.d.ts`: exported types/functions/constants, component classes, class members (including private ones), and each property of an `Ark*Options` type. `//` is everything else: the "why" behind a line or block inside a function body, the file header, and labels that group several declarations (`// --- Interação ---` in long component files, the `// Exports types ...` groupings in `packages/core/src/types/style.ts`). A label covering more than one declaration stays `//`; as JSDoc it would attach to just the first.

No JSDoc tags — `@param`/`@returns`/`@example` appear nowhere in the repo and the TS signature already states the shapes. Prose only, in Portuguese, on one line (`/** ... */`) when it fits the 120-column limit. Option types state defaults inline per property (`/** Intervalo entre itens em ms. Padrão: 60. */`), as in `packages/motion/src/types.ts`. There is no typedoc/api-extractor, so the whole payoff is the tooltip and the `.d.ts` the consumer gets; Biome has no rule for this, so it is convention plus review.

## Commands

```bash
pnpm install                                   # workspace install
pnpm build                                     # pnpm -r build (topological: tokens -> core -> web-components -> wrappers...)
pnpm --filter @tooark/web-components build     # one package (rollup + Tailwind CLI CSS + check-css smoke test)
pnpm --filter @tooark/web-components dev:css   # rebuild dist/styles.css on change
pnpm dev:storybook                             # Storybook at http://localhost:6006 (no build needed; aliases point at package src)
pnpm clean                                     # remove dist/ and storybook-static/
pnpm check                                     # Biome lint + format + import order, read-only (CI runs `biome ci .`)
pnpm check:fix                                 # apply Biome safe fixes and formatting; run before committing
pnpm version patch                             # bumps root version and syncs every packages/*/package.json (scripts/sync-versions.mjs)
```

Tests are Storybook stories executed by the Storybook Vitest addon in real Chromium (Playwright). Every story is a smoke test; `play` functions are the interaction tests; axe checks run via addon-a11y (currently `test: "todo"`, so a11y violations warn but do not fail).

```bash
pnpm exec playwright install chromium                                  # once
pnpm --filter storybook test                                           # whole suite
pnpm --filter storybook exec vitest run --project storybook --coverage # what CI runs
pnpm --filter storybook exec vitest run --project storybook stories/ark-switch.stories.ts           # one file
pnpm --filter storybook exec vitest run --project storybook stories/ark-switch.stories.ts -t "Toggles On Click" # one story by its display name (export split into words; the export name itself matches nothing and silently skips)
```

CI (`.github/workflows/tests.yml`) runs `biome ci .`, then `pnpm -r build` (which includes the CSS smoke test), then the suite above.

### Windows notes

- pnpm 11 may abort `pnpm run`/`build` in `runDepsStatusCheck` or hang on an interactive purge prompt. Use `$env:CI = "true"` and `pnpm --config.verify-deps-before-run=false --filter <pkg> build`; for installs, `pnpm install --config.confirmModulesPurge=false`.
- The `@tooark/web-components` build intermittently fails with `EBUSY` on `dist/styles.css`; delete that file and rebuild.
- `patches/` (gitignored) holds optional pnpm patches that raise Storybook/addon-vitest test-runner timeouts for slow Windows machines. They are **not** wired into `pnpm-workspace.yaml`; the "Run tests" widget inside the Storybook UI may time out on Windows, the CLI is unaffected. Never commit `patchedDependencies` without committing the patch files.

## Architecture

### Layers (a package may only depend on layers below it)

```text
@tooark/react . @tooark/vue . @tooark/angular      framework wrappers (thin, one file per component)
@tooark/web-components                             the ark-* Custom Elements + the only CSS a consumer imports
@tooark/core                                       types, i18n (en/pt/es), toast service, dependency-free motion (CSS presets + WAAPI)
@tooark/tokens                                     tokens.css (@theme) + Ark* primitive types + JS mirrors of motion tokens
```

Side packages: `@tooark/chart` (`ark-chart`, ECharts as peer dep), `@tooark/wysiwyg` (`ark-wysiwyg-editor`/`-viewer`, Tiptap), `@tooark/motion` (opt-in helpers on the Motion lib). Each ships its own `registerTooark*()` and an imperative `engine/` usable without the element. **Animation libraries must never become dependencies of `@tooark/core` or `@tooark/web-components`**; anything that needs the Motion lib goes in `@tooark/motion`.

Rollup builds ESM + CJS + a bundled `.d.ts` for tokens/core/web-components/chart/wysiwyg/motion, externalizing the layer below (`@tooark/core`, `@tooark/tokens`, `echarts`, `motion`). React/Vue build with plain `tsc`; Angular builds with `ng-packagr` in partial Ivy (`packages/angular/ng-package.json`, published from `dist/`).

### CSS pipeline (read before touching any class string)

- `packages/web-components/src/styles/index.css` is the single CSS entry, compiled by the **Tailwind CLI** (not Rollup, not PostCSS) into `dist/styles.css`. It imports Tailwind's theme with `prefix(ark)`, utilities with `source(none)`, then `@tooark/tokens/tokens.css`, core's `motion.css`, `base.css` and `components.css`, and scans only `@source "../components/**/*.ts"`.
- Consequences: every utility in component code **must be written with the `ark:` prefix** (`ark:inline-flex`, `ark:hover:bg-primary-hover`, `ark:focus-visible:ring-primary-ring`); unprefixed classes are never generated. Class names must appear as complete literals in the `.ts` files (palette/size lookup tables of full strings, as in `ark-switch.ts`), never assembled from fragments.
- After compiling, `scripts/check-css.mjs` fails the build if the output still contains `@import "tailwindcss"`/`@source`/`@theme`, is too small, or lacks expected tokens/classes. When you add a class that other components rely on, consider adding it to the `--expect-class` list in the package's `build:css` script.
- No global reset ships. `base.css` applies a scoped preflight to the `:where(ark-button, ark-calendar, ...)` host list and drives theming via `color-scheme` (`theme="light|dark"` attribute). The list appears once, at the top of `@layer base`, with every rule nested inside it (flattened by Tailwind at build time). **Adding a component means adding its tag to that single list**, kept in sync with `register.ts`.
- `components.css` holds structural rules that must reach user-owned children (e.g. `ark-input > [slot="suffix"]`, `ark-carousel` slides), because components never add classes to nodes they do not own.
- Storybook compiles the same entry through `@tailwindcss/vite`; `preview.css` is a normal unprefixed Tailwind for story layout, deliberately proving the lib coexists with a consumer's Tailwind.

### Tokens and theming

`packages/tokens/tokens.css` defines a `@theme static` block of semantic colors (`primary|secondary|success|warning|danger|info|neutral` x `-fg/-hover/-soft/-soft-fg/-border/-ring`, plus `surface*`, `fg*`, `border*`, `muted`, `ring`), sizes (`--size-xs..xl` = 1.5/1.75/2.25/2.75/3.25 rem, the min-height of form controls), Tailwind's radii (`rounded` = `none|xs|sm|md|lg|xl|full`; never redefine `--ark-radius-*` outside `@theme`, it overrides the prefixed Tailwind scale) and motion tokens (`--ark-duration-*` on the eight-step scale `none|instant|quick|default|moderate|gentle|slow|long` = 0/75/150/250/350/500/700/1000 ms, `--ark-ease-linear|standard|in|out|in-out|overshoot`, `--ark-motion-distance`, zeroed under `prefers-reduced-motion`). Every color is `light-dark(...)`, so theme switching is pure CSS. Inside the component build these become `--ark-color-*` variables and `ark:bg-primary`-style utilities. `src/motion.ts` mirrors the motion tokens as JS constants used as WAAPI fallbacks; `src/theme.ts` exports `resolveColorScheme(element)`, which `ark-chart`/`ark-wysiwyg` use to resolve `theme="auto"` from the host's computed `color-scheme` (system preference only when the page leaves it at `light dark`). Custom properties outside `@theme` use the `--ark-` prefix. Continuous loaders are exempt from reduced motion by design: `.ark-animate-spin` (the button spinner) runs on a fixed `1s`, never a duration token, while attention loops stop; `.ark-skeleton` is static and `.ark-skeleton-animated` opts into the pulse.

### Component authoring pattern (`packages/web-components/src/components`)

- Plain `HTMLElement` subclasses, `static readonly tagName`, `static get observedAttributes()`. Attributes are the source of truth; property getters/setters reflect to attributes. `connectedCallback` builds internal DOM once (`render()`), and every change goes through a single `updateAppearance()` that rewrites `className` strings from intent/size lookup tables.
- **Light DOM, never move or wrap user children.** Where the host is itself the control/container (`ark-button`, `ark-toggle`, `ark-toggle-group`, `ark-input`, `ark-carousel`), component classes are applied to the host through `ownClasses` + `applyOwnClasses()` and re-applied when `class` changes, so frameworks that rewrite `class` do not wipe them. `ark-button` uses `formAssociated`/`ElementInternals` for form participation.
- **Overlays use the Popover API on the host itself** (dialog, menu, tooltip, drawer in overlay mode): `popover="manual|auto"` gives the top layer, `::backdrop`, and native light dismiss + Esc for `auto`, with no portal and no `z-index`. Reset the UA `[popover]` styles (`inset`, `margin`, `border`, `padding`, `overflow`, `color`, `background`) in the host's own classes, give `::backdrop` colors a fallback in `var()`, run the exit animation before `hidePopover()`, and position anchored overlays by JS from `getBoundingClientRect()` (CSS anchor positioning is not a dependency). Popover does not `inert` the rest of the page: a modal dialog gets `aria-modal="true"` plus a manual focus trap, and the README states that limit.
- Call `applyTestHooks(host, "<component>", el, "<part>")` on every internal element; it sets `data-ark="<component>[-part]"` and forwards the host's `testid` as `data-testid`. The README's hooks table documents the parts and must be updated with new ones.
- Events: `CustomEvent` with `bubbles: true, composed: true`; form-like controls emit `change`, others emit `ark-*` (`ark-change`, `ark-slide-change`, `ark-event-click`...). Groups stop the child's event and emit their own consolidated one.
- Colors: use `intentColors()`/`normalizeIntent()` for token-driven inline colors; `ArkIntent`/`ArkSize`/`ArkTheme` types come from `@tooark/core`.
- Sizes: `size` lookup tables cover `xs..xl`. The control height comes from the token via `ark:min-h-(--ark-size-<size>)` (plus `ark:min-w-(...)` when it must be square) and the vertical padding stays below it, so the token governs and same-size controls align (`alignment.stories.ts` asserts 24/28/36/44/52 px across button, toggle and input). `ark-switch` keeps its own proportional table.
- Dates: all `YYYY-MM-DD[THH:mm[:ss]]` strings are parsed in the **local** timezone via `date-utils.ts`; never `new Date("YYYY-MM-DD")`.
- i18n: `resolveLocale(lang, localeJson)` from core; `lang="en|pt|es|custom"` with `locale-json` for custom strings. New UI strings go into `core/src/i18n/{types,en,pt,es}.ts`.
- `registerTooarkComponents()` in `register.ts` defines each element guarded by `customElements.get`; order matters where a component composes another (scheduler after toggle/toggle-group).
- Toasts: `toast()` in core dispatches `ark-toast`/`ark-toast-dismiss` on `window`; `ark-toaster` listens and renders. No direct coupling between the service and the element.

### Framework wrappers

Each of `packages/{react,vue,angular}/src` has one file per component plus `register.ts` exposing an idempotent `ensureTooarkComponentsRegistered()` (Angular's also no-ops without `customElements`, for SSR). Wrapper prop types extend the `Ark*StyleOptions` types in `core/src/types/style.ts`; camelCase props map to kebab-case attributes, booleans map to `""`/`undefined`, object props are JSON-serialized.

- React: `createElement("ark-x", { class: className, ... })`, custom events attached via ref + `addEventListener`; `jsx-intrinsics.d.ts` declares the `IntrinsicElements` typings.
- Vue: `defineComponent` + `h()`, `inheritAttrs: false`, native event names re-emitted.
- Angular: standalone component with selector `ark-x-wrapper`, `CUSTOM_ELEMENTS_SCHEMA`, `[attr.*]` bindings, `@Output()` re-emitting the `CustomEvent`, registration in the constructor.

### Adding a component: files that must change together

1. `packages/web-components/src/components/ark-x.ts` + export in `components/index.ts` and `src/index.ts`, define in `register.ts`.
2. Add `ark-x` to every `:where(...)` host list in `src/styles/base.css` (and structural rules in `components.css` if the host is the container).
3. `ArkXStyleOptions` (+ any behavior types) in `packages/core/src/types/style.ts`, exported from `core/src/index.ts`.
4. Wrappers in react/vue/angular (+ their `index` exports and React `jsx-intrinsics.d.ts`).
5. Story in `apps/storybook/stories/ark-x.stories.ts` (title `Core/ArkX`; stories build DOM with `document.createElement`, interaction tests use `within`/`userEvent`/`expect` from `storybook/test`, including a `TestHooks` story asserting `data-ark`/`data-testid`).
6. README (`en` + `pt-BR`): components table, key attributes, E2E hooks table.

### Storybook specifics

`apps/storybook/.storybook/main.ts` aliases every `@tooark/*` import to the package `src/index.ts`, so Storybook and tests always run against source. `preview.ts` imports the lib CSS from source and registers web-components, chart and wysiwyg. `vitest.config.ts` sets a 30 s test timeout and `coverage.allowExternal` so coverage covers `packages/*`.

### Dependency policy

`pnpm-workspace.yaml` pins security floors via `overrides` (Angular >= 21.2.19, postcss, nanoid) and disables build scripts for `esbuild`/`@parcel/watcher`. The Angular peer range in `packages/angular/package.json` must stay aligned with that floor.
