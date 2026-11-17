import type { ArkTheme, ArkToastPosition } from "@tooark/core";
import { toast } from "@tooark/core";
import type { ArkToaster } from "@tooark/web-components";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkToaster",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Toaster inspirado no Sonner com API programática: tipos de toast, posição configurável, rich colors, botões de ação/cancelamento e dismiss global."
      }
    }
  },
  argTypes: {
    theme: { control: "select", options: ["auto", "light", "dark"] },
    lang: { control: "select", options: ["en", "pt", "es"] },
    position: {
      control: "select",
      options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"]
    },
    richColors: { control: "boolean" },
    closeButton: { control: "boolean" },
    maxVisible: { control: { type: "number", min: 1, max: 8, step: 1 } },
    duration: { control: { type: "number", min: 0, max: 12000, step: 200 } }
  },
  args: {
    theme: "light",
    lang: "en",
    position: "bottom-right",
    richColors: false,
    closeButton: true,
    maxVisible: 4,
    duration: 4000
  }
};

export default meta;

type StoryArgs = {
  theme: ArkTheme;
  lang: "en" | "pt" | "es";
  position: ArkToastPosition;
  richColors: boolean;
  closeButton: boolean;
  maxVisible: number;
  duration: number;
  testid?: string;
};

// Títulos dos cards na ordem da pilha (o mais novo primeiro).
function titlesOf(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('[data-ark="toaster-toast-title"]')).map((title) => title.textContent ?? "");
}

function cardOf(root: HTMLElement, title: string): HTMLElement {
  return within(root).getByText(title).closest<HTMLElement>('[data-ark="toaster-toast"]')!;
}

function createButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.padding = "10px 14px";
  button.style.borderRadius = "10px";
  button.style.border = "1px solid #cbd5e1";
  button.style.background = "#ffffff";
  button.style.cursor = "pointer";
  button.addEventListener("click", onClick);
  return button;
}

function renderToaster(args: StoryArgs): HTMLElement {
  const page = document.createElement("section");
  page.style.minHeight = "100vh";
  page.style.padding = "40px";
  page.style.background = "linear-gradient(140deg, #f8fafc 0%, #e2e8f0 100%)";

  const title = document.createElement("h2");
  title.textContent = "ArkToaster Playground";
  title.style.fontSize = "28px";
  title.style.fontWeight = "700";
  title.style.marginBottom = "10px";

  const subtitle = document.createElement("p");
  subtitle.textContent = "Dispare diferentes toasts para validar o comportamento no estilo Sonner.";
  subtitle.style.fontSize = "14px";
  subtitle.style.opacity = "0.8";
  subtitle.style.marginBottom = "20px";

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.flexWrap = "wrap";
  controls.style.gap = "10px";

  controls.appendChild(
    createButton("Default", () => {
      toast("Projeto salvo", {
        description: "Alterações publicadas no repositório.",
        duration: args.duration
      });
    })
  );

  controls.appendChild(
    createButton("Success", () => {
      toast.success("Upload concluido", {
        description: "3 arquivos enviados com sucesso.",
        duration: args.duration
      });
    })
  );

  controls.appendChild(
    createButton("Info", () => {
      toast.info("Nova versão disponível", {
        description: "Atualize para acessar os novos componentes.",
        duration: args.duration
      });
    })
  );

  controls.appendChild(
    createButton("Warning", () => {
      toast.warning("Conexão instável", {
        description: "Reconectando ao servidor...",
        duration: args.duration
      });
    })
  );

  controls.appendChild(
    createButton("Error", () => {
      toast.error("Falha ao publicar", {
        description: "Tente novamente em alguns instantes.",
        actionLabel: "Retry",
        actionId: "retry-publish",
        cancelLabel: "Close",
        duration: 0
      });
    })
  );

  controls.appendChild(
    createButton("Loading", () => {
      const id = toast.loading("Processando pagamento", {
        description: "Validando dados de cobranca.",
        duration: 0
      });

      window.setTimeout(() => {
        toast.dismiss(id);
        toast.success("Pagamento confirmado", {
          description: "Recibo enviado para o email.",
          duration: args.duration
        });
      }, 1800);
    })
  );

  controls.appendChild(
    createButton("Dismiss all", () => {
      toast.dismiss();
    })
  );

  const toaster = document.createElement("ark-toaster");
  toaster.setAttribute("theme", args.theme);
  toaster.setAttribute("lang", args.lang || "en");
  toaster.setAttribute("position", args.position);
  toaster.setAttribute("max-visible", String(args.maxVisible));
  toaster.setAttribute("duration", String(args.duration));

  if (args.richColors) {
    toaster.setAttribute("rich-colors", "");
  }

  if (!args.closeButton) {
    toaster.setAttribute("close-button", "false");
  }

  if (args.testid) {
    toaster.setAttribute("testid", args.testid);
  }

  toaster.addEventListener("ark-toast-action", (event) => {
    const detail = (event as CustomEvent<{ id: string; actionId: string | null }>).detail;
    if (detail.actionId === "retry-publish") {
      toast.info("Tentando novamente", {
        description: "Nova tentativa iniciada.",
        duration: args.duration
      });
    }
  });

  page.appendChild(title);
  page.appendChild(subtitle);
  page.appendChild(controls);
  page.appendChild(toaster);

  return page;
}

