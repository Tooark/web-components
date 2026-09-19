# @tooark/motion

[![npm](https://img.shields.io/npm/v/@tooark/motion?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/motion)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Helpers opt-in de animação sobre a lib Motion, calibrados pelos tokens de motion Tooark: entradas escalonadas, scroll reveal, reordenação FLIP e gestos de swipe com física de spring.

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

O pacote `@tooark/motion` fornece:

- `arkStaggerEnter(targets, options)`: entrada de uma lista com os presets `fade`/`slide-*`/`scale`, `interval` e `from` (`first`, `last`, `center`);
- `arkReveal(targets, options)`: animação de entrada quando os elementos entram na viewport (`once`, `amount`, `margin`), devolve a função que para;
- `arkFlip(targets, mutate, options)`: mede, aplica a sua mutação de DOM (reordenar, inserir, filtrar) e anima cada item até a nova posição com spring (`stiffness`, `damping`);
- `arkSwipe(element, options)`: gesto de ponteiro num eixo com `threshold`, `velocityThreshold`, `feedback` de arrasto e `resistance`, chamando `onSwipe(direction, { delta, velocity })`;
- todos respeitam `prefers-reduced-motion` e os tokens `--ark-duration-*`/`--ark-ease-*`; as primitivas da Motion (`animate`, `spring`, `stagger`, `inView`, …) são reexportadas;
- nada aqui é exigido pelos componentes: o `@tooark/core` já traz uma camada de motion sem dependências.

---

## 🔧 Instalação

```bash
pnpm add @tooark/motion   # traz motion, @tooark/core e @tooark/tokens
```

---

## ⚙️ Configuração

Sem registro: importe os helpers que usar. Durações e easings vêm dos tokens na página (`@tooark/web-components/styles.css` ou `@tooark/core/styles.css`); sem eles valem os espelhos JS do `@tooark/tokens`.

---

## 📦 Componentes

- `arkStaggerEnter(targets, { preset?, duration?, ease?, distance?, interval?, from? })` → `Promise<void>`.
- `arkReveal(targets, { preset?, duration?, ease?, distance?, once?, amount?, margin? })` → função que para.
- `arkFlip(targets, mutate, { stiffness?, damping? })` → `Promise<void>`.
- `arkSwipe(element, { axis?, threshold?, velocityThreshold?, feedback?, resistance?, onSwipe })` → função de dispose.
- `targets`: um seletor, um elemento, um array ou uma `NodeList` (`ArkMotionTargets`).
- Reexportados da Motion: `animate`, `hover`, `inView`, `press`, `scroll`, `spring`, `stagger`.
- Tipos: `ArkStaggerOptions`, `ArkRevealOptions`, `ArkFlipOptions`, `ArkSwipeOptions`, `ArkSwipeDirection`, `ArkSwipeInfo`, `ArkMotionPreset`.

---

## 📝 Exemplos de Uso

### Entrada escalonada de lista e scroll reveal

```ts
import { arkReveal, arkStaggerEnter } from "@tooark/motion";

await arkStaggerEnter(".resultados > li", { preset: "slide-up", interval: 40, from: "first" });

const parar = arkReveal(".card", { preset: "fade", once: true, amount: 0.3 });
// ao desmontar: parar();
```

### Reordenação FLIP e uma linha com swipe para arquivar

```ts
import { arkFlip, arkSwipe } from "@tooark/motion";

const lista = document.querySelector("ul")!;
await arkFlip(lista.children, () => {
  lista.prepend(lista.lastElementChild!); // qualquer mutação de DOM: reordenar, inserir, filtrar
});

const dispose = arkSwipe(linha, {
  axis: "x",
  threshold: 64,
  onSwipe: (direcao) => {
    if (direcao === "left") arquivar(linha);
  },
});
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                           | Versão  | Descrição                                                            |
| ---------------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)     | ^1.0.0  | Tipos, i18n, serviços de toast/announce, motion e helpers de overlay |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens) | ^1.0.0  | Design tokens (cores, tamanhos, raios, motion) e tipos primitivos    |
| [`motion`](https://www.npmjs.com/package/motion)                 | ^13.1.1 | Biblioteca de animação Motion (spring, scroll, gestos)               |
| [`tslib`](https://www.npmjs.com/package/tslib)                   | ^2.8.1  | Helpers de runtime do TypeScript                                     |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/motion` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
