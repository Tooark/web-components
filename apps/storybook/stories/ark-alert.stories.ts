import type { ArkAlertLive, ArkAlertVariant, ArkIntent, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkAlert",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Alerta ou banner: o host `ark-alert` e a caixa e os filhos sao a mensagem (texto solto ou elementos). `slot="icon"` a esquerda e `slot="action"` a direita ficam onde estao, posicionados por CSS; `heading` cria um titulo proprio e `dismissible` o botao de dispensar. `live` define a live region (polite = role status, assertive = role alert, off). Dispensar anima a saida, emite `ark-dismiss` e esconde o host com `hidden`; remover e do app.'
      }
    }
  },
  argTypes: {
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    variant: { control: "inline-radio", options: ["box", "banner"] },
    heading: { control: "text" },
    message: { control: "text" },
    dismissible: { control: "boolean" },
    live: { control: "inline-radio", options: ["polite", "assertive", "off"] },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    withIcon: { control: "boolean" },
    withAction: { control: "boolean" }
  },
  args: {
    intent: "info",
    variant: "box",
    heading: "Nova versao disponivel",
    message: "Recarregue para usar a versao 2.4 do app.",
    dismissible: true,
    live: undefined,
    lang: "pt",
    theme: "auto",
    withIcon: true,
    withAction: true
  }
};

export default meta;

type StoryArgs = {
  intent: ArkIntent;
  variant: ArkAlertVariant;
  heading: string;
  message: string;
  dismissible: boolean;
  live?: ArkAlertLive;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  withIcon: boolean;
  withAction: boolean;
  testid?: string;
  /** Mensagem como texto solto (nó de texto) em vez de <p>. */
  bareText?: boolean;
  actionLabel?: string;
};

type AlertEl = HTMLElement & { dismiss: () => void; dismissible: boolean };

const INFO_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01M11 12h1v4h1"></path></svg>';
const WARN_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"></path><path d="M12 10v4M12 17h.01"></path></svg>';

function createAlert(args: Partial<StoryArgs>): AlertEl {
  const alert = document.createElement("ark-alert") as AlertEl;
  if (args.intent) alert.setAttribute("intent", args.intent);
  if (args.variant) alert.setAttribute("variant", args.variant);
  if (args.heading) alert.setAttribute("heading", args.heading);
  if (args.dismissible) alert.setAttribute("dismissible", "");
  if (args.live) alert.setAttribute("live", args.live);
  if (args.lang) alert.setAttribute("lang", args.lang);
  if (args.theme) alert.setAttribute("theme", args.theme);
  if (args.testid) alert.setAttribute("testid", args.testid);

  if (args.withIcon !== false) {
    const icon = document.createElement("span");
    icon.setAttribute("slot", "icon");
    icon.innerHTML = args.intent === "warning" || args.intent === "danger" ? WARN_SVG : INFO_SVG;
    alert.appendChild(icon);
  }
  const message = args.message ?? "Recarregue para usar a versao 2.4 do app.";
  if (args.bareText) {
    alert.appendChild(document.createTextNode(message));
  } else {
    const p = document.createElement("p");
    p.textContent = message;
    alert.appendChild(p);
  }
  if (args.withAction) {
    const action = document.createElement("span");
    action.setAttribute("slot", "action");
    const button = document.createElement("ark-button");
    button.setAttribute("size", "sm");
    button.setAttribute("variant", "outline");
    button.setAttribute("intent", args.intent ?? "info");
    button.textContent = args.actionLabel ?? "Recarregar";
    action.appendChild(button);
    alert.appendChild(action);
  }
  return alert;
}

