# @tooark/chart

[![npm](https://img.shields.io/npm/v/@tooark/chart?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/chart)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

`<ark-chart>`: an ECharts chart as a Custom Element, themed by the Tooark tokens, with auto-resize and a click event — plus the imperative engine for use without the element.

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

The `@tooark/chart` package provides:

- `ark-chart` with the native ECharts `option` as a JS property, `theme` (`auto` follows the page's `color-scheme`, including runtime toggles), `renderer` (`canvas`/`svg`), `height` and `auto-resize`;
- `ark-chart-click` (`bubbles`, `composed`) with the native ECharts params as `detail`;
- `createChart(container, options)` engine: `setOption`, `setTheme`, `resize`, `resolvedTheme`, `destroy` and the raw `chart` instance;
- ECharts is a peer dependency: you pick the version and tree-shaking stays yours.

---

## 🔧 Installation

```bash
pnpm add @tooark/chart echarts   # echarts is a peer dependency (>= 5)
```

---

## ⚙️ Configuration

Register the element once (browser only); the chart draws its own colors, so no stylesheet is required — the theme follows the page's `color-scheme` or the element's `theme` attribute:

```ts
import { registerTooarkChart } from "@tooark/chart";

registerTooarkChart();
```

---

## 📦 Components

### `ark-chart`

- Attributes: `theme` (`auto` | `light` | `dark`, default `auto`), `renderer` (`canvas` | `svg`), `height` (CSS length, default `320px`), `auto-resize` (`"false"` turns it off).
- Properties: `option` (the `EChartsOption`; assigning re-renders with `notMerge`), `resolvedTheme`.
- Events: `ark-chart-click` with the ECharts params in `detail`.

### Engine

- `createChart(container, { option, theme?, renderer? })` → `{ chart, setOption(option, { notMerge }), setTheme(theme), resize(), resolvedTheme(), destroy() }`.
- `resolveChartTheme(theme, element)`.
- Types: `ArkChartOptions`, `ArkChartTheme`, `ArkChartRenderer`, `ArkChartInstance`, `EChartsOption` (re-exported).

---

## 📝 Usage examples

### A bar chart that follows the page theme

```ts
const chart = document.createElement("ark-chart");
chart.setAttribute("height", "320px");
chart.option = {
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed"] },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: [120, 200, 150] }],
};
chart.addEventListener("ark-chart-click", (event) => {
  console.log((event as CustomEvent).detail.name, (event as CustomEvent).detail.value);
});
document.body.appendChild(chart);
```

### The engine without the element

```ts
import { createChart } from "@tooark/chart";

const instance = createChart(document.querySelector("#sales")!, { option, theme: "auto" });
instance.setOption(nextOption, { notMerge: true });
instance.chart.on("legendselectchanged", handler); // raw ECharts API
instance.destroy();
```

---

## 📋 Dependencies

Installed automatically unless marked as peer; peer dependencies are yours to install (the ranges are what the package declares).

| Package                                                          | Version    | Description                                                      |
| ---------------------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens) | ^1.0.0     | Design tokens (colors, sizes, radii, motion) and primitive types |
| [`tslib`](https://www.npmjs.com/package/tslib)                   | ^2.8.1     | TypeScript runtime helpers                                       |
| [`echarts`](https://www.npmjs.com/package/echarts)               | >=5 (peer) | Chart engine                                                     |

---

## 🪪 Contributing

Contributions are welcome! Open issues and pull requests in the [Tooark/web-components](https://github.com/Tooark/web-components/issues) repository; [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) covers the workflow, the commit convention and the checklist. `@tooark/chart` is released in lockstep with every other `@tooark/*` package.

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) file for details.
