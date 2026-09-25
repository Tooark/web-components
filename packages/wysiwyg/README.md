# @tooark/wysiwyg

[![npm](https://img.shields.io/npm/v/@tooark/wysiwyg?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/wysiwyg)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

`<ark-wysiwyg-editor>` and `<ark-wysiwyg-viewer>`: a Tiptap rich-text editor and its read-only viewer as Custom Elements, with sanitized JSON content, opt-in toolbar groups and external media through an upload hook.

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

The `@tooark/wysiwyg` package provides:

- content as Tiptap JSON (never raw HTML), sanitized on the way in by `sanitizeWysiwygContent`: unknown nodes and marks dropped, `href`/`src`/`poster` restricted to http(s), mailto, tel or a relative path starting with `/`, `#`, `?`, `./` or `../` (`uploads/x.png` is refused), colors validated (hex, a CSS color name or `rgb()`/`hsl()`);
- toolbar built from opt-in groups (`style`, `marks`, `color`, `align`, `lists`, `link`, `media`, `blocks`, `clear`, `history`; `all`, `none`), `role="toolbar"` with one tab stop, labels in `en`/`pt`/`es`;
- links with a URL popover (unsafe schemes refused), text color and highlight palettes, alignment, list indentation, clear formatting;
- images and videos only through the `uploadFile(file, kind)` hook — your storage, the JSON keeps the URL, never base64; without the hook the `media` group does not render, pasted/dropped files are refused and `<img>`/`<video>` are stripped from pasted HTML; with it, pasted `<img>`/`<video>` only enter with an allowed `src`; pasted/dropped files that are not images or videos are refused with `unsupported-type`;
- the same schema in the viewer, which renders links with `target="_blank"` and `rel="noopener noreferrer nofollow"`;
- `createWysiwygEditor`/`createWysiwygViewer` engine for use without the elements; theme follows the page (`theme="auto"`).

---

## 🔧 Installation

```bash
pnpm add @tooark/wysiwyg   # Tiptap is installed as a dependency
```

---

## ⚙️ Configuration

Register the elements once; the package injects its own CSS (no Tailwind needed) and follows the page's `color-scheme`:

```ts
import { registerTooarkWysiwyg } from "@tooark/wysiwyg";

registerTooarkWysiwyg();
```

Pick the toolbar groups per instance with `toolbar` and, to enable images and videos, assign the `uploadFile` property (a function that stores the file and resolves `{ src, alt?, title?, poster? }`).

---

## 📦 Components

### `ark-wysiwyg-editor`

- Attributes: `toolbar` (groups and/or items, comma-separated; `all`; `none`; default `style,marks,lists,link,blocks,clear,history`), `theme` (`auto` | `light` | `dark`), `placeholder`, `editable="false"`, `lang` (`en` | `pt` | `es`, or `custom` with `locale-json`), `colors`/`highlights` (JSON arrays of CSS colors: hex, a color name or `rgb()`/`hsl()`; others, such as `oklch()` or `var()`, are dropped), `max-file-size` (bytes, default 10 MiB).
- Toolbar items, to mix with the groups in `toolbar` (unknown names are ignored; `image`/`video` only with `uploadFile`): `heading` (block style select), `heading-1` to `heading-4`, `bold`, `italic`, `underline`, `strike`, `code`, `text-color`, `highlight`, `align-left`, `align-center`, `align-right`, `align-justify`, `bullet-list`, `ordered-list`, `outdent`, `indent`, `link`, `image`, `video`, `blockquote`, `horizontal-rule`, `clear-format`, `undo`, `redo`.
- Properties: `content` (Tiptap JSON, sanitized; setting it does not emit `ark-wysiwyg-change` and stays out of the undo history), `uploadFile`, `colors`, `highlights`, `resolvedTheme`, `editor` (the Tiptap instance); `insertFile(file)`.
- Events: `ark-wysiwyg-change` (`detail` = JSON), `ark-wysiwyg-upload-error` (`detail: { reason, file, error? }`, reasons `no-uploader`, `unsupported-type`, `too-large`, `invalid-src`, `failed`).

### `ark-wysiwyg-viewer`

- Attributes: `theme`. Properties: `content`, `resolvedTheme`.

### Engine and helpers

- `createWysiwygEditor(element, options)`, `createWysiwygViewer(element, options)` → `{ editor, getJSON, setContent, isActive, setEditable, setTheme, resolvedTheme, insertFile, uploading, setLink, unsetLink, destroy }`.
- `createWysiwygExtensions`, `Video` (the video node), `sanitizeWysiwygContent(json, schema)`, `isSafeUrl`, `isSafeColor`, `resolveWysiwygLabels`, `resolveWysiwygTheme(theme, element)`, `ARK_WYSIWYG_TOOLBAR_GROUPS`, `ARK_WYSIWYG_DEFAULT_TOOLBAR`, `EMPTY_DOC`, `DEFAULT_MAX_FILE_SIZE`, `HEADING_LEVELS`.
- Styles: `ensureWysiwygStyles()` injects `wysiwygCss` into `<head>` once (a `<style>` whose id is `WYSIWYG_STYLE_ID`); the elements call it on connect, the engine does not.
- Types: `ArkWysiwygInstance`, `ArkWysiwygContent`, `ArkWysiwygEditorOptions`, `ArkWysiwygViewerOptions`, `ArkWysiwygTheme`, `ArkWysiwygLang`, `ArkWysiwygLabels`, `ArkWysiwygToolbarGroup`, `ArkWysiwygToolbarItem`, `ArkWysiwygUploader`, `ArkWysiwygUploadKind`, `ArkWysiwygUploadResult`, `ArkWysiwygUploadError`, `ArkWysiwygUploadErrorReason`, `JSONContent` (re-exported).

---

## 📝 Usage examples

### Editor with media upload and a viewer

```ts
const editor = document.querySelector("ark-wysiwyg-editor")!;
editor.setAttribute("toolbar", "style,marks,color,lists,link,media,history");
editor.uploadFile = async (file, kind) => {
  const url = await api.upload(file); // your storage; kind is "image" | "video"
  return { src: url, alt: file.name };
};
editor.content = savedJson; // sanitized on the way in
editor.addEventListener("ark-wysiwyg-change", (event) => save((event as CustomEvent).detail));
editor.addEventListener("ark-wysiwyg-upload-error", (event) => {
  toast.error(`Upload refused: ${(event as CustomEvent).detail.reason}`);
});

document.querySelector("ark-wysiwyg-viewer")!.content = savedJson;
```

### Sanitizing content outside the editor too

```ts
import { createWysiwygViewer, sanitizeWysiwygContent } from "@tooark/wysiwyg";

// The viewer already sanitizes on setContent; the helper is exported for your own validation layer.
const viewer = createWysiwygViewer(document.createElement("div"));
const safe = sanitizeWysiwygContent(untrustedJson, viewer.editor.schema); // javascript:, data:, unknown nodes dropped
viewer.destroy();
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                                                        | Version | Description                                                              |
| ---------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| [`@tiptap/core`](https://www.npmjs.com/package/@tiptap/core)                                   | ^3.31.3 | Tiptap editor core (ProseMirror)                                         |
| [`@tiptap/extension-highlight`](https://www.npmjs.com/package/@tiptap/extension-highlight)     | ^3.31.3 | Multicolor highlight mark (`<mark>`)                                     |
| [`@tiptap/extension-image`](https://www.npmjs.com/package/@tiptap/extension-image)             | ^3.31.3 | Image node (base64 disabled)                                             |
| [`@tiptap/extension-placeholder`](https://www.npmjs.com/package/@tiptap/extension-placeholder) | ^3.31.3 | Placeholder for the empty document                                       |
| [`@tiptap/extension-text-align`](https://www.npmjs.com/package/@tiptap/extension-text-align)   | ^3.31.3 | Text alignment on paragraphs and headings                                |
| [`@tiptap/extension-text-style`](https://www.npmjs.com/package/@tiptap/extension-text-style)   | ^3.31.3 | Text style mark with color                                               |
| [`@tiptap/pm`](https://www.npmjs.com/package/@tiptap/pm)                                       | ^3.31.3 | ProseMirror packages used by Tiptap                                      |
| [`@tiptap/starter-kit`](https://www.npmjs.com/package/@tiptap/starter-kit)                     | ^3.31.3 | Base nodes and marks (paragraph, heading, lists, bold, link, underline…) |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens)                               | ^1.1.0  | Design tokens (colors, sizes, motion) and primitive types                |
| [`tslib`](https://www.npmjs.com/package/tslib)                                                 | ^2.8.1  | TypeScript runtime helpers                                               |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/wysiwyg` is released in lockstep with every other `@tooark/*` package.

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