function column(...items: HTMLElement[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col gap-4";
  for (const item of items) wrap.appendChild(item);
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createAlert(args)
};

export const Intents = {
  render: () =>
    column(
      ...(["info", "success", "warning", "danger", "neutral", "primary"] as ArkIntent[]).map((intent) =>
        createAlert({
          intent,
          message: `Alerta ${intent}: cor suave do intent, com icone e botao de dispensar.`,
          dismissible: true,
          lang: "pt"
        })
      )
    )
};

export const Banner = {
  render: () =>
    column(
      createAlert({
        variant: "banner",
        intent: "warning",
        message: "Voce esta offline. As alteracoes serao sincronizadas quando a conexao voltar.",
        withAction: false,
        lang: "pt"
      }),
      createAlert({
        variant: "banner",
        intent: "info",
        message: "Nova versao disponivel.",
        actionLabel: "Atualizar",
        dismissible: true,
        lang: "pt"
      })
    )
};

export const HeadingAndAction = {
  render: () =>
    createAlert({
      intent: "primary",
      heading: "Workspace pessoal",
      message:
        "Este workspace e so seu. Convide pessoas para colaborar ou crie um workspace de equipe para compartilhar colecoes, ambientes e variaveis com todo mundo.",
      actionLabel: "Criar equipe",
      dismissible: true,
      lang: "pt"
    })
};

export const BareText = {
  render: () =>
    column(
      createAlert({ intent: "success", message: "Salvo com sucesso.", bareText: true, withAction: false }),
      createAlert({
        intent: "danger",
        message: "Sem icone nem acao: o texto comeca na borda esquerda e vai ate a direita.",
        bareText: true,
        withIcon: false,
        withAction: false
      })
    )
};

// Dispensar: saida animada, `ark-dismiss` uma vez, host `hidden`; tirar o hidden reexibe sem a opacidade
// presa da animacao. O rotulo do botao segue lang; `live` e o intent definem o role.
export const Dismiss = {
  render: () => createAlert({ intent: "info", message: "Dispense este alerta.", dismissible: true, lang: "pt" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const alert = canvasElement.querySelector("ark-alert") as AlertEl;
    const dismissed: Event[] = [];
    alert.addEventListener("ark-dismiss", (event) => dismissed.push(event));

    await expect(alert).toHaveAttribute("role", "status");
    alert.setAttribute("intent", "danger");
    await expect(alert).toHaveAttribute("role", "alert");
    alert.setAttribute("live", "polite");
    await expect(alert).toHaveAttribute("role", "status");
    alert.setAttribute("live", "off");
    await expect(alert).not.toHaveAttribute("role");
    alert.removeAttribute("live");
    alert.setAttribute("intent", "info");

    const button = canvas.getByRole("button", { name: "Dispensar" });
    alert.setAttribute("lang", "en");
    await expect(button).toHaveAttribute("aria-label", "Dismiss");

    await userEvent.click(button);
    await waitFor(() => expect(alert).toHaveAttribute("hidden"));
    await expect(dismissed).toHaveLength(1);
    await expect(getComputedStyle(alert).display).toBe("none");

    alert.removeAttribute("hidden");
    await expect(alert.getAnimations()).toHaveLength(0);
    await expect(getComputedStyle(alert).opacity).toBe("1");

    // Sem dismissible o botao sai; dismiss() pelo JS continua funcionando.
    alert.dismissible = false;
    await expect(canvas.queryByRole("button", { name: "Dismiss" })).toBeNull();
    alert.dismiss();
    await waitFor(() => expect(alert).toHaveAttribute("hidden"));
    await expect(dismissed).toHaveLength(2);
  }
};

// Texto solto flui entre o icone e o botao de dispensar; a acao flutua a direita da primeira linha.
export const Layout = {
  render: () =>
    createAlert({
      intent: "info",
      message: "Texto solto ao lado do icone.",
      bareText: true,
      dismissible: true,
      withAction: true
    }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const alert = canvasElement.querySelector("ark-alert") as AlertEl;
    const icon = alert.querySelector('[slot="icon"]') as HTMLElement;
    const action = alert.querySelector('[slot="action"]') as HTMLElement;
    const dismiss = alert.querySelector('[data-ark="alert-dismiss"]') as HTMLElement;
    const range = document.createRange();
    range.selectNodeContents(Array.from(alert.childNodes).find((node) => node.nodeType === Node.TEXT_NODE) as Node);
    const text = range.getBoundingClientRect();
    const iconBox = icon.getBoundingClientRect();
    const actionBox = action.getBoundingClientRect();
    const dismissBox = dismiss.getBoundingClientRect();
    const box = alert.getBoundingClientRect();

    await expect(iconBox.right).toBeLessThanOrEqual(text.left);
    await expect(text.right).toBeLessThanOrEqual(actionBox.left);
    await expect(actionBox.right).toBeLessThanOrEqual(dismissBox.left);
    await expect(Math.round(dismissBox.right)).toBe(Math.round(box.right - 12 - 1));
    // Icone e texto centrados na mesma linha.
    await expect(Math.abs(iconBox.top + iconBox.height / 2 - (text.top + text.height / 2))).toBeLessThan(2);
    await expect(Math.abs(actionBox.top + actionBox.height / 2 - (text.top + text.height / 2))).toBeLessThan(3);
    // Sem icone o texto encosta no padding.
    icon.remove();
    await waitFor(() => expect(Math.round(range.getBoundingClientRect().left)).toBe(Math.round(box.left + 16 + 1)));
  }
};

export const TestHooks = {
  render: () => createAlert({ heading: "Hooks", dismissible: true, withAction: true, testid: "meu-alerta" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="alert"]')).toHaveAttribute("data-testid", "meu-alerta");
    await expect(canvasElement.querySelector('[data-ark="alert-heading"]')).toHaveAttribute(
      "data-testid",
      "meu-alerta-heading"
    );
    await expect(canvasElement.querySelector('[data-ark="alert-icon"]')).toHaveAttribute(
      "data-testid",
      "meu-alerta-icon"
    );
    await expect(canvasElement.querySelector('[data-ark="alert-action"]')).toHaveAttribute(
      "data-testid",
      "meu-alerta-action"
    );
    await expect(canvasElement.querySelector('[data-ark="alert-dismiss"]')).toHaveAttribute(
      "data-testid",
      "meu-alerta-dismiss"
    );
  }
};
