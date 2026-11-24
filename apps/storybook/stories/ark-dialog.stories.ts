import { type ArkDialogSize, type ArkTheme, isScrollLocked, toast } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkDialog",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Diálogo modal: o host `ark-dialog` é o próprio painel, aberto como `popover="manual"` (top layer, `::backdrop` como scrim, sem portal nem z-index). Os filhos são o corpo e ficam onde estão; um filho `slot="footer"` vira o rodapé. O componente cria o cabeçalho (título `h2` de `label` + botão de fechar) como primeiro filho. `open` é a fonte da verdade (`show()`/`close(reason)` só o alternam) e a saída anima antes de esconder. Foco preso pelo `trapFocus` de core (Tab cicla, clique fora é cancelado), Esc e scrim fecham salvo `persistent`, foco volta ao opener. Emite `ark-open` e `ark-close` com `detail.reason`.'
      }
    }
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl", "full"] },
    width: { control: "text", description: "Largura própria (comprimento CSS; número vira px), acima do preset" },
    height: {
      control: "text",
      description: "Altura própria (comprimento CSS; número vira px); sem ela, a do conteúdo"
    },
    label: { control: "text", description: "Título e nome acessível (aria-labelledby)" },
    persistent: { control: "boolean", description: "Esc e clique no scrim não fecham" },
    noCloseButton: { control: "boolean", description: "Sem o botão de fechar do cabeçalho" },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    lang: { control: "select", options: ["en", "pt", "es"] }
  },
  args: {
    size: "md",
    width: "",
    height: "",
    label: "Nova requisição",
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

  // O corpo é do usuário: aqui uma coluna com dois campos.
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

// A entrada anima scale(0.95) -> 1: medir o painel só depois da animação.
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
  // size="full" ocupa a viewport sem cantos; width/height aceitam qualquer comprimento CSS (número vira px) e
  // continuam limitados à viewport; com altura sobrando o rodapé fica no fundo do painel.
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
      p.textContent = `Parágrafo ${index + 1}: o cabeçalho e o rodapé ficam fixos enquanto o corpo rola dentro do painel.`;
      return p;
    });
    return createScene({ label: "Termos de uso", lang: "pt" }, { body: paragraphs });
  },
  // O painel rola; cabeçalho e rodapé são sticky nas bordas do painel.
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
  render: () => createScene({ label: "Nova requisição", lang: "pt" }),
  // Abre no top layer com a semântica de diálogo, foca o primeiro focável do corpo, Esc fecha e devolve o foco.
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
    expect(title.textContent).toBe("Nova requisição");
    await expect(dialog).toHaveAttribute("aria-labelledby", title.id);
    // O cabeçalho é o primeiro filho, para a leitura começar pelo título; o corpo do usuário vem depois.
    expect(dialog.firstElementChild).toBe(dialog.querySelector('[data-ark="dialog-header"]'));
    expect(document.activeElement).toBe(dialog.querySelector("input"));
    expect(events).toEqual(["open"]);

    await userEvent.keyboard("{Escape}");
    expect(events).toEqual(["open", "close:escape"]);
    await expect(dialog).not.toHaveAttribute("open");
    // A saída anima antes de sair do top layer.
    await expect(dialog).toHaveAttribute("data-ark-state", "closing");
    await waitFor(() => expect(dialog.matches(":popover-open")).toBe(false));
    await closed(dialog);
    expect(document.activeElement).toBe(opener);
  }
};

export const FocusTrapCycles = {
  render: () => createScene({ label: "Editar", lang: "pt" }),
  // Tab e Shift+Tab ciclam entre os focáveis do painel; foco levado para fora volta.
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
    // Do último volta ao primeiro do DOM, o botão de fechar do cabeçalho.
    await userEvent.tab();
    expect(document.activeElement).toBe(close);
    await userEvent.tab();
    expect(document.activeElement).toBe(nome);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(close);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(save);

    // Foco levado para fora volta para onde estava, não para o primeiro focável do painel (o botão de fechar).
    opener.focus();
    expect(document.activeElement).toBe(save);

    dialog.close();
    await closed(dialog);
  }
};

