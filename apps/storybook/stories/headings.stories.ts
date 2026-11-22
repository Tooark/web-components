import { expect } from "storybook/test";

const meta = {
  title: "Core/Headings",
  parameters: {
    docs: {
      description: {
        component:
          "Nível do título próprio de `ark-card` (`heading`, padrão h2), `ark-dialog` e `ark-drawer` (`label`, padrão h2) e `ark-empty` (`heading`, padrão h3): `heading-level` de 1 a 6 troca o elemento para a hierarquia da página. Fora de 1 a 6, ou sem o atributo, fica o padrão. A troca preserva id, classes e hooks de teste, então o `aria-labelledby` do diálogo e da gaveta continua apontando para o título."
      }
    }
  }
};

export default meta;

type Spec = { tag: string; text: string; attr: "heading" | "label"; part: string; fallback: string };

const SPECS: Spec[] = [
  { tag: "ark-card", text: "Ambiente", attr: "heading", part: "card-heading", fallback: "H2" },
  { tag: "ark-empty", text: "Nada por aqui", attr: "heading", part: "empty-heading", fallback: "H3" },
  { tag: "ark-dialog", text: "Confirmar", attr: "label", part: "dialog-title", fallback: "H2" },
  { tag: "ark-drawer", text: "Filtros", attr: "label", part: "drawer-title", fallback: "H2" }
];

export const HeadingLevel = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";
    for (const spec of SPECS) {
      for (const level of [null, "4"]) {
        const el = document.createElement(spec.tag);
        el.setAttribute(spec.attr, spec.text);
        el.setAttribute("testid", `${spec.tag}-${level ?? "padrao"}`);
        if (level) el.setAttribute("heading-level", level);
        if (spec.tag === "ark-drawer") el.setAttribute("mode", "inline");
        el.dataset.case = `${spec.tag}-${level ?? "default"}`;
        wrap.appendChild(el);
      }
    }
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    for (const spec of SPECS) {
      const byDefault = canvasElement.querySelector(`[data-case="${spec.tag}-default"]`) as HTMLElement;
      const leveled = canvasElement.querySelector(`[data-case="${spec.tag}-4"]`) as HTMLElement;
      const heading = (el: HTMLElement) => el.querySelector(`[data-ark="${spec.part}"]`) as HTMLElement;

      // Sem o atributo, o nível de sempre; com ele, o pedido.
      await expect(heading(byDefault).tagName).toBe(spec.fallback);
      await expect(heading(leveled).tagName).toBe("H4");
      await expect(heading(leveled).textContent).toBe(spec.text);
      await expect(heading(leveled)).toHaveAttribute("data-testid", `${spec.tag}-4-${spec.part.split("-").pop()}`);

      // Trocar em tempo de execução recria o título no mesmo lugar, com id e hooks.
      const before = heading(leveled);
      const id = before.id;
      const parent = before.parentElement;
      leveled.setAttribute("heading-level", "1");
      const after = heading(leveled);
      await expect(after.tagName).toBe("H1");
      await expect(after.parentElement).toBe(parent);
      await expect(after.id).toBe(id);
      await expect(after.className).toBe(before.className);
      await expect(leveled.querySelectorAll(`[data-ark="${spec.part}"]`).length).toBe(1);
      if (id) await expect(leveled).toHaveAttribute("aria-labelledby", id);

      // Valor fora de 1 a 6, ou o atributo removido, volta ao padrão.
      leveled.setAttribute("heading-level", "9");
      await expect(heading(leveled).tagName).toBe(spec.fallback);
      leveled.setAttribute("heading-level", "3");
      leveled.removeAttribute("heading-level");
      await expect(heading(leveled).tagName).toBe(spec.fallback);
    }
  }
};
