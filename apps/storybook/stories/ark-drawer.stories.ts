import type { ArkDrawerMode, ArkDrawerSide, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkDrawer",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Gaveta ancorada numa borda. O host `ark-drawer` é o painel: em `mode="overlay"` abre como popover manual (top layer, scrim, focus trap, Esc e scrim fecham); em `mode="inline"` fica no fluxo da página e só anima (console inferior, painel lateral). `side` escolhe a borda e a direção do slide (easing `sheet`), `size` é um preset ou um comprimento CSS. Filhos são o corpo; `slot="footer"` vai ao fim; o cabeçalho vem de `label`.'
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
    "<p>Filhos do usuário são o corpo e ficam onde estão.</p><label class='flex flex-col gap-1'>Nome <input class='rounded border px-2 py-1' placeholder='primeiro focável'></label><p>Mais conteúdo para a gaveta rolar quando precisar.</p>";
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
    const drawer = createDrawer({ side: "left", label: "Coleções", size: "100%", lang: "pt", withFooter: false });
    wrap.append(createOpener(drawer, "Abrir sidebar (largura toda)"), drawer);
    return wrap;
  }
};

// Console inferior: no fluxo, não modal, com altura própria; o botão alterna e o layout acompanha.
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
    main.append(toggle, "Área principal: a gaveta inline divide o espaço com ela, sem scrim.");
    wrap.append(main, drawer);
    return wrap;
  }
};

const settled = (el: HTMLElement) => waitFor(() => expect(el.getAnimations()).toHaveLength(0));

// Ações do app na linha do cabeçalho (slot="actions"), entre o título e o fechar: um console com a contagem e os
// botões dele, e uma gaveta overlay com um botão de editar.
export const HeaderActions = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";

    const frame = document.createElement("div");
    frame.className = "flex h-96 flex-col overflow-hidden rounded-lg border";
    frame.style.borderColor = "var(--ark-color-border)";
    const main = document.createElement("div");
    main.className = "flex-1 p-4 text-sm";
    main.textContent = "Área principal";
    const consoleDrawer = createDrawer({
      side: "bottom",
      mode: "inline",
      size: "55%",
      label: "Console",
      lang: "pt",
      withFooter: false,
      open: true,
      testid: "console"
    });
    const log = consoleDrawer.firstElementChild as HTMLElement;
    log.innerHTML = Array.from({ length: 30 }, (_, index) => `<p>GET /users/${index + 1} 200 OK</p>`).join("");
    const actions = document.createElement("div");
    actions.setAttribute("slot", "actions");
    const count = document.createElement("ark-badge");
    count.setAttribute("size", "sm");
    count.textContent = "30";
    const har = document.createElement("ark-button");
    har.setAttribute("variant", "ghost");
    har.setAttribute("size", "sm");
    har.textContent = "HAR";
    const clear = document.createElement("ark-button");
    clear.setAttribute("variant", "ghost");
    clear.setAttribute("size", "sm");
    clear.textContent = "Limpar";
    actions.append(count, har, clear);
    consoleDrawer.appendChild(actions);
    frame.append(main, consoleDrawer);

    const details = createDrawer({ label: "Detalhes da requisição", lang: "pt", testid: "detalhes" });
    const detailsActions = document.createElement("div");
    detailsActions.setAttribute("slot", "actions");
    const edit = document.createElement("ark-button");
    edit.setAttribute("variant", "outline");
    edit.setAttribute("size", "sm");
    edit.textContent = "Editar";
    detailsActions.appendChild(edit);
    details.appendChild(detailsActions);

    wrap.append(frame, createOpener(details, "Abrir detalhes (overlay com ações)"), details);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const part = (testid: string) => canvasElement.querySelector(`[data-testid="${testid}"]`) as HTMLElement;
    const rect = (el: Element) => el.getBoundingClientRect();
    const middle = (el: Element) => (rect(el).top + rect(el).bottom) / 2;
    const near = async (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(1);

    // Linha do cabeçalho: título | ações | fechar, centradas na linha do título, com o gap-4 entre as três.
    const drawer = part("console");
    const actions = part("console-actions");
    const header = part("console-header");
    const title = part("console-title");
    const body = drawer.querySelector(":scope > div:not([data-ark-chrome]):not([slot])") as HTMLElement;
    await expect(actions).toHaveAttribute("data-ark", "drawer-actions");
    await settled(drawer);
    await waitFor(() =>
      expect(drawer.style.getPropertyValue("--ark-drawer-actions-width")).toBe(`${actions.offsetWidth}px`)
    );
    await near(rect(header).top, rect(drawer).top);
    await near(middle(actions), middle(title));
    await near(rect(part("console-close")).left - rect(actions).right, 16);
    await near(rect(actions).left - rect(title).right, 16);
    // O corpo começa onde o cabeçalho termina: as ações não ocupam espaço próprio.
    await near(rect(body).top, rect(header).bottom);

    // Rolando, ações e cabeçalho ficam presos juntos.
    drawer.scrollTop = 200;
    await expect(drawer.scrollTop).toBeGreaterThan(0);
    await near(rect(header).top, rect(drawer).top);
    await near(middle(actions), middle(title));
    drawer.scrollTop = 0;

    // Sem o fechar, as ações encostam na borda do conteúdo (clientWidth desconta a barra de rolagem).
    drawer.setAttribute("no-close-button", "");
    await waitFor(() => expect(part("console-close")).toBeNull());
    await near(rect(actions).right, rect(drawer).left + drawer.clientLeft + drawer.clientWidth - 24);
    drawer.removeAttribute("no-close-button");

    // Sem ações, o cabeçalho volta ao que era.
    actions.remove();
    await waitFor(() => expect(header.className).not.toContain("ark:-mt-12"));
    await expect(title.className).not.toContain("--ark-drawer-actions-width");
    await expect(drawer.style.getPropertyValue("--ark-drawer-actions-width")).toBe("");
    await near(rect(header).top, rect(drawer).top);
    drawer.appendChild(actions);
    await waitFor(() => expect(header.className).toContain("ark:-mt-12"));

    // Overlay: a mesma linha; o foco inicial vai ao corpo, não às ações nem ao chrome.
    const details = part("detalhes") as DrawerEl;
    details.show();
    await waitFor(() => expect(details.matches(":popover-open")).toBe(true));
    await settled(details);
    await waitFor(() =>
      expect(Math.abs(middle(part("detalhes-actions")) - middle(part("detalhes-title")))).toBeLessThanOrEqual(1)
    );
    await near(rect(part("detalhes-close")).left - rect(part("detalhes-actions")).right, 16);
    await expect(details.ownerDocument.activeElement).toHaveAttribute("placeholder", "primeiro focável");
    details.close();
    await waitFor(() => expect(details.matches(":popover-open")).toBe(false));
  }
};

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