// Para onde volta o foco que escapa: o último elemento focado no painel; se ele saiu do DOM, o foco inicial; sem
// nenhum dos dois, o primeiro focável. É o que mantém o campo focado quando um framework devolve o foco ao opener
// depois de abrir o diálogo (o React refoca, ao fim do commit, o elemento que tinha o foco antes dele).
export const EscapedFocusReturnsWhereItWas = {
  render: () => createScene({ label: "Editar", lang: "pt" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const opener = canvas.getByText("Abrir");

    await userEvent.click(opener);
    const [nome, url] = Array.from(dialog.querySelectorAll("input"));
    await expect(document.activeElement).toBe(nome);

    // Logo depois de abrir: volta ao campo que recebeu o foco inicial.
    opener.focus();
    await expect(document.activeElement).toBe(nome);

    url.focus();
    opener.focus();
    await expect(document.activeElement).toBe(url);

    // O último focado saiu do DOM: vale o foco inicial.
    (url.closest("ark-input") as HTMLElement).remove();
    opener.focus();
    await expect(document.activeElement).toBe(nome);

    // Nem ele: o painel, e não o botão de fechar, que é o primeiro focável.
    (nome.closest("ark-input") as HTMLElement).remove();
    opener.focus();
    await expect(document.activeElement).toBe(dialog);

    dialog.close();
    await closed(dialog);
  }
};

// Um diálogo fecha e outro abre no mesmo passo (assistente, confirmação depois do formulário). O que fecha continua
// no top layer durante a animação de saída, mas já não é um popover "por cima" do novo: foco que volte para dentro
// dele (o React refoca o botão que disparou a troca) vai para o diálogo aberto, em vez de ficar num painel que some.
export const FocusLeavesTheClosingDialog = {
  render: () => {
    const wrap = document.createElement("div");
    const first = createDialog({ label: "Passo 1", lang: "pt" }, { footer: false, body: [] });
    const next = document.createElement("ark-button");
    next.setAttribute("size", "sm");
    next.textContent = "Próximo";
    first.appendChild(next);
    const second = createDialog({ label: "Passo 2", lang: "pt" }, { footer: false, body: [createField("Nome")] });
    wrap.append(createOpener(first), first, second);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [first, second] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const next = canvas.getByText("Próximo");

    await userEvent.click(canvas.getByText("Abrir"));
    await expect(document.activeElement).toBe(next);

    first.close();
    second.show();
    const field = second.querySelector("input");
    await waitFor(() => expect(document.activeElement === field).toBe(true));
    await expect(first).toHaveAttribute("data-ark-state", "closing");
    expect(first.matches(":popover-open")).toBe(true);

    next.focus();
    await expect(document.activeElement).toBe(field);

    await closed(first);
    await expect(document.activeElement).toBe(field);
    second.close();
    await closed(second);
    // Quem abriu o segundo foi um botão do primeiro, que já fechou: o foco sobe para quem abriu o primeiro, em vez
    // de se perder no body.
    await waitFor(() => expect(document.activeElement === canvas.getByText("Abrir")).toBe(true));
  }
};

export const BackdropClosesAndPersistentBlocks = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-3";
    const behind = document.createElement("ark-button");
    behind.setAttribute("size", "sm");
    behind.textContent = "Atrás: 0";
    let count = 0;
    behind.addEventListener("click", () => {
      count += 1;
      behind.textContent = `Atrás: ${count}`;
    });

    const dialog = createDialog({ label: "Confirmar", lang: "pt" });
    const persistent = createDialog({ label: "Persistente", persistent: true, lang: "pt" });
    wrap.append(createOpener(dialog), createOpener(persistent, "Abrir persistente"), behind, dialog, persistent);
    return wrap;
  },
  // Clique fora é cancelado antes de chegar à página e fecha pelo scrim; persistent ignora scrim e Esc.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [dialog, persistent] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const behind = canvas.getByText(/^Atrás/);
    const reasons: string[] = [];
    for (const el of [dialog, persistent]) {
      el.addEventListener("ark-close", (event) =>
        reasons.push((event as CustomEvent<{ reason: string }>).detail.reason)
      );
    }

    await userEvent.click(canvas.getByText("Abrir"));
    await userEvent.click(behind);
    expect(behind.textContent).toBe("Atrás: 0");
    expect(reasons).toEqual(["backdrop"]);
    await closed(dialog);

    await userEvent.click(canvas.getByText("Abrir persistente"));
    await userEvent.click(behind);
    expect(behind.textContent).toBe("Atrás: 0");
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
  // Botão de fechar localizado e com motivo próprio; reabrir durante a saída a abandona; no-close-button.
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
          "Com o diálogo aberto a página para de rolar (`lockScroll` de core: `overflow: hidden` na raiz e `padding-right` do tamanho da barra que sumiu, exposto em `--ark-scroll-lock-gap`); a trava é liberada depois da saída. `no-scroll-lock` desliga."
      }
    }
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";
    const scene = createScene({ label: "Trava a rolagem", lang: "pt" });
    const filler = document.createElement("div");
    filler.className = "h-[140vh] rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500";
    filler.textContent = "Conteúdo alto: role a página, abra o diálogo e a rolagem para; feche e volta.";
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

    // A trava dura até o fim da saída (o scrim ainda está visível enquanto anima).
    dialog.close();
    await expect(dialog).toHaveAttribute("data-ark-state", "closing");
    expect(isScrollLocked()).toBe(true);
    await closed(dialog);
    await waitFor(() => expect(isScrollLocked()).toBe(false));
    expect(root.style.overflow).toBe(before);
    expect(root.style.getPropertyValue("--ark-scroll-lock-gap")).toBe("");

    // Opt-out: a página continua rolando.
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
    named.setAttribute("aria-label", "Sem título visível");
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
      await expect(named).toHaveAttribute("aria-label", "Sem título visível");
      named.close();
      await closed(named);
    } finally {
      console.warn = original;
    }
  }
};

