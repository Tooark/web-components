# @tooark/react

[![npm](https://img.shields.io/npm/v/@tooark/react?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/react)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Wrappers React tipados dos Tooark Web Components: props camelCase, eventos customizados como handlers, tipagens JSX de toda tag `ark-*`. React 18 e 19.

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

O pacote `@tooark/react` fornece:

- um componente por elemento (33 wrappers: `ArkAlert`, `ArkAvatar`, `ArkBadge`, `ArkButton`, `ArkCalendar`, `ArkCard`, …) com props tipadas que estendem os `Ark*StyleOptions` do `@tooark/core`;
- props camelCase viram atributos; booleanos vão como presente/ausente; props de objeto (`events`, `rows`, `options`, `localeJson`) são serializadas ou atribuídas como propriedade por você;
- eventos customizados viram handlers que recebem o `CustomEvent` (`onChange`, `onClose`, `onSelect`, `onEventClick`, …); eventos nativos (`onClick`, `onInput`) funcionam como sempre;
- os elementos se registram no primeiro render (`ensureTooarkComponentsRegistered`), só no navegador, então frameworks com SSR funcionam;
- tipagens `IntrinsicElements` de toda tag `ark-*`, para os pacotes laterais ou quando você preferir o elemento cru;
- `toast`, `showToast`, `dismissToast` reexportados do `@tooark/core`.

---

## 🔧 Instalação

```bash
pnpm add @tooark/react   # traz @tooark/web-components, @tooark/core e @tooark/tokens
```

Peer dependencies: `react` e `react-dom` ≥ 18.

---

## ⚙️ Configuração

Importe a folha de estilo uma vez, no `main.tsx` ou no layout raiz; nada mais a configurar (os wrappers registram os elementos sozinhos):

```tsx
import "@tooark/web-components/styles.css";
```

---

## 📦 Componentes

Um wrapper por elemento, com o nome dele: `ark-button` → `ArkButton`, `ark-kv-editor` → `ArkKvEditor`, `ark-command-palette` → `ArkCommandPalette` + `ArkCommandItem`. Cada um exporta o tipo das props (`ArkButtonProps`, …).

- Props: os atributos do elemento em camelCase (`iconOnly`, `stepMinutes`, `localeJson`), `className`, mais as propriedades JS do elemento onde importam (`events`, `rows`, `options`, `sizes`, `colors`).
- Eventos: `on<Evento>` para os eventos customizados, recebendo o `CustomEvent` (`onChange` em `ArkSelect`/`ArkKvEditor`, `onClose` em `ArkDialog`/`ArkDrawer`, `onSelect` em `ArkMenu`/`ArkCommandPalette`, `onEventClick`/`onSlotClick`/`onViewChange`/`onRangeChange` em `ArkScheduler`, …). Eventos nativos sobem do controle interno (`onInput` em `ArkInput`: leia `event.target.value`).
- Estado: atributos como `open` são a fonte da verdade (`ArkDialog open={bool}` + `onClose`), então renderização controlada funciona e a saída continua animando.

Referência completa de atributos, guia de tema e hooks de E2E: [https://github.com/Tooark/web-components/blob/main/README.pt-BR.md](https://github.com/Tooark/web-components/blob/main/README.pt-BR.md) · exemplos vivos com testes de interação: [Storybook](https://tooark.github.io/web-components/).

---

## 📝 Exemplos de Uso

### Um formulário com diálogo de confirmação e toast

```tsx
import { ArkButton, ArkDialog, ArkInput, ArkSelect, ArkToaster, toast } from "@tooark/react";
import { type FormEvent, useState } from "react";

const PAPEIS = [
  { value: "dev", label: "Desenvolvimento" },
  { value: "ops", label: "Operações" },
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
      <ArkInput label="Nome" value={nome} required onInput={(e) => setNome((e.target as HTMLInputElement).value)} />
      <ArkSelect label="Papel" options={PAPEIS} value={papel} onChange={(e) => setPapel(e.detail.value)} />
      <ArkButton type="submit" intent="primary">
        Salvar
      </ArkButton>

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

### Um elemento cru de um pacote lateral

```tsx
import { registerTooarkChart } from "@tooark/chart";
import { useEffect, useRef } from "react";

export function Vendas({ option }: { option: object }) {
  const ref = useRef<HTMLElement & { option: object }>(null);
  useEffect(() => {
    registerTooarkChart();
    if (ref.current) ref.current.option = option; // propriedade JS, não atributo
  }, [option]);
  return <ark-chart ref={ref} height="320px" />; // tipado pelos IntrinsicElements do @tooark/react
}
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                                           | Versão      | Descrição                                                            |
| -------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)                     | ^1.0.0      | Tipos, i18n, serviços de toast/announce, motion e helpers de overlay |
| [`@tooark/web-components`](https://www.npmjs.com/package/@tooark/web-components) | ^1.0.0      | Os Custom Elements `ark-*` e a folha de estilo deles                 |
| [`react`](https://www.npmjs.com/package/react)                                   | >=18 (peer) | React 18 ou 19                                                       |
| [`react-dom`](https://www.npmjs.com/package/react-dom)                           | >=18 (peer) | Renderizador React DOM                                               |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/react` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
