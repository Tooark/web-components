import { type ArkDialogSize, type ArkTheme, isScrollLocked } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkDialog",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Dialogo modal: o host `ark-dialog` e o proprio painel, aberto como `popover="manual"` (top layer, `::backdrop` como scrim, sem portal nem z-index). Os filhos sao o corpo e ficam onde estao; um filho `slot="footer"` vira o rodape. O componente cria o cabecalho (titulo `h2` de `label` + botao de fechar) como primeiro filho. `open` e a fonte da verdade (`show()`/`close(reason)` so o alternam) e a saida anima antes de esconder. Foco preso pelo `trapFocus` de core (Tab cicla, clique fora e cancelado), Esc e scrim fecham salvo `persistent`, foco volta ao opener. Emite `ark-open` e `ark-close` com `detail.reason`.'
      }
    }
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl", "full"] },
    width: { control: "text", description: "Largura propria (comprimento CSS; numero vira px), acima do preset" },
    height: {
      control: "text",
      description: "Altura propria (comprimento CSS; numero vira px); sem ela, a do conteudo"
    },
    label: { control: "text", description: "Titulo e nome acessivel (aria-labelledby)" },
    persistent: { control: "boolean", description: "Esc e clique no scrim nao fecham" },
    noCloseButton: { control: "boolean", description: "Sem o botao de fechar do cabecalho" },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    lang: { control: "select", options: ["en", "pt", "es"] }
  },
  args: {
    size: "md",
    width: "",
    height: "",
    label: "Nova requisicao",
    persistent: false,
    noCloseButton: false,
    theme: "auto",
    lang: "pt"
  }
};

export default meta;

type StoryArgs = {
  size: ArkDialogSize;
  width: string;
  height: string;
  label: string;
  persistent: boolean;
  noCloseButton: boolean;
  theme: ArkTheme;
  lang: string;
  testid?: string;
};

type DialogEl = HTMLElement & { show(): void; close(reason?: string): void };

function createField(label: string): HTMLElement {
  const input = document.createElement("ark-input");
  input.setAttribute("label", label);
  input.setAttribute("size", "sm");
  return input;
}

function createFooter(dialog: DialogEl): HTMLElement {
  const footer = document.createElement("div");
  footer.setAttribute("slot", "footer");
  for (const [text, variant] of [
    ["Cancelar", "ghost"],
    ["Salvar", "solid"]
  ]) {
    const button = document.createElement("ark-button");
    button.setAttribute("variant", variant);
    button.setAttribute("size", "sm");
    button.textContent = text;
    button.addEventListener("click", () => dialog.close());
    footer.appendChild(button);
  }
  return footer;
}

function createDialog(args: Partial<StoryArgs>, options: { footer?: boolean; body?: HTMLElement[] } = {}): DialogEl {
  const dialog = document.createElement("ark-dialog") as DialogEl;
  if (args.size) dialog.setAttribute("size", args.size);
  if (args.width) dialog.setAttribute("width", args.width);
  if (args.height) dialog.setAttribute("height", args.height);
  if (args.label) dialog.setAttribute("label", args.label);
  if (args.persistent) dialog.setAttribute("persistent", "");
  if (args.noCloseButton) dialog.setAttribute("no-close-button", "");
  if (args.theme) dialog.setAttribute("theme", args.theme);
  if (args.lang) dialog.setAttribute("lang", args.lang);
  if (args.testid) dialog.setAttribute("testid", args.testid);

  // O corpo e do usuario: aqui uma coluna com dois campos.
  const body = document.createElement("div");
  body.className = "flex flex-col gap-3";
  body.append(...(options.body ?? [createField("Nome"), createField("URL")]));
  dialog.appendChild(body);
  if (options.footer !== false) dialog.appendChild(createFooter(dialog));
  return dialog;
}

function createOpener(dialog: DialogEl, text = "Abrir"): HTMLElement {
  const button = document.createElement("ark-button");
  button.setAttribute("size", "sm");
  button.setAttribute("variant", "outline");
  button.textContent = text;
  button.addEventListener("click", () => dialog.show());
  return button;
}

function createScene(args: Partial<StoryArgs>, options?: { footer?: boolean; body?: HTMLElement[] }): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-wrap items-center gap-3";
  const dialog = createDialog(args, options);
  wrap.append(createOpener(dialog), dialog);
  return wrap;
}

function closed(dialog: HTMLElement): Promise<void> {
  return waitFor(() => expect(dialog).not.toHaveAttribute("data-ark-state"));
}

// A entrada anima scale(0.95) -> 1: medir o painel so depois da animacao.
function settled(dialog: HTMLElement): Promise<void> {
  return waitFor(() => expect(dialog.getAnimations().length).toBe(0));
}

