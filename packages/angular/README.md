# @tooark/angular

[![npm](https://img.shields.io/npm/v/@tooark/angular?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/angular)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

Standalone Angular wrappers for the Tooark Web Components: `@Input()`s for the attributes, `@Output()`s for the custom events, partial Ivy, SSR-safe.

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

The `@tooark/angular` package provides:

- one standalone component per element (`ArkButtonComponent`, `ArkInputComponent`, `ArkDialogComponent`, …) with the `<ark-*-wrapper>` selector and `CUSTOM_ELEMENTS_SCHEMA`;
- `@Input()`s bound to the element's attributes (`[attr.*]`), object inputs serialized for you (`events`, `rows`, `options`, `localeJson`);
- `@Output()`s re-emitting the custom events (`arkChange`, `arkClose`, `arkSelect`, `changed`, `arkEventClick`, …) as the original `CustomEvent`;
- registration in each wrapper constructor, skipped without `customElements` — SSR and Angular Universal safe;
- built with ng-packagr in partial Ivy: works in AOT production builds.

---

## 🔧 Installation

```bash
pnpm add @tooark/angular   # brings @tooark/web-components, @tooark/core and @tooark/tokens
```

Peer dependencies: `@angular/core` and `@angular/common` ≥ 21.2.19 (the workspace's security floor).

---

## ⚙️ Configuration

Add the stylesheet to `angular.json` (or import it from your global `styles.css`) and import the wrapper components where you use them; nothing to register by hand:

```json
// angular.json → projects.<app>.architect.build.options
"styles": ["node_modules/@tooark/web-components/dist/styles.css", "src/styles.css"]
```

---

## 📦 Components

One standalone component per element: `ark-button` → `ArkButtonComponent` (`<ark-button-wrapper>`), `ark-kv-editor` → `ArkKvEditorComponent` (`<ark-kv-editor-wrapper>`), and so on.

- Inputs: the element's attributes in camelCase (`iconOnly`, `stepMinutes`, `localeJson`) plus `ariaLabel`; object inputs where they matter (`events`, `rows`, `options`).
- Outputs: the custom events in camelCase (`(arkClose)` on the dialog and drawer, `(arkSelect)` on the menu and palette, `(changed)` on the select and the key/value editor, `(arkEventClick)`/`(arkSlotClick)`/`(arkViewChange)`/`(arkRangeChange)` on the scheduler, …) delivering the `CustomEvent`; native events bubble from the inner control (`(input)` on the input: read `$any($event.target).value`).
- State: attributes like `open` are the source of truth (`[open]="bool"` + `(arkClose)`).
- Raw `ark-*` tags (side packages): add `schemas: [CUSTOM_ELEMENTS_SCHEMA]` to your component and call the `registerTooark*()` function in the browser.

Full attribute reference, theming guide and E2E hooks: [https://github.com/Tooark/web-components#readme](https://github.com/Tooark/web-components#readme) · live examples with interaction tests: [Storybook](https://tooark.github.io/web-components/).

---

## 📝 Usage examples

### A form with a confirmation dialog and a toast

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
  selector: "app-profile-form",
  standalone: true,
  imports: [ArkInputComponent, ArkSelectComponent, ArkButtonComponent, ArkDialogComponent, ArkToasterComponent],
  template: `
    <form (submit)="$event.preventDefault(); confirming = true">
      <ark-input-wrapper
        label="Name"
        [value]="name"
        [required]="true"
        (input)="name = $any($event.target).value"
      ></ark-input-wrapper>
      <ark-select-wrapper
        label="Role"
        [options]="roles"
        [value]="role"
        (changed)="role = $event.detail.value"
      ></ark-select-wrapper>
      <ark-button-wrapper type="submit" intent="primary">Save</ark-button-wrapper>

      <ark-dialog-wrapper label="Publish changes?" [open]="confirming" (arkClose)="confirming = false">
        <p>Your profile will be visible to the whole team.</p>
        <div slot="footer">
          <ark-button-wrapper variant="ghost" (click)="confirming = false">Cancel</ark-button-wrapper>
          <ark-button-wrapper intent="primary" (click)="publish()">Publish</ark-button-wrapper>
        </div>
      </ark-dialog-wrapper>

      <ark-toaster-wrapper position="bottom-right"></ark-toaster-wrapper>
    </form>
  `,
})
export class ProfileFormComponent {
  roles = [
    { value: "dev", label: "Developer" },
    { value: "ops", label: "Operations" },
  ];
  name = "";
  role = "dev";
  confirming = false;

  publish(): void {
    this.confirming = false;
    toast.success("Profile published", { description: `Welcome, ${this.name}.` });
  }
}
```

### A raw element from a side package

```ts
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from "@angular/core";
import { registerTooarkChart } from "@tooark/chart";

@Component({
  selector: "app-sales",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<ark-chart #chart height="320px"></ark-chart>`,
})
export class SalesComponent implements AfterViewInit {
  @ViewChild("chart") chart!: ElementRef<HTMLElement & { option: object }>;

  ngAfterViewInit(): void {
    registerTooarkChart(); // browser only: guard with isPlatformBrowser under SSR
    this.chart.nativeElement.option = { series: [{ type: "bar", data: [120, 200, 150] }] };
  }
}
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                                          | Version          | Description                                                      |
| -------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| [`@tooark/core`](https://www.npmjs.com/package/@tooark/core)                     | ^1.0.0           | Types, i18n, toast/announce services, motion and overlay helpers |
| [`@tooark/web-components`](https://www.npmjs.com/package/@tooark/web-components) | ^1.0.0           | The `ark-*` Custom Elements and their stylesheet                 |
| [`tslib`](https://www.npmjs.com/package/tslib)                                   | ^2.8.1           | TypeScript runtime helpers                                       |
| [`@angular/common`](https://www.npmjs.com/package/@angular/common)               | >=21.2.19 (peer) | Angular common                                                   |
| [`@angular/core`](https://www.npmjs.com/package/@angular/core)                   | >=21.2.19 (peer) | Angular core (security floor of the workspace)                   |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/angular` is released in lockstep with every other `@tooark/*` package.

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