export const Playground = {
  render: renderToaster
};

export const DarkTopCenter = {
  args: {
    theme: "dark",
    position: "top-center",
    richColors: true
  },
  render: renderToaster
};

export const BottomLeftPersistent = {
  args: {
    position: "bottom-left",
    duration: 0,
    closeButton: true
  },
  render: renderToaster
};

export const FluxoDeDismiss = {
  parameters: {
    docs: {
      description: {
        story:
          "Interaction test: dispara um toast, verifica a exibição, fecha pelo botão Close e aguarda a animação de saída remover o card do DOM."
      }
    }
  },
  args: {
    duration: 0
  },
  render: renderToaster,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Default" }));

    const title = await canvas.findByText("Projeto salvo");
    await expect(title).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Close" }));

    // arkExit anima a saída antes de remover o card do DOM
    await waitFor(() => expect(canvas.queryByText("Projeto salvo")).not.toBeInTheDocument());
  }
};

export const TopLayer = {
  parameters: {
    docs: {
      description: {
        story:
          'A pilha é um `popover="manual"` próprio: entra no top layer com o primeiro toast e sai quando esvazia, sem z-index. Um toast que chega com um diálogo aberto fica por cima do scrim, porque a pilha reentra no top layer a cada toast novo.'
      }
    }
  },
  args: {
    duration: 0
  },
  render: (args: StoryArgs) => {
    const page = renderToaster(args);
    const dialog = document.createElement("ark-dialog");
    dialog.setAttribute("label", "Diálogo aberto");
    dialog.setAttribute("lang", "pt");
    const body = document.createElement("p");
    body.textContent = "Dispare um toast com este diálogo aberto: ele aparece por cima do scrim.";
    dialog.appendChild(body);
    const footer = document.createElement("div");
    footer.setAttribute("slot", "footer");
    footer.appendChild(
      createButton("Toast por cima", () => {
        toast.success("Por cima do diálogo", { duration: args.duration });
      })
    );
    dialog.appendChild(footer);
    page.querySelector("div")?.appendChild(createButton("Abrir diálogo", () => dialog.setAttribute("open", "")));
    page.appendChild(dialog);
    return page;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const stack = canvasElement.querySelector<HTMLElement>('[data-ark="toaster"]')!;
    await expect(stack).toHaveAttribute("popover", "manual");
    expect(stack.matches(":popover-open")).toBe(false);
    expect(getComputedStyle(stack).display).toBe("none");

    await userEvent.click(canvas.getByRole("button", { name: "Default" }));
    await canvas.findByText("Projeto salvo");
    expect(stack.matches(":popover-open")).toBe(true);
    expect(getComputedStyle(stack).display).toBe("flex");

    // Diálogo aberto depois da pilha: o toast seguinte reentra no top layer e fica por cima do scrim.
    await userEvent.click(canvas.getByRole("button", { name: "Abrir diálogo" }));
    const dialog = canvasElement.querySelector<HTMLElement>("ark-dialog")!;
    await waitFor(() => expect(dialog.matches(":popover-open")).toBe(true));
    await userEvent.click(canvas.getByRole("button", { name: "Toast por cima" }));
    const card = (await canvas.findByText("Por cima do diálogo")).closest<HTMLElement>('[data-ark="toaster-toast"]')!;
    await waitFor(() => expect(card.getAnimations().length).toBe(0));
    const rect = card.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    expect(card.contains(hit)).toBe(true);

    (dialog as HTMLElement & { close(): void }).close();
    await waitFor(() => expect(dialog).not.toHaveAttribute("data-ark-state"));

    // Esvaziar a pilha a tira do top layer.
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss all" }));
    await waitFor(() => expect(stack.matches(":popover-open")).toBe(false));
    expect(getComputedStyle(stack).display).toBe("none");
  }
};

