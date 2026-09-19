# @tooark/vue

[![npm](https://img.shields.io/npm/v/@tooark/vue?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/vue)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Wrappers Vue 3 dos Tooark Web Components: props tipadas, eventos com o nome nativo entregando o `CustomEvent`, props de objeto serializadas por você.

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

O pacote `@tooark/vue` fornece:

- um `defineComponent` por elemento (`ArkButton`, `ArkInput`, `ArkDialog`, …) com props tipadas e `inheritAttrs: false`, então atributos extras e listeners nativos vão direto ao elemento;
- eventos customizados reemitidos com o nome nativo (`@ark-change`, `@ark-close`, `@ark-select`, `@change` no `ArkSelect`, …) entregando o `CustomEvent`;
- props de objeto (`events`, `rows`, `options`, `localeJson`) serializadas ou atribuídas como propriedade por você;
- os elementos se registram no primeiro render, só no navegador (seguro para Nuxt);
- `toast` reexportado do `@tooark/core`.

---

## 🔧 Instalação

```bash
pnpm add @tooark/vue   # traz @tooark/web-components, @tooark/core e @tooark/tokens
```

Peer dependency: `vue` ≥ 3.

---

## ⚙️ Configuração

Importe a folha de estilo uma vez no `main.ts`. Se também usar tags `ark-*` cruas (pacotes laterais), avise o compilador de que são custom elements:

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

## 📦 Componentes

Um wrapper por elemento, com o nome dele: `ark-button` → `ArkButton`, `ark-kv-editor` → `ArkKvEditor`, `ark-command-palette` → `ArkCommandPalette` + `ArkCommandItem`.

- Props: os atributos do elemento em camelCase (`iconOnly`, `stepMinutes`, `localeJson`) mais as propriedades JS onde importam (`events`, `rows`, `options`, `sizes`).
- Eventos: os customizados com o nome nativo (`@ark-close` em `ArkDialog`/`ArkDrawer`, `@ark-select` em `ArkMenu`/`ArkCommandPalette`, `@change` em `ArkSelect`/`ArkKvEditor` com `$event.detail`, `@ark-event-click` em `ArkScheduler`, …); eventos nativos sobem do controle interno (`@input` em `ArkInput`: leia `$event.target.value`).
- Estado: atributos como `open` são a fonte da verdade (`:open="bool"` + `@ark-close`).

Referência completa de atributos, guia de tema e hooks de E2E: [https://github.com/Tooark/web-components/blob/main/README.pt-BR.md](https://github.com/Tooark/web-components/blob/main/README.pt-BR.md) · exemplos vivos com testes de interação: [Storybook](https://tooark.github.io/web-components/).

---

## 📝 Exemplos de Uso

### Um formulário com diálogo de confirmação e toast

```ts
<script setup lang="ts">
import { ArkButton, ArkDialog, ArkInput, ArkSelect, ArkToaster, toast } from "@tooark/vue";
import { ref } from "vue";

const papeis = [
  { value: "dev", label: "Desenvolvimento" },
  { value: "ops", label: "Operações" },
];
const nome = ref("");
const papel = ref("dev");
const confirmando = ref(false);

function publicar() {
  confirmando.value = false;
  toast.success("Perfil publicado", { description: `Bem-vindo, ${nome.value}.` });
}
</script>

<template>
  <form @submit.prevent="confirmando = true">
    <ArkInput label="Nome" :value="nome" required @input="nome = ($event.target as HTMLInputElement).value" />
    <ArkSelect label="Papel" :options="papeis" :value="papel" @change="papel = $event.detail.value" />
    <ArkButton type="submit" intent="primary">Salvar</ArkButton>

    <ArkDialog label="Publicar alterações?" :open="confirmando" @ark-close="confirmando = false">
      <p>Seu perfil ficará visível para todo o time.</p>
      <div slot="footer">
        <ArkButton variant="ghost" @click="confirmando = false">Cancelar</ArkButton>
        <ArkButton intent="primary" @click="publicar">Publicar</ArkButton>
      </div>
    </ArkDialog>

    <ArkToaster position="bottom-right" lang="pt" />
  </form>
</template>
```

### Um elemento cru de um pacote lateral

```ts
<script setup lang="ts">
import { registerTooarkCode } from "@tooark/code";
import { onMounted, ref } from "vue";

const editor = ref<HTMLElement & { value: string }>();
onMounted(() => {
  registerTooarkCode();
  editor.value!.value = JSON.stringify({ ola: "mundo" }, null, 2);
});
</script>

<template>
  <ark-code-editor ref="editor" language="json" @change="salvar($event.detail.value)" />
</template>
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                                           | Versão     | Descrição                                                            |
| -------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)                     | ^1.0.0     | Tipos, i18n, serviços de toast/announce, motion e helpers de overlay |
| [`@tooark/web-components`](https://www.npmjs.com/package/@tooark/web-components) | ^1.0.0     | Os Custom Elements `ark-*` e a folha de estilo deles                 |
| [`vue`](https://www.npmjs.com/package/vue)                                       | >=3 (peer) | Vue 3                                                                |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/vue` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
