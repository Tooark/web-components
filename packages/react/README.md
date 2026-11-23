# @tooark/react

[![npm](https://img.shields.io/npm/v/@tooark/react?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/react)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Typed React wrappers for the Tooark Web Components: camelCase props, custom events as handlers, JSX typings for every `ark-*` tag. React 18 and 19.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](./README.pt-BR.md)

---

## 📑 Contents

- [Overview](#-overview)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Components](#-components)
- [Usage examples](#-usage-examples)
- [Dependencies](#-dependencies)
- [Contributing](#-contributing)
- [Help & Security](#-help--security)
- [Support](#-support)
- [License](#-license)

---

## 📖 Overview

The `@tooark/react` package provides:

- one component per element (50 wrappers: `ArkAlert`, `ArkAvatar`, `ArkBadge`, `ArkButton`, `ArkCalendar`, `ArkCard`, …) with typed props that extend the `Ark*StyleOptions` from `@tooark/core`;
- camelCase props map to attributes; booleans are passed as present/absent; object props (`events`, `rows`, `options`, and `localeJson` on `ArkCalendar`/`ArkDatepicker`) are serialized or assigned as properties for you (on the other wrappers `localeJson` is a JSON string);
- custom events become handlers receiving the `CustomEvent` (`onChange`, `onClose`, `onSelect`, …) or, on the calendar, datepicker, clock, carousel and scheduler, its `detail`; every props type also takes React's DOM attributes and handlers (`id`, `style`, `title`, `tabIndex`, `aria-*`, `data-*`, `onClick`, `onKeyDown`, `onFocus`, …), typed and forwarded to the element; what the wrapper defines wins over the React prop of the same name (`onChange` is the element's `CustomEvent`), and a `disabled` or `loading` button never fires `onClick`;
- the elements register themselves on first render (`ensureTooarkComponentsRegistered`), browser only, so SSR frameworks are fine;
- `IntrinsicElements` typings for every `ark-*` tag, for the side packages or when you prefer the raw element;
- `toast`, `showToast`, `dismissToast` and `setArkLocale`, `getArkLocale`, `observeArkLocale` (the app-wide default language) re-exported from `@tooark/core`.

---

## 🔧 Installation

```bash
pnpm add @tooark/react @tooark/web-components
```

`@tooark/react` already depends on `@tooark/web-components`, `@tooark/core` and `@tooark/tokens`, but pnpm does not expose transitive dependencies to your app, and the stylesheet import below comes from `@tooark/web-components`: install it directly. `toast` is re-exported by `@tooark/react`.

Peer dependencies: `react` and `react-dom` ≥ 18.

---

## ⚙️ Configuration

Import the stylesheet once, in `main.tsx` or your root layout; nothing else to configure (the wrappers register the elements themselves):

```tsx
import "@tooark/web-components/styles.css";
```

---

## 📦 Components

One wrapper per element, named after it: `ark-button` → `ArkButton`, `ark-kv-editor` → `ArkKvEditor`, `ark-command-palette` → `ArkCommandPalette` + `ArkCommandItem`. Each exports its props type (`ArkButtonProps`, …).

- Props: the element's attributes in camelCase (`iconOnly`, `stepMinutes`, `localeJson`), `className`, plus the element's JS properties where they matter (`events`, `rows`, `options`, `sizes`, `colors`, and `valueField` on `ArkKvEditor`, which must be a stable function: `useCallback`). `ArkDataView` is generic over your record type (`<ArkDataView<User> rows={users} columns={columns} />` types the column `render` and `event.detail.row`) and draws a column's `render` as JSX, through portals into the cells: it returns what a component would (elements, your components, text, `null` for nothing) and runs again on every render, so `columns` needs no `useMemo` (the element only redraws its cells when the column data changes); `cardRender` does the same for a card body.
- Events: `on<Event>` for the custom events, receiving the `CustomEvent` (`onChange` on `ArkSelect`/`ArkKvEditor`, `onClose` on `ArkDialog`/`ArkDrawer`, `onSelect` on `ArkMenu`/`ArkCommandPalette`, …); `onChange` on `ArkCalendar`/`ArkDatepicker`/`ArkClock`, `onSlideChange` on `ArkCarousel` and `onEventClick`/`onSlotClick`/`onViewChange`/`onRangeChange` on `ArkScheduler` receive the `detail` itself. Native events bubble from the inner control (`onInput` on `ArkInput`: read `event.target.value`).
- State: attributes like `open` are the source of truth (`ArkDialog open={bool}` + `onClose`), so controlled rendering works and the exit still animates.
- Ref: every wrapper forwards `ref` to its `ark-*` element (React 18 and 19), typed as the element class from `@tooark/web-components`, so its methods and properties are typed. Object and callback refs both work (including React 19 callback refs that return a cleanup), and the wrapper's own events and properties keep working.

```tsx
import { ArkButton, ArkDialog } from "@tooark/react";
import React, { useRef } from "react";

export function Shortcuts() {
  const dialog = useRef<React.ComponentRef<typeof ArkDialog>>(null); // the <ark-dialog> element
  return (
    <>
      <ArkButton onClick={() => dialog.current?.show()}>Keyboard shortcuts</ArkButton>
      <ArkDialog ref={dialog} label="Keyboard shortcuts">
        <p>Ctrl+K opens the command palette.</p>
      </ArkDialog>
    </>
  );
}
```

### Side packages (subpaths)

`@tooark/react/chart` (`ArkChart`), `@tooark/react/code` (`ArkCodeEditor`) and `@tooark/react/wysiwyg` (`ArkWysiwygEditor`, `ArkWysiwygViewer`) wrap the side packages without adding them to the main entry: install `@tooark/chart`, `@tooark/code` or `@tooark/wysiwyg` (optional peers) with their own peers. `option`, `value`, the code editor's lists and functions (`variables`, `completions`, `formatter`, `extensions`: keep them stable with `useMemo`) and the wysiwyg `content`/`uploadFile` go in as properties, only when the reference changes; a controlled editor keeps its cursor. Events: `onChartClick`; `onChange`, `onSubmit`, `onFormatError` on the code editor (`event.detail.value`); `onChange` (the Tiptap JSON in `event.detail`) and `onUploadError` on the wysiwyg editor. Importing a subpath also types the raw tag's JS properties in JSX (`<ark-chart option={…}>`, `<ark-code-editor value="…" extensions={…}>`); the wysiwyg `content` stays on the wrapper or the ref, since React types `content` as the `<meta>` text attribute.

Full attribute reference, theming guide and E2E hooks: [https://github.com/Tooark/web-components#readme](https://github.com/Tooark/web-components#readme) · live examples with interaction tests: [Storybook](https://tooark.com/web-components/).

---

## 📝 Usage examples

### A form with a confirmation dialog and a toast

```tsx
import { ArkButton, ArkDialog, ArkInput, ArkSelect, ArkToaster, toast } from "@tooark/react";
import { type FormEvent, useState } from "react";

const ROLES = [
  { value: "dev", label: "Developer" },
  { value: "ops", label: "Operations" }
];

export function ProfileForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("dev");
  const [confirming, setConfirming] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    setConfirming(true);
  }

  function publish() {
    setConfirming(false);
    toast.success("Profile published", { description: `Welcome, ${name}.` });
  }

  return (
    <form onSubmit={submit}>
      <ArkInput label="Name" value={name} required onInput={(e) => setName((e.target as HTMLInputElement).value)} />
      <ArkSelect label="Role" options={ROLES} value={role} onChange={(e) => setRole(e.detail.value)} />
      <ArkButton type="submit" intent="primary">
        Save
      </ArkButton>

      <ArkDialog label="Publish changes?" open={confirming} onClose={() => setConfirming(false)}>
        <p>Your profile will be visible to the whole team.</p>
        <div slot="footer">
          <ArkButton variant="ghost" onClick={() => setConfirming(false)}>
            Cancel
          </ArkButton>
          <ArkButton intent="primary" onClick={publish}>
            Publish
          </ArkButton>
        </div>
      </ArkDialog>

      <ArkToaster position="bottom-right" />
    </form>
  );
}
```

### A raw element from a side package

```tsx
import { registerTooarkChart } from "@tooark/chart";
import { useEffect, useRef } from "react";

export function Sales({ option }: { option: object }) {
  const ref = useRef<HTMLElement & { option: object }>(null);
  useEffect(() => {
    registerTooarkChart();
    if (ref.current) ref.current.option = option; // JS property, not an attribute
  }, [option]);
  return <ark-chart ref={ref} height="320px" />; // typed by @tooark/react's IntrinsicElements
}
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                                          | Version                 | Description                                                      |
| -------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)                     | ^1.8.0                  | Types, i18n, toast/announce services, motion and overlay helpers |
| [`@tooark/web-components`](https://www.npmjs.com/package/@tooark/web-components) | ^1.8.0                  | The `ark-*` Custom Elements and their stylesheet                 |
| [`react`](https://www.npmjs.com/package/react)                                   | >=18 (peer)             | React 18 or 19                                                   |
| [`react-dom`](https://www.npmjs.com/package/react-dom)                           | >=18 (peer)             | React DOM renderer                                               |
| [`@tooark/chart`](https://www.npmjs.com/package/@tooark/chart)                   | >=1.0.0 (optional peer) | ark-chart, for the `/chart` subpath                              |
| [`@tooark/code`](https://www.npmjs.com/package/@tooark/code)                     | >=1.6.0 (optional peer) | ark-code-editor, for the `/code` subpath                         |
| [`@tooark/wysiwyg`](https://www.npmjs.com/package/@tooark/wysiwyg)               | >=1.0.0 (optional peer) | ark-wysiwyg-*, for the `/wysiwyg` subpath                        |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/react` is released in lockstep with every other `@tooark/*` package.

---

## 🆘 Help & Security

- ❓ **Questions, bugs, feature ideas** — see [SUPPORT.md](https://github.com/Tooark/web-components/blob/main/SUPPORT.md) for the right channel
- 🔒 **Security vulnerabilities** — do **not** open a public issue; follow [SECURITY.md](https://github.com/Tooark/web-components/blob/main/SECURITY.md)

---

## 💖 Support

If this project helps your workflow, consider supporting its development:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)

Every contribution helps keep the project maintained and improving. Thank you! 🙏

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