export const TiposAcoesERichColors = {
  parameters: {
    docs: {
      description: {
        story:
          "Interaction test: cada tipo do serviço (`toast.success/info/warning/error/loading`) ganha ícone e, com `rich-colors`, a paleta do intent; o botão de ação emite `ark-toast-action` e o de cancelamento só fecha; o mais novo fica no topo e o excedente de `max-visible` espera na fila, voltando quando um card sai."
      }
    }
  },
  args: {
    richColors: true,
    duration: 0
  },
  render: renderToaster,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const toaster = canvasElement.querySelector<ArkToaster>("ark-toaster")!;
    const actions: Array<{ id: string; actionId: string | null }> = [];
    toaster.addEventListener("ark-toast-action", (event) => {
      actions.push((event as CustomEvent<{ id: string; actionId: string | null }>).detail);
    });

    await userEvent.click(canvas.getByRole("button", { name: "Success" }));
    await userEvent.click(canvas.getByRole("button", { name: "Info" }));
    await userEvent.click(canvas.getByRole("button", { name: "Warning" }));
    await userEvent.click(canvas.getByRole("button", { name: "Error" }));
    await canvas.findByText("Falha ao publicar");
    expect(titlesOf(canvasElement)).toEqual([
      "Falha ao publicar",
      "Conexão instável",
      "Nova versão disponível",
      "Upload concluido"
    ]);

    const expectType = (title: string, icon: string, intent: string): void => {
      const card = cardOf(canvasElement, title);
      expect(card.querySelector("span")).toHaveTextContent(icon);
      expect(card.className).toContain(`ark:bg-${intent}-soft`);
    };
    expectType("Upload concluido", "✓", "success");
    expectType("Nova versão disponível", "i", "info");
    expectType("Conexão instável", "!", "warning");
    expectType("Falha ao publicar", "x", "danger");

    // Ação: emite ark-toast-action com o actionId e fecha o toast; a story responde com um toast informativo,
    // disparado enquanto o card sai (re-render no meio da saída).
    await userEvent.click(
      cardOf(canvasElement, "Falha ao publicar").querySelector('[data-ark="toaster-toast-action"]')!
    );
    expect(actions).toEqual([{ id: expect.stringMatching(/^ark-toast-/), actionId: "retry-publish" }]);
    await canvas.findByText("Tentando novamente");
    // O toast de resposta é o quinto: com max-visible 4 o mais antigo espera na fila e volta quando um card sai.
    expect(canvas.queryByText("Upload concluido")).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.queryByText("Falha ao publicar")).not.toBeInTheDocument());
    expect(titlesOf(canvasElement)).toEqual([
      "Tentando novamente",
      "Conexão instável",
      "Nova versão disponível",
      "Upload concluido"
    ]);

    // Cancelamento: só fecha, sem evento.
    await userEvent.click(canvas.getByRole("button", { name: "Error" }));
    await canvas.findByText("Falha ao publicar");
    await userEvent.click(
      cardOf(canvasElement, "Falha ao publicar").querySelector('[data-ark="toaster-toast-cancel"]')!
    );
    await waitFor(() => expect(canvas.queryByText("Falha ao publicar")).not.toBeInTheDocument());
    expect(actions).toHaveLength(1);

    // Loading entra no topo e não expira sozinho (direto pelo serviço: o botão da demo agenda um timer de 1,8 s
    // que vazaria para a story seguinte).
    toast.loading("Processando pagamento", { description: "Validando dados de cobranca." });
    await canvas.findByText("Processando pagamento");
    expect(titlesOf(canvasElement)).toEqual([
      "Processando pagamento",
      "Tentando novamente",
      "Conexão instável",
      "Nova versão disponível"
    ]);
    expectType("Processando pagamento", "...", "info");

    await userEvent.click(canvas.getByRole("button", { name: "Dismiss all" }));
    await waitFor(() => expect(titlesOf(canvasElement)).toHaveLength(0));
  }
};

