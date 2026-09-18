import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkSpinner",
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    intent: {
      control: "select",
      options: ["", "primary", "secondary", "success", "warning", "danger", "info", "neutral"]
    },
    label: { control: "text" },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    size: "md",
    intent: "primary",
    label: "",
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  size: ArkSize;
  intent: ArkIntent | "";
  label: string;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
};

function createSpinner(args: Partial<StoryArgs>): HTMLElement {
  const el = document.createElement("ark-spinner");
  if (args.size) el.setAttribute("size", args.size);
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.label) el.setAttribute("label", args.label);
  if (args.lang) el.setAttribute("lang", args.lang);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

function row(...items: HTMLElement[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-wrap items-center gap-6";
  for (const item of items) wrap.appendChild(item);
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createSpinner(args)
};

export const Sizes = {
  render: () =>
    row(...(["xs", "sm", "md", "lg", "xl"] as ArkSize[]).map((size) => createSpinner({ size, intent: "primary" })))
};

export const Intents = {
  render: () =>
    row(
      ...(["primary", "secondary", "success", "warning", "danger", "info", "neutral"] as ArkIntent[]).map((intent) =>
        createSpinner({ intent, size: "lg" })
      )
    )
};

export const InheritsColor = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3 text-sm";
    for (const [color, text] of [
      ["var(--ark-color-fg-muted)", "Sem intent o spinner herda a cor do texto ao redor"],
      ["var(--ark-color-danger)", "Como aqui, em vermelho"],
      ["var(--ark-color-success)", "Ou em verde"]
    ]) {
      const line = document.createElement("div");
      line.className = "flex items-center gap-2";
      line.style.color = color;
      line.appendChild(createSpinner({ size: "sm" }));
      line.append(text);
      wrap.appendChild(line);
    }
    return wrap;
  }
};

export const InlineWithText = {
  render: () => {
    const wrap = document.createElement("p");
    wrap.className = "text-sm";
    wrap.style.color = "var(--ark-color-fg-soft)";
    wrap.append("Sincronizando o workspace ");
    wrap.appendChild(createSpinner({ size: "xs", intent: "primary", lang: "pt" }));
    return wrap;
  }
};

// role="status" com rotulo so para leitores de tela (padrao pelo idioma, ou `label`); o SVG gira pelo preset
// ark-spin do core, isento de movimento reduzido; o diametro segue size.
export const Semantics = {
  render: () => createSpinner({ lang: "pt" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const spinner = canvasElement.querySelector("ark-spinner") as HTMLElement;
    const svg = spinner.querySelector("svg") as SVGSVGElement;
    const icon = spinner.querySelector('[data-ark="spinner-icon"]') as HTMLElement;

    await expect(canvas.getByRole("status")).toBe(spinner);
    await expect(canvas.getByRole("status")).toHaveAccessibleName("Carregando");
    spinner.setAttribute("lang", "en");
    await expect(spinner).toHaveAccessibleName("Loading");
    spinner.setAttribute("label", "Enviando arquivo");
    await expect(spinner).toHaveAccessibleName("Enviando arquivo");

    await expect(svg.classList.contains("ark-animate-spin")).toBe(true);
    await waitFor(() =>
      expect(svg.getAnimations().some((animation) => (animation as CSSAnimation).animationName === "ark-spin")).toBe(
        true
      )
    );
    await expect(Math.round(icon.getBoundingClientRect().width)).toBe(20);
    spinner.setAttribute("size", "xl");
    await expect(Math.round(icon.getBoundingClientRect().width)).toBe(32);

    // Cor: herda o texto ao redor sem intent, token com intent.
    canvasElement.style.color = "rgb(1, 2, 3)";
    await expect(getComputedStyle(svg).color).toBe("rgb(1, 2, 3)");
    spinner.setAttribute("intent", "danger");
    await expect(getComputedStyle(svg).color).not.toBe("rgb(1, 2, 3)");
  }
};

export const TestHooks = {
  render: () => createSpinner({ testid: "meu-spinner" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="spinner"]')).toHaveAttribute("data-testid", "meu-spinner");
    await expect(canvasElement.querySelector('[data-ark="spinner-icon"]')).toHaveAttribute(
      "data-testid",
      "meu-spinner-icon"
    );
    await expect(canvasElement.querySelector('[data-ark="spinner-label"]')).toHaveAttribute(
      "data-testid",
      "meu-spinner-label"
    );
  }
};
