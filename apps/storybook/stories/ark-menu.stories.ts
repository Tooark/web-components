import type { ArkIntent, ArkMenuAlign, ArkMenuDirection, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkMenu",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Menu suspenso e de contexto: o host `ark-menu` e o proprio painel (`role="menu"`), aberto como `popover="auto"` (top layer, light dismiss e Esc nativos), e cada `ark-menu-item` e o proprio item (icone e texto como filhos, `slot="trailing"` ao fim). O gatilho e referenciado por `for`: o menu escreve aria-* nele, alterna no clique e abre com as setas. `align` e `direction` posicionam a partir do gatilho, com flip quando nao cabe; `openAt(x, y)` abre num ponto. Setas, Home, End, Enter/Espaco e Esc; emite `ark-select` com `detail: { value }`, `ark-open` e `ark-close`.'
      }
    }
  },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "end"] },
    direction: { control: "inline-radio", options: ["down", "up"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    align: "start",
    direction: "down",
    size: "md",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  align: ArkMenuAlign;
  direction: ArkMenuDirection;
  size: ArkSize;
  theme: ArkTheme;
  testid?: string;
};

type MenuEl = HTMLElement & { show(): void; hide(): void; openAt(x: number, y: number): void };

type ItemSpec = {
  value?: string;
  label?: string;
  intent?: ArkIntent;
  disabled?: boolean;
  checked?: boolean;
  divider?: boolean;
  static?: boolean;
  trailing?: string;
  testid?: string;
};

const USER_MENU: ItemSpec[] = [
  { static: true, label: "Paulo Freitas" },
  { divider: true },
  { value: "rename", label: "Renomear", trailing: "F2", testid: "item-rename" },
  { value: "duplicate", label: "Duplicar", trailing: "Ctrl+D" },
  { value: "share", label: "Compartilhar", disabled: true },
  { value: "pinned", label: "Fixar no topo", checked: true },
  { divider: true },
  { value: "delete", label: "Excluir", intent: "danger", testid: "item-delete" }
];

let seq = 0;

function createItem(spec: ItemSpec): HTMLElement {
  const item = document.createElement("ark-menu-item");
  if (spec.value) item.setAttribute("value", spec.value);
  if (spec.intent) item.setAttribute("intent", spec.intent);
  if (spec.disabled) item.setAttribute("disabled", "");
  if (spec.checked !== undefined) item.setAttribute("checked", spec.checked ? "" : "false");
  if (spec.divider) item.setAttribute("divider", "");
  if (spec.static) item.setAttribute("static", "");
  if (spec.testid) item.setAttribute("testid", spec.testid);
  if (spec.label) {
    if (spec.static) {
      const name = document.createElement("span");
      // Conteudo do usuario: cor pelo token, que segue o color-scheme do host (tema escuro incluso).
      name.className = "font-medium";
      name.style.color = "var(--ark-color-fg)";
      name.textContent = spec.label;
      const mail = document.createElement("span");
      mail.textContent = "paulo@exemplo.com";
      item.append(name, mail);
    } else {
      item.appendChild(document.createTextNode(spec.label));
    }
  }
  if (spec.trailing) {
    const trailing = document.createElement("kbd");
    trailing.setAttribute("slot", "trailing");
    trailing.textContent = spec.trailing;
    item.appendChild(trailing);
  }
  return item;
}

function createTrigger(id: string, text = "Acoes"): HTMLElement {
  const button = document.createElement("ark-button");
  button.id = id;
  button.setAttribute("variant", "outline");
  button.setAttribute("size", "sm");
  button.textContent = text;
  return button;
}

function createMenu(args: Partial<StoryArgs>, forId: string | null, items: ItemSpec[] = USER_MENU): MenuEl {
  const menu = document.createElement("ark-menu") as MenuEl;
  if (forId) menu.setAttribute("for", forId);
  if (args.align) menu.setAttribute("align", args.align);
  if (args.direction) menu.setAttribute("direction", args.direction);
  if (args.size) menu.setAttribute("size", args.size);
  if (args.theme) menu.setAttribute("theme", args.theme);
  if (args.testid) menu.setAttribute("testid", args.testid);
  for (const spec of items) menu.appendChild(createItem(spec));
  return menu;
}

function createScene(args: Partial<StoryArgs>, items?: ItemSpec[], triggerText?: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-wrap items-center gap-3";
  const id = `menu-trigger-${++seq}`;
  wrap.append(createTrigger(id, triggerText), createMenu(args, id, items));
  return wrap;
}

function popoverOpen(el: Element): boolean {
  return el.matches(":popover-open");
}

export const Playground = {
  render: (args: StoryArgs) => createScene(args)
};

export const DirectionsAndAlign = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-3";
    for (const [direction, align] of [
      ["down", "start"],
      ["down", "end"],
      ["up", "start"],
      ["up", "end"]
    ] as [ArkMenuDirection, ArkMenuAlign][]) {
      const id = `menu-trigger-${++seq}`;
      wrap.append(createTrigger(id, `${direction} / ${align}`), createMenu({ direction, align }, id));
    }
    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-3";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      const id = `menu-trigger-${++seq}`;
      wrap.append(createTrigger(id, size), createMenu({ size }, id));
    }
    return wrap;
  }
};

