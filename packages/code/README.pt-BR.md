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

- Atributos: `language` (`json` | `javascript` | `yaml` | `text`), `readonly`, `placeholder`, `min-height` (padrão `8rem`), `line-numbers` e `fold` (ligados; `"false"` desliga), `wrap`, `indent-style` (`space` | `tab`), `indent-size` (padrão 2), `line-ending` (`auto` | `lf` | `crlf`), `tab-indent` e `autocomplete` (ligados; `"false"` desliga), `theme`, `testid`.
- Propriedades: `value`, `variableKeys`, `completions`, `completionSource`, `formatter`, `canFormat`, `resolvedLineEnding`, `resolvedTheme`, `view` (o `EditorView`), e uma por atributo exceto `testid`; métodos `format()`, `focus()`.
- Eventos: `change` (`detail: { value }`, só edições do usuário), `ark-format-error` (`detail: { error }`).
- Teclas: Ctrl/Cmd+F busca, Ctrl/Cmd+Z desfazer, Ctrl+Y refazer (Cmd+Shift+Z no macOS), Ctrl+Espaço completions, Shift+Alt+F formatar, Tab/Shift+Tab recuo, Esc+Tab sair, Ctrl+M (Shift+Alt+M no macOS) alterna o modo tab-focus do CodeMirror.

### Engine

- `createCodeEditor(parent, options)` → `{ view, getValue, setValue, setLanguage, setTheme, setReadonly, setPlaceholder, setLineNumbers, setFold, setWrap, setMinHeight, setIndent, setLineEnding, resolvedLineEnding, setTabIndent, setAutocomplete, setVariableKeys, setCompletions, setCompletionSource, setFormatter, format, canFormat, resolvedTheme, focus, destroy }`.
- `resolveCodeTheme(theme, element)`.
- Tipos: `ArkCodeEditorInstance`, `ArkCodeEditorOptions`, `ArkCodeLanguage`, `ArkCodeTheme`, `ArkCodeIndentStyle`, `ArkCodeLineEnding`, `ArkCodeCompletion`, `ArkCodeCompletionSource`, `ArkCodeFormatter`.

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
