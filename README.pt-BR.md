# Tooark Web Components

[![Tests](https://github.com/Tooark/web-components/actions/workflows/tests.yml/badge.svg)](https://github.com/Tooark/web-components/actions/workflows/tests.yml)
[![Licença](https://img.shields.io/github/license/Tooark/web-components?color=blue&label=licen%C3%A7a)](LICENSE)
[![Versão](https://img.shields.io/github/package-json/v/Tooark/web-components?label=vers%C3%A3o&color=informational)](package.json)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-339933?logo=node.js&logoColor=white)](package.json)
[![pnpm](https://img.shields.io/github/package-json/packageManager/Tooark/web-components?label=&logo=pnpm&logoColor=white&color=F69220)](package.json)
[![TypeScript](https://img.shields.io/github/package-json/dependency-version/Tooark/web-components/dev/typescript?label=TypeScript&logo=typescript&logoColor=white&color=3178C6)](tsconfig.base.json)
[![Tailwind CSS](https://img.shields.io/github/package-json/dependency-version/Tooark/web-components/dev/@tailwindcss/cli?label=Tailwind%20CSS&logo=tailwindcss&logoColor=white&color=06B6D4)](packages/tokens/tokens.css)
[![Storybook](https://img.shields.io/github/package-json/dependency-version/Tooark/web-components/dev/storybook?label=Storybook&logo=storybook&logoColor=white&color=FF4785)](https://tooark.com/web-components/)
[![npm](https://img.shields.io/npm/v/@tooark/web-components?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/web-components)

Biblioteca de componentes agnóstica de framework construída sobre **Web Components** nativos (Custom Elements), com wrappers dedicados para **React**, **Vue** e **Angular**. Os componentes seguem a convenção da família **Ark** (elementos `ark-*`, tipos `Ark*`, tokens CSS `--ark-*`) e são estilizados com **Tailwind CSS v4** sobre uma camada compartilhada de design tokens.

📖 **Docs:** [Storybook (exemplos vivos)](https://tooark.com/web-components/) · [pacotes no npm](https://www.npmjs.com/search?q=%40tooark) · [Changelog](CHANGELOG.md)

🌍 **Idiomas:** [![USA Flag](https://flagcdn.com/w20/us.png) English](https://github.com/Tooark/web-components/blob/main/README.md) · ![Brazil Flag](https://flagcdn.com/w20/br.png) **Português (este arquivo)**

---

## 🧱 Arquitetura

O monorepo é organizado em camadas — cada pacote depende apenas das camadas abaixo dele:

```text
┌─────────────────────────────────────────────────────────┐
│                  Wrappers de framework                  │
│   @tooark/react   ·   @tooark/vue   ·   @tooark/angular │
├─────────────────────────────────────────┬───────────────┤
│         @tooark/web-components          │@tooark/motion │
│         Custom Elements nativos         │    opt-in     │
│           (componentes ark-*)           │ (lib Motion)  │
├──────────────┬──────────────────────────┼───────────────┤
│ @tooark/chart│      @tooark/core        │@tooark/wysiwyg│
│  (ECharts)   │ tipos · i18n · serviços  │   (Tiptap)    │
│ @tooark/code │  presets de motion/WAAPI │               │
│ (CodeMirror) │                          │               │
├──────────────┴──────────────────────────┴───────────────┤
│                     @tooark/tokens                      │
│  tokens @theme (--color-*, --size-*) · motion --ark-*   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Pacotes

Todos os pacotes compartilham uma versão e são publicados juntos no npm, no [escopo `@tooark`](https://www.npmjs.com/search?q=%40tooark).

| Pacote                   | Versão                                                                                                                  | Downloads                                                                                                                  | Instalação individual                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `@tooark/tokens`         | [![npm](https://img.shields.io/npm/v/@tooark/tokens.svg)](https://www.npmjs.com/package/@tooark/tokens)                 | [![npm](https://img.shields.io/npm/d18m/@tooark/tokens.svg)](https://www.npmjs.com/package/@tooark/tokens)                 | `pnpm add @tooark/tokens`                                                              |
| `@tooark/core`           | [![npm](https://img.shields.io/npm/v/@tooark/core.svg)](https://www.npmjs.com/package/@tooark/core)                     | [![npm](https://img.shields.io/npm/d18m/@tooark/core.svg)](https://www.npmjs.com/package/@tooark/core)                     | `pnpm add @tooark/core`                                                                |
| `@tooark/web-components` | [![npm](https://img.shields.io/npm/v/@tooark/web-components.svg)](https://www.npmjs.com/package/@tooark/web-components) | [![npm](https://img.shields.io/npm/d18m/@tooark/web-components.svg)](https://www.npmjs.com/package/@tooark/web-components) | `pnpm add @tooark/web-components`                                                      |
| `@tooark/react`          | [![npm](https://img.shields.io/npm/v/@tooark/react.svg)](https://www.npmjs.com/package/@tooark/react)                   | [![npm](https://img.shields.io/npm/d18m/@tooark/react.svg)](https://www.npmjs.com/package/@tooark/react)                   | `pnpm add @tooark/react`                                                               |
| `@tooark/vue`            | [![npm](https://img.shields.io/npm/v/@tooark/vue.svg)](https://www.npmjs.com/package/@tooark/vue)                       | [![npm](https://img.shields.io/npm/d18m/@tooark/vue.svg)](https://www.npmjs.com/package/@tooark/vue)                       | `pnpm add @tooark/vue`                                                                 |
| `@tooark/angular`        | [![npm](https://img.shields.io/npm/v/@tooark/angular.svg)](https://www.npmjs.com/package/@tooark/angular)               | [![npm](https://img.shields.io/npm/d18m/@tooark/angular.svg)](https://www.npmjs.com/package/@tooark/angular)               | `pnpm add @tooark/angular`                                                             |
| `@tooark/chart`          | [![npm](https://img.shields.io/npm/v/@tooark/chart.svg)](https://www.npmjs.com/package/@tooark/chart)                   | [![npm](https://img.shields.io/npm/d18m/@tooark/chart.svg)](https://www.npmjs.com/package/@tooark/chart)                   | `pnpm add @tooark/chart`                                                               |
| `@tooark/wysiwyg`        | [![npm](https://img.shields.io/npm/v/@tooark/wysiwyg.svg)](https://www.npmjs.com/package/@tooark/wysiwyg)               | [![npm](https://img.shields.io/npm/d18m/@tooark/wysiwyg.svg)](https://www.npmjs.com/package/@tooark/wysiwyg)               | `pnpm add @tooark/wysiwyg` (wrappers: a subpath `/wysiwyg` de cada pacote de wrappers) |
| `@tooark/code`           | [![npm](https://img.shields.io/npm/v/@tooark/code.svg)](https://www.npmjs.com/package/@tooark/code)                     | [![npm](https://img.shields.io/npm/d18m/@tooark/code.svg)](https://www.npmjs.com/package/@tooark/code)                     | `pnpm add @tooark/code`                                                                |
| `@tooark/motion`         | [![npm](https://img.shields.io/npm/v/@tooark/motion.svg)](https://www.npmjs.com/package/@tooark/motion)                 | [![npm](https://img.shields.io/npm/d18m/@tooark/motion.svg)](https://www.npmjs.com/package/@tooark/motion)                 | `pnpm add @tooark/motion`                                                              |

Os wrappers pedem o `@tooark/web-components` junto, e chart, wysiwyg e code pedem as peer dependencies: veja [Instalação](#instalação). O que cada pacote oferece:

| Pacote                   | Descrição                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tooark/tokens`         | Primitivas de design: `tokens.css`, um bloco `@theme` do Tailwind v4 com as cores semânticas (intents) e a escala de tamanhos (`--color-*`, `--size-*`, compiladas como `--ark-color-*`/`--ark-size-*` na folha de estilo dos componentes), mais os motion tokens como custom properties puras (`--ark-duration-*`, `--ark-ease-*`); os tipos primitivos `Ark*` (`ArkRounded` tipa a própria escala de raios do Tailwind) e os helpers de color-scheme. |
| `@tooark/core`           | Fundação compartilhada: tipos TypeScript (`ArkIntent`, `ArkSize`, …), locales de i18n (`en`, `pt`, `es`), os serviços de toast e announce, a camada de motion sem dependências (presets CSS + helpers WAAPI `arkEnter`/`arkExit`) e os helpers de overlay (`trapFocus`, `openPopover`/`closePopover`).                                                                                                                                                  |
| `@tooark/web-components` | Os 52 Custom Elements nativos (`ark-alert` … `ark-tree-item`, listados em [Componentes](#-componentes)).                                                                                                                                                                                                                                                                                                                                                |
| `@tooark/react`          | Wrappers React com props tipadas.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@tooark/vue`            | Wrappers Vue 3.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `@tooark/angular`        | Componentes wrapper para Angular.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@tooark/chart`          | `ark-chart` — gráficos baseados em [ECharts](https://echarts.apache.org/) (peer dependency).                                                                                                                                                                                                                                                                                                                                                            |
| `@tooark/wysiwyg`        | `ark-wysiwyg-editor` / `ark-wysiwyg-viewer` — editor de texto rico e viewer baseados em [Tiptap](https://tiptap.dev/).                                                                                                                                                                                                                                                                                                                                  |
| `@tooark/code`           | `ark-code-editor` — editor de código baseado em [CodeMirror 6](https://codemirror.net/) (peer dependencies): JSON, JavaScript e YAML, completions de variáveis.                                                                                                                                                                                                                                                                                         |
| `@tooark/motion`         | Helpers avançados de animação, **opt-in**, sobre a lib [Motion](https://motion.dev/): entrada escalonada de listas, scroll reveal, reordenação FLIP e gestos de swipe com física de spring.                                                                                                                                                                                                                                                             |

---

## 🧩 Componentes

| Elemento              | Pacote         | Destaques                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-alert`           | web-components | Alerta/banner: o host é a caixa na cor suave do intent, os filhos são a mensagem (texto livre ou elementos), `slot="icon"` à esquerda, `slot="action"` à direita, `heading`, `dismissible` com saída animada, live region por `live` (`status`/`alert`).                                                                                                                                     |
| `ark-avatar`          | web-components | Avatar (`role="img"` nomeado por `name`): iniciais de `name`, imagem `src` que cai para as iniciais em erro de carga, `size`, `shape` circle/square, `color` própria, `variant` soft/solid.                                                                                                                                                                                                  |
| `ark-badge`           | web-components | Rótulo curto de status/categoria: intents, `soft`/`solid`/`outline`, `xs`–`md`, `rounded`, `color` própria via `color-mix`. O host é o badge; ícone e texto ficam como filhos.                                                                                                                                                                                                               |
| `ark-button`          | web-components | Intents, tamanhos, variantes (solid/outline/ghost/soft), `rounded` (até `full`), estados `loading`/`icon-only`/`full-width`, feedback `status` (glifo de sucesso/erro + anúncio) e modo link (`href`).                                                                                                                                                                                       |
| `ark-button-group`    | web-components | Grupo de `ark-button` (`role="group"`): colados por padrão (um contorno só, com divisa entre os botões) ou `spaced`; `orientation`, `full-width`; `variant`/`intent`/`size`/`rounded`/`theme`/`disabled` valem para todos os botões. O botão dividido é este grupo mais um `ark-menu`.                                                                                                       |
| `ark-calendar`        | web-components | Grid de mês inline (no estilo do DateCalendar do MUI): localizado, teclado WAI-ARIA, motion, views de mês/ano no título e eventos com cor (`dots`/`count`/`list`).                                                                                                                                                                                                                           |
| `ark-card`            | web-components | Cartão: o host é a caixa (`surface`, `border`, `rounded`) e uma grid: `heading` (h2) ou `slot="header"` com `slot="actions"` na linha de cima, filhos sem slot como corpo, `slot="footer"` por último com divisor; `padding` none–lg.                                                                                                                                                        |
| `ark-carousel`        | web-components | CSS scroll snap nativo (touch/trackpad rolam nativamente, arrasto com mouse emulado), autoplay, loop, dots e setas. Os slides continuam sendo seus filhos diretos.                                                                                                                                                                                                                           |
| `ark-checkbox`        | web-components | Checkbox desenhado pelo componente (botão `role="checkbox"` + input nativo oculto para formulário e `<fieldset disabled>`): `checked`, `indeterminate`, `label`/`aria-label`/filhos livres como rótulo, dica `helper` abaixo dele, tamanhos, intents. Emite `change`.                                                                                                                        |
| `ark-clock`           | web-components | Seleção de hora em colunas digitais (hora/minuto/segundo), 24h/12h, step de minutos, localizado.                                                                                                                                                                                                                                                                                             |
| `ark-color-swatches`  | web-components | Paleta de cores como `radiogroup`: amostras de `colors` (`{ name, value }[]`, atributo JSON ou propriedade JS), `value`, setas navegam, `disabled`, `size`. Emite `change` com o valor.                                                                                                                                                                                                      |
| `ark-command-item`    | web-components | Item da paleta de comandos (o host é o `role="option"`): filhos livres, `slot="trailing"` para o atalho, `value`, `group`, `label` (texto do filtro), `disabled`. Emite `ark-select`.                                                                                                                                                                                                        |
| `ark-command-palette` | web-components | Paleta de comandos sobre a Popover API: campo de busca (um `ark-input` próprio), filhos `ark-command-item` agrupados e filtrados (`filter`) ou buscados pelo app (`ark-query`), setas + Enter, `hotkey` (`/`, `mod+k`), `hint` e `busy` para a mensagem de vazio. Emite `ark-select`, `ark-query`, `ark-open`, `ark-close`.                                                                  |
| `ark-copy-button`     | web-components | Botão de copiar: estende o `ark-button` (mesmas variantes, tamanhos, `icon-only`, formulário, hooks); copia `value` ou o elemento de `for`, troca o ícone por um check e o texto/`title` por "copiado" durante `feedback-ms`, anuncia. Emite `ark-copy`.                                                                                                                                     |
| `ark-data-view`       | web-components | Registros em tabela ou cards a partir de `rows` + `columns` (propriedades JS): `view` auto pela largura do próprio componente, busca, cabeçalhos ordenáveis, paginação, modo `client`/`server`, `render` próprio por célula, `selectable`/`reorderable`/`clickable` opcionais. Emite `ark-query-change`, `ark-row-click`, `ark-selection-change`, `ark-reorder`.                             |
| `ark-datepicker`      | web-components | Seletor de data/hora que compõe `ark-input` + `ark-calendar` + `ark-clock`: `mode` datetime (padrão)/date/time, inline ou modo `input` com campo + popup, formatação localizada, parse do que se digita, formulário.                                                                                                                                                                         |
| `ark-dialog`          | web-components | Diálogo modal sobre a Popover API (top layer, scrim por `::backdrop`, sem portal): o host é o painel, seus filhos são o corpo, `slot="footer"` é o rodapé; cabeçalho de `label`, focus trap, Esc/scrim, `sm`–`xl` ou `full`.                                                                                                                                                                 |
| `ark-drawer`          | web-components | Gaveta ancorada numa borda: `overlay` (Popover API, scrim, focus trap, Esc) ou `inline` (no fluxo da página, ex.: console inferior); `side`, `size` preset ou comprimento CSS, cabeçalho de `label` com a linha `slot="actions"`, `slot="footer"`, slide com o easing `sheet`. Emite `ark-open`/`ark-close`.                                                                                 |
| `ark-empty`           | web-components | Estado vazio: caixa tracejada com `slot="icon"` apagado, `heading` (h3), `description` e um botão opcional em `slot="action"`; os filhos ficam no lugar, ordenados por CSS.                                                                                                                                                                                                                  |
| `ark-file-input`      | web-components | Campo de arquivo com a grid do `ark-input` (label, helper/erro): `<input type="file">` nativo oculto para o formulário, zona de soltar com realce em `dragover`, botão de escolher acessível por teclado, lista dos nomes escolhidos, `accept`/`multiple`, `directory` para uma pasta inteira. Emite `change` com os arquivos e os anuncia.                                                  |
| `ark-input`           | web-components | Campo de texto padronizado: label, helper/erro com aria, prefixo/sufixo via `slot`, `reveal` de senha, atributos nativos repassados, tamanhos, intents, `rounded`.                                                                                                                                                                                                                           |
| `ark-kbd`             | web-components | Tecla de atalho: o host é a tecla (mono, borda, `surface-muted`, aresta inferior) em volta do seu texto; `size`.                                                                                                                                                                                                                                                                             |
| `ark-kv-editor`       | web-components | Editor chave/valor: linhas `{ id, key, value, enabled }` (propriedade JS) com ativar, editar, remover, adicionar, colunas opcionais `types`/`secret`/`description`, modo em massa em linhas `chave:valor` ou JSON, `valueField` opcional para uma célula de valor sua (autocomplete de variáveis, por exemplo). Compõe outros controles ark-\*. Emite `change`, `ark-add`, `ark-delete`.     |
| `ark-mark`            | web-components | Marca de escopo: uma de dez formas (`circle`, `square`, `triangle`, `diamond`, `star`, `hexagon`, `cross`, `pentagon`, `moon`, `asterisk`) numa `color`, cor e forma juntas para a identidade nunca depender só da cor; `size`, `label`.                                                                                                                                                     |
| `ark-menu`            | web-components | Menu suspenso/de contexto sobre a Popover API (`role="menu"`, `popover="auto"`): ancorado ao gatilho por `for`, `align`/`direction` com flip, teclado, `openAt(x, y)`; itens ficam como filhos. Emite `ark-select`.                                                                                                                                                                          |
| `ark-menu-group`      | web-components | Grupo rotulado de itens de menu (`role="group"`, nomeado pelo próprio rótulo); as setas do menu atravessam os grupos.                                                                                                                                                                                                                                                                        |
| `ark-menu-item`       | web-components | Item de menu (o host é o item): filhos livres, `slot="trailing"`, `disabled`, `intent`, `checked` (item checkbox), `divider`, `static` (conteúdo não interativo).                                                                                                                                                                                                                            |
| `ark-nav`             | web-components | Navegação do app (`role="navigation"`): `sidebar` (recolhe para um trilho de ícones ou, com `collapsible="hidden"`, para só o logo), `navbar` ou `tabbar` (abas de rodapé do celular); `slot="header"`/`slot="footer"` ordenados por CSS, `value` marca o item atual, `size`/`intent` propagados. Emite `ark-collapse`.                                                                      |
| `ark-nav-group`       | web-components | Seção da navegação (`role="group"` nomeado por `label`): título simples ou botão `expandable` (`open`, `aria-expanded`) que mostra e esconde os itens; faixa separada no trilho, itens soltos nas barras. Emite `ark-toggle`.                                                                                                                                                                |
| `ark-nav-item`        | web-components | Item de navegação (o host é a linha): `href` → um `<a>` real esticado (Ctrl+clique, nova aba), `label`, `slot="icon"`, `slot="trailing"`, `current` (`aria-current`), `disabled`, `divider`; sem `href` um `role="button"`. Emite `ark-navigate` cancelável.                                                                                                                                 |
| `ark-pagination`      | web-components | Paginação (`role="navigation"`): resumo do intervalo, seletor opcional de itens por página (`page-sizes`), faixa de páginas com reticências, anterior/próxima; `page`/`page-size`/`total` reescritos no clique, localizada, anunciada. Emite `ark-page-change`.                                                                                                                              |
| `ark-progress`        | web-components | Barra de progresso (`role="progressbar"` no host): `value`/`max` com transição de largura pelos tokens, `show-value`, `indeterminate` em loop isento de movimento reduzido, `label`, tamanhos, intents.                                                                                                                                                                                      |
| `ark-radio`           | web-components | Radio desenhado pelo componente (botão `role="radio"` + input nativo oculto): agrupa por `name` no mesmo form, um tab stop por grupo, setas movem e marcam, `label`/filhos como rótulo, dica `helper`. Emite `change` na que marcou.                                                                                                                                                         |
| `ark-radio-group`     | web-components | Grupo de `ark-radio` (`role="radiogroup"`): `value` sincronizado com o rádio marcado, legenda própria (`label`), `helper`/`error-message`, `orientation`, `required`; `name`/`size`/`intent`/`theme`/`disabled` valem para todos os rádios. Emite um `change` só.                                                                                                                            |
| `ark-scheduler`       | web-components | Agenda com views `week`/`day` (timeline por horário e sobreposição em colunas), `month` e `agenda`; eventos coloridos e clicáveis.                                                                                                                                                                                                                                                           |
| `ark-select`          | web-components | `<select>` nativo estilizado como o `ark-input`: label, helper/erro com aria, `placeholder`, opções por dados (atributo `options` em JSON ou propriedade JS, `group` → `<optgroup>`), tamanhos, intents, `rounded`.                                                                                                                                                                          |
| `ark-shape-picker`    | web-components | Seletor de forma como `radiogroup`: as dez formas do `ark-mark`, ou as que `shapes` listar, desenhadas em `color`, `value`, setas navegam, nomes das formas localizados, `disabled`, `size`. Emite `change` com a forma.                                                                                                                                                                     |
| `ark-skeleton`        | web-components | Placeholder de carregamento: o host é o bloco (`.ark-skeleton`, `aria-hidden`), dimensionado pela sua class/style; `rows` renderiza barras, `animated` liga o brilho que varre, `rounded`.                                                                                                                                                                                                   |
| `ark-spinner`         | web-components | Indicador de carregamento solto (`role="status"`): o SVG do spinner do botão em `.ark-animate-spin` (continua girando sob movimento reduzido), rótulo para leitor de tela por `lang` ou `label`, `size`, `intent` opcional (senão herda a cor do texto).                                                                                                                                     |
| `ark-split-pane`      | web-components | Painéis redimensionáveis: os seus filhos são os painéis, as alças são nós próprios do componente ao fim do host; `direction`, `sizes` (percentuais, reescritos a cada mudança), `data-min`/`data-max` por painel, teclado e arrasto com pointer capture. Emite `ark-resize`.                                                                                                                 |
| `ark-status-dot`      | web-components | Ponto de status: o host é o círculo na cor do intent (padrão `neutral`); `label` o torna um `role="img"` nomeado, sem ele é decorativo; `size`. Estático, nunca pulsa.                                                                                                                                                                                                                       |
| `ark-switch`          | web-components | Switch on/off acessível (`role="switch"`): texto ON/OFF e ícones ✓/✕ opcionais, intents, filhos como rótulo clicável antes ou depois do trilho (`label-position`), dica `helper`, participação em formulário via checkbox oculto.                                                                                                                                                            |
| `ark-tab`             | web-components | Aba (`role="tab"`, o host é o controle): filhos livres, `disabled`, `controls`, `closable` e `dirty` na variante editor. Emite `ark-close`.                                                                                                                                                                                                                                                  |
| `ark-tabs`            | web-components | Faixa de abas (`role="tablist"`): `underline`/`chips`/`editor`, roving tabindex com setas/Home/End, `slot="actions"` no fim, `change` com o value ativo. Painéis ficam com o app.                                                                                                                                                                                                            |
| `ark-textarea`        | web-components | Campo multilinha com a grid do `ark-input`: `rows`, `autosize` (`field-sizing` nativo, fallback JS) até `max-rows`, `monospace`, `resize`, helper/erro com aria, tamanhos, intents, `rounded`.                                                                                                                                                                                               |
| `ark-time`            | web-components | Data e hora pelo `Intl`: relativa a agora ("há 3 minutos", "ontem") e atualizando sozinha, ou absoluta (`date`, `time`, `datetime`); um `<time datetime>` com a data completa no `title`.                                                                                                                                                                                                    |
| `ark-toaster`         | web-components | Toasts no estilo Sonner: API programática, posições, rich colors, ações, entrada/saída animadas, botão de fechar localizado.                                                                                                                                                                                                                                                                 |
| `ark-toggle`          | web-components | Botão de estado pressionado (`aria-pressed`), standalone (outline/tinted por intent) ou como item de grupo.                                                                                                                                                                                                                                                                                  |
| `ark-toggle-group`    | web-components | Segmented control: seleção exclusiva (padrão) ou múltipla, `value` sincronizado, propaga `size`/`intent`/`theme`/`disabled` aos itens.                                                                                                                                                                                                                                                       |
| `ark-tooltip`         | web-components | Tooltip sobre a Popover API: envolve o gatilho sem movê-lo, texto por `content` ou `slot="content"` rico, `side` com flip, `delay`, hover/foco/Esc, `aria-describedby` no gatilho.                                                                                                                                                                                                           |
| `ark-tree`            | web-components | Árvore declarativa (`role="tree"`): os seus `ark-tree-item` aninhados ficam onde estão; `selection` none (padrão) / single / multiple, `checkboxes` com `propagate`, carga `lazy`, ícones próprios de pasta e arquivo (`icons`, `icon-color`), teclado WAI-ARIA e busca por digitação. Emite `ark-toggle`, `ark-selection-change`, `ark-activate`.                                           |
| `ark-tree-item`       | web-components | Nó da árvore: `label`, `slot="icon"` ou o `icon` próprio, `slot="trailing"`, subitens como filhos; `expanded`, `lazy`, `loading`, `selected`, `checked` (`mixed`), `disabled`.                                                                                                                                                                                                               |
| `ark-chart`           | chart          | Tipos de gráfico do ECharts com suporte a temas, `palette="tokens"` para as cores `--ark-color-*`; `aria-label` nomeia o gráfico como uma imagem.                                                                                                                                                                                                                                            |
| `ark-wysiwyg-editor`  | wysiwyg        | Editor de texto rico baseado em Tiptap: JSON sanitizado ao entrar, grupos de toolbar opt-in (estilo, marcas, cor, alinhamento, listas, link, mídia, blocos, limpar, histórico), imagens/vídeos externos por um gancho `uploadFile` (nunca base64).                                                                                                                                           |
| `ark-wysiwyg-viewer`  | wysiwyg        | Viewer somente leitura com o mesmo schema do editor: o mesmo JSON sanitizado, links abertos em nova aba.                                                                                                                                                                                                                                                                                     |
| `ark-code-editor`     | code           | Editor CodeMirror 6: `language` json/javascript/yaml/text, numeração, dobra, busca, recuo por Tab, LF/CRLF, `readonly`, `wrap`, `placeholder`, completions (`variableKeys` depois de `{{`, `completions`, `completionSource`), `format()`, tema pelos tokens (`auto` segue a página), `variables`, `single-line` e `extensions` opcionais. Emite `change`, `ark-submit`, `ark-format-error`. |

### Atributos principais

**`ark-alert`** — o host é a caixa (fundo e borda suaves do `intent`, padrão `info`; `variant` `box`, padrão, arredondada, ou `banner`, largura toda só com borda inferior) e os seus filhos são a mensagem: texto livre ou elementos, em fluxo normal. `slot="icon"` fica à esquerda e `slot="action"` (os seus botões) à direita da primeira linha, posicionados pelo `components.css` sem sair do lugar (ícone e botão de dispensar na área reservada pelo padding; a ação flutua, então um texto longo a contorna: ponha-a antes do texto para ela ficar na primeira linha, porque depois de um parágrafo, ou de um texto que quebrou, ela desce para a última linha, sem cobrir a de cima). `heading` renderiza um título próprio no início do host. `dismissible` põe um botão de dispensar no fim (rotulado por `lang`/`locale-json`, chave `dismiss`); dispensar roda a saída (`slide-down`, `quick`), emite `ark-dismiss` e põe `hidden` no host: remover é do app, e tirar o `hidden` reexibe. `live` escolhe a live region: `polite` (`role="status"`), `assertive` (`role="alert"`) ou `off` (sem role); por padrão `warning` e `danger` são assertive e o resto polite. `theme`, `testid`. JS: `dismiss()`, `dismissible`.

**`ark-avatar`** — o host é o avatar (`role="img"` com `aria-label` de `name`; sem `name`, e sem um `aria-label` seu, fica `aria-hidden` e mostra um glifo de pessoa). Um `aria-hidden` seu fica, com ou sem `name` (um avatar ao lado do nome escrito, que não deve ser lido duas vezes): o componente só tira o que ele mesmo gravou. `name` gera as iniciais: a primeira letra, ou primeira mais última quando há sobrenome (`"Ana Lima"` → `AL`, `"Ana"` → `A`). `src` renderiza um `<img>` (`alt` igual a `name`, `object-cover`) e cai para as iniciais quando a imagem falha ao carregar. `size` (`xs`–`xl`: 1.5 a 4 rem), `shape` (`circle`, padrão / `square`, cantos arredondados), `color` (qualquer cor CSS: iniciais na cor sobre um fundo suave por `color-mix` no lugar do tint `primary`), `variant` (`soft`, padrão, como acima / `solid`: o fundo preenchido com `primary` e as iniciais em `primary-fg`, ou com `color` e iniciais brancas), `theme`, `testid`. JS: `initials` (somente leitura).

**`ark-badge`** — o próprio host é o badge (`inline-flex`); ícone e texto entram como filhos. `intent` (padrão `neutral`), `variant` (`soft`, padrão / `solid` / `outline`), `size` (`xs`/`sm`/`md`; a altura vem da fonte e do padding, não do token de tamanho dos controles), `rounded` (padrão `full`), `color` (qualquer cor CSS no lugar do intent: texto na cor, fundo suave ou contorno via `color-mix`, texto branco em `solid`), `theme`. Não é interativo: um badge clicável é um `ark-button` pequeno.

**`ark-button`** — o próprio host é o controle (`role="button"`, foco, teclado, participação em formulário via ElementInternals), então `aria-label`, `class` e `id` em `<ark-button>` valem diretamente e os filhos nunca são movidos. `variant` (`solid`/`outline`/`ghost`/`soft` ou qualquer intent, inclusive `neutral`; `soft` é o fundo suave do intent com a cor de texto dele, e a borda só aparece no hover, então a caixa mantém o tamanho), `intent`, `size` (`xs`–`xl`), `rounded` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`full` — com `icon-only`, `full` gera um botão circular), `loading` (spinner + `aria-busy` + clique bloqueado), `icon-only` (quadrado: `min-width` igual ao token de tamanho), `full-width`, `href`/`target` (um `<a>` "esticado" cobre o host, recebe o foco e é nomeado pelo conteúdo do host; `_blank` ganha `rel="noopener noreferrer"`; um clique simples emite `ark-navigate` cancelável com `detail: { href }` antes de o navegador seguir o link, para um app SPA chamar `preventDefault()` e rotear, e teclas modificadoras, o botão do meio, um `target` diferente de `_self`, `download` e um clique que o seu código já cancelou ficam com o navegador), `download` (vai para o `<a>`: vazio mantém o nome do arquivo da URL, com valor define o nome; com uma URL `blob:` salva conteúdo gerado), `disabled`, `type` (`button`, padrão / `submit` / `reset`), `form` (o id de um formulário de que o botão fica fora, como no `<button form>` nativo; também propriedade JS), `theme`, `color`/`text-color`. O primeiro botão `type="submit"` de um formulário é o botão padrão dele, como seria um `<button type="submit">` nativo (o navegador nunca dá esse papel a um custom element, então um login com dois campos não enviava no Enter): Enter num campo de texto do formulário (um `<input>` nativo do tipo text, search, email, url, tel, password, number ou de data/hora, ou o de dentro do `ark-input` ou do `ark-datepicker`) o clica, pelo mesmo caminho de um clique (seus listeners de `click`, `preventDefault()` cancela, depois `requestSubmit()` com validação e o evento `submit`). Um botão de submit nativo no formulário mantém esse papel, um `ark-button` padrão `disabled` ou em `loading` bloqueia o envio, um Enter que seu código ou um componente já cancelou fica com eles, `textarea` mantém a quebra de linha, e composição de IME e Ctrl/Alt/Meta+Enter não fazem nada; um campo fora do `<form>` ligado por `form="id"` vale. `SubmitEvent.submitter` é `null`, porque `requestSubmit()` não aceita um custom element. `status` (`idle`, padrão / `success` / `error`) troca o glifo da frente por um check ou um círculo de alerta com `.ark-animate-fade-in`; `loading` vence; o app limpa, o botão só mostra. Quando `status` vira `success` ou `error`, o botão anuncia `status-label` aos leitores de tela pelo serviço `announce()` do core (`polite` no sucesso, `assertive` no erro), então nenhuma live region entra no nome acessível do botão; sem `status-label` nada é anunciado. JS: `status`, `statusLabel`, `disabled`, `loading`, `type`, `form`.

**`ark-button-group`** — o host é o grupo (`role="group"`, nomeado por `label` → `aria-label`, ou pelo seu próprio `aria-label`) e os seus `ark-button` ficam onde você os pôs (o `ark-copy-button` também conta, mesmo atrás de um wrapper de framework). Colados por padrão: os botões dividem um contorno só, os cantos de fora seguem o `rounded` e os de dentro ficam retos, e cada botão depois do primeiro sobrepõe 1 px o anterior, então duas bordas viram uma linha (as variantes sem borda, `solid`, `soft` e `ghost`, ganham uma divisa na cor do texto a 25%); o botão sob o ponteiro ou com o foco do teclado sobe acima dos vizinhos, então a borda e o anel de foco dele nunca ficam cobertos. `spaced` mantém os botões inteiros, separados pelo gap do `size` (4 / 6 / 8 / 10 / 12 px). `orientation` (`horizontal`, padrão / `vertical`: os botões esticam na largura do maior), `full-width` (o grupo ocupa o contêiner e reparte a largura por igual). `variant`, `intent`, `size`, `rounded`, `theme` e `disabled` no grupo valem para todos os botões e, enquanto o grupo os tem, vencem o atributo do próprio botão (os wrappers Vue e Angular sempre gravam um padrão no botão, então a regra contrária nunca propagaria por eles); sem o atributo no grupo cada botão fica com o seu, e o que o botão tinha volta quando o grupo perde o atributo ou o botão sai do grupo. Sem evento próprio: cada botão continua emitindo o clique dele. Cada botão continua sendo um tab stop (é um grupo, não uma toolbar com foco itinerante). JS: `orientation`, `spaced`, `disabled`, `label`, `buttons`. O botão dividido não precisa de elemento próprio: cole a ação principal a um botão só de ícone que abre um `ark-menu`:

```html
<ark-button-group label="Salvar">
  <ark-button>Salvar</ark-button>
  <ark-button icon-only aria-label="Mais opções de salvar" id="save-more">▾</ark-button>
</ark-button-group>
<ark-menu for="save-more" align="end">
  <ark-menu-item value="draft">Salvar rascunho</ark-menu-item>
  <ark-menu-item value="copy">Salvar uma cópia</ark-menu-item>
</ark-menu>
```

**`ark-calendar`** — `value` (`YYYY-MM-DD`, interpretado no fuso local), `min`/`max`, `lang` (`en`/`pt`/`es`/`custom` + `locale-json`), `theme`, `intent`, `accent-color`. Título clicável alterna dias → meses → anos. Eventos: atributo `events` (JSON) ou propriedade JS `events` com `{ date, label?, color?, intent? }`, exibidos conforme `event-display` (`dots` padrão, `count`, `list`). Emite `ark-change` com `detail: { value, date, events }`. O rodapé tem os botões Hoje e Limpar (rotulados por `lang`): Hoje seleciona o dia atual, Limpar esvazia o valor e emite `ark-change` com `value` e `date` `null` e `events` `[]`. Navegação por teclado: setas movem entre dias (cruzando meses), `Home`/`End` início/fim do mês, `PageUp`/`PageDown` trocam de mês.

**`ark-checkbox`** — a caixa visual é um `<button role="checkbox">` desenhado pelo componente e um `<input type="checkbox">` nativo oculto leva `name`/`value` ao formulário (enviado só quando marcado; `value` padrão `on`); os dois são controles nativos, então `<fieldset disabled>` os desabilita sem atributo no host, e o host apaga caixa e rótulo juntos. `checked`, `indeterminate` (`aria-checked="mixed"` com um traço; o próximo clique o limpa e alterna `checked`), `disabled`, `name`, `value`, `size` (`xs`–`xl`, caixa na escala de espaçamento), `intent`, `theme`, `testid`. Nome acessível: `label` renderiza um `<label for>` próprio (clicar nele alterna); sem ele use `aria-label` no host (uma caixa sozinha na linha de uma tabela), ou filhos livres como rótulo (texto, links): eles nomeiam a caixa por `aria-labelledby` e clicar neles alterna, enquanto um link ou controle dentro deles mantém o próprio comportamento. Um `<label>` seu em volta do elemento também funciona (o botão desenhado é o primeiro controle rotulável dentro dele, então o rótulo nomeia a caixa e um clique no texto alterna uma vez só), o que deixa trocar um `<input type="checkbox">` cru dentro de um `<label>` pelo elemento sem mexer no resto; um `<label for>` apontando para o host não, porque o host não é um controle de formulário. `helper` acrescenta uma dica abaixo do rótulo (o host vira grid: a caixa, e depois rótulo e dica empilhados) que descreve a caixa por `aria-describedby`; quando filhos livres nomeiam a caixa, a dica fica `aria-hidden` para ficar fora do nome e continua lida como descrição, e o rótulo livre deve então ser um elemento ou um texto. Espaço alterna, Enter não. Emite `change` com `detail: { checked }`. JS: `checked`, `indeterminate`, `disabled`, `name`, `value`, `toggle()`, `focus()`.

**`ark-clock`** — `value` (lê `HH:mm[:ss]`, sempre 24h; uma escolha o regrava como `HH:mm:ss`, com `:00` quando não há coluna de segundos), `seconds` (coluna de segundos), `step-minutes`, `hours-format` (`24` padrão ou `12` com coluna AM/PM), `lang` (`en`/`pt`/`es`/`custom` + `locale-json`), `theme`, `intent`. Emite `ark-change` com `detail: { value }`, sempre `HH:mm:ss`.

**`ark-file-input`** — a grid do `ark-input` (`label`, `helper`, `error` (booleano, o estado de erro sem mensagem) / `error-message` com `aria-invalid`/`aria-describedby`) em volta de uma zona de soltar: uma caixa tracejada com o botão de escolher do próprio componente (`chooseFile`), a dica de arrastar (`dropHint`) e a lista dos nomes escolhidos (ou `noFile`). Um `<input type="file">` nativo oculto (`hidden`, `tabindex="-1"`) leva `name`, `accept`, `multiple`, `required` e `disabled` ao formulário, então `<fieldset disabled>` e `FormData` funcionam como sempre; o botão abre o seletor nativo e arrastar e soltar na zona (realçada com `data-ark-dragover`) alimenta o mesmo input (só o primeiro arquivo sem `multiple`; `accept` é aplicado pelo seletor, não pelo drop). Uma pasta solta não é um arquivo (o navegador a entrega como um `File` vazio que não dá para ler), então fica de fora: os arquivos soltos junto seguem, a lista mostra `foldersNotAccepted` e o anúncio o leva, e um drop só de pastas não muda nada nem emite `change`. A cada mudança emite `change` com `detail: { files }` (um array de `File`) e anuncia os nomes escolhidos, ou `noFile`, pelo `announce()` do core. `directory` (opt-in) faz do campo um seletor de pasta: o input oculto ganha `webkitdirectory` (e `multiple`, para o navegador sem seleção de pasta, como os mobile mais antigos, cair na escolha dos arquivos da pasta), o botão e a dica passam a `chooseFolder`/`dropFolderHint`, e uma pasta solta na zona é lida até o fim, com as subpastas (arquivos soltos junto seguem com o próprio nome). A lista vira uma linha de resumo (o nome da pasta quando é uma só, `fileCount` e o tamanho total; `noFolder` quando vazia), o anúncio também, e `change` leva `detail: { files, paths }`, em que `paths[i]` é o caminho de `files[i]` a partir do nome da pasta (`colecao/auth/login.bru`); `accept` não filtra o conteúdo de uma pasta, e um formulário envia os arquivos de uma pasta solta só com o nome, então leia `paths` quando a estrutura importar. `size` (altura do botão pelo token `--ark-size-*` e tamanho dos textos), `intent` (foco, botão e realce ao arrastar), `rounded` (cantos da zona, padrão `lg`), `theme`, `lang`/`locale-json`, `testid`. JS: `files` (array), `paths` (array, o caminho de cada arquivo), `multiple`, `directory`, `disabled`, `clear()`, `focus()`, `inputElement`.

**`ark-input`** — `type` (`text`, `password`, `email`, `number`, `tel`, `url`, `search`, `date`, `time`, `datetime-local`), `label` (vira `<label for>` real), `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message` (com `aria-invalid`/`aria-describedby`), `disabled`, `required`, `readonly`. Prefixo e sufixo via filhos com `slot="prefix"`/`slot="suffix"`, posicionados sobre as pontas do campo sem serem movidos. Um controle seu num deles (um `<select>` de unidade, um `ark-select`) manda o `input`/`change` dele pelo `ark-input` como os do próprio campo, como qualquer filho: um listener no host confere `event.target`. `reveal` num campo `type="password"` adiciona um botão de mostrar/ocultar (`aria-pressed`, rotulado por `lang`/`locale-json`) que alterna o tipo; convive com um sufixo do usuário. Atributos nativos são espelhados no `<input>` interno sem interpretação: `autocomplete`, `autofocus`, `inputmode`, `maxlength`, `minlength`, `pattern`, `min`, `max`, `step`, `spellcheck`, `list` (o id de um `<datalist>` da página com as sugestões), `aria-label`. Para composição: `focus()` e o getter `inputElement`. Esticado numa linha mais alta (um flex com o `align-items: stretch` padrão, ou uma linha de grid), rótulo, campo e mensagem ficam onde ficariam sozinhos e a sobra vai para baixo; um campo sem rótulo nem mensagem segue centrado na linha. Vale também para `ark-select`, `ark-file-input` e `ark-checkbox`/`ark-radio` com `helper`.

**`ark-color-swatches`** — o host é o `role="radiogroup"` (nomeado por `label` ou pelo seu `aria-label`) e cada amostra é um botão `role="radio"` do próprio componente preenchido com a cor, nomeado pelo `name` da amostra (`aria-label`) e `aria-checked` quando é o `value`. `colors` é `{ name, value }[]` como atributo JSON ou como propriedade JS; `value` é a cor selecionada (a string `value` da amostra). O teclado segue o radio nativo: um tab stop (a amostra selecionada, senão a primeira), as setas movem e selecionam dando a volta, Home/End vão à primeira e à última, Espaço ou Enter seleciona. `disabled`, `size` (`xs`–`xl`: amostras de 1 a 2.5 rem), `theme`, `testid`. Emite `change` com `detail: { value }` só quando a seleção muda. JS: `value`, `colors`, `disabled`, `select(value)` (seleciona como o usuário faria, emitindo `change`).

**`ark-command-item`** — o host é a opção (`role="option"`, nunca focada: o campo de busca mantém o foco e aponta para ela por `aria-activedescendant`); ícone e texto são filhos livres e um filho `slot="trailing"` (um atalho em `ark-kbd`, um badge) vai para a direita por CSS. `value` é o que `ark-select` carrega, `group` nomeia a seção em que ele é listado, `label` é o texto usado no filtro e no nome da opção (padrão: o texto), `disabled` o mantém visível mas não selecionável. A paleta escreve `id`, `hidden`, `aria-selected` e a ordem visual; o resto é seu. `testid`.

**`ark-command-palette`** — o host é o painel (`popover="manual"`, `role="dialog"` nomeado por `label`, scrim, focus trap, Esc, centrado no topo como um Spotlight), os seus filhos `ark-command-item` ficam onde estão, e o componente põe o próprio chrome nas pontas: o campo de busca (um `ark-input` criado pelo componente, `role="combobox"`, sticky no topo) e, ao fim, um cabeçalho por `group` mais a mensagem `noResults`, todos posicionados por `order` no CSS para nada ser inserido entre os seus itens; um `role="listbox"` oculto é dono das opções visíveis por `aria-owns`, e o campo aponta para a ativa com `aria-activedescendant`. Digitar filtra localmente pelo `label` de cada item quando `filter` está presente (sem distinguir caixa nem acentos) e sempre emite `ark-query` com `detail: { query }` com debounce de `query-delay` (padrão 150 ms), para o app trocar os filhos por resultados assíncronos. Sem opção visível a paleta mostra a string `noResults`; `hint` a troca enquanto o campo está vazio ("Digite para buscar…" numa paleta que começa vazia), e `busy` (JS `busy`) marca uma busca em andamento: a mensagem vira a string `searching` e o listbox oculto ganha `aria-busy`. Ligue `busy` no `input` ou no `ark-query` e desligue quando os resultados chegarem. Teclado: setas movem a opção ativa (dando a volta, pulando desabilitadas), Home/End, Enter seleciona, Esc fecha; passar o mouse também ativa. `hotkey` a alterna de qualquer lugar da página (`/`, `mod+k`, `ctrl+shift+p`...; `mod` é Ctrl ou Cmd): abre a paleta e, pressionado com ela aberta, a fecha; fechada, é ignorado com o foco num `input`, `textarea`, `select` ou `contenteditable`. `open` é a fonte da verdade (`show()`, `close()`); `placeholder` (padrão a string `search`), `no-scroll-lock` (sem ele a página para de rolar enquanto aberta), `theme`, `lang`/`locale-json`, `testid`; troque a cor do scrim com `--ark-command-palette-scrim` (cai para `--ark-dialog-scrim`). JS: `query` (o texto da busca), `queryDelay`, `noScrollLock`. Emite `ark-select` com `detail: { value }` (e fecha), `ark-query`, `ark-open`, `ark-close`.

**`ark-copy-button`** — `ArkCopyButton extends ArkButton`: o host é o próprio botão, com todo atributo do `ark-button` que faz sentido aqui (`variant`, `intent`, `size`, `rounded`, `icon-only`, `full-width`, `loading`, `disabled`, `color`/`text-color`, `theme`, `testid`, participação em formulário, teclado), então os seus filhos (rótulo, ícone) ficam onde estão e nada é aninhado. O que copiar: `value` (o texto) ou `for` (o id de um elemento: o `value` quando ele tem um `value` string — inputs, textareas, selects, campos `ark-*` —, o `textContent` nos demais). O componente põe o próprio ícone de copiar no início e, quando você não dá filhos, o próprio rótulo com a string `copy`; ao clicar escreve na área de transferência (`navigator.clipboard.writeText`, com fallback por `execCommand("copy")` em contextos inseguros), troca o ícone por um check, o rótulo e o `title` por `copied` (e o `aria-label` também com `icon-only`), anuncia `copied` pelo `announce()` do core, põe `data-ark-copied` no host e volta depois de `feedback-ms` (padrão 1500). Com filhos seus, só o ícone, o `title` e o anúncio mudam. `lang`/`locale-json` (chaves `copy`, `copied`). Emite `ark-copy` com `detail: { value }`. JS: `copy()` (assíncrono, resolve `true` quando copiou), `value`, `feedbackMs`.

**`ark-data-view`** — uma coleção de registros em duas apresentações, uma `<table>` de verdade e uma lista de cards, desenhada a partir de dados: `rows` (os seus objetos, guardados por referência) e `columns` (`{ key, label, sortable?, searchable?, align?, width?, show?, cardSpan?, cardRole?, cardLabel?, render?, compare? }`), as duas propriedades JS (os atributos `columns`/`rows` aceitam o JSON sem funções). Sem mais nada ele é uma tabela simples com o seletor de visualização no canto, que vira cards quando fica estreita; todo outro recurso abaixo fica desligado até o atributo dele ligar. `key` lê um campo ou um caminho com ponto (`address.city`) e `row-key` (padrão `id`) diz qual campo identifica o registro, que precisa ser único. Uma célula mostra o campo como texto, ou o que o `render({ row, column, value, index, view })` da coluna devolver: um nó DOM (um `ark-avatar`, duas linhas de texto em tamanhos diferentes) ou um texto/número, inserido como texto e nunca como HTML. Os wrappers desenham esse conteúdo nos termos de cada framework, com o mesmo resultado: JSX no React, um slot `cell-<key>` no Vue, um `ng-template` no Angular (veja as seções abaixo). `view` escolhe a apresentação: `table`, `cards` ou `auto` (padrão), que mostra cards enquanto o próprio componente está mais estreito que `breakpoint` (px, padrão 640; um `ResizeObserver` no host, então uma tabela num painel estreito no desktop também vira cards); o seletor no canto reescreve `view` e emite `ark-view-change`, `no-view-selector` o esconde enquanto `view` continua decidindo (`auto` segue a largura, `table` ou `cards` fixam uma) e `resolvedView` lê a que está em uso. `show` (`both`/`table`/`cards`) põe um campo numa apresentação só. No card, `cardRole: "title"` leva o campo ao cabeçalho do card sem rótulo e o resto preenche uma grade de `card-columns` (1–4, padrão 2), em que `cardSpan` é quantas colunas o campo ocupa e `cardLabel: false` deixa o rótulo só para o leitor de tela; `cardRender({ row, index })` (propriedade JS) desenha o corpo inteiro do card no lugar dela, e os cards têm no mínimo `--ark-data-view-card-min` (16rem) de largura. Recursos opcionais: `searchable` (um campo de busca com atraso `search-debounce`, padrão 300 ms, e `search-placeholder`), `page-size` (paginação por um `ark-pagination`, mais `page-sizes` para o seletor de itens por página), `selectable` (uma caixa por registro e a de selecionar tudo, com estado misto; `selected` é a propriedade JS com as chaves, e o seu filho `slot="selection"`, os botões de ação em massa, só aparece enquanto há seleção), `reorderable` (uma alça por registro: arrasto com a marca de onde o registro vai entrar e rolagem automática junto às bordas da área de rolagem, setas na alça, e um clique ou Enter nela abre o menu de mover para cima, para baixo, para o início e para o fim, que é a alternativa ao arrasto e o caminho para levar um registro além da página à vista; Esc cancela um arrasto; desligada enquanto há ordenação ou busca) e `clickable` (linhas e cards ficam focáveis e emitem `ark-row-click` no clique, Enter ou Espaço, menos a partir de um controle dentro deles). `mode` diz quem executa a consulta: `client` (padrão) busca sem depender de caixa nem de acento, ordena (números, datas e booleanos pelo valor, `compare` para uma ordem sua, vazios ao fim) e pagina `rows`; `server` só publica a consulta e mostra `rows` como chegou, contando as páginas por `total`, com `loading` no intervalo (placeholders quando não há registros, registros esmaecidos caso contrário, `aria-busy`). Cada mudança do usuário emite um `ark-query-change` com `detail: { page, pageSize, sort, search, reason }`, e uma busca, ordenação ou itens por página novos voltam para a página 1; `sort` é `chave:asc`/`chave:desc` (o cabeçalho alterna crescente, decrescente, nenhuma, com `aria-sort`; nos cards um seletor lista as colunas ordenáveis). `ark-selection-change` leva `{ selected, rows }` e `ark-reorder` leva `{ key, from, to, rows }` (posições em `rows`; o componente reordena a própria lista, persistir é seu); gravar `rows`, `selected` ou qualquer atributo por fora não emite nada, e `ark-render` (que não sobe) sai depois de cada redesenho do conteúdo, para integrações que preenchem as células em seguida. Slots, filhos que ficam onde estão e são posicionados pela grid do host: `slot="toolbar"` ao lado da busca, `slot="selection"` e `slot="empty"` no lugar do estado vazio próprio quando não há registros (uma busca sem resultado fica com a mensagem própria `noResults`); os nós do componente se encaixam em volta deles, inclusive quando um framework acrescenta um depois, para a ordem de tabulação seguir a visual. `label` nomeia a tabela/lista, `size` (`xs`–`xl`) define a densidade, `lang`/`locale-json`, `theme`, `testid`. JS: `rows`, `columns`, `selected`, `cardRender`, `query`, `resolvedView`, `clearSelection()` e um setter para os atributos acima. Não há virtualização: pagine listas longas. Hooks de E2E além dos que estão na tabela abaixo: `data-view-selection-count`, `data-view-clear-selection`, `data-view-content`, `data-view-header`, `data-view-sort-button`, `data-view-card-body`, `data-view-footer`, `data-view-menu`, `data-view-move-{up,down,start,end}`, mais `data-view-toolbar`, `data-view-actions` e `data-view-empty` nos seus filhos de slot `toolbar`, `selection` e `empty`.

**`ark-datepicker`** — compõe `ark-input` + `ark-calendar` + `ark-clock`. `mode`: `datetime` (padrão, valor `YYYY-MM-DDTHH:mm:ss`), `date` (`YYYY-MM-DD`) ou `time` (`HH:mm:ss`). Sem `input`, renderiza os painéis inline; com `input`, campo + popup: o popup é um `popover="manual"` do próprio componente (top layer, então nenhum `overflow` do seu layout o corta e não há `z-index`), ancorado ao campo por `positionAnchored` (abre abaixo, vira para cima sem espaço, acompanha scroll e resize) e animado com `scale` a partir dessa origem. `format` com tokens `YYYY`/`MM`/`DD`/`HH`/`mm`/`ss` (sensível a maiúsculas; o padrão segue `mode` e `seconds`: a parte de data é `MM/DD/YYYY` em `en` e `DD/MM/YYYY` nos demais, a de hora `HH:mm`, ou `HH:mm:ss` com `seconds`, e `datetime` junta as duas), `placeholder`, `seconds`, `name` (formulário com valor ISO via input hidden, inline ou com `input`), `disabled` (bloqueia o campo e os painéis nos dois modos). Repassa `lang`, `locale-json`, `theme`, `intent`, `accent-color`, `min`, `max`, `events` e `event-display` ao calendário e `lang`, `locale-json`, `theme`, `intent`, `seconds`, `step-minutes` e `hours-format` ao relógio. Emite `ark-change` com `detail: { value, date }` (`value` é `null` ao limpar; o `ark-change` dos próprios painéis é consumido). Digitação com validação (entrada inválida reverte); Enter no campo aplica o texto digitado e, com o popup fechado e o texto válido, segue para o formulário (submissão implícita pelo botão padrão dele, como num `<input type="date">`), enquanto uma entrada inválida ou o popup aberto ficam com o Enter; no modo `date` selecionar fecha o popup, no `datetime` ele permanece aberto para escolher a hora; `Esc`/clique fora fecham.

**`ark-dialog`** — o host é o painel, aberto como `popover="manual"` (top layer, `::backdrop` como scrim, sem portal nem `z-index`); seus filhos são o corpo e ficam onde estão, e um filho com `slot="footer"` vira o rodapé (ações alinhadas ao fim, sticky no fundo do painel rolável, ou no fundo do painel quando ele é mais alto que o conteúdo) só por CSS. O componente adiciona o cabeçalho (um `h2` a partir de `label`, ou o nível de `heading-level`, mais o botão de fechar) como primeiro filho, para a leitura começar pelo título. `open` (refletido, a fonte da verdade: `show()`, `close(reason)` e a propriedade `open` só o alternam, então um framework que remove o atributo ainda recebe a animação de saída), `size` (`sm` / `md`, padrão / `lg` / `xl` / `full`, que ocupa a viewport sem cantos), `width`/`height` (um comprimento CSS, número puro em px; cada um sobrescreve o preset no seu eixo e continua limitado à margem da viewport; sem `height` o painel tem a altura do conteúdo), `label` (título e nome acessível via `aria-labelledby`; sem ele dê um `aria-label` ao host, senão o componente avisa uma vez), `no-close-button`, `persistent` (Esc e scrim não fecham), `no-scroll-lock` (por padrão a página para de rolar com o diálogo aberto, ver `lockScroll` nos helpers de overlay), `theme`, `lang`/`locale-json` (rótulo de fechar), `testid`; JS: `persistent`, `noScrollLock`. O foco vai ao primeiro filho com `autofocus`, senão ao primeiro focável do corpo, senão ao botão de fechar, senão ao painel, e volta ao opener ao fechar. Só o cabeçalho do próprio diálogo fica fora dessa escolha, então um `ark-checkbox`, `ark-radio` ou `ark-file-input` no começo do corpo recebe o foco; quando o primeiro focável não é o que você quer (um `ark-alert` dispensável acima de um formulário), ponha `autofocus` no campo. O trap, o foco inicial e o `ark-open` vêm um microtask depois de `open` mudar (no `ark-drawer` e no `ark-command-palette` também): um framework que grava `open` dentro da própria atualização já terminou de mexer no foco (o React refoca, ao fim do commit, o elemento focado antes dele), o foco que você põe num campo seu logo depois de abrir é mantido, e ao fechar o foco volta ao elemento que o tinha quando `open` mudou. Quando esse elemento saiu da página junto com o fechamento (a linha cujo botão abriu uma confirmação), o foco vai para o overlay de baixo quando há um, e senão termina no `<body>`, como no `<dialog>` nativo: escolha o destino depois do fechamento, logo depois de `close()` ou no listener de `ark-close` na tag crua, e no React num efeito que roda quando `open` vira `false` (um `focus()` dentro do handler do clique ou do `onClose` é desfeito, o React devolve o foco ao botão ao fim do commit). Um controle focado que fica `disabled` ou sai da página com o diálogo aberto (um campo durante o envio) passa o foco ao painel e não o recebe de volta ao ser reabilitado (foque-o você, ou bloqueie o formulário com `readonly` no campo e `loading` no botão, que mantêm o foco), então o Esc continua fechando e um Enter repetido não aciona nada; com o foco no `<body>` (um `blur()` seu, um clique no texto de um toast) o Esc ainda chega ao diálogo. Fechar no mesmo passo ainda emite `ark-open` antes de `ark-close`. O `ark-drawer` escolhe do mesmo jeito. Emite `ark-open` e `ark-close` com `detail: { reason: "escape" | "backdrop" | "close-button" | "api" }` quando o fechamento começa. Os dois borbulham, como todo evento `ark-*`: um listener no diálogo também recebe o `ark-open`/`ark-close` de um `ark-menu`, de uma `ark-tab` fechável ou de outro overlay de dentro dele, então confira `event.target` na tag crua (os wrappers React, Vue e Angular entregam só os do próprio elemento). Motion: entra com `scale`, sai com `fade` (antes de sair do top layer), scrim só por opacidade; troque a cor do scrim com `--ark-dialog-scrim`. **Limite:** a Popover API não torna o resto da página `inert`. O trap mantém o foco do teclado dentro (foco levado para fora volta ao elemento que o tinha) e cancela eventos de ponteiro iniciados fora do painel, inclusive no diálogo de baixo quando um diálogo abre outro (popovers abertos por cima, como um menu ou o toaster, continuam usáveis), mas um leitor de tela navegando pelo cursor virtual ainda alcança o conteúdo atrás do diálogo.

**`ark-drawer`** — o host é o painel e os seus filhos são o corpo; um filho `slot="footer"` vira o rodapé sticky e `label` renderiza o cabeçalho (h2, ou o `heading-level` que você definir, + botão de fechar, primeiro filho) exatamente como no `ark-dialog`. Um container `slot="actions"` (um `<div>` com os filtros e botões de um console, ou um botão de editar) entra na linha do cabeçalho entre o título e o botão de fechar, centrado na linha do título e sticky com o cabeçalho; o título reserva a largura das ações, medida com um `ResizeObserver`, e o cabeçalho existe mesmo sem `label`. `mode="overlay"` (padrão) abre como `popover="manual"`: top layer, scrim por `::backdrop` (`--ark-drawer-scrim`), `role="dialog"` com `aria-modal`, o focus trap do core, Esc e clique no scrim fecham (salvo `persistent`), a página para de rolar (salvo `no-scroll-lock`), e o painel desliza da própria borda pela largura ou altura inteira. `mode="inline"` mantém o host no fluxo da página como `role="region"` (o console inferior, um painel lateral): sem popover, sem scrim, sem trap, Esc não faz nada; `open` o alterna com um slide curto. `side` (`left`/`right`/`top`, padrão `right`, `bottom`) escolhe a borda, a direção do slide e a borda desenhada; `size` é `sm`/`md`/`lg` (18/24/32 rem de largura, 16/20/28 rem de altura) ou qualquer comprimento CSS no eixo da gaveta (número vira px; `100%` é a sidebar de celular na largura toda). A entrada usa o easing `sheet` (`cubic-bezier(0.32, 0.72, 0, 1)`, token de motion novo) na duração `default`, a saída `in` na `quick`. `open` é a fonte da verdade (`show()`, `close(reason)`, setter `open` tolerante); `no-close-button`, `theme`, `lang`/`locale-json`, `testid`; JS: `side`, `mode`, `persistent`, `noScrollLock`. Emite `ark-open` e `ark-close` com `detail: { reason }` (`escape`, `backdrop`, `close-button`, `api`).

**`ark-empty`** — o host é a caixa tracejada; seus filhos ficam onde estão: um filho com `slot="icon"` (apagado; um `svg` dentro ganha 2.5rem) e um com `slot="action"` (um `ark-button`, ou vários). `heading` (um `h3`; `heading-level` de 1 a 6 escolhe outro nível) e `description` (um `p`) são criados pelo componente no início do host, então a ordem de leitura (a do DOM) começa por eles, antes do seu ícone, conteúdo e ação. A ordem visual é ícone, título, descrição, qualquer outro filho, ação, seja qual for a ordem do DOM. `theme`, `testid`. Não é interativo e não tem role próprio.

**`ark-kbd`** — o host é a tecla (monoespaçada, borda, fundo `surface-muted` e aresta inferior) e os seus filhos são o texto da tecla (`Ctrl`, `K`, `⌘`); componha atalhos com várias. `size` (`xs`–`xl`: altura mínima de 1 a 2 rem na escala de espaçamento), `theme`, `testid`. Não é interativo e não tem role: leitores de tela leem como texto comum, como um `<kbd>`.

**`ark-kv-editor`** — o único componente que compõe outros (`ark-checkbox`, `ark-input`, `ark-select`, `ark-textarea`, `ark-button`), porque renderiza tudo a partir de dados: atribua a propriedade JS `rows` (`{ id, key, value, enabled, type?, secret?, description? }[]`; um atributo `rows` em JSON dá o valor inicial) e o componente desenha uma barra (contagem, alternador de modo), uma linha por entrada (checkbox de ativo, campos de chave e valor, botão de remover) e um botão de adicionar; linhas desativadas ficam na lista, apagadas. Três colunas opcionais: `types="string,number,date"` acrescenta um select com o tipo do valor por linha (o `type` da linha, com o primeiro tipo como padrão) e o campo de valor o segue (`number`, `date`, `time`, `datetime`, `email`, `url` e `tel` viram esse tipo de input, o resto é texto); `secret` acrescenta um cadeado por linha (`aria-pressed`, a string `secret`): fechado, o valor vira um campo de senha com o olho de revelar do `ark-input`, aberto, volta ao tipo da linha; `description` acrescenta um campo de descrição (`description-placeholder`). Cada edição emite `change` com `detail: { rows }` (uma cópia); adicionar emite `ark-add` com `detail: { id }`, foca a chave nova e anuncia a contagem pelo `announce()` do core; remover emite `ark-delete` com `detail: { id }`, move o foco para a linha seguinte e também anuncia. Enter no valor da última linha adiciona uma linha. `bulk` (atributo/propriedade, também o alternador da barra) troca a tabela por uma textarea monoespaçada em `bulk-format`: `lines` (padrão) é `chave:valor` por linha com `#` na frente das desativadas, rápido para cabeçalhos, e preserva tipo, segredo e descrição de cada linha por posição; `json` é um array com todos os campos menos `id`, para as colunas mais ricas. O texto é interpretado enquanto você digita (JSON inválido marca o campo e não mexe nas linhas) e `change` sai de novo ao deixar o modo, reaproveitando os ids de quando ele abriu, por posição. `key-placeholder`/`value-placeholder` (também os nomes acessíveis dos campos), `readonly`, `size` (dos controles compostos), `theme`, `lang`/`locale-json` (`add`, `bulkEdit`, `tableEdit`, `entries`, `noEntries`, `deleteRow`, `type`, `secret`), `testid`. JS: `rows`, `bulk`, `bulkFormat`, `bulkText`, `types`, `secret`, `description`, `readonly`, `valueField`, `add(row?)`, `delete(id)`. **Célula de valor sua** (opcional): atribua à propriedade JS `valueField` uma função `({ row, type, size }) => HTMLElement | null` e o elemento que ela devolve substitui o `ark-input` do valor da linha (um `ark-code-editor` de uma linha com `variables` dá autocomplete de `{{variável}}`, por exemplo). O elemento expõe `value` (texto) e emite `input` ou `change` a cada edição; o editor grava nele `value`, `placeholder`, `aria-label`, `size` e `readonly`, marca `data-ark="kv-editor-value"` e acrescenta uma linha com um Enter que o campo não cancelou, ou com um `ark-submit`, vindo da última linha. Linhas secretas mantêm o campo de senha (a função não é chamada para elas), devolver `null` mantém o `ark-input` naquela linha (uma linha `number`, por exemplo), e uma linha que troca de tipo ou de cadeado ganha uma célula nova. Mantenha a função estável (uma função nova recria todas as células); sem `valueField` nada muda.

**`ark-mark`** — o host é a marca: um SVG inline (`viewBox` 0 0 24 24, um path por forma) desenhado em `color` (qualquer cor CSS; padrão a cor do texto ao redor) com `shape` `circle` (padrão), `square`, `triangle`, `diamond`, `star`, `hexagon`, `cross`, `pentagon`, `moon` ou `asterisk`, para um workspace ou ambiente ser distinguido por cor e forma ao mesmo tempo. `size` é o lado do SVG em px (número) ou qualquer comprimento CSS (padrão 16). `label` o torna um `role="img"` com esse nome; sem ele a marca é `aria-hidden`, para o caso comum em que o texto ao lado nomeia a coisa. `theme`, `testid`. JS: `shape`. `ark-color-swatches` e `ark-shape-picker` são os seletores correspondentes.

**`ark-menu`** — o host é o painel (`role="menu"`), aberto como `popover="auto"` (top layer, light dismiss e Esc nativos, sem portal nem `z-index`); as `ark-menu-item` filhas ficam onde estão. Ligue um gatilho com `for="<id>"`: o componente só escreve `aria-haspopup`, `aria-expanded` e `aria-controls` nele (e um `id` quando falta), nomeia o menu por ele com `aria-labelledby`, alterna no clique e abre com ArrowDown/ArrowUp; o gatilho pode montar depois do menu (resolvido ao conectar e observado até aparecer). `align` (`start`, padrão / `end`), `direction` (`down`, padrão / `up`; vira quando não cabe), `open` (refletido do estado do popover), `size` e `theme` (propagados aos itens), `testid`. JS: `show()`, `hide()`, `openAt(x, y)` para um menu de contexto num ponto (enquanto aberto num ponto o menu passa a `popover="manual"` e fecha ele mesmo no pointerdown fora). Dentro: setas com ciclo pulando itens desabilitados, divisores e estáticos, Home/End, Enter/Espaço selecionam, Esc fecha e devolve o foco ao gatilho, Tab fecha. Emite `ark-select` com `detail: { value }` (o evento do próprio item é consumido; o menu fecha em seguida), `ark-open` e `ark-close`. Posicionado por JS a partir de `getBoundingClientRect()` (`positionAnchored`, ver os helpers de overlay); entrada e saída são transições CSS (`scale` mais fade a partir do canto de origem, na entrada e na saída), então o light dismiss também anima.

**`ark-menu-item`** — o host é o item (`role="menuitem"`, foco, teclado); ícone e texto entram como filhos e um atalho ou badge num filho com `slot="trailing"`. `value`, `disabled`, `intent` (`danger` para ações destrutivas; qualquer intent colore texto e hover), `checked` (vira um `menuitemcheckbox` com `aria-checked` e um check ao fim; `checked="false"` é um desmarcado), `divider` (`role="separator"`), `static` (conteúdo não interativo como nome e e-mail do usuário; `role="presentation"`, fora do ciclo das setas; herda a cor de texto esmaecida, então pinte seus filhos com os tokens, ex.: `var(--ark-color-fg)` no nome). JS: `value`, `disabled`, `checked` (três estados: `true`/`false` fazem um item checkbox marcado/desmarcado, `null`/`undefined` um item comum), `select()`.

**`ark-menu-group`** — o host é o grupo (`role="group"`) em volta das suas `ark-menu-item`, que ficam onde estão: `label` cria o título próprio no início do host e dá nome ao grupo por `aria-labelledby` (sem `label`, um `aria-label` no host nomeia). As setas, Home e End do menu atravessam os grupos como se os itens estivessem soltos, uma escolha dentro de um grupo sai uma vez só, como o `ark-select` do menu, e `size`/`theme` chegam propagados do menu (também a um grupo inserido depois). Separe grupos com um `ark-menu-item divider` se quiser uma linha entre eles. `testid`. JS: `label`.

**`ark-nav`** — o host é o `role="navigation"` (nomeie-o com `label` → `aria-label`); os filhos `ark-nav-item`/`ark-nav-group` ficam onde estão, um filho com `slot="header"` (logo) vai ao início e um com `slot="footer"` (avatar, seletor) ao fim, só por CSS. `variant` (`sidebar`, padrão: uma coluna em que o cabeçalho, o rodapé e o botão de recolher ficam presos nas pontas e só os itens rolam entre eles; `navbar`: barra horizontal, cabeçalho no início e rodapé no fim, sem barra de rolagem visível quando os itens não cabem (ainda rola por trackpad, toque e foco); `tabbar`: abas de rodapé do celular, ícone sobre o rótulo, itens de largura igual), `side` (`left`, padrão / `right`: a borda desenhada e o chevron de recolher, só na sidebar), `collapsed` (refletido; a sidebar vai de `--ark-nav-width`, 16rem, a `--ark-nav-rail-width`, 3.5rem, com transição de largura pelos tokens, e o cabeçalho e o rodapé centram na coluna estreita; redefina as custom properties no host ou em `:root`; na navbar deixa os itens só com ícones, sem botão), `collapsible` (`rail`, ou o atributo vazio: acrescenta o botão de recolher do componente e deixa um trilho de ícones, com os rótulos ocultos visualmente mas ainda nomeando os links, e um `title` em cada item; `hidden`: só o cabeçalho e o botão de expandir ficam, o resto sai do layout e da ordem de Tab), `value` (o `value`, ou `href`, do item atual: o componente escreve `current` no item que coincide e limpa os demais; sem ele cada item mantém o próprio), `size`, `intent` (item atual e anel de foco), `theme`, `lang`/`locale-json` (rótulos de recolher/expandir); `variant`, `size`, `intent` e `theme` são propagados a itens e grupos. O componente nunca se posiciona: o app o coloca (uma coluna de grid, `position: fixed` no tabbar) e esconde o que não deve aparecer no trilho (`ark-nav[collapsed] .wordmark { display: none }`). Emite `ark-collapse` com `detail: { collapsed }` quando o botão é usado (não quando o app grava o atributo); o `ark-navigate` dos itens sobe pelo host sem ser consolidado, então um listener no nav roteia todos os itens. JS: `variant`, `side`, `value`, `collapsed`, `collapsible`, `label`, `toggle()`.

**`ark-nav-item`** — o host é a linha (hover, cores do atual, anel de foco); `label` é desenhado pelo componente, o seu ícone vai em `slot="icon"` (dimensionado pelo `size`) e um badge ou atalho em `slot="trailing"`. Com `href` um `<a>` real esticado sobre o host é o controle (nomeado pelo conteúdo do host via `aria-labelledby`, `aria-current="page"` quando `current`, `target` com `rel="noopener noreferrer"` em `_blank`), então Ctrl/Cmd+clique, clique do meio e "abrir em nova aba" funcionam como em qualquer link; sem `href` o host é um `role="button"` (Enter/Espaço). O clique emite `ark-navigate` com `detail: { href, value }`, cancelável: chame `preventDefault()` e roteie com o seu router (cliques com modificador e `target="_blank"` pulam o evento e ficam com o navegador). `value` (identificador no evento e para o `value` do nav; padrão: o `href`), `current`, `disabled` (a âncora perde o `href`), `divider` (`role="separator"`). O conteúdo trailing fica sob o link esticado, então mantenha-o não interativo (badge, kbd). JS: `href`, `target`, `label`, `value`, `current`, `disabled`, `divider`.

**`ark-nav-group`** — o host é o `role="group"`, nomeado pelo cabeçalho; os seus itens ficam como filhos. `label` desenha o cabeçalho: um título ou, com `expandable`, um `<button aria-expanded>` que mostra e esconde os itens (`open`, refletido; emite `ark-toggle` com `detail: { open }`). No trilho o cabeçalho some e o grupo vira uma faixa separada por uma linha com todos os itens à mostra; em `navbar`/`tabbar` o grupo não tem caixa própria (`display: contents`) e os itens entram na barra. JS: `label`, `expandable`, `open`, `toggle()`.

**`ark-pagination`** — o host é a `role="navigation"` (nomeada por `lang`, ou pelo seu `aria-label`). `page` (a partir de 1), `page-size` (padrão 10) e `total` são a fonte da verdade: o componente só conta páginas, cortar os dados é do app. Ele desenha o resumo do intervalo (`31–40 de 134`, oculto sem itens), um seletor opcional de itens por página (`page-sizes="10,25,50"`, um `ark-select`; trocá-lo mantém à vista o primeiro item que estava na tela) e a faixa de páginas: anterior, números com `aria-current="page"`, reticências e próxima, com `siblings` (padrão 1) páginas em volta da atual e um número constante de itens, para os botões não mudarem de lugar ao navegar. Um clique reescreve `page` (e `page-size`), emite `ark-page-change` com `detail: { page, pageSize, pageCount }` e anuncia a página; gravar os atributos por fora não emite nada, e um `page` além da última é limitado na leitura. `disabled`, `size` (`xs`–`xl`), `intent` (a página atual), `lang`/`locale-json`, `theme`, `testid`. JS: `page`, `pageSize`, `total`, `pageSizes`, `siblings`, `disabled`, `pageCount` (somente leitura).

**`ark-progress`** — o host é o `role="progressbar"` (`aria-valuenow`/`aria-valuemin`/`aria-valuemax`, nome por `label` ou pelo seu `aria-label`/`aria-labelledby`): uma linha com o trilho (`bg-muted`, altura por `size` `xs`–`xl`: 0.25 a 1 rem) e, com `show-value`, a porcentagem arredondada ao lado. `value` (0 a `max`, com clamp; `max` padrão 100) define a largura da barra com transição nos tokens de duração `default` e easing `out` (instantânea sob movimento reduzido). `indeterminate` tira o `aria-valuenow`, esconde o valor e troca a barra por um segmento de 40% que percorre o trilho em loop; como o spinner é um loader contínuo, então roda com duração fixa e continua se movendo sob `prefers-reduced-motion` (é o único sinal de progresso). `intent` colore a barra. `theme`, `testid`. JS: `value`, `max`, `indeterminate`, `showValue`.

**`ark-radio`** — mesma construção do `ark-checkbox` (um `<button role="radio">` e um `<input type="radio">` nativo oculto que agrupa por `name` no formulário; `<fieldset disabled>` funciona). O grupo são todos os `ark-radio` de mesmo `name` dentro do mesmo `<form>`, ou na mesma raiz quando não há form: marcar um desmarca os outros em silêncio (também quando você põe `checked` pelo JS ou pelo atributo), e `change` dispara só no que ganhou a marca, com `detail: { value }`; clicar no marcado não emite nada. O teclado segue o radio nativo: um único tab stop por grupo (a opção marcada, senão a primeira habilitada), as setas (as quatro) movem o foco e marcam, dando a volta e pulando as desabilitadas, Espaço marca a focada, Enter não faz nada. Ponha as opções num container com `role="radiogroup"` e um rótulo. `checked`, `disabled`, `name`, `value` (padrão `on`), `label`/`aria-label`/filhos livres/um `<label>` em volta e `helper` como no `ark-checkbox`, `size`, `intent`, `theme`, `testid`. JS: `checked`, `disabled`, `name`, `value`, `select()`, `focus()`. Dentro de um `ark-radio-group` o grupo é esse host, no lugar do `name`.

**`ark-radio-group`** — o host é o `role="radiogroup"` e os seus `ark-radio` ficam onde você os pôs. Dentro dele os rádios são um grupo por estarem nesse host, com ou sem `name` (dois grupos sem `name` numa página nunca desmarcam os rádios um do outro); fora de um grupo os rádios continuam agrupando por `name`, como antes. `value` guarda o `value` do rádio marcado: o componente o reescreve a cada mudança, atribuir marca o rádio desse valor sem emitir `change` (um valor sem rádio correspondente fica à espera de um que chegue depois), tirar (ou atribuir `""`) desmarca todos os rádios, também sem `change`, e um `checked` gravado direto num rádio o atualiza. Um grupo sem `value` desde o início adota o rádio que você marcou com `checked`. Num template Vue, só ligue `value` na tag crua quando houver um (`v-bind="plano ? { value: plano } : {}"`): o Vue grava um `value` ligado a cada render e transforma `undefined` em remoção, o que desmarca o grupo; o wrapper `ArkRadioGroup` já faz isso. O grupo emite um `change` só, com `detail: { value }`; o `change` do rádio para no grupo (um listener no próprio rádio ainda o recebe, antes do grupo). `label` desenha a legenda própria e nomeia o grupo por `aria-labelledby` (o seu `aria-label` ou `aria-labelledby` no host vencem); `helper` e `error-message` desenham a mensagem abaixo, como nos campos (o erro vence, marca `aria-invalid` e é o `aria-describedby` do grupo; `error` sozinho o marca inválido). `orientation` (`vertical`, padrão / `horizontal`: uma fila que quebra, legenda acima e mensagem abaixo), `required` (`aria-required`; o componente não valida, a lógica do seu formulário grava o `error-message`), e `name` (para o formulário: o input oculto de cada rádio o envia), `size`, `intent`, `theme` e `disabled` valem para todos os rádios, pela mesma regra do `ark-button-group`. A legenda e a mensagem são nós próprios no início do host, posicionados por `order` no CSS, então um rádio que um framework inserir depois ainda fica acima da mensagem. O teclado e a participação em formulário são os do rádio: um tab stop, setas movem e marcam. JS: `value`, `name`, `label`, `helper`, `error`, `orientation`, `required`, `disabled`, `radios`.

**`ark-scheduler`** — `view` (`week` padrão, `day`, `month`, `agenda`), `date` (data de referência, sincronizada ao navegar), `events` (atributo JSON ou propriedade JS) com `{ id?, title, start, end?, allDay?, location?, color?, intent? }`, `views` (limita o seletor, ex.: `"day,week"`), `hour-start`/`hour-end`, `slot-minutes` (15–60), `hours-format`, `lang`/`locale-json`, `theme`, `intent`. JS: `events`, `view`, `date`. Emite `ark-event-click` (`{ event, id }`), `ark-slot-click` (`{ start, end, allDay }` — clique num espaço livre ou num dia), `ark-view-change` (`{ view }`) e `ark-range-change` (`{ start, end, view }`). As views de horário posicionam os eventos por horário, resolvem sobreposições em colunas e marcam a hora atual.

**`ark-select`** — um `<select>` nativo com a grid do `ark-input` (label, campo, mensagem) e um chevron desenhado pelo componente, então teclado, leitor de tela e seletor mobile vêm de graça. As opções vêm de dados, nunca de filhos: atributo `options` (JSON) ou propriedade JS (`{ value, label, disabled?, group?, lang? }[]`; `group` gera um `<optgroup>`, e `lang` vai ao `<option>` quando o rótulo está em outro idioma que o da página, como num seletor de idioma, para o leitor de tela ler com a pronúncia certa). `label`, `placeholder` (opção vazia desabilitada e oculta, mostrada até algo ser escolhido), `value`, `name`, `size` (`xs`–`xl`), `intent`, `rounded`, `helper`, `error`/`error-message`, `disabled`, `required`, `theme`; um `aria-label` no host é espelhado no `<select>` para um campo sem rótulo visível. JS: `selectElement`, `value`, `options`, `focus()`. Emite `change` com `detail: { value }` (o change nativo não sobe uma segunda vez) e `input`.

**`ark-shape-picker`** — o host é o `role="radiogroup"` (nomeado por `label` ou pelo seu `aria-label`) com uma opção `role="radio"` por forma, renderizadas pelo componente (por padrão as dez formas do `ark-mark`; `shapes` escolhe quais e em que ordem, separadas por vírgula como em `shapes="circle,moon,cross"`, com nomes desconhecidos e repetidos descartados), cada uma um `ark-mark` desenhado em `color` (a cor atual do escopo, para o usuário ver o par real) e nomeada pelo nome localizado da forma (`lang`/`locale-json`, chaves `shapeCircle`…`shapeHexagon`, `shapeCross`, `shapePentagon`, `shapeMoon`, `shapeAsterisk`). `value` é a forma selecionada (qualquer uma das dez; uma que não é oferecida deixa nenhuma opção marcada). Mesmo teclado do `ark-color-swatches` (um tab stop, setas movem e selecionam, Home/End, Espaço ou Enter). `disabled`, `size` (`xs`–`xl`), `theme`, `testid`. Emite `change` com `detail: { value }`. JS: `value`, `shapes`, `disabled`, `select(value)` (só uma forma oferecida).

**`ark-skeleton`** — o host é o bloco (o `.ark-skeleton` do core: fundo muted suave e raio; `aria-hidden` porque não há nada para ler). Largura e altura vêm da sua `class` ou `style` (altura padrão 1rem). `rows` acima de 1 troca o bloco por essa quantidade de barras em coluna, a última mais curta; `animated` liga o brilho que varre (`.ark-skeleton-animated`: uma faixa clara percorre o bloco, com fase deslocada por bloco e por barra para nada piscar em sincronia; estático por padrão e parado sob `prefers-reduced-motion`); `rounded` (`none`–`full`, padrão o `lg` do preset), `color` (qualquer cor CSS como tint base no lugar de `muted`, para skeletons sobre superfícies coloridas), `ratio` (`16/9`, `9/16`, `1/1`, `16:9` ou um número: placeholder de imagem cuja altura segue a largura; `ratio="1/1" rounded="full"` é um avatar; ignorado com `rows`), `theme`, `testid`. Não há elemento de reveal: dê `.ark-animate-fade-in` ao conteúdo que substitui o skeleton. JS: `rows`, `animated`.

**`ark-spinner`** — o host é o `role="status"`, com o mesmo SVG do spinner do `ark-button` (o único spinner da lib) girando pelo `.ark-animate-spin` do core, que continua rodando sob `prefers-reduced-motion` porque é o único sinal de progresso. `size` (`xs`–`xl`: 0.75 a 2 rem), `intent` (token de cor; sem ele o spinner herda a cor do texto ao redor, então cabe num texto inline ou num botão colorido), `label` (texto só para leitores de tela; padrão a string `loading` de `lang`/`locale-json`), `theme`, `testid`.

**`ark-split-pane`** — o host é uma grid CSS cujas faixas vêm de `sizes` (painel, alça, painel…); os seus filhos são os painéis e ficam onde estão, auto-posicionados nas faixas de painel na ordem do DOM (o componente nunca os toca; dê a cada um o próprio `overflow`), enquanto as alças são nós próprios do componente acrescentados ao fim do host e posicionados por `grid-column`/`grid-row` explícitos. `direction` (`horizontal`, padrão, lado a lado / `vertical`, empilhados); `sizes` é uma lista de percentuais separados por vírgula na ordem dos filhos (faltantes dividem o que sobra, a lista é normalizada para 100) e é a fonte da verdade: cada arrasto ou tecla a reescreve. `data-min`/`data-max` num filho o limitam, em percentual (`20`, `20%`) ou em pixels (`200px`). Cada alça é um `role="separator"` focável (nomeado pela string `resize` de `lang`/`locale-json`, `aria-orientation`, `aria-valuenow/min/max` do painel anterior): as setas no eixo movem 2 pontos (10 com Shift), Home/End vão aos limites, o arrasto usa pointer capture (`data-ark-dragging` no host desliga os eventos de ponteiro dentro dos painéis enquanto dura); a faixa da alça mostra um divisor de 1px com um pegador no meio, que fica `primary` em hover, foco e arrasto. Um split pane divide num eixo só: para uma árvore ao lado de um editor empilhado sobre a resposta, ponha um `ark-split-pane` vertical como segundo painel de um horizontal (o interno não precisa de tamanho próprio). Nada anima: redimensionar é interação de alta frequência. Emite `ark-resize` com `detail: { sizes }` a cada mudança; persistir é do app. `theme`, `testid`. JS: `sizes` (number[]), `direction`. A faixa da alça é `--ark-split-pane-handle` (0.375 rem).

**`ark-status-dot`** — o host é o ponto (fundo do `intent`, padrão `neutral`, que os apps usam para "verificando"; `success`, `warning`, `danger`, `info`...). `label` o transforma num `role="img"` com esse nome acessível; sem `label` fica `aria-hidden`, para o caso comum em que o texto ao lado já diz o estado. `size` (`xs`–`xl`: 0.375 a 1 rem), `theme`, `testid`. Estático por design: nunca pulsa (um loop de atenção num indicador de status cai na WCAG 2.2.2).

**`ark-switch`** — `checked`, `disabled`, `size`, `intent`, `theme`, `color`, `labels` (mostra ON/OFF no trilho; textos customizáveis via `label-on`/`label-off`), `icons` (✓/✕ no polegar), `label` (rótulo acessível), `name`/`value` (submissão em formulário quando marcado). Filhos viram um rótulo visível (`<ark-switch>Avisos por e-mail</ark-switch>`): o host vira uma linha com o trilho primeiro, o texto dá o nome ao switch por `aria-labelledby` e um clique nele alterna, como num `<label>` (um link ou controle dentro fica com o próprio comportamento; `aria-label` e `label` continuam valendo para o nome). `label-position="start"` põe o texto antes do trilho (a linha de uma tela de configurações: num host esticado, `class="w-full"`, o trilho vai para a ponta). `helper` acrescenta uma dica abaixo do rótulo, que descreve o trilho por `aria-describedby` e alterna como o resto do host, como no `ark-checkbox`; com ela o host vira uma grid de duas colunas (trilho numa, rótulo e dica empilhados na outra), também sem filhos, quando a dica fica ao lado do trilho. Sem filhos, `helper` ou `label-position` nada muda. Emite `change` com `detail: { checked }`. JS: `checked`, `toggle()`.

**`ark-toggle`** — `pressed`, `value`, `disabled`, `size`, `intent`, `theme`. Emite `change` com `detail: { pressed, value }`. JS: `pressed`, `disabled`, `value`, `toggle()`.

**`ark-toggle-group`** — `value` (valor(es) selecionado(s), sincronizado com os itens), `multiple`, `disabled`, `size`, `intent`, `theme`. Emite `change` com `detail: { value }` (exclusivo) ou `detail: { values }` (múltiplo). JS: `value` (separado por vírgula com `multiple`), `values` (array, somente leitura). O host é uma linha `inline-flex`; `flex-wrap: wrap` nele (na sua `class` ou no `style`) quebra as opções em mais linhas num contêiner estreito.

**`ark-card`** — o host é o container (fundo `surface`, `border`, cantos por `rounded`, padrão `lg`) disposto como grid pelo `components.css`, então os seus filhos ficam onde estão: `slot="header"` e `slot="actions"` dividem a linha de cima (título à esquerda, ações à direita, centrados na vertical; o `slot="actions"` é um contêiner só, um `<div>` com os seus botões, porque dois filhos com esse slot caem na mesma célula e se sobrepõem), todo filho sem slot é o corpo, na largura toda e na ordem do DOM, e `slot="footer"` é sempre a última linha, com um divisor acima. `heading` renderiza um `h2` próprio no início do host (`heading-level` de 1 a 6 escolhe outro nível); com ele, o seu filho `slot="header"` vira a linha seguinte do cabeçalho, na largura toda (descrição, filtros, abas). `padding` (`none`/`sm`/`md`, padrão/`lg` = 0 / 0.75 / 1 / 1.5 rem) define juntos o padding do host e o gap entre as linhas; com `none` o conteúdo encosta nas bordas (ponha `overflow-hidden` na `class` do host para recortar uma imagem nos cantos e dê padding ao texto você mesmo). `wrap-actions` (opt-in, só CSS): ações que não cabem ao lado do título quebram em mais linhas, encostadas à direita, e o `h2` próprio nunca fica mais estreito que a sua maior palavra (também numa página com `overflow-wrap: anywhere`, que o `h2` troca por `break-word`), em vez de o título ser esmagado até sumir; um `slot="header"` continua encolhendo como antes (um título truncado segue truncando), a menos que você dê a ele `min-width: auto`, e uma palavra mais larga que o card (uma URL, um nome de arquivo) alarga a coluna do título, então quebre-a no seu conteúdo. Esticado numa linha mais alta (uma grade de cards, altura no host), um card com `heading`, cabeçalho, ações ou rodapé mantém o título no topo: um corpo de um filho só fica com a sobra (um gráfico ou uma lista preenche o card) e o rodapé encosta no fundo, enquanto um corpo de vários filhos fica junto no topo com a sobra embaixo, então embrulhe-os num elemento para prender o rodapé. Um card só de corpo continua repartindo a altura entre os filhos, como antes. `theme`, `testid`. Não é interativo e não tem role próprio; adicione `role="region"` e um rótulo quando o cartão for um landmark.

Por que só um corpo de um filho estica: as linhas de corpo da grid do card são os seus próprios filhos, quantos você declarar, e o CSS só dimensiona uma linha pela posição, nunca "a última antes do rodapé" de uma contagem que ele não conhece. Com um filho só o host sabe qual linha é e dá a ela a sobra; com vários teria de adivinhar qual deve crescer, então os mantém juntos no topo. Para prender o rodapé de um card esticado seja qual for o conteúdo, faça do corpo um elemento só e disponha o conteúdo dentro dele:

```html
<ark-card heading="Uso" style="height: 100%">
  <!-- o único filho de corpo: fica com a sobra, então o rodapé encosta no fundo -->
  <div style="display: grid; align-content: start; gap: 0.75rem">
    <p>Resumo</p>
    <ul>
      <li>…</li>
    </ul>
  </div>
  <span slot="footer">Atualizado há 5 min</span>
</ark-card>
```

**`ark-carousel`** — o host é o container rolável e seus slides são filhos diretos dele. `slides-per-view`, `gap` (px), `start-index`, `loop`, `autoplay`/`autoplay-delay` (pausa em hover/foco e desliga com `prefers-reduced-motion`), `show-dots`/`show-arrows` (`"false"` esconde), `drag-free`, `snap` (`mandatory`/`proximity`), `intent`, `accent-color`, `theme`. API JS: `index`, `slides`, `next()`, `prev()`. Emite `ark-slide-change` com `detail: { index }`.

**`ark-tabs`** — o host é o `role="tablist"`; as `ark-tab` filhas ficam onde estão e um filho com `slot="actions"` (ex.: um `ark-button` "+") vai para o fim da faixa só por CSS. `value` (aba ativa; sem ele a primeira habilitada é selecionada em silêncio), `variant` (`underline`, padrão / `chips` / `editor`), `size`, `intent`, `rounded` (cantos das abas: chips com padrão `full`, `editor` arredonda só o topo, as demais padrão `none`), `fill` (pintura da aba ativa: `none`, `soft` ou `solid` com a cor do intent e texto de contraste; chips com padrão `soft`, as demais `none`), `theme`, `label` (→ `aria-label`), `lang`/`locale-json` (rótulos de fechar e não salvo); `variant`, `size`, `intent`, `rounded`, `fill`, `theme` e idioma são propagados às abas. Teclado: setas, Home e End movem o foco e selecionam (ativação automática), pulando abas desabilitadas. Emite `change` com `detail: { value }` (o evento da própria aba é consumido). Quando a aba ativa é removida do DOM, a vizinha assume e `change` dispara. Sem motion na troca. Os painéis são do app: aponte cada aba ao seu painel com `controls`. JS: `value`.

**`ark-tab`** — o host é o `role="tab"` (`aria-selected`, `tabindex` roving); ícone, texto ou badge entram como filhos. `value`, `disabled`, `controls` (→ `aria-controls`) e, na variante `editor`, `closable` (botão de fechar fora da ordem de Tab, mais clique do meio e tecla Delete; emite `ark-close` com `detail: { value }` — remover a aba é do app) e `dirty` (ponto estático de não salvo, nomeado para leitores de tela). JS: `value`, `selected`, `disabled`, `closable`, `dirty`, `select()`, `close()`.

**`ark-textarea`** — a grid e os atributos do `ark-input` (`label`, `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message`, `disabled`, `required`, `readonly`) num `<textarea>` nativo, mais `rows` (padrão 3), `autosize` (cresce com o conteúdo, a partir de uma linha ou, com um `rows` explícito, dessas linhas como altura mínima: `field-sizing: content` onde existe, medição por JS no resto), `max-rows` (com `autosize`, até quantas linhas cresce antes de rolar; sem ele não há teto), `monospace` e `resize` (`vertical`, padrão, ou `none`). Uma linha alinha com um `ark-input` do mesmo tamanho. Quando o host é mais alto que o conteúdo (linha esticada, altura no host) e tem rótulo ou mensagem visível, a caixa cresce entre os dois; com `autosize` ela fica na altura do conteúdo e a sobra vai para baixo. Atributos nativos espelhados: `autocomplete`, `autofocus`, `maxlength`, `minlength`, `spellcheck`, `wrap`, `aria-label`. Emite `input`/`change` nativos; JS: `value`, `textareaElement`, `focus()`.

**`ark-time`** — renderiza o próprio `<time datetime>` (não ponha filhos nele) com o texto do `Intl`, sem dependência. `datetime` aceita ISO com fuso (`2026-09-15T13:00:00Z`), hora local sem fuso (`2026-09-15T10:00`, lida no fuso local como toda data da biblioteca) ou só a data (`2026-09-15`, contada em dias de calendário: "ontem", "em 3 dias"); a propriedade `datetime` também aceita um `Date` ou milissegundos e grava o ISO. `format`: `relative` (padrão: "há 3 minutos", "em 2 horas", "agora"), `date` (`dateStyle: "medium"`), `time` (`timeStyle: "short"`) ou `datetime` (os dois; só a data mostra só a data). O texto relativo se atualiza sozinho no próximo ponto em que muda (a cada segundo no primeiro minuto, a cada minuto na primeira hora, e assim por diante, conferido pelo menos de hora em hora) e para enquanto o elemento está fora do documento ou a aba está oculta, alcançando ao voltar. O `<time>` leva a data completa no `title`, a menos que o host tenha um `title` próprio. O idioma é o `lang` (qualquer tag que o `Intl` conheça, como `pt-BR` ou `ja`; uma desconhecida cai no inglês), senão o de `setArkLocale()`, senão `en`. `testid`. JS: `datetime`, `format`, `date` (um `Date`, ou `null` sem um `datetime` válido).

**`ark-tooltip`** — o host envolve o gatilho (seu primeiro filho sem `slot`; ele precisa ser focável por conta própria, ex.: um botão) sem movê-lo e cria o balão (`role="tooltip"`, `popover="manual"`, então escapa de `overflow` e fica no top layer). Texto por `content`, ou conteúdo rico num filho com `slot="content"`, que passa a ser o próprio balão (o componente só acrescenta `popover`, `role`, um `id` e o hook nele; o visual vem do CSS). `side` (`top`, padrão / `bottom` / `left` / `right`; vira quando não cabe), `delay` (ms antes de abrir no hover, padrão 200; o foco abre na hora), `open` (refletido), `theme`, `testid`. Abre em hover e foco; fecha ao perder o foco, com Esc, no pointerdown no gatilho e 100 ms depois que o ponteiro sai do gatilho e do balão (tempo para atravessar o espaço entre eles: parar sobre o balão o mantém aberto). O gatilho recebe `aria-describedby` apontando para o balão. Motion: entra com `fade` em `quick`, sem animação de saída. JS: `show()`, `hide()`.

**`ark-tree`** — uma árvore declarativa: aninhe `ark-tree-item`s como itens de lista, e eles ficam onde você os pôs. A linha própria de cada item é o `treeitem` (uma árvore plana para a tecnologia assistiva, com `aria-level`, `aria-setsize` e `aria-posinset` explícitos, e o host em `role="none"`), nomeado pelo `label`; `aria-label` (ou `label`) nomeia a árvore. `selection`: `none` (padrão: só navega, expande e ativa), `single` (o clique na linha seleciona e ativa, como abrir um arquivo num explorador; `aria-selected`) ou `multiple` (clique ou Espaço alternam a linha; `aria-multiselectable`); `checkboxes` (com `multiple`) põe uma caixa em cada nó, que marca em vez de selecionar (`aria-checked`; o clique no rótulo continua ativando), e `propagate` faz o pai marcar os descendentes habilitados e ficar `mixed` quando só parte está marcada (um descendente desabilitado mantém o estado e conta para o `mixed`; filhos carregados depois sob um pai todo marcado chegam marcados). `value` guarda os valores selecionados ou marcados (um valor em `single`, uma lista JSON em `multiple`), reescrito pelo componente e aplicado quando você o define; o `values` em JS recebe e devolve a lista. Teclado (padrão WAI-ARIA de tree): um tab stop só, ↑/↓ pelos itens visíveis, → expande ou entra no primeiro filho, ← recolhe ou volta ao pai, Home/End, digitar leva ao próximo item cujo rótulo começa com as letras, `*` expande os irmãos, Enter ativa, Espaço seleciona ou marca; recolher um ramo com o foco dentro leva foco e tab stop ao item recolhido. Eventos (na árvore): `ark-toggle` com `detail: { value, expanded, item }` (no `lazy`, acrescente os filhos quando `expanded` for `true`), `ark-selection-change` com `detail: { values, value }` (`value` em `single`) e `ark-activate` com `detail: { value, item }`. `size` e `theme` são propagados aos itens. `icons` (opt-in) escolhe os ícones dos nós: sem ele cada nó mostra só o `slot="icon"` que você puser; `files` desenha os ícones próprios do componente, em contorno, nos nós sem `slot="icon"` (pasta nos ramos, aberta enquanto expandido, e arquivo nas folhas); `none` esconde todos os ícones, os seus inclusive, e deixa só os nomes (o chevron fica: é ele que expande). `icon-color` pinta os ícones: um intent (`primary` … `neutral`, o token, então segue a sua marca e o tema), `current` (a cor do texto da árvore) ou qualquer cor CSS; o componente a grava em `--ark-tree-icon-color` no host, que o seu CSS também pode definir. Os ícones próprios usam o token `fg-muted` por padrão; o seu `slot="icon"` só recebe a cor enquanto o atributo existe, e um que você mesmo pinta fica com a cor dele. O lado do ícone acompanha o `size` (14 / 14 / 16 / 18 / 20 px) por `--ark-tree-icon-size`, que cada item define: os ícones próprios a usam, e o seu ícone a lê (`width: var(--ark-tree-icon-size)`), porque o componente não dimensiona nó que não é dele. JS: `toggleItem(item, expanded?)`, `focusItem(item)`, `items`, `visibleItems`, `icons`, `iconColor`. Setas com Alt, Ctrl ou Meta ficam com o navegador (Alt+← volta a página). Não há `lang`: a árvore não tem strings próprias. Tamanho: cerca de 2.000 nós abertos montam em menos de um segundo, e em cerca de 3,5 s com a árvore de acessibilidade do Chromium ativa (um leitor de tela rodando); com milhares de nós, renderize só os ramos abertos (`lazy`). Os ícones próprios são um nó a mais por item: medido sem a árvore de acessibilidade, cerca de 2.200 nós abertos montam em 147 ms com ou sem os atributos novos e em 231 ms com `icons="files"`.

**`ark-tree-item`** — o nó: `value` (a identidade nos eventos e no `value` da árvore), `label` (o texto, também usado na busca por digitação), `slot="icon"` antes do rótulo e `slot="trailing"` para badges no fim da linha, e os `ark-tree-item` filhos como subitens (também através de wrappers de framework). `icon` (`folder`, `file` ou `none`) nomeia o ícone próprio deste nó no lugar da escolha automática de `icons="files"` (uma pasta vazia é uma folha, então dê a ela `icon="folder"`), e vale sem `icons` na árvore; um filho `slot="icon"` continua vindo primeiro, e o `icons="none"` da árvore esconde todos. `expanded` (refletido quando o usuário alterna), `lazy` (mostra o chevron ainda sem filhos), `loading` (spinner no lugar do chevron e `aria-busy` na linha), `selected` e `checked` (`true`, `false` ou `mixed`; reescritos pela árvore), `disabled` (fora da seleção e da ativação; o foco ainda passa por ele, como pede o padrão ARIA). A linha, o chevron, a caixa, o rótulo e o ícone próprio (criado só quando pedido) são nós do componente; o seu ícone e o trailing ficam onde você os pôs e a grid do CSS os posiciona. O conteúdo do trailing vira a descrição da linha (`aria-describedby`; o componente dá a ele um `id` quando não tem), então um badge como `M` é lido quando as setas chegam à linha. Um controle no `slot="trailing"` (um botão) é um controle à parte, ao lado do treeitem: o axe acusa (`aria-required-children` na árvore), então deixe o trailing para badges e texto e ofereça ações por menu ou teclado. JS: `value`, `label`, `icon`, `expanded`, `lazy`, `loading`, `selected`, `checked`, `disabled`, `parentItem`, `childItems`, `isBranch`, `rowElement`, `iconElement`.

**`ark-toaster`** — `position` (`top-left` … `bottom-right`), `rich-colors`, `close-button` (`"false"` esconde), `max-visible` (padrão 4; o resto espera numa fila com o relógio parado e aparece conforme os outros saem), `duration` (ms, padrão 4000; `0` mantém o toast até ser fechado; um toast `loading` nunca se dispensa sozinho), `lang`, `theme`. Alimentado pelo serviço `toast` do `@tooark/core` (`toast(title, options)`, `toast.success(title, options)`, …) ou pelos métodos do próprio elemento, `toast({ title, ... })` (um único objeto de opções) e `dismiss(id?)`; emite `ark-toast-action` com `detail: { id, actionId }` ao clicar num botão de ação. A pilha é um `popover="manual"` do próprio componente: entra no top layer com o primeiro toast e sai quando esvazia, sem `z-index` para disputar, e reentra a cada toast novo, então um toast disparado com um diálogo, gaveta ou menu aberto aparece por cima do scrim deles (salvo com o foco do teclado dentro de um toast, que fica onde está).

**`announce()`** (serviço, `@tooark/core`) — `announce(text, politeness = "polite")` fala uma mensagem para leitores de tela por uma única live region oculta anexada ao `document.body` (`data-ark="announcer"`, com um filho `role="status"` para `polite` e um `role="alert"` para `assertive`). Os componentes o usam para anunciar um resultado no lugar (o `status` de um botão, "copiado", arquivos escolhidos) sem criar live regions dentro do host, onde o texto entraria no nome acessível do controle. Chamar de novo com o mesmo texto anuncia de novo; sem DOM é no-op.

**`ark-code-editor`** (`@tooark/code`) — um editor CodeMirror 6 como Custom Element; os pacotes do CodeMirror são peer dependencies (`@codemirror/state`, `view`, `language`, `commands`, `search`, `autocomplete`, `lang-json`, `lang-javascript`, `lang-yaml`, `@lezer/highlight`), para a página ter uma única cópia de cada. O texto vai pela propriedade `value` (um atributo `value` dá o valor inicial) e volta em `change` com `detail: { value }` a cada edição do usuário (não em `value` programático). `language` (`json` / `javascript` / `yaml` / `text`, padrão), `readonly` (sem cursor de edição nem realce da linha ativa; busca e dobra continuam), `placeholder`, `min-height` (comprimento CSS, padrão `8rem`; o editor cresce com o conteúdo), `max-height` (comprimento CSS, desligado por padrão; acima dele o conteúdo rola dentro do editor, com as calhas, como numa visão de arquivo; o `min-height` vence quando maior, como no CSS, e `single-line` o ignora), `line-numbers` e `fold` (ligados por padrão, `"false"` desliga), `wrap` (quebra de linha visual em vez de rolagem horizontal), `theme` (`auto`, padrão, segue o `color-scheme` da página e a troca em tempo de execução via `observeColorScheme`; `light`/`dark` forçam um lado), `testid`. **Recuo:** `indent-style` (`space`, padrão / `tab`) e `indent-size` (espaços por nível ou largura visual da tabulação, padrão 2) valem para Tab, Enter e o formatador de JSON; `tab-indent` vem ligado (Tab recua, Shift+Tab desfaz o recuo) e quem navega por teclado sai do editor com Esc e depois Tab (tab-focus mode do CodeMirror, também alternado por Ctrl+M, Shift+Alt+M no macOS), ou use `tab-indent="false"` para o Tab ser só navegação. **Fim de linha:** `line-ending` (`auto`, padrão / `lf` / `crlf`) vale só na fronteira — por dentro o documento é LF, `value` e `change` saem com o fim de linha configurado, e `auto` mantém o do último valor atribuído (`resolvedLineEnding` diz qual). **Completions:** as da própria linguagem (palavras-chave, snippets e variáveis locais em JavaScript), `variableKeys` (oferecidas depois de `{{`, inserindo `{{chave}}` ou só a chave quando o `}}` já está lá), `completions` (palavras oferecidas em qualquer linguagem, no formato do CodeMirror `{ label, type?, detail?, info?, apply? }`), `completionSource` (uma fonte do CodeMirror com contexto); Ctrl+Espaço abre a lista a qualquer momento e `autocomplete="false"` desliga tudo. **Formatação:** `format()` (também Shift+Alt+F) reformata o documento — JSON funciona de fábrica com o recuo configurado, outras linguagens precisam da propriedade JS `formatter(value, language)` (Prettier, js-yaml… fica no app); JSON inválido ou formatador que lança emite `ark-format-error` com `detail: { error }` e resolve `false`; uma formatação bem-sucedida é uma edição de verdade (histórico, `change`), e `canFormat` diz se a linguagem atual tem como ser formatada. **Extras opcionais**, desligados até você usar: `variables` (`{ key, scope?, intent?, value? }[]`) pinta cada `{{chave}}` com as cores suaves do intent (também dentro de strings JSON), com tooltip do escopo e do valor, `mark-unknown-variables` marca em `danger` um `{{chave}}` fora de `variables`/`variableKeys`, e `single-line` vira um campo de uma linha na altura de controle de `size` (`xs`–`xl`, que também escala a fonte), em que Enter emite `ark-submit` com `detail: { value }`. A propriedade JS `extensions`, também desligada por padrão, soma extensões do CodeMirror suas depois das da biblioteca sem recriar o editor: uma gramática que ela não traz, como uma que o `@codemirror/language-data` carrega pelo nome do arquivo (deixe `language` em `text`; as cores de sintaxe continuam as da biblioteca), uma calha como a de blame (`Prec.high` a põe antes da numeração), decorações; mantenha a referência estável, porque uma nova reconfigura. `aria-label` nomeia o conteúdo editável (o `role="textbox"` do CodeMirror). JS: `value`, `variableKeys`, `variables`, `markUnknownVariables`, `singleLine`, `size`, `completions`, `completionSource`, `formatter`, `extensions`, `format()`, `canFormat`, `language`, `readonly`, `wrap`, `lineNumbers`, `fold`, `placeholder`, `minHeight`, `maxHeight`, `indentStyle`, `indentSize`, `lineEnding`, `resolvedLineEnding`, `tabIndent`, `autocomplete`, `theme`, `resolvedTheme`, `view` (o `EditorView`), `focus()`. Teclas: Ctrl/Cmd+F busca, Ctrl/Cmd+Z desfaz, Ctrl+Y refaz (Cmd+Shift+Z no macOS), Ctrl+Espaço completions, Shift+Alt+F formatar. O chrome (superfície, texto, bordas, seleção, calhas, tooltips) lê os tokens `--ark-color-*` com fallback, então acompanha o tema do app mesmo sem o CSS do `@tooark/web-components`; as cores de sintaxe são os tokens `--ark-syntax-*` (`keyword`, `string`, `number`, `property`, `comment`, `atom`, `punctuation`, `invalid`, cada um um par `light-dark()` resolvido pelo tema do próprio editor) com os mesmos valores embutidos como fallback, então sobrescrever um num ancestral tematiza o editor, e o seu próprio `<pre>` pode usá-los também. `createCodeEditor(parent, options)` do mesmo pacote dá o engine imperativo (`getValue`/`setValue`, todo `set*`, `format`, `resolvedTheme`, `focus`, `destroy`, `view`) sem o elemento, e `registerTooarkCode()` o define.

**`ark-wysiwyg-editor`** / **`ark-wysiwyg-viewer`** (`@tooark/wysiwyg`) — editor Tiptap e viewer somente leitura com o mesmo schema. O conteúdo trafega como JSON do Tiptap pela propriedade `content` (nunca HTML cru) e é sanitizado ao entrar por `sanitizeWysiwygContent`: nós e marcas fora do schema caem, `href`/`src`/`poster` precisam ser http(s), mailto, tel ou caminho relativo começando por `/`, `#`, `?`, `./` ou `../` (`javascript:`, `data:`, `blob:` e qualquer outro esquema são removidos), cores precisam ser hex, nome CSS ou `rgb()`/`hsl()` e `textAlign`/`level` de título ficam nos valores previstos; o viewer renderiza links com `target="_blank"` e `rel="noopener noreferrer nofollow"`. Atribuir `content` não emite `ark-wysiwyg-change` e fica fora do histórico de desfazer. `toolbar` lista grupos e/ou itens separados por vírgula: `style` (um select nativo com Normal e Título 1–4), `marks` (negrito, itálico, sublinhado, tachado, código), `color` (cor do texto e marca-texto, cada um uma paleta em popover alimentada por `colors`/`highlights`, arrays JSON de cores nessas mesmas formas (hex, nome CSS, `rgb()`/`hsl()`; o resto é descartado), padrão nove tons médios e seis pastéis), `align` (esquerda, centro, direita, justificado), `lists` (marcadores, numerada, aumentar/diminuir recuo — só em itens de lista), `link` (popover com a URL, aplica à seleção ou insere a URL como texto linkado, acrescenta `https://` a um host sem esquema, recusa esquemas inseguros na hora), `media` (imagem, vídeo), `blocks` (citação, linha), `clear` (limpar formatação) e `history`; `all` liga tudo, `none` esconde a barra, e o padrão é `style,marks,lists,link,blocks,clear,history`. A toolbar é um `role="toolbar"` com um único tab stop (setas, Home/End) e os rótulos seguem `lang` (`en`, padrão / `pt` / `es`) com override por `locale-json`. **Mídia nunca vira base64:** atribua à propriedade JS `uploadFile(file, kind)` uma função que guarda o arquivo onde o app quiser e resolve `{ src, alt?, title?, poster? }`; o editor insere só essa URL (validada pela mesma lista de permissão). Sem o gancho o grupo `media` não é renderizado nem com `all`, e arquivos colados ou arrastados são recusados; `max-file-size` (bytes, padrão 10 MiB) e tipos não suportados também são recusados, sempre com `ark-wysiwyg-upload-error` (`detail: { reason, file, error? }`, motivos `no-uploader`, `unsupported-type`, `too-large`, `invalid-src`, `failed`). `theme` (`auto`, padrão, segue a página em tempo de execução / `light` / `dark`), `placeholder`, `editable="false"`, `aria-label` (nomeia o conteúdo editável, o `role="textbox"` do Tiptap), `testid` (`data-ark="wysiwyg-editor"` na raiz, com as partes `-toolbar` e `-content`; o viewer `wysiwyg-viewer` e `-content`). JS: `content`, `uploadFile`, `colors`, `highlights`, `insertFile(file)`, `resolvedTheme`, `editor` (a instância do Tiptap); o mesmo engine existe sem os elementos em `createWysiwygEditor`/`createWysiwygViewer`.

**Helpers de overlay** (`@tooark/core`) — as peças de que o `ark-dialog` é feito, para overlays seus sobre a Popover API. `trapFocus(container, { initial, returnTo, onOutsidePointer })` devolve a função que libera: Tab e Shift+Tab ciclam pelos focáveis do container, foco que escapa volta para onde estava (o último elemento focado dentro do container, `initial` quando ele saiu, e o próprio container quando ele não aceita o foco agora ou não há nenhum dos dois), eventos de ponteiro iniciados fora são cancelados na captura pelo gesto inteiro, então um clique no scrim que fecha o overlay nunca ativa o que está atrás (o `pointerdown` é reportado em `onOutsidePointer`, por exemplo para fechar no scrim), popovers abertos por cima ficam de fora (um que está na saída do `closePopover` ainda recebe o ponteiro, mas já não segura o foco), traps aninhados empilham, o container de um trap de baixo não é um popover por cima (o diálogo que abriu outro não recebe nem o foco nem os cliques enquanto o outro está aberto), e liberar devolve o foco a `returnTo` (padrão: o elemento focado na ativação) um microtask depois, e só enquanto o foco ainda está dentro do container ou no `<body>`: um framework que refoca ao fim da própria atualização o elemento focado antes dela (o React, a cada commit) desfaria uma devolução síncrona, e o app que levou o foco a outro lugar de propósito fica com a escolha dele. Quando `returnTo` já não aceita o foco (está num overlay que fechou, é o painel de um, ou saiu da página), vale o `returnTo` do trap desse overlay; um `returnTo` no `<body>` conta como nenhum, e vale o elemento focado na ativação quando está fora do container. Enquanto está ativo, o trap também leva o foco ao container quando o elemento focado deixa de aceitá-lo: saiu da página ou deixou de ser desenhado (uma linha removida junto com o botão dela), ficou `disabled` (um campo durante o envio, um `<fieldset disabled>`), entrou em `inert`, ou perdeu o que o tornava focável; o navegador larga o foco no `<body>`, onde o Esc já não chega ao overlay. O container, nunca outro controle, então um Enter repetido durante o envio não aciona nada; quando o elemento estava num popover por cima (o botão de um toast), o foco volta para onde estava. Um `blur()` seu, com o elemento ainda focável, fica como está. Um Esc com o foco no `<body>` (depois desse `blur()`, ou de um clique no texto de um toast) é entregue ao container como um `keydown`, salvo se você já o cancelou ou com um popover de light dismiss aberto, que o navegador fecha com ele. `openPopover(host, preset, options)` chama `showPopover()` e depois `arkEnter`; `closePopover(host, preset, options)` roda `arkExit` primeiro e só então `hidePopover()`, e reabrir durante a saída a abandona. `openPopover` também aceita `lockScroll: true` (o que `ark-dialog`, `ark-drawer` e `ark-command-palette` passam): `lockScroll(owner)` põe `overflow: hidden` no elemento raiz mais um `padding-right` do tamanho da barra de rolagem que sumiu (também exposto em `--ark-scroll-lock-gap`, para elementos fixos seus compensarem), contado por dono para overlays empilhados só liberarem quando o último fecha; `closePopover` chama `unlockScroll(owner)` depois da saída, e `isScrollLocked()` diz se alguma trava está ativa. `positionAnchored(panel, anchor, { side, align, offset, padding, onPlace })` posiciona um painel `position: fixed` junto de um elemento ou de um retângulo `{ x, y, width, height }` a partir de `getBoundingClientRect()`: lado preferido com flip para o oposto quando não cabe, alinhamento ao longo do lado, deslizamento para caber na viewport; escreve `left`/`top`/`transform-origin` inline mais `data-ark-side`/`data-ark-align` no painel e reposiciona em scroll e resize até o dispose devolvido rodar. `focusableElements(root)` lista os elementos tabuláveis na ordem do DOM; `isPopoverOpen(host)` verifica `:popover-open`.

---

## 🎬 Sistema de motion

O motion é desenhado em três camadas para que os componentes permaneçam livres de dependências:

1. **Tokens** (`@tooark/tokens`) — durações (`--ark-duration-none/instant/quick/default/moderate/gentle/slow/long`, 0–1000 ms), curvas de easing (`--ark-ease-linear/standard/in/out/in-out/overshoot/sheet`) e a distância de slide. `prefers-reduced-motion` zera todas as durações na camada de tokens, cobrindo o sistema inteiro de uma vez.
2. **Presets** (`@tooark/core`) — keyframes/classes CSS sem dependência (`.ark-animate-*`, `.ark-skeleton`, `.ark-skeleton-animated`) e helpers WAAPI (`arkEnter`, `arkExit`) usados pelos próprios componentes (ex.: entrada/saída dos toasts).
3. **`@tooark/motion`** (opt-in) — `arkStaggerEnter`, `arkReveal`, `arkFlip` e `arkSwipe` sobre a lib Motion, para física de spring e efeitos dirigidos por scroll. Só os projetos que instalam este pacote pagam pela lib.

Escala de duração (`ArkDuration` no TypeScript, `--ark-duration-*` no CSS, `ARK_DURATION_MS` como espelho em JS). `arkEnter`, `arkExit`, `arkStaggerEnter` e `arkReveal` aceitam tanto o nome do token quanto um número em milissegundos (`arkFlip` e `arkSwipe` rodam sobre springs e não recebem duração):

| Token      | Valor   | Uso previsto                                                                                     |
| ---------- | ------- | ------------------------------------------------------------------------------------------------ |
| `none`     | 0 ms    | Desliga a transição (o valor de todos os tokens sob `prefers-reduced-motion`).                   |
| `instant`  | 75 ms   | Microfeedback: hover, anel de foco, estado pressionado.                                          |
| `quick`    | 150 ms  | Elementos pequenos entrando/saindo (popups, tooltips, grade do calendário); padrão do `arkExit`. |
| `default`  | 250 ms  | Padrão do `arkEnter`, do `arkStaggerEnter` e dos presets `.ark-animate-*`.                       |
| `moderate` | 350 ms  | Feedback enfático (`.ark-animate-shake`) e superfícies médias.                                   |
| `gentle`   | 500 ms  | Superfícies grandes: painéis, drawers, transições de página.                                     |
| `slow`     | 700 ms  | Sequências orquestradas e listas escalonadas.                                                    |
| `long`     | 1000 ms | Movimento ambiente: loaders, progresso, loops de atenção.                                        |

Curvas de easing (`ArkEasing` no TypeScript, `--ark-ease-*` no CSS, `ARK_EASING_CSS` como espelho em JS). Os helpers também aceitam qualquer timing function CSS em string, e o `@tooark/motion` aceita um array cubic-bezier ou um nome de easing da lib Motion:

| Token       | Curva                               | Uso previsto                                                                                                            |
| ----------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `linear`    | `linear`                            | Movimento contínuo: spinners, progresso, marquee (`.ark-animate-spin`).                                                 |
| `standard`  | `cubic-bezier(0.2, 0, 0, 1)`        | Transições gerais entre estados na tela.                                                                                |
| `in`        | `cubic-bezier(0.4, 0, 1, 1)`        | Saídas acelerando; padrão do `arkExit`.                                                                                 |
| `out`       | `cubic-bezier(0, 0, 0.2, 1)`        | Entradas desacelerando; padrão do `arkEnter`, do `arkStaggerEnter` e dos presets `.ark-animate-*`.                      |
| `in-out`    | `cubic-bezier(0.4, 0, 0.2, 1)`      | Mudanças de estado simétricas: shake, pulse.                                                                            |
| `overshoot` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Entradas lúdicas que passam do ponto e acomodam (`backOut` do Motion). Para física de mola real use o `@tooark/motion`. |
| `sheet`     | `cubic-bezier(0.32, 0.72, 0, 1)`    | Sheets e gavetas deslizando de uma borda: começo rápido, acomodação longa (entrada do `ark-drawer`).                    |

Os motion tokens são sobrescritos como os tokens de cor, com uma regra: mantenha overrides de duração dentro de `@media (prefers-reduced-motion: no-preference)`. Sob `reduce` tudo o que a lib anima para: os presets `.ark-animate-*` e os helpers JS rodam a 0 ms independentemente de `--ark-animate-duration` ou de um token redefinido em uma subárvore, e os tokens da raiz são zerados com `!important`, então um override em `:root` escrito fora dessa media query não reativa o seu próprio CSS baseado em tokens por acidente. Para manter movimento de propósito sob movimento reduzido, declare o token com `!important` (ou sobrescreva o `animation-duration` do preset) dentro do seu próprio bloco `@media (prefers-reduced-motion: reduce)`.

```css
@media (prefers-reduced-motion: no-preference) {
  :root {
    --ark-duration-default: 180ms;
    --ark-duration-gentle: 400ms;
  }
}
```

**Loaders contínuos são isentos de movimento reduzido por design.** `.ark-animate-spin` (o spinner dentro do `ark-button`) continua girando sob `prefers-reduced-motion: reduce`: movimento reduzido existe para evitar desconforto vestibular, que uma rotação de 1 em não causa, enquanto um spinner congelado tira o único sinal de que algo está em andamento. Por isso ele também roda com `1s` fixo em vez de um token de duração, que o zeramento congelaria. Os loops de atenção param: `.ark-animate-shake`, `.ark-animate-pulse` e `.ark-skeleton-animated`. O `.ark-skeleton` em si é estático por padrão (um pulso infinito na única região sem nada para ler chama o olho e cai na WCAG 2.2.2); adicione `.ark-skeleton-animated` para optar pelo brilho que varre (uma faixa clara da esquerda para a direita; desloque a fase com um `animation-delay` negativo para vizinhos não varrerem juntos, como o `ark-skeleton` faz), e dê `.ark-animate-fade-in` ao conteúdo que substitui um skeleton se quiser que ele entre suavemente.

---

## 🚀 Começando

Exemplos vivos de todos os componentes, com os testes de interação, estão no **[Storybook](https://tooark.com/web-components/)**. As seções abaixo vão da instalação a um formulário funcionando em cada ambiente.

### Instalação

Todos os pacotes `@tooark/*` são publicados juntos, numa única versão e com tipos TypeScript, em ESM + CJS (os wrappers de React, Vue e Angular são só ESM). Instale o pacote da sua stack. Um wrapper de framework traz `@tooark/web-components`, `@tooark/core` e `@tooark/tokens` junto, mas um gerenciador com dependências isoladas (pnpm) só deixa importar as diretas, por isso a tabela também lista o `@tooark/web-components`, cuja folha de estilo você importa:

| Stack                                | Instalação                                                                                                                                                                                                                                | Peer dependencies por sua conta                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Vanilla / qualquer framework         | `pnpm add @tooark/web-components` (mais `@tooark/core` para chamar `toast()`, `announce()` ou `setArkLocale()`)                                                                                                                           | —                                                             |
| React 18 / 19                        | `pnpm add @tooark/react @tooark/web-components`                                                                                                                                                                                           | `react`, `react-dom` ≥ 18                                     |
| Vue 3                                | `pnpm add @tooark/vue @tooark/web-components`                                                                                                                                                                                             | `vue` ≥ 3                                                     |
| Angular                              | `pnpm add @tooark/angular @tooark/web-components`                                                                                                                                                                                         | `@angular/core`, `@angular/common` ≥ 21.2.19                  |
| Gráficos (`ark-chart`)               | `pnpm add @tooark/chart echarts` (wrappers: `@tooark/react/chart`, `@tooark/vue/chart`, `@tooark/angular/chart`)                                                                                                                          | `echarts` ≥ 5                                                 |
| Texto rico (`ark-wysiwyg-*`)         | `pnpm add @tooark/wysiwyg` (wrappers: a subpath `/wysiwyg` de cada pacote de wrappers)                                                                                                                                                    | — (o Tiptap é instalado como dependência)                     |
| Editor de código (`ark-code-editor`) | `pnpm add @tooark/code @codemirror/state @codemirror/view @codemirror/language @codemirror/commands @codemirror/search @codemirror/autocomplete @codemirror/lang-json @codemirror/lang-javascript @codemirror/lang-yaml @lezer/highlight` | os pacotes do CodeMirror, para a página ter uma cópia de cada |
| Motion avançado                      | `pnpm add @tooark/motion`                                                                                                                                                                                                                 | — (a lib Motion é instalada como dependência)                 |

Duas coisas que todo setup precisa, seja qual for o framework: **importar a folha de estilo uma vez** (`@tooark/web-components/styles.css`, o único CSS necessário — tokens, presets de motion e estilos dos componentes) e **registrar os elementos** (`registerTooarkComponents()`; os wrappers de React, Vue e Angular fazem isso por você no primeiro render). Os pacotes laterais registram os próprios elementos (`registerTooarkChart()`, `registerTooarkWysiwyg()`, `registerTooarkCode()`).

**Tamanho do bundle.** O registro é uma chamada só para todos os elementos e os wrappers fazem essa chamada, então o bundle leva todos, sejam quais forem os que a página usa. Medido na 1.7.0, minificado e antes da compressão: um wrapper importado de `@tooark/react` soma cerca de 415 kB (sem contar o React), e uma classe só importada de `@tooark/web-components` e definida à mão ainda soma cerca de 383 kB, tanto no esbuild quanto no Rolldown. Entradas por elemento, com wrappers que registram só o próprio elemento, são uma melhoria planejada: serão opt-in, e os imports mostrados aqui continuam valendo. Até lá, carregue a biblioteca num chunk lazy se a primeira tela não precisa dela, mantendo o import do `styles.css` na entrada (veja abaixo).

### Vanilla / qualquer framework

```ts
import { registerTooarkComponents } from "@tooark/web-components";
import "@tooark/web-components/styles.css";

registerTooarkComponents();
```

O `styles.css` pode conviver com o seu framework CSS:

- **Sem reset global.** O preflight do Tailwind não é distribuído; um reset com escopo se aplica apenas dentro dos elementos `ark-*`.
- **Utilitários e variáveis com prefixo.** Toda classe de componente é `ark:*` (ex.: `ark:inline-flex`) e as variáveis de tema são `--ark-*` (ex.: `--ark-color-primary`), então nada colide com um setup Tailwind v3/v4 no seu app.
- **Suas classes num host `ark-*`: importe o `styles.css` primeiro.** A folha usa as cascade layers do Tailwind v4 (`theme`, `base`, `components`, `utilities`), e layers com o mesmo nome se juntam entre folhas. Então, quando um utilitário Tailwind v4 seu e uma classe do componente definem a mesma propriedade no mesmo host (`hidden` contra `ark:inline-flex`, `p-0` contra `ark:px-4`), vence a folha que carrega **depois**. Importe `@tooark/web-components/styles.css` no arquivo de entrada, antes do seu CSS, também quando os elementos carregam num chunk lazy: uma folha que só o chunk importa entra depois da sua, e as suas classes nos hosts deixam de valer. Uma classe só também vence com o modificador important do Tailwind (`hidden!`). CSS fora de qualquer layer (Tailwind v3, CSS puro seu) vence em qualquer ordem.

Um formulário com um campo, um select, um diálogo de confirmação e um toast — o mesmo cenário que as seções de framework abaixo reproduzem:

```html
<form id="perfil">
  <ark-input name="nome" label="Nome" placeholder="Seu nome completo" helper="Como no documento" required></ark-input>
  <ark-select
    name="papel"
    label="Papel"
    options='[{"value":"dev","label":"Desenvolvimento"},{"value":"ops","label":"Operações"}]'
  ></ark-select>
  <ark-datepicker input mode="date" lang="pt" name="desde"></ark-datepicker>
  <ark-button type="submit" intent="primary">Salvar</ark-button>
</form>

<ark-dialog id="confirmar" label="Publicar alterações?" lang="pt">
  <p>Seu perfil ficará visível para todo o time.</p>
  <div slot="footer">
    <ark-button variant="ghost" data-action="cancel">Cancelar</ark-button>
    <ark-button intent="primary" data-action="publish">Publicar</ark-button>
  </div>
</ark-dialog>

<ark-toaster position="bottom-right" lang="pt"></ark-toaster>
```

```ts
import { toast } from "@tooark/core";

const form = document.querySelector<HTMLFormElement>("#perfil")!;
const dialog = document.querySelector("ark-dialog")!; // `show()`, `close(reason)`, `open`

form.addEventListener("submit", (event) => {
  event.preventDefault();
  dialog.show(); // popover no top layer: foco preso, Esc e o scrim fecham
});

dialog.addEventListener("click", (event) => {
  const action = (event.target as HTMLElement).closest("[data-action]")?.getAttribute("data-action");
  if (action === "publish") {
    const data = Object.fromEntries(new FormData(form)); // { nome, papel, desde: "YYYY-MM-DD" }
    toast.success("Perfil publicado", { description: `Bem-vindo, ${data.nome}.` });
  }
  if (action) dialog.close();
});

// Todo elemento ark-* também é uma API DOM comum: atributos, propriedades e eventos customizados.
document.querySelector("ark-select")!.addEventListener("change", (event) => {
  console.log((event as CustomEvent<{ value: string }>).detail.value);
});
```

`events` no `ark-calendar`/`ark-scheduler`, `rows` no `ark-kv-editor`, `rows`/`columns` no `ark-data-view` e `options` no `ark-select` também aceitam a propriedade JS, o que evita serializar JSON no atributo:

```ts
document.querySelector("ark-scheduler")!.events = [
  { id: "1", title: "Daily", start: "2026-09-01T09:00", end: "2026-09-01T09:15", intent: "info" }
];
```

O `ark-data-view` recebe os registros e as colunas do mesmo jeito; o `render` de uma coluna devolve um nó DOM (ou um texto) para a célula:

```ts
const view = document.querySelector("ark-data-view")!;
view.columns = [
  {
    key: "name",
    label: "Usuário",
    sortable: true,
    render: ({ row }) => {
      const avatar = document.createElement("ark-avatar");
      avatar.setAttribute("name", row.name);
      return avatar;
    }
  },
  { key: "role", label: "Perfil" }
];
view.rows = users;
view.addEventListener("ark-row-click", (event) => openUser(event.detail.row));
```

### React

O `@tooark/react` exporta um componente por elemento (`ArkButton`, `ArkInput`, `ArkDialog`, …) com props camelCase e tipadas, mais o serviço `toast` reexportado do `@tooark/core`. Props de lista (`events`, `options`, `colors`) são serializadas para você e `rows` é atribuída como propriedade JS, assim como `columns`, `selected` e `cardRender` no `ArkDataView`, que é genérico no tipo do registro (`<ArkDataView<User> rows={users} … />` tipa o `render` da coluna e o `event.detail.row`) e desenha as células em JSX; `localeJson` recebe um objeto em `ArkCalendar` e `ArkDatepicker` e uma string JSON nos demais componentes. Os eventos customizados viram handlers que recebem o `CustomEvent` (`onChange`, `onClose`, `onSelect`, …), exceto em `ArkCalendar`, `ArkDatepicker`, `ArkClock`, `ArkCarousel` e `ArkScheduler`, cujos handlers (`onChange`, `onSlideChange`, `onEventClick`, …) recebem o `detail`. `ArkButtonProps` também aceita os atributos e handlers DOM tipados (`onClick`, `onFocus`, `id`, `style`, …). Importe a folha de estilo uma vez (no `main.tsx` ou no layout raiz) e use os componentes em qualquer lugar:

```tsx
// main.tsx
import "@tooark/web-components/styles.css";
```

```tsx
import { ArkButton, ArkDialog, ArkInput, ArkSelect, ArkToaster, toast } from "@tooark/react";
import { type FormEvent, useState } from "react";

const PAPEIS = [
  { value: "dev", label: "Desenvolvimento" },
  { value: "ops", label: "Operações" }
];

export function FormularioPerfil() {
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState("dev");
  const [confirmando, setConfirmando] = useState(false);

  function enviar(event: FormEvent) {
    event.preventDefault();
    setConfirmando(true);
  }

  function publicar() {
    setConfirmando(false);
    toast.success("Perfil publicado", { description: `Bem-vindo, ${nome}.` });
  }

  return (
    <form onSubmit={enviar}>
      {/* Eventos nativos sobem do controle interno: leia o valor de event.target */}
      <ArkInput label="Nome" value={nome} required onInput={(e) => setNome((e.target as HTMLInputElement).value)} />
      {/* O ark-select consolida o próprio `change` como CustomEvent com detail.value */}
      <ArkSelect label="Papel" options={PAPEIS} value={papel} onChange={(e) => setPapel(e.detail.value)} />
      <ArkButton type="submit" intent="primary">
        Salvar
      </ArkButton>

      {/* `open` é a fonte da verdade: desligá-lo anima a saída (desmontar fecha sem animação) */}
      <ArkDialog label="Publicar alterações?" open={confirmando} onClose={() => setConfirmando(false)}>
        <p>Seu perfil ficará visível para todo o time.</p>
        <div slot="footer">
          <ArkButton variant="ghost" onClick={() => setConfirmando(false)}>
            Cancelar
          </ArkButton>
          <ArkButton intent="primary" onClick={publicar}>
            Publicar
          </ArkButton>
        </div>
      </ArkDialog>

      <ArkToaster position="bottom-right" lang="pt" />
    </form>
  );
}
```

Funciona com React 18 (atributos) e React 19 (propriedades): os setters booleanos de todo elemento aceitam os dois (veja `coerceBooleanAttr` nas notas abaixo). Todo wrapper encaminha `ref` para o elemento `ark-*`, tipada como a classe do elemento (`React.ComponentRef<typeof ArkDialog>`), para métodos como `show()` ou `focus()`. Todo tipo de props também aceita os atributos e handlers DOM do React (`id`, `style`, `aria-*`, `onClick`, …), tipados e repassados ao elemento; um `aria-*` booleano (`aria-pressed={true}`) chega como `"true"`/`"false"`, enquanto numa tag `ark-*` crua o React 19 grava `true` como atributo vazio, então passe o texto nela. Para elementos sem wrapper (os pacotes laterais), use a tag diretamente com `registerTooark*()` num efeito e um `ref` para atribuir as propriedades JS; o `@tooark/react` distribui as tipagens `IntrinsicElements` de toda tag `ark-*`.

O `ArkDataView` desenha o `render` de uma coluna como JSX: ele devolve o que um componente devolveria (elementos, componentes seus, texto, `null` para nada), roda de novo a cada render como qualquer filho e pode fechar sobre o estado. `columns` não precisa de `useMemo`: o elemento só refaz as células quando os dados das colunas mudam. `cardRender` faz o mesmo para o corpo inteiro de um card.

```tsx
<ArkDataView<User>
  rows={users}
  selectable
  onSelectionChange={(event) => setSelected(event.detail.selected)}
  columns={[
    {
      key: "name",
      label: "Usuário",
      sortable: true,
      render: ({ row }) => (
        <div className="flex items-center gap-3">
          <ArkAvatar name={row.name} size="sm" />
          <div>
            <strong>{row.name}</strong>
            <small className="block">{row.email}</small>
          </div>
        </div>
      )
    },
    { key: "role", label: "Perfil" }
  ]}
>
  <div slot="selection">
    <ArkButton intent="danger" onClick={removeSelected}>
      Excluir
    </ArkButton>
  </div>
</ArkDataView>;
```

### Vue 3

O `@tooark/vue` exporta um componente por elemento com props tipadas, mais o serviço `toast` reexportado do `@tooark/core`; os eventos customizados mantêm o nome nativo (`@ark-change`, `@ark-close`, `@ark-select`, …) e entregam o `CustomEvent`, exceto o `@ark-change` de `ArkCalendar`, `ArkDatepicker` e `ArkClock`, o `@ark-slide-change` de `ArkCarousel` e os eventos de `ArkScheduler`, que entregam o `detail`. Importe a folha de estilo uma vez (no `main.ts`) e use os componentes em qualquer SFC:

```ts
// main.ts
import "@tooark/web-components/styles.css";
```

```vue
<script setup lang="ts">
import { ArkButton, ArkDialog, ArkInput, ArkSelect, ArkToaster, toast } from "@tooark/vue";
import { ref } from "vue";

const papeis = [
  { value: "dev", label: "Desenvolvimento" },
  { value: "ops", label: "Operações" },
];
const nome = ref("");
const papel = ref("dev");
const confirmando = ref(false);

function publicar() {
  confirmando.value = false;
  toast.success("Perfil publicado", { description: `Bem-vindo, ${nome.value}.` });
}
</script>

<template>
  <form @submit.prevent="confirmando = true">
    <!-- Eventos nativos sobem do controle interno: leia o valor de event.target -->
    <ArkInput label="Nome" :value="nome" required @input="nome = ($event.target as HTMLInputElement).value" />
    <!-- O ark-select consolida o próprio `change` como CustomEvent com detail.value -->
    <ArkSelect label="Papel" :options="papeis" :value="papel" @change="papel = $event.detail.value" />
    <ArkButton type="submit" intent="primary">Salvar</ArkButton>

    <ArkDialog label="Publicar alterações?" :open="confirmando" @ark-close="confirmando = false">
      <p>Seu perfil ficará visível para todo o time.</p>
      <div slot="footer">
        <ArkButton variant="ghost" @click="confirmando = false">Cancelar</ArkButton>
        <ArkButton intent="primary" @click="publicar">Publicar</ArkButton>
      </div>
    </ArkDialog>

    <ArkToaster position="bottom-right" lang="pt" />
  </form>
</template>
```

Avise o compilador do Vue de que as tags `ark-*` são custom elements quando usar uma sem wrapper (pacotes laterais): `compilerOptions.isCustomElement = (tag) => tag.startsWith("ark-")` no `vite.config.ts` (`plugins: [vue({ template: { compilerOptions } })]`).

No `ArkDataView` o conteúdo de uma célula é um slot com escopo chamado `cell-<key>` (`{ row, column, value, index, view }`), e `#card` (`{ row, index }`) desenha o corpo inteiro de um card; um `render` de coluna que devolve VNodes também funciona. Os slots são reativos como qualquer outro: seguem o seu estado e os campos do registro sem o elemento refazer as células.

```vue
<ArkDataView :rows="users" :columns="columns" selectable @ark-selection-change="selected = $event.detail.selected">
  <template #cell-name="{ row }">
    <div class="flex items-center gap-3">
      <ArkAvatar :name="row.name" size="sm" />
      <div>
        <strong>{{ row.name }}</strong>
        <small class="block">{{ row.email }}</small>
      </div>
    </div>
  </template>
  <div slot="selection">
    <ArkButton intent="danger" @click="removeSelected">Excluir</ArkButton>
  </div>
</ArkDataView>
```

### Angular

O `@tooark/angular` exporta um componente standalone por elemento (`ArkInputComponent`, `ArkDialogComponent`, …) com o seletor `<ark-*-wrapper>`, mais o serviço `toast` reexportado do `@tooark/core`: `@Input()` para os atributos e `@Output()` reemitindo os eventos customizados (`changed`, `arkChange`, `arkClose`, `arkSelect`, …) com o `CustomEvent`, exceto os outputs de calendar, clock, datepicker, carousel e scheduler, que emitem o `detail`. `localeJson` é uma string JSON, exceto no calendar e no datepicker, que recebem um objeto, e o `rows` e o `valueField` do kv-editor são atribuídos como propriedades JS, assim como `rows`, `columns`, `selected` e `cardRender` do data-view, cujas células aceitam `ng-template`. Todo wrapper expõe o elemento `ark-*` que renderiza em `element`, tipado como a classe do elemento e `null` antes de a view existir, para os métodos e propriedades dele (`@ViewChild(ArkDialogComponent) dialog!: ArkDialogComponent;` e depois `this.dialog.element?.show()`). O wrapper é um elemento próprio em volta do `ark-*`, então só os inputs chegam ao elemento: um `id`, `class`, `style` ou `data-*` escrito na tag `<ark-*-wrapper>` fica no wrapper (use o `element` para esses), enquanto eventos nativos como `(click)` sobem até ele. Adicione a folha de estilo ao `angular.json` (o caminho existe porque o `@tooark/web-components` é dependência direta, ver [Instalação](#instalação)) e importe os componentes que usar:

```json
// angular.json → projects.<app>.architect.build.options
"styles": ["node_modules/@tooark/web-components/dist/styles.css", "src/styles.css"]
```

```ts
import { Component } from "@angular/core";
import {
  ArkButtonComponent,
  ArkDialogComponent,
  ArkInputComponent,
  ArkSelectComponent,
  ArkToasterComponent,
  toast
} from "@tooark/angular";

@Component({
  selector: "app-formulario-perfil",
  standalone: true,
  imports: [ArkInputComponent, ArkSelectComponent, ArkButtonComponent, ArkDialogComponent, ArkToasterComponent],
  template: `
    <form (submit)="$event.preventDefault(); confirmando = true">
      <!-- Eventos nativos sobem do controle interno: leia o valor de $event.target -->
      <ark-input-wrapper
        label="Nome"
        [value]="nome"
        [required]="true"
        (input)="nome = $any($event.target).value"
      ></ark-input-wrapper>
      <!-- O ark-select consolida o próprio change, reemitido como (changed) com detail.value -->
      <ark-select-wrapper
        label="Papel"
        [options]="papeis"
        [value]="papel"
        (changed)="papel = $event.detail.value"
      ></ark-select-wrapper>
      <ark-button-wrapper type="submit" intent="primary">Salvar</ark-button-wrapper>

      <ark-dialog-wrapper label="Publicar alterações?" [open]="confirmando" (arkClose)="confirmando = false">
        <p>Seu perfil ficará visível para todo o time.</p>
        <div slot="footer">
          <ark-button-wrapper variant="ghost" (click)="confirmando = false">Cancelar</ark-button-wrapper>
          <ark-button-wrapper intent="primary" (click)="publicar()">Publicar</ark-button-wrapper>
        </div>
      </ark-dialog-wrapper>

      <ark-toaster-wrapper position="bottom-right" lang="pt"></ark-toaster-wrapper>
    </form>
  `
})
export class FormularioPerfilComponent {
  papeis = [
    { value: "dev", label: "Desenvolvimento" },
    { value: "ops", label: "Operações" }
  ];
  nome = "";
  papel = "dev";
  confirmando = false;

  publicar(): void {
    this.confirmando = false;
    toast.success("Perfil publicado", { description: `Bem-vindo, ${this.nome}.` });
  }
}
```

O pacote é compilado com `ng-packagr` em Ivy parcial, então funciona em builds AOT de produção, e exige Angular ≥ 21.2.19 (o mesmo piso que o workspace impõe por correções de segurança). Os custom elements são registrados sob demanda no construtor de cada wrapper e pulados no servidor, então os wrappers são seguros para SSR. Para usar uma tag `ark-*` sem wrapper (pacotes laterais), adicione `schemas: [CUSTOM_ELEMENTS_SCHEMA]` ao componente e chame a função `registerTooark*()` no navegador.

No `<ark-data-view-wrapper>` o conteúdo de uma célula é um `ng-template` marcado com `arkDataViewCell="<key>"` (o registro em `let-row`, o resto por nome: `let-value="value"`, `let-index="index"`, `let-view="view"`), e `arkDataViewCard` desenha o corpo inteiro de um card. Importe `ArkDataViewCellDirective` e `ArkDataViewCardDirective` junto de `ArkDataViewComponent`; os templates são checados com o componente que os declara, então seguem o estado dele.

```html
<ark-data-view-wrapper
  [rows]="users"
  [columns]="columns"
  [selectable]="true"
  (arkSelectionChange)="selected = $event.detail.selected"
>
  <ng-template arkDataViewCell="name" let-row>
    <div class="flex items-center gap-3">
      <ark-avatar-wrapper [name]="row.name" size="sm"></ark-avatar-wrapper>
      <div>
        <strong>{{ row.name }}</strong>
        <small class="block">{{ row.email }}</small>
      </div>
    </div>
  </ng-template>
  <div slot="selection">
    <ark-button-wrapper intent="danger" (click)="removeSelected()">Excluir</ark-button-wrapper>
  </div>
</ark-data-view-wrapper>
```

### Gráficos, texto rico e código

Os pacotes laterais trazem os próprios Custom Elements, com o mesmo tema (`theme="auto"` segue o `color-scheme` da página, inclusive a troca em tempo de execução) e wrappers de framework em entry points de subpath, para que ECharts, CodeMirror e Tiptap só cheguem aos apps que os importam: `@tooark/react/chart`, `/code` e `/wysiwyg` (`ArkChart`, `ArkCodeEditor`, `ArkWysiwygEditor`, `ArkWysiwygViewer`), as mesmas subpaths no `@tooark/vue`, e as entradas secundárias do Angular `@tooark/angular/chart`, `/code` e `/wysiwyg` (`<ark-chart-wrapper>`, `<ark-code-editor-wrapper>`, `<ark-wysiwyg-editor-wrapper>`, `<ark-wysiwyg-viewer-wrapper>`). O pacote lateral é peer opcional do pacote de wrappers, então instale-o você (tabela acima); as entradas principais nunca o importam. Os wrappers passam `option`, `value`, as listas e funções do editor de código e o `content`/`uploadFile` do wysiwyg como propriedades, só quando a referência muda, e um editor controlado mantém o cursor (o valor ou o JSON que o evento de mudança acabou de entregar, repassado, não reescreve o editor). No React, importar uma subpath também tipa as propriedades JS da tag crua no JSX (`<ark-chart option={…}>`, `<ark-code-editor value="…" extensions={…}>`); o `content` do wysiwyg fica no wrapper ou na ref, porque o React já tipa `content` como o atributo de texto da `<meta>` em todo elemento. As tags continuam funcionando diretamente em qualquer framework, como descrito acima. Uma propriedade JS atribuída antes de `registerTooark*()` rodar (um framework que liga `option`, `value` ou `content` à tag antes do registro) é aplicada quando o elemento faz o upgrade, então registrar no `main.ts` ou no efeito do componente funciona igual.

```ts
import { registerTooarkChart } from "@tooark/chart"; // o ECharts é peer dependency

registerTooarkChart();
const chart = document.querySelector("ark-chart")!;
chart.option = {
  xAxis: { type: "category", data: ["Seg", "Ter", "Qua"] },
  yAxis: {},
  series: [{ type: "bar", data: [120, 200, 150] }]
};
```

```ts
import { registerTooarkWysiwyg } from "@tooark/wysiwyg"; // o Tiptap é instalado como dependência

registerTooarkWysiwyg();
const editor = document.querySelector("ark-wysiwyg-editor")!;
editor.setAttribute("toolbar", "style,marks,color,lists,link,media,history"); // grupos opt-in
editor.uploadFile = async (file) => ({ src: await enviarParaMeuStorage(file) }); // liga imagem/vídeo; o JSON guarda só a URL
editor.content = jsonSalvo; // JSON do Tiptap, sanitizado ao entrar
editor.addEventListener("ark-wysiwyg-change", (event) => salvar(event.detail));
document.querySelector("ark-wysiwyg-viewer")!.content = jsonSalvo;
```

```ts
import { registerTooarkCode } from "@tooark/code"; // os pacotes do CodeMirror são peer dependencies

registerTooarkCode();
const editor = document.querySelector("ark-code-editor")!;
editor.setAttribute("language", "json");
editor.variableKeys = ["baseUrl", "token"]; // completions depois de {{
editor.value = JSON.stringify(body, null, 2);
editor.addEventListener("change", (event) => salvar(event.detail.value));
```

```tsx
// O mesmo editor pela subpath do React (também @tooark/vue/code e @tooark/angular/code).
import { ArkCodeEditor } from "@tooark/react/code";

<ArkCodeEditor language="json" value={body} maxHeight="24rem" onChange={(event) => setBody(event.detail.value)} />;
```

```ts
import { toast } from "@tooark/core"; // também reexportado por @tooark/react, @tooark/vue e @tooark/angular

toast.success("Salvo", { description: "Suas alterações foram publicadas." });
```

### Renderização no servidor

Os elementos precisam de um navegador: `customElements` não existe no servidor. Importar qualquer pacote `@tooark/*` lá é seguro (fora do navegador os elementos estendem uma classe base vazia e `registerTooark*()` não faz nada; o CI confere com `pnpm check:ssr`). Renderize a marcação normalmente (uma tag `ark-*` não registrada é HTML inerte, e os filhos em light DOM continuam lá para SEO e para a primeira pintura) e registre no cliente — os wrappers já fazem isso: o React num efeito, o Vue no `setup` e o Angular no construtor, os dois últimos sem efeito no servidor. Inclua o `styles.css` na página renderizada no servidor para os hosts terem a caixa antes da hidratação. O que só existe no navegador (gráficos, editores) renderiza depois de montar; dê um `min-height` ao host se o deslocamento de layout importar.

### Notas para integrações com frameworks

O React 18 escreve atributos nos custom elements, o React 19 escreve a propriedade quando o elemento a tem, então um booleano que o wrapper passa como `""` (presente) ou omite chega ao elemento dos dois jeitos: todo setter booleano (`disabled`, `open`, `checked`, …) aceita `true`/`""` como ligado e `false`/`"false"`/`null`/`undefined` como desligado (`coerceBooleanAttr` do `@tooark/core`, se você escrever elementos seus).

Todo elemento `ark-*`, de qualquer pacote, também aceita propriedades JS atribuídas antes do seu `registerTooark*()`: um framework que liga `rows`, `options`, `value` ou `open` numa tag crua renderizada antes do registro as deixa no nó, e o elemento as reaplica pelos setters quando faz o upgrade. Um overlay aberto assim, ou por um atributo `open` no HTML do servidor registrado depois, abre no `connectedCallback` com o `ark-open` num microtask, como um criado aberto.

Os elementos que mostram texto aceitam `lang`: `en`, `pt`, `es` ou `custom` com `locale-json` (mesclado sobre o `en`). Uma tag com região, como o `<html lang>` ou o `navigator.language` a entregam (`pt-BR`, `es-419`, `en_US`, em qualquer caixa), usa a tabela do idioma base; um idioma sem tabela cai no inglês. As props dos wrappers continuam tipadas como `ArkLang` (`en | pt | es | custom`).

Para definir o idioma uma vez para o app todo, em vez de um `lang` em cada elemento, chame `setArkLocale(lang, localeJson?)` do `@tooark/core` (os pacotes React, Vue e Angular o reexportam ao lado do `toast`): todo componente sem `lang` próprio passa a usá-lo, os já montados se redesenham na hora (um que estava fora do DOM durante a troca se redesenha ao voltar) e o `lang` do próprio elemento continua valendo. Aceita a tag como o seu app a tem (`setArkLocale(navigator.language)`, `"pt-BR"`), `custom` com as suas strings em objeto ou JSON (JSON inválido lança na chamada) e `null` para voltar ao inglês; o editor do `@tooark/wysiwyg` também segue. `getArkLocale()` lê e `observeArkLocale(onChange)` acompanha (devolve a função que para). É opt-in: sem a chamada nada muda, e o `<html lang>` nunca é lido. Leitores de tela escolhem a pronúncia pelo `lang` que a página ou um ancestral declara, então mantenha o `<html lang>` no mesmo idioma que você passa.

### Tema e design tokens

Toda cor usada pelos componentes é um token semântico com valor claro e escuro (`light-dark()`), então o tema é CSS puro:

- **Tema**: por padrão os componentes herdam o `color-scheme` da página, como os controles nativos: uma página clara recebe componentes claros mesmo num sistema escuro, e um app que declara `:root { color-scheme: light dark }` segue o sistema. `theme="light"` ou `theme="dark"` num elemento força um lado para ele e seus descendentes. Não há JavaScript envolvido.
- **Marca**: sobrescreva os tokens no seu CSS. Dentro da folha de estilo dos componentes eles têm o prefixo `ark`:

```css
:root {
  --ark-color-primary: light-dark(oklch(45% 0.2 264), oklch(80% 0.15 264));
  --ark-color-primary-fg: #fff;
  --ark-color-primary-hover: light-dark(oklch(40% 0.2 264), oklch(85% 0.15 264));
}
```

Cada intent (`primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`) tem `<intent>`, `-fg`, `-hover`, `-soft`, `-soft-fg`, `-border` e `-ring`; as superfícies neutras são `surface`, `surface-muted`, `surface-strong`, `surface-raised`, `fg`, `fg-soft`, `fg-muted`, `fg-faint`, `fg-placeholder`, `border`, `border-strong`, `muted` e `ring`. A lista completa com o papel de cada um está em [tokens.css](packages/tokens/tokens.css).

Mais duas escalas são compartilhadas pelos controles de formulário:

- **`size`** (`xs`/`sm`/`md`/`lg`/`xl`) mapeia para os tokens `--ark-size-*` (1.5 / 1.75 / 2.25 / 2.75 / 3.25 rem, ou seja, 24 a 52 px). `ark-button`, `ark-input` e `ark-toggle` aplicam o token como `min-height` (e como `min-width` nos botões só de ícone), então controles do mesmo tamanho alinham numa linha e sobrescrever `--ark-size-md` redimensiona todos os controles de uma vez; `ark-switch`, `ark-checkbox` e `ark-radio` usam dimensões proporcionais na escala de espaçamento (trilho e caixa são glifos ao lado do texto, não controles de altura cheia).
- **`rounded`** (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`full`) mapeia para a escala de raios do Tailwind (`--ark-radius-xs` … `--ark-radius-xl`, 0.125 a 0.75 rem).

#### Integrando com um tema existente

Se o seu app já tem as próprias variáveis de design (um tema gerado, outro design system), faça a ponte delas para os tokens `--ark-*` em vez de duplicar valores. Três coisas decidem a aparência dos componentes:

1. **`color-scheme` na página.** Os tokens são valores `light-dark()`, então os componentes leem o `color-scheme` da página e nada mais: sem uma declaração todo componente renderiza claro, seja qual for a preferência do sistema. Declare-o onde o seu app alterna o tema:

   ```css
   html {
     color-scheme: light;
   }
   html.dark {
     color-scheme: dark;
   } /* ou [data-theme="dark"]; `light dark` segue o sistema */
   ```

2. **Ponte de marca.** Aponte os tokens para as suas variáveis. `light-dark()` não é necessário quando as suas variáveis já trocam com o tema, e todo token que você não tocar mantém o padrão:

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

   Se o seu tema também define neutros, faça a ponte de `--ark-color-surface*`, `--ark-color-fg*` e `--ark-color-border*` também; senão os seus cinzas e os cinzas dos componentes vêm de duas fontes.

3. **Densidade.** `--ark-size-*` define a altura dos controles e `--ark-text-xs`/`--ark-text-sm` a maior parte do texto dentro deles; os micro-rótulos (o rótulo flutuante dos campos `xs`/`sm`, os chips do calendário e da agenda, os rótulos de coluna do relógio, avatares e kbd `xs`) ficam um passo abaixo em `--ark-text-2xs` (0,6875 rem, sem altura de linha própria). Só os rótulos dentro do trilho do switch e o badge de contagem do calendário mantêm tamanhos fixos em pixel, porque estão presos à geometria do contêiner:

   ```css
   :root {
     --ark-size-sm: 2rem; /* 32 px */
     --ark-size-md: 2.5rem; /* 40 px */
     --ark-size-lg: 3rem; /* 48 px */
     --ark-text-sm: 0.75rem;
   }
   ```

Overrides de duração e easing seguem a regra do [sistema de motion](#-sistema-de-motion): mantenha-os dentro de `@media (prefers-reduced-motion: no-preference)`.

`ark-chart`, `ark-wysiwyg-editor`/`ark-wysiwyg-viewer` e `ark-code-editor` não podem ser tematizados só por CSS (ECharts, Tiptap e CodeMirror pintam as próprias cores), então o `theme="auto"` deles resolve o `color-scheme` computado do host quando o elemento é criado: uma página que força `dark` recebe um gráfico escuro, uma página que o deixa em `light dark` (ou sem declarar) segue a preferência do sistema. A resolução acompanha a página enquanto o elemento está conectado: `observeColorScheme(element, onChange)` do `@tooark/tokens` observa os atributos `class`, `style`, `data-theme` e `theme` de `<html>` e `<body>` (onde os apps trocam o tema) mais a preferência do sistema, então um gráfico ou editor deixado em `auto` segue a troca de tema em tempo de execução; `theme="light|dark"` continua forçando um lado. As cores também podem seguir os tokens: o chrome e a sintaxe do editor de código leem `--ark-color-*` e `--ark-syntax-*`, e `ark-chart palette="tokens"` monta o tema do ECharts a partir de `--ark-color-*` (séries nos intents, texto, eixos, grade e tooltip, fundo transparente), lendo-os no lado que o `theme` resolve; sem o CSS dos tokens na página fica a paleta do próprio ECharts (`resolvedPalette` diz qual valeu). Para uma série que precisa de um intent determinado (a série "Aprovado" em `success`), `resolveTokenColors(["success", "danger"], { theme: chart.resolvedTheme ?? "auto" })` do `@tooark/chart` devolve as cores desses tokens prontas para a `option`.

Para reaproveitar os mesmos tokens como utilities (`bg-primary`, `text-fg-muted`, …) no seu próprio projeto Tailwind v4, importe-os no seu entry CSS:

```css
@import "tailwindcss";
@import "@tooark/tokens/tokens.css";
```

Isso é independente da folha de estilo dos componentes: eles carregam a própria cópia prefixada do theme, então a configuração do Tailwind do seu app nunca altera a aparência dos componentes.

---

## 🛠️ Desenvolvimento

Requisitos: **Node.js ≥ 22** (o CI roda no 24) e **pnpm 12** (versão fixada via `packageManager`; o pnpm troca para ela sozinho).

```bash
pnpm install          # instala as dependências do workspace
pnpm build            # compila todos os pacotes
pnpm dev:storybook    # roda o Storybook em http://localhost:6006
pnpm check:publish    # empacota cada pacote e valida os tarballs (publint + attw)
pnpm check:ssr        # importa cada build num Node sem DOM e renderiza os wrappers React/Vue para string
pnpm clean            # remove os artefatos de build
pnpm check            # lint, formatação e ordem de imports (Biome)
pnpm check:fix        # aplica as correções e a formatação do Biome
```

Os pacotes de biblioteca compilam com Rollup (`tsc` nos wrappers React e Vue, `ng-packagr` no Angular). `@tooark/core` e `@tooark/web-components` também compilam seu entry CSS (`src/styles/index.css`) com o Tailwind CLI para `dist/styles.css` e em seguida rodam `scripts/check-css.mjs`, um smoke test que derruba o build se a folha de estilo não foi compilada ou não contém as classes esperadas. As classes dos componentes devem ser escritas com o prefixo `ark:` (`ark:flex`, `ark:hover:bg-surface-muted`); utilities sem prefixo não são geradas. O Storybook processa o mesmo CSS pelo plugin `@tailwindcss/vite`, então não existe configuração de PostCSS no repositório.

Lint, formatação e ordenação de imports ficam a cargo do [Biome](https://biomejs.dev/) (`biome.json` na raiz: linhas de 120 colunas, aspas duplas, sem vírgulas finais). O CI roda `biome ci` antes do build, então rode `pnpm check:fix` antes de commitar.

### Testes

Os testes de componente rodam com o **addon Vitest do Storybook**: cada story é executada como smoke test em um navegador Chromium real (Playwright), além de testes de interação (funções `play`) e checagens de acessibilidade (axe-core via `@storybook/addon-a11y`), que por enquanto apontam violações como aviso sem derrubar a execução (`test: "todo"` no `.storybook/preview.ts`).

```bash
pnpm exec playwright install chromium        # download do navegador (uma vez)
pnpm --filter storybook test                 # roda a suíte
pnpm --filter storybook exec vitest run --project storybook --coverage
```

Os testes também podem ser disparados pela UI do Storybook (widget "Run tests"). O CI roda o lint, compila todos os pacotes (incluindo o smoke test do CSS), confere os tarballs e os imports em SSR (`pnpm check:publish`, `pnpm check:ssr`) e depois roda a mesma suíte em cada push na `main` e em todo pull request via [GitHub Actions](.github/workflows/tests.yml).

### Hooks para testes e2e

Todo elemento interno criado por um componente do `@tooark/web-components` carrega hooks estáveis para testes end-to-end (os elementos dos pacotes laterais também: a raiz do `ark-code-editor`, o contêiner do `ark-chart` e a raiz, a toolbar e o conteúdo do wysiwyg), em duas camadas:

1. **`data-ark` (estático, sem configuração)** — o elemento principal recebe `data-ark="<componente>"` e cada parte interna recebe `data-ark="<componente>-<parte>"`. São seletores que não quebram com mudanças de classes utilitárias.
2. **`testid` (por instância)** — declare `testid="..."` no host e o valor é propagado como `data-testid` para o elemento principal, com sufixo `-<parte>` nas partes internas — o formato que `getByTestId` (Playwright, Cypress, Testing Library) procura por padrão. Disponível também como prop `testid` nos wrappers React/Vue/Angular.

```html
<ark-switch testid="notificacoes"></ark-switch>
<!-- gera: -->
<button data-ark="switch" data-testid="notificacoes" role="switch">
  <span data-ark="switch-thumb" data-testid="notificacoes-thumb"></span>
  ...
</button>
```

```ts
// Playwright
await page.getByTestId("notificacoes").click();
await expect(page.locator('[data-ark="switch-thumb"]')).toBeVisible();
await page.locator('[data-ark="calendar-day"][data-date="2026-09-15"]').click();
```

Hooks por componente:

| Componente            | Elemento principal | Partes internas                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-alert`           | `alert`            | `alert-heading`, `alert-dismiss`; `alert-icon` / `alert-action` (marcam os seus filhos de slot)                                                                                                                                                                                                                                                                                                                 |
| `ark-avatar`          | `avatar`           | `avatar-image` (o `<img>` quando há `src`), `avatar-initials`                                                                                                                                                                                                                                                                                                                                                   |
| `ark-badge`           | `badge`            | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-button`          | `button`           | `button-spinner`, `button-status-icon`, `button-link` (modo href)                                                                                                                                                                                                                                                                                                                                               |
| `ark-button-group`    | `button-group`     | — (enquanto colados, cada botão recebe `data-ark-group-pos`: `first`, `middle`, `last` ou `only`, e `data-ark-group-dir="vertical"` num grupo vertical)                                                                                                                                                                                                                                                         |
| `ark-checkbox`        | `checkbox`         | `checkbox-label` (quando há `label`), `checkbox-helper` (quando há `helper`), `checkbox-input` (o input nativo oculto)                                                                                                                                                                                                                                                                                          |
| `ark-scheduler`       | `scheduler`        | `scheduler-header`, `scheduler-today`, `scheduler-prev`, `scheduler-next`, `scheduler-title`, `scheduler-views`, `scheduler-view-{view}`, `scheduler-body`, `scheduler-scroller`, `scheduler-days`, `scheduler-grid`, `scheduler-day` (+ `data-date`), `scheduler-slot` (+ `data-start`), `scheduler-event` (+ `data-event-id`), `scheduler-event-more`, `scheduler-allday`, `scheduler-now`, `scheduler-empty` |
| `ark-select`          | `select`           | `select-label`, `select-chevron`, `select-helper`, `select-error`                                                                                                                                                                                                                                                                                                                                               |
| `ark-shape-picker`    | `shape-picker`     | `shape-picker-option` (+ `data-value`); cada opção contém um `ark-mark`                                                                                                                                                                                                                                                                                                                                         |
| `ark-skeleton`        | `skeleton`         | `skeleton-row` (cada barra quando `rows` > 1)                                                                                                                                                                                                                                                                                                                                                                   |
| `ark-spinner`         | `spinner`          | `spinner-icon`, `spinner-label` (visualmente oculto)                                                                                                                                                                                                                                                                                                                                                            |
| `ark-split-pane`      | `split-pane`       | `split-pane-handle` (cada alça)                                                                                                                                                                                                                                                                                                                                                                                 |
| `ark-status-dot`      | `status-dot`       | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-switch`          | `switch`           | `switch-thumb`, `switch-label-on`, `switch-label-off`, `switch-input`, `switch-helper` (só com `helper`)                                                                                                                                                                                                                                                                                                        |
| `ark-toggle`          | `toggle`           | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-toggle-group`    | `toggle-group`     | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-calendar`        | `calendar`         | `calendar-prev`, `calendar-next`, `calendar-title`, `calendar-grid`, `calendar-day` (+ `data-date`), `calendar-months`/`calendar-month` (+ `data-month`), `calendar-years`/`calendar-year` (+ `data-year`), `calendar-event`, `calendar-event-more`, `calendar-today`, `calendar-clear`                                                                                                                         |
| `ark-clock`           | `clock`            | `clock-hours`, `clock-minutes`, `clock-seconds`, `clock-meridiem` (opções via `data-value`)                                                                                                                                                                                                                                                                                                                     |
| `ark-file-input`      | `file-input`       | `file-input-label`, `file-input-zone`, `file-input-button`, `file-input-hint`, `file-input-list` (+ `file-input-item` por arquivo ou `file-input-summary` com `directory`, `file-input-rejected` para a pasta recusada), `file-input-helper`/`file-input-error`; o hook principal fica no input nativo oculto (`setInputFiles` no Playwright)                                                                   |
| `ark-input`           | `input`            | `input-label`, `input-prefix`, `input-suffix`, `input-reveal`, `input-helper`/`input-error`                                                                                                                                                                                                                                                                                                                     |
| `ark-card`            | `card`             | `card-heading` (o h2 de `heading`); `card-header`, `card-actions`, `card-footer` (marcam os seus filhos de slot). O corpo não é marcado: é conteúdo livre, que pode ser outro `ark-*` com os próprios hooks                                                                                                                                                                                                     |
| `ark-carousel`        | `carousel`         | `carousel-overlay`, `carousel-slide-{i}` (nos seus próprios elementos de slide), `carousel-arrow-prev`, `carousel-arrow-next`, `carousel-dots`, `carousel-dot-{i}`                                                                                                                                                                                                                                              |
| `ark-color-swatches`  | `color-swatches`   | `color-swatches-swatch` (+ `data-value`)                                                                                                                                                                                                                                                                                                                                                                        |
| `ark-command-item`    | `command-item`     | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-command-palette` | `command-palette`  | `command-palette-input` (o `ark-input` do componente), `command-palette-list` (o listbox oculto), `command-palette-group` (cada cabeçalho de grupo), `command-palette-empty`; cada item leva `command-item`                                                                                                                                                                                                     |
| `ark-copy-button`     | `copy-button`      | `copy-button-icon`, `copy-button-text` (o rótulo próprio, só sem filhos e sem `icon-only`); mais as partes do `ark-button` (`button-spinner`)                                                                                                                                                                                                                                                                   |
| `ark-datepicker`      | —                  | Composição, sem hook principal próprio: com `input` o testid vai ao `ark-input` (com os hooks dele) e o calendário recebe `<testid>-calendar`; inline o calendário recebe o testid sem sufixo; o relógio sempre recebe `<testid>-clock`. Partes próprias, só com `input`: `datepicker-toggle`, `datepicker-popup`.                                                                                              |
| `ark-dialog`          | `dialog`           | `dialog-header`, `dialog-title`, `dialog-close`, `dialog-footer` (marca o filho `slot="footer"` do usuário)                                                                                                                                                                                                                                                                                                     |
| `ark-drawer`          | `drawer`           | `drawer-header`, `drawer-title`, `drawer-close`, `drawer-footer` / `drawer-actions` (marcam os seus filhos `slot="footer"` / `slot="actions"`)                                                                                                                                                                                                                                                                  |
| `ark-empty`           | `empty`            | `empty-heading`, `empty-description`, `empty-icon` / `empty-action` (marcam os filhos slot do usuário)                                                                                                                                                                                                                                                                                                          |
| `ark-kbd`             | `kbd`              | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-kv-editor`       | `kv-editor`        | `kv-editor-row`, `kv-editor-enabled`, `kv-editor-key`, `kv-editor-value`, `kv-editor-secret`, `kv-editor-type`, `kv-editor-description`, `kv-editor-delete` (por linha), `kv-editor-add`, `kv-editor-bulk` (a textarea), `kv-editor-bulk-toggle`, `kv-editor-list`, `kv-editor-empty`; os controles compostos mantêm o próprio `data-ark` (`input`, `select`, `checkbox`) sem testid                            |
| `ark-data-view`       | `data-view`        | `data-view-search`, `data-view-sort`, `data-view-views`, `data-view-view-{table,cards}`, `data-view-selection`, `data-view-select-all`, `data-view-table`, `data-view-list`, `data-view-row`/`data-view-card` (+ `data-ark-row`), `data-view-cell`, `data-view-select`, `data-view-handle`, `data-view-empty`, `data-view-pagination`; o resto em Atributos principais                                          |
| `ark-pagination`      | `pagination`       | `pagination-summary`, `pagination-page-size`, `pagination-pages`, `pagination-previous`, `pagination-page` (cada número, + `data-ark-page`), `pagination-gap`, `pagination-next`                                                                                                                                                                                                                                |
| `ark-mark`            | `mark`             | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-menu`            | `menu`             | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-menu-group`      | `menu-group`       | `menu-group-label`                                                                                                                                                                                                                                                                                                                                                                                              |
| `ark-menu-item`       | `menu-item`        | `menu-item-check`; itens `divider` e `static` levam `menu-divider` / `menu-static` como hook principal                                                                                                                                                                                                                                                                                                          |
| `ark-nav`             | `nav`              | `nav-toggle` (o botão de recolher); `nav-header` / `nav-footer` (marcam os seus filhos com slot)                                                                                                                                                                                                                                                                                                                |
| `ark-nav-group`       | `nav-group`        | `nav-group-heading`                                                                                                                                                                                                                                                                                                                                                                                             |
| `ark-nav-item`        | `nav-item`         | `nav-item-link` (modo href), `nav-item-label`; `nav-item-icon` / `nav-item-trailing` (marcam os seus filhos com slot); um item `divider` leva `nav-divider` como hook principal                                                                                                                                                                                                                                 |
| `ark-progress`        | `progress`         | `progress-track`, `progress-bar`, `progress-value`                                                                                                                                                                                                                                                                                                                                                              |
| `ark-radio`           | `radio`            | `radio-dot`, `radio-label` (quando há `label`), `radio-helper` (quando há `helper`), `radio-input` (o input nativo oculto)                                                                                                                                                                                                                                                                                      |
| `ark-radio-group`     | `radio-group`      | `radio-group-label`, `radio-group-helper` ou `radio-group-error` (a mensagem, nomeada pelo que mostra)                                                                                                                                                                                                                                                                                                          |
| `ark-tab`             | `tab`              | `tab-close`, `tab-dirty`                                                                                                                                                                                                                                                                                                                                                                                        |
| `ark-tabs`            | `tabs`             | `tabs-actions` (marca o filho `slot="actions"` do usuário)                                                                                                                                                                                                                                                                                                                                                      |
| `ark-textarea`        | `textarea`         | `textarea-label`, `textarea-helper`/`textarea-error`                                                                                                                                                                                                                                                                                                                                                            |
| `ark-time`            | `time`             | `time-value` (o `<time>`)                                                                                                                                                                                                                                                                                                                                                                                       |
| `ark-tooltip`         | `tooltip`          | `tooltip-bubble` (o balão do componente ou o seu filho `slot="content"`)                                                                                                                                                                                                                                                                                                                                        |
| `ark-tree`            | `tree`             | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-tree-item`       | `tree-item`        | `tree-item-row` (o treeitem), `tree-item-toggle`, `tree-item-check`, `tree-item-icon` (o ícone próprio, quando desenhado; `data-ark-icon` diz qual: `folder`, `folder-open` ou `file`), `tree-item-label`                                                                                                                                                                                                       |
| `ark-toaster`         | `toaster`          | `toaster-toast` (+ `data-toast-id`), `toaster-toast-title`, `toaster-toast-description`, `toaster-toast-close`, `toaster-toast-action`, `toaster-toast-cancel`                                                                                                                                                                                                                                                  |
| `ark-chart`           | `chart`            | o contêiner do gráfico (`[part="canvas"]`) leva `data-ark="chart"` e o testid                                                                                                                                                                                                                                                                                                                                   |
| `ark-wysiwyg-editor`  | `wysiwyg-editor`   | `wysiwyg-editor-toolbar` (quando a toolbar aparece), `wysiwyg-editor-content` (o `role="textbox"` editável, onde os testes digitam)                                                                                                                                                                                                                                                                             |
| `ark-wysiwyg-viewer`  | `wysiwyg-viewer`   | `wysiwyg-viewer-content`                                                                                                                                                                                                                                                                                                                                                                                        |
| `ark-code-editor`     | `code-editor`      | a raiz do CodeMirror (`.cm-editor`) leva `data-ark="code-editor"` e o testid                                                                                                                                                                                                                                                                                                                                    |

Na maioria dos componentes o hook principal fica no próprio host, já que o host é o controle ou o container. Ele fica num nó interno em `ark-input`, `ark-textarea` e `ark-select` (o campo nativo), `ark-checkbox`, `ark-radio` e `ark-switch` (o `<button>` desenhado), `ark-file-input` (o input nativo oculto), `ark-calendar`, `ark-clock` e `ark-scheduler` (o container raiz) e `ark-toaster` (a pilha). `input-prefix`/`input-suffix` são aplicados aos seus próprios elementos `slot="prefix"`/`slot="suffix"` e `carousel-slide-{i}` aos seus próprios slides.

Prefira sempre seletores semânticos (`getByRole("switch", { name: "..." })`) quando possível — os hooks são a rede de segurança para instâncias repetidas e asserções visuais.

**Atributos espelhados no host.** Os elementos são light DOM e os atributos são a API, então o que você escreve no host fica lá e é espelhado no controle nativo: `placeholder` (e `aria-label`, onde é repassado) está no `ark-input` e no `<input>` dele, e o mesmo vale para o `ark-textarea` e para o `ark-input` que o `ark-datepicker` e o `ark-command-palette` compõem. Uma consulta por esse atributo (`getByPlaceholderText` do Testing Library, ou `getByLabelText` com `aria-label`; `getByPlaceholder` do Playwright; um CSS `[placeholder="…"]`) acha os dois e falha por ambiguidade. Consulte o controle: por papel e nome (`getByRole("textbox", { name: "E-mail" })`, que precisa de `label` ou `aria-label`, já que o Testing Library não usa o placeholder como nome), pelo `<label for>` real que o `label` renderiza (`getByLabelText`), pelo `testid` (que vai para o controle nativo) ou dentro do host (`within(host).getByPlaceholderText("…")`).

---

## 📐 Convenções

- **Nomes**: elementos `ark-*`, tipos/classes TypeScript `Ark*`, helpers de animação `ark*` (`arkEnter`, `arkStaggerEnter`…; os demais helpers, como `trapFocus`, `openPopover` ou `resolveLocale`, não levam prefixo), custom properties CSS `--ark-*`, pacotes `@tooark/*`.
- **Camadas**: um pacote só pode depender das camadas abaixo dele. Bibliotecas de animação nunca entram em `@tooark/core` ou `@tooark/web-components`.
- **Light DOM**: os componentes nunca movem nem envolvem os filhos que você declara. O host é o próprio controle ou container estilizado (`ark-button`, `ark-toggle`, `ark-toggle-group`, `ark-input`, `ark-carousel`), então os frameworks continuam donos dos filhos.
- **Acessibilidade**: `prefers-reduced-motion` é respeitado globalmente pelos motion tokens; as stories rodam checagens do axe-core.

---

## 🪪 Contribuindo

Bugs e pedidos de funcionalidade entram pelos [templates de issue](https://github.com/Tooark/web-components/issues/new/choose); o [CONTRIBUTING.md](CONTRIBUTING.md) cobre o fluxo de desenvolvimento, a convenção de commits (Conventional Commits em português, assinatura DCO) e o checklist de um componente novo. Dúvidas e onde achar ajuda estão no [SUPPORT.md](SUPPORT.md). Questões de segurança seguem o [SECURITY.md](SECURITY.md) (advisories privados, nunca uma issue pública), e todo mundo no espaço do projeto segue o [Código de Conduta](CODE_OF_CONDUCT.md).

---

## 🆘 Ajuda & Segurança

- ❓ **Dúvidas, bugs e ideias** — veja o [SUPPORT.md](SUPPORT.md) para escolher o canal certo
- 🔒 **Vulnerabilidades de segurança** — **não** abra issue pública; siga o [SECURITY.md](SECURITY.md)

---

## 💖 Apoie

Se este projeto ajuda no seu dia a dia, considere apoiar o desenvolvimento:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)

Cada contribuição ajuda a manter o projeto ativo e em evolução. Obrigado! 🙏

---

## 📄 Licença

Licenciado sob a [Apache License 2.0](LICENSE) © 2026 Tooark.

Os avisos de atribuição estão em [NOTICE](NOTICE); as licenças das dependências de terceiros estão documentadas em [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
