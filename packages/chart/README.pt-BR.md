# @tooark/chart

[![npm](https://img.shields.io/npm/v/@tooark/chart?logo=npm&color=CB3837)](https://www.npmjs.com/package/@tooark/chart)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Tooark/web-components/blob/main/LICENSE)

`<ark-chart>`: um gráfico ECharts como Custom Element que segue o tema claro/escuro da página, com auto-resize e evento de clique — mais o engine imperativo para uso sem o elemento.

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

O pacote `@tooark/chart` fornece:

- `ark-chart` com o `option` nativo do ECharts como propriedade JS, `theme` (`auto` segue o `color-scheme` da página, inclusive a troca em tempo de execução), `renderer` (`canvas`/`svg`), `height` e `auto-resize`;
- `ark-chart-click` (`bubbles`, `composed`) com os params nativos do ECharts em `detail`;
- engine `createChart(container, options)`: `setOption`, `setTheme`, `resize`, `resolvedTheme`, `destroy` e a instância `chart` crua;
- o ECharts é peer dependency: a versão é sua (o engine importa o pacote `echarts` inteiro, então não há tree-shaking).

---

## 🔧 Instalação

```bash
pnpm add @tooark/chart echarts   # o echarts é peer dependency (>= 5)
```

---

## ⚙️ Configuração

Registre o elemento uma vez (só no navegador); o gráfico pinta as próprias cores com o tema padrão (claro) ou o `dark` embutido do ECharts, não com os tokens `--ark-color-*`, então nenhuma folha de estilo é necessária — o tema segue o `color-scheme` da página ou o atributo `theme` do elemento:

```ts
import { registerTooarkChart } from "@tooark/chart";

registerTooarkChart();
```

---

## 📦 Componentes

### `ark-chart`

- Atributos: `theme` (`auto` | `light` | `dark`, padrão `auto`), `renderer` (`canvas` | `svg`), `height` (comprimento CSS, padrão `320px`), `auto-resize` (`"false"` desliga).
- Propriedades: `option` (o `EChartsOption`; atribuir re-renderiza com `notMerge`), `resolvedTheme`.
- Eventos: `ark-chart-click` com os params do ECharts em `detail`.

### Engine

- `createChart(container, { option, theme?, renderer?, autoResize? })` → `{ chart, setOption(option, { notMerge }), setTheme(theme), resize(), resolvedTheme(), destroy() }`; `autoResize` (padrão `true`) redimensiona o gráfico junto com o container.
- `resolveChartTheme(theme, element)`.
- Tipos: `ArkChartOptions`, `ArkChartTheme`, `ArkChartRenderer`, `ArkChartInstance`, `EChartsOption` (reexportado).

---

## 📝 Exemplos de Uso

### Um gráfico de barras que segue o tema da página

```ts
const chart = document.createElement("ark-chart");
chart.setAttribute("height", "320px");
chart.option = {
  xAxis: { type: "category", data: ["Seg", "Ter", "Qua"] },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: [120, 200, 150] }],
};
chart.addEventListener("ark-chart-click", (event) => {
  console.log((event as CustomEvent).detail.name, (event as CustomEvent).detail.value);
});
document.body.appendChild(chart);
```

### O engine sem o elemento

```ts
import { createChart } from "@tooark/chart";

const instancia = createChart(document.querySelector("#vendas")!, { option, theme: "auto" });
instancia.setOption(proximaOption, { notMerge: true });
instancia.chart.on("legendselectchanged", handler); // API crua do ECharts
instancia.destroy();
```

---

## 📋 Dependências

Instaladas automaticamente, salvo as marcadas como peer, que ficam por sua conta (os ranges são os que o pacote declara).

| Pacote                                                           | Versão     | Descrição                                                         |
| ---------------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| [`@tooark/tokens`](https://www.npmjs.com/package/@tooark/tokens) | ^1.1.0     | Design tokens (cores, tamanhos, motion)   e tipos primitivos |
| [`tslib`](https://www.npmjs.com/package/tslib)                   | ^2.8.1     | Helpers de runtime do TypeScript                                  |
| [`echarts`](https://www.npmjs.com/package/echarts)               | >=5 (peer) | Motor de gráficos                                                 |

---

## 🪪 Contribuição

Contribuições são bem-vindas! Abra issues e pull requests no repositório [Tooark/web-components](https://github.com/Tooark/web-components/issues); o [CONTRIBUTING.md](https://github.com/Tooark/web-components/blob/main/CONTRIBUTING.md) cobre o fluxo, a convenção de commits e o checklist. O `@tooark/chart` é publicado em conjunto com todos os outros pacotes `@tooark/*`, numa única versão.

---

## 📄 Licença

Este projeto está licenciado sob a licença Apache 2.0. Veja o arquivo [LICENSE](https://github.com/Tooark/web-components/blob/main/LICENSE) para mais detalhes.
