# @tooark/code

[![npm](https://img.shields.io/npm/v/@tooark/code?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/code)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

`<ark-code-editor>`: um editor CodeMirror 6 como Custom Element — JSON, JavaScript e YAML com completions, formatação, opções de recuo e de fim de linha, com tema pelos tokens Tooark.

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

O pacote `@tooark/code` fornece:

- `language` json / javascript / yaml / text, numeração, dobra, busca (Ctrl+F), pares de colchetes, linha ativa, placeholder, `readonly`, `wrap`, `min-height`;
- Tab recua (Shift+Tab desfaz; Esc e depois Tab sai do editor), `indent-style` espaços ou tabulação, `indent-size`, `line-ending` `auto`/`lf`/`crlf` convertido na fronteira do valor;
- completions: as da linguagem, `variableKeys` depois de `{{`, `completions` (palavras em qualquer linguagem) e `completionSource`; `autocomplete="false"` desliga;
- opcionais, desligados até você passá-los: `variables` pinta cada `{{chave}}` pelo intent da variável (escopo livre, tooltip com escopo e valor), `mark-unknown-variables` marca as chaves não definidas e `single-line` faz do editor um campo de uma linha na altura dos controles (`size`), com Enter emitindo `ark-submit`;
- `format()` e Shift+Alt+F: JSON de fábrica com o recuo configurado, outras linguagens pelo gancho `formatter` (o Prettier fica no app);
- chrome sobre os tokens `--ark-color-*` com fallback, `theme="auto"` seguindo a página em tempo de execução; engine `createCodeEditor` sem o elemento;
- pacotes do CodeMirror como peer dependencies, para a página ter uma cópia de `@codemirror/state`.

---

## 🔧 Instalação

```bash
pnpm add @tooark/code @codemirror/state @codemirror/view @codemirror/language @codemirror/commands @codemirror/search @codemirror/autocomplete @codemirror/lang-json @codemirror/lang-javascript @codemirror/lang-yaml @lezer/highlight
```

Os pacotes do CodeMirror são peer dependencies: a página fica com uma única cópia de cada, e a versão é sua.

---

## ⚙️ Configuração

Registre o elemento uma vez; o editor se estiliza por temas do CodeMirror que leem os tokens `--ark-color-*` (com fallback, então funciona sem o `@tooark/web-components`):

```ts
import { registerTooarkCode } from "@tooark/code";

registerTooarkCode();
```

---

## 📦 Componentes

### `ark-code-editor`

- Atributos: `language` (`json` | `javascript` | `yaml` | `text`), `readonly`, `placeholder`, `min-height` (padrão `8rem`), `line-numbers` e `fold` (ligados; `"false"` desliga), `wrap`, `indent-style` (`space` | `tab`), `indent-size` (padrão 2), `line-ending` (`auto` | `lf` | `crlf`), `tab-indent` e `autocomplete` (ligados; `"false"` desliga), `mark-unknown-variables`, `single-line`, `size` (`xs` … `xl`, padrão `md`: fonte e recuo lateral, e a altura em `single-line`), `theme`, `testid`.
- Propriedades: `value`, `variableKeys`, `variables`, `completions`, `completionSource`, `formatter`, `canFormat`, `resolvedLineEnding`, `resolvedTheme`, `view` (o `EditorView`), e uma por atributo exceto `testid`; métodos `format()`, `focus()`.
- Eventos: `change` (`detail: { value }`, só edições do usuário), `ark-format-error` (`detail: { error }`), `ark-submit` (`detail: { value }`, Enter em `single-line`).
- Teclas: Ctrl/Cmd+F busca, Ctrl/Cmd+Z desfazer, Ctrl+Y refazer (Cmd+Shift+Z no macOS), Ctrl+Espaço completions, Shift+Alt+F formatar, Tab/Shift+Tab recuo, Esc+Tab sair, Ctrl+M (Shift+Alt+M no macOS) alterna o modo tab-focus do CodeMirror.
- Hooks: a raiz do CodeMirror leva `data-ark="code-editor"` e o `testid` como `data-testid`; cada variável pintada, `data-ark="code-editor-variable"` com `data-key`; o tooltip dela, `data-ark="code-editor-variable-tooltip"`.

### Variáveis com escopo

Nada muda até o app passar `variables` ou ligar `mark-unknown-variables`; `variableKeys` sozinho continua só completando.

- `variables`: `ArkCodeVariable[]`, um `{ key, scope?, intent?, value? }` por chave. A biblioteca não conhece escopo nenhum: `scope` é o nome que o app usar, e quando uma chave existe em vários escopos o app resolve a precedência e manda só a vencedora (chave repetida fica com a primeira entrada).
- Cada `{{chave}}` (espaços internos permitidos; chaves com letras, dígitos, `_`, `.`, `-` e `$`) vira `<span class="cm-ark-variable cm-ark-variable-<intent>" data-key data-scope data-intent>` com o fundo e o texto suaves do intent (`--ark-color-<intent>-soft`/`-soft-fg`, padrão `primary`), inclusive dentro de strings JSON, e cada variável fica num span só. Os matizes distintos são `info`, `success`, `warning`/`primary` e `danger` (que também marca as chaves desconhecidas); `secondary` e `neutral` ficam perto da cor do texto. Para mais escopos, ou uma paleta própria, troque as cores de um escopo por CSS, por exemplo `ark-code-editor .cm-ark-variable[data-scope="global"] { background: …; color: … }`.
- Variável com `scope` ou `value` mostra um tooltip ao passar o mouse, com o escopo (no intent dela) e o valor; a completion depois de `{{` mostra o escopo como detalhe e o valor como info. Todo esse texto é do app: deixe `value` de fora para segredos.
- `mark-unknown-variables`: o `{{chave}}` que não está em `variables` nem em `variableKeys` ganha `cm-ark-variable-unknown` e `data-unknown`, pintado em `danger` com sublinhado ondulado (não só pela cor).

### Campo de uma linha

`single-line` faz um campo como a barra de endereço: a altura dos controles do mesmo `size` (alinha com `ark-button` e `ark-input`), sem calhas nem linha ativa, Enter emite `ark-submit` em vez de quebrar a linha (com a lista de completions aberta, o Enter aceita a completion), quebras coladas são removidas como num `<input>`, Tab sai do campo e Ctrl/Cmd+F fica com o navegador. Ligar sobre um texto de várias linhas junta as linhas sem `change`. Variáveis e completions funcionam igual.

### Engine

- `createCodeEditor(parent, options)` → `{ view, getValue, setValue, setLanguage, setTheme, setReadonly, setPlaceholder, setLineNumbers, setFold, setWrap, setMinHeight, setIndent, setLineEnding, resolvedLineEnding, setTabIndent, setAutocomplete, setVariableKeys, setVariables, setMarkUnknownVariables, setSingleLine, setSize, setCompletions, setCompletionSource, setFormatter, format, canFormat, resolvedTheme, focus, destroy }`; as opções espelham atributos e propriedades, mais `onChange`, `onFormatError` e `onSubmit`.
- `resolveCodeTheme(theme, element)`.
- Tipos: `ArkCodeEditorInstance`, `ArkCodeEditorOptions`, `ArkCodeVariable`, `ArkCodeLanguage`, `ArkCodeTheme`, `ArkCodeIndentStyle`, `ArkCodeLineEnding`, `ArkCodeCompletion`, `ArkCodeCompletionSource`, `ArkCodeFormatter`.

---

## 📝 Exemplos de Uso

### Um editor de corpo JSON com completions de variáveis

```ts
const editor = document.querySelector("ark-code-editor")!;
editor.setAttribute("language", "json");
editor.setAttribute("indent-size", "4");
editor.variableKeys = ["baseUrl", "token", "user.id"]; // oferecidas depois de {{
editor.value = JSON.stringify(body, null, 4);
editor.addEventListener("change", (event) => salvar((event as CustomEvent<{ value: string }>).detail.value));

botaoFormatar.hidden = !editor.canFormat;
botaoFormatar.addEventListener("click", () => editor.format()); // também Shift+Alt+F
```

### Um campo de URL com variáveis por escopo

```html
<ark-code-editor id="url" single-line mark-unknown-variables placeholder="{{baseUrl}}/caminho"></ark-code-editor>
```

```ts
const url = document.querySelector("ark-code-editor")!;
// A precedência entre escopos é resolvida pelo app: uma entrada por chave.
url.variables = [
  { key: "baseUrl", scope: "global", intent: "info", value: "https://api.exemplo.com" },
  { key: "token", scope: "environment", intent: "success" }, // sem value: fica fora do tooltip
  { key: "userId", scope: "local", intent: "primary", value: "42" },
];
url.value = "{{baseUrl}}/users/{{userId}}";
url.addEventListener("ark-submit", (event) => enviar((event as CustomEvent<{ value: string }>).detail.value));
```

```css
/* cor própria para um escopo, em vez de um intent */
ark-code-editor .cm-ark-variable[data-scope="environment"] {
  background: #ecfeff;
  color: #0e7490;
}
```

### YAML com chaves do schema e formatador do app

```ts
import { dump, load } from "js-yaml"; // dependência sua, não da biblioteca

const editor = document.querySelector("ark-code-editor")!;
editor.setAttribute("language", "yaml");
editor.setAttribute("line-ending", "lf");
editor.completions = [
  { label: "apiVersion", type: "keyword" },
  { label: "kind", type: "keyword" },
  { label: "metadata" },
];
editor.formatter = (value) => dump(load(value), { indent: editor.indentSize });
editor.addEventListener("ark-format-error", (event) => toast.error(String((event as CustomEvent).detail.error)));
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                                                     | Versão     | Descrição                                                  |
| ------------------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------- |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens)                           | ^1.1.0     | Design tokens (cores, tamanhos, motion) e tipos primitivos |
| [`tslib`](https://www.npmjs.com/package/tslib)                                             | ^2.8.1     | Helpers de runtime do TypeScript                           |
| [`@codemirror/autocomplete`](https://www.npmjs.com/package/@codemirror/autocomplete)       | >=6 (peer) | Completions e fechamento de pares                          |
| [`@codemirror/commands`](https://www.npmjs.com/package/@codemirror/commands)               | >=6 (peer) | Atalhos, histórico, comandos de recuo                      |
| [`@codemirror/lang-javascript`](https://www.npmjs.com/package/@codemirror/lang-javascript) | >=6 (peer) | Linguagem JavaScript e completions                         |
| [`@codemirror/lang-json`](https://www.npmjs.com/package/@codemirror/lang-json)             | >=6 (peer) | Linguagem JSON                                             |
| [`@codemirror/lang-yaml`](https://www.npmjs.com/package/@codemirror/lang-yaml)             | >=6 (peer) | Linguagem YAML                                             |
| [`@codemirror/language`](https://www.npmjs.com/package/@codemirror/language)               | >=6 (peer) | Suporte a linguagens, dobra, recuo                         |
| [`@codemirror/search`](https://www.npmjs.com/package/@codemirror/search)                   | >=6 (peer) | Painel de busca e ocorrências da seleção                   |
| [`@codemirror/state`](https://www.npmjs.com/package/@codemirror/state)                     | >=6 (peer) | Estado do editor (uma cópia por página)                    |
| [`@codemirror/view`](https://www.npmjs.com/package/@codemirror/view)                       | >=6 (peer) | View e DOM do editor                                       |
| [`@lezer/highlight`](https://www.npmjs.com/package/@lezer/highlight)                       | >=1 (peer) | Tags de realce de sintaxe                                  |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/code` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
