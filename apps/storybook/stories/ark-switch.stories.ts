import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkSwitch",
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    labels: { control: "boolean" },
    labelOn: { control: "text" },
    labelOff: { control: "text" },
    icons: { control: "boolean" },
    color: { control: "color" }
  },
  args: {
    checked: false,
    disabled: false,
    intent: "primary",
    theme: "auto",
    size: "md",
    labels: false,
    labelOn: "",
    labelOff: "",
    icons: false,
    color: ""
  }
};

export default meta;

type StoryArgs = {
  checked: boolean;
  disabled: boolean;
  intent: ArkIntent;
  theme: ArkTheme;
  size: ArkSize;
  labels: boolean;
  labelOn: string;
  labelOff: string;
  icons: boolean;
  color: string;
};

function createSwitch(args: Partial<StoryArgs> & { label?: string }): HTMLElement {
  const el = document.createElement("ark-switch");
  el.setAttribute("intent", args.intent || "primary");
  el.setAttribute("theme", args.theme || "auto");
  el.setAttribute("size", args.size || "md");
  el.setAttribute("label", args.label || "Alternar");
  if (args.checked) el.setAttribute("checked", "");
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.labels) el.setAttribute("labels", "");
  if (args.icons) el.setAttribute("icons", "");
  if (args.labelOn) el.setAttribute("label-on", args.labelOn);
  if (args.labelOff) el.setAttribute("label-off", args.labelOff);
  if (args.color) el.setAttribute("color", args.color);
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createSwitch(args)
};

export const Styles = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";

    const rows: Array<{ label: string; off: Partial<StoryArgs>; on: Partial<StoryArgs> }> = [
      { label: "Simples", off: {}, on: { checked: true } },
      { label: "Com texto", off: { labels: true }, on: { labels: true, checked: true } },
      {
        label: "Com ícones",
        off: { icons: true, intent: "success" },
        on: { icons: true, intent: "success", checked: true }
      },
      {
        label: "Texto + ícones",
        off: { labels: true, icons: true, intent: "success" },
        on: { labels: true, icons: true, intent: "success", checked: true }
      },
      {
        label: "Danger/Success",
        off: { icons: true, intent: "danger", checked: true },
        on: { icons: true, intent: "success", checked: true }
      }
    ];

    rows.forEach((row) => {
      const line = document.createElement("div");
      line.style.display = "flex";
      line.style.alignItems = "center";
      line.style.gap = "16px";

      const label = document.createElement("span");
      label.style.width = "120px";
      label.style.font = "13px sans-serif";
      label.style.color = "#475569";
      label.textContent = row.label;
      line.appendChild(label);

      line.appendChild(createSwitch({ ...row.off, label: `${row.label} off` }));
      line.appendChild(createSwitch({ ...row.on, label: `${row.label} on` }));
      wrap.appendChild(line);
    });

    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "16px";

    ["xs", "sm", "md", "lg", "xl"].forEach((size) => {
      wrap.appendChild(createSwitch({ size: size as ArkSize, checked: true, label: size }));
    });

    return wrap;
  }
};

export const Intents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";

    ["primary", "secondary", "success", "warning", "danger", "info", "neutral"].forEach((intent) => {
      wrap.appendChild(createSwitch({ intent: intent as ArkIntent, checked: true, label: intent }));
    });

    return wrap;
  }
};

export const TogglesOnClick = {
  render: () => createSwitch({ label: "Notificações" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "Notificações" });

    await expect(control).toHaveAttribute("aria-checked", "false");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-checked", "true");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-checked", "false");
  }
};

export const TestHooks = {
  render: () => {
    const el = createSwitch({ labels: true, label: "Hooks" });
    el.setAttribute("testid", "meu-switch");
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const control = canvasElement.querySelector('[data-ark="switch"]');
    const thumb = canvasElement.querySelector('[data-ark="switch-thumb"]');

    await expect(control).not.toBeNull();
    await expect(thumb).not.toBeNull();
    await expect(control).toHaveAttribute("data-testid", "meu-switch");
    await expect(thumb).toHaveAttribute("data-testid", "meu-switch-thumb");
  }
};

