import type { ArkRounded, ArkTheme } from "@tooark/core";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Core/ArkSkeleton",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Placeholder de carregamento: o host `ark-skeleton` e o bloco (`.ark-skeleton` do core, `aria-hidden`); largura e altura vem de class ou style. `rows` acima de 1 troca o bloco por barras em coluna, a ultima mais curta. `animated` liga o brilho que varre (fase sorteada por elemento e escalonada entre as barras), opt-in e parado sob prefers-reduced-motion. O conteudo que substitui o skeleton entra com `.ark-animate-fade-in`; nao existe elemento de reveal."
      }
    }
  },
  argTypes: {
    rows: { control: { type: "number", min: 1, max: 8 } },
    animated: { control: "boolean" },
    rounded: { control: "select", options: ["", "none", "xs", "sm", "md", "lg", "xl", "full"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    color: { control: "color", description: "Cor base propria no lugar de muted" },
    ratio: { control: "text", description: "Proporcao do bloco (16/9, 9/16, 1/1); a altura vem da largura" },
    width: { control: "text", description: "style.width do host" },
    height: { control: "text", description: "style.height do host (so no bloco unico)" }
  },
  args: {
    rows: 1,
    animated: false,
    rounded: "",
    theme: "auto",
    color: "",
    ratio: "",
    width: "16rem",
    height: "1rem"
  }
};

export default meta;

type StoryArgs = {
  rows: number;
  animated: boolean;
  rounded: ArkRounded | "";
  theme: ArkTheme;
  color: string;
  ratio: string;
  width: string;
  height: string;
  testid?: string;
};

type SkeletonEl = HTMLElement & { rows: number; animated: boolean };

function createSkeleton(args: Partial<StoryArgs>): SkeletonEl {
  const skeleton = document.createElement("ark-skeleton") as SkeletonEl;
  if (args.rows && args.rows > 1) skeleton.setAttribute("rows", String(args.rows));
  if (args.animated) skeleton.setAttribute("animated", "");
  if (args.rounded) skeleton.setAttribute("rounded", args.rounded);
  if (args.theme) skeleton.setAttribute("theme", args.theme);
  if (args.color) skeleton.setAttribute("color", args.color);
  if (args.ratio) skeleton.setAttribute("ratio", args.ratio);
  if (args.testid) skeleton.setAttribute("testid", args.testid);
  if (args.width) skeleton.style.width = args.width;
  if (args.height && !(args.rows && args.rows > 1) && !args.ratio) skeleton.style.height = args.height;
  return skeleton;
}

export const Playground = {
  render: (args: StoryArgs) => createSkeleton(args)
};

export const Rows = {
  args: { rows: 4, width: "20rem" },
  render: Playground.render
};

export const Animated = {
  args: { rows: 3, animated: true, width: "20rem" },
  render: Playground.render
};

export const Card = {
  render: () => {
    const card = document.createElement("div");
    card.className = "flex w-80 items-start gap-3 rounded-xl border border-slate-200 p-4";
    card.appendChild(createSkeleton({ rounded: "full", width: "2.5rem", height: "2.5rem" }));
    const lines = document.createElement("div");
    lines.className = "flex-1";
    lines.appendChild(createSkeleton({ rows: 3, animated: true }));
    card.appendChild(lines);
    return card;
  }
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl p-4";
    wrap.style.background = "oklch(20.8% 0.042 265.755)";
    wrap.appendChild(createSkeleton({ rows: 3, animated: true, theme: "dark", width: "20rem" }));
    return wrap;
  }
};

