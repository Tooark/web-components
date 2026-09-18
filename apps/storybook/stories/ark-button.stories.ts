import type { ArkButtonStyleOptions, ArkButtonType, ArkRounded, ArkSize } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkButton",
  argTypes: {
    variant: { control: "select", options: ["solid", "outline", "ghost"] },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    rounded: { control: "inline-radio", options: ["none", "xs", "sm", "md", "lg", "xl", "full"] },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    iconOnly: { control: "boolean" },
    fullWidth: { control: "boolean" },
    href: { control: "text" },
    type: { control: "radio", options: ["button", "submit", "reset"] },
    color: { control: "color" },
    textColor: { control: "color" },
    label: { control: "text" }
  },
  args: {
    variant: "primary",
    intent: "primary",
    theme: "auto",
    size: "md",
    rounded: "md",
    disabled: false,
    loading: false,
    iconOnly: false,
    fullWidth: false,
    href: "",
    type: "button",
    color: "",
    textColor: "",
    label: "Ação principal"
  }
};

export default meta;

type StoryArgs = {
  variant: NonNullable<ArkButtonStyleOptions["variant"]>;
  intent: NonNullable<ArkButtonStyleOptions["intent"]>;
  theme: NonNullable<ArkButtonStyleOptions["theme"]>;
  size: ArkSize;
  rounded: ArkRounded;
  disabled: boolean;
  loading: boolean;
  iconOnly: boolean;
  fullWidth: boolean;
  href: string;
  type: ArkButtonType;
  color: string;
  textColor: string;
  label: string;
};

export const Playground = {
  render: ({
    variant,
    intent,
    theme,
    size,
    rounded,
    disabled,
    loading,
    iconOnly,
    fullWidth,
    href,
    type,
    color,
    textColor,
    label
  }: StoryArgs) => {
    const element = document.createElement("ark-button");
    element.setAttribute("variant", variant);
    element.setAttribute("intent", intent);
    element.setAttribute("theme", theme);
    element.setAttribute("size", size);
    element.setAttribute("rounded", rounded);
    element.setAttribute("type", type);
    if (color) element.setAttribute("color", color);
    if (textColor) element.setAttribute("text-color", textColor);
    if (href) element.setAttribute("href", href);

    if (disabled) element.setAttribute("disabled", "");
    if (loading) element.setAttribute("loading", "");
    if (iconOnly) element.setAttribute("icon-only", "");
    if (fullWidth) element.setAttribute("full-width", "");

    element.textContent = label;
    return element;
  }
};