// Inline: sem popover, role=region, no fluxo; open alterna a exibição com a animação de slide e a altura
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
    main.append(toggle, "Fechada no início: o play abre e fecha pela propriedade open.");
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

    // Esc não fecha o inline; open=false anima a saída e esconde.
    drawer.focus();
    await userEvent.keyboard("{Escape}");
    await expect(drawer).toHaveAttribute("open");
    drawer.open = "false" as unknown as boolean;
    await waitFor(() => expect(getComputedStyle(drawer).display).toBe("none"));
  }
};

// Como no ark-dialog: inserida já aberta, a gaveta escolhe o foco inicial depois de os filhos conectarem, e o
// ark-input do corpo recebe o foco no lugar do botão de fechar.
export const OpenOnInsertFocusesField = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const drawer = document.createElement("ark-drawer") as DrawerEl;
    drawer.setAttribute("label", "Filtros");
    drawer.setAttribute("open", "");
    const field = document.createElement("ark-input");
    field.setAttribute("label", "Nome");
    drawer.append(field);
    let opened = 0;
    drawer.addEventListener("ark-open", () => opened++);
    (canvasElement.firstElementChild as HTMLElement).append(drawer);

    await waitFor(() => expect(document.activeElement === field.querySelector("input")).toBe(true));
    await expect(opened).toBe(1);
    drawer.close();
    await waitFor(() => expect(drawer).not.toHaveAttribute("data-ark-state"));
  }
};

// O trap é o mesmo do ark-dialog: foco levado para fora volta para onde estava na gaveta, não para o botão de fechar
// do cabeçalho (o primeiro focável do painel).
export const EscapedFocusReturnsWhereItWas = {
  render: () => {
    const wrap = document.createElement("div");
    const drawer = createDrawer({ label: "Filtros", lang: "pt" });
    wrap.append(createOpener(drawer, "Abrir"), drawer);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const drawer = canvasElement.querySelector("ark-drawer") as DrawerEl;
    const opener = canvas.getByText("Abrir");

    await userEvent.click(opener);
    const field = drawer.querySelector("input") as HTMLInputElement;
    await expect(field).toHaveFocus();

    opener.focus();
    await expect(field).toHaveFocus();

    const cancel = within(drawer).getByText("Cancelar");
    cancel.focus();
    opener.focus();
    await expect(cancel).toHaveFocus();

    drawer.close();
    await waitFor(() => expect(drawer).not.toHaveAttribute("data-ark-state"));
  }
};

// Como no ark-dialog: o foco inicial só deixa de fora o cabeçalho da própria gaveta. A caixa de um ark-checkbox no
// começo do corpo é chrome do checkbox, e era pulada em favor do rodapé.
export const InitialFocusOnDrawnControl = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const drawer = createDrawer({ label: "Filtros", lang: "pt" });
    const box = document.createElement("ark-checkbox");
    box.setAttribute("label", "Só ativos");
    drawer.insertBefore(box, drawer.firstChild);
    (canvasElement.firstElementChild as HTMLElement).append(drawer);

    drawer.show();
    await expect(box.querySelector("button")).toHaveFocus();

    drawer.close();
    await waitFor(() => expect(drawer).not.toHaveAttribute("data-ark-state"));
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
