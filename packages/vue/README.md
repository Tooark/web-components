# @tooark/vue

[![npm](https://img.shields.io/npm/v/@tooark/vue?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/vue)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Vue 3 wrappers for the Tooark Web Components: typed props, native event names delivering the `CustomEvent`, object props serialized for you.

🌍 **Languages:** ![USA Flag](https://flagcdn.com/w20/us.png) **English (this file)** · [![Brazil Flag](https://flagcdn.com/w20/br.png) Português](./README.pt-BR.md)

## Contents

- [Overview](#-overview)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Components](#-components)
- [Usage examples](#-usage-examples)
- [Dependencies](#-dependencies)
- [Contributing](#-contributing)
- [License](#-license)

## 📖 Overview

The `@tooark/vue` package provides:

- one `defineComponent` per element (`ArkButton`, `ArkInput`, `ArkDialog`, …) with typed props and `inheritAttrs: false`, so extra attributes and native listeners go straight to the element;
- custom events re-emitted with their native names (`@ark-change`, `@ark-close`, `@ark-select`, `@change` on `ArkSelect`, …) delivering the `CustomEvent`;
- object props (`events`, `rows`, `options`, `localeJson`) serialized or assigned as properties for you;
- the elements register themselves on first render, browser only (Nuxt-safe);
- `toast` re-exported from `@tooark/core`.

---

## 🔧 Installation

```bash
pnpm add @tooark/vue   # brings @tooark/web-components, @tooark/core and @tooark/tokens
```

Peer dependency: `vue` ≥ 3.

---

## ⚙️ Configuration

Import the stylesheet once in `main.ts`. If you also use raw `ark-*` tags (side packages), tell the compiler they are custom elements:

```ts
// main.ts
import "@tooark/web-components/styles.css";
```

```ts
// vite.config.ts
import vue from "@vitejs/plugin-vue";

export default {
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("ark-") } } })],
};
```

---

## 📦 Components

One wrapper per element, named after it: `ark-button` → `ArkButton`, `ark-kv-editor` → `ArkKvEditor`, `ark-command-palette` → `ArkCommandPalette` + `ArkCommandItem`.

- Props: the element's attributes in camelCase (`iconOnly`, `stepMinutes`, `localeJson`) plus its JS properties where they matter (`events`, `rows`, `options`, `sizes`).
- Events: the custom events with their native names (`@ark-close` on `ArkDialog`/`ArkDrawer`, `@ark-select` on `ArkMenu`/`ArkCommandPalette`, `@change` on `ArkSelect`/`ArkKvEditor` with `$event.detail`, `@ark-event-click` on `ArkScheduler`, …); native events bubble from the inner control (`@input` on `ArkInput`: read `$event.target.value`).
- State: attributes like `open` are the source of truth (`:open="bool"` + `@ark-close`).

Full attribute reference, theming guide and E2E hooks: [https://github.com/Tooark/web-components#readme](https://github.com/Tooark/web-components#readme) · live examples with interaction tests: [Storybook](https://tooark.com/web-components/).

---

## 📝 Usage examples

### A form with a confirmation dialog and a toast

```ts
<script setup lang="ts">
import { ArkButton, ArkDialog, ArkInput, ArkSelect, ArkToaster, toast } from "@tooark/vue";
import { ref } from "vue";

const roles = [
  { value: "dev", label: "Developer" },
  { value: "ops", label: "Operations" },
];
const name = ref("");
const role = ref("dev");
const confirming = ref(false);

function publish() {
  confirming.value = false;
  toast.success("Profile published", { description: `Welcome, ${name.value}.` });
}
</script>

<template>
  <form @submit.prevent="confirming = true">
    <ArkInput label="Name" :value="name" required @input="name = ($event.target as HTMLInputElement).value" />
    <ArkSelect label="Role" :options="roles" :value="role" @change="role = $event.detail.value" />
    <ArkButton type="submit" intent="primary">Save</ArkButton>

    <ArkDialog label="Publish changes?" :open="confirming" @ark-close="confirming = false">
      <p>Your profile will be visible to the whole team.</p>
      <div slot="footer">
        <ArkButton variant="ghost" @click="confirming = false">Cancel</ArkButton>
        <ArkButton intent="primary" @click="publish">Publish</ArkButton>
      </div>
    </ArkDialog>

    <ArkToaster position="bottom-right" />
  </form>
</template>
```

### A raw element from a side package

```ts
<script setup lang="ts">
import { registerTooarkCode } from "@tooark/code";
import { onMounted, ref } from "vue";

const editor = ref<HTMLElement & { value: string }>();
onMounted(() => {
  registerTooarkCode();
  editor.value!.value = JSON.stringify({ hello: "world" }, null, 2);
});
</script>

<template>
  <ark-code-editor ref="editor" language="json" @change="save($event.detail.value)" />
</template>
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                                          | Version    | Description                                                      |
| -------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)                     | ^1.0.0     | Types, i18n, toast/announce services, motion and overlay helpers |
| [`@tooark/web-components`](https://www.npmjs.com/package/@tooark/web-components) | ^1.0.0     | The `ark-*` Custom Elements and their stylesheet                 |
| [`vue`](https://www.npmjs.com/package/vue)                                       | >=3 (peer) | Vue 3                                                            |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/vue` is released in lockstep with every other `@tooark/*` package.

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