export const Playground = {
  render: (args: StoryArgs) => createScene(args)
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-3";
    for (const size of ["sm", "md", "lg", "xl", "full"] as ArkDialogSize[]) {
      const dialog = createDialog({ size, label: `Painel ${size}`, lang: "pt" });
      wrap.append(createOpener(dialog, size), dialog);
    }
    return wrap;
  }
};

export const FullAndCustomSize = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-3";
    const full = createDialog({ size: "full", label: "Tela inteira", lang: "pt" });
    const custom = createDialog({ width: "60rem", height: "80vh", label: "60rem por 80vh", lang: "pt" });
    const capped = createDialog({ width: "5000", label: "Largura maior que a viewport", lang: "pt" });
    wrap.append(
      createOpener(full, "Full"),
      createOpener(custom, "Custom"),
      createOpener(capped, "Maior que a tela"),
      full,
      custom,
      capped
    );
    return wrap;
  },
  // size="full" ocupa a viewport sem cantos; width/height aceitam qualquer comprimento CSS (numero vira px) e
  // continuam limitados a viewport; com altura sobrando o rodape fica no fundo do painel.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [full, custom, capped] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const viewport = document.documentElement;

    await userEvent.click(canvas.getByText("Full"));
    await settled(full);
    let rect = full.getBoundingClientRect();
    expect(Math.round(rect.width)).toBe(viewport.clientWidth);
    expect(Math.round(rect.height)).toBe(viewport.clientHeight);
    expect(getComputedStyle(full).borderTopLeftRadius).toBe("0px");
    full.close();
    await closed(full);

    await userEvent.click(canvas.getByText("Custom"));
    await settled(custom);
    rect = custom.getBoundingClientRect();
    const rem = Number.parseFloat(getComputedStyle(viewport).fontSize);
    expect(Math.abs(rect.width - 60 * rem)).toBeLessThanOrEqual(1);
    expect(Math.abs(rect.height - viewport.clientHeight * 0.8)).toBeLessThanOrEqual(1);
    expect(getComputedStyle(custom).borderTopLeftRadius).not.toBe("0px");
    const footer = custom.querySelector('[slot="footer"]')!.getBoundingClientRect();
    expect(Math.abs(footer.bottom - rect.bottom)).toBeLessThanOrEqual(1.5);
    custom.close();
    await closed(custom);

    await userEvent.click(canvas.getByText("Maior que a tela"));
    expect(capped.style.getPropertyValue("--ark-dialog-width")).toBe("5000px");
    await settled(capped);
    rect = capped.getBoundingClientRect();
    expect(Math.round(rect.width)).toBe(viewport.clientWidth - 32);
    capped.close();
    await closed(capped);
  }
};

export const Persistent = {
  args: { persistent: true, label: "Confirme antes de sair" },
  render: Playground.render
};

export const LongContent = {
  render: () => {
    const paragraphs = Array.from({ length: 24 }, (_, index) => {
      const p = document.createElement("p");
      p.className = "text-sm text-slate-600";
      p.textContent = `Paragrafo ${index + 1}: o cabecalho e o rodape ficam fixos enquanto o corpo rola dentro do painel.`;
      return p;
    });
    return createScene({ label: "Termos de uso", lang: "pt" }, { body: paragraphs });
  },
  // O painel rola; cabecalho e rodape sao sticky nas bordas do painel.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;

    await userEvent.click(canvas.getByText("Abrir"));
    expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
    expect(getComputedStyle(dialog.querySelector('[data-ark="dialog-header"]')!).position).toBe("sticky");
    expect(getComputedStyle(dialog.querySelector('[slot="footer"]')!).position).toBe("sticky");

    dialog.close();
    await closed(dialog);
  }
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl p-4";
    wrap.style.background = "oklch(20.8% 0.042 265.755)";
    const dialog = createDialog({ label: "Tema escuro", theme: "dark", lang: "pt" });
    const opener = createOpener(dialog);
    opener.setAttribute("theme", "dark");
    wrap.append(opener, dialog);
    return wrap;
  }
};

