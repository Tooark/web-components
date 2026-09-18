import type { ArkSize, ArkTheme } from "@tooark/core";
import { expect } from "storybook/test";

const meta = {
  title: "Core/ArkKbd",
  argTypes: {
    text: { control: "text" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    text: "Ctrl",
    size: "md",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  text: string;
  size: ArkSize;
  theme: ArkTheme;
  testid?: string;
};

function createKbd(args: Partial<StoryArgs>): HTMLElement {
  const el = document.createElement("ark-kbd");
  if (args.size) el.setAttribute("size", args.size);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  el.textContent = args.text ?? "Ctrl";
  return el;
}

function shortcut(keys: string[], size?: ArkSize): HTMLElement {
  const wrap = document.createElement("span");
  wrap.className = "inline-flex items-center gap-1";
  keys.forEach((key, index) => {
    if (index) wrap.append("+");
    wrap.appendChild(createKbd({ text: key, size }));
  });
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createKbd(args)
};

export const Shortcuts = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3 text-sm";
    wrap.style.color = "var(--ark-color-fg-soft)";
    for (const [label, keys] of [
      ["Busca global", ["/"]],
      ["Trocar de workspace", ["Ctrl", "K"]],
      ["Enviar requisicao", ["Ctrl", "Enter"]],
      ["Salvar", ["⌘", "S"]]
    ] as [string, string[]][]) {
      const line = document.createElement("div");
      line.className = "flex items-center justify-between gap-6";
      line.style.maxWidth = "20rem";
      line.append(label);
      line.appendChild(shortcut(keys));
      wrap.appendChild(line);
    }
    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-4";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) wrap.appendChild(shortcut(["Ctrl", "K"], size));
    return wrap;
  }
};

// Nao interativo e sem role: o texto da tecla e o filho do usuario; a altura minima segue size.
export const Semantics = {
  render: () => createKbd({ text: "Esc" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const kbd = canvasElement.querySelector("ark-kbd") as HTMLElement;
    await expect(kbd).not.toHaveAttribute("role");
    await expect(kbd.textContent).toBe("Esc");
    await expect(Math.round(kbd.getBoundingClientRect().height)).toBe(24);
    kbd.setAttribute("size", "xl");
    await expect(Math.round(kbd.getBoundingClientRect().height)).toBe(32);
    await expect(getComputedStyle(kbd).fontFamily).toMatch(/mono/i);
  }
};

export const TestHooks = {
  render: () => createKbd({ text: "K", testid: "minha-tecla" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="kbd"]')).toHaveAttribute("data-testid", "minha-tecla");
  }
};
