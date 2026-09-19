import type { ArkTheme, ArkToastPosition } from "@tooark/core";
import { toast } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkToaster",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Toaster inspirado no Sonner com API programatica: tipos de toast, posicao configuravel, rich colors, botoes de acao/cancelamento e dismiss global."
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
};

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
        description: "Alteracoes publicadas no repositorio.",
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
      toast.info("Nova versao disponivel", {
        description: "Atualize para acessar os novos componentes.",
        duration: args.duration
      });
    })
  );

  controls.appendChild(
    createButton("Warning", () => {
      toast.warning("Conexao instavel", {
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
          "Interaction test: dispara um toast, verifica a exibicao, fecha pelo botao Close e aguarda a animacao de saida remover o card do DOM."
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

    // arkExit anima a saida antes de remover o card do DOM
    await waitFor(() => expect(canvas.queryByText("Projeto salvo")).not.toBeInTheDocument());
  }
};

export const TopLayer = {
  parameters: {
    docs: {
      description: {
        story:
          'A pilha e um `popover="manual"` proprio: entra no top layer com o primeiro toast e sai quando esvazia, sem z-index. Um toast que chega com um dialogo aberto fica por cima do scrim, porque a pilha reentra no top layer a cada toast novo.'
      }
    }
  },
  args: {
    duration: 0
  },
  render: (args: StoryArgs) => {
    const page = renderToaster(args);
    const dialog = document.createElement("ark-dialog");
    dialog.setAttribute("label", "Dialogo aberto");
    dialog.setAttribute("lang", "pt");
    const body = document.createElement("p");
    body.textContent = "Dispare um toast com este dialogo aberto: ele aparece por cima do scrim.";
    dialog.appendChild(body);
    const footer = document.createElement("div");
    footer.setAttribute("slot", "footer");
    footer.appendChild(
      createButton("Toast por cima", () => {
        toast.success("Por cima do dialogo", { duration: args.duration });
      })
    );
    dialog.appendChild(footer);
    page.querySelector("div")?.appendChild(createButton("Abrir dialogo", () => dialog.setAttribute("open", "")));
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

    // Dialogo aberto depois da pilha: o toast seguinte reentra no top layer e fica por cima do scrim.
    await userEvent.click(canvas.getByRole("button", { name: "Abrir dialogo" }));
    const dialog = canvasElement.querySelector<HTMLElement>("ark-dialog")!;
    await waitFor(() => expect(dialog.matches(":popover-open")).toBe(true));
    await userEvent.click(canvas.getByRole("button", { name: "Toast por cima" }));
    const card = (await canvas.findByText("Por cima do dialogo")).closest<HTMLElement>('[data-ark="toaster-toast"]')!;
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
