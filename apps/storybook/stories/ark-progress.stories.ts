import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Core/ArkProgress",
  parameters: { layout: "padded" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: "number" },
    indeterminate: { control: "boolean" },
    label: { control: "text" },
    showValue: { control: "boolean" },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    value: 42,
    max: 100,
    indeterminate: false,
    label: "Carregando o workspace",
    showValue: true,
    intent: "primary",
    size: "md",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  value: number;
  max: number;
  indeterminate: boolean;
  label: string;
  showValue: boolean;
  intent: ArkIntent;
  size: ArkSize;
  theme: ArkTheme;
  testid?: string;
};

type ProgressEl = HTMLElement & { value: number; max: number; indeterminate: boolean; showValue: boolean };

function createProgress(args: Partial<StoryArgs>): ProgressEl {
  const el = document.createElement("ark-progress") as ProgressEl;
  if (args.value !== undefined) el.setAttribute("value", String(args.value));
  if (args.max !== undefined) el.setAttribute("max", String(args.max));
  if (args.indeterminate) el.setAttribute("indeterminate", "");
  if (args.label) el.setAttribute("label", args.label);
  if (args.showValue) el.setAttribute("show-value", "");
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.size) el.setAttribute("size", args.size);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  el.style.width = "24rem";
  return el;
}

function column(...items: HTMLElement[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col gap-4";
  for (const item of items) wrap.appendChild(item);
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createProgress(args)
};

export const Sizes = {
  render: () =>
    column(
      ...(["xs", "sm", "md", "lg", "xl"] as ArkSize[]).map((size) =>
        createProgress({ size, value: 60, showValue: true, label: `Tamanho ${size}` })
      )
    )
};

export const Intents = {
  render: () =>
    column(
      ...(["primary", "secondary", "success", "warning", "danger", "info", "neutral"] as ArkIntent[]).map(
        (intent, index) => createProgress({ intent, value: 30 + index * 10, label: intent })
      )
    )
};

export const Indeterminate = {
  render: () =>
    column(
      createProgress({ indeterminate: true, label: "Conectando" }),
      createProgress({ indeterminate: true, size: "xs", intent: "info", label: "Sincronizando" })
    )
};

// Tela de inicializacao: o valor sobe em etapas e a largura acompanha com a transicao dos tokens.
export const Startup = {
  render: () => {
    const wrap = column(createProgress({ value: 0, showValue: true, label: "Inicializando" }));
    const el = wrap.querySelector("ark-progress") as ProgressEl;
    const steps = [15, 40, 65, 90, 100];
    let index = 0;
    const timer = setInterval(() => {
      el.value = steps[index] ?? 100;
      index += 1;
      if (index >= steps.length) clearInterval(timer);
    }, 600);
    return wrap;
  }
};

// aria-valuenow/min/max seguem value/max com clamp; a largura da barra acompanha o valor depois da
// transicao; indeterminate tira o valuenow, esconde o texto e anima o segmento em loop.
export const Semantics = {
  render: () => createProgress({ value: 25, showValue: true, label: "Upload" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("ark-progress") as ProgressEl;
    const track = el.querySelector('[data-ark="progress-track"]') as HTMLElement;
    const bar = el.querySelector('[data-ark="progress-bar"]') as HTMLElement;
    const value = el.querySelector('[data-ark="progress-value"]') as HTMLElement;
    const settled = () => waitFor(() => expect(bar.getAnimations()).toHaveLength(0));
    const ratio = () => bar.getBoundingClientRect().width / track.getBoundingClientRect().width;

    await expect(el).toHaveAttribute("role", "progressbar");
    await expect(el).toHaveAttribute("aria-label", "Upload");
    await expect(el).toHaveAttribute("aria-valuenow", "25");
    await expect(el).toHaveAttribute("aria-valuemin", "0");
    await expect(el).toHaveAttribute("aria-valuemax", "100");
    await expect(value.textContent).toBe("25%");
    await settled();
    await expect(Math.abs(ratio() - 0.25)).toBeLessThan(0.01);

    el.value = 70;
    await expect(el).toHaveAttribute("aria-valuenow", "70");
    await expect(value.textContent).toBe("70%");
    await settled();
    await expect(Math.abs(ratio() - 0.7)).toBeLessThan(0.01);

    // Clamp e max proprio.
    el.setAttribute("value", "150");
    await expect(el).toHaveAttribute("aria-valuenow", "100");
    el.setAttribute("value", "-5");
    await expect(el).toHaveAttribute("aria-valuenow", "0");
    el.max = 8;
    el.value = 2;
    await expect(el).toHaveAttribute("aria-valuemax", "8");
    await expect(value.textContent).toBe("25%");
    await expect(el.max).toBe(8);

    // Indeterminado.
    el.indeterminate = true;
    await expect(el).not.toHaveAttribute("aria-valuenow");
    await expect(value).not.toBeVisible();
    await waitFor(() =>
      expect(
        bar
          .getAnimations()
          .some((animation) => (animation as CSSAnimation).animationName === "ark-progress-indeterminate")
      ).toBe(true)
    );
    el.indeterminate = "false" as unknown as boolean;
    await expect(el).toHaveAttribute("aria-valuenow", "2");
    await expect(value).toBeVisible();
  }
};

export const TestHooks = {
  render: () => createProgress({ value: 50, showValue: true, label: "Hooks", testid: "meu-progresso" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="progress"]')).toHaveAttribute("data-testid", "meu-progresso");
    await expect(canvasElement.querySelector('[data-ark="progress-track"]')).toHaveAttribute(
      "data-testid",
      "meu-progresso-track"
    );
    await expect(canvasElement.querySelector('[data-ark="progress-bar"]')).toHaveAttribute(
      "data-testid",
      "meu-progresso-bar"
    );
    await expect(canvasElement.querySelector('[data-ark="progress-value"]')).toHaveAttribute(
      "data-testid",
      "meu-progresso-value"
    );
  }
};
