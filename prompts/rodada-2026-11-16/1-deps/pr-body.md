## Dependencias: grupos runtime e dev do Dependabot

Junta os dois PRs do Dependabot de 2026-11-09 (#34 runtime, #35 dev), que conflitam entre si no `pnpm-lock.yaml` e reprovavam no CI, com as correcoes que cada um pedia. Os dois commits do Dependabot entram com o autor e a mensagem originais; o lockfile do segundo e a uniao dos dois bumps (as 8 regioes em conflito so diferiam no sufixo de peers, e `pnpm install --frozen-lockfile` aceita o resultado). Sem release: a versao continua 1.6.1.

Substitui #34 e #35.

### Bumps

- Runtime (#34): `motion` ^14.10.0, `@tiptap/*` ^3.33.0, `tslib` 2.9.1.
- Dev (#35): Biome 2.6.5, Storybook addons 10.6.6, Playwright 1.65.0, Rollup 4.67.5, Tailwind 4.3.4, Angular 21.2.26, Vite 8.3.6, Vue 3.5.45, React 19.3.1 e outros (23 no total).
- `storybook` 10.6.0 -> 10.6.6: o Dependabot nunca sobe o core (o app em `apps/storybook` tem o mesmo nome) e os addons 10.6.6 pedem `^10.6.6` no peer.

### Correcoes

- **wysiwyg (story Formatting):** o bump do `@tiptap/pm` deixou duas copias de `prosemirror-model`, `-transform` e `-view` no lockfile ("looks like multiple versions of prosemirror-model were loaded"). `pnpm dedupe` unifica; de passagem some a duplicata de postcss, nanoid, source-map-js, `@babel/*` e `@types/estree`.
- **motion (Flip Reorder, Swipe, Targets And Options):** desde a 14.2 a lib anima `x`/`y`/`scale` pela WAAPI, no compositor, e o `style.transform` inline fica em `none` durante a animacao. As stories passam a ler o transform computado; os helpers do `@tooark/motion` nao mudam.
- **Biome 2.6:** formata Markdown (14 READMEs: virgula final nos exemplos e preenchimento da tabela de componentes, sem mudanca de texto), regra `useMathMinMax` em dois tab stops e schema do `biome.json` na 2.6.5.
- `CLAUDE.md`: Markdown no Biome, transform da Motion pela WAAPI nas armadilhas de `play` e, na politica de dependencias, o `storybook` a mao e o `pnpm dedupe` depois de um lockfile do Dependabot.

### Fica para o proximo release

O CHANGELOG nao muda aqui, como nos bumps anteriores. No release: entrada em Changed para `motion` ^14.10.0 e `@tiptap/*` ^3.33.0 e as tabelas de dependencias dos READMEs de `@tooark/motion` e `@tooark/wysiwyg` (hoje em ^14.1.0 e ^3.31.4).

### Verificacao local

`biome ci .` limpo; build dos 10 pacotes e do Storybook estatico, `pnpm check:publish` e `pnpm check:ssr` OK; suite completa 448/448 com coverage. As stories do wysiwyg reproduzem a falha do CI sem o dedupe e passam com ele.
