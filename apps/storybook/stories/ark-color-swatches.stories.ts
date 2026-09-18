import type { ArkColorSwatch, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, within } from "storybook/test";

const PALETTE: ArkColorSwatch[] = [
  { name: "Vermelho", value: "#dc2626" },
  { name: "Laranja", value: "#ea580c" },
  { name: "Ambar", value: "#d97706" },
  { name: "Verde", value: "#16a34a" },
  { name: "Ciano", value: "#0891b2" },
  { name: "Azul", value: "#2563eb" },
  { name: "Violeta", value: "#7c3aed" },
  { name: "Rosa", value: "#db2777" }
];

const meta = {
  title: "Core/ArkColorSwatches",
  parameters: {
    docs: {
      description: {
        component:
          "Paleta de cores como radiogroup. As amostras vem de `colors` (`{ name, value }[]`): como atributo JSON no HTML ou como propriedade JS; qualquer cor CSS vale (hex, oklch, var(--token)). Edite `colors` nos controles do Playground para ver a paleta mudar."
      }
    }
  },
  argTypes: {
    colors: { control: "object", description: "Amostras { name, value }[] (atributo JSON ou propriedade)" },
    value: { control: "text", description: "value da amostra selecionada" },
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    colors: PALETTE,
    value: "#2563eb",
    disabled: false,
    size: "md",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  value: string;
  disabled: boolean;
  size: ArkSize;
  theme: ArkTheme;
  testid?: string;
  colors?: ArkColorSwatch[];
};

type SwatchesEl = HTMLElement & { value: string; colors: ArkColorSwatch[]; select: (value: string) => void };

function createSwatches(args: Partial<StoryArgs>): SwatchesEl {
  const el = document.createElement("ark-color-swatches") as SwatchesEl;
  el.setAttribute("colors", JSON.stringify(args.colors ?? PALETTE));
  el.setAttribute("label", "Cor do workspace");
  if (args.value) el.setAttribute("value", args.value);
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.size) el.setAttribute("size", args.size);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createSwatches(args)
};

// O atributo `colors` em JSON, como no HTML puro: cores de marca com nome e qualquer sintaxe CSS.
export const CustomColors = {
  render: () => {
    const el = document.createElement("ark-color-swatches") as SwatchesEl;
    el.setAttribute("label", "Cor da marca");
    el.setAttribute(
      "colors",
      JSON.stringify([
        { name: "Tooark", value: "#f59e0b" },
        { name: "Arkuest", value: "oklch(55% 0.2 264)" },
        { name: "Arkpulse", value: "rgb(22 163 74)" },
        { name: "Primary do tema", value: "var(--ark-color-primary)" }
      ])
    );
    el.setAttribute("value", "oklch(55% 0.2 264)");
    el.setAttribute("size", "lg");
    return el;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-4";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[])
      wrap.appendChild(createSwatches({ size, value: "#16a34a" }));
    return wrap;
  }
};

export const Disabled = {
  render: () => createSwatches({ value: "#7c3aed", disabled: true })
};

export const FromProperty = {
  render: () => {
    const el = createSwatches({});
    el.removeAttribute("colors");
    el.colors = [
      { name: "Grafite", value: "oklch(35% 0.02 260)" },
      { name: "Petroleo", value: "oklch(45% 0.1 220)" },
      { name: "Oliva", value: "oklch(55% 0.12 130)" }
    ];
    el.value = "oklch(45% 0.1 220)";
    return el;
  }
};

// radiogroup com radios nomeados pela cor; clique e setas selecionam e emitem change uma vez; um tab stop;
// atribuir value nao emite; disabled ignora.
export const Selection = {
  render: () => createSwatches({ value: "#2563eb" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector("ark-color-swatches") as SwatchesEl;
    const values: string[] = [];
    host.addEventListener("change", (event) => values.push((event as CustomEvent<{ value: string }>).detail.value));
    const radios = canvas.getAllByRole("radio");

    await expect(canvas.getByRole("radiogroup", { name: "Cor do workspace" })).toBe(host);
    await expect(radios).toHaveLength(8);
    await expect(canvas.getByRole("radio", { name: "Azul" })).toHaveAttribute("aria-checked", "true");
    await expect(
      radios.filter((radio) => radio.tabIndex === 0).map((radio) => radio.getAttribute("aria-label"))
    ).toEqual(["Azul"]);
    await expect(getComputedStyle(canvas.getByRole("radio", { name: "Verde" })).backgroundColor).toBe(
      "rgb(22, 163, 74)"
    );

    await userEvent.click(canvas.getByRole("radio", { name: "Verde" }));
    await expect(host.value).toBe("#16a34a");
    await expect(canvas.getByRole("radio", { name: "Verde" })).toHaveAttribute("aria-checked", "true");
    await expect(canvas.getByRole("radio", { name: "Azul" })).toHaveAttribute("aria-checked", "false");
    await userEvent.click(canvas.getByRole("radio", { name: "Verde" }));
    await expect(values).toEqual(["#16a34a"]);

    canvas.getByRole("radio", { name: "Verde" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(host.value).toBe("#0891b2");
    await expect(canvas.getByRole("radio", { name: "Ciano" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(host.value).toBe("#db2777");
    await userEvent.keyboard("{ArrowRight}");
    await expect(host.value).toBe("#dc2626");
    await userEvent.keyboard("{ArrowUp}");
    await expect(host.value).toBe("#db2777");
    await userEvent.keyboard("{Home}");
    await expect(host.value).toBe("#dc2626");
    await expect(values).toHaveLength(6);

    host.value = "#7c3aed";
    await expect(canvas.getByRole("radio", { name: "Violeta" })).toHaveAttribute("aria-checked", "true");
    await expect(values).toHaveLength(6);
    host.setAttribute("disabled", "");
    await userEvent.click(canvas.getByRole("radio", { name: "Rosa" }));
    await expect(host.value).toBe("#7c3aed");
    host.select("nao-existe");
    await expect(host.value).toBe("#7c3aed");
  }
};

export const TestHooks = {
  render: () => createSwatches({ value: "#2563eb", testid: "cores" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="color-swatches"]')).toHaveAttribute("data-testid", "cores");
    const swatches = canvasElement.querySelectorAll('[data-ark="color-swatches-swatch"]');
    await expect(swatches).toHaveLength(8);
    await expect(swatches[5]).toHaveAttribute("data-testid", "cores-swatch");
    await expect(swatches[5]).toHaveAttribute("data-value", "#2563eb");
  }
};
