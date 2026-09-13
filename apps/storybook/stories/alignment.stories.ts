import type { ArkSize } from "@tooark/core";
import { expect } from "storybook/test";

const meta = {
  title: "Core/Alignment",
  parameters: {
    docs: {
      description: {
        component:
          "Controles do mesmo `size` compartilham a altura do token `--ark-size-*` (min-height), entao alinham lado a lado sem ajuste manual: 24/28/36/44/52 px de xs a xl."
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
      button.textContent = `Botao ${size}`;

      const iconOnly = document.createElement("ark-button");
      iconOnly.setAttribute("size", size);
      iconOnly.setAttribute("icon-only", "");
      iconOnly.setAttribute("rounded", "full");
      iconOnly.setAttribute("aria-label", `Icone ${size}`);
      iconOnly.textContent = "+";

      const toggle = document.createElement("ark-toggle");
      toggle.setAttribute("size", size);
      toggle.textContent = `Toggle ${size}`;

      const input = document.createElement("ark-input");
      input.setAttribute("size", size);
      input.setAttribute("placeholder", `Input ${size}`);

      row.append(button, iconOnly, toggle, input);
      wrap.appendChild(row);
    });

    return wrap;
  },
  // O token governa a altura de todos os controles do mesmo size.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const heights: Record<ArkSize, number> = { xs: 24, sm: 28, md: 36, lg: 44, xl: 52 };

    for (const [size, height] of Object.entries(heights) as [ArkSize, number][]) {
      const row = canvasElement.querySelector<HTMLElement>(`[data-size="${size}"]`);
      if (!row) throw new Error(`linha ${size} nao encontrada`);

      const controls = [
        row.querySelector<HTMLElement>("ark-button:not([icon-only])"),
        row.querySelector<HTMLElement>("ark-button[icon-only]"),
        row.querySelector<HTMLElement>("ark-toggle"),
        row.querySelector<HTMLElement>("ark-input input")
      ];

      for (const control of controls) {
        expect(control).not.toBeNull();
        expect(Math.round((control as HTMLElement).getBoundingClientRect().height)).toBe(height);
      }
    }
  }
};
