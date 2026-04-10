import { toast } from "@tooark/core";
import type { ArkTheme, ArkToastPosition } from "@tooark/core";

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
