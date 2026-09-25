import type { ArkTheme, ArkTooltipSide } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkTooltip",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Dica de contexto: o host `ark-tooltip` envolve o gatilho (primeiro filho sem `slot`, que precisa ser focavel) sem move-lo e cria o balao como `popover="manual"` (top layer, escapa de `overflow`). Texto por `content`; conteudo rico num filho `slot="content"`, que passa a ser o proprio balao. `side` com flip quando nao cabe, `delay` no hover (o foco abre na hora), Esc e pointerdown fecham; o gatilho recebe `aria-describedby`.'
      }
    }
  },
  argTypes: {
    content: { control: "text" },
    side: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    delay: { control: "number", description: "ms antes de abrir no hover; o foco abre na hora" },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    content: "Enviar a requisicao (Ctrl+Enter)",
    side: "top",
    delay: 200,
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  content: string;
  side: ArkTooltipSide;
  delay: number;
  theme: ArkTheme;
  testid?: string;
};

type TooltipEl = HTMLElement & { show(): void; hide(): void };

function createTrigger(text = "Enviar"): HTMLElement {
  const button = document.createElement("ark-button");
  button.setAttribute("variant", "outline");
  button.setAttribute("size", "sm");
  button.textContent = text;
  return button;
}

function createTooltip(args: Partial<StoryArgs>, triggerText?: string, rich?: HTMLElement): TooltipEl {
  const tooltip = document.createElement("ark-tooltip") as TooltipEl;
  if (args.content !== undefined && !rich) tooltip.setAttribute("content", args.content);
  if (args.side) tooltip.setAttribute("side", args.side);
  if (args.delay !== undefined) tooltip.setAttribute("delay", String(args.delay));
  if (args.theme) tooltip.setAttribute("theme", args.theme);
  if (args.testid) tooltip.setAttribute("testid", args.testid);
  tooltip.appendChild(createTrigger(triggerText));
  if (rich) {
    rich.setAttribute("slot", "content");
    tooltip.appendChild(rich);
  }
  return tooltip;
}

function createScene(args: Partial<StoryArgs>, triggerText?: string, rich?: HTMLElement): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-wrap items-center gap-3";
  // Espaco em volta inline (nao depende do CSS do preview): a dica precisa caber no lado pedido.
  wrap.style.padding = "4rem 2rem";
  wrap.appendChild(createTooltip(args, triggerText, rich));
  return wrap;
}

function createHealth(): HTMLElement {
  const box = document.createElement("div");
  box.className = "flex flex-col gap-1";
  const title = document.createElement("strong");
  title.textContent = "Ambiente: producao";
  box.appendChild(title);
  for (const line of ["API: 12 ms", "Banco: ok", "Fila: 3 pendentes"]) {
    const p = document.createElement("span");
    p.textContent = line;
    box.appendChild(p);
  }
  return box;
}

function bubbleOf(tooltip: HTMLElement): HTMLElement {
  return tooltip.querySelector('[data-ark="tooltip-bubble"]') as HTMLElement;
}

function popoverOpen(el: Element | null): boolean {
  return el?.matches(":popover-open") ?? false;
}

export const Playground = {
  render: (args: StoryArgs) => createScene(args)
};

export const Sides = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-6 p-12";
    for (const side of ["top", "bottom", "left", "right"] as ArkTooltipSide[]) {
      wrap.appendChild(createTooltip({ content: `Dica no lado ${side}`, side }, side));
    }
    return wrap;
  }
};

export const RichContent = {
  render: () => createScene({ side: "bottom" }, "Saude", createHealth())
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl p-8";
    wrap.style.background = "oklch(20.8% 0.042 265.755)";
    const tooltip = createTooltip({ content: "Tema escuro", theme: "dark" });
    tooltip.querySelector("ark-button")?.setAttribute("theme", "dark");
    wrap.appendChild(tooltip);
    return wrap;
  }
};

export const HoverOpensAfterDelay = {
  render: () => createScene({ content: "Enviar a requisicao", delay: 150 }),
  // Hover abre depois do delay com role tooltip no top layer e aria-describedby no gatilho; sair fecha depois da
  // tolerância que deixa o ponteiro chegar ao balão.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tooltip = canvasElement.querySelector("ark-tooltip") as TooltipEl;
    const trigger = tooltip.querySelector("ark-button") as HTMLElement;
    const bubble = bubbleOf(tooltip);

    await expect(bubble).toHaveAttribute("role", "tooltip");
    await expect(bubble).toHaveAttribute("popover", "manual");
    await expect(trigger).toHaveAttribute("aria-describedby", bubble.id);
    expect(bubble.textContent).toBe("Enviar a requisicao");
    expect(popoverOpen(bubble)).toBe(false);
    expect(tooltip.hasAttribute("data-ark-chrome")).toBe(false);
    expect(tooltip.firstElementChild).toBe(trigger);

    await userEvent.hover(trigger);
    expect(popoverOpen(bubble)).toBe(false);
    await waitFor(() => expect(popoverOpen(bubble)).toBe(true));
    await expect(tooltip).toHaveAttribute("open");
    await expect(bubble).toHaveAttribute("data-ark-side", "top");
    await expect(bubble).toHaveAttribute("data-ark-align", "center");

    tooltip.setAttribute("content", "Atualizado");
    expect(bubble.textContent).toBe("Atualizado");

    await userEvent.unhover(trigger);
    await waitFor(() => expect(popoverOpen(bubble)).toBe(false));
    await expect(tooltip).not.toHaveAttribute("open");

    // Sair antes do delay cancela a abertura.
    await userEvent.hover(trigger);
    await userEvent.unhover(trigger);
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(popoverOpen(bubble)).toBe(false);
  }
};

