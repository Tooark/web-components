# @tooark/react

[![npm](https://img.shields.io/npm/v/@tooark/react?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/react)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Wrappers React tipados dos Tooark Web Components: props camelCase, eventos customizados como handlers, tipagens JSX de toda tag `ark-*`. React 18 e 19.

🌍 **Idiomas:** [![USA Flag](https://flagcdn.com/w20/us.png) English](./README.md) · ![Brazil Flag](https://flagcdn.com/w20/br.png) **Português (este arquivo)**

---

## 📑 Conteúdo

- [Visão Geral](#-visão-geral)
- [Instalação](#-instalação)
- [Configuração](#️-configuração)
- [Componentes](#-componentes)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Dependências](#-dependências)
- [Contribuição](#-contribuição)
- [Ajuda & Segurança](#-ajuda--segurança)
- [Apoie](#-apoie)
- [Licença](#-licença)

---

## 📖 Visão Geral

O pacote `@tooark/react` fornece:

- um componente por elemento (50 wrappers: `ArkAlert`, `ArkAvatar`, `ArkBadge`, `ArkButton`, `ArkCalendar`, `ArkCard`, …) com props tipadas que estendem os `Ark*StyleOptions` do `@tooark/core`;
- props camelCase viram atributos; booleanos vão como presente/ausente; props de objeto (`events`, `rows`, `options` e o `localeJson` de `ArkCalendar`/`ArkDatepicker`) são serializadas ou atribuídas como propriedade para você (nos demais wrappers o `localeJson` é uma string JSON);
- eventos customizados viram handlers que recebem o `CustomEvent` (`onChange`, `onClose`, `onSelect`, …) ou, no calendário, datepicker, relógio, carrossel e agenda, o `detail` dele; todo tipo de props também aceita os atributos e handlers DOM do React (`id`, `style`, `title`, `tabIndex`, `aria-*`, `data-*`, `onClick`, `onKeyDown`, `onFocus`, …), tipados e repassados ao elemento; o que o wrapper define vale sobre a prop do React de mesmo nome (`onChange` é o `CustomEvent` do elemento), e um botão `disabled` ou `loading` nunca dispara o `onClick`;
- os elementos se registram no primeiro render (`ensureTooarkComponentsRegistered`), só no navegador, então frameworks com SSR funcionam;
- tipagens `IntrinsicElements` de toda tag `ark-*`, para os pacotes laterais ou quando você preferir o elemento cru;
- `toast`, `showToast`, `dismissToast` e `setArkLocale`, `getArkLocale`, `observeArkLocale` (o idioma padrão do app) reexportados do `@tooark/core`.

---

## 🔧 Instalação

```bash
pnpm add @tooark/react @tooark/web-components
```

O `@tooark/react` já depende de `@tooark/web-components`, `@tooark/core` e `@tooark/tokens`, mas o pnpm não expõe dependências transitivas ao seu app, e o import da folha de estilo abaixo vem do `@tooark/web-components`: instale-o diretamente. O `toast` é reexportado pelo `@tooark/react`.

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

- Props: os atributos do elemento em camelCase (`iconOnly`, `stepMinutes`, `localeJson`), `className`, mais as propriedades JS do elemento onde importam (`events`, `rows`, `options`, `sizes`, `colors`, e `valueField` no `ArkKvEditor`, que precisa ser uma função estável: `useCallback`). O `ArkDataView` é genérico no tipo do registro (`<ArkDataView<User> rows={users} columns={columns} />` tipa o `render` da coluna e o `event.detail.row`) e desenha o `render` de uma coluna como JSX, por portais nas células: ele devolve o que um componente devolveria (elementos, componentes seus, texto, `null` para nada) e roda de novo a cada render, então `columns` não precisa de `useMemo` (o elemento só refaz as células quando os dados das colunas mudam); `cardRender` faz o mesmo para o corpo de um card.
- Eventos: `on<Evento>` para os eventos customizados, recebendo o `CustomEvent` (`onChange` em `ArkSelect`/`ArkKvEditor`, `onClose` em `ArkDialog`/`ArkDrawer`, `onSelect` em `ArkMenu`/`ArkCommandPalette`, …); `onChange` em `ArkCalendar`/`ArkDatepicker`/`ArkClock`, `onSlideChange` em `ArkCarousel` e `onEventClick`/`onSlotClick`/`onViewChange`/`onRangeChange` em `ArkScheduler` recebem o próprio `detail`. Eventos nativos sobem do controle interno (`onInput` em `ArkInput`: leia `event.target.value`).
- Estado: atributos como `open` são a fonte da verdade (`ArkDialog open={bool}` + `onClose`), então renderização controlada funciona e a saída continua animando. `onOpen`/`onClose` em `ArkDialog`, `ArkDrawer`, `ArkCommandPalette` e `ArkMenu` só disparam para o evento do próprio elemento, e `onClose` em `ArkTabs` só para as abas dele: `ark-open` e `ark-close` borbulham, e os de um overlay de dentro (um `ArkMenu` num diálogo) não chegam ao handler de fora.
- Ref: todo wrapper encaminha a `ref` ao seu elemento `ark-*` (React 18 e 19), tipada como a classe do elemento de `@tooark/web-components`, então métodos e propriedades dele são tipados. Ref de objeto e callback ref funcionam (inclusive a callback ref do React 19 que devolve uma limpeza), e os eventos e propriedades do próprio wrapper continuam funcionando.

```tsx
import { ArkButton, ArkDialog } from "@tooark/react";
import React, { useRef } from "react";

export function Atalhos() {
  const dialog = useRef<React.ComponentRef<typeof ArkDialog>>(null); // o elemento <ark-dialog>
  return (
    <>
      <ArkButton onClick={() => dialog.current?.show()}>Atalhos de teclado</ArkButton>
      <ArkDialog ref={dialog} label="Atalhos de teclado">
        <p>Ctrl+K abre a paleta de comandos.</p>
      </ArkDialog>
    </>
  );
}
```

### Pacotes laterais (subpaths)

`@tooark/react/chart` (`ArkChart`), `@tooark/react/code` (`ArkCodeEditor`) e `@tooark/react/wysiwyg` (`ArkWysiwygEditor`, `ArkWysiwygViewer`) envolvem os pacotes laterais sem trazê-los para a entrada principal: instale `@tooark/chart`, `@tooark/code` ou `@tooark/wysiwyg` (peers opcionais) com os peers deles. `option`, `value`, as listas e funções do editor de código (`variables`, `completions`, `formatter`, `extensions`: mantenha-as estáveis com `useMemo`) e o `content`/`uploadFile` do wysiwyg entram como propriedades, só quando a referência muda; um editor controlado mantém o cursor. Eventos: `onChartClick`; `onChange`, `onSubmit`, `onFormatError` no editor de código (`event.detail.value`); `onChange` (o JSON do Tiptap em `event.detail`) e `onUploadError` no editor wysiwyg. Importar uma subpath também tipa as propriedades JS da tag crua no JSX (`<ark-chart option={…}>`, `<ark-code-editor value="…" extensions={…}>`); o `content` do wysiwyg fica no wrapper ou na ref, já que o React tipa `content` como o atributo de texto da `<meta>`.

Referência completa de atributos, guia de tema e hooks de E2E: [https://github.com/Tooark/web-components/blob/main/README.pt-BR.md](https://github.com/Tooark/web-components/blob/main/README.pt-BR.md) · exemplos vivos com testes de interação: [Storybook](https://tooark.com/web-components/).

---

## 📝 Exemplos de Uso

### Um formulário com diálogo de confirmação e toast

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

| Pacote                                                                           | Versão                  | Descrição                                                            |
| -------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)                     | ^1.9.1                  | Tipos, i18n, serviços de toast/announce, motion e helpers de overlay |
| [`@tooark/web-components`](https://www.npmjs.com/package/@tooark/web-components) | ^1.9.1                  | Os Custom Elements `ark-*` e a folha de estilo deles                 |
| [`react`](https://www.npmjs.com/package/react)                                   | >=18 (peer)             | React 18 ou 19                                                       |
| [`react-dom`](https://www.npmjs.com/package/react-dom)                           | >=18 (peer)             | Renderizador React DOM                                               |
| [`@tooark/chart`](https://www.npmjs.com/package/@tooark/chart)                   | >=1.0.0 (peer opcional) | ark-chart, para a subpath `/chart`                                   |
| [`@tooark/code`](https://www.npmjs.com/package/@tooark/code)                     | >=1.6.0 (peer opcional) | ark-code-editor, para a subpath `/code`                              |
| [`@tooark/wysiwyg`](https://www.npmjs.com/package/@tooark/wysiwyg)               | >=1.0.0 (peer opcional) | ark-wysiwyg-*, para a subpath `/wysiwyg`                             |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/react` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 🆘 Ajuda & Segurança

- ❓ **Dúvidas, bugs e ideias** — veja o [SUPPORT.md](https://github.com/Tooark/web-components/blob/main/SUPPORT.md) para escolher o canal certo
- 🔒 **Vulnerabilidades de segurança** — **não** abra issue pública; siga o [SECURITY.md](https://github.com/Tooark/web-components/blob/main/SECURITY.md)

---

## 💖 Apoie

Se este projeto ajuda no seu dia a dia, considere apoiar o desenvolvimento:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)

Cada contribuição ajuda a manter o projeto ativo e em evolução. Obrigado! 🙏

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
