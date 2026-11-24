# @tooark/vue

[![npm](https://img.shields.io/npm/v/@tooark/vue?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/vue)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Wrappers Vue 3 dos Tooark Web Components: props tipadas, eventos com o nome nativo entregando o `CustomEvent` (ou o `detail` dele), props de objeto serializadas para você.

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

O pacote `@tooark/vue` fornece:

- um `defineComponent` por elemento (`ArkButton`, `ArkInput`, `ArkDialog`, …) com props tipadas e `inheritAttrs: false`, então atributos extras e listeners nativos vão direto ao elemento;
- eventos customizados reemitidos com o nome nativo (`@ark-close`, `@ark-select`, `@change` no `ArkSelect`, …) entregando o `CustomEvent` ou, no calendário, datepicker, relógio, carrossel e agenda, o `detail` dele;
- props de objeto (`events`, `rows`, `options` e o `localeJson` de `ArkCalendar`/`ArkDatepicker`) serializadas ou atribuídas como propriedade para você (nos demais wrappers o `localeJson` é uma string JSON);
- os elementos se registram no primeiro render, só no navegador (seguro para Nuxt);
- `toast` e `setArkLocale`, `getArkLocale`, `observeArkLocale` (o idioma padrão do app) reexportados do `@tooark/core`.

---

## 🔧 Instalação

```bash
pnpm add @tooark/vue @tooark/web-components
```

O `@tooark/vue` já depende de `@tooark/web-components`, `@tooark/core` e `@tooark/tokens`, mas o pnpm não expõe dependências transitivas ao seu app, e o import da folha de estilo abaixo vem do `@tooark/web-components`: instale-o diretamente. O `toast` é reexportado pelo `@tooark/vue`.

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
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("ark-") } } })]
};
```

---

## 📦 Componentes

Um wrapper por elemento, com o nome dele: `ark-button` → `ArkButton`, `ark-kv-editor` → `ArkKvEditor`, `ark-command-palette` → `ArkCommandPalette` + `ArkCommandItem`.

- Props: os atributos do elemento em camelCase (`iconOnly`, `stepMinutes`, `localeJson`), `testid` para os hooks de E2E, mais as propriedades JS onde importam (`events`, `rows`, `options`, `sizes`, `valueField` no `ArkKvEditor`, e `columns`, `selected` e `cardRender` no `ArkDataView`). No `ArkDataView` o conteúdo de uma célula é o slot com escopo `#cell-<key>="{ row, column, value, index, view }"` e `#card="{ row, index }"` desenha o corpo de um card, teleportados para as células e reativos como qualquer slot; um `render` de coluna que devolve VNodes também funciona.
- Eventos: os customizados com o nome nativo (`@ark-close` em `ArkDialog`/`ArkDrawer`, `@ark-select` em `ArkMenu`/`ArkCommandPalette`, `@change` em `ArkSelect`/`ArkKvEditor` com `$event.detail`, …); `@ark-change` em `ArkCalendar`/`ArkDatepicker`/`ArkClock`, `@ark-slide-change` em `ArkCarousel` e `@ark-event-click`/`@ark-slot-click`/`@ark-view-change`/`@ark-range-change` em `ArkScheduler` entregam o próprio `detail`; eventos nativos sobem do controle interno (`@input` em `ArkInput`: leia `$event.target.value`).
- Estado: atributos como `open` são a fonte da verdade (`:open="bool"` + `@ark-close`). `@ark-open`/`@ark-close` em `ArkDialog`, `ArkDrawer`, `ArkCommandPalette` e `ArkMenu` só são emitidos para o evento do próprio elemento, e `@ark-close` em `ArkTabs` só para as abas dele: os eventos do DOM borbulham, e os de um overlay de dentro (um `ArkMenu` num diálogo) não são reemitidos pelo componente de fora. O mesmo vale para `@ark-resize` em `ArkSplitPane`, `@ark-slide-change` em `ArkCarousel`, `@ark-collapse` em `ArkNav`, `@ark-toggle` em `ArkNavGroup` e os eventos de `ArkTree` e `ArkDataView`: um deles dentro de outro (um split pane num painel de outro) não é reemitido pelo de fora. `@input`/`@change` em `ArkInput` são listeners nativos no host, e um controle seu em `slot="prefix"`/`slot="suffix"` manda os dele por ali: confira `$event.target` quando puser um.

### Pacotes laterais (subpaths)

`@tooark/vue/chart` (`ArkChart`), `@tooark/vue/code` (`ArkCodeEditor`) e `@tooark/vue/wysiwyg` (`ArkWysiwygEditor`, `ArkWysiwygViewer`) envolvem os pacotes laterais sem trazê-los para a entrada principal: instale `@tooark/chart`, `@tooark/code` ou `@tooark/wysiwyg` (peers opcionais) com os peers deles. `option`, `value`, as listas e funções do editor de código (mantenha `extensions` estável, `markRaw`) e o `content`/`uploadFile` do wysiwyg entram como propriedades, sem o proxy do Vue e só quando a referência muda; um editor controlado mantém o cursor. Eventos: `@ark-chart-click`; `@change`, `@ark-submit`, `@ark-format-error` no editor de código (`$event.detail.value`); `@ark-wysiwyg-change` (o JSON do Tiptap em `$event.detail`) e `@ark-wysiwyg-upload-error` no editor wysiwyg.

Referência completa de atributos, guia de tema e hooks de E2E: [https://github.com/Tooark/web-components/blob/main/README.pt-BR.md](https://github.com/Tooark/web-components/blob/main/README.pt-BR.md) · exemplos vivos com testes de interação: [Storybook](https://tooark.com/web-components/).

---

## 📝 Exemplos de Uso

### Um formulário com diálogo de confirmação e toast

```vue
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

```vue
<script setup lang="ts">
import { registerTooarkCode } from "@tooark/code";
import { onMounted, ref } from "vue";

const editor = ref<HTMLElement & { value: string }>();
onMounted(() => {
  registerTooarkCode();
  editor.value!.value = JSON.stringify({ ola: "mundo" }, null, 2);
});

function salvar(valor: string) {
  localStorage.setItem("config", valor);
}
</script>

<template>
  <ark-code-editor ref="editor" language="json" @change="salvar($event.detail.value)" />
</template>
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                                           | Versão                  | Descrição                                                            |
| -------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)                     | ^1.9.2                  | Tipos, i18n, serviços de toast/announce, motion e helpers de overlay |
| [`@tooark/web-components`](https://www.npmjs.com/package/@tooark/web-components) | ^1.9.2                  | Os Custom Elements `ark-*` e a folha de estilo deles                 |
| [`vue`](https://www.npmjs.com/package/vue)                                       | >=3 (peer)              | Vue 3                                                                |
| [`@tooark/chart`](https://www.npmjs.com/package/@tooark/chart)                   | >=1.0.0 (peer opcional) | ark-chart, para a subpath `/chart`                                   |
| [`@tooark/code`](https://www.npmjs.com/package/@tooark/code)                     | >=1.6.0 (peer opcional) | ark-code-editor, para a subpath `/code`                              |
| [`@tooark/wysiwyg`](https://www.npmjs.com/package/@tooark/wysiwyg)               | >=1.0.0 (peer opcional) | ark-wysiwyg-*, para a subpath `/wysiwyg`                             |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/vue` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

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
