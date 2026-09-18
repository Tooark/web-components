import type { ArkSplitPaneDirection, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkSplitPane",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Paineis redimensionaveis. Os filhos do host `ark-split-pane` sao os paineis e ficam onde estao; as alcas sao nos proprios ao fim do host, posicionados na grid por coluna/linha explicita. `sizes` (percentuais) e a fonte da verdade e e reescrito a cada arrasto ou seta; `data-min`/`data-max` nos filhos limitam. Emite `ark-resize`; persistir e do app."
      }
    }
  },
  argTypes: {
    direction: { control: "inline-radio", options: ["horizontal", "vertical"] },
    sizes: { control: "text" },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    direction: "horizontal",
    sizes: "30,70",
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  direction: ArkSplitPaneDirection;
  sizes: string;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
};

type SplitPaneEl = HTMLElement & { sizes: number[]; direction: ArkSplitPaneDirection };

type Panel = { label: string; min?: string; max?: string; hint?: string };

function createPanel(panel: Panel): HTMLElement {
  const el = document.createElement("div");
  el.className = "flex flex-col gap-1 overflow-auto p-3 text-sm";
  el.style.background = "var(--ark-color-surface-muted)";
  const title = document.createElement("strong");
  title.textContent = panel.label;
  el.appendChild(title);
  const hint = document.createElement("span");
  hint.className = "text-xs";
  hint.style.color = "var(--ark-color-fg-muted)";
  hint.textContent =
    panel.hint ?? [panel.min && `min ${panel.min}`, panel.max && `max ${panel.max}`].filter(Boolean).join(" · ");
  if (hint.textContent) el.appendChild(hint);
  if (panel.min) el.dataset.min = panel.min;
  if (panel.max) el.dataset.max = panel.max;
  return el;
}

function createSplitPane(
  args: Partial<StoryArgs>,
  panels: Panel[] = [{ label: "Arvore de colecoes" }, { label: "Editor" }]
): SplitPaneEl {
  const el = document.createElement("ark-split-pane") as SplitPaneEl;
  if (args.direction) el.setAttribute("direction", args.direction);
  if (args.sizes) el.setAttribute("sizes", args.sizes);
  if (args.lang) el.setAttribute("lang", args.lang);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  el.className = "rounded-lg border";
  el.style.borderColor = "var(--ark-color-border)";
  el.style.width = "40rem";
  el.style.height = "16rem";
  for (const panel of panels) el.appendChild(createPanel(panel));
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createSplitPane(args)
};

export const Vertical = {
  render: () =>
    createSplitPane({ direction: "vertical", sizes: "60,40", lang: "pt" }, [{ label: "Editor" }, { label: "Resposta" }])
};

export const ThreePanels = {
  render: () =>
    createSplitPane({ sizes: "20,50,30", lang: "pt" }, [
      { label: "Arvore", min: "15" },
      { label: "Editor", min: "30" },
      { label: "Resposta", min: "15", max: "50" }
    ])
};

// Um split-pane divide num eixo so. O layout "um painel inteiro a esquerda, dois empilhados a direita" sao dois
// split-panes: o de fora horizontal (arvore | resto) e, como segundo painel dele, um vertical (editor / resposta).
export const Nested = {
  parameters: {
    docs: {
      description: {
        story:
          "Layout de IDE: o `ark-split-pane` de fora e horizontal e tem dois filhos, a arvore e OUTRO `ark-split-pane`, vertical, com editor e resposta. O interno nao precisa de largura nem altura: e um painel do externo e ocupa a faixa dele. Arraste a alca vertical (entre arvore e editor) e a horizontal (entre editor e resposta); cada uma pertence ao seu split-pane e emite o proprio `ark-resize`."
      }
    }
  },
  render: () => {
    const outer = createSplitPane({ sizes: "25,75", lang: "pt" }, [
      { label: "Arvore de colecoes", min: "15", hint: "painel 1 do split horizontal (min 15%)" }
    ]);
    outer.style.height = "20rem";
    const inner = createSplitPane({ direction: "vertical", sizes: "55,45", lang: "pt" }, [
      { label: "Editor", hint: "painel 1 do split vertical interno" },
      { label: "Resposta", hint: "painel 2 do split vertical interno" }
    ]);
    // O interno e um painel do externo: sem borda, largura ou altura proprias.
    inner.className = "";
    inner.style.width = "";
    inner.style.height = "";
    inner.style.borderColor = "";
    inner.style.background = "var(--ark-color-surface)";
    outer.appendChild(inner);
    return outer;
  }
};

export const PixelConstraints = {
  render: () =>
    createSplitPane({ sizes: "30,70", lang: "pt" }, [
      { label: "Minimo 120px, maximo 320px", min: "120px", max: "320px" },
      { label: "Livre" }
    ])
};

