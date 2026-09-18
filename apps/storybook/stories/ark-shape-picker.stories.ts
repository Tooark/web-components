import type { ArkMarkShape, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Core/ArkShapePicker",
  argTypes: {
    value: { control: "select", options: ["circle", "square", "triangle", "diamond", "star", "hexagon"] },
    color: { control: "color" },
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    value: "hexagon",
    color: "#2563eb",
    disabled: false,
    size: "md",
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  value: ArkMarkShape;
  color: string;
  disabled: boolean;
  size: ArkSize;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
};

type PickerEl = HTMLElement & { value: ArkMarkShape | ""; select: (value: ArkMarkShape) => void };

function createPicker(args: Partial<StoryArgs>): PickerEl {
  const el = document.createElement("ark-shape-picker") as PickerEl;
  el.setAttribute("label", "Forma do workspace");
  if (args.value) el.setAttribute("value", args.value);
  if (args.color) el.setAttribute("color", args.color);
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.size) el.setAttribute("size", args.size);
  if (args.lang) el.setAttribute("lang", args.lang);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createPicker(args)
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[])
      wrap.appendChild(createPicker({ size, value: "star", color: "#16a34a", lang: "pt" }));
    return wrap;
  }
};

// O par cor + forma do escopo: a paleta alimenta a cor das formas e a marca ao lado mostra o resultado.
export const WithSwatches = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3 text-sm";
    const swatches = document.createElement("ark-color-swatches");
    swatches.setAttribute("label", "Cor");
    swatches.setAttribute("size", "sm");
    swatches.setAttribute(
      "colors",
      JSON.stringify([
        { name: "Vermelho", value: "#dc2626" },
        { name: "Ambar", value: "#d97706" },
        { name: "Verde", value: "#16a34a" },
        { name: "Azul", value: "#2563eb" },
        { name: "Violeta", value: "#7c3aed" }
      ])
    );
    swatches.setAttribute("value", "#2563eb");
    const picker = createPicker({ value: "hexagon", color: "#2563eb", lang: "pt" });
    const preview = document.createElement("div");
    preview.className = "flex items-center gap-2";
    const mark = document.createElement("ark-mark");
    mark.setAttribute("shape", "hexagon");
    mark.setAttribute("color", "#2563eb");
    mark.setAttribute("size", "20");
    preview.append(mark, "Producao");
    swatches.addEventListener("change", (event) => {
      const value = (event as CustomEvent<{ value: string }>).detail.value;
      picker.setAttribute("color", value);
      mark.setAttribute("color", value);
    });
    picker.addEventListener("change", (event) =>
      mark.setAttribute("shape", (event as CustomEvent<{ value: string }>).detail.value)
    );
    wrap.append(swatches, picker, preview);
    return wrap;
  }
};

// Seis radios nomeados no idioma; clique e setas selecionam e emitem change; cada opcao e um ark-mark na cor.
export const Selection = {
  render: () => createPicker({ value: "circle", color: "rgb(37, 99, 235)", lang: "pt" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector("ark-shape-picker") as PickerEl;
    const values: string[] = [];
    host.addEventListener("change", (event) => values.push((event as CustomEvent<{ value: string }>).detail.value));

    await expect(canvas.getByRole("radiogroup", { name: "Forma do workspace" })).toBe(host);
    await expect(canvas.getAllByRole("radio").map((radio) => radio.getAttribute("aria-label"))).toEqual([
      "Círculo",
      "Quadrado",
      "Triângulo",
      "Losango",
      "Estrela",
      "Hexágono"
    ]);
    await expect(canvas.getByRole("radio", { name: "Círculo" })).toHaveAttribute("aria-checked", "true");
    const marks = Array.from(host.querySelectorAll("ark-mark"));
    await expect(marks.map((mark) => mark.getAttribute("shape"))).toEqual([
      "circle",
      "square",
      "triangle",
      "diamond",
      "star",
      "hexagon"
    ]);
    await expect(getComputedStyle(marks[0].querySelector("path") as SVGPathElement).fill).toBe("rgb(37, 99, 235)");

    await userEvent.click(canvas.getByRole("radio", { name: "Estrela" }));
    await expect(host.value).toBe("star");
    await expect(values).toEqual(["star"]);
    canvas.getByRole("radio", { name: "Estrela" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(host.value).toBe("hexagon");
    await userEvent.keyboard("{ArrowRight}");
    await expect(host.value).toBe("circle");
    await expect(values).toEqual(["star", "hexagon", "circle"]);

    host.setAttribute("lang", "en");
    await expect(canvas.getByRole("radio", { name: "Hexagon" })).toBeVisible();
    host.setAttribute("color", "rgb(220, 38, 38)");
    await expect(getComputedStyle(marks[0].querySelector("path") as SVGPathElement).fill).toBe("rgb(220, 38, 38)");
    host.setAttribute("disabled", "");
    await userEvent.click(canvas.getByRole("radio", { name: "Square" }));
    await expect(host.value).toBe("circle");
  }
};

export const TestHooks = {
  render: () => createPicker({ value: "diamond", lang: "pt", testid: "formas" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="shape-picker"]')).toHaveAttribute("data-testid", "formas");
    const options = canvasElement.querySelectorAll('[data-ark="shape-picker-option"]');
    await expect(options).toHaveLength(6);
    await expect(options[3]).toHaveAttribute("data-testid", "formas-option");
    await expect(options[3]).toHaveAttribute("data-value", "diamond");
  }
};
