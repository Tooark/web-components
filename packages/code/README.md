# @tooark/code

[![npm](https://img.shields.io/npm/v/@tooark/code?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/code)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

`<ark-code-editor>`: a CodeMirror 6 editor as a Custom Element — JSON, JavaScript and YAML with completions, formatting, indentation and line-ending options, themed by the Tooark tokens.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](./README.pt-BR.md)

---

## Contents

- [Overview](#-overview)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Components](#-components)
- [Usage examples](#-usage-examples)
- [Dependencies](#-dependencies)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

The `@tooark/code` package provides:

- `language` json / javascript / yaml / text, line numbers, folding, search (Ctrl+F), bracket matching, active line, placeholder, `readonly`, `wrap`, `min-height`;
- Tab indents (Shift+Tab outdents; Esc then Tab leaves the editor), `indent-style` spaces or tabs, `indent-size`, `line-ending` `auto`/`lf`/`crlf` converted at the value boundary;
- completions: the language's own, `variableKeys` after `{{`, `completions` (words in any language) and `completionSource`; `autocomplete="false"` turns them off;
- optional, off until you pass them: `variables` paints each `{{key}}` with its variable's intent (free-form scope, hover tooltip with scope and value), `mark-unknown-variables` flags keys that are not defined, and `single-line` turns the editor into a one-line field at control height (`size`), Enter emitting `ark-submit`;
- `format()` and Shift+Alt+F: JSON built in with the configured indentation, other languages through the `formatter` hook (Prettier stays in the app);
- chrome on the `--ark-color-*` tokens with fallbacks, `theme="auto"` following the page at runtime; `createCodeEditor` engine without the element;
- CodeMirror packages as peer dependencies, so the page keeps one copy of `@codemirror/state`.

---

## 🔧 Installation

```bash
pnpm add @tooark/code @codemirror/state @codemirror/view @codemirror/language @codemirror/commands @codemirror/search @codemirror/autocomplete @codemirror/lang-json @codemirror/lang-javascript @codemirror/lang-yaml @lezer/highlight
```

The CodeMirror packages are peer dependencies: your page keeps a single copy of each, and you choose the versions.

---

## ⚙️ Configuration

Register the element once; the editor styles itself through CodeMirror themes that read the `--ark-color-*` tokens (with fallbacks, so it works without `@tooark/web-components`):

```ts
import { registerTooarkCode } from "@tooark/code";

registerTooarkCode();
```

---

## 📦 Components

### `ark-code-editor`

- Attributes: `language` (`json` | `javascript` | `yaml` | `text`), `readonly`, `placeholder`, `min-height` (default `8rem`), `line-numbers` and `fold` (on; `"false"` turns off), `wrap`, `indent-style` (`space` | `tab`), `indent-size` (default 2), `line-ending` (`auto` | `lf` | `crlf`), `tab-indent` and `autocomplete` (on; `"false"` turns off), `mark-unknown-variables`, `single-line`, `size` (`xs` … `xl`, default `md`: font and side padding, plus the height in `single-line`), `theme`, `testid`.
- Properties: `value`, `variableKeys`, `variables`, `completions`, `completionSource`, `formatter`, `canFormat`, `resolvedLineEnding`, `resolvedTheme`, `view` (the `EditorView`), and one per attribute except `testid`; methods `format()`, `focus()`.
- Events: `change` (`detail: { value }`, user edits only), `ark-format-error` (`detail: { error }`), `ark-submit` (`detail: { value }`, Enter in `single-line`).
- Keys: Ctrl/Cmd+F search, Ctrl/Cmd+Z undo, Ctrl+Y redo (Cmd+Shift+Z on macOS), Ctrl+Space completions, Shift+Alt+F format, Tab/Shift+Tab indent, Esc+Tab leave, Ctrl+M (Shift+Alt+M on macOS) toggles CodeMirror's tab-focus mode.
- Hooks: the CodeMirror root carries `data-ark="code-editor"` and the `testid` as `data-testid`; each painted variable `data-ark="code-editor-variable"` with `data-key`; its tooltip `data-ark="code-editor-variable-tooltip"`.

### Scoped variables

Nothing changes until the app passes `variables` or sets `mark-unknown-variables`; `variableKeys` alone still only completes.

- `variables`: `ArkCodeVariable[]`, one `{ key, scope?, intent?, value? }` per key. The library knows no scope: `scope` is any name the app uses, and when a key exists in several scopes the app resolves the precedence and sends only the winner (a repeated key keeps its first entry).
- Each `{{key}}` (inner spaces allowed; keys use letters, digits, `_`, `.`, `-` and `$`) becomes `<span class="cm-ark-variable cm-ark-variable-<intent>" data-key data-scope data-intent>` with the intent's soft background and text (`--ark-color-<intent>-soft`/`-soft-fg`, default `primary`), also inside JSON strings, and each variable stays a single span. The distinct hues are `info`, `success`, `warning`/`primary` and `danger` (which also marks unknown keys); `secondary` and `neutral` read close to the text color. For more scopes, or your own palette, override a scope's colors with CSS, e.g. `ark-code-editor .cm-ark-variable[data-scope="global"] { background: …; color: … }`.
- A variable with `scope` or `value` shows a hover tooltip with the scope (in its intent) and the value; the completion after `{{` shows the scope as detail and the value as info. All of that text is the app's: leave `value` out for secrets.
- `mark-unknown-variables`: a `{{key}}` found in neither `variables` nor `variableKeys` gets `cm-ark-variable-unknown` and `data-unknown`, painted `danger` with a wavy underline (not color alone).

### Single-line field

`single-line` makes a field such as a URL bar: the height of the controls of the same `size` (it lines up with `ark-button` and `ark-input`), no gutters and no active line, Enter emits `ark-submit` instead of breaking the line (when the completion list is open, Enter accepts the completion), pasted line breaks are removed as in an `<input>`, Tab leaves the field and Ctrl/Cmd+F is left to the browser. Turning it on over a multi-line text joins the lines without a `change`. Variables and completions work the same.

### Engine

- `createCodeEditor(parent, options)` → `{ view, getValue, setValue, setLanguage, setTheme, setReadonly, setPlaceholder, setLineNumbers, setFold, setWrap, setMinHeight, setIndent, setLineEnding, resolvedLineEnding, setTabIndent, setAutocomplete, setVariableKeys, setVariables, setMarkUnknownVariables, setSingleLine, setSize, setCompletions, setCompletionSource, setFormatter, format, canFormat, resolvedTheme, focus, destroy }`; the options mirror the attributes and properties, plus `onChange`, `onFormatError` and `onSubmit`.
- `resolveCodeTheme(theme, element)`.
- Types: `ArkCodeEditorInstance`, `ArkCodeEditorOptions`, `ArkCodeVariable`, `ArkCodeLanguage`, `ArkCodeTheme`, `ArkCodeIndentStyle`, `ArkCodeLineEnding`, `ArkCodeCompletion`, `ArkCodeCompletionSource`, `ArkCodeFormatter`.

---

## 📝 Usage examples

### A JSON body editor with variable completions

```ts
const editor = document.querySelector("ark-code-editor")!;
editor.setAttribute("language", "json");
editor.setAttribute("indent-size", "4");
editor.variableKeys = ["baseUrl", "token", "user.id"]; // offered after {{
editor.value = JSON.stringify(body, null, 4);
editor.addEventListener("change", (event) => save((event as CustomEvent<{ value: string }>).detail.value));

formatButton.hidden = !editor.canFormat;
formatButton.addEventListener("click", () => editor.format()); // also Shift+Alt+F
```

### A URL field with scoped variables

```html
<ark-code-editor id="url" single-line mark-unknown-variables placeholder="{{baseUrl}}/path"></ark-code-editor>
```

```ts
const url = document.querySelector("ark-code-editor")!;
// Precedence between scopes is resolved by the app: one entry per key.
url.variables = [
  { key: "baseUrl", scope: "global", intent: "info", value: "https://api.example.com" },
  { key: "token", scope: "environment", intent: "success" }, // no value: kept out of the tooltip
  { key: "userId", scope: "local", intent: "primary", value: "42" },
];
url.value = "{{baseUrl}}/users/{{userId}}";
url.addEventListener("ark-submit", (event) => send((event as CustomEvent<{ value: string }>).detail.value));
```

```css
/* your own color for one scope, instead of an intent */
ark-code-editor .cm-ark-variable[data-scope="environment"] {
  background: #ecfeff;
  color: #0e7490;
}
```

### YAML with schema keys and an app formatter

```ts
import { dump, load } from "js-yaml"; // your dependency, not the library's

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

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                                                    | Version    | Description                                               |
| ------------------------------------------------------------------------------------------ | ---------- | --------------------------------------------------------- |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens)                           | ^1.2.0     | Design tokens (colors, sizes, motion) and primitive types |
| [`tslib`](https://www.npmjs.com/package/tslib)                                             | ^2.8.1     | TypeScript runtime helpers                                |
| [`@codemirror/autocomplete`](https://www.npmjs.com/package/@codemirror/autocomplete)       | >=6 (peer) | Completions and bracket closing                           |
| [`@codemirror/commands`](https://www.npmjs.com/package/@codemirror/commands)               | >=6 (peer) | Keymaps, history, indentation commands                    |
| [`@codemirror/lang-javascript`](https://www.npmjs.com/package/@codemirror/lang-javascript) | >=6 (peer) | JavaScript language and completions                       |
| [`@codemirror/lang-json`](https://www.npmjs.com/package/@codemirror/lang-json)             | >=6 (peer) | JSON language                                             |
| [`@codemirror/lang-yaml`](https://www.npmjs.com/package/@codemirror/lang-yaml)             | >=6 (peer) | YAML language                                             |
| [`@codemirror/language`](https://www.npmjs.com/package/@codemirror/language)               | >=6 (peer) | Language support, folding, indentation                    |
| [`@codemirror/search`](https://www.npmjs.com/package/@codemirror/search)                   | >=6 (peer) | Search panel and selection matches                        |
| [`@codemirror/state`](https://www.npmjs.com/package/@codemirror/state)                     | >=6 (peer) | Editor state (one copy per page)                          |
| [`@codemirror/view`](https://www.npmjs.com/package/@codemirror/view)                       | >=6 (peer) | Editor view and DOM                                       |
| [`@lezer/highlight`](https://www.npmjs.com/package/@lezer/highlight)                       | >=1 (peer) | Syntax highlight tags                                     |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/code` is released in lockstep with every other `@tooark/*` package.

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
