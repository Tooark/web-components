import type { ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkCommandPalette",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Paleta de comandos sobre a Popover API. O host `ark-command-palette` e o painel (role=dialog, scrim, focus trap); o campo de busca e um `ark-input` proprio (combobox) e os filhos `ark-command-item` ficam onde estao, agrupados por `group` com cabecalhos proprios ordenados por CSS. `filter` filtra localmente pelo label; `ark-query` sai com debounce para busca assincrona. `hotkey` abre de qualquer lugar da pagina."
      }
    }
  },
  argTypes: {
    placeholder: { control: "text" },
    hotkey: { control: "text" },
    filter: { control: "boolean" },
    queryDelay: { control: "number" },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    placeholder: "",
    hotkey: "mod+k",
    filter: true,
    queryDelay: 150,
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  placeholder: string;
  hotkey: string;
  filter: boolean;
  queryDelay: number;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
};

type PaletteEl = HTMLElement & { open: boolean; query: string; show: () => void; close: () => void };

type Command = { value: string; label: string; group?: string; shortcut?: string; disabled?: boolean };

const COMMANDS: Command[] = [
  { value: "new-request", label: "Nova requisicao", group: "Requisicoes", shortcut: "Ctrl N" },
  { value: "duplicate", label: "Duplicar requisicao", group: "Requisicoes" },
  { value: "send", label: "Enviar", group: "Requisicoes", shortcut: "Ctrl Enter" },
  { value: "switch-workspace", label: "Trocar de workspace", group: "Workspace", shortcut: "Ctrl K" },
  { value: "settings", label: "Configuracoes do workspace", group: "Workspace" },
  { value: "archive", label: "Arquivar workspace", group: "Workspace", disabled: true },
  { value: "docs", label: "Documentacao", group: "Ajuda" }
];

function createItem(command: Command): HTMLElement {
  const item = document.createElement("ark-command-item");
  item.setAttribute("value", command.value);
  if (command.group) item.setAttribute("group", command.group);
  if (command.disabled) item.setAttribute("disabled", "");
  item.append(command.label);
  if (command.shortcut) {
    const trailing = document.createElement("span");
    trailing.setAttribute("slot", "trailing");
    for (const key of command.shortcut.split(" ")) {
      const kbd = document.createElement("ark-kbd");
      kbd.setAttribute("size", "sm");
      kbd.textContent = key;
      trailing.appendChild(kbd);
    }
    item.appendChild(trailing);
  }
  return item;
}

function createPalette(args: Partial<StoryArgs>, commands: Command[] = COMMANDS): PaletteEl {
  const palette = document.createElement("ark-command-palette") as PaletteEl;
  palette.setAttribute("label", "Comandos");
  if (args.placeholder) palette.setAttribute("placeholder", args.placeholder);
  if (args.hotkey) palette.setAttribute("hotkey", args.hotkey);
  if (args.filter) palette.setAttribute("filter", "");
  if (args.queryDelay !== undefined) palette.setAttribute("query-delay", String(args.queryDelay));
  if (args.lang) palette.setAttribute("lang", args.lang);
  if (args.theme) palette.setAttribute("theme", args.theme);
  if (args.testid) palette.setAttribute("testid", args.testid);
  for (const command of commands) palette.appendChild(createItem(command));
  return palette;
}

function createScene(palette: PaletteEl, hint: string): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col items-start gap-3 text-sm";
  const open = document.createElement("ark-button");
  open.setAttribute("variant", "outline");
  open.setAttribute("size", "sm");
  open.textContent = "Abrir paleta";
  open.addEventListener("click", () => palette.show());
  const text = document.createElement("p");
  text.style.color = "var(--ark-color-fg-muted)";
  text.textContent = hint;
  const result = document.createElement("p");
  result.setAttribute("data-result", "");
  palette.addEventListener("ark-select", (event) => {
    result.textContent = `Selecionado: ${(event as CustomEvent<{ value: string }>).detail.value}`;
  });
  wrap.append(open, text, result, palette);
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) =>
    createScene(createPalette(args), "Ou pressione Ctrl+K / Cmd+K em qualquer lugar da pagina.")
};

export const SlashHotkey = {
  render: () => {
    const wrap = createScene(
      createPalette({ hotkey: "/", filter: true, lang: "pt" }),
      'Pressione "/" fora de um campo de texto. No campo abaixo a tecla e digitada normalmente.'
    );
    const input = document.createElement("ark-input");
    input.setAttribute("label", "Um campo qualquer");
    input.setAttribute("size", "sm");
    wrap.insertBefore(input, wrap.lastElementChild);
    return wrap;
  }
};