export const Posicoes = {
  parameters: {
    docs: {
      description: {
        story:
          "Interaction test: as seis posições ancoram a pilha nos cantos e no centro; a entrada desce nas de cima e sobe nas de baixo, a saída vai para o lado da borda (fade no centro). Valor inválido cai em bottom-right."
      }
    }
  },
  args: {
    duration: 0
  },
  render: renderToaster,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const toaster = canvasElement.querySelector<ArkToaster>("ark-toaster")!;
    const stack = canvasElement.querySelector<HTMLElement>('[data-ark="toaster"]')!;
    const expected: Array<[string, string]> = [
      ["top-left", "ark:left-0 ark:top-0 ark:items-start"],
      ["top-center", "ark:left-1/2 ark:top-0 ark:-translate-x-1/2 ark:items-center"],
      ["top-right", "ark:right-0 ark:top-0 ark:items-end"],
      ["bottom-left", "ark:bottom-0 ark:left-0 ark:items-start"],
      ["bottom-center", "ark:bottom-0 ark:left-1/2 ark:-translate-x-1/2 ark:items-center"],
      ["bottom-right", "ark:bottom-0 ark:right-0 ark:items-end"],
      ["middle", "ark:bottom-0 ark:right-0 ark:items-end"],
      ["TOP-LEFT", "ark:left-0 ark:top-0 ark:items-start"]
    ];

    for (const [position, classes] of expected) {
      toaster.setAttribute("position", position);
      expect(stack.className).toContain(classes);

      const id = toast(`Posição ${position}`);
      const card = cardOf(canvasElement, `Posição ${position}`);
      expect(card.getAnimations().length, `entrada em ${position}`).toBeGreaterThan(0);
      await waitFor(() => expect(card.getAnimations()).toHaveLength(0));

      toast.dismiss(id);
      expect(card.getAnimations().length, `saída em ${position}`).toBeGreaterThan(0);
      await waitFor(() => expect(canvas.queryByText(`Posição ${position}`)).not.toBeInTheDocument());
    }
  }
};

export const AutoDismissEFila = {
  parameters: {
    docs: {
      description: {
        story:
          "Interaction test: `duration` do host vale para toasts sem duração própria e o timer para enquanto o toast espera na fila de `max-visible` e quando o host sai do DOM; o mesmo `id` substitui o toast; valores inválidos dos atributos caem nos padrões e um evento sem título é ignorado."
      }
    }
  },
  args: {
    duration: 300,
    maxVisible: 2
  },
  render: renderToaster,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const toaster = canvasElement.querySelector<ArkToaster>("ark-toaster")!;
    const cards = (): number => canvasElement.querySelectorAll('[data-ark="toaster-toast"]').length;

    // Três toasts sem duração própria com max-visible 2: o primeiro espera na fila com o relógio parado e só
    // aparece (e conta os seus 300 ms) quando os outros expiram.
    toast("Primeiro");
    toast("Segundo");
    toast("Terceiro");
    expect(titlesOf(canvasElement)).toEqual(["Terceiro", "Segundo"]);
    await waitFor(() => expect(titlesOf(canvasElement)).toEqual(["Primeiro"]), { timeout: 3000, interval: 20 });
    await waitFor(() => expect(cards()).toBe(0), { timeout: 3000 });

    // Mesmo id substitui o toast por um card novo; dispensar duas vezes durante a saída não quebra e um toast novo
    // nesse meio tempo entra por cima sem tocar no card que sai (a animação de saída segue nele).
    toast("Um", { id: "fixo", duration: 0 });
    const um = cardOf(canvasElement, "Um");
    toast("Dois", { id: "fixo", duration: 0 });
    expect(titlesOf(canvasElement)).toEqual(["Dois"]);
    const dois = cardOf(canvasElement, "Dois");
    expect(dois).not.toBe(um);
    toast.dismiss("fixo");
    toast.dismiss("fixo");
    toast("Durante a saída", { duration: 0 });
    expect(cardOf(canvasElement, "Dois")).toBe(dois);
    expect(dois.getAnimations().length).toBeGreaterThan(0);
    expect(titlesOf(canvasElement)).toEqual(["Durante a saída", "Dois"]);
    await waitFor(() => expect(titlesOf(canvasElement)).toEqual(["Durante a saída"]));

    // Atributos inválidos: max-visible volta a 4 e duration a 4000 ms; evento sem título é ignorado.
    toaster.setAttribute("max-visible", "abc");
    toaster.setAttribute("duration", "abc");
    for (let i = 1; i <= 5; i++) toast(`Fila ${i}`, { duration: 0 });
    expect(titlesOf(canvasElement)).toEqual(["Fila 5", "Fila 4", "Fila 3", "Fila 2"]);
    window.dispatchEvent(new CustomEvent("ark-toast", { detail: { description: "sem título" } }));
    expect(cards()).toBe(4);
    toast("Base");
    expect(titlesOf(canvasElement)[0]).toBe("Base");

    // Fora do DOM os timers pendentes são cancelados; de volta, a pilha é re-renderizada.
    toaster.remove();
    canvasElement.appendChild(toaster);
    expect(titlesOf(canvasElement)[0]).toBe("Base");
    toaster.dismiss();
    await waitFor(() => expect(cards()).toBe(0));
  }
};