export const Variants = {
  args: {
    theme: "light",
    disabled: false
  },
  // Aplica o theme dos args: sem ele o host fica em color-scheme "light dark" e segue o sistema,
  // e num SO escuro os tokens resolvem o lado dark sobre o canvas claro do Storybook.
  render: ({ theme, disabled }: Pick<StoryArgs, "theme" | "disabled">) => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";

    ["primary", "secondary", "success", "warning", "danger", "info", "outline", "ghost"].forEach((v) => {
      const el = document.createElement("ark-button");
      el.setAttribute("variant", v);
      el.setAttribute("theme", theme);
      if (disabled) el.setAttribute("disabled", "");
      el.textContent = v;
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const IntentsDark = {
  args: {
    variant: "solid",
    theme: "dark"
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";

    ["primary", "secondary", "success", "warning", "danger", "info", "neutral"].forEach((intent) => {
      const el = document.createElement("ark-button");
      el.setAttribute("variant", "solid");
      el.setAttribute("intent", intent);
      el.setAttribute("theme", "dark");
      el.textContent = intent;
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "16px";

    (["xs", "sm", "md", "lg", "xl"] as ArkSize[]).forEach((size) => {
      const row = document.createElement("div");
      row.dataset.size = size;
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "12px";

      const button = document.createElement("ark-button");
      button.setAttribute("size", size);
      button.textContent = `Botao ${size}`;

      const iconOnly = document.createElement("ark-button");
      iconOnly.setAttribute("size", size);
      iconOnly.setAttribute("icon-only", "");
      iconOnly.setAttribute("rounded", "full");
      iconOnly.setAttribute("aria-label", `Icone ${size}`);
      iconOnly.textContent = "+";

      row.append(button, iconOnly);
      wrap.appendChild(row);
    });

    return wrap;
  },
  // A altura vem do token --ark-size-* (min-height); o botao so de icone tambem e quadrado.
  // O alinhamento com os outros controles do mesmo size fica em alignment.stories.ts.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const heights: Record<ArkSize, number> = { xs: 24, sm: 28, md: 36, lg: 44, xl: 52 };

    for (const [size, height] of Object.entries(heights) as [ArkSize, number][]) {
      const row = canvasElement.querySelector<HTMLElement>(`[data-size="${size}"]`);
      if (!row) throw new Error(`linha ${size} nao encontrada`);

      const controls = [
        row.querySelector<HTMLElement>("ark-button:not([icon-only])"),
        row.querySelector<HTMLElement>("ark-button[icon-only]")
      ];

      for (const control of controls) {
        expect(control).not.toBeNull();
        expect(Math.round((control as HTMLElement).getBoundingClientRect().height)).toBe(height);
      }

      const circle = row.querySelector<HTMLElement>("ark-button[icon-only]") as HTMLElement;
      expect(Math.round(circle.getBoundingClientRect().width)).toBe(height);
    }
  }
};

export const Rounded = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.alignItems = "center";
    wrap.style.gap = "12px";

    ["none", "xs", "sm", "md", "lg", "xl", "full"].forEach((rounded) => {
      const el = document.createElement("ark-button");
      el.setAttribute("rounded", rounded);
      el.textContent = rounded;
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const IconOnlyCircle = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "12px";

    [
      { intent: "success", icon: "✓" },
      { intent: "danger", icon: "✕" },
      { intent: "info", icon: "i" },
      { intent: "primary", icon: "+" }
    ].forEach(({ intent, icon }) => {
      const el = document.createElement("ark-button");
      el.setAttribute("icon-only", "");
      el.setAttribute("rounded", "full");
      el.setAttribute("intent", intent);
      el.setAttribute("aria-label", intent);
      const span = document.createElement("span");
      span.style.width = "1.25em";
      span.style.textAlign = "center";
      span.textContent = icon;
      el.appendChild(span);
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const Loading = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "12px";

    ["solid", "outline", "ghost"].forEach((variant) => {
      const el = document.createElement("ark-button");
      el.setAttribute("variant", variant);
      el.setAttribute("loading", "");
      el.textContent = "Salvando...";
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const FullWidth = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.width = "360px";
    wrap.style.display = "grid";
    wrap.style.gap = "8px";

    const solid = document.createElement("ark-button");
    solid.setAttribute("full-width", "");
    solid.textContent = "Continuar";
    wrap.appendChild(solid);

    const outline = document.createElement("ark-button");
    outline.setAttribute("full-width", "");
    outline.setAttribute("variant", "outline");
    outline.textContent = "Cancelar";
    wrap.appendChild(outline);

    return wrap;
  }
};

export const AsLink = {
  render: () => {
    const el = document.createElement("ark-button");
    el.setAttribute("href", "https://github.com/tooark");
    el.setAttribute("target", "_blank");
    el.setAttribute("variant", "outline");
    el.textContent = "Abrir no GitHub";
    return el;
  }
};

export const CustomColors = {
  args: {
    variant: "solid",
    color: "#7c3aed",
    textColor: "#ffffff",
    label: "Custom color"
  },
  render: Playground.render
};

export const HostIsTheControl = {
  render: () => {
    const el = document.createElement("ark-button");
    el.setAttribute("testid", "salvar");
    el.textContent = "Salvar";
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector<HTMLElement>("ark-button")!;

    // O host é o botão acessível: role, foco e hook de teste no próprio elemento.
    const control = canvas.getByRole("button", { name: "Salvar" });
    await expect(control).toBe(host);
    await expect(host).toHaveAttribute("data-testid", "salvar");
    await expect(host).toHaveAttribute("tabindex", "0");

    let clicks = 0;
    host.addEventListener("click", () => clicks++);
    await userEvent.click(host);
    host.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(clicks).toBe(3);
  }
};

export const ChildrenStayInHost = {
  render: () => {
    const el = document.createElement("ark-button");
    el.setAttribute("loading", "");
    el.appendChild(document.createTextNode("Enviando"));
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector<HTMLElement>("ark-button")!;
    const text = Array.from(host.childNodes).find((node) => node.nodeType === Node.TEXT_NODE)!;

    // Simula o que React/Vue fazem ao reconciliar filhos: inserir antes de um
    // nó existente e remover nós. Como o componente não move os filhos do
    // usuário, as referências continuam válidas e nada lança.
    const icon = document.createElement("span");
    icon.textContent = "✓";
    host.insertBefore(icon, text);
    host.removeChild(text);
    host.appendChild(document.createTextNode("Enviado"));

    await expect(host.textContent).toContain("✓");
    await expect(host.textContent).toContain("Enviado");
    await expect(host.querySelector('[data-ark="button-spinner"]')).not.toBeNull();

    host.removeAttribute("loading");
    await expect(host.querySelector('[data-ark="button-spinner"]')).toBeNull();
  }
};

export const SubmitsForm = {
  render: () => {
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.name = "q";
    input.setAttribute("aria-label", "Busca");
    input.value = "tooark";
    form.appendChild(input);

    const el = document.createElement("ark-button");
    el.setAttribute("type", "submit");
    el.textContent = "Enviar";
    form.appendChild(el);
    return form;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const form = canvasElement.querySelector("form")!;
    const submits: string[] = [];
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submits.push(new FormData(form).get("q") as string);
    });

    await userEvent.click(within(canvasElement).getByRole("button", { name: "Enviar" }));
    await waitFor(() => expect(submits).toEqual(["tooark"]));
  }
};

export const LinkIsFocusable = {
  render: AsLink.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector<HTMLElement>("ark-button")!;
    const link = within(canvasElement).getByRole("link", { name: "Abrir no GitHub" });

    await expect(link).toHaveAttribute("href", "https://github.com/tooark");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(host).not.toHaveAttribute("role");

    host.setAttribute("disabled", "");
    await expect(link).not.toHaveAttribute("href");
    await expect(link).toHaveAttribute("aria-disabled", "true");
  }
};

export const Status = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "12px";

    for (const [status, label, variant, loading] of [
      ["success", "Salvo", "solid", false],
      ["error", "Falhou", "outline", false],
      ["success", "Carregando vence", "ghost", true]
    ] as [string, string, string, boolean][]) {
      const el = document.createElement("ark-button");
      el.setAttribute("variant", variant);
      el.setAttribute("status", status);
      el.setAttribute("status-label", label);
      if (loading) el.setAttribute("loading", "");
      el.textContent = label;
      wrap.appendChild(el);
    }
    return wrap;
  }
};

export const StatusAnnounces = {
  render: () => {
    const el = document.createElement("ark-button");
    el.textContent = "Enviar";
    return el;
  },
  // success/error trocam o glifo (com fade-in) e anunciam status-label pela live region unica do core; loading
  // vence o status; nada de live region dentro do host, cujo nome acessivel continua "Enviar".
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("ark-button")!;
    const icon = (): Element | null => host.querySelector('[data-ark="button-status-icon"]');
    const region = (politeness: string): HTMLElement | null =>
      document.querySelector<HTMLElement>(`[data-ark="announcer-${politeness}"]`);

    expect(icon()).toBeNull();
    host.setAttribute("status-label", "Requisicao enviada");
    host.setAttribute("status", "success");
    expect(icon()).not.toBeNull();
    await expect(icon()).toHaveAttribute("aria-hidden", "true");
    expect(icon()?.querySelector("svg")?.classList.contains("ark-animate-fade-in")).toBe(true);
    expect(host.firstElementChild).toBe(icon());
    await waitFor(() => expect(region("polite")?.textContent).toBe("Requisicao enviada"));
    expect(host.querySelector('[aria-live], [role="status"], [role="alert"]')).toBeNull();
    expect(host.textContent?.trim()).toBe("Enviar");

    // Ordem do React (status antes de status-label na mesma passada): o anuncio le o rotulo novo; erro e assertive.
    const successIcon = icon();
    host.setAttribute("status", "error");
    host.setAttribute("status-label", "Falha ao enviar");
    expect(icon()).not.toBe(successIcon);
    await waitFor(() => expect(region("assertive")?.textContent).toBe("Falha ao enviar"));

    host.setAttribute("loading", "");
    expect(icon()).toBeNull();
    expect(host.querySelector('[data-ark="button-spinner"]')).not.toBeNull();
    host.removeAttribute("loading");
    expect(icon()).not.toBeNull();

    // O app limpa o status; o botao so mostra.
    host.removeAttribute("status");
    expect(icon()).toBeNull();
  }
};