// Busca assincrona: sem `filter`, o app escuta ark-query e troca os itens (aqui com um timeout).
export const AsyncQuery = {
  render: () => {
    const palette = createPalette({ hotkey: "mod+k", lang: "pt", queryDelay: 200 }, [
      { value: "recent-1", label: "GET /users", group: "Recentes" },
      { value: "recent-2", label: "POST /login", group: "Recentes" }
    ]);
    palette.addEventListener("ark-query", (event) => {
      const query = (event as CustomEvent<{ query: string }>).detail.query.trim();
      window.setTimeout(() => {
        for (const item of Array.from(palette.querySelectorAll("ark-command-item"))) item.remove();
        const results: Command[] = query
          ? ["GET", "POST", "PUT"].map((method) => ({
              value: `${method}-${query}`,
              label: `${method} /${query}`,
              group: "Resultados"
            }))
          : [
              { value: "recent-1", label: "GET /users", group: "Recentes" },
              { value: "recent-2", label: "POST /login", group: "Recentes" }
            ];
        for (const command of results) palette.appendChild(createItem(command));
      }, 300);
    });
    return createScene(palette, "Digite um caminho: os resultados chegam 300 ms depois, como numa API.");
  }
};

const settled = (el: HTMLElement) => waitFor(() => expect(el.getAnimations()).toHaveLength(0));

// Dialogo em popover com o combobox focado; filtro por label com grupos que somem junto; setas movem a ativa
// (aria-activedescendant, pulando desabilitada, dando a volta); Enter seleciona e fecha; ark-query com
// debounce; hotkey abre de fora e e ignorado num campo de texto; Esc fecha.
export const Navigation = {
  render: () => {
    const wrap = createScene(
      createPalette({ hotkey: "mod+k", filter: true, lang: "pt", queryDelay: 10 }),
      "Teclado: setas, Home/End, Enter, Esc; Ctrl+K abre de fora, mas nao dentro do campo acima."
    );
    const field = document.createElement("input");
    field.id = "campo-externo";
    field.setAttribute("aria-label", "Campo externo");
    wrap.prepend(field);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const palette = canvasElement.querySelector("ark-command-palette") as PaletteEl;
    const events: string[] = [];
    for (const name of ["ark-open", "ark-close", "ark-select", "ark-query"]) {
      palette.addEventListener(name, (event) => {
        const detail = (event as CustomEvent<{ value?: string; query?: string }>).detail;
        events.push(
          name +
            (detail?.value !== undefined ? `:${detail.value}` : detail?.query !== undefined ? `:${detail.query}` : "")
        );
      });
    }
    const items = () => Array.from(palette.querySelectorAll("ark-command-item")) as HTMLElement[];
    const visible = () =>
      items()
        .filter((item) => !item.hidden)
        .map((item) => item.getAttribute("value"));
    const groups = () =>
      Array.from(palette.querySelectorAll('[data-ark="command-palette-group"]')).map((el) => el.textContent);

    await expect(palette).not.toBeVisible();
    await userEvent.click(canvas.getByText("Abrir paleta"));
    await expect(palette.matches(":popover-open")).toBe(true);
    await expect(palette).toHaveAttribute("role", "dialog");
    await expect(palette).toHaveAccessibleName("Comandos");
    const combobox = canvas.getByRole("combobox");
    await expect(combobox).toHaveFocus();
    await expect(combobox).toHaveAttribute("aria-expanded", "true");
    await expect(combobox).toHaveAttribute("placeholder", "Buscar");
    await expect(groups()).toEqual(["Requisicoes", "Workspace", "Ajuda"]);
    await expect(visible()).toHaveLength(7);
    await expect(items()[0]).toHaveAttribute("aria-selected", "true");
    await expect(combobox).toHaveAttribute("aria-activedescendant", items()[0].id);
    await expect(events).toEqual(["ark-open"]);
    await settled(palette);

    // Ordem visual: cabecalho de grupo antes dos itens do grupo.
    const header = palette.querySelector('[data-ark="command-palette-group"]') as HTMLElement;
    await expect(header.getBoundingClientRect().bottom).toBeLessThanOrEqual(items()[0].getBoundingClientRect().top + 1);
    await expect(combobox.getBoundingClientRect().top).toBeLessThan(header.getBoundingClientRect().top);

    // Filtro por label, sem acento nem caixa; grupos vazios somem; vazio mostra a mensagem.
    await userEvent.type(combobox, "WORKSPACE");
    await expect(visible()).toEqual(["switch-workspace", "settings", "archive"]);
    await expect(groups()).toEqual(["Workspace"]);
    await expect(items()[3]).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(events.at(-1)).toBe("ark-query:WORKSPACE"));
    await userEvent.clear(combobox);
    await userEvent.type(combobox, "zzz");
    await expect(visible()).toHaveLength(0);
    await expect(palette.querySelector('[data-ark="command-palette-empty"]')).toBeVisible();
    await expect(palette.querySelector('[data-ark="command-palette-empty"]')?.textContent).toBe("Nenhum resultado");
    await userEvent.clear(combobox);
    await expect(visible()).toHaveLength(7);

    // Setas: pulam a desabilitada e dao a volta; Home/End.
    await userEvent.keyboard("{ArrowUp}");
    await expect(combobox).toHaveAttribute("aria-activedescendant", items()[6].id);
    await userEvent.keyboard("{ArrowUp}");
    await expect(combobox).toHaveAttribute("aria-activedescendant", items()[4].id);
    await userEvent.keyboard("{Home}");
    await expect(combobox).toHaveAttribute("aria-activedescendant", items()[0].id);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(combobox).toHaveAttribute("aria-activedescendant", items()[2].id);

    // Enter seleciona a ativa e fecha.
    await userEvent.keyboard("{Enter}");
    await expect(events).toContain("ark-select:send");
    await waitFor(() => expect(palette.matches(":popover-open")).toBe(false));
    await expect(events.at(-1)).toBe("ark-close");
    await expect((canvasElement.querySelector("[data-result]") as HTMLElement).textContent).toBe("Selecionado: send");

    // Hotkey de fora abre; num campo de texto e ignorado; Esc fecha.
    (document.getElementById("campo-externo") as HTMLInputElement).focus();
    await userEvent.keyboard("{Control>}k{/Control}");
    await expect(palette.open).toBe(false);
    (document.getElementById("campo-externo") as HTMLInputElement).blur();
    await userEvent.keyboard("{Control>}k{/Control}");
    await expect(palette.open).toBe(true);
    await waitFor(() => expect(palette.matches(":popover-open")).toBe(true));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(palette.matches(":popover-open")).toBe(false));

    // Clique num item seleciona.
    palette.show();
    await waitFor(() => expect(palette.matches(":popover-open")).toBe(true));
    await settled(palette);
    await userEvent.click(canvas.getByRole("option", { name: "Documentacao" }));
    await expect(events.at(-2)).toBe("ark-select:docs");
    await waitFor(() => expect(palette.matches(":popover-open")).toBe(false));
  }
};

