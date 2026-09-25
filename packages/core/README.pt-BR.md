# @tooark/core

[![npm](https://img.shields.io/npm/v/@tooark/core?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/core)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Fundação compartilhada dos componentes Tooark: tipos, i18n, os serviços de toast e announce, motion sem dependências e os helpers de overlay com que os componentes são construídos.

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

O pacote `@tooark/core` fornece:

- os tipos `Ark*StyleOptions` de todo componente (o que os wrappers de framework estendem) e as primitivas compartilhadas reexportadas do `@tooark/tokens`;
- i18n: locales `en`, `pt`, `es` e `resolveLocale(lang, localeJson?)`, que mescla o JSON próprio sobre o inglês com `lang="custom"`;
- serviços: `toast()` (alimenta o `ark-toaster` por eventos em window) e `announce()` (uma única live region de leitor de tela para a página);
- motion: `arkEnter`/`arkExit` (WAAPI sobre os tokens, respeitando reduced-motion) e os presets CSS `.ark-animate-*`;
- helpers de overlay sobre a Popover API: `trapFocus`, `openPopover`/`closePopover` (com `lockScroll`), `positionAnchored`, `focusableElements`, `isPopoverOpen`;
- `coerceBooleanAttr` para setters booleanos que precisam aceitar `""`/`"false"` (o React 19 atribui propriedades).

---

## 🔧 Instalação

```bash
pnpm add @tooark/core
```

O `@tooark/web-components` depende dele, mas só como dependência transitiva: com pnpm (`node_modules` isolado) o seu app não consegue importá-lo por ali. Adicione você mesmo sempre que o seu código importar do `@tooark/core` (`toast`, `announce`, os helpers de motion ou de overlay), com ou sem os componentes; os wrappers de React, Vue e Angular reexportam `toast`, `showToast` e `dismissToast`.

---

## ⚙️ Configuração

Os presets de motion precisam dos tokens e das classes `.ark-animate-*` na página. Eles fazem parte do `@tooark/web-components/styles.css`; sem os componentes, importe a folha de estilo do core:

```ts
import "@tooark/core/styles.css"; // tokens + presets de motion
```

---

## 📦 Componentes

### Serviços

- `toast(title, options?)`, `toast.success|info|warning|error|loading(...)`, `toast.custom(options)`, `toast.dismiss(id?)` / `dismissToast(id?)` (sem `id` dispensa todos), `showToast(options)` — opções: `id`, `title`, `description`, `type`, `duration` (ms, `0` mantém), `actionLabel`/`actionId`, `cancelLabel`.
- `announce(text, politeness = "polite")` — `"polite" | "assertive"`.

### Motion

- `arkEnter(element, preset, options)` / `arkExit(element, preset, options)` → `Promise<void>`; presets `fade`, `slide-up`, `slide-down`, `slide-left`, `slide-right`, `scale`; opções `duration` (token ou ms), `easing` (token ou CSS), `distance`.
- `prefersReducedMotion()`.

### Helpers de overlay

- `trapFocus(container, { initial, returnTo, onOutsidePointer })` → função que libera.
- `openPopover(host, preset, { ...motion, lockScroll })` / `closePopover(host, preset, options)`; `lockScroll(owner)`, `unlockScroll(owner)`, `isScrollLocked()`.
- `positionAnchored(panel, anchor, { side, align, offset, padding, onPlace })` → função de dispose.
- `focusableElements(root)`, `isPopoverOpen(host)`.

### i18n e tipos

- `resolveLocale(lang, localeJson?)`, `en`, `pt`, `es`, `ArkLocale`.
- `coerceBooleanAttr(value)`; todos os `Ark*StyleOptions` e tipos de comportamento (`ArkKvRow`, `ArkSelectOption`, `ArkCalendarEvent`, `ArkToastOptions`, …).

---

## 📝 Exemplos de Uso

### Toasts e anúncios

```ts
import { announce, toast } from "@tooark/core";

toast.success("Salvo", { description: "Suas alterações foram publicadas." });
const id = toast.loading("Enviando…", { duration: 0 });
// depois
toast.dismiss(id);

announce("3 itens selecionados"); // lido pelo leitor de tela, sem mudança visual
```

### Animando um elemento seu com os tokens

```ts
import { arkEnter, arkExit } from "@tooark/core";

await arkEnter(painel, "slide-up", { duration: "quick" }); // 150 ms, --ark-ease-out
await arkExit(painel, "fade", { duration: "quick", easing: "in" });
painel.remove();
```

### Um overlay modal seu sobre a Popover API

```ts
import { closePopover, openPopover, trapFocus } from "@tooark/core";

const painel = document.querySelector<HTMLElement>("#painel")!; // tem popover="manual"
let liberar: (() => void) | null = null;

async function abrir() {
  await openPopover(painel, "scale", { duration: "quick", lockScroll: true });
  liberar = trapFocus(painel, { onOutsidePointer: fechar });
}

async function fechar() {
  liberar?.();
  await closePopover(painel, "fade", { duration: "quick" }); // a saída anima antes de sair do top layer
}
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                           | Versão | Descrição                                                  |
| ---------------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens) | ^1.1.0 | Design tokens (cores, tamanhos, motion) e tipos primitivos |
| [`tslib`](https://www.npmjs.com/package/tslib)                   | ^2.8.1 | Helpers de runtime do TypeScript                           |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/core` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