export const FocoNoTeclado = {
  parameters: {
    docs: {
      description: {
        story:
          "Interaction test: um toast novo entra por cima sem recriar os cards existentes, então o botão que o usuário de teclado está lendo continua focado (e a pilha não reentra no top layer nesse caso). Trocar um atributo do host recria os cards, sem reanimar a entrada."
      }
    }
  },
  args: {
    duration: 0
  },
  render: renderToaster,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const toaster = canvasElement.querySelector<ArkToaster>("ark-toaster")!;

    toast.success("Verde", { duration: 0 });
    toast("Lendo", { duration: 0 });
    const lendo = cardOf(canvasElement, "Lendo");
    const close = lendo.querySelector<HTMLButtonElement>('[data-ark="toaster-toast-close"]')!;
    close.focus();
    expect(document.activeElement).toBe(close);

    toast("Outro", { duration: 0 });
    expect(document.activeElement).toBe(close);
    expect(cardOf(canvasElement, "Lendo")).toBe(lendo);
    expect(titlesOf(canvasElement)).toEqual(["Outro", "Lendo", "Verde"]);
    expect(cardOf(canvasElement, "Verde").className).not.toContain("ark:bg-success-soft");

    // Atributo do host: cards recriados com a nova aparência, sem animação de entrada.
    toaster.setAttribute("rich-colors", "");
    const verde = cardOf(canvasElement, "Verde");
    expect(verde.className).toContain("ark:bg-success-soft");
    expect(cardOf(canvasElement, "Lendo")).not.toBe(lendo);
    expect(verde.getAnimations()).toHaveLength(0);
    expect(titlesOf(canvasElement)).toEqual(["Outro", "Lendo", "Verde"]);

    toast.dismiss();
    await waitFor(() => expect(titlesOf(canvasElement)).toHaveLength(0));
  }
};

export const TestHooks = {
  args: {
    duration: 0,
    testid: "avisos"
  },
  render: renderToaster,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const stack = canvasElement.querySelector('[data-ark="toaster"]');
    await expect(stack).toHaveAttribute("data-testid", "avisos");

    const id = toast.error("Hooks", {
      description: "Descrição",
      actionLabel: "Tentar",
      cancelLabel: "Cancelar"
    });
    const card = cardOf(canvasElement, "Hooks");
    await expect(card).toHaveAttribute("data-testid", "avisos-toast");
    await expect(card).toHaveAttribute("data-toast-id", id);
    for (const part of ["title", "description", "close", "action", "cancel"]) {
      const node = card.querySelector(`[data-ark="toaster-toast-${part}"]`);
      await expect(node).not.toBeNull();
      await expect(node).toHaveAttribute("data-testid", `avisos-toast-${part}`);
    }
    toast.dismiss(id);
  }
};