// A regra do foco acima não vale para o ponteiro. Um diálogo aberto por cima de outro e que está fechando ainda recebe
// os cliques durante a animação de saída: o segundo clique de um duplo clique no "Cancelar" de uma confirmação não
// pode contar como clique no scrim do diálogo de baixo e fechá-lo.
export const ClosingDialogOnTopKeepsThePointer = {
  render: () => {
    const wrap = document.createElement("div");
    const form = createDialog({ label: "Formulário", lang: "pt" }, { footer: false });
    const confirm = createDialog({ label: "Descartar?", lang: "pt" }, { footer: false, body: [] });
    const cancel = document.createElement("ark-button");
    cancel.setAttribute("size", "sm");
    cancel.textContent = "Manter";
    cancel.addEventListener("click", () => confirm.close());
    confirm.appendChild(cancel);
    wrap.append(createOpener(form), form, confirm);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [form, confirm] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const cancel = canvas.getByText("Manter");
    const reasons: string[] = [];
    form.addEventListener("ark-close", (event) =>
      reasons.push((event as CustomEvent<{ reason: string }>).detail.reason)
    );

    await userEvent.click(canvas.getByText("Abrir"));
    const field = form.querySelector("input");
    await expect(document.activeElement).toBe(field);
    confirm.show();
    await waitFor(() => expect(document.activeElement === cancel).toBe(true));

    await userEvent.click(cancel);
    await expect(confirm).toHaveAttribute("data-ark-state", "closing");
    await userEvent.click(cancel);
    await expect(form).toHaveAttribute("open");
    expect(reasons).toEqual([]);

    await closed(confirm);
    await expect(form).toHaveAttribute("open");
    await expect(document.activeElement).toBe(field);
    form.close();
    await closed(form);
  }
};

// Um diálogo aberto por cima de outro. O de baixo também é um popover aberto, mas não está por cima do trap do de
// cima: foco levado a ele volta, e um clique nele não chega ao alvo e conta como clique no scrim do de cima. Antes o
// trap tratava qualquer popover aberto como "por cima", e o botão do diálogo de baixo fechava-o com o de cima aberto.
export const DialogBelowIsNotOnTop = {
  render: () => {
    const wrap = document.createElement("div");
    const form = createDialog({ label: "Formulário", width: "640", height: "480", lang: "pt" });
    const confirm = createDialog(
      { label: "Descartar?", size: "sm", lang: "pt" },
      { footer: false, body: [createField("Motivo")] }
    );
    wrap.append(createOpener(form), form, confirm);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [form, confirm] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const reasons: string[] = [];
    for (const el of [form, confirm]) {
      el.addEventListener("ark-close", (event) =>
        reasons.push(`${el.getAttribute("label")}:${(event as CustomEvent<{ reason: string }>).detail.reason}`)
      );
    }

    await userEvent.click(canvas.getByText("Abrir"));
    const nome = form.querySelector("input") as HTMLInputElement;
    await waitFor(() => expect(document.activeElement === nome).toBe(true));
    confirm.show();
    const motivo = confirm.querySelector("input") as HTMLInputElement;
    await waitFor(() => expect(document.activeElement === motivo).toBe(true));

    nome.focus();
    await expect(document.activeElement === motivo).toBe(true);
    // Tab com o foco no de cima continua nele.
    await userEvent.tab();
    await expect(confirm.contains(document.activeElement)).toBe(true);

    await userEvent.click(within(form).getByText("Cancelar"));
    expect(reasons).toEqual(["Descartar?:backdrop"]);
    await expect(form).toHaveAttribute("open");
    await closed(confirm);
    // O foco volta a quem o tinha quando o de cima abriu, e o de baixo volta a responder.
    await waitFor(() => expect(document.activeElement === nome).toBe(true));
    await userEvent.click(within(form).getByText("Cancelar"));
    expect(reasons).toEqual(["Descartar?:backdrop", "Formulário:api"]);
    await closed(form);
  }
};