export const ContextMenu = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";
    const area = document.createElement("div");
    area.className =
      "flex h-40 w-80 select-none items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500";
    area.textContent = "Clique com o botao direito";
    area.setAttribute("data-area", "");
    const menu = createMenu({}, null, USER_MENU.slice(2));
    area.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      menu.openAt(event.clientX, event.clientY);
    });
    wrap.append(area, menu);
    return wrap;
  },
  // openAt abre no ponto, troca para popover manual enquanto aberto e fecha no clique fora.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const menu = canvasElement.querySelector("ark-menu") as MenuEl;
    const area = canvasElement.querySelector("[data-area]") as HTMLElement;
    const rect = area.getBoundingClientRect();
    const x = Math.round(rect.left + 40);
    const y = Math.round(rect.top + 30);

    await userEvent.pointer({ keys: "[MouseRight]", target: area, coords: { x, y } });
    await expect(menu).toHaveAttribute("open");
    await expect(menu).toHaveAttribute("popover", "manual");
    expect(popoverOpen(menu)).toBe(true);
    expect(menu.style.left).toBe(`${x}px`);
    expect(menu.style.top).toBe(`${y}px`);
    await expect(menu).toHaveAttribute("data-ark-side", "bottom");
    expect(menu.contains(document.activeElement)).toBe(true);

    // Reaberto noutro ponto sem fechar: so reposiciona.
    menu.openAt(x + 20, y + 10);
    expect(menu.style.left).toBe(`${x + 20}px`);

    await userEvent.pointer({ keys: "[MouseLeft]", target: canvasElement });
    await expect(menu).not.toHaveAttribute("open");
    await expect(menu).toHaveAttribute("popover", "auto");
    expect(popoverOpen(menu)).toBe(false);
  }
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl p-4";
    wrap.style.background = "oklch(20.8% 0.042 265.755)";
    const id = `menu-trigger-${++seq}`;
    const trigger = createTrigger(id);
    trigger.setAttribute("theme", "dark");
    wrap.append(trigger, createMenu({ theme: "dark" }, id));
    return wrap;
  }
};

