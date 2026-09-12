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

| Pacote                   | Descrição                                                                                                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tooark/tokens`         | Primitivas de design: cores semânticas (intents), escala de tamanhos, raios e motion tokens (`--ark-duration-*`, `--ark-ease-*`), expostos como custom properties CSS e valores `@theme` do Tailwind v4.               |
| `@tooark/core`           | Fundação compartilhada: tipos TypeScript (`ArkIntent`, `ArkSize`, …), locales de i18n (`en`, `pt`, `es`), o serviço de toast e a camada de motion sem dependências (presets CSS + helpers WAAPI `arkEnter`/`arkExit`). |
| `@tooark/web-components` | Os Custom Elements nativos: `ark-button`, `ark-calendar`, `ark-carousel`, `ark-clock`, `ark-datepicker`, `ark-input`, `ark-scheduler`, `ark-switch`, `ark-toaster`, `ark-toggle` e `ark-toggle-group`.                 |
| `@tooark/react`          | Wrappers React com props tipadas.                                                                                                                                                                                      |
| `@tooark/vue`            | Wrappers Vue 3.                                                                                                                                                                                                        |
| `@tooark/angular`        | Componentes wrapper para Angular.                                                                                                                                                                                      |
| `@tooark/chart`          | `ark-chart` — gráficos baseados em [ECharts](https://echarts.apache.org/) (peer dependency).                                                                                                                           |
| `@tooark/wysiwyg`        | `ark-wysiwyg` — editor de texto rico e viewer baseados em [Tiptap](https://tiptap.dev/).                                                                                                                               |
| `@tooark/motion`         | Helpers avançados de animação, **opt-in**, sobre a lib [Motion](https://motion.dev/): entrada escalonada de listas, scroll reveal, reordenação FLIP e gestos de swipe com física de spring.                            |

---

## Componentes

| Elemento           | Pacote         | Destaques                                                                                                                                                          |
| ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ark-button`       | web-components | Intents, tamanhos, variantes (solid/outline/ghost), `rounded` (até `full`), estados `loading`/`icon-only`/`full-width` e modo link (`href`).                       |
| `ark-calendar`     | web-components | Grid de mês inline: localizado, teclado WAI-ARIA, motion, views de mês/ano no título e eventos com cor (`dots`/`count`/`list`).                                    |
| `ark-carousel`     | web-components | CSS scroll snap nativo (touch/trackpad rolam nativamente, arrasto com mouse emulado), autoplay, loop, dots e setas. Os slides continuam sendo seus filhos diretos. |
| `ark-clock`        | web-components | Seleção de hora em colunas digitais (hora/minuto/segundo), 24h/12h, step de minutos, localizado.                                                                   |
| `ark-datepicker`   | web-components | Compõe `ark-input` + `ark-calendar` + `ark-clock`: `mode` datetime (padrão)/date/time, inline ou campo+popup, parse de digitação, formulário.                      |
| `ark-input`        | web-components | Campo de texto padronizado: label, helper/erro com aria, sufixo via `slot="suffix"`, tamanhos, intents, `rounded`.                                                 |
| `ark-scheduler`    | web-components | Agenda com views `week`/`day` (timeline por horário e sobreposição em colunas), `month` e `agenda`; eventos coloridos e clicáveis.                                 |
| `ark-switch`       | web-components | Switch on/off acessível (`role="switch"`): texto ON/OFF e ícones ✓/✕ opcionais, intents, participação em formulário via checkbox oculto.                           |
| `ark-toaster`      | web-components | Toasts no estilo Sonner: API programática, posições, rich colors, ações, entrada/saída animadas, botão de fechar localizado.                                       |
| `ark-toggle`       | web-components | Botão de estado pressionado (`aria-pressed`), standalone (outline/tinted por intent) ou como item de grupo.                                                        |
| `ark-toggle-group` | web-components | Segmented control: seleção exclusiva (padrão) ou múltipla, `value` sincronizado, propaga `size`/`intent`/`theme`/`disabled` aos itens.                             |
| `ark-chart`        | chart          | Tipos de gráfico do ECharts com suporte a temas.                                                                                                                   |
| `ark-wysiwyg`      | wysiwyg        | Editor + viewer somente leitura baseados em Tiptap.                                                                                                                |

### Atributos principais

**`ark-button`** — o próprio host é o controle (`role="button"`, foco, teclado, participação em formulário via ElementInternals), então `aria-label`, `class` e `id` em `<ark-button>` valem diretamente e os filhos nunca são movidos. `variant` (`solid`/`outline`/`ghost` ou um intent), `intent`, `size` (`sm`–`xl`), `rounded` (`none`/`sm`/`md`/`lg`/`xl`/`full` — com `icon-only`, `full` gera um botão circular), `loading` (spinner + `aria-busy` + clique bloqueado), `icon-only` (padding simétrico), `full-width`, `href`/`target` (um `<a>` "esticado" cobre o host, recebe o foco e é nomeado pelo conteúdo do host; `_blank` ganha `rel="noopener noreferrer"`), `disabled`, `type`, `theme`, `color`/`text-color`.