// Quem abriu a confirmação sai da página junto com o fechamento dela (excluir a linha que tinha o botão). Com outro
// diálogo embaixo, o foco vai para ele: para onde estava antes, senão para o foco inicial dele. Ficava no body com um
// modal aberto, e o teclado ficava sem dono: o Esc não chegava ao diálogo. Sem overlay embaixo o foco termina no
// body, como no <dialog> nativo, e o app escolhe o destino no próprio handler.
export const OpenerGoneFocusGoesToTheDialogBelow = {
  render: () => {
    const wrap = document.createElement("div");
    const list = createDialog({ label: "Itens", width: "640", height: "480", lang: "pt" });
    const remove = document.createElement("ark-button");
    remove.setAttribute("size", "sm");
    remove.textContent = "Excluir item";
    (list.querySelector("div") as HTMLElement).append(remove);
    const confirm = createDialog({ label: "Excluir?", size: "sm", lang: "pt" }, { footer: false, body: [] });
    const yes = document.createElement("ark-button");
    yes.setAttribute("size", "sm");
    yes.textContent = "Sim";
    yes.addEventListener("click", () => {
      remove.remove();
      confirm.close();
    });
    confirm.append(yes);
    remove.addEventListener("click", () => confirm.show());
    wrap.append(createOpener(list), list, confirm);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [list, confirm] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const opener = canvas.getByText("Abrir");
    const reasons: string[] = [];
    list.addEventListener("ark-close", (event) => {
      if (event.target === list) reasons.push((event as CustomEvent<{ reason: string }>).detail.reason);
    });

    await userEvent.click(opener);
    const nome = list.querySelector("input") as HTMLInputElement;
    await waitFor(() => expect(document.activeElement === nome).toBe(true));
    await userEvent.click(canvas.getByText("Excluir item"));
    const yes = canvas.getByText("Sim");
    await waitFor(() => expect(document.activeElement === yes).toBe(true));

    await userEvent.click(yes);
    await closed(confirm);
    await expect(canvas.queryByText("Excluir item")).toBeNull();
    await waitFor(() => expect(document.activeElement === nome).toBe(true));

    await userEvent.keyboard("{Escape}");
    expect(reasons).toEqual(["escape"]);
    await closed(list);
    await waitFor(() => expect(document.activeElement === opener).toBe(true));
  }
};