export const Reveal = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";
    const slot = document.createElement("div");
    slot.setAttribute("data-slot", "");
    slot.appendChild(createSkeleton({ rows: 2, animated: true, width: "20rem" }));
    const button = document.createElement("ark-button");
    button.setAttribute("size", "sm");
    button.setAttribute("variant", "outline");
    button.textContent = "Carregou";
    button.addEventListener("click", () => {
      // O conteudo real substitui o skeleton e entra com o preset de fade do core.
      const content = document.createElement("p");
      content.className = "ark-animate-fade-in text-sm text-slate-700";
      content.textContent = "GET /users respondeu 200 em 12 ms.";
      slot.replaceChildren(content);
    });
    wrap.append(slot, button);
    return wrap;
  },
  // Reveal e so .ark-animate-fade-in no conteudo que substitui o skeleton.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const slot = canvasElement.querySelector("[data-slot]")!;
    expect(slot.querySelector("ark-skeleton")).not.toBeNull();

    await userEvent.click(canvas.getByText("Carregou"));
    expect(slot.querySelector("ark-skeleton")).toBeNull();
    const content = slot.firstElementChild as HTMLElement;
    expect(content.classList.contains("ark-animate-fade-in")).toBe(true);
    expect(getComputedStyle(content).animationName).toBe("ark-fade-in");
  }
};

export const BlockAndRows = {
  render: () => createSkeleton({ width: "16rem" }),
  // Bloco unico: o host leva .ark-skeleton, aria-hidden e 1rem de altura por padrao (class/style do usuario
  // vencem); rows > 1 troca por barras proprias, a ultima mais curta; voltar a 1 remove as barras.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const skeleton = canvasElement.querySelector("ark-skeleton") as SkeletonEl;

    await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton.classList.contains("ark-skeleton")).toBe(true);
    expect(skeleton.classList.contains("ark-skeleton-animated")).toBe(false);
    expect(getComputedStyle(skeleton).display).toBe("block");
    expect(skeleton.getBoundingClientRect().height).toBe(16);
    expect(skeleton.getBoundingClientRect().width).toBe(256);

    skeleton.style.height = "2rem";
    expect(skeleton.getBoundingClientRect().height).toBe(32);
    skeleton.style.height = "";

    skeleton.rows = 3;
    await expect(skeleton).toHaveAttribute("rows", "3");
    expect(skeleton.classList.contains("ark-skeleton")).toBe(false);
    const rows = Array.from(skeleton.querySelectorAll('[data-ark="skeleton-row"]'));
    expect(rows.length).toBe(3);
    for (const row of rows) expect(row.classList.contains("ark-skeleton")).toBe(true);
    expect(rows[2].getBoundingClientRect().width).toBeLessThan(rows[0].getBoundingClientRect().width);
    expect(rows[1].getBoundingClientRect().top).toBeGreaterThan(rows[0].getBoundingClientRect().bottom);

    skeleton.rows = 1;
    expect(skeleton.querySelectorAll('[data-ark="skeleton-row"]').length).toBe(0);
    expect(skeleton.classList.contains("ark-skeleton")).toBe(true);
  }
};

export const AnimatedAndRounded = {
  render: () => createSkeleton({ width: "16rem" }),
  // animated liga .ark-skeleton-animated no bloco e em cada barra; rounded vai por border-radius inline,
  // porque o raio padrao de .ark-skeleton vem do motion.css sem layer.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const skeleton = canvasElement.querySelector("ark-skeleton") as SkeletonEl;

    expect(getComputedStyle(skeleton).borderTopLeftRadius).toBe("8px");
    skeleton.setAttribute("rounded", "full");
    expect(getComputedStyle(skeleton).borderTopLeftRadius).toBe("9999px");
    skeleton.setAttribute("rounded", "none");
    expect(getComputedStyle(skeleton).borderTopLeftRadius).toBe("0px");
    skeleton.removeAttribute("rounded");
    expect(getComputedStyle(skeleton).borderTopLeftRadius).toBe("8px");

    skeleton.animated = true;
    expect(skeleton.classList.contains("ark-skeleton-animated")).toBe(true);
    expect(getComputedStyle(skeleton).animationName).toBe("ark-shimmer");
    expect(skeleton.style.animationDelay).toMatch(/^calc\(var\(--ark-skeleton-duration, 1\.6s\) \* -0\.\d+\)$/);

    skeleton.setAttribute("rows", "2");
    skeleton.setAttribute("rounded", "sm");
    const rows = Array.from(skeleton.querySelectorAll<HTMLElement>('[data-ark="skeleton-row"]'));
    for (const row of rows) {
      expect(row.classList.contains("ark-skeleton-animated")).toBe(true);
      expect(getComputedStyle(row).borderTopLeftRadius).toBe("4px");
      expect(getComputedStyle(row).animationName).toBe("ark-shimmer");
    }
    // Fases escalonadas: as barras nao varrem juntas.
    expect(rows[0].style.animationDelay).not.toBe(rows[1].style.animationDelay);
    expect(skeleton.classList.contains("ark-skeleton-animated")).toBe(false);
    expect(skeleton.style.borderRadius).toBe("");
    expect(skeleton.style.animationDelay).toBe("");
  }
};

