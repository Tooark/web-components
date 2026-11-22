import type { ArkSize } from "@tooark/core";
import { expect } from "storybook/test";

const meta = {
  title: "Core/Alignment",
  // Verificação entre componentes, não um componente: roda na suíte, mas fica fora da barra lateral e das docs
  // (o comportamento está nos READMEs).
  tags: ["!dev", "!autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Controles do mesmo `size` (button, toggle, input, select) compartilham a altura do token `--ark-size-*` (min-height), então alinham lado a lado sem ajuste manual: 24/28/36/44/52 px de xs a xl."
      }
    }
  }
};

export default meta;

export const SameSizeControls = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "16px";

    (["xs", "sm", "md", "lg", "xl"] as ArkSize[]).forEach((size) => {
      const row = document.createElement("div");
      row.dataset.size = size;
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "12px";

      const button = document.createElement("ark-button");
      button.setAttribute("size", size);
      button.textContent = `Botão ${size}`;

      const iconOnly = document.createElement("ark-button");
      iconOnly.setAttribute("size", size);
      iconOnly.setAttribute("icon-only", "");
      iconOnly.setAttribute("rounded", "full");
      iconOnly.setAttribute("aria-label", `Ícone ${size}`);
      iconOnly.textContent = "+";

      const toggle = document.createElement("ark-toggle");
      toggle.setAttribute("size", size);
      toggle.textContent = `Toggle ${size}`;

      const input = document.createElement("ark-input");
      input.setAttribute("size", size);
      input.setAttribute("placeholder", `Input ${size}`);

      const select = document.createElement("ark-select");
      select.setAttribute("size", size);
      select.setAttribute("placeholder", `Select ${size}`);
      select.setAttribute("options", JSON.stringify([{ value: "a", label: "Opção A" }]));

      row.append(button, iconOnly, toggle, input, select);
      wrap.appendChild(row);
    });

    return wrap;
  },
  // O token governa a altura de todos os controles do mesmo size.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const heights: Record<ArkSize, number> = { xs: 24, sm: 28, md: 36, lg: 44, xl: 52 };

    for (const [size, height] of Object.entries(heights) as [ArkSize, number][]) {
      const row = canvasElement.querySelector<HTMLElement>(`[data-size="${size}"]`);
      if (!row) throw new Error(`linha ${size} não encontrada`);

      const controls = [
        row.querySelector<HTMLElement>("ark-button:not([icon-only])"),
        row.querySelector<HTMLElement>("ark-button[icon-only]"),
        row.querySelector<HTMLElement>("ark-toggle"),
        row.querySelector<HTMLElement>("ark-input input"),
        row.querySelector<HTMLElement>("ark-select select")
      ];

      for (const control of controls) {
        expect(control).not.toBeNull();
        expect(Math.round((control as HTMLElement).getBoundingClientRect().height)).toBe(height);
      }
    }
  }
};

// --- Linha alta ---

type FieldSpec = { id: string; tag: string; attrs: Record<string, string> };

const OPTIONS = JSON.stringify([{ value: "a", label: "Opção A" }]);

const LABELLED: FieldSpec[] = [
  { id: "input", tag: "ark-input", attrs: { label: "Nome", helper: "Como aparece no perfil" } },
  { id: "select", tag: "ark-select", attrs: { label: "Tipo", helper: "Escolha um", options: OPTIONS } },
  { id: "file-input", tag: "ark-file-input", attrs: { label: "Anexo", helper: "Até 5 MB" } },
  { id: "textarea", tag: "ark-textarea", attrs: { label: "Descrição", helper: "Opcional" } },
  { id: "autosize", tag: "ark-textarea", attrs: { label: "Notas", helper: "Cresce com o texto", autosize: "" } },
  { id: "checkbox", tag: "ark-checkbox", attrs: { label: "Aceito os termos", helper: "Obrigatório" } },
  { id: "radio", tag: "ark-radio", attrs: { label: "Mensal", helper: "Cobrança todo mês", name: "plano" } }
];

/** Campos sem rótulo nem mensagem: a correção não vale para eles. */
const BARE: FieldSpec[] = [
  { id: "bare-input", tag: "ark-input", attrs: { "aria-label": "Busca" } },
  { id: "bare-textarea", tag: "ark-textarea", attrs: { "aria-label": "Observação" } }
];

// Reproduz no host o CSS de antes da correção (estilo inline vence a camada components), para comparar.
const BEFORE_FIX = "align-content: normal; grid-template-rows: none;";

function makeField(spec: FieldSpec, style = ""): HTMLElement {
  const el = document.createElement(spec.tag);
  for (const [name, value] of Object.entries(spec.attrs)) el.setAttribute(name, value);
  el.setAttribute("style", `width: 220px; ${style}`);
  return el;
}

/** Linha flex com o campo e uma caixa de 240 px; `stretch` estica o host até a altura da caixa. */
function row(field: HTMLElement, align: "stretch" | "flex-start", id: string): HTMLElement {
  const line = document.createElement("div");
  line.dataset.row = id;
  line.style.display = "flex";
  line.style.alignItems = align;
  line.style.gap = "12px";
  const tall = document.createElement("div");
  tall.style.height = "240px";
  tall.style.width = "48px";
  tall.style.borderRadius = "8px";
  tall.style.background = "var(--ark-color-muted)";
  line.append(field, tall);
  return line;
}