**`ark-calendar`** — `value` (`YYYY-MM-DD`, interpretado no fuso local), `min`/`max`, `lang` (`en`/`pt`/`es`/`custom` + `locale-json`), `theme`, `intent`, `accent-color`. Título clicável alterna dias → meses → anos. Eventos: atributo `events` (JSON) ou propriedade JS `events` com `{ date, label?, color?, intent? }`, exibidos conforme `event-display` (`dots` padrão, `count`, `list`). Emite `ark-change` com `detail: { value, date, events }`. Navegação por teclado: setas movem entre dias (cruzando meses), `Home`/`End` início/fim do mês, `PageUp`/`PageDown` trocam de mês.

**`ark-clock`** — `value` (`HH:mm[:ss]`, sempre 24h internamente), `seconds` (coluna de segundos), `step-minutes`, `hours-format` (`24` padrão ou `12` com coluna AM/PM), `lang`, `theme`, `intent`. Emite `ark-change` com `detail: { value }`.

**`ark-input`** — `type`, `label` (vira `<label for>` real), `placeholder`, `value`, `name`, `size`, `intent`, `theme`, `rounded`, `helper`, `error`/`error-message` (com `aria-invalid`/`aria-describedby`), `disabled`, `required`, `readonly`. Sufixo via filho com `slot="suffix"`. Para composição: `focus()` e o getter `inputElement`.

**`ark-datepicker`** — compõe `ark-input` + `ark-calendar` + `ark-clock`. `mode`: `datetime` (padrão, valor `YYYY-MM-DDTHH:mm:ss`), `date` (`YYYY-MM-DD`) ou `time` (`HH:mm:ss`). Sem `input`, renderiza os painéis inline; com `input`, campo + popup. `format` com tokens `YYYY`/`MM`/`DD`/`HH`/`mm`/`ss` (sensível a maiúsculas; padrão `MM/DD/YYYY HH:mm` em `en`, `DD/MM/YYYY HH:mm` nos demais), `placeholder`, `seconds`, `name` (formulário com valor ISO via input hidden), `disabled`, e repassa `min`/`max`/`events`/`event-display`/`step-minutes`/`hours-format` aos painéis. Digitação com validação (entrada inválida reverte); no modo `date` selecionar fecha o popup, no `datetime` ele permanece aberto para escolher a hora; `Esc`/clique fora fecham.

**`ark-scheduler`** — `view` (`week` padrão, `day`, `month`, `agenda`), `date` (data de referência, sincronizada ao navegar), `events` (atributo JSON ou propriedade JS) com `{ id?, title, start, end?, allDay?, location?, color?, intent? }`, `views` (limita o seletor, ex.: `"day,week"`), `hour-start`/`hour-end`, `slot-minutes` (15–60), `hours-format`, `lang`, `theme`, `intent`. Emite `ark-event-click` (`{ event, id }`), `ark-slot-click` (`{ start, end, allDay }` — clique num espaço livre ou num dia), `ark-view-change` (`{ view }`) e `ark-range-change` (`{ start, end, view }`). As views de horário posicionam os eventos por horário, resolvem sobreposições em colunas e marcam a hora atual.

**`ark-switch`** — `checked`, `disabled`, `size`, `intent`, `theme`, `color`, `labels` (mostra ON/OFF no trilho; textos customizáveis via `label-on`/`label-off`), `icons` (✓/✕ no polegar), `label` (rótulo acessível), `name`/`value` (submissão em formulário quando marcado). Emite `change` com `detail: { checked }`.

**`ark-toggle`** — `pressed`, `value`, `disabled`, `size`, `intent`, `theme`. Emite `change` com `detail: { pressed, value }`.

**`ark-toggle-group`** — `value` (valor(es) selecionado(s), sincronizado com os itens), `multiple`, `disabled`, `size`, `intent`, `theme`. Emite `change` com `detail: { value }` (exclusivo) ou `detail: { values }` (múltiplo).

**`ark-carousel`** — o host é o container rolável e seus slides são filhos diretos dele. `slides-per-view`, `gap` (px), `start-index`, `loop`, `autoplay`/`autoplay-delay` (pausa em hover/foco e desliga com `prefers-reduced-motion`), `show-dots`/`show-arrows` (`"false"` esconde), `drag-free`, `snap` (`mandatory`/`proximity`), `intent`, `accent-color`, `theme`. API JS: `index`, `slides`, `next()`, `prev()`. Emite `ark-slide-change` com `detail: { index }`.

**`ark-toaster`** — `position` (`top-left` … `bottom-right`), `rich-colors`, `close-button` (`"false"` esconde), `max-visible`, `duration` (ms; `0` mantém o toast até ser fechado), `lang`, `theme`. Alimentado pelo serviço `toast` do `@tooark/core` (ou pelos métodos `toast()`/`dismiss()`); emite `ark-toast-action` com `detail: { id, actionId }` ao clicar num botão de ação.