export const OpensSelectsAndCloses = {
  render: () => createScene({}),
  // Clique no gatilho abre com a semantica de menu e foca o primeiro item; escolher um item emite ark-select,
  // fecha e devolve o foco ao gatilho; o gatilho alterna.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const menu = canvasElement.querySelector("ark-menu") as MenuEl;
    const trigger = canvas.getByText("Acoes");
    const events: string[] = [];
    menu.addEventListener("ark-open", () => events.push("open"));
    menu.addEventListener("ark-close", () => events.push("close"));
    menu.addEventListener("ark-select", (event) => {
      events.push(`select:${(event as CustomEvent<{ value: string }>).detail.value}`);
    });

    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-controls", menu.id);
    await expect(menu).toHaveAttribute("role", "menu");
    await expect(menu).toHaveAttribute("aria-labelledby", trigger.id);
    await expect(menu).toHaveAttribute("popover", "auto");

    await userEvent.click(trigger);
    await expect(menu).toHaveAttribute("open");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(popoverOpen(menu)).toBe(true);
    await expect(menu).toHaveAttribute("data-ark-side", "bottom");
    await expect(menu).toHaveAttribute("data-ark-align", "start");
    const rename = menu.querySelector('[data-testid="item-rename"]') as HTMLElement;
    expect(document.activeElement).toBe(rename);
    expect(events).toEqual(["open"]);

    await userEvent.click(rename);
    expect(events).toEqual(["open", "select:rename", "close"]);
    await expect(menu).not.toHaveAttribute("open");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(popoverOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(trigger);

    // O gatilho alterna: abre e fecha.
    await userEvent.click(trigger);
    await expect(menu).toHaveAttribute("open");
    await userEvent.click(trigger);
    await expect(menu).not.toHaveAttribute("open");
    expect(events).toEqual(["open", "select:rename", "close", "open", "close"]);
  }
};

