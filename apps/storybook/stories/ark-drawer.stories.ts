import type { ArkDrawerMode, ArkDrawerSide, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkDrawer",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Gaveta ancorada numa borda. O host `ark-drawer` e o painel: em `mode="overlay"` abre como popover manual (top layer, scrim, focus trap, Esc e scrim fecham); em `mode="inline"` fica no fluxo da pagina e so anima (console inferior, painel lateral). `side` escolhe a borda e a direcao do slide (easing `sheet`), `size` e um preset ou um comprimento CSS. Filhos sao o corpo; `slot="footer"` vai ao fim; o cabecalho vem de `label`.'
      }
    }
  },
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right", "top", "bottom"] },
    mode: { control: "inline-radio", options: ["overlay", "inline"] },
    size: { control: "text", description: "sm | md | lg ou comprimento CSS" },
    label: { control: "text" },
    persistent: { control: "boolean" },
    noCloseButton: { control: "boolean" },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    side: "right",
    mode: "overlay",
    size: "md",
    label: "Filtros",
    persistent: false,
    noCloseButton: false,
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  side: ArkDrawerSide;
  mode: ArkDrawerMode;
  size: string;
  label: string;
  persistent: boolean;
  noCloseButton: boolean;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
  open?: boolean;
  withFooter?: boolean;
};

type DrawerEl = HTMLElement & { open: boolean; show: () => void; close: (reason?: string) => void };

function createDrawer(args: Partial<StoryArgs>): DrawerEl {
  const drawer = document.createElement("ark-drawer") as DrawerEl;
  if (args.side) drawer.setAttribute("side", args.side);
  if (args.mode) drawer.setAttribute("mode", args.mode);
  if (args.size) drawer.setAttribute("size", args.size);
  if (args.label) drawer.setAttribute("label", args.label);
  if (args.persistent) drawer.setAttribute("persistent", "");
  if (args.noCloseButton) drawer.setAttribute("no-close-button", "");
  if (args.lang) drawer.setAttribute("lang", args.lang);
  if (args.theme) drawer.setAttribute("theme", args.theme);
  if (args.testid) drawer.setAttribute("testid", args.testid);
  if (args.open) drawer.setAttribute("open", "");

  const body = document.createElement("div");
  body.className = "flex flex-col gap-3 text-sm";
  body.innerHTML =
    "<p>Filhos do usuario sao o corpo e ficam onde estao.</p><label class='flex flex-col gap-1'>Nome <input class='rounded border px-2 py-1' placeholder='primeiro focavel'></label><p>Mais conteudo para a gaveta rolar quando precisar.</p>";
  drawer.appendChild(body);

  if (args.withFooter !== false) {
    const footer = document.createElement("div");
    footer.setAttribute("slot", "footer");
    const cancel = document.createElement("ark-button");
    cancel.setAttribute("variant", "outline");
    cancel.setAttribute("size", "sm");
    cancel.textContent = "Cancelar";
    cancel.addEventListener("click", () => drawer.close());
    const apply = document.createElement("ark-button");
    apply.setAttribute("size", "sm");
    apply.textContent = "Aplicar";
    footer.append(cancel, apply);
    drawer.appendChild(footer);
  }
  return drawer;
}

function createOpener(drawer: DrawerEl, text: string): HTMLElement {
  const button = document.createElement("ark-button");
  button.setAttribute("variant", "outline");
  button.setAttribute("size", "sm");
  button.textContent = text;
  button.addEventListener("click", () => drawer.show());
  return button;
}

export const Playground = {
  render: (args: StoryArgs) => {
    const wrap = document.createElement("div");
    const drawer = createDrawer(args);
    wrap.append(createOpener(drawer, `Abrir (${args.side}, ${args.mode})`), drawer);
    return wrap;
  }
};

export const Sides = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap gap-2";
    for (const side of ["left", "right", "top", "bottom"] as ArkDrawerSide[]) {
      const drawer = createDrawer({
        side,
        label: `Gaveta ${side}`,
        lang: "pt",
        size: side === "top" || side === "bottom" ? "sm" : "md"
      });
      wrap.append(createOpener(drawer, side), drawer);
    }
    return wrap;
  }
};

export const MobileSidebar = {
  render: () => {
    const wrap = document.createElement("div");
    const drawer = createDrawer({ side: "left", label: "Colecoes", size: "100%", lang: "pt", withFooter: false });
    wrap.append(createOpener(drawer, "Abrir sidebar (largura toda)"), drawer);
    return wrap;
  }
};

// Console inferior: no fluxo, nao modal, com altura propria; o botao alterna e o layout acompanha.
export const InlineConsole = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex h-80 flex-col overflow-hidden rounded-lg border";
    wrap.style.borderColor = "var(--ark-color-border)";
    const main = document.createElement("div");
    main.className = "flex flex-1 items-start gap-2 p-4 text-sm";
    const drawer = createDrawer({
      side: "bottom",
      mode: "inline",
      size: "40%",
      label: "Console",
      lang: "pt",
      withFooter: false,
      open: true
    });
    const toggle = document.createElement("ark-button");
    toggle.setAttribute("variant", "outline");
    toggle.setAttribute("size", "sm");
    toggle.textContent = "Alternar console";
    toggle.addEventListener("click", () => {
      drawer.open = !drawer.open;
    });
    main.append(toggle, "Area principal: a gaveta inline divide o espaco com ela, sem scrim.");
    wrap.append(main, drawer);
    return wrap;
  }
};

const settled = (el: HTMLElement) => waitFor(() => expect(el.getAnimations()).toHaveLength(0));

