# @tooark/wysiwyg

[![npm](https://img.shields.io/npm/v/@tooark/wysiwyg?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/wysiwyg)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

`<ark-wysiwyg-editor>` e `<ark-wysiwyg-viewer>`: um editor de texto rico Tiptap e o viewer somente leitura como Custom Elements, com conteúdo JSON sanitizado, grupos de toolbar opt-in e mídia externa por um gancho de upload.

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

O pacote `@tooark/wysiwyg` fornece:

- conteúdo como JSON do Tiptap (nunca HTML cru), sanitizado ao entrar por `sanitizeWysiwygContent`: nós e marcas desconhecidos caem, `href`/`src`/`poster` restritos a http(s), mailto, tel ou caminho relativo iniciado por `/`, `#`, `?`, `./` ou `../` (`uploads/x.png` é recusado), cores validadas (hex, nome de cor CSS ou `rgb()`/`hsl()`);
- toolbar montada por grupos opt-in (`style`, `marks`, `color`, `align`, `lists`, `link`, `media`, `blocks`, `clear`, `history`; `all`, `none`), `role="toolbar"` com um tab stop, rótulos em `en`/`pt`/`es`;
- links com popover de URL (esquemas inseguros recusados), paletas de cor do texto e marca-texto, alinhamento, recuo de listas, limpar formatação;
- imagens e vídeos só pelo gancho `uploadFile(file, kind)` — seu storage, o JSON guarda a URL, nunca base64; sem o gancho o grupo `media` não é renderizado, arquivos colados/arrastados são recusados e `<img>`/`<video>` saem do HTML colado; com ele, `<img>`/`<video>` colados só entram com `src` permitido; arquivos colados/arrastados que não são imagem nem vídeo são recusados com `unsupported-type`;
- o mesmo schema no viewer, que renderiza links com `target="_blank"` e `rel="noopener noreferrer nofollow"`;
- engine `createWysiwygEditor`/`createWysiwygViewer` para uso sem os elementos; tema segue a página (`theme="auto"`).

---

## 🔧 Instalação

```bash
pnpm add @tooark/wysiwyg   # o Tiptap é instalado como dependência
```

---

## ⚙️ Configuração

Registre os elementos uma vez; o pacote injeta o próprio CSS (sem Tailwind) e segue o `color-scheme` da página:

```ts
import { registerTooarkWysiwyg } from "@tooark/wysiwyg";

registerTooarkWysiwyg();
```

Escolha os grupos da toolbar por instância com `toolbar` e, para ligar imagens e vídeos, atribua a propriedade `uploadFile` (uma função que guarda o arquivo e resolve `{ src, alt?, title?, poster? }`).

---

## 📦 Componentes

### `ark-wysiwyg-editor`

- Atributos: `toolbar` (grupos e/ou itens separados por vírgula; `all`; `none`; padrão `style,marks,lists,link,blocks,clear,history`), `theme` (`auto` | `light` | `dark`), `placeholder`, `editable="false"`, `lang` (`en` | `pt` | `es`, ou `custom` com `locale-json`), `colors`/`highlights` (arrays JSON de cores CSS: hex, nome de cor ou `rgb()`/`hsl()`; as demais, como `oklch()` ou `var()`, são descartadas), `max-file-size` (bytes, padrão 10 MiB).
- Itens da toolbar, para combinar com os grupos em `toolbar` (nomes desconhecidos são ignorados; `image`/`video` só com `uploadFile`): `heading` (seletor de estilo do bloco), `heading-1` a `heading-4`, `bold`, `italic`, `underline`, `strike`, `code`, `text-color`, `highlight`, `align-left`, `align-center`, `align-right`, `align-justify`, `bullet-list`, `ordered-list`, `outdent`, `indent`, `link`, `image`, `video`, `blockquote`, `horizontal-rule`, `clear-format`, `undo`, `redo`.
- Propriedades: `content` (JSON do Tiptap, sanitizado; atribuir não emite `ark-wysiwyg-change` e fica fora do histórico), `uploadFile`, `colors`, `highlights`, `resolvedTheme`, `editor` (a instância do Tiptap); `insertFile(file)`.
- Eventos: `ark-wysiwyg-change` (`detail` = JSON), `ark-wysiwyg-upload-error` (`detail: { reason, file, error? }`, motivos `no-uploader`, `unsupported-type`, `too-large`, `invalid-src`, `failed`).

### `ark-wysiwyg-viewer`

- Atributos: `theme`. Propriedades: `content`, `resolvedTheme`.

### Engine e helpers

- `createWysiwygEditor(element, options)`, `createWysiwygViewer(element, options)` → `{ editor, getJSON, setContent, isActive, setEditable, setTheme, resolvedTheme, insertFile, uploading, setLink, unsetLink, destroy }`.
- `createWysiwygExtensions`, `Video` (o nó de vídeo), `sanitizeWysiwygContent(json, schema)`, `isSafeUrl`, `isSafeColor`, `resolveWysiwygLabels`, `resolveWysiwygTheme(theme, element)`, `ARK_WYSIWYG_TOOLBAR_GROUPS`, `ARK_WYSIWYG_DEFAULT_TOOLBAR`, `EMPTY_DOC`, `DEFAULT_MAX_FILE_SIZE`, `HEADING_LEVELS`.
- Estilos: `ensureWysiwygStyles()` injeta o `wysiwygCss` no `<head>` uma única vez (um `<style>` cujo id é `WYSIWYG_STYLE_ID`); os elementos a chamam ao conectar, o engine não.
- Tipos: `ArkWysiwygInstance`, `ArkWysiwygContent`, `ArkWysiwygEditorOptions`, `ArkWysiwygViewerOptions`, `ArkWysiwygTheme`, `ArkWysiwygLang`, `ArkWysiwygLabels`, `ArkWysiwygToolbarGroup`, `ArkWysiwygToolbarItem`, `ArkWysiwygUploader`, `ArkWysiwygUploadKind`, `ArkWysiwygUploadResult`, `ArkWysiwygUploadError`, `ArkWysiwygUploadErrorReason`, `JSONContent` (reexportado).

---

## 📝 Exemplos de Uso

### Editor com upload de mídia e um viewer

```ts
const editor = document.querySelector("ark-wysiwyg-editor")!;
editor.setAttribute("toolbar", "style,marks,color,lists,link,media,history");
editor.uploadFile = async (file, kind) => {
  const url = await api.enviar(file); // seu storage; kind é "image" | "video"
  return { src: url, alt: file.name };
};
editor.content = jsonSalvo; // sanitizado ao entrar
editor.addEventListener("ark-wysiwyg-change", (event) => salvar((event as CustomEvent).detail));
editor.addEventListener("ark-wysiwyg-upload-error", (event) => {
  toast.error(`Upload recusado: ${(event as CustomEvent).detail.reason}`);
});

document.querySelector("ark-wysiwyg-viewer")!.content = jsonSalvo;
```

### Sanitizando conteúdo também fora do editor

```ts
import { createWysiwygViewer, sanitizeWysiwygContent } from "@tooark/wysiwyg";

// O viewer já sanitiza no setContent; o helper é exportado para a sua própria camada de validação.
const viewer = createWysiwygViewer(document.createElement("div"));
const seguro = sanitizeWysiwygContent(jsonNaoConfiavel, viewer.editor.schema); // javascript:, data:, nós desconhecidos caem
viewer.destroy();
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                                                         | Versão  | Descrição                                                                 |
| ---------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| [`@tiptap/core`](https://www.npmjs.com/package/@tiptap/core)                                   | ^3.31.3 | Núcleo do editor Tiptap (ProseMirror)                                     |
| [`@tiptap/extension-highlight`](https://www.npmjs.com/package/@tiptap/extension-highlight)     | ^3.31.3 | Marca-texto multicolor (`<mark>`)                                         |
| [`@tiptap/extension-image`](https://www.npmjs.com/package/@tiptap/extension-image)             | ^3.31.3 | Nó de imagem (base64 desligado)                                           |
| [`@tiptap/extension-placeholder`](https://www.npmjs.com/package/@tiptap/extension-placeholder) | ^3.31.3 | Placeholder do documento vazio                                            |
| [`@tiptap/extension-text-align`](https://www.npmjs.com/package/@tiptap/extension-text-align)   | ^3.31.3 | Alinhamento de parágrafos e títulos                                       |
| [`@tiptap/extension-text-style`](https://www.npmjs.com/package/@tiptap/extension-text-style)   | ^3.31.3 | Marca de estilo de texto com cor                                          |
| [`@tiptap/pm`](https://www.npmjs.com/package/@tiptap/pm)                                       | ^3.31.3 | Pacotes ProseMirror usados pelo Tiptap                                    |
| [`@tiptap/starter-kit`](https://www.npmjs.com/package/@tiptap/starter-kit)                     | ^3.31.3 | Nós e marcas base (parágrafo, título, listas, negrito, link, sublinhado…) |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens)                               | ^1.1.0  | Design tokens (cores, tamanhos, motion) e tipos primitivos                |
| [`tslib`](https://www.npmjs.com/package/tslib)                                                 | ^2.8.1  | Helpers de runtime do TypeScript                                          |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/wysiwyg` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
