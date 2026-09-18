import type { ArkMarkShape, ArkTheme } from "@tooark/core";
import { expect, within } from "storybook/test";

const SHAPES: ArkMarkShape[] = ["circle", "square", "triangle", "diamond", "star", "hexagon"];

const meta = {
  title: "Core/ArkMark",
  argTypes: {
    shape: { control: "select", options: SHAPES },
    color: { control: "color" },
    size: { control: "number" },
    label: { control: "text" },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    shape: "hexagon",
    color: "#2563eb",
    size: 24,
    label: "Producao",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  shape: ArkMarkShape;
  color: string;
  size: number | string;
  label: string;
  theme: ArkTheme;
  testid?: string;
};

function createMark(args: Partial<StoryArgs>): HTMLElement {
  const el = document.createElement("ark-mark");
  if (args.shape) el.setAttribute("shape", args.shape);
  if (args.color) el.setAttribute("color", args.color);
  if (args.size !== undefined) el.setAttribute("size", String(args.size));
  if (args.label) el.setAttribute("label", args.label);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createMark(args)
};

export const Shapes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-end gap-6 text-xs";
    wrap.style.color = "var(--ark-color-fg-muted)";
    for (const shape of SHAPES) {
      const item = document.createElement("div");
      item.className = "flex flex-col items-center gap-2";
      item.appendChild(createMark({ shape, size: 28, color: "var(--ark-color-primary)" }));
      item.append(shape);
      wrap.appendChild(item);
    }
    return wrap;
  }
};

// D-049: workspace e ambiente identificados por cor E forma; cor sozinha nao e distincao acessivel.
export const ScopeList = {
  render: () => {
    const wrap = document.createElement("ul");
    wrap.className = "flex flex-col gap-2 text-sm";
    const scopes: [string, ArkMarkShape, string][] = [
      ["Producao", "hexagon", "#dc2626"],
      ["Homologacao", "triangle", "#d97706"],
      ["Desenvolvimento", "circle", "#16a34a"],
      ["Workspace pessoal", "star", "#7c3aed"]
    ];
    for (const [name, shape, color] of scopes) {
      const item = document.createElement("li");
      item.className = "flex items-center gap-2";
      item.appendChild(createMark({ shape, color, size: 14 }));
      item.append(name);
      wrap.appendChild(item);
    }
    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-center gap-4";
    for (const size of [12, 16, 20, 24, 32, "3rem"])
      wrap.appendChild(createMark({ shape: "diamond", size, color: "#0ea5e9" }));
    return wrap;
  }
};

export const InheritsColor = {
  render: () => {
    const p = document.createElement("p");
    p.className = "flex items-center gap-2 text-sm";
    p.style.color = "var(--ark-color-danger)";
    p.appendChild(createMark({ shape: "triangle" }));
    p.append("Sem color, a marca herda a cor do texto.");
    return p;
  }
};

// Um path por forma no viewBox 24; size em px ou CSS; label da role=img, sem ele fica decorativa; cor
// propria ou herdada.
export const Semantics = {
  render: () => createMark({ shape: "star", label: "Favorito", size: 24, color: "rgb(220, 38, 38)" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const mark = canvasElement.querySelector("ark-mark") as HTMLElement & { shape: ArkMarkShape };
    const svg = mark.querySelector("svg") as SVGSVGElement;
    const path = svg.querySelector("path") as SVGPathElement;

    await expect(canvas.getByRole("img", { name: "Favorito" })).toBe(mark);
    await expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    await expect(path.getAttribute("d")).toMatch(/^M12 1\.5/);
    await expect(Math.round(svg.getBoundingClientRect().width)).toBe(24);
    await expect(getComputedStyle(path).fill).toBe("rgb(220, 38, 38)");

    mark.setAttribute("shape", "hexagon");
    await expect(mark.shape).toBe("hexagon");
    await expect(path.getAttribute("d")).toBe("M7 2h10l5 10-5 10H7L2 12Z");
    mark.setAttribute("shape", "lixo");
    await expect(mark.shape).toBe("circle");
    mark.setAttribute("size", "2rem");
    await expect(Math.round(svg.getBoundingClientRect().width)).toBe(32);

    mark.removeAttribute("label");
    await expect(mark).toHaveAttribute("aria-hidden", "true");
    await expect(mark).not.toHaveAttribute("role");
    mark.removeAttribute("color");
    canvasElement.style.color = "rgb(1, 2, 3)";
    await expect(getComputedStyle(path).fill).toBe("rgb(1, 2, 3)");
  }
};

export const TestHooks = {
  render: () => createMark({ shape: "circle", label: "Hooks", testid: "minha-marca" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="mark"]')).toHaveAttribute("data-testid", "minha-marca");
  }
};