/** Topo e altura de cada parte visível do campo, relativos ao topo do host. */
function parts(host: HTMLElement): number[][] {
  const top = host.getBoundingClientRect().top;
  return Array.from(host.children)
    .filter((child) => child instanceof HTMLElement && !child.hidden && child.getClientRects().length > 0)
    .map((child) => {
      const box = child.getBoundingClientRect();
      return [Math.round(box.top - top), Math.round(box.height)];
    });
}

function toolbar(id: string, inputStyle = ""): HTMLElement {
  const line = document.createElement("div");
  line.dataset.row = id;
  line.style.display = "flex";
  line.style.gap = "8px";
  const search = document.createElement("ark-input");
  search.setAttribute("aria-label", "Buscar");
  if (inputStyle) search.setAttribute("style", inputStyle);
  const go = document.createElement("ark-button");
  go.setAttribute("size", "lg");
  go.textContent = "Buscar";
  line.append(search, go);
  return line;
}

export const StretchedRow = {
  parameters: {
    docs: {
      description: {
        story:
          "Esticado numa linha mais alta (flex com `align-items: stretch`, o padrão, ou grid), um campo com rótulo ou mensagem visível mantém rótulo, campo e mensagem nas posições de um campo solto: a sobra fica embaixo. O `ark-textarea` com rótulo ou mensagem cresce entre os dois (com `autosize`, mede o conteúdo como os outros). Um campo sem rótulo nem mensagem fica exatamente como antes da correção: um input numa barra com um botão maior continua centrado."
      }
    }
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";
    for (const spec of LABELLED) {
      wrap.appendChild(row(makeField(spec), "stretch", `stretch-${spec.id}`));
      wrap.appendChild(row(makeField(spec), "flex-start", `loose-${spec.id}`));
    }
    for (const spec of BARE) {
      wrap.appendChild(row(makeField(spec), "stretch", `stretch-${spec.id}`));
      wrap.appendChild(row(makeField(spec, BEFORE_FIX), "stretch", `before-${spec.id}`));
    }
    const fixed = makeField(LABELLED[3], "height: 200px");
    fixed.dataset.row = "fixed-height";
    wrap.appendChild(fixed);
    wrap.append(toolbar("toolbar"), toolbar("toolbar-before", BEFORE_FIX));
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = (id: string) => canvasElement.querySelector(`[data-row="${id}"] > :first-child`) as HTMLElement;
    const box = (el: HTMLElement) => el.querySelector('[data-ark="textarea"]') as HTMLElement;
    const message = (el: HTMLElement) => el.querySelector('[data-ark="textarea-helper"]') as HTMLElement;
    const gapBelowBox = (el: HTMLElement) =>
      Math.round(message(el).getBoundingClientRect().top - box(el).getBoundingClientRect().bottom);

    for (const spec of LABELLED) {
      const stretched = host(`stretch-${spec.id}`);
      const loose = host(`loose-${spec.id}`);
      await expect(Math.round(stretched.getBoundingClientRect().height)).toBe(240);

      if (spec.id === "textarea") {
        // Rótulo e topo da caixa no lugar do solto; a caixa cresce e a mensagem fica colada no fim do host.
        await expect(parts(stretched)[0]).toEqual(parts(loose)[0]);
        await expect(parts(stretched)[1][0]).toBe(parts(loose)[1][0]);
        await expect(box(stretched).getBoundingClientRect().height).toBeGreaterThan(
          box(loose).getBoundingClientRect().height + 100
        );
        await expect(gapBelowBox(stretched)).toBe(gapBelowBox(loose));
        await expect(Math.round(message(stretched).getBoundingClientRect().bottom)).toBe(
          Math.round(stretched.getBoundingClientRect().bottom)
        );
      } else {
        await expect(parts(stretched)).toEqual(parts(loose));
      }
    }

    // Altura posta no host: o textarea com rótulo vira um controle dessa altura, sem vão sob o rótulo.
    const fixed = canvasElement.querySelector('[data-row="fixed-height"]') as HTMLElement;
    const loose = host("loose-textarea");
    await expect(Math.round(fixed.getBoundingClientRect().height)).toBe(200);
    await expect(parts(fixed)[1][0]).toBe(parts(loose)[1][0]);
    await expect(Math.round(message(fixed).getBoundingClientRect().bottom)).toBe(
      Math.round(fixed.getBoundingClientRect().bottom)
    );

    // Sem rótulo nem mensagem, idêntico ao CSS de antes (referência com o estilo antigo inline).
    for (const spec of BARE) {
      await expect(parts(host(`stretch-${spec.id}`))).toEqual(parts(host(`before-${spec.id}`)));
    }
    const center = (el: HTMLElement) => el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;
    const input = host("toolbar").querySelector("input") as HTMLElement;
    const inputBefore = host("toolbar-before").querySelector("input") as HTMLElement;
    const button = canvasElement.querySelector('[data-row="toolbar"] ark-button') as HTMLElement;
    await expect(Math.abs(center(input) - center(button))).toBeLessThan(1);
    await expect(Math.round(center(input) - host("toolbar").getBoundingClientRect().top)).toBe(
      Math.round(center(inputBefore) - host("toolbar-before").getBoundingClientRect().top)
    );
  }
};
