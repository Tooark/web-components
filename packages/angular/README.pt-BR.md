# @tooark/angular

[![npm](https://img.shields.io/npm/v/@tooark/angular?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/angular)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Wrappers Angular standalone dos Tooark Web Components: `@Input()` para os atributos, `@Output()` para os eventos customizados, Ivy parcial, seguro para SSR.

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

O pacote `@tooark/angular` fornece:

- um componente standalone por elemento (`ArkButtonComponent`, `ArkInputComponent`, `ArkDialogComponent`, …) com o seletor `<ark-*-wrapper>` e `CUSTOM_ELEMENTS_SCHEMA`;
- `@Input()` ligados aos atributos do elemento (`[attr.*]`), inputs de objeto serializados por você (`events`, `rows`, `options`, `localeJson`);
- `@Output()` reemitindo os eventos customizados (`arkChange`, `arkClose`, `arkSelect`, `changed`, `arkEventClick`, …) como o `CustomEvent` original;
- registro no construtor de cada wrapper, pulado sem `customElements` — seguro para SSR e Angular Universal;
- compilado com ng-packagr em Ivy parcial: funciona em builds AOT de produção.

---

## 🔧 Instalação

```bash
pnpm add @tooark/angular   # traz @tooark/web-components, @tooark/core e @tooark/tokens
```

Peer dependencies: `@angular/core` e `@angular/common` ≥ 21.2.19 (o piso de segurança do workspace).

---

## ⚙️ Configuração

Adicione a folha de estilo ao `angular.json` (ou importe-a do seu `styles.css` global) e importe os componentes wrapper onde usar; nada a registrar à mão:

```json
// angular.json → projects.<app>.architect.build.options
"styles": ["node_modules/@tooark/web-components/dist/styles.css", "src/styles.css"]
```

---

## 📦 Componentes

Um componente standalone por elemento: `ark-button` → `ArkButtonComponent` (`<ark-button-wrapper>`), `ark-kv-editor` → `ArkKvEditorComponent` (`<ark-kv-editor-wrapper>`), e assim por diante.

- Inputs: os atributos do elemento em camelCase (`iconOnly`, `stepMinutes`, `localeJson`) mais `ariaLabel`; inputs de objeto onde importam (`events`, `rows`, `options`).
- Outputs: os eventos customizados em camelCase (`(arkClose)` no dialog e no drawer, `(arkSelect)` no menu e na paleta, `(changed)` no select e no editor chave/valor, `(arkEventClick)`/`(arkSlotClick)`/`(arkViewChange)`/`(arkRangeChange)` na agenda, …) entregando o `CustomEvent`; eventos nativos sobem do controle interno (`(input)` no input: leia `$any($event.target).value`).
- Estado: atributos como `open` são a fonte da verdade (`[open]="bool"` + `(arkClose)`).
- Tags `ark-*` cruas (pacotes laterais): adicione `schemas: [CUSTOM_ELEMENTS_SCHEMA]` ao seu componente e chame a função `registerTooark*()` no navegador.

Referência completa de atributos, guia de tema e hooks de E2E: [https://github.com/Tooark/web-components/blob/main/README.pt-BR.md](https://github.com/Tooark/web-components/blob/main/README.pt-BR.md) · exemplos vivos com testes de interação: [Storybook](https://tooark.com/web-components/).

---

## 📝 Exemplos de Uso

### Um formulário com diálogo de confirmação e toast

```ts
import { Component } from "@angular/core";
import {
  ArkButtonComponent,
  ArkDialogComponent,
  ArkInputComponent,
  ArkSelectComponent,
  ArkToasterComponent,
} from "@tooark/angular";
import { toast } from "@tooark/core";

@Component({
  selector: "app-formulario-perfil",
  standalone: true,
  imports: [ArkInputComponent, ArkSelectComponent, ArkButtonComponent, ArkDialogComponent, ArkToasterComponent],
  template: `
    <form (submit)="$event.preventDefault(); confirmando = true">
      <ark-input-wrapper
        label="Nome"
        [value]="nome"
        [required]="true"
        (input)="nome = $any($event.target).value"
      ></ark-input-wrapper>
      <ark-select-wrapper
        label="Papel"
        [options]="papeis"
        [value]="papel"
        (changed)="papel = $event.detail.value"
      ></ark-select-wrapper>
      <ark-button-wrapper type="submit" intent="primary">Salvar</ark-button-wrapper>

      <ark-dialog-wrapper label="Publicar alterações?" [open]="confirmando" (arkClose)="confirmando = false">
        <p>Seu perfil ficará visível para todo o time.</p>
        <div slot="footer">
          <ark-button-wrapper variant="ghost" (click)="confirmando = false">Cancelar</ark-button-wrapper>
          <ark-button-wrapper intent="primary" (click)="publicar()">Publicar</ark-button-wrapper>
        </div>
      </ark-dialog-wrapper>

      <ark-toaster-wrapper position="bottom-right" lang="pt"></ark-toaster-wrapper>
    </form>
  `,
})
export class FormularioPerfilComponent {
  papeis = [
    { value: "dev", label: "Desenvolvimento" },
    { value: "ops", label: "Operações" },
  ];
  nome = "";
  papel = "dev";
  confirmando = false;

  publicar(): void {
    this.confirmando = false;
    toast.success("Perfil publicado", { description: `Bem-vindo, ${this.nome}.` });
  }
}
```

### Um elemento cru de um pacote lateral

```ts
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from "@angular/core";
import { registerTooarkChart } from "@tooark/chart";

@Component({
  selector: "app-vendas",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<ark-chart #chart height="320px"></ark-chart>`,
})
export class VendasComponent implements AfterViewInit {
  @ViewChild("chart") chart!: ElementRef<HTMLElement & { option: object }>;

  ngAfterViewInit(): void {
    registerTooarkChart(); // só no navegador: proteja com isPlatformBrowser em SSR
    this.chart.nativeElement.option = { series: [{ type: "bar", data: [120, 200, 150] }] };
  }
}
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                                           | Versão           | Descrição                                                            |
| -------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)                     | ^1.0.0           | Tipos, i18n, serviços de toast/announce, motion e helpers de overlay |
| [`@tooark/web-components`](https://www.npmjs.com/package/@tooark/web-components) | ^1.0.0           | Os Custom Elements `ark-*` e a folha de estilo deles                 |
| [`tslib`](https://www.npmjs.com/package/tslib)                                   | ^2.8.1           | Helpers de runtime do TypeScript                                     |
| [`@angular/common`](https://www.npmjs.com/package/@angular/common)               | >=21.2.19 (peer) | Angular common                                                       |
| [`@angular/core`](https://www.npmjs.com/package/@angular/core)                   | >=21.2.19 (peer) | Núcleo do Angular (piso de segurança do workspace)                   |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/angular` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