// O elemento focado sai da página com o diálogo aberto (o botão "remover" de uma linha, que some com ela). O
// navegador deixa o foco no body, e ali o Esc não chega ao diálogo: o trap leva o foco ao painel. Se o botão que some
// estava num popover por cima (um toast), o foco volta ao campo onde estava. Um blur() do app, com o elemento ainda
// focável, é escolha dele e fica como está.
export const FocusedElementRemovedStaysInTheDialog = {
  render: () => {
    const wrap = document.createElement("div");
    const dialog = createDialog({ label: "Itens", lang: "pt" });
    const remove = document.createElement("ark-button");
    remove.setAttribute("size", "sm");
    remove.textContent = "Remover linha";
    remove.addEventListener("click", () => remove.remove());
    (dialog.querySelector("div") as HTMLElement).append(remove);
    const above = document.createElement("div");
    above.setAttribute("popover", "manual");
    const undo = document.createElement("button");
    undo.type = "button";
    undo.textContent = "Desfazer";
    undo.addEventListener("click", () => undo.remove());
    above.append(undo);
    wrap.append(createOpener(dialog), dialog, above);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const opener = canvas.getByText("Abrir");

    await userEvent.click(opener);
    const nome = dialog.querySelector("input") as HTMLInputElement;
    await waitFor(() => expect(document.activeElement === nome).toBe(true));

    const remove = canvas.getByText("Remover linha");
    await userEvent.click(remove);
    await expect(remove.isConnected).toBe(false);
    // O último focado saiu: o foco vai ao painel, e não a um controle que um segundo Enter acionaria.
    await waitFor(() => expect(dialog).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(dialog).toHaveAttribute("data-ark-state", "open");

    // O botão que some estava num popover por cima: o foco volta ao campo.
    nome.focus();
    const above = canvasElement.querySelector<HTMLElement>("div[popover]") as HTMLElement;
    above.showPopover();
    const undo = canvas.getByText("Desfazer");
    undo.focus();
    await expect(undo).toHaveFocus();
    await userEvent.click(undo);
    await expect(undo.isConnected).toBe(false);
    await waitFor(() => expect(nome).toHaveFocus());
    above.hidePopover();

    // Um blur() do app, com o campo ainda focável, fica como está.
    nome.focus();
    nome.blur();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect(document.activeElement === document.body).toBe(true);

    nome.focus();
    await userEvent.keyboard("{Escape}");
    await closed(dialog);
    await waitFor(() => expect(document.activeElement === opener).toBe(true));
  }
};

// Diálogo A trocado por B no mesmo passo, quando quem "abriu" B é o próprio painel de A (um clique num texto de A foca
// o host, que tem tabindex=-1) ou ninguém (o botão de A ficou `disabled` no clique, e o foco caiu no body antes de B
// abrir). Ao fechar B, o foco volta a quem abriu A: a cadeia de retorno começa no próprio `returnTo`, e o body não
// conta como quem abriu.
export const SwappedDialogReturnsFocusToTheOpener = {
  render: () => {
    const wrap = document.createElement("div");
    const first = createDialog({ label: "Passo 1", lang: "pt" }, { footer: false, body: [] });
    const text = document.createElement("p");
    text.textContent = "Um texto do passo 1";
    const next = document.createElement("ark-button");
    next.setAttribute("size", "sm");
    next.textContent = "Avançar";
    const second = createDialog({ label: "Passo 2", lang: "pt" });
    next.addEventListener("click", () => {
      // O botão fica bloqueado enquanto o passo seguinte abre: o foco sai dele antes da troca.
      next.setAttribute("disabled", "");
      first.close();
      second.show();
    });
    (first.querySelector("div") as HTMLElement).append(text, next);
    wrap.append(createOpener(first), first, second);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [first, second] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const opener = canvas.getByText("Abrir");
    const next = canvas.getByText("Avançar");
    const field = second.querySelector("input") as HTMLInputElement;

    // Clique no texto de A: o host de A é quem tem o foco quando B abre.
    await userEvent.click(opener);
    await waitFor(() => expect(next).toHaveFocus());
    await userEvent.click(canvas.getByText("Um texto do passo 1"));
    await expect(first).toHaveFocus();
    first.close();
    second.show();
    await waitFor(() => expect(field).toHaveFocus());
    await closed(first);
    await userEvent.keyboard("{Escape}");
    await closed(second);
    await waitFor(() => expect(opener).toHaveFocus());

    // Botão de A desabilitado no clique: o foco já estava no body quando B abriu.
    next.removeAttribute("disabled");
    await userEvent.click(opener);
    await waitFor(() => expect(next).toHaveFocus());
    await userEvent.click(next);
    await expect(next).toHaveAttribute("disabled");
    await waitFor(() => expect(field).toHaveFocus());
    await closed(first);
    await userEvent.keyboard("{Escape}");
    await closed(second);
    await waitFor(() => expect(opener).toHaveFocus());
  }
};

// Cada jeito de o elemento focado deixar de aceitar o foco com o diálogo aberto: o foco vai ao painel. A última volta
// barra o focusout antes do trap, como no Firefox e no WebKit, que não o disparam quando o elemento focado sai da
// página: ali quem avisa é a remoção observada no DOM.
export const LostFocusGoesToThePanel = {
  render: () => createScene({ label: "Editar", lang: "pt" }, { footer: false, body: [] }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const body = dialog.querySelector<HTMLElement>(":scope > div:not([data-ark-chrome])") as HTMLElement;
    const field = '<input data-lost aria-label="Campo">';
    const ways: Array<[string, string, (lost: HTMLElement) => void]> = [
      ["disabled", field, (lost) => lost.setAttribute("disabled", "")],
      ["ark-button disabled", "<ark-button data-lost>Ok</ark-button>", (lost) => lost.setAttribute("disabled", "")],
      [
        "fieldset disabled",
        `<fieldset>${field}</fieldset>`,
        (lost) => lost.closest("fieldset")?.setAttribute("disabled", "")
      ],
      ["inert", `<div>${field}</div>`, (lost) => lost.parentElement?.setAttribute("inert", "")],
      ["visibility", `<div>${field}</div>`, (lost) => lost.parentElement?.style.setProperty("visibility", "hidden")],
      ["display", `<div>${field}</div>`, (lost) => lost.parentElement?.style.setProperty("display", "none")],
      [
        "details",
        `<details open><summary>Mais</summary>${field}</details>`,
        (lost) => lost.closest("details")?.removeAttribute("open")
      ],
      ["tabindex", '<div data-lost tabindex="0">Texto</div>', (lost) => lost.removeAttribute("tabindex")],
      ["href", '<a data-lost href="#lost">Texto</a>', (lost) => lost.removeAttribute("href")],
      ["removed", field, (lost) => lost.remove()]
    ];

    await userEvent.click(canvas.getByText("Abrir"));
    await waitFor(() => expect(dialog.matches(":popover-open")).toBe(true));
    const focusLost = async (html: string): Promise<HTMLElement> => {
      body.innerHTML = html;
      const lost = body.querySelector<HTMLElement>("[data-lost]") as HTMLElement;
      lost.focus();
      await expect(lost).toHaveFocus();
      return lost;
    };
    for (const [name, html, lose] of ways) {
      lose(await focusLost(html));
      await waitFor(() => expect(dialog, name).toHaveFocus());
    }

    const lost = await focusLost(field);
    const swallow = (event: Event): void => event.stopImmediatePropagation();
    window.addEventListener("focusout", swallow, true);
    try {
      lost.remove();
      await waitFor(() => expect(dialog).toHaveFocus());
    } finally {
      window.removeEventListener("focusout", swallow, true);
    }

    await userEvent.keyboard("{Escape}");
    await closed(dialog);
  }
};

// O campo focado fica `disabled` com o diálogo aberto (o formulário durante o envio; o mesmo com um controle que um
// componente desabilita sozinho, como a seta do ark-carousel no último slide): o navegador larga o foco no body, onde o
// Esc não chega ao diálogo. O trap leva o foco ao painel, e não a outro controle: no botão de fechar, o Enter que o
// usuário repete durante o envio fechava o diálogo; num campo, enviava de novo.
export const DisabledFocusedFieldKeepsTheDialogUsable = {
  render: () => {
    const wrap = document.createElement("div");
    const dialog = createDialog({ label: "Editar", lang: "pt" }, { footer: false, body: [] });
    const form = document.createElement("form");
    const nome = createField("Nome");
    const salvar = document.createElement("ark-button");
    salvar.setAttribute("type", "submit");
    salvar.setAttribute("size", "sm");
    salvar.textContent = "Salvar";
    form.className = "flex flex-col gap-3";
    form.append(nome, salvar);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      // Envio em curso: o campo e o botão ficam bloqueados até a resposta.
      nome.setAttribute("disabled", "");
      salvar.setAttribute("loading", "");
    });
    (dialog.querySelector("div") as HTMLElement).append(form);
    wrap.append(createOpener(dialog), dialog);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const opener = canvas.getByText("Abrir");
    const form = dialog.querySelector("form") as HTMLFormElement;
    let submits = 0;
    form.addEventListener("submit", () => submits++);
    const reasons: string[] = [];
    dialog.addEventListener("ark-close", (event) => {
      reasons.push((event as CustomEvent<{ reason: string }>).detail.reason);
    });

    await userEvent.click(opener);
    const nome = dialog.querySelector("input") as HTMLInputElement;
    await waitFor(() => expect(nome).toHaveFocus());

    // Enter envia; o campo fica desabilitado e o foco vai ao painel, não ao botão de fechar nem a outro controle.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(submits).toBe(1));
    await expect(nome).toBeDisabled();
    await waitFor(() => expect(dialog).toHaveFocus());

    // Enter repetido durante o envio: nada acontece.
    await userEvent.keyboard("{Enter}");
    await new Promise((resolve) => setTimeout(resolve, 50));
    await expect(submits).toBe(1);
    await expect(dialog).toHaveAttribute("data-ark-state", "open");

    // O envio falhou e o campo voltou: o Esc fecha, e o foco volta a quem abriu.
    (nome.closest("ark-input") as HTMLElement).removeAttribute("disabled");
    await userEvent.keyboard("{Escape}");
    expect(reasons).toEqual(["escape"]);
    await closed(dialog);
    await waitFor(() => expect(opener).toHaveFocus());
  }
};