// O ponteiro sai do gatilho, cruza o espaço até o balão e para sobre ele: a dica fica aberta (WCAG 1.4.13).
export const HoverReachesTheBubble = {
  render: () => createScene({ content: "Atalho: Ctrl+Enter", delay: 0 }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tooltip = canvasElement.querySelector("ark-tooltip") as TooltipEl;
    const trigger = tooltip.querySelector("ark-button") as HTMLElement;
    const bubble = bubbleOf(tooltip);
    const pointer = (type: string, target: Element, relatedTarget: Element): void => {
      target.dispatchEvent(
        new PointerEvent(type, { bubbles: true, relatedTarget, pointerId: 1, isPrimary: true, pointerType: "mouse" })
      );
    };

    pointer("pointerover", trigger, document.body);
    await waitFor(() => expect(popoverOpen(bubble)).toBe(true));
    await expect(getComputedStyle(bubble).pointerEvents).not.toBe("none");

    // Sai para o espaço vazio entre os dois (fora do host) e entra no balão antes da tolerância acabar.
    pointer("pointerout", trigger, document.body);
    pointer("pointerover", bubble, document.body);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(popoverOpen(bubble)).toBe(true);

    // Sai do balão para fora: fecha depois da tolerância.
    pointer("pointerout", bubble, document.body);
    await expect(popoverOpen(bubble)).toBe(true);
    await waitFor(() => expect(popoverOpen(bubble)).toBe(false));
  }
};

export const FocusOpensAndEscCloses = {
  render: () => createScene({ content: "Enviar a requisicao" }),
  // Foco abre na hora, Esc fecha, perder o foco fecha; pointerdown no gatilho dispensa.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tooltip = canvasElement.querySelector("ark-tooltip") as TooltipEl;
    const trigger = tooltip.querySelector("ark-button") as HTMLElement;
    const bubble = bubbleOf(tooltip);

    trigger.focus();
    expect(popoverOpen(bubble)).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(popoverOpen(bubble)).toBe(false);

    tooltip.show();
    expect(popoverOpen(bubble)).toBe(true);
    trigger.blur();
    expect(popoverOpen(bubble)).toBe(false);

    await userEvent.hover(trigger);
    await waitFor(() => expect(popoverOpen(bubble)).toBe(true));
    await userEvent.pointer({ keys: "[MouseLeft>]", target: trigger });
    expect(popoverOpen(bubble)).toBe(false);
    await userEvent.pointer({ keys: "[/MouseLeft]", target: trigger });
    await userEvent.unhover(trigger);

    // O atributo open tambem abre e fecha.
    tooltip.setAttribute("open", "");
    expect(popoverOpen(bubble)).toBe(true);
    tooltip.removeAttribute("open");
    expect(popoverOpen(bubble)).toBe(false);
  }
};

export const RichContentIsTheBubble = {
  render: () => createScene({ side: "bottom", delay: 0 }, "Saude", createHealth()),
  // O filho slot="content" do usuario vira o proprio balao: popover, role, id e hook nele, sem mover nada.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tooltip = canvasElement.querySelector("ark-tooltip") as TooltipEl;
    const trigger = tooltip.querySelector("ark-button") as HTMLElement;
    const rich = tooltip.querySelector('[slot="content"]') as HTMLElement;

    expect(bubbleOf(tooltip)).toBe(rich);
    await expect(rich).toHaveAttribute("role", "tooltip");
    await expect(rich).toHaveAttribute("popover", "manual");
    await expect(trigger).toHaveAttribute("aria-describedby", rich.id);
    expect(tooltip.querySelector("[data-ark-chrome]")).toBeNull();
    expect(popoverOpen(rich)).toBe(false);

    await userEvent.hover(trigger);
    await waitFor(() => expect(popoverOpen(rich)).toBe(true));
    await expect(rich).toHaveAttribute("data-ark-side", "bottom");
    expect(rich.querySelector("strong")?.textContent).toBe("Ambiente: producao");
    await userEvent.unhover(trigger);
    await waitFor(() => expect(popoverOpen(rich)).toBe(false));
  }
};

export const FlipsWhenThereIsNoRoom = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-center gap-3";
    // Colado no topo da viewport: nao ha espaco em cima, a dica vira para baixo.
    wrap.style.cssText = "position: fixed; top: 8px; left: 8px;";
    wrap.appendChild(createTooltip({ content: "Sem espaco em cima", side: "top", delay: 0 }, "No topo"));
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const tooltip = canvasElement.querySelector("ark-tooltip") as TooltipEl;
    const trigger = canvas.getByText("No topo");
    const bubble = bubbleOf(tooltip);

    await userEvent.hover(trigger);
    await waitFor(() => expect(popoverOpen(bubble)).toBe(true));
    await expect(bubble).toHaveAttribute("data-ark-side", "bottom");
    expect(bubble.getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger.getBoundingClientRect().bottom);
    await userEvent.unhover(trigger);
  }
};

export const TestHooks = {
  render: () => createScene({ content: "Enviar", testid: "send-tip" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tooltip = canvasElement.querySelector("ark-tooltip")!;

    await expect(tooltip).toHaveAttribute("data-ark", "tooltip");
    await expect(tooltip).toHaveAttribute("data-testid", "send-tip");
    await expect(tooltip.querySelector('[data-ark="tooltip-bubble"]')).toHaveAttribute(
      "data-testid",
      "send-tip-bubble"
    );
  }
};
