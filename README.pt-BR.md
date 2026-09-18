# Tooark Web Components

[![Tests](https://github.com/Tooark/web-components/actions/workflows/tests.yml/badge.svg)](https://github.com/Tooark/web-components/actions/workflows/tests.yml)
[![Licença](https://img.shields.io/github/license/Tooark/web-components?color=blue&label=licen%C3%A7a)](LICENSE)
[![Versão](https://img.shields.io/github/package-json/v/Tooark/web-components?label=vers%C3%A3o&color=informational)](package.json)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-339933?logo=node.js&logoColor=white)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)](pnpm-workspace.yaml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](tsconfig.base.json)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](packages/tokens/tokens.css)
[![Storybook](https://img.shields.io/badge/Storybook-10-FF4785?logo=storybook&logoColor=white)](apps/storybook)

Biblioteca de componentes agnóstica de framework construída sobre **Web Components** nativos (Custom Elements), com wrappers dedicados para **React**, **Vue** e **Angular**. Os componentes seguem a convenção da família **Ark** (elementos `ark-*`, tipos `Ark*`, tokens CSS `--ark-*`) e são estilizados com **Tailwind CSS v4** sobre uma camada compartilhada de design tokens.

🌍 **Idiomas:** [![USA Flag](https://flagcdn.com/w20/us.png) English](https://github.com/Tooark/web-components/blob/main/README.md) · ![Brazil Flag](https://flagcdn.com/w20/br.png) **Português (este arquivo)**

---

## Arquitetura

O monorepo é organizado em camadas — cada pacote depende apenas das camadas abaixo dele:

```text
┌─────────────────────────────────────────────────────────┐
│                  Wrappers de framework                  │
│   @tooark/react   ·   @tooark/vue   ·   @tooark/angular │
├─────────────────────────────────────────────────────────┤
│                 @tooark/web-components                  │
│      Custom Elements nativos (componentes ark-*)        │
├──────────────┬──────────────────────────┬───────────────┤
│ @tooark/chart│      @tooark/core        │@tooark/wysiwyg│
│  (ECharts)   │ tipos · i18n · serviços  │   (Tiptap)    │
│              │  presets de motion/WAAPI │               │
├──────────────┴──────────────────────────┴───────────────┤
│                     @tooark/tokens                      │
│  primitivas de design · custom properties CSS (--ark-*) │
├─────────────────────────────────────────────────────────┤
│                     @tooark/motion                      │
│       pacote opt-in de animação (lib Motion)            │
└─────────────────────────────────────────────────────────┘
```

---

## Pacotes

| Pacote                   | Descrição                                                                                                                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tooark/tokens`         | Primitivas de design: cores semânticas (intents), escala de tamanhos, raios e motion tokens (`--ark-duration-*`, `--ark-ease-*`), expostos como custom properties CSS e valores `@theme` do Tailwind v4.                            |
| `@tooark/core`           | Fundação compartilhada: tipos TypeScript (`ArkIntent`, `ArkSize`, …), locales de i18n (`en`, `pt`, `es`), os serviços de toast e announce, a camada de motion sem dependências (presets CSS + helpers WAAPI `arkEnter`/`arkExit`) e os helpers de overlay (`trapFocus`, `openPopover`/`closePopover`). |
| `@tooark/web-components` | Os Custom Elements nativos: `ark-button`, `ark-calendar`, `ark-carousel`, `ark-clock`, `ark-datepicker`, `ark-input`, `ark-scheduler`, `ark-switch`, `ark-toaster`, `ark-toggle` e `ark-toggle-group`.                              |
| `@tooark/react`          | Wrappers React com props tipadas.                                                                                                                                                                                                   |
| `@tooark/vue`            | Wrappers Vue 3.                                                                                                                                                                                                                     |
| `@tooark/angular`        | Componentes wrapper para Angular.                                                                                                                                                                                                   |
| `@tooark/chart`          | `ark-chart` — gráficos baseados em [ECharts](https://echarts.apache.org/) (peer dependency).                                                                                                                                        |
| `@tooark/wysiwyg`        | `ark-wysiwyg` — editor de texto rico e viewer baseados em [Tiptap](https://tiptap.dev/).                                                                                                                                            |
| `@tooark/motion`         | Helpers avançados de animação, **opt-in**, sobre a lib [Motion](https://motion.dev/): entrada escalonada de listas, scroll reveal, reordenação FLIP e gestos de swipe com física de spring.                                         |

---

## Componentes

| Elemento           | Pacote         | Destaques                                                                                                                                                                                                           |
| ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-badge`        | web-components | Rótulo curto de status/categoria: intents, `soft`/`solid`/`outline`, `xs`–`md`, `rounded`, `color` própria via `color-mix`. O host é o badge; ícone e texto ficam como filhos.                                      |
| `ark-button`       | web-components | Intents, tamanhos, variantes (solid/outline/ghost), `rounded` (até `full`), estados `loading`/`icon-only`/`full-width`, feedback `status` (glifo de sucesso/erro + anúncio) e modo link (`href`).                   |
| `ark-calendar`     | web-components | Grid de mês inline: localizado, teclado WAI-ARIA, motion, views de mês/ano no título e eventos com cor (`dots`/`count`/`list`).                                                                                     |
| `ark-carousel`     | web-components | CSS scroll snap nativo (touch/trackpad rolam nativamente, arrasto com mouse emulado), autoplay, loop, dots e setas. Os slides continuam sendo seus filhos diretos.                                                  |
| `ark-clock`        | web-components | Seleção de hora em colunas digitais (hora/minuto/segundo), 24h/12h, step de minutos, localizado.                                                                                                                    |
| `ark-datepicker`   | web-components | Compõe `ark-input` + `ark-calendar` + `ark-clock`: `mode` datetime (padrão)/date/time, inline ou campo+popup, parse de digitação, formulário.                                                                       |
| `ark-dialog`       | web-components | Diálogo modal sobre a Popover API (top layer, scrim por `::backdrop`, sem portal): o host é o painel, seus filhos são o corpo, `slot="footer"` é o rodapé; cabeçalho de `label`, focus trap, Esc/scrim, `sm`–`xl`.  |
| `ark-empty`        | web-components | Estado vazio: caixa tracejada com `slot="icon"` apagado, `heading` (h3), `description` e um botão opcional em `slot="action"`; os filhos ficam no lugar, ordenados por CSS.                                         |
| `ark-input`        | web-components | Campo de texto padronizado: label, helper/erro com aria, prefixo/sufixo via `slot`, `reveal` de senha, atributos nativos repassados, tamanhos, intents, `rounded`.                                                  |
| `ark-menu`         | web-components | Menu suspenso/de contexto sobre a Popover API (`role="menu"`, `popover="auto"`): ancorado ao gatilho por `for`, `align`/`direction` com flip, teclado, `openAt(x, y)`; itens ficam como filhos. Emite `ark-select`. |
| `ark-menu-item`    | web-components | Item de menu (o host é o item): filhos livres, `slot="trailing"`, `disabled`, `intent`, `checked` (item checkbox), `divider`, `static` (conteúdo não interativo).                                                   |
| `ark-scheduler`    | web-components | Agenda com views `week`/`day` (timeline por horário e sobreposição em colunas), `month` e `agenda`; eventos coloridos e clicáveis.                                                                                  |
| `ark-select`       | web-components | `<select>` nativo estilizado como o `ark-input`: label, helper/erro com aria, `placeholder`, opções por dados (atributo `options` em JSON ou propriedade JS, `group` → `<optgroup>`), tamanhos, intents, `rounded`. |
| `ark-skeleton`     | web-components | Placeholder de carregamento: o host é o bloco (`.ark-skeleton`, `aria-hidden`), dimensionado pela sua class/style; `rows` renderiza barras, `animated` liga o pulso, `rounded`.                                     |
| `ark-switch`       | web-components | Switch on/off acessível (`role="switch"`): texto ON/OFF e ícones ✓/✕ opcionais, intents, participação em formulário via checkbox oculto.                                                                            |
| `ark-tab`          | web-components | Aba (`role="tab"`, o host é o controle): filhos livres, `disabled`, `controls`, `closable` e `dirty` na variante editor. Emite `ark-close`.                                                                         |
| `ark-tabs`         | web-components | Faixa de abas (`role="tablist"`): `underline`/`chips`/`editor`, roving tabindex com setas/Home/End, `slot="actions"` no fim, `change` com o value ativo. Painéis ficam com o app.                                   |
| `ark-textarea`     | web-components | Campo multilinha com a grid do `ark-input`: `rows`, `autosize` (`field-sizing` nativo, fallback JS), `monospace`, `resize`, helper/erro com aria, tamanhos, intents, `rounded`.                                     |
| `ark-toaster`      | web-components | Toasts no estilo Sonner: API programática, posições, rich colors, ações, entrada/saída animadas, botão de fechar localizado.                                                                                        |
| `ark-toggle`       | web-components | Botão de estado pressionado (`aria-pressed`), standalone (outline/tinted por intent) ou como item de grupo.                                                                                                         |
| `ark-toggle-group` | web-components | Segmented control: seleção exclusiva (padrão) ou múltipla, `value` sincronizado, propaga `size`/`intent`/`theme`/`disabled` aos itens.                                                                              |
| `ark-tooltip`      | web-components | Tooltip sobre a Popover API: envolve o gatilho sem movê-lo, texto por `content` ou `slot="content"` rico, `side` com flip, `delay`, hover/foco/Esc, `aria-describedby` no gatilho.                                  |
| `ark-chart`        | chart          | Tipos de gráfico do ECharts com suporte a temas.                                                                                                                                                                    |
| `ark-wysiwyg`      | wysiwyg        | Editor + viewer somente leitura baseados em Tiptap.                                                                                                                                                                 |

### Atributos principais

**`ark-badge`** — o próprio host é o badge (`inline-flex`); ícone e texto entram como filhos. `intent` (padrão `neutral`), `variant` (`soft`, padrão / `solid` / `outline`), `size` (`xs`/`sm`/`md`; a altura vem da fonte e do padding, não do token de tamanho dos controles), `rounded` (padrão `full`), `color` (qualquer cor CSS no lugar do intent: texto na cor, fundo suave ou contorno via `color-mix`, texto branco em `solid`), `theme`. Não é interativo: um badge clicável é um `ark-button` pequeno.

**`ark-button`** — o próprio host é o controle (`role="button"`, foco, teclado, participação em formulário via ElementInternals), então `aria-label`, `class` e `id` em `<ark-button>` valem diretamente e os filhos nunca são movidos. `variant` (`solid`/`outline`/`ghost` ou um intent), `intent`, `size` (`xs`–`xl`), `rounded` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`full` — com `icon-only`, `full` gera um botão circular), `loading` (spinner + `aria-busy` + clique bloqueado), `icon-only` (quadrado: `min-width` igual ao token de tamanho), `full-width`, `href`/`target` (um `<a>` "esticado" cobre o host, recebe o foco e é nomeado pelo conteúdo do host; `_blank` ganha `rel="noopener noreferrer"`), `disabled`, `type`, `theme`, `color`/`text-color`. `status` (`idle`, padrão / `success` / `error`) troca o glifo da frente por um check ou um círculo de alerta com `.ark-animate-fade-in`; `loading` vence; o app limpa, o botão só mostra. Quando `status` vira `success` ou `error`, o botão anuncia `status-label` aos leitores de tela pelo serviço `announce()` do core (`polite` no sucesso, `assertive` no erro), então nenhuma live region entra no nome acessível do botão; sem `status-label` nada é anunciado. JS: `status`, `statusLabel`.

**`ark-calendar`** — `value` (`YYYY-MM-DD`, interpretado no fuso local), `min`/`max`, `lang` (`en`/`pt`/`es`/`custom` + `locale-json`), `theme`, `intent`, `accent-color`. Título clicável alterna dias → meses → anos. Eventos: atributo `events` (JSON) ou propriedade JS `events` com `{ date, label?, color?, intent? }`, exibidos conforme `event-display` (`dots` padrão, `count`, `list`). Emite `ark-change` com `detail: { value, date, events }`. Navegação por teclado: setas movem entre dias (cruzando meses), `Home`/`End` início/fim do mês, `PageUp`/`PageDown` trocam de mês.

**`ark-clock`** — `value` (`HH:mm[:ss]`, sempre 24h internamente), `seconds` (coluna de segundos), `step-minutes`, `hours-format` (`24` padrão ou `12` com coluna AM/PM), `lang`, `theme`, `intent`. Emite `ark-change` com `detail: { value }`.

**`ark-input`** — `type`, `label` (vira `<label for>` real), `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message` (com `aria-invalid`/`aria-describedby`), `disabled`, `required`, `readonly`. Prefixo e sufixo via filhos com `slot="prefix"`/`slot="suffix"`, posicionados sobre as pontas do campo sem serem movidos. `reveal` num campo `type="password"` adiciona um botão de mostrar/ocultar (`aria-pressed`, rotulado por `lang`/`locale-json`) que alterna o tipo; convive com um sufixo do usuário. Atributos nativos são espelhados no `<input>` interno sem interpretação: `autocomplete`, `autofocus`, `inputmode`, `maxlength`, `minlength`, `pattern`, `min`, `max`, `step`, `spellcheck`, `aria-label`. Para composição: `focus()` e o getter `inputElement`.

**`ark-datepicker`** — compõe `ark-input` + `ark-calendar` + `ark-clock`. `mode`: `datetime` (padrão, valor `YYYY-MM-DDTHH:mm:ss`), `date` (`YYYY-MM-DD`) ou `time` (`HH:mm:ss`). Sem `input`, renderiza os painéis inline; com `input`, campo + popup. `format` com tokens `YYYY`/`MM`/`DD`/`HH`/`mm`/`ss` (sensível a maiúsculas; padrão `MM/DD/YYYY HH:mm` em `en`, `DD/MM/YYYY HH:mm` nos demais), `placeholder`, `seconds`, `name` (formulário com valor ISO via input hidden), `disabled`, e repassa `min`/`max`/`events`/`event-display`/`step-minutes`/`hours-format` aos painéis. Digitação com validação (entrada inválida reverte); no modo `date` selecionar fecha o popup, no `datetime` ele permanece aberto para escolher a hora; `Esc`/clique fora fecham.

**`ark-dialog`** — o host é o painel, aberto como `popover="manual"` (top layer, `::backdrop` como scrim, sem portal nem `z-index`); seus filhos são o corpo e ficam onde estão, e um filho com `slot="footer"` vira o rodapé (ações alinhadas ao fim, sticky no fundo do painel rolável, ou no fundo do painel quando ele é mais alto que o conteúdo) só por CSS. O componente adiciona o cabeçalho (um `h2` a partir de `label` mais o botão de fechar) como primeiro filho, para a leitura começar pelo título. `open` (refletido, a fonte da verdade: `show()`, `close(reason)` e a propriedade `open` só o alternam, então um framework que remove o atributo ainda recebe a animação de saída), `size` (`sm` / `md`, padrão / `lg` / `xl` / `full`, que ocupa a viewport sem cantos), `width`/`height` (um comprimento CSS, número puro em px; cada um sobrescreve o preset no seu eixo e continua limitado à margem da viewport; sem `height` o painel tem a altura do conteúdo), `label` (título e nome acessível via `aria-labelledby`; sem ele dê um `aria-label` ao host, senão o componente avisa uma vez), `no-close-button`, `persistent` (Esc e scrim não fecham), `theme`, `lang`/`locale-json` (rótulo de fechar), `testid`. O foco vai ao primeiro filho com `autofocus`, senão ao primeiro focável do corpo, senão ao botão de fechar, senão ao painel, e volta ao opener ao fechar. Emite `ark-open` e `ark-close` com `detail: { reason: "escape" | "backdrop" | "close-button" | "api" }` quando o fechamento começa. Motion: entra com `scale`, sai com `fade` (antes de sair do top layer), scrim só por opacidade; troque a cor do scrim com `--ark-dialog-scrim`. **Limite:** a Popover API não torna o resto da página `inert`. O trap mantém o foco do teclado dentro e cancela eventos de ponteiro iniciados fora do painel (popovers abertos por cima, como um menu ou o toaster, continuam usáveis), mas um leitor de tela navegando pelo cursor virtual ainda alcança o conteúdo atrás do diálogo.

**`ark-empty`** — o host é a caixa tracejada; seus filhos ficam onde estão: um filho com `slot="icon"` (apagado; um `svg` dentro ganha 2.5rem) e um com `slot="action"` (um `ark-button`, ou vários). `heading` (um `h3`) e `description` (um `p`) são criados pelo componente. A ordem visual é ícone, título, descrição, qualquer outro filho, ação, seja qual for a ordem do DOM. `theme`, `testid`. Não é interativo e não tem role próprio.

**`ark-menu`** — o host é o painel (`role="menu"`), aberto como `popover="auto"` (top layer, light dismiss e Esc nativos, sem portal nem `z-index`); as `ark-menu-item` filhas ficam onde estão. Ligue um gatilho com `for="<id>"`: o componente só escreve `aria-haspopup`, `aria-expanded` e `aria-controls` nele (e um `id` quando falta), nomeia o menu por ele com `aria-labelledby`, alterna no clique e abre com ArrowDown/ArrowUp; o gatilho pode montar depois do menu (resolvido ao conectar e observado até aparecer). `align` (`start`, padrão / `end`), `direction` (`down`, padrão / `up`; vira quando não cabe), `open` (refletido do estado do popover), `size` e `theme` (propagados aos itens), `testid`. JS: `show()`, `hide()`, `openAt(x, y)` para um menu de contexto num ponto (enquanto aberto num ponto o menu passa a `popover="manual"` e fecha ele mesmo no pointerdown fora). Dentro: setas com ciclo pulando itens desabilitados, divisores e estáticos, Home/End, Enter/Espaço selecionam, Esc fecha e devolve o foco ao gatilho, Tab fecha. Emite `ark-select` com `detail: { value }` (o evento do próprio item é consumido; o menu fecha em seguida), `ark-open` e `ark-close`. Posicionado por JS a partir de `getBoundingClientRect()` (`positionAnchored`, ver os helpers de overlay); entrada e saída são transições CSS (`scale` a partir do canto de origem, `fade` na saída), então o light dismiss também anima.

**`ark-menu-item`** — o host é o item (`role="menuitem"`, foco, teclado); ícone e texto entram como filhos e um atalho ou badge num filho com `slot="trailing"`. `value`, `disabled`, `intent` (`danger` para ações destrutivas; qualquer intent colore texto e hover), `checked` (vira um `menuitemcheckbox` com `aria-checked` e um check ao fim; `checked="false"` é um desmarcado), `divider` (`role="separator"`), `static` (conteúdo não interativo como nome e e-mail do usuário; `role="presentation"`, fora do ciclo das setas; herda a cor de texto esmaecida, então pinte seus filhos com os tokens, ex.: `var(--ark-color-fg)` no nome). JS: `select()`.

**`ark-scheduler`** — `view` (`week` padrão, `day`, `month`, `agenda`), `date` (data de referência, sincronizada ao navegar), `events` (atributo JSON ou propriedade JS) com `{ id?, title, start, end?, allDay?, location?, color?, intent? }`, `views` (limita o seletor, ex.: `"day,week"`), `hour-start`/`hour-end`, `slot-minutes` (15–60), `hours-format`, `lang`, `theme`, `intent`. Emite `ark-event-click` (`{ event, id }`), `ark-slot-click` (`{ start, end, allDay }` — clique num espaço livre ou num dia), `ark-view-change` (`{ view }`) e `ark-range-change` (`{ start, end, view }`). As views de horário posicionam os eventos por horário, resolvem sobreposições em colunas e marcam a hora atual.

**`ark-select`** — um `<select>` nativo com a grid do `ark-input` (label, campo, mensagem) e um chevron desenhado pelo componente, então teclado, leitor de tela e seletor mobile vêm de graça. As opções vêm de dados, nunca de filhos: atributo `options` (JSON) ou propriedade JS (`{ value, label, disabled?, group? }[]`; `group` gera um `<optgroup>`). `label`, `placeholder` (opção vazia desabilitada e oculta, mostrada até algo ser escolhido), `value`, `name`, `size` (`xs`–`xl`), `intent`, `rounded`, `helper`, `error`/`error-message`, `disabled`, `required`, `theme`. JS: `selectElement`, `value`, `options`, `focus()`. Emite `change` com `detail: { value }` (o change nativo não sobe uma segunda vez) e `input`.

**`ark-skeleton`** — o host é o bloco (o `.ark-skeleton` do core: fundo muted suave e raio; `aria-hidden` porque não há nada para ler). Largura e altura vêm da sua `class` ou `style` (altura padrão 1rem). `rows` acima de 1 troca o bloco por essa quantidade de barras em coluna, a última mais curta; `animated` liga o brilho que varre (`.ark-skeleton-animated`: uma faixa clara percorre o bloco, com fase deslocada por bloco e por barra para nada piscar em sincronia; estático por padrão e parado sob `prefers-reduced-motion`); `rounded` (`none`–`full`, padrão o `lg` do preset), `theme`, `testid`. Não há elemento de reveal: dê `.ark-animate-fade-in` ao conteúdo que substitui o skeleton. JS: `rows`, `animated`.

**`ark-switch`** — `checked`, `disabled`, `size`, `intent`, `theme`, `color`, `labels` (mostra ON/OFF no trilho; textos customizáveis via `label-on`/`label-off`), `icons` (✓/✕ no polegar), `label` (rótulo acessível), `name`/`value` (submissão em formulário quando marcado). Emite `change` com `detail: { checked }`.

**`ark-toggle`** — `pressed`, `value`, `disabled`, `size`, `intent`, `theme`. Emite `change` com `detail: { pressed, value }`.

**`ark-toggle-group`** — `value` (valor(es) selecionado(s), sincronizado com os itens), `multiple`, `disabled`, `size`, `intent`, `theme`. Emite `change` com `detail: { value }` (exclusivo) ou `detail: { values }` (múltiplo).

**`ark-carousel`** — o host é o container rolável e seus slides são filhos diretos dele. `slides-per-view`, `gap` (px), `start-index`, `loop`, `autoplay`/`autoplay-delay` (pausa em hover/foco e desliga com `prefers-reduced-motion`), `show-dots`/`show-arrows` (`"false"` esconde), `drag-free`, `snap` (`mandatory`/`proximity`), `intent`, `accent-color`, `theme`. API JS: `index`, `slides`, `next()`, `prev()`. Emite `ark-slide-change` com `detail: { index }`.

**`ark-tabs`** — o host é o `role="tablist"`; as `ark-tab` filhas ficam onde estão e um filho com `slot="actions"` (ex.: um `ark-button` "+") vai para o fim da faixa só por CSS. `value` (aba ativa; sem ele a primeira habilitada é selecionada em silêncio), `variant` (`underline`, padrão / `chips` / `editor`), `size`, `intent`, `rounded` (cantos das abas: chips com padrão `full`, `editor` arredonda só o topo, as demais padrão `none`), `fill` (pintura da aba ativa: `none`, `soft` ou `solid` com a cor do intent e texto de contraste; chips com padrão `soft`, as demais `none`), `theme`, `label` (→ `aria-label`), `lang`/`locale-json` (rótulos de fechar e não salvo); `variant`, `size`, `intent`, `rounded`, `fill`, `theme` e idioma são propagados às abas. Teclado: setas, Home e End movem o foco e selecionam (ativação automática), pulando abas desabilitadas. Emite `change` com `detail: { value }` (o evento da própria aba é consumido). Quando a aba ativa é removida do DOM, a vizinha assume e `change` dispara. Sem motion na troca. Os painéis são do app: aponte cada aba ao seu painel com `controls`.

**`ark-tab`** — o host é o `role="tab"` (`aria-selected`, `tabindex` roving); ícone, texto ou badge entram como filhos. `value`, `disabled`, `controls` (→ `aria-controls`) e, na variante `editor`, `closable` (botão de fechar fora da ordem de Tab, mais clique do meio e tecla Delete; emite `ark-close` com `detail: { value }` — remover a aba é do app) e `dirty` (ponto estático de não salvo, nomeado para leitores de tela). JS: `select()`, `close()`.

**`ark-textarea`** — a grid e os atributos do `ark-input` (`label`, `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message`, `disabled`, `required`, `readonly`) num `<textarea>` nativo, mais `rows` (padrão 3), `autosize` (cresce com o conteúdo: `field-sizing: content` onde existe, medição por JS no resto), `monospace` e `resize` (`vertical`, padrão, ou `none`). Uma linha alinha com um `ark-input` do mesmo tamanho. Atributos nativos espelhados: `autocomplete`, `autofocus`, `maxlength`, `minlength`, `spellcheck`, `wrap`, `aria-label`. Emite `input`/`change` nativos; JS: `value`, `textareaElement`, `focus()`.

**`ark-tooltip`** — o host envolve o gatilho (seu primeiro filho sem `slot`; ele precisa ser focável por conta própria, ex.: um botão) sem movê-lo e cria o balão (`role="tooltip"`, `popover="manual"`, então escapa de `overflow` e fica no top layer). Texto por `content`, ou conteúdo rico num filho com `slot="content"`, que passa a ser o próprio balão (o componente só acrescenta `popover`, `role`, um `id` e o hook nele; o visual vem do CSS). `side` (`top`, padrão / `bottom` / `left` / `right`; vira quando não cabe), `delay` (ms antes de abrir no hover, padrão 200; o foco abre na hora), `open` (refletido), `theme`, `testid`. Abre em hover e foco, fecha ao sair, ao perder o foco, com Esc e no pointerdown no gatilho; passar o ponteiro sobre o balão o mantém aberto. O gatilho recebe `aria-describedby` apontando para o balão. Motion: entra com `fade` em `quick`, sem animação de saída. JS: `show()`, `hide()`.

**`ark-toaster`** — `position` (`top-left` … `bottom-right`), `rich-colors`, `close-button` (`"false"` esconde), `max-visible`, `duration` (ms; `0` mantém o toast até ser fechado), `lang`, `theme`. Alimentado pelo serviço `toast` do `@tooark/core` (ou pelos métodos `toast()`/`dismiss()`); emite `ark-toast-action` com `detail: { id, actionId }` ao clicar num botão de ação.

**`announce()`** (serviço, `@tooark/core`) — `announce(text, politeness = "polite")` fala uma mensagem para leitores de tela por uma única live region oculta anexada ao `document.body` (`data-ark="announcer"`, com um filho `role="status"` para `polite` e um `role="alert"` para `assertive`). Os componentes o usam para anunciar um resultado no lugar (o `status` de um botão, "copiado", arquivos escolhidos) sem criar live regions dentro do host, onde o texto entraria no nome acessível do controle. Chamar de novo com o mesmo texto anuncia de novo; sem DOM é no-op.

**Helpers de overlay** (`@tooark/core`) — as peças de que o `ark-dialog` é feito, para overlays seus sobre a Popover API. `trapFocus(container, { initial, returnTo, onOutsidePointer })` devolve a função que libera: Tab e Shift+Tab ciclam pelos focáveis do container, foco que escapa volta, eventos de ponteiro iniciados fora são cancelados na captura pelo gesto inteiro, então um clique no scrim que fecha o overlay nunca ativa o que está atrás (o `pointerdown` é reportado em `onOutsidePointer`, por exemplo para fechar no scrim), popovers abertos por cima ficam de fora, traps aninhados empilham, e liberar devolve o foco a `returnTo` (padrão: o elemento focado na ativação). `openPopover(host, preset, options)` chama `showPopover()` e depois `arkEnter`; `closePopover(host, preset, options)` roda `arkExit` primeiro e só então `hidePopover()`, e reabrir durante a saída a abandona. `positionAnchored(panel, anchor, { side, align, offset, padding, onPlace })` posiciona um painel `position: fixed` junto de um elemento ou de um retângulo `{ x, y, width, height }` a partir de `getBoundingClientRect()`: lado preferido com flip para o oposto quando não cabe, alinhamento ao longo do lado, deslizamento para caber na viewport; escreve `left`/`top`/`transform-origin` inline mais `data-ark-side`/`data-ark-align` no painel e reposiciona em scroll e resize até o dispose devolvido rodar. `focusableElements(root)` lista os elementos tabuláveis na ordem do DOM; `isPopoverOpen(host)` verifica `:popover-open`.

---

## Sistema de motion

O motion é desenhado em três camadas para que os componentes permaneçam livres de dependências:

1. **Tokens** (`@tooark/tokens`) — durações (`--ark-duration-none/instant/quick/default/moderate/gentle/slow/long`, 0–1000 ms), curvas de easing (`--ark-ease-linear/standard/in/out/in-out/overshoot`) e a distância de slide. `prefers-reduced-motion` zera todas as durações na camada de tokens, cobrindo o sistema inteiro de uma vez.
2. **Presets** (`@tooark/core`) — keyframes/classes CSS sem dependência (`.ark-animate-*`, `.ark-skeleton`, `.ark-skeleton-animated`) e helpers WAAPI (`arkEnter`, `arkExit`) usados pelos próprios componentes (ex.: entrada/saída dos toasts).
3. **`@tooark/motion`** (opt-in) — `arkStaggerEnter`, `arkReveal`, `arkFlip` e `arkSwipe` sobre a lib Motion, para física de spring e efeitos dirigidos por scroll. Só os projetos que instalam este pacote pagam pela lib.

Escala de duração (`ArkDuration` no TypeScript, `--ark-duration-*` no CSS, `ARK_DURATION_MS` como espelho em JS). Todos os helpers (`arkEnter`, `arkExit`, `@tooark/motion`) aceitam tanto o nome do token quanto um número em milissegundos:

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
| `in-out`    | `cubic-bezier(0.4, 0, 0.2, 1)`      | Mudanças de estado simétricas: shake, pulse, skeleton.                                                                  |
| `overshoot` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Entradas lúdicas que passam do ponto e acomodam (`backOut` do Motion). Para física de mola real use o `@tooark/motion`. |

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

## Começando

### Vanilla / qualquer framework

```ts
import { registerTooarkComponents } from "@tooark/web-components";
import "@tooark/web-components/styles.css";

registerTooarkComponents();
```

`styles.css` é a única folha de estilo necessária: reúne os design tokens, os presets de motion e os estilos dos componentes. É seguro carregá-la ao lado do seu próprio framework CSS:

- **Sem reset global.** O preflight do Tailwind não é embarcado; um reset escopado vale só dentro dos elementos `ark-*`.
- **Utilities e variáveis prefixadas.** Toda classe dos componentes é `ark:*` (ex.: `ark:inline-flex`) e as variáveis do theme são `--ark-*` (ex.: `--ark-color-primary`), então nada colide com um Tailwind v3/v4 do seu app.

```html
<ark-button intent="primary" size="md">Salvar</ark-button>
<ark-button icon-only rounded="full" intent="success" aria-label="Confirmar">✓</ark-button>

<ark-switch labels icons intent="success" label="Notificações"></ark-switch>

<ark-toggle-group value="dia">
  <ark-toggle value="dia">Dia</ark-toggle>
  <ark-toggle value="semana">Semana</ark-toggle>
  <ark-toggle value="mes">Mês</ark-toggle>
</ark-toggle-group>

<ark-input label="Nome" placeholder="Seu nome completo" helper="Como no documento"></ark-input>

<!-- Campo + popup; o formulário recebe o valor ISO em name="data" -->
<ark-datepicker input mode="date" lang="pt" name="data"></ark-datepicker>

<!-- Painéis inline (sem `input`): data + hora -->
<ark-datepicker lang="pt"></ark-datepicker>

<ark-calendar lang="pt" event-display="count"></ark-calendar>

<ark-clock hours-format="12" step-minutes="15"></ark-clock>

<ark-scheduler view="week" lang="pt" hour-start="8" hour-end="18"></ark-scheduler>

<ark-toaster position="bottom-right" lang="pt"></ark-toaster>
```

`events` do `ark-calendar`/`ark-scheduler` também aceita a propriedade JS, evitando serializar JSON no atributo:

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

toast.success("Salvo", { description: "Suas alterações foram publicadas." });
```

### React

```tsx
import { ArkButton, ArkDatepicker, ArkScheduler, ArkToaster } from "@tooark/react";
```

As props dos wrappers são camelCase e tipadas (`eventDisplay`, `stepMinutes`, `hoursFormat`, `hourStart`…); props de objeto (`events`, `localeJson`) são serializadas para o atributo automaticamente e os eventos customizados chegam como `onChange`/`onEventClick`/`onSlotClick`/`onViewChange`/`onRangeChange` recebendo o `detail`.

### Vue 3

```ts
import { ArkButton, ArkDatepicker, ArkScheduler, ArkToaster } from "@tooark/vue";
```

Os eventos mantêm o nome nativo (`@ark-change`, `@ark-event-click`, …) e entregam o `detail` diretamente.

### Angular

Importe os componentes wrapper de `@tooark/angular` (`ArkDatepickerComponent`, `ArkSchedulerComponent`, …). Cada um é standalone, usa o seletor `<ark-*-wrapper>` e reemite os eventos customizados como `@Output()` (`arkChange`, `arkEventClick`, `arkSlotClick`, `arkViewChange`, `arkRangeChange`).

O pacote é compilado com `ng-packagr` em partial compilation (Ivy), então funciona em builds AOT de produção. Exige Angular ≥ 21.2.19 (o mesmo piso que o workspace impõe por correções de segurança). Os custom elements são registrados sob demanda no construtor de cada wrapper e ignorados no servidor, então os wrappers são seguros para SSR.

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

- **`size`** (`xs`/`sm`/`md`/`lg`/`xl`) mapeia para os tokens `--ark-size-*` (1.5 / 1.75 / 2.25 / 2.75 / 3.25 rem, ou seja, 24 a 52 px). `ark-button`, `ark-input` e `ark-toggle` aplicam o token como `min-height` (e como `min-width` nos botões só de ícone), então controles do mesmo tamanho alinham numa linha e sobrescrever `--ark-size-md` redimensiona todos os controles de uma vez; o `ark-switch` usa dimensões proporcionais do track.
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

3. **Densidade.** `--ark-size-*` define a altura dos controles e `--ark-text-xs`/`--ark-text-sm` a maior parte do texto dentro deles (alguns micro-rótulos no calendário, no relógio, na agenda e no switch usam tamanhos fixos em pixel):

   ```css
   :root {
     --ark-size-sm: 2rem; /* 32 px */
     --ark-size-md: 2.5rem; /* 40 px */
     --ark-size-lg: 3rem; /* 48 px */
     --ark-text-sm: 0.75rem;
   }
   ```

Overrides de duração e easing seguem a regra do [sistema de motion](#sistema-de-motion): mantenha-os dentro de `@media (prefers-reduced-motion: no-preference)`.

`ark-chart` e `ark-wysiwyg` não podem ser tematizados só por CSS (ECharts e Tiptap pintam as próprias cores), então o `theme="auto"` deles resolve o `color-scheme` computado do host quando o elemento é criado: uma página que força `dark` recebe um gráfico escuro, uma página que o deixa em `light dark` (ou sem declarar) segue a preferência do sistema. Essa resolução não roda de novo quando a página troca de tema depois, então um app que alterna o tema em tempo de execução deve dirigir `theme="light|dark"` nesses dois elementos junto com a página.

Para reaproveitar os mesmos tokens como utilities (`bg-primary`, `text-fg-muted`, …) no seu próprio projeto Tailwind v4, importe-os no seu entry CSS:

```css
@import "tailwindcss";
@import "@tooark/tokens/tokens.css";
```

Isso é independente da folha de estilo dos componentes: eles carregam a própria cópia prefixada do theme, então a configuração do Tailwind do seu app nunca altera a aparência dos componentes.

---

## Desenvolvimento

Requisitos: **Node.js ≥ 22** e **pnpm 11** (versão fixada via `packageManager`).

```bash
pnpm install          # instala as dependências do workspace
pnpm build            # compila todos os pacotes
pnpm dev:storybook    # roda o Storybook em http://localhost:6006
pnpm clean            # remove os artefatos de build
pnpm check            # lint, formatação e ordem de imports (Biome)
pnpm check:fix        # aplica as correções e a formatação do Biome
```

Os pacotes de biblioteca compilam com Rollup (`tsc` nos wrappers React e Vue, `ng-packagr` no Angular). `@tooark/core` e `@tooark/web-components` também compilam seu entry CSS (`src/styles/index.css`) com o Tailwind CLI para `dist/styles.css` e em seguida rodam `scripts/check-css.mjs`, um smoke test que derruba o build se a folha de estilo não foi compilada ou não contém as classes esperadas. As classes dos componentes devem ser escritas com o prefixo `ark:` (`ark:flex`, `ark:hover:bg-surface-muted`); utilities sem prefixo não são geradas. O Storybook processa o mesmo CSS pelo plugin `@tailwindcss/vite`, então não existe configuração de PostCSS no repositório.

Lint, formatação e ordenação de imports ficam a cargo do [Biome](https://biomejs.dev/) (`biome.json` na raiz: linhas de 120 colunas, aspas duplas, sem vírgulas finais). O CI roda `biome ci` antes do build, então rode `pnpm check:fix` antes de commitar.

### Testes

Os testes de componente rodam com o **addon Vitest do Storybook**: cada story é executada como smoke test em um navegador Chromium real (Playwright), além de testes de interação (funções `play`) e checagens de acessibilidade (axe-core via `@storybook/addon-a11y`).

```bash
pnpm exec playwright install chromium        # download do navegador (uma vez)
pnpm --filter storybook test                 # roda a suíte
pnpm --filter storybook exec vitest run --project storybook --coverage
```

Os testes também podem ser disparados pela UI do Storybook (widget "Run tests"). O CI compila todos os pacotes (incluindo o smoke test do CSS) e depois roda a mesma suíte em cada push/PR via [GitHub Actions](.github/workflows/tests.yml).

### Hooks para testes e2e

Todo elemento interno criado por um componente carrega hooks estáveis para testes end-to-end, em duas camadas:

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
await page.locator('[data-ark="datepicker-day"][data-date="2026-09-15"]').click();
```

Hooks por componente:

| Componente         | Elemento principal | Partes internas                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-badge`        | `badge`            | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-button`       | `button`           | `button-spinner`, `button-status-icon`, `button-link` (modo href)                                                                                                                                                                                                                                                                                                                                               |
| `ark-scheduler`    | `scheduler`        | `scheduler-header`, `scheduler-today`, `scheduler-prev`, `scheduler-next`, `scheduler-title`, `scheduler-views`, `scheduler-view-{view}`, `scheduler-body`, `scheduler-scroller`, `scheduler-days`, `scheduler-grid`, `scheduler-day` (+ `data-date`), `scheduler-slot` (+ `data-start`), `scheduler-event` (+ `data-event-id`), `scheduler-event-more`, `scheduler-allday`, `scheduler-now`, `scheduler-empty` |
| `ark-select`       | `select`           | `select-label`, `select-chevron`, `select-helper`, `select-error`                                                                                                                                                                                                                                                                                                                                               |
| `ark-skeleton`     | `skeleton`         | `skeleton-row` (cada barra quando `rows` > 1)                                                                                                                                                                                                                                                                                                                                                                   |
| `ark-switch`       | `switch`           | `switch-thumb`, `switch-label-on`, `switch-label-off`, `switch-input`                                                                                                                                                                                                                                                                                                                                           |
| `ark-toggle`       | `toggle`           | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-toggle-group` | `toggle-group`     | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-calendar`     | `calendar`         | `calendar-prev`, `calendar-next`, `calendar-title`, `calendar-grid`, `calendar-day` (+ `data-date`), `calendar-months`/`calendar-month` (+ `data-month`), `calendar-years`/`calendar-year` (+ `data-year`), `calendar-event`, `calendar-event-more`, `calendar-today`, `calendar-clear`                                                                                                                         |
| `ark-clock`        | `clock`            | `clock-hours`, `clock-minutes`, `clock-seconds`, `clock-meridiem` (opções via `data-value`)                                                                                                                                                                                                                                                                                                                     |
| `ark-input`        | `input`            | `input-label`, `input-prefix`, `input-suffix`, `input-reveal`, `input-helper`/`input-error`                                                                                                                                                                                                                                                                                                                     |
| `ark-carousel`     | `carousel`         | `carousel-overlay`, `carousel-slide-{i}` (nos seus próprios elementos de slide), `carousel-arrow-prev`, `carousel-arrow-next`, `carousel-dots`, `carousel-dot-{i}`                                                                                                                                                                                                                                              |
| `ark-datepicker`   | `datepicker`       | Composição: o campo carrega os hooks do `ark-input` (testid repassado), painéis internos recebem testid `-calendar`/`-clock`; próprios: `datepicker-toggle`, `datepicker-popup`.                                                                                                                                                                                                                                |
| `ark-dialog`       | `dialog`           | `dialog-header`, `dialog-title`, `dialog-close`, `dialog-footer` (marca o filho `slot="footer"` do usuário)                                                                                                                                                                                                                                                                                                     |
| `ark-empty`        | `empty`            | `empty-heading`, `empty-description`, `empty-icon` / `empty-action` (marcam os filhos slot do usuário)                                                                                                                                                                                                                                                                                                          |
| `ark-menu`         | `menu`             | —                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ark-menu-item`    | `menu-item`        | `menu-item-check`; itens `divider` e `static` levam `menu-divider` / `menu-static` como hook principal                                                                                                                                                                                                                                                                                                          |
| `ark-tab`          | `tab`              | `tab-close`, `tab-dirty`                                                                                                                                                                                                                                                                                                                                                                                        |
| `ark-tabs`         | `tabs`             | `tabs-actions` (marca o filho `slot="actions"` do usuário)                                                                                                                                                                                                                                                                                                                                                      |
| `ark-textarea`     | `textarea`         | `textarea-label`, `textarea-helper`/`textarea-error`                                                                                                                                                                                                                                                                                                                                                            |
| `ark-tooltip`      | `tooltip`          | `tooltip-bubble` (o balão do componente ou o seu filho `slot="content"`)                                                                                                                                                                                                                                                                                                                                        |
| `ark-toaster`      | `toaster`          | `toaster-toast` (+ `data-toast-id`), `toaster-toast-title`, `toaster-toast-description`, `toaster-toast-close`, `toaster-toast-action`, `toaster-toast-cancel`                                                                                                                                                                                                                                                  |

Em `ark-button`, `ark-toggle`, `ark-toggle-group` e `ark-carousel` o hook principal fica no próprio host, já que o host é o controle; `input-suffix` é aplicado ao seu próprio elemento `slot="suffix"` e `carousel-slide-{i}` aos seus próprios slides.

Prefira sempre seletores semânticos (`getByRole("switch", { name: "..." })`) quando possível — os hooks são a rede de segurança para instâncias repetidas e asserções visuais.

---

## Convenções

- **Nomes**: elementos `ark-*`, tipos/classes TypeScript `Ark*`, funções helper `ark*`, custom properties CSS `--ark-*`, pacotes `@tooark/*`.
- **Camadas**: um pacote só pode depender das camadas abaixo dele. Bibliotecas de animação nunca entram em `@tooark/core` ou `@tooark/web-components`.
- **Light DOM**: os componentes nunca movem nem envolvem os filhos que você declara. O host é o próprio controle ou container estilizado (`ark-button`, `ark-toggle`, `ark-toggle-group`, `ark-input`, `ark-carousel`), então os frameworks continuam donos dos filhos.
- **Acessibilidade**: `prefers-reduced-motion` é respeitado globalmente pelos motion tokens; as stories rodam checagens do axe-core.

---

## Licença

Licenciado sob a [Apache License 2.0](LICENSE) © 2026 Tooark.

Os avisos de atribuição estão em [NOTICE](NOTICE); as licenças das dependências de terceiros estão documentadas em [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
