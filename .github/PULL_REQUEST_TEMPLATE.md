# Summary

<!--
Explain what this PR does and why. Reference the issue(s) it closes.
Example: "Closes #42 — ark-select ganha `aria-label` espelhado no <select>."
-->

## Affected package(s) / area(s)

- [ ] `@tooark/tokens`
- [ ] `@tooark/core`
- [ ] `@tooark/web-components`
- [ ] `@tooark/react` / `@tooark/vue` / `@tooark/angular`
- [ ] `@tooark/chart` / `@tooark/wysiwyg` / `@tooark/code` / `@tooark/motion`
- [ ] Storybook (stories, config)
- [ ] CI/CD (`.github/`), tooling (`scripts/`, `biome.json`)
- [ ] Docs (`README.md` / `README.pt-BR.md`, `CLAUDE.md`)

## Type of change

- [ ] `feat` — new component or capability
- [ ] `fix` — bug fix
- [ ] `docs` — documentation only
- [ ] `refactor` — no functional change
- [ ] `build` / `ci` — build pipeline, workflow or tooling change
- [ ] `chore` — dependency bumps, maintenance
- [ ] Breaking change (describe it in "Notes for reviewers")

## Checklist

- [ ] Commits follow [Conventional Commits](https://www.conventionalcommits.org/) in Portuguese without accents and are signed off (`git commit -s`, DCO)
- [ ] `pnpm check` is clean (Biome lint, format, import order)
- [ ] `pnpm -r build` passes (TypeScript strict + the CSS smoke test)
- [ ] The Storybook suite passes (`pnpm --filter storybook test`); new behavior has a `play` test
- [ ] New component: element + `register.ts`, `base.css` host list, `Ark*StyleOptions` in core, the three wrappers, story with `TestHooks`, README rows (table, key attributes, hooks) — see `CLAUDE.md`
- [ ] Every utility class is `ark:`-prefixed and written as a complete literal; no `z-index`, no moving user children
- [ ] `README.md` and `README.pt-BR.md` updated **and in sync** (if public behavior changed)

## Notes for reviewers

<!-- Anything specific to focus on, alternatives considered, follow-up work, etc. -->