// Uma confirmação aberta pelo campo que ficou `disabled` fecha com ele ainda assim: o foco não tem a quem voltar, e ia
// ao botão de fechar do diálogo de baixo, onde o Enter seguinte o fechava. Fica no painel.
export const ConfirmationOverADisabledFieldKeepsTheDialogOpen = {
  render: () => {
    const wrap = document.createElement("div");
    const form = createDialog({ label: "Editar", width: "640", height: "480", lang: "pt" }, { footer: false });
    const confirm = createDialog({ label: "Enviar?", size: "sm", lang: "pt" }, { footer: false, body: [] });
    const keep = document.createElement("ark-button");
    keep.setAttribute("size", "sm");
    keep.textContent = "Voltar";
    keep.addEventListener("click", () => confirm.close());
    confirm.append(keep);
    wrap.append(createOpener(form), form, confirm);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [form, confirm] = Array.from(canvasElement.querySelectorAll("ark-dialog")) as DialogEl[];
    const opener = canvas.getByText("Abrir");

    await userEvent.click(opener);
    const nome = form.querySelector("input") as HTMLInputElement;
    await waitFor(() => expect(nome).toHaveFocus());

    // O campo é quem tem o foco quando a confirmação abre, e fica desabilitado até a resposta.
    confirm.show();
    (nome.closest("ark-input") as HTMLElement).setAttribute("disabled", "");
    await waitFor(() => expect(canvas.getByText("Voltar")).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    await closed(confirm);
    await waitFor(() => expect(form).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    await expect(form).toHaveAttribute("data-ark-state", "open");

    await userEvent.keyboard("{Escape}");
    await closed(form);
    await waitFor(() => expect(opener).toHaveFocus());
  }
};

// Foco no body com um overlay aberto e nada para o trap trazer de volta: um blur() do app, ou um clique no texto de um
// toast (o toaster é um popover por cima, fora do trap). O Esc morria ali até um Tab; o trap do topo o entrega ao
// overlay. Ficam de fora o Esc que o app já cancelou, o de um diálogo `persistent` (entregue, mas ele não fecha) e o de
// um popover `auto` aberto (um menu), que é do navegador.
export const EscapeReachesTheOverlayWithFocusOnBody = {
  render: () => {
    const wrap = createScene({ label: "Editar", lang: "pt" });
    const dialog = wrap.querySelector("ark-dialog") as DialogEl;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = "escape-menu-trigger";
    trigger.textContent = "Mais";
    const menu = document.createElement("ark-menu");
    menu.setAttribute("for", trigger.id);
    const item = document.createElement("ark-menu-item");
    item.textContent = "Duplicar";
    menu.append(item);
    (dialog.querySelector("div") as HTMLElement).append(trigger, menu);

    const drawer = document.createElement("ark-drawer");
    drawer.setAttribute("label", "Filtros");
    drawer.append(createField("Busca"));
    const palette = document.createElement("ark-command-palette");
    palette.setAttribute("label", "Comandos");
    wrap.append(drawer, palette, document.createElement("ark-toaster"));
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const menu = canvasElement.querySelector("ark-menu") as HTMLElement & { hide(): void };
    const opener = canvas.getByText("Abrir");
    const nome = dialog.querySelector("input") as HTMLInputElement;
    const reasons: string[] = [];
    dialog.addEventListener("ark-close", (event) => {
      if (event.target === dialog) reasons.push((event as CustomEvent<{ reason: string }>).detail.reason);
    });
    const open = async (): Promise<void> => {
      await userEvent.click(opener);
      await waitFor(() => expect(nome).toHaveFocus());
    };
    const blur = async (): Promise<void> => {
      (document.activeElement as HTMLElement).blur();
      await expect(document.body).toHaveFocus();
    };

    // blur() do app. O listener do app no host recebe uma tecla só.
    await open();
    await blur();
    const keys: string[] = [];
    const record = (event: KeyboardEvent): void => {
      keys.push(event.key);
    };
    dialog.addEventListener("keydown", record, true);
    await userEvent.keyboard("{Escape}");
    dialog.removeEventListener("keydown", record, true);
    expect(keys).toEqual(["Escape"]);
    expect(reasons).toEqual(["escape"]);
    await closed(dialog);
    await waitFor(() => expect(opener).toHaveFocus());

    // Clique no texto de um toast.
    await open();
    const id = toast("Rascunho salvo", { duration: 60000 });
    await userEvent.click(await canvas.findByText("Rascunho salvo"));
    await expect(document.body).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(reasons).toEqual(["escape", "escape"]);
    await closed(dialog);
    toast.dismiss(id);

    // O Esc que o app já cancelou não fecha; nem o de um diálogo persistent.
    await open();
    await blur();
    const cancel = (event: Event): void => event.preventDefault();
    window.addEventListener("keydown", cancel, true);
    await userEvent.keyboard("{Escape}");
    window.removeEventListener("keydown", cancel, true);
    await expect(dialog).toHaveAttribute("data-ark-state", "open");
    dialog.setAttribute("persistent", "");
    await userEvent.keyboard("{Escape}");
    await expect(dialog).toHaveAttribute("data-ark-state", "open");
    dialog.removeAttribute("persistent");

    // Menu aberto: o Esc é dele (o navegador o fecha; a tecla sintética do teste não), e o diálogo fica.
    const trigger = canvas.getByText("Mais");
    await userEvent.click(trigger);
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(true));
    await blur();
    await userEvent.keyboard("{Escape}");
    await expect(dialog).toHaveAttribute("data-ark-state", "open");
    menu.hide();
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(false));
    await expect(trigger).toHaveFocus();
    await blur();
    await userEvent.keyboard("{Escape}");
    expect(reasons).toEqual(["escape", "escape", "escape"]);
    await closed(dialog);

    // Gaveta e paleta.
    for (const tag of ["ark-drawer", "ark-command-palette"]) {
      const overlay = canvasElement.querySelector(tag) as DialogEl;
      overlay.show();
      await waitFor(() => expect(overlay.contains(document.activeElement), tag).toBe(true));
      await blur();
      await userEvent.keyboard("{Escape}");
      await closed(overlay);
    }
  }
};