export const KeyboardNavigation = {
  render: () => createScene({}),
  // Setas no gatilho abrem com o foco no primeiro/ultimo item; setas ciclam pulando desabilitados, divisores e
  // estaticos; Home/End; Enter seleciona; Esc fecha e devolve o foco ao gatilho.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const menu = canvasElement.querySelector("ark-menu") as MenuEl;
    const trigger = canvas.getByText("Acoes");
    const byValue = (value: string): HTMLElement => menu.querySelector(`[value="${value}"]`) as HTMLElement;
    const selected: string[] = [];
    menu.addEventListener("ark-select", (event) =>
      selected.push((event as CustomEvent<{ value: string }>).detail.value)
    );

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(menu).toHaveAttribute("open");
    expect(document.activeElement).toBe(byValue("rename"));

    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(byValue("duplicate"));
    // "share" esta desabilitado: pulado.
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(byValue("pinned"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(byValue("delete"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(byValue("rename"));
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(byValue("delete"));
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(byValue("rename"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(byValue("delete"));

    await userEvent.keyboard("{Enter}");
    expect(selected).toEqual(["delete"]);
    await expect(menu).not.toHaveAttribute("open");
    expect(document.activeElement).toBe(trigger);

    await userEvent.keyboard("{ArrowUp}");
    await expect(menu).toHaveAttribute("open");
    expect(document.activeElement).toBe(byValue("delete"));
    await userEvent.keyboard("{Escape}");
    await expect(menu).not.toHaveAttribute("open");
    expect(popoverOpen(menu)).toBe(false);
    expect(document.activeElement).toBe(trigger);
  }
};

export const ItemKinds = {
  render: () => createScene({}),
  // Papeis por tipo: menuitem, menuitemcheckbox com aria-checked e check, separator e conteudo estatico sem role.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const menu = canvasElement.querySelector("ark-menu") as MenuEl;
    const items = Array.from(menu.querySelectorAll("ark-menu-item"));
    const [user, divider, rename, , share, pinned] = items;

    await expect(user).toHaveAttribute("role", "presentation");
    expect(user.hasAttribute("tabindex")).toBe(false);
    await expect(divider).toHaveAttribute("role", "separator");
    await expect(rename).toHaveAttribute("role", "menuitem");
    await expect(rename).toHaveAttribute("tabindex", "-1");
    await expect(share).toHaveAttribute("aria-disabled", "true");
    await expect(pinned).toHaveAttribute("role", "menuitemcheckbox");
    await expect(pinned).toHaveAttribute("aria-checked", "true");
    expect(pinned.querySelector('[data-ark="menu-item-check"]')).not.toBeNull();
    expect(rename.querySelector('[slot="trailing"]')?.textContent).toBe("F2");

    pinned.setAttribute("checked", "false");
    await expect(pinned).toHaveAttribute("aria-checked", "false");
    expect(pinned.querySelector('[data-ark="menu-item-check"]')).toBeNull();

    // Itens desabilitados nao selecionam.
    menu.show();
    const selected: string[] = [];
    menu.addEventListener("ark-select", (event) =>
      selected.push((event as CustomEvent<{ value: string }>).detail.value)
    );
    share.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(selected).toEqual([]);
    await expect(menu).toHaveAttribute("open");
    menu.hide();
  }
};

export const LateTriggerAndNativeClose = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-3";
    const menu = createMenu({}, "late-trigger");
    // O gatilho so entra no DOM ao clicar aqui: o menu ja existe e o encontra quando ele aparece.
    const mount = document.createElement("ark-button");
    mount.setAttribute("size", "sm");
    mount.textContent = "Montar gatilho";
    mount.addEventListener("click", () => {
      if (!wrap.querySelector("#late-trigger")) wrap.insertBefore(createTrigger("late-trigger", "Tardio"), menu);
    });
    wrap.append(mount, menu);
    return wrap;
  },
  // O gatilho pode montar depois do menu; fechar pelo navegador (light dismiss, popovertarget) sincroniza o estado.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const menu = canvasElement.querySelector("ark-menu") as MenuEl;
    const events: string[] = [];
    menu.addEventListener("ark-open", () => events.push("open"));
    menu.addEventListener("ark-close", () => events.push("close"));

    await userEvent.click(within(canvasElement).getByText("Montar gatilho"));
    const trigger = canvasElement.querySelector("#late-trigger") as HTMLElement;
    await waitFor(() => expect(trigger).toHaveAttribute("aria-haspopup", "menu"));

    await userEvent.click(trigger);
    await expect(menu).toHaveAttribute("open");
    expect(events).toEqual(["open"]);

    // Escondido pelo navegador, como no light dismiss: o toggle nativo fecha o estado e avisa.
    menu.hidePopover();
    await waitFor(() => expect(menu).not.toHaveAttribute("open"));
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(events).toEqual(["open", "close"]);

    // O atributo open tambem abre e fecha.
    menu.setAttribute("open", "");
    expect(popoverOpen(menu)).toBe(true);
    menu.removeAttribute("open");
    expect(popoverOpen(menu)).toBe(false);
    expect(events).toEqual(["open", "close", "open", "close"]);
  }
};

export const FlipsWhenThereIsNoRoom = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-center gap-3";
    // Colado no fundo da viewport: nao ha espaco embaixo, o menu vira para cima.
    wrap.style.cssText = "position: fixed; bottom: 8px; left: 8px;";
    const id = `menu-trigger-${++seq}`;
    wrap.append(createTrigger(id, "No fundo"), createMenu({ direction: "down", align: "start" }, id));
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const menu = canvasElement.querySelector("ark-menu") as MenuEl;
    const trigger = canvas.getByText("No fundo");

    await userEvent.click(trigger);
    await expect(menu).toHaveAttribute("data-ark-side", "top");
    expect(menu.style.transformOrigin).toBe("left bottom");
    const menuRect = menu.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    expect(menuRect.bottom).toBeLessThanOrEqual(triggerRect.top);
    menu.hide();
  }
};

export const TestHooks = {
  render: () => createScene({ testid: "user-menu" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const menu = canvasElement.querySelector("ark-menu")!;

    await expect(menu).toHaveAttribute("data-ark", "menu");
    await expect(menu).toHaveAttribute("data-testid", "user-menu");
    const rename = menu.querySelector('[data-testid="item-rename"]')!;
    await expect(rename).toHaveAttribute("data-ark", "menu-item");
    await expect(menu.querySelector('[data-testid="item-delete"]')).toHaveAttribute("data-ark", "menu-item");
    await expect(menu.querySelector("ark-menu-item[divider]")).toHaveAttribute("data-ark", "menu-divider");
    await expect(menu.querySelector("ark-menu-item[static]")).toHaveAttribute("data-ark", "menu-static");
    await expect(menu.querySelector("ark-menu-item[checked] > [data-ark-chrome]")).toHaveAttribute(
      "data-ark",
      "menu-item-check"
    );
  }
};