// Grid com os paineis no lugar e a alca ao fim; sizes normalizado e refletido; setas e arrasto redimensionam
// respeitando data-min/data-max e emitem ark-resize; paineis que entram ganham alca.
export const Resizing = {
  render: () =>
    createSplitPane({ sizes: "30,70", lang: "pt" }, [
      { label: "Esquerda", min: "20" },
      { label: "Direita", min: "25" }
    ]),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const pane = canvasElement.querySelector("ark-split-pane") as SplitPaneEl;
    const panels = () =>
      Array.from(pane.children).filter((child) => !child.hasAttribute("data-ark-chrome")) as HTMLElement[];
    const events: number[][] = [];
    pane.addEventListener("ark-resize", (event) =>
      events.push((event as CustomEvent<{ sizes: number[] }>).detail.sizes)
    );
    const handle = canvas.getByRole("separator");

    await expect(pane.sizes).toEqual([30, 70]);
    await expect(getComputedStyle(pane).display).toBe("grid");
    await expect(pane.lastElementChild).toBe(handle);
    await expect(handle).toHaveAttribute("aria-orientation", "vertical");
    await expect(handle).toHaveAccessibleName("Redimensionar");
    await expect(handle).toHaveAttribute("aria-valuenow", "30");
    await expect(handle).toHaveAttribute("aria-valuemin", "20");
    await expect(handle).toHaveAttribute("aria-valuemax", "75");
    const [left, right] = panels();
    const space = left.getBoundingClientRect().width + right.getBoundingClientRect().width;
    await expect(Math.abs(left.getBoundingClientRect().width / space - 0.3)).toBeLessThan(0.01);
    await expect(left.getBoundingClientRect().right).toBeLessThanOrEqual(handle.getBoundingClientRect().left + 0.5);
    await expect(handle.getBoundingClientRect().right).toBeLessThanOrEqual(right.getBoundingClientRect().left + 0.5);

    // Teclado: setas, Shift acelera, limites de data-min, Home/End.
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(pane.sizes).toEqual([32, 68]);
    await expect(pane).toHaveAttribute("sizes", "32,68");
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    await expect(pane.sizes).toEqual([22, 78]);
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(pane.sizes).toEqual([20, 80]);
    await userEvent.keyboard("{End}");
    await expect(pane.sizes).toEqual([75, 25]);
    await userEvent.keyboard("{Home}");
    await expect(pane.sizes).toEqual([20, 80]);
    await expect(events).toHaveLength(5);

    // Arrasto: move 10% do espaco dos paineis para a direita.
    pane.sizes = [40, 60];
    await expect(events).toHaveLength(5);
    const box = handle.getBoundingClientRect();
    const startX = box.left + box.width / 2;
    handle.dispatchEvent(
      new PointerEvent("pointerdown", {
        pointerId: 1,
        clientX: startX,
        clientY: box.top + 10,
        button: 0,
        bubbles: true
      })
    );
    await expect(pane).toHaveAttribute("data-ark-dragging");
    handle.dispatchEvent(
      new PointerEvent("pointermove", {
        pointerId: 1,
        clientX: startX + space * 0.1,
        clientY: box.top + 10,
        bubbles: true
      })
    );
    await expect(Math.round(pane.sizes[0])).toBe(50);
    handle.dispatchEvent(
      new PointerEvent("pointerup", {
        pointerId: 1,
        clientX: startX + space * 0.1,
        clientY: box.top + 10,
        bubbles: true
      })
    );
    await expect(pane).not.toHaveAttribute("data-ark-dragging");
    await expect(events.at(-1)?.map(Math.round)).toEqual([50, 50]);

    // Um painel novo ganha alca e os tamanhos sao redistribuidos.
    pane.appendChild(createPanel({ label: "Terceiro" }));
    // O MutationObserver reage num microtask.
    await waitFor(() => expect(canvas.getAllByRole("separator")).toHaveLength(2));
    await expect(pane.sizes.map(Math.round)).toEqual([33, 33, 33]);
    await expect(
      Array.from(pane.children)
        .slice(-2)
        .every((child) => child.getAttribute("role") === "separator")
    ).toBe(true);

    // Vertical: orientacao e eixo.
    pane.setAttribute("direction", "vertical");
    await expect(canvas.getAllByRole("separator")[0]).toHaveAttribute("aria-orientation", "horizontal");
    await expect(getComputedStyle(pane).gridTemplateColumns.split(" ")).toHaveLength(1);
  }
};

export const TestHooks = {
  render: () => createSplitPane({ sizes: "50,50", lang: "pt", testid: "paineis" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="split-pane"]')).toHaveAttribute("data-testid", "paineis");
    await expect(canvasElement.querySelector('[data-ark="split-pane-handle"]')).toHaveAttribute(
      "data-testid",
      "paineis-handle"
    );
  }
};