---

## Sistema de motion

O motion é desenhado em três camadas para que os componentes permaneçam livres de dependências:

1. **Tokens** (`@tooark/tokens`) — durações (`--ark-duration-instant…slower`), curvas de easing (`--ark-ease-standard/in/out/in-out/spring`) e a distância de slide. `prefers-reduced-motion` zera todas as durações na camada de tokens, cobrindo o sistema inteiro de uma vez.
2. **Presets** (`@tooark/core`) — keyframes/classes CSS sem dependência (`.ark-animate-*`, `.ark-skeleton`) e helpers WAAPI (`arkEnter`, `arkExit`) usados pelos próprios componentes (ex.: entrada/saída dos toasts).
3. **`@tooark/motion`** (opt-in) — `arkStaggerEnter`, `arkReveal`, `arkFlip` e `arkSwipe` sobre a lib Motion, para física de spring e efeitos dirigidos por scroll. Só os projetos que instalam este pacote pagam pela lib.

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

- **Tema**: por padrão os componentes seguem o sistema (`color-scheme: light dark`); `theme="light"` ou `theme="dark"` num elemento força um lado para ele e seus descendentes. Não há JavaScript envolvido, e a troca de tema do sistema é refletida na hora.
- **Marca**: sobrescreva os tokens no seu CSS. Dentro da folha de estilo dos componentes eles têm o prefixo `ark`:

```css
:root {
  --ark-color-primary: light-dark(oklch(45% 0.2 264), oklch(80% 0.15 264));
  --ark-color-primary-fg: #fff;
  --ark-color-primary-hover: light-dark(oklch(40% 0.2 264), oklch(85% 0.15 264));
}
```

Cada intent (`primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`) tem `<intent>`, `-fg`, `-hover`, `-soft`, `-soft-fg`, `-border` e `-ring`; as superfícies neutras são `surface`, `surface-muted`, `surface-strong`, `surface-raised`, `fg`, `fg-soft`, `fg-muted`, `fg-faint`, `fg-placeholder`, `border`, `border-strong`, `muted` e `ring`. A lista completa com o papel de cada um está em [tokens.css](packages/tokens/tokens.css).

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

| Componente         | Elemento principal | Partes internas                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-button`       | `button`           | `button-spinner`, `button-link` (modo href)                                                                                                                                                                                                                                                                                                                                                   |
| `ark-scheduler`    | `scheduler`        | `scheduler-header`, `scheduler-today`, `scheduler-prev`, `scheduler-next`, `scheduler-title`, `scheduler-views`, `scheduler-view-{view}`, `scheduler-body`, `scheduler-scroller`, `scheduler-grid`, `scheduler-day` (+ `data-date`), `scheduler-slot` (+ `data-start`), `scheduler-event` (+ `data-event-id`), `scheduler-event-more`, `scheduler-allday`, `scheduler-now`, `scheduler-empty` |
| `ark-switch`       | `switch`           | `switch-thumb`, `switch-label-on`, `switch-label-off`, `switch-input`                                                                                                                                                                                                                                                                                                                         |
| `ark-toggle`       | `toggle`           | —                                                                                                                                                                                                                                                                                                                                                                                             |
| `ark-toggle-group` | `toggle-group`     | —                                                                                                                                                                                                                                                                                                                                                                                             |
| `ark-calendar`     | `calendar`         | `calendar-prev`, `calendar-next`, `calendar-title`, `calendar-grid`, `calendar-day` (+ `data-date`), `calendar-months`/`calendar-month` (+ `data-month`), `calendar-years`/`calendar-year` (+ `data-year`), `calendar-event`, `calendar-event-more`, `calendar-today`, `calendar-clear`                                                                                                       |
| `ark-clock`        | `clock`            | `clock-hours`, `clock-minutes`, `clock-seconds`, `clock-meridiem` (opções via `data-value`)                                                                                                                                                                                                                                                                                                   |
| `ark-input`        | `input`            | `input-label`, `input-suffix`, `input-helper`/`input-error`                                                                                                                                                                                                                                                                                                                                   |
| `ark-carousel`     | `carousel`         | `carousel-overlay`, `carousel-slide-{i}` (nos seus próprios elementos de slide), `carousel-arrow-prev`, `carousel-arrow-next`, `carousel-dots`, `carousel-dot-{i}`                                                                                                                                                                                                                            |
| `ark-datepicker`   | `datepicker`       | Composição: o campo carrega os hooks do `ark-input` (testid repassado), painéis internos recebem testid `-calendar`/`-clock`; próprios: `datepicker-toggle`, `datepicker-popup`.                                                                                                                                                                                                              |
| `ark-toaster`      | `toaster`          | `toaster-toast` (+ `data-toast-id`), `toaster-toast-title`, `toaster-toast-description`, `toaster-toast-close`, `toaster-toast-action`, `toaster-toast-cancel`                                                                                                                                                                                                                                |

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