export const OpensClosesAndRestoresFocus = {
  render: () => createScene({ label: "Nova requisicao", lang: "pt" }),
  // Abre no top layer com a semantica de dialogo, foca o primeiro focavel do corpo, Esc fecha e devolve o foco.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const opener = canvas.getByText("Abrir");
    const events: string[] = [];
    dialog.addEventListener("ark-open", () => events.push("open"));
    dialog.addEventListener("ark-close", (event) => {
      events.push(`close:${(event as CustomEvent<{ reason: string }>).detail.reason}`);
    });

    await userEvent.click(opener);
    await expect(dialog).toHaveAttribute("open");
    expect(dialog.matches(":popover-open")).toBe(true);
    await expect(dialog).toHaveAttribute("popover", "manual");
    await expect(dialog).toHaveAttribute("role", "dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");

    const title = dialog.querySelector('[data-ark="dialog-title"]') as HTMLElement;
    expect(title.tagName).toBe("H2");
    expect(title.textContent).toBe("Nova requisicao");
    await expect(dialog).toHaveAttribute("aria-labelledby", title.id);
    // O cabecalho e o primeiro filho, para a leitura comecar pelo titulo; o corpo do usuario vem depois.
    expect(dialog.firstElementChild).toBe(dialog.querySelector('[data-ark="dialog-header"]'));
    expect(document.activeElement).toBe(dialog.querySelector("input"));
    expect(events).toEqual(["open"]);

    await userEvent.keyboard("{Escape}");
    expect(events).toEqual(["open", "close:escape"]);
    await expect(dialog).not.toHaveAttribute("open");
    // A saida anima antes de sair do top layer.
    await expect(dialog).toHaveAttribute("data-ark-state", "closing");
    await waitFor(() => expect(dialog.matches(":popover-open")).toBe(false));
    await closed(dialog);
    expect(document.activeElement).toBe(opener);
  }
};

export const FocusTrapCycles = {
  render: () => createScene({ label: "Editar", lang: "pt" }),
  // Tab e Shift+Tab ciclam entre os focaveis do painel; foco levado para fora volta.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const opener = canvas.getByText("Abrir");

    await userEvent.click(opener);
    const [nome, url] = Array.from(dialog.querySelectorAll("input"));
    const close = dialog.querySelector('[data-ark="dialog-close"]');
    const [cancel, save] = Array.from(dialog.querySelectorAll('[slot="footer"] ark-button'));

    expect(document.activeElement).toBe(nome);
    await userEvent.tab();
    expect(document.activeElement).toBe(url);
    await userEvent.tab();
    expect(document.activeElement).toBe(cancel);
    await userEvent.tab();
    expect(document.activeElement).toBe(save);
    // Do ultimo volta ao primeiro do DOM, o botao de fechar do cabecalho.
    await userEvent.tab();
    expect(document.activeElement).toBe(close);
    await userEvent.tab();
    expect(document.activeElement).toBe(nome);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(close);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(save);

    opener.focus();
    expect(dialog.contains(document.activeElement)).toBe(true);

    dialog.close();
    await closed(dialog);
  }
};

export const BackdropClosesAndPersistentBlocks = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-3";
    const behind = document.createElement("ark-button");
    behind.setAttribute("size", "sm");
    behind.textContent = "Atras: 0";
    let count = 0;
    behind.addEventListener("click", () => {
      count += 1;
      behind.textContent = `Atras: ${count}`;
    });

    const dialog = createDialog({ label: "Confirmar", lang: "pt" });
    const persistent = createDialog({ label: "Persistente", persistent: true, lang: "pt" });
    wrap.append(createOpener(dialog), createOpener(persistent, "Abrir persistente"), behind, dialog, persistent);
    return wrap;
  },
  // Clique fora e cancelado antes de chegar a pagina e fecha pelo scrim; persistent ignora scrim e Esc.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [dialog, persistent] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const behind = canvas.getByText(/^Atras/);
    const reasons: string[] = [];
    for (const el of [dialog, persistent]) {
      el.addEventListener("ark-close", (event) =>
        reasons.push((event as CustomEvent<{ reason: string }>).detail.reason)
      );
    }

    await userEvent.click(canvas.getByText("Abrir"));
    await userEvent.click(behind);
    expect(behind.textContent).toBe("Atras: 0");
    expect(reasons).toEqual(["backdrop"]);
    await closed(dialog);

    await userEvent.click(canvas.getByText("Abrir persistente"));
    await userEvent.click(behind);
    expect(behind.textContent).toBe("Atras: 0");
    await userEvent.keyboard("{Escape}");
    await expect(persistent).toHaveAttribute("open");
    expect(reasons).toEqual(["backdrop"]);

    persistent.close();
    expect(reasons).toEqual(["backdrop", "api"]);
    await closed(persistent);
  }
};

export const CloseButtonAndReopen = {
  render: () => createScene({ label: "Editar", lang: "pt" }),
  // Botao de fechar localizado e com motivo proprio; reabrir durante a saida a abandona; no-close-button.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const reasons: string[] = [];
    dialog.addEventListener("ark-close", (event) =>
      reasons.push((event as CustomEvent<{ reason: string }>).detail.reason)
    );

    await userEvent.click(canvas.getByText("Abrir"));
    const close = dialog.querySelector('[data-ark="dialog-close"]') as HTMLElement;
    await expect(close).toHaveAttribute("aria-label", "Fechar");
    await userEvent.click(close);
    expect(reasons).toEqual(["close-button"]);
    await expect(dialog).toHaveAttribute("data-ark-state", "closing");

    dialog.show();
    await expect(dialog).toHaveAttribute("data-ark-state", "open");
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(dialog.matches(":popover-open")).toBe(true);
    await expect(dialog).toHaveAttribute("data-ark-state", "open");

    dialog.setAttribute("no-close-button", "");
    expect(dialog.querySelector('[data-ark="dialog-close"]')).toBeNull();
    await userEvent.click(canvas.getByText("Cancelar"));
    expect(reasons).toEqual(["close-button", "api"]);
    await closed(dialog);
  }
};

