# @tooark/tokens

[![npm](https://img.shields.io/npm/v/@tooark/tokens?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/tokens)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Primitivas de design do design system Tooark: cores por intent e escala de tamanhos como um `@theme` do Tailwind v4, tokens de motion como custom properties CSS e tipos TypeScript.

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

O pacote `@tooark/tokens` fornece:

- `tokens.css`: um bloco `@theme static` com as cores semânticas (`primary`, `secondary`, `success`, `warning`, `danger`, `info`, `neutral`, mais `surface*`, `fg*`, `border*`, `muted`, `ring`) em `light-dark()`, a escala de tamanhos (`--size-xs…xl`) e o degrau `--text-2xs` (sem raios: a escala de `rounded` é a do próprio Tailwind, o `ArkRounded` só a tipa);
- tokens de motion fora do `@theme`: `--ark-duration-*` (oito passos), `--ark-ease-*` (`linear`, `standard`, `in`, `out`, `in-out`, `overshoot`, `sheet`) e `--ark-motion-distance`, zerados sob `prefers-reduced-motion`;
- espelhos JS dos tokens de motion (`ARK_DURATION_MS`, `ARK_EASING_CSS`, `ARK_MOTION_DISTANCE`) para fallback em WAAPI;
- `resolveColorScheme(element)` e `observeColorScheme(element, onChange)` para resolver e acompanhar o tema da página;
- os tipos primitivos que todos os pacotes compartilham: `ArkIntent`, `ArkSize`, `ArkRounded`, `ArkTheme`, `ArkDuration`, `ArkEasing`.

---

## 🔧 Instalação

```bash
pnpm add @tooark/tokens
```

Não é necessário diretamente quando você usa o `@tooark/web-components`: o `styles.css` dele já traz os tokens.

---

## ⚙️ Configuração

O `tokens.css` é escrito para o compilador do Tailwind v4: as cores, os tamanhos e o `--text-2xs` ficam num bloco `@theme`, que o navegador descarta ao ler o arquivo como CSS puro (só os tokens de motion sobrevivem). Duas formas de obtê-los:

- pelas folhas de estilo do Tooark: o `@tooark/web-components/styles.css` (ou o `@tooark/core/styles.css`, sem os componentes) já os traz, compilados com o prefixo `ark` (`--ark-color-*`, `--ark-size-*`, `--ark-text-2xs`);
- na sua própria entrada do Tailwind v4: importe o `tokens.css` depois do Tailwind e eles viram as variáveis `--color-*`, `--size-*` e `--text-2xs` mais utilitários (`bg-primary`, `text-primary-fg`, `border-border`, `text-2xs`).

Nos dois casos, declare o `color-scheme` da página (as cores são `light-dark()`, então o tema é puro CSS). Numa entrada do Tailwind:

```css
@import "tailwindcss";
@import "@tooark/tokens/tokens.css";

:root {
  color-scheme: light dark; /* segue o sistema; ou "light" / "dark" para forçar um lado */
}
```

---

## 📦 Componentes

### Custom properties CSS

Nomes como as folhas de estilo do Tooark os expõem; na sua própria entrada do Tailwind, os do `@theme` ficam sem o prefixo `ark-` (`--color-surface`, `--size-md`, `--text-2xs`).

- Cores: `--ark-color-<intent>`, `-fg`, `-hover`, `-soft`, `-soft-fg`, `-border`, `-ring`; neutros `--ark-color-surface`, `-surface-muted`, `-surface-strong`, `-surface-raised`, `-fg`, `-fg-soft`, `-fg-muted`, `-fg-faint`, `-fg-placeholder`, `-border`, `-border-strong`, `-muted`, `-ring`.
- Tamanhos: `--ark-size-xs…xl` (1,5 / 1,75 / 2,25 / 2,75 / 3,25 rem, a altura mínima dos controles); `--ark-text-2xs` (0,6875 rem) para micro-rótulos.
- Motion (custom properties puras, fora do `@theme`: o mesmo nome em qualquer lugar, inclusive com o `tokens.css` como CSS puro): `--ark-duration-none|instant|quick|default|moderate|gentle|slow|long`, `--ark-ease-*`, `--ark-motion-distance`.

### JavaScript

- `resolveColorScheme(element?)` → `"light" | "dark"` pelo `color-scheme` computado do elemento (preferência do sistema quando a página deixa em `light dark`).
- `observeColorScheme(element, onChange)` → função de dispose; observa `class`, `style`, `data-theme` e `theme` em `<html>`/`<body>` mais a preferência do sistema.
- `ARK_DURATION_MS`, `ARK_EASING_CSS`, `ARK_MOTION_DISTANCE`.
- Tipos: `ArkIntent`, `ArkSize`, `ArkRounded`, `ArkStyleVariant`, `ArkTheme`, `ArkThemeSelected`, `ArkDuration`, `ArkEasing`.

---

## 📝 Exemplos de Uso

### Estilizando um componente seu com os tokens

```css
/* com o @tooark/web-components/styles.css (ou o @tooark/core/styles.css) na página */
.card {
  background: var(--ark-color-surface);
  color: var(--ark-color-fg);
  border: 1px solid var(--ark-color-border);
  border-radius: 0.5rem;
  transition: opacity var(--ark-duration-quick) var(--ark-ease-out);
}

.card--danger {
  background: var(--ark-color-danger-soft);
  color: var(--ark-color-danger-soft-fg);
}
```

### Acompanhando o tema da página pelo JavaScript

```ts
import { observeColorScheme, resolveColorScheme } from "@tooark/tokens";

const host = document.querySelector("#chart")!;
aplicarTema(resolveColorScheme(host)); // "light" | "dark"

const parar = observeColorScheme(host, (tema) => aplicarTema(tema)); // troca em tempo de execução
// depois: parar();
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                         | Versão | Descrição                        |
| ---------------------------------------------- | ------ | -------------------------------- |
| [`tslib`](https://www.npmjs.com/package/tslib) | ^2.8.1 | Helpers de runtime do TypeScript |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/tokens` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