export const DisabledDoesNotToggle = {
  render: () => createSwitch({ disabled: true, label: "Bloqueado" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const control = canvasElement.querySelector("ark-switch button") as HTMLButtonElement;

    await expect(control).toBeDisabled();
    await expect(control).toHaveAttribute("aria-checked", "false");
  }
};

export const ChildrenAsLabel = {
  parameters: {
    docs: {
      description: {
        story:
          "Filhos do usuário viram o rótulo visível: `<ark-switch>Notificações por e-mail</ark-switch>`. O trilho vem antes do texto (ordem do flex, sem mover nós), o texto dá o nome acessível (`aria-labelledby` no host) e um clique nele alterna, como num `<label>`; um link ou controle dentro do rótulo fica com o próprio comportamento. `aria-label` e `label` continuam com precedência no nome. Sem filhos, nada muda: o host não ganha classe nem layout."
      }
    }
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "12px";
    wrap.style.width = "320px";

    const email = document.createElement("ark-switch");
    email.dataset.case = "email";
    email.textContent = "Notificações por e-mail";

    const terms = document.createElement("ark-switch");
    terms.dataset.case = "terms";
    terms.append("Aceito os ");
    const link = document.createElement("a");
    link.href = "#termos";
    link.textContent = "termos";
    terms.append(link);

    const named = document.createElement("ark-switch");
    named.dataset.case = "named";
    named.setAttribute("label", "Modo escuro");
    named.textContent = "Tema";

    const locked = document.createElement("ark-switch");
    locked.dataset.case = "locked";
    locked.setAttribute("disabled", "");
    locked.textContent = "Bloqueado";

    const bare = document.createElement("ark-switch");
    bare.dataset.case = "bare";
    bare.setAttribute("label", "Sem filhos");

    const late = document.createElement("ark-switch");
    late.dataset.case = "late";

    wrap.append(email, terms, named, locked, bare, late);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = (id: string) => canvasElement.querySelector(`ark-switch[data-case="${id}"]`) as HTMLElement;
    const track = (id: string) => host(id).querySelector('[role="switch"]') as HTMLElement;
    const changes: string[] = [];
    canvasElement.addEventListener("change", (event) => {
      const id = (event.target as HTMLElement).closest("ark-switch")?.getAttribute("data-case");
      if (id) changes.push(id);
    });

    // O texto dá o nome e fica depois do trilho.
    const email = canvas.getByRole("switch", { name: "Notificações por e-mail" });
    await expect(email).toBe(track("email"));
    await expect(track("email")).toHaveAttribute("aria-labelledby", host("email").id);
    await expect(track("email").getBoundingClientRect().right).toBeLessThanOrEqual(
      host("email").getBoundingClientRect().left + track("email").getBoundingClientRect().width + 0.5
    );

    // Clique no texto alterna uma vez e foca o trilho; clique no trilho também só uma vez.
    await userEvent.click(host("email"));
    await expect(host("email")).toHaveAttribute("checked");
    await expect(document.activeElement).toBe(track("email"));
    await userEvent.click(track("email"));
    await expect(host("email")).not.toHaveAttribute("checked");
    await expect(changes).toEqual(["email", "email"]);

    // Link dentro do rótulo: segue sendo link, sem alternar.
    const termsLink = host("terms").querySelector("a") as HTMLAnchorElement;
    const stay = (event: Event) => event.preventDefault();
    termsLink.addEventListener("click", stay);
    await userEvent.click(termsLink);
    termsLink.removeEventListener("click", stay);
    await expect(host("terms")).not.toHaveAttribute("checked");
    await expect(canvas.getByRole("switch", { name: "Aceito os termos" })).toBe(track("terms"));

    // label continua com precedência no nome; o texto segue clicável.
    await expect(track("named")).toHaveAttribute("aria-label", "Modo escuro");
    await expect(track("named")).not.toHaveAttribute("aria-labelledby");

    // Desabilitado: o texto não alterna.
    host("locked").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await expect(host("locked")).not.toHaveAttribute("checked");

    // Sem filhos: nenhuma classe no host e o nome segue vindo do label.
    await expect(host("bare").className).toBe("");
    await expect(track("bare")).toHaveAttribute("aria-label", "Sem filhos");
    await expect(track("bare")).not.toHaveAttribute("aria-labelledby");

    // Filhos que chegam depois (frameworks) viram o rótulo; quando saem, o host volta a não ter classe.
    await expect(host("late").className).toBe("");
    host("late").append("Chegou depois");
    await waitFor(() => expect(canvas.getByRole("switch", { name: "Chegou depois" })).toBe(track("late")));
    await expect(host("late").className).toContain("ark:inline-flex");
    for (const node of Array.from(host("late").childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) node.remove();
    }
    await waitFor(() => expect(host("late").className).toBe(""));
    await expect(track("late")).not.toHaveAttribute("aria-labelledby");
    await expect(changes).toEqual(["email", "email"]);
  }
};
