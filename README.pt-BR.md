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
| `@tooark/web-components` | Os Custom Elements nativos: `ark-button`, `ark-carousel`, `ark-datepicker`, `ark-switch`, `ark-toaster`, `ark-toggle` e `ark-toggle-group`.                                                                            |
| `@tooark/react`          | Wrappers React com props tipadas.                                                                                                                                                                                      |
| `@tooark/vue`            | Wrappers Vue 3.                                                                                                                                                                                                        |
| `@tooark/angular`        | Componentes wrapper para Angular.                                                                                                                                                                                      |
| `@tooark/chart`          | `ark-chart` — gráficos baseados em [ECharts](https://echarts.apache.org/) (peer dependency).                                                                                                                           |
| `@tooark/wysiwyg`        | `ark-wysiwyg` — editor de texto rico e viewer baseados em [Tiptap](https://tiptap.dev/).                                                                                                                               |
| `@tooark/motion`         | Helpers avançados de animação, **opt-in**, sobre a lib [Motion](https://motion.dev/): entrada escalonada de listas, scroll reveal, reordenação FLIP e gestos de swipe com física de spring.                            |

---

## Componentes

| Elemento           | Pacote         | Destaques                                                                                                                                    |
| ------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `ark-button`       | web-components | Intents, tamanhos, variantes (solid/outline/ghost), `rounded` (até `full`), estados `loading`/`icon-only`/`full-width` e modo link (`href`). |
| `ark-carousel`     | web-components | Arrasto por pointer com snap, autoplay, loop, dots e setas.                                                                                  |
| `ark-datepicker`   | web-components | Localizado (`en`/`pt`/`es` + custom), temas, intents.                                                                                        |
| `ark-switch`       | web-components | Switch on/off acessível (`role="switch"`): texto ON/OFF e ícones ✓/✕ opcionais, intents, participação em formulário via checkbox oculto.     |
| `ark-toaster`      | web-components | Toasts no estilo Sonner: API programática, posições, rich colors, ações, entrada/saída animadas, botão de fechar localizado.                 |
| `ark-toggle`       | web-components | Botão de estado pressionado (`aria-pressed`), standalone (outline/tinted por intent) ou como item de grupo.                                  |
| `ark-toggle-group` | web-components | Segmented control: seleção exclusiva (padrão) ou múltipla, `value` sincronizado, propaga `size`/`intent`/`theme`/`disabled` aos itens.       |
| `ark-chart`        | chart          | Tipos de gráfico do ECharts com suporte a temas.                                                                                             |
| `ark-wysiwyg`      | wysiwyg        | Editor + viewer somente leitura baseados em Tiptap.                                                                                          |

### Atributos principais

**`ark-button`** — `variant` (`solid`/`outline`/`ghost` ou um intent), `intent`, `size` (`sm`–`xl`), `rounded` (`none`/`sm`/`md`/`lg`/`xl`/`full` — com `icon-only`, `full` gera um botão circular), `loading` (spinner + `aria-busy` + clique bloqueado), `icon-only` (padding simétrico), `full-width`, `href`/`target` (renderiza `<a role="button">`; `_blank` ganha `rel="noopener noreferrer"`), `disabled`, `type`, `theme`, `color`/`text-color`.

**`ark-switch`** — `checked`, `disabled`, `size`, `intent`, `theme`, `color`, `labels` (mostra ON/OFF no trilho; textos customizáveis via `label-on`/`label-off`), `icons` (✓/✕ no polegar), `label` (rótulo acessível), `name`/`value` (submissão em formulário quando marcado). Emite `change` com `detail: { checked }`.

**`ark-toggle`** — `pressed`, `value`, `disabled`, `size`, `intent`, `theme`. Emite `change` com `detail: { pressed, value }`.

**`ark-toggle-group`** — `value` (valor(es) selecionado(s), sincronizado com os itens), `multiple`, `disabled`, `size`, `intent`, `theme`. Emite `change` com `detail: { value }` (exclusivo) ou `detail: { values }` (múltiplo).

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

```html
<ark-button intent="primary" size="md">Salvar</ark-button>
<ark-button icon-only rounded="full" intent="success" aria-label="Confirmar"
  >✓</ark-button
>

<ark-switch labels icons intent="success" label="Notificações"></ark-switch>

<ark-toggle-group value="dia">
  <ark-toggle value="dia">Dia</ark-toggle>
  <ark-toggle value="semana">Semana</ark-toggle>
  <ark-toggle value="mes">Mês</ark-toggle>
</ark-toggle-group>

<ark-toaster position="bottom-right" lang="pt"></ark-toaster>
```

```ts
import { toast } from "@tooark/core";

toast.success("Salvo", { description: "Suas alterações foram publicadas." });
```

### React

```tsx
import { ArkButton, ArkToaster } from "@tooark/react";
```

### Vue 3

```ts
import { ArkButton, ArkToaster } from "@tooark/vue";
```

### Angular

Importe os componentes wrapper de `@tooark/angular`.

### Design tokens com Tailwind v4

```css
@import "tailwindcss";
@import "@tooark/tokens/tokens.css";
```

---

## Desenvolvimento

Requisitos: **Node.js ≥ 22** e **pnpm 11** (versão fixada via `packageManager`).

```bash
pnpm install          # instala as dependências do workspace
pnpm build            # compila todos os pacotes
pnpm dev:storybook    # roda o Storybook em http://localhost:6006
pnpm clean            # remove os artefatos de build
```

### Testes

Os testes de componente rodam com o **addon Vitest do Storybook**: cada story é executada como smoke test em um navegador Chromium real (Playwright), além de testes de interação (funções `play`) e checagens de acessibilidade (axe-core via `@storybook/addon-a11y`).

```bash
pnpm exec playwright install chromium        # download do navegador (uma vez)
pnpm --filter storybook test                 # roda a suíte
pnpm --filter storybook exec vitest run --project storybook --coverage
```

Os testes também podem ser disparados pela UI do Storybook (widget "Run tests"). O CI roda a mesma suíte em cada push/PR via [GitHub Actions](.github/workflows/tests.yml).

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
await page
  .locator('[data-ark="datepicker-day"][data-date="2026-09-15"]')
  .click();
```

Hooks por componente:

| Componente         | Elemento principal | Partes internas                                                                                                                                                    |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ark-button`       | `button`           | `button-spinner`                                                                                                                                                   |
| `ark-switch`       | `switch`           | `switch-thumb`, `switch-label-on`, `switch-label-off`, `switch-input`                                                                                              |
| `ark-toggle`       | `toggle`           | —                                                                                                                                                                  |
| `ark-toggle-group` | `toggle-group`     | —                                                                                                                                                                  |
| `ark-carousel`     | `carousel`         | `carousel-viewport`, `carousel-track`, `carousel-slide-{i}`, `carousel-arrow-prev`, `carousel-arrow-next`, `carousel-dots`, `carousel-dot-{i}`                     |
| `ark-datepicker`   | `datepicker`       | `datepicker-prev`, `datepicker-next`, `datepicker-title`, `datepicker-grid`, `datepicker-day` (+ `data-date="AAAA-MM-DD"`), `datepicker-today`, `datepicker-clear` |
| `ark-toaster`      | `toaster`          | `toaster-toast` (+ `data-toast-id`), `toaster-toast-title`, `toaster-toast-description`, `toaster-toast-close`, `toaster-toast-action`, `toaster-toast-cancel`     |

Prefira sempre seletores semânticos (`getByRole("switch", { name: "..." })`) quando possível — os hooks são a rede de segurança para instâncias repetidas e asserções visuais.

---

## Convenções

- **Nomes**: elementos `ark-*`, tipos/classes TypeScript `Ark*`, funções helper `ark*`, custom properties CSS `--ark-*`, pacotes `@tooark/*`.
- **Camadas**: um pacote só pode depender das camadas abaixo dele. Bibliotecas de animação nunca entram em `@tooark/core` ou `@tooark/web-components`.
- **Acessibilidade**: `prefers-reduced-motion` é respeitado globalmente pelos motion tokens; as stories rodam checagens do axe-core.

---

## Licença

Licenciado sob a [Apache License 2.0](LICENSE) © 2026 Tooark.

Os avisos de atribuição estão em [NOTICE](NOTICE); as licenças das dependências de terceiros estão documentadas em [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