// O foco inicial e o `ark-open` saem num microtask depois de `open` mudar, e não na hora: um framework que grava a
// prop dentro da própria atualização (o React, no commit) ainda mexe no foco antes de terminar. O que isso não pode
// custar: o campo que o app foca logo depois de abrir continua com o foco, quem o recebe de volta ao fechar é o
// elemento focado antes de abrir (e não esse campo), e abrir e fechar no mesmo passo ainda publica o par de eventos
// inteiro e em ordem.
export const OpenSettlesAfterTheCurrentStep = {
  render: () => createScene({ label: "Editar", lang: "pt" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvasElement.querySelector("ark-dialog") as DialogEl;
    const opener = canvas.getByText("Abrir");
    const events: string[] = [];
    dialog.addEventListener("ark-open", () => events.push("open"));
    dialog.addEventListener("ark-close", () => events.push("close"));
    opener.focus();

    dialog.show();
    const [nome, url] = Array.from(dialog.querySelectorAll("input"));
    url.focus();
    await Promise.resolve();
    expect(events).toEqual(["open"]);
    expect(document.activeElement === url).toBe(true);
    dialog.close();
    await closed(dialog);
    await waitFor(() => expect(document.activeElement === opener).toBe(true));

    events.length = 0;
    dialog.show();
    dialog.close();
    expect(events).toEqual(["open", "close"]);
    await closed(dialog);
    expect(events).toEqual(["open", "close"]);
    expect(document.activeElement === opener).toBe(true);

    events.length = 0;
    dialog.show();
    dialog.close();
    dialog.show();
    await Promise.resolve();
    expect(events).toEqual(["open", "close", "open"]);
    await waitFor(() => expect(document.activeElement === nome).toBe(true));
    await userEvent.keyboard("{Escape}");
    await closed(dialog);
    expect(events).toEqual(["open", "close", "open", "close"]);
    await waitFor(() => expect(document.activeElement === opener).toBe(true));
  }
};

// Inserido já aberto (um framework que só renderiza o diálogo enquanto ele está aberto): o foco inicial espera os
// filhos conectarem. Antes ele era escolhido no connectedCallback do diálogo, quando o ark-input do corpo ainda não
// tinha montado o <input>, e caía no botão de fechar.
export const OpenOnInsertFocusesField = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const dialog = document.createElement("ark-dialog") as DialogEl;
    dialog.setAttribute("label", "Novo projeto");
    dialog.setAttribute("open", "");
    const field = document.createElement("ark-input");
    field.setAttribute("label", "Nome");
    dialog.append(field);
    let opened = 0;
    dialog.addEventListener("ark-open", () => opened++);
    (canvasElement.firstElementChild as HTMLElement).append(dialog);

    await waitFor(() => expect(document.activeElement === field.querySelector("input")).toBe(true));
    await expect(opened).toBe(1);
    // O trap criado no microtask é o mesmo de uma abertura comum: Tab continua dentro do diálogo e Esc fecha.
    await userEvent.tab();
    await expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await closed(dialog);
  }
};