// Overlay: popover manual com role=dialog, foco preso, Esc e scrim fecham com o motivo, persistent ignora;
// a gaveta encosta na borda de `side` com a largura do preset.
export const OverlayBehavior = {
  render: () => {
    const wrap = document.createElement("div");
    const drawer = createDrawer({ side: "right", label: "Filtros", lang: "pt" });
    wrap.append(createOpener(drawer, "Abrir"), drawer);
    const outside = document.createElement("button");
    outside.textContent = "fora";
    outside.id = "fora";
    wrap.appendChild(outside);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const drawer = canvasElement.querySelector("ark-drawer") as DrawerEl;
    const events: string[] = [];
    drawer.addEventListener("ark-open", () => events.push("open"));
    drawer.addEventListener("ark-close", (event) =>
      events.push(`close:${(event as CustomEvent<{ reason: string }>).detail.reason}`)
    );

    await expect(drawer).toHaveAttribute("popover", "manual");
    await expect(drawer).not.toBeVisible();
    await userEvent.click(canvas.getByText("Abrir"));
    await expect(drawer).toHaveAttribute("open");
    await expect(drawer.matches(":popover-open")).toBe(true);
    await expect(drawer).toHaveAttribute("role", "dialog");
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    await expect(drawer).toHaveAccessibleName("Filtros");
    await expect(drawer.querySelector("input")).toHaveFocus();
    await settled(drawer);
    const box = drawer.getBoundingClientRect();
    await expect(Math.round(box.right)).toBe(Math.round(window.innerWidth));
    await expect(Math.round(box.width)).toBe(384);
    await expect(Math.round(box.height)).toBe(Math.round(window.innerHeight));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(drawer.matches(":popover-open")).toBe(false));
    await expect(events).toEqual(["open", "close:escape"]);

    drawer.show();
    await waitFor(() => expect(drawer.matches(":popover-open")).toBe(true));
    await settled(drawer);
    await userEvent.click(document.getElementById("fora") as HTMLElement);
    await waitFor(() => expect(drawer.matches(":popover-open")).toBe(false));
    await expect(events.at(-1)).toBe("close:backdrop");

    drawer.setAttribute("persistent", "");
    drawer.show();
    await waitFor(() => expect(drawer.matches(":popover-open")).toBe(true));
    await userEvent.keyboard("{Escape}");
    await expect(drawer).toHaveAttribute("open");
    await userEvent.click(canvas.getByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(drawer.matches(":popover-open")).toBe(false));
    await expect(events.at(-1)).toBe("close:close-button");

    drawer.removeAttribute("persistent");
    drawer.setAttribute("side", "bottom");
    drawer.setAttribute("size", "12rem");
    drawer.show();
    await settled(drawer);
    const bottom = drawer.getBoundingClientRect();
    await expect(Math.round(bottom.bottom)).toBe(Math.round(window.innerHeight));
    await expect(Math.round(bottom.height)).toBe(192);
    await expect(Math.round(bottom.width)).toBe(Math.round(window.innerWidth));
    drawer.close();
  }
};

// Inline: sem popover, role=region, no fluxo; open alterna a exibicao com a animacao de slide e a altura
// vem de size no eixo da gaveta.
export const InlineBehavior = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex h-64 flex-col overflow-hidden rounded-lg border";
    wrap.style.borderColor = "var(--ark-color-border)";
    const main = document.createElement("div");
    main.className = "flex flex-1 items-start gap-2 p-4 text-sm";
    const drawer = createDrawer({
      side: "bottom",
      mode: "inline",
      size: "10rem",
      label: "Console",
      lang: "pt",
      withFooter: false
    });
    const toggle = document.createElement("ark-button");
    toggle.setAttribute("variant", "outline");
    toggle.setAttribute("size", "sm");
    toggle.textContent = "Alternar console";
    toggle.addEventListener("click", () => {
      drawer.open = !drawer.open;
    });
    main.append(toggle, "Fechada no inicio: o play abre e fecha pela propriedade open.");
    wrap.append(main, drawer);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const drawer = canvasElement.querySelector("ark-drawer") as DrawerEl;

    await expect(drawer).not.toHaveAttribute("popover");
    await expect(drawer).toHaveAttribute("role", "region");
    await expect(drawer).not.toHaveAttribute("aria-modal");
    await expect(getComputedStyle(drawer).display).toBe("none");

    drawer.open = true;
    await expect(drawer).toHaveAttribute("open");
    await expect(getComputedStyle(drawer).display).toBe("flex");
    await expect(drawer.getAnimations().length).toBeGreaterThan(0);
    await settled(drawer);
    await expect(Math.round(drawer.getBoundingClientRect().height)).toBe(160);
    await expect(getComputedStyle(drawer).borderTopWidth).toBe("1px");
    await expect(getComputedStyle(drawer).borderBottomWidth).toBe("0px");

    // Esc nao fecha o inline; open=false anima a saida e esconde.
    drawer.focus();
    await userEvent.keyboard("{Escape}");
    await expect(drawer).toHaveAttribute("open");
    drawer.open = "false" as unknown as boolean;
    await waitFor(() => expect(getComputedStyle(drawer).display).toBe("none"));
  }
};

export const TestHooks = {
  render: () => {
    const wrap = document.createElement("div");
    const drawer = createDrawer({ label: "Hooks", lang: "pt", testid: "minha-gaveta" });
    wrap.append(createOpener(drawer, "Abrir (hooks: minha-gaveta-*)"), drawer);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const drawer = canvasElement.querySelector("ark-drawer") as DrawerEl;
    drawer.show();
    await expect(drawer).toHaveAttribute("data-testid", "minha-gaveta");
    for (const part of ["header", "title", "close", "footer"]) {
      await expect(canvasElement.querySelector(`[data-ark="drawer-${part}"]`)).toHaveAttribute(
        "data-testid",
        `minha-gaveta-${part}`
      );
    }
    drawer.close();
  }
};