export const LocksPageScroll = {
  parameters: {
    docs: {
      description: {
        story:
          "Com o dialogo aberto a pagina para de rolar (`lockScroll` de core: `overflow: hidden` na raiz e `padding-right` do tamanho da barra que sumiu, exposto em `--ark-scroll-lock-gap`); a trava e liberada depois da saida. `no-scroll-lock` desliga."
      }
    }
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";
    const scene = createScene({ label: "Trava a rolagem", lang: "pt" });
    const filler = document.createElement("div");
    filler.className = "h-[140vh] rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500";
    filler.textContent = "Conteudo alto: role a pagina, abra o dialogo e a rolagem para; feche e volta.";
    wrap.append(scene, filler);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const root = document.documentElement;
    const before = root.style.overflow;

    await userEvent.click(canvas.getByText("Abrir"));
    expect(isScrollLocked()).toBe(true);
    expect(root.style.overflow).toBe("hidden");
    expect(root.style.getPropertyValue("--ark-scroll-lock-gap")).toMatch(/^\d+px$/);

    // A trava dura ate o fim da saida (o scrim ainda esta visivel enquanto anima).
    dialog.close();
    await expect(dialog).toHaveAttribute("data-ark-state", "closing");
    expect(isScrollLocked()).toBe(true);
    await closed(dialog);
    await waitFor(() => expect(isScrollLocked()).toBe(false));
    expect(root.style.overflow).toBe(before);
    expect(root.style.getPropertyValue("--ark-scroll-lock-gap")).toBe("");

    // Opt-out: a pagina continua rolando.
    dialog.setAttribute("no-scroll-lock", "");
    dialog.show();
    await expect(dialog).toHaveAttribute("data-ark-state", "open");
    expect(isScrollLocked()).toBe(false);
    expect(root.style.overflow).toBe(before);
    dialog.close();
    await closed(dialog);
  }
};

export const WarnsOnceWithoutName = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-3";
    const unnamed = createDialog({ lang: "pt" });
    const named = createDialog({ lang: "pt" });
    named.setAttribute("aria-label", "Sem titulo visivel");
    wrap.append(createOpener(unnamed, "Sem nome"), createOpener(named, "Com aria-label"), unnamed, named);
    return wrap;
  },
  // Sem label, aria-label ou aria-labelledby o componente avisa uma vez por elemento.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [unnamed, named] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const original = console.warn;
    const calls: unknown[][] = [];
    console.warn = (...args: unknown[]) => {
      calls.push(args);
    };

    try {
      unnamed.show();
      expect(calls.length).toBe(1);
      expect(String(calls[0][0])).toContain("ark-dialog");
      expect(unnamed.querySelector('[data-ark="dialog-title"]')).toBeNull();
      expect(unnamed.querySelector('[data-ark="dialog-close"]')).not.toBeNull();
      unnamed.close();
      await closed(unnamed);

      unnamed.show();
      expect(calls.length).toBe(1);
      unnamed.close();
      await closed(unnamed);

      named.show();
      expect(calls.length).toBe(1);
      await expect(named).toHaveAttribute("aria-label", "Sem titulo visivel");
      named.close();
      await closed(named);
    } finally {
      console.warn = original;
    }
  }
};

export const TestHooks = {
  render: () => createScene({ label: "Confirmar", lang: "pt", testid: "confirm" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const dialog = canvasElement.querySelector("ark-dialog")!;

    await expect(dialog).toHaveAttribute("data-ark", "dialog");
    await expect(dialog).toHaveAttribute("data-testid", "confirm");
    await expect(dialog.querySelector('[data-ark="dialog-header"]')).toHaveAttribute("data-testid", "confirm-header");
    await expect(dialog.querySelector('[data-ark="dialog-title"]')).toHaveAttribute("data-testid", "confirm-title");
    await expect(dialog.querySelector('[data-ark="dialog-close"]')).toHaveAttribute("data-testid", "confirm-close");
    // O rodape e o filho slot="footer" do usuario, marcado no lugar.
    await expect(dialog.querySelector('[slot="footer"]')).toHaveAttribute("data-ark", "dialog-footer");
    await expect(dialog.querySelector('[slot="footer"]')).toHaveAttribute("data-testid", "confirm-footer");
  }
};