// O foco inicial é o primeiro focável do corpo, e só o cabeçalho do próprio diálogo fica de fora. O controle dos
// componentes desenhados (a caixa do checkbox e do radio, o botão do file-input, a barra do kv-editor) é chrome
// deles, marcado `data-ark-chrome` como o cabeçalho: descartar tudo o que tinha essa marca fazia o foco pular o
// primeiro controle do corpo e cair no rodapé (ou no botão de fechar, sem rodapé).
export const InitialFocusOnDrawnControls = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    for (const tag of ["ark-checkbox", "ark-radio", "ark-file-input", "ark-kv-editor"]) {
      const control = document.createElement(tag);
      control.setAttribute("label", "Opção");
      const dialog = createDialog({ label: "Preferências", lang: "pt" }, { body: [control] });
      (canvasElement.firstElementChild as HTMLElement).append(dialog);

      dialog.show();
      await waitFor(() => expect(control.contains(document.activeElement)).toBe(true));
      // O botão de fechar do cabeçalho continua fora da escolha, mesmo sendo o primeiro focável do painel.
      await expect(dialog.querySelector('[data-ark="dialog-header"]')?.contains(document.activeElement)).toBe(false);

      dialog.close();
      await closed(dialog);
      dialog.remove();
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
    // O rodapé é o filho slot="footer" do usuário, marcado no lugar.
    await expect(dialog.querySelector('[slot="footer"]')).toHaveAttribute("data-ark", "dialog-footer");
    await expect(dialog.querySelector('[slot="footer"]')).toHaveAttribute("data-testid", "confirm-footer");
  }
};
