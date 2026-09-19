# @tooark/web-components

[![npm](https://img.shields.io/npm/v/@tooark/web-components?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/web-components)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Os Custom Elements nativos (`ark-*`) do design system Tooark, estilizados com Tailwind v4 sobre design tokens — acessibilidade, teclado e motion embutidos, uma única folha de estilo, nenhum framework necessário.

🌍 **Idiomas:** [![USA Flag](https://flagcdn.com/w20/us.png) English](./README.md) · ![Brazil Flag](https://flagcdn.com/w20/br.png) **Português (este arquivo)**

---

## Conteúdo

- [Visão Geral](#-visão-geral)
- [Instalação](#-instalação)
- [Configuração](#️-configuração)
- [Componentes](#-componentes)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Dependências](#-dependências)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 📖 Visão Geral

O pacote `@tooark/web-components` fornece:

- 41 elementos: botões e toggles, campos de formulário (input, textarea, select, checkbox, radio, switch, file input, datepicker, editor chave/valor), overlays sobre a Popover API (dialog, drawer, menu, tooltip, paleta de comandos, toaster), layout (card, tabs, split pane, carousel), feedback (alert, badge, progress, spinner, skeleton, empty, status dot) e a família calendário/relógio/agenda;
- light DOM: os componentes nunca movem nem envolvem os seus filhos; o host é o controle ou o container;
- `styles.css` é a única folha de estilo necessária: tokens, presets de motion e estilos dos componentes, tudo com prefixo (`ark:*`, `--ark-*`), sem reset global;
- temas por `color-scheme` (`theme="light|dark"` por elemento), tamanhos `xs…xl`, intents `primary…neutral`, `rounded`;
- eventos como `CustomEvent` (`change`, `ark-change`, `ark-select`, …), `testid` repassado como `data-testid` a cada parte interna para E2E.

---

## 🔧 Instalação

```bash
pnpm add @tooark/web-components   # traz @tooark/core e @tooark/tokens
```

Usa React, Vue ou Angular? Instale `@tooark/react`, `@tooark/vue` ou `@tooark/angular`: eles dependem deste pacote e acrescentam wrappers tipados.

---

## ⚙️ Configuração

Importe a folha de estilo uma vez e registre os elementos antes de usá-los:

```ts
import { registerTooarkComponents } from "@tooark/web-components";
import "@tooark/web-components/styles.css";

registerTooarkComponents(); // idempotente
```

Declare o `color-scheme` da página para escolher o tema (`light`, `dark` ou `light dark` para seguir o sistema); `theme="light|dark"` num elemento força um lado, e `lang="en|pt|es"` (ou `locale-json`) nos elementos que mostram texto.

---

## 📦 Componentes

- `ark-alert` — Alerta/banner: o host é a caixa na cor suave do intent, os filhos são a mensagem (texto livre ou elementos), `slot="icon"` à esquerda, `slot="action"` à direita, `heading`, `dismissible` com saída animada, live region (`status`/`alert`).
- `ark-avatar` — Avatar (`role="img"` nomeado por `name`): iniciais de `name`, imagem `src` que cai para as iniciais em erro de carga, `size`, `shape` circle/square, `color` própria.
- `ark-badge` — Rótulo curto de status/categoria: intents, `soft`/`solid`/`outline`, `xs`–`md`, `rounded`, `color` própria via `color-mix`. O host é o badge; ícone e texto ficam como filhos.
- `ark-button` — Intents, tamanhos, variantes (solid/outline/ghost), `rounded` (até `full`), estados `loading`/`icon-only`/`full-width`, feedback `status` (glifo de sucesso/erro + anúncio) e modo link (`href`).
- `ark-calendar` — Grid de mês inline: localizado, teclado WAI-ARIA, motion, views de mês/ano no título e eventos com cor (`dots`/`count`/`list`).
- `ark-card` — Cartão: o host é a caixa (`surface`, `border`, `rounded`) e uma grid: `heading` (h2) ou `slot="header"` com `slot="actions"` na linha de cima, filhos sem slot como corpo, `slot="footer"` por último com divisor; `padding` none–lg.
- `ark-carousel` — CSS scroll snap nativo (touch/trackpad rolam nativamente, arrasto com mouse emulado), autoplay, loop, dots e setas. Os slides continuam sendo seus filhos diretos.
- `ark-checkbox` — Checkbox desenhado pelo componente (botão `role="checkbox"` + input nativo oculto para formulário e `<fieldset disabled>`): `checked`, `indeterminate`, `label`/`aria-label`/filhos livres como rótulo, tamanhos, intents. Emite `change`.
- `ark-clock` — Seleção de hora em colunas digitais (hora/minuto/segundo), 24h/12h, step de minutos, localizado.
- `ark-color-swatches` — Paleta de cores como `radiogroup`: amostras de `colors` (`{ name, value }[]`, atributo JSON ou propriedade JS), `value`, setas navegam, `disabled`, `size`. Emite `change` com o valor.
- `ark-command-item` — Item da paleta de comandos (o host é o `role="option"`): filhos livres, `slot="trailing"` para o atalho, `value`, `group`, `label` (texto do filtro), `disabled`. Emite `ark-select`.
- `ark-command-palette` — Paleta de comandos sobre a Popover API: campo de busca (um `ark-input` próprio), filhos `ark-command-item` agrupados e filtrados (`filter`) ou buscados pelo app (`ark-query`), setas + Enter, `hotkey` (`/`, `mod+k`). Emite `ark-select`, `ark-query`, `ark-open`, `ark-close`.
- `ark-copy-button` — Botão de copiar: estende o `ark-button` (mesmas variantes, tamanhos, `icon-only`, formulário, hooks); copia `value` ou o elemento de `for`, troca o ícone por um check e o texto/`title` por "copiado" durante `feedback-ms`, anuncia. Emite `ark-copy`.
- `ark-datepicker` — Compõe `ark-input` + `ark-calendar` + `ark-clock`: `mode` datetime (padrão)/date/time, inline ou campo+popup, parse de digitação, formulário.
- `ark-dialog` — Diálogo modal sobre a Popover API (top layer, scrim por `::backdrop`, sem portal): o host é o painel, seus filhos são o corpo, `slot="footer"` é o rodapé; cabeçalho de `label`, focus trap, Esc/scrim, `sm`–`xl`.
- `ark-drawer` — Gaveta ancorada numa borda: `overlay` (Popover API, scrim, focus trap, Esc) ou `inline` (no fluxo da página, ex.: console inferior); `side`, `size` preset ou comprimento CSS, cabeçalho de `label`, `slot="footer"`, slide com o easing `sheet`. Emite `ark-open`/`ark-close`.
- `ark-empty` — Estado vazio: caixa tracejada com `slot="icon"` apagado, `heading` (h3), `description` e um botão opcional em `slot="action"`; os filhos ficam no lugar, ordenados por CSS.
- `ark-file-input` — Campo de arquivo com a grid do `ark-input` (label, helper/erro): `<input type="file">` nativo oculto para o formulário, zona de soltar com realce em `dragover`, botão de escolher acessível por teclado, lista dos nomes escolhidos, `accept`/`multiple`. Emite `change` com os arquivos e os anuncia.
- `ark-input` — Campo de texto padronizado: label, helper/erro com aria, prefixo/sufixo via `slot`, `reveal` de senha, atributos nativos repassados, tamanhos, intents, `rounded`.
- `ark-kbd` — Tecla de atalho: o host é a tecla (mono, borda, `surface-muted`, aresta inferior) em volta do seu texto; `size`.
- `ark-kv-editor` — Editor chave/valor: linhas `{ id, key, value, enabled }` (propriedade JS) com ativar, editar, remover, adicionar, colunas opcionais `types`/`secret`/`description`, modo em massa em linhas `chave:valor` ou JSON. Compõe outros controles ark-\*. Emite `change`, `ark-add`, `ark-delete`.
- `ark-mark` — Marca de escopo: uma de seis formas (`circle`, `square`, `triangle`, `diamond`, `star`, `hexagon`) numa `color`, cor e forma juntas para a identidade nunca depender só da cor; `size`, `label`.
- `ark-menu` — Menu suspenso/de contexto sobre a Popover API (`role="menu"`, `popover="auto"`): ancorado ao gatilho por `for`, `align`/`direction` com flip, teclado, `openAt(x, y)`; itens ficam como filhos. Emite `ark-select`.
- `ark-menu-item` — Item de menu (o host é o item): filhos livres, `slot="trailing"`, `disabled`, `intent`, `checked` (item checkbox), `divider`, `static` (conteúdo não interativo).
- `ark-progress` — Barra de progresso (`role="progressbar"` no host): `value`/`max` com transição de largura pelos tokens, `show-value`, `indeterminate` em loop isento de movimento reduzido, `label`, tamanhos, intents.
- `ark-radio` — Radio desenhado pelo componente (botão `role="radio"` + input nativo oculto): agrupa por `name` no mesmo form, um tab stop por grupo, setas movem e marcam, `label`/filhos como rótulo. Emite `change` na que marcou.
- `ark-scheduler` — Agenda com views `week`/`day` (timeline por horário e sobreposição em colunas), `month` e `agenda`; eventos coloridos e clicáveis.
- `ark-select` — `<select>` nativo estilizado como o `ark-input`: label, helper/erro com aria, `placeholder`, opções por dados (atributo `options` em JSON ou propriedade JS, `group` → `<optgroup>`), tamanhos, intents, `rounded`.
- `ark-shape-picker` — Seletor de forma como `radiogroup`: as seis formas do `ark-mark` desenhadas em `color`, `value`, setas navegam, nomes das formas localizados, `disabled`, `size`. Emite `change` com a forma.
- `ark-skeleton` — Placeholder de carregamento: o host é o bloco (`.ark-skeleton`, `aria-hidden`), dimensionado pela sua class/style; `rows` renderiza barras, `animated` liga o pulso, `rounded`.
- `ark-spinner` — Indicador de carregamento solto (`role="status"`): o SVG do spinner do botão em `.ark-animate-spin` (continua girando sob movimento reduzido), rótulo para leitor de tela por `lang` ou `label`, `size`, `intent` opcional (senão herda a cor do texto).
- `ark-split-pane` — Painéis redimensionáveis: os seus filhos são os painéis, as alças são nós próprios do componente ao fim do host; `direction`, `sizes` (percentuais, reescritos a cada mudança), `data-min`/`data-max` por painel, teclado e arrasto com pointer capture. Emite `ark-resize`.
- `ark-status-dot` — Ponto de status: o host é o círculo na cor do intent (padrão `neutral`); `label` o torna um `role="img"` nomeado, sem ele é decorativo; `size`. Estático, nunca pulsa.
- `ark-switch` — Switch on/off acessível (`role="switch"`): texto ON/OFF e ícones ✓/✕ opcionais, intents, participação em formulário via checkbox oculto.
- `ark-tab` — Aba (`role="tab"`, o host é o controle): filhos livres, `disabled`, `controls`, `closable` e `dirty` na variante editor. Emite `ark-close`.
- `ark-tabs` — Faixa de abas (`role="tablist"`): `underline`/`chips`/`editor`, roving tabindex com setas/Home/End, `slot="actions"` no fim, `change` com o value ativo. Painéis ficam com o app.
- `ark-textarea` — Campo multilinha com a grid do `ark-input`: `rows`, `autosize` (`field-sizing` nativo, fallback JS), `monospace`, `resize`, helper/erro com aria, tamanhos, intents, `rounded`.
- `ark-toaster` — Toasts no estilo Sonner: API programática, posições, rich colors, ações, entrada/saída animadas, botão de fechar localizado.
- `ark-toggle` — Botão de estado pressionado (`aria-pressed`), standalone (outline/tinted por intent) ou como item de grupo.
- `ark-toggle-group` — Segmented control: seleção exclusiva (padrão) ou múltipla, `value` sincronizado, propaga `size`/`intent`/`theme`/`disabled` aos itens.
- `ark-tooltip` — Tooltip sobre a Popover API: envolve o gatilho sem movê-lo, texto por `content` ou `slot="content"` rico, `side` com flip, `delay`, hover/foco/Esc, `aria-describedby` no gatilho.

Referência completa de atributos, guia de tema e hooks de E2E: [https://github.com/Tooark/web-components/blob/main/README.pt-BR.md](https://github.com/Tooark/web-components/blob/main/README.pt-BR.md) · exemplos vivos com testes de interação: [Storybook](https://tooark.com/web-components/).

---

## 📝 Exemplos de Uso

### Um formulário com diálogo de confirmação e toast

```html
<form id="perfil">
  <ark-input name="nome" label="Nome" placeholder="Seu nome completo" required></ark-input>
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

### Ligando tudo

```ts
import { toast } from "@tooark/core";

const form = document.querySelector<HTMLFormElement>("#perfil")!;
const dialog = document.querySelector("ark-dialog")!;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  dialog.show(); // top layer, foco preso, Esc e o scrim fecham
});

dialog.addEventListener("click", (event) => {
  const action = (event.target as HTMLElement).closest("[data-action]")?.getAttribute("data-action");
  if (action === "publish") {
    const data = Object.fromEntries(new FormData(form)); // { nome, papel, desde }
    toast.success("Perfil publicado", { description: `Bem-vindo, ${data.nome}.` });
  }
  if (action) dialog.close();
});
```

### Dados por propriedade JS e eventos consolidados

```ts
const editor = document.querySelector("ark-kv-editor")!;
editor.rows = [{ id: "1", key: "Accept", value: "application/json", enabled: true }];
editor.addEventListener("change", (event) => salvar((event as CustomEvent<{ rows: unknown[] }>).detail.rows));

const menu = document.querySelector("ark-menu")!; // for="id-do-gatilho"
menu.addEventListener("ark-select", (event) => executar((event as CustomEvent<{ value: string }>).detail.value));
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                           | Versão | Descrição                                                            |
| ---------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)     | ^1.0.0 | Tipos, i18n, serviços de toast/announce, motion e helpers de overlay |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens) | ^1.0.0 | Design tokens (cores, tamanhos, raios, motion) e tipos primitivos    |
| [`tslib`](https://www.npmjs.com/package/tslib)                   | ^2.8.1 | Helpers de runtime do TypeScript                                     |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/web-components` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