export const TestHooks = {
  render: () => createSkeleton({ rows: 2, width: "16rem", testid: "list-loading" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const skeleton = canvasElement.querySelector("ark-skeleton")!;

    await expect(skeleton).toHaveAttribute("data-ark", "skeleton");
    await expect(skeleton).toHaveAttribute("data-testid", "list-loading");
    const rows = skeleton.querySelectorAll('[data-ark="skeleton-row"]');
    expect(rows.length).toBe(2);
    await expect(rows[0]).toHaveAttribute("data-testid", "list-loading-row");
  }
};

export const ImageAndAvatar = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-start gap-4";
    wrap.appendChild(createSkeleton({ ratio: "16/9", width: "16rem", animated: true }));
    wrap.appendChild(createSkeleton({ ratio: "9/16", width: "6rem", animated: true }));
    wrap.appendChild(createSkeleton({ ratio: "1/1", rounded: "full", width: "4rem", animated: true }));
    return wrap;
  }
};

export const Colored = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-4 rounded-xl p-4";
    wrap.style.background = "oklch(45% 0.2 264)";
    wrap.appendChild(createSkeleton({ color: "white", rows: 3, animated: true, width: "20rem" }));
    wrap.appendChild(createSkeleton({ color: "#fbbf24", width: "12rem", height: "1.5rem", animated: true }));
    return wrap;
  }
};

export const ColorAndRatio = {
  render: () => createSkeleton({ width: "16rem" }),
  // ratio vira aspect-ratio inline (a altura padrao sai so com ratio valido; com rows e ignorado); color troca o
  // tint base via --ark-skeleton-color, lida pelo .ark-skeleton e herdada pelas barras.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const skeleton = canvasElement.querySelector("ark-skeleton") as SkeletonEl;
    const base = getComputedStyle(skeleton).backgroundColor;

    skeleton.setAttribute("ratio", "16/9");
    expect(skeleton.style.aspectRatio).toBe("16 / 9");
    expect(skeleton.getBoundingClientRect().height).toBe(144);
    skeleton.setAttribute("ratio", "16:9");
    expect(skeleton.getBoundingClientRect().height).toBe(144);
    skeleton.setAttribute("ratio", "1/1");
    skeleton.setAttribute("rounded", "full");
    expect(skeleton.getBoundingClientRect().height).toBe(256);
    expect(getComputedStyle(skeleton).borderTopLeftRadius).toBe("9999px");

    skeleton.setAttribute("rows", "2");
    expect(skeleton.style.aspectRatio).toBe("");
    expect(skeleton.hasAttribute("data-ark-ratio")).toBe(false);
    skeleton.removeAttribute("rows");
    skeleton.setAttribute("ratio", "lixo");
    expect(skeleton.style.aspectRatio).toBe("");
    expect(skeleton.getBoundingClientRect().height).toBe(16);
    skeleton.removeAttribute("ratio");
    skeleton.removeAttribute("rounded");

    skeleton.setAttribute("color", "rgb(59, 130, 246)");
    expect(skeleton.style.getPropertyValue("--ark-skeleton-color")).toBe("rgb(59, 130, 246)");
    expect(getComputedStyle(skeleton).backgroundColor).not.toBe(base);
    skeleton.setAttribute("rows", "2");
    const row = skeleton.querySelector('[data-ark="skeleton-row"]') as HTMLElement;
    expect(getComputedStyle(row).backgroundColor).not.toBe(base);
    skeleton.removeAttribute("color");
    expect(skeleton.style.getPropertyValue("--ark-skeleton-color")).toBe("");
    expect(getComputedStyle(row).backgroundColor).toBe(base);
  }
};
