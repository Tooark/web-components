import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, within } from "storybook/test";

const meta = {
  title: "Core/ArkStatusDot",
  argTypes: {
    intent: { control: "select", options: ["neutral", "success", "warning", "danger", "info", "primary", "secondary"] },
    label: { control: "text" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    intent: "success",
    label: "Conectado",
    size: "md",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  intent: ArkIntent;
  label: string;
  size: ArkSize;
  theme: ArkTheme;
  testid?: string;
};

function createDot(args: Partial<StoryArgs>): HTMLElement {
  const el = document.createElement("ark-status-dot");
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.label) el.setAttribute("label", args.label);
  if (args.size) el.setAttribute("size", args.size);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createDot(args)
};

// O caso do app: ponto decorativo (sem label) ao lado do texto que diz o estado.
export const WithText = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-2 text-sm";
    for (const [intent, text] of [
      ["neutral", "Verificando conexao"],
      ["success", "Conectado"],
      ["warning", "Instavel"],
      ["danger", "Sem conexao"]
    ] as [ArkIntent, string][]) {
      const line = document.createElement("div");
      line.className = "flex items-center gap-2";
      line.appendChild(createDot({ intent }));
      line.append(text);
      wrap.appendChild(line);
    }
    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-center gap-4";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[])
      wrap.appendChild(createDot({ size, intent: "success", label: size }));
    return wrap;
  }
};

export const Intents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-center gap-4";
    for (const intent of ["neutral", "success", "warning", "danger", "info", "primary", "secondary"] as ArkIntent[]) {
      wrap.appendChild(createDot({ intent, size: "lg", label: intent }));
    }
    return wrap;
  }
};

// Com label vira role="img" nomeado; sem label e decorativo. Estatico: nenhuma animacao.
export const Semantics = {
  render: () => createDot({ intent: "success", label: "Conectado" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dot = canvasElement.querySelector("ark-status-dot") as HTMLElement;

    await expect(canvas.getByRole("img", { name: "Conectado" })).toBe(dot);
    await expect(dot.getAnimations()).toHaveLength(0);
    await expect(Math.round(dot.getBoundingClientRect().width)).toBe(10);
    // rounded-full do Tailwind v4 e calc(infinity * 1px): basta ser maior que o raio do ponto.
    await expect(Number.parseFloat(getComputedStyle(dot).borderRadius)).toBeGreaterThanOrEqual(5);

    dot.removeAttribute("label");
    await expect(dot).toHaveAttribute("aria-hidden", "true");
    await expect(dot).not.toHaveAttribute("role");
    dot.setAttribute("size", "xl");
    await expect(Math.round(dot.getBoundingClientRect().width)).toBe(16);
  }
};

export const TestHooks = {
  render: () => createDot({ intent: "danger", label: "Erro", testid: "meu-ponto" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="status-dot"]')).toHaveAttribute("data-testid", "meu-ponto");
  }
};