// Wrappers de framework (o `<ark-command-item-wrapper>` do Angular) ficam entre a paleta e o item, e o item pode
// entrar no wrapper depois de o wrapper entrar na paleta.
export const WrappedItems = {
  render: () => {
    const palette = createPalette({ filter: true, lang: "pt", queryDelay: 10 }, []);
    return createScene(palette, "Itens dentro de um elemento intermediario, como o wrapper do Angular.");
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const palette = canvasElement.querySelector("ark-command-palette") as PaletteEl;
    for (const command of COMMANDS) {
      const wrapper = document.createElement("ark-command-item-wrapper");
      wrapper.style.display = "contents";
      palette.appendChild(wrapper);
      wrapper.appendChild(createItem(command));
    }
    const items = () => Array.from(palette.querySelectorAll("ark-command-item")) as HTMLElement[];
    const visible = () =>
      items()
        .filter((item) => !item.hidden)
        .map((item) => item.getAttribute("value"));

    palette.show();
    await settled(palette);
    const combobox = canvas.getByRole("combobox");
    await expect(palette.querySelector('[data-ark="command-palette-empty"]')).not.toBeVisible();
    await expect(
      Array.from(palette.querySelectorAll('[data-ark="command-palette-group"]')).map((el) => el.textContent)
    ).toEqual(["Requisicoes", "Workspace", "Ajuda"]);
    await expect(items()[0]).toHaveAttribute("aria-selected", "true");

    await userEvent.type(combobox, "workspace");
    await expect(visible()).toEqual(["switch-workspace", "settings", "archive"]);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(canvasElement.querySelector("[data-result]")?.textContent).toBe("Selecionado: settings");
  }
};

export const TestHooks = {
  render: () =>
    createScene(createPalette({ lang: "pt", testid: "paleta" }), "Hooks: abra a paleta e inspecione os data-ark."),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const palette = canvasElement.querySelector("ark-command-palette") as PaletteEl;
    palette.show();
    await expect(palette).toHaveAttribute("data-testid", "paleta");
    for (const part of ["input", "list", "group", "empty"]) {
      await expect(canvasElement.querySelector(`[data-ark="command-palette-${part}"]`)).toHaveAttribute(
        "data-testid",
        `paleta-${part}`
      );
    }
    await expect(canvasElement.querySelectorAll('[data-ark="command-item"]')).toHaveLength(7);
    palette.close();
  }
};
