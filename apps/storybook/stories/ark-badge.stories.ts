import type { ArkBadgeSize, ArkBadgeVariant, ArkIntent, ArkRounded, ArkTheme } from "@tooark/core";
import { expect, waitFor } from "storybook/test";

const INTENTS: ArkIntent[] = ["primary", "secondary", "success", "warning", "danger", "info", "neutral"];
const VARIANTS: ArkBadgeVariant[] = ["soft", "solid", "outline"];
const SIZES: ArkBadgeSize[] = ["xs", "sm", "md"];

const meta = {
  title: "Core/ArkBadge",
  parameters: {
    docs: {
      description: {
        component:
          "Rotulo curto de status ou categoria. O proprio host e o badge: icone e texto entram como filhos e ficam onde estao. `intent` (padrao neutral), `variant` soft/solid/outline, `size` xs/sm/md, `rounded` (padrao full) e `color` para cores do app (metodos HTTP, tags) com fundo suave por color-mix. Nao e interativo: um badge clicavel e um ark-button pequeno."
      }
    }
  },
  argTypes: {
    intent: { control: "select", options: INTENTS },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: SIZES },
    rounded: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "full"] },
    color: { control: "color", description: "Cor propria; vence o intent" },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    label: { control: "text" }
  },
  args: {
    intent: "neutral",
    variant: "soft",
    size: "md",
    rounded: "full",
    color: "",
    theme: "auto",
    label: "Badge"
  }
};

export default meta;

type StoryArgs = {
  intent: ArkIntent;
  variant: ArkBadgeVariant;
  size: ArkBadgeSize;
  rounded: ArkRounded;
  color: string;
  theme: ArkTheme;
  label: string;
};

function createBadge(
  label: string,
  options: {
    intent?: string;
    variant?: string;
    size?: string;
    rounded?: string;
    color?: string;
    theme?: string;
    testid?: string;
  } = {}
): HTMLElement {
  const el = document.createElement("ark-badge");
  if (options.intent) el.setAttribute("intent", options.intent);
  if (options.variant) el.setAttribute("variant", options.variant);
  if (options.size) el.setAttribute("size", options.size);
  if (options.rounded) el.setAttribute("rounded", options.rounded);
  if (options.color) el.setAttribute("color", options.color);
  if (options.theme) el.setAttribute("theme", options.theme);
  if (options.testid) el.setAttribute("testid", options.testid);
  el.textContent = label;
  return el;
}

function createRow(): HTMLElement {
  const row = document.createElement("div");
  row.className = "flex flex-wrap items-center gap-2";
  return row;
}

function createColumn(): HTMLElement {
  const column = document.createElement("div");
  column.className = "flex flex-col gap-3";
  return column;
}

export const Playground = {
  render: ({ label, ...options }: StoryArgs) => createBadge(label, options)
};

export const Intents = {
  render: () => {
    const column = createColumn();
    for (const variant of VARIANTS) {
      const row = createRow();
      for (const intent of INTENTS) row.appendChild(createBadge(intent, { intent, variant }));
      column.appendChild(row);
    }
    return column;
  }
};

export const Sizes = {
  render: () => {
    const row = createRow();
    for (const size of SIZES) row.appendChild(createBadge(size, { size, intent: "primary" }));
    return row;
  }
};

export const Rounded = {
  render: () => {
    const row = createRow();
    for (const rounded of ["none", "sm", "md", "lg", "full"]) {
      row.appendChild(createBadge(rounded, { rounded, intent: "info", variant: "outline" }));
    }
    return row;
  }
};

// Cores do app, nao da lib: metodos HTTP de um cliente de API.
const HTTP_METHODS: Array<[string, string]> = [
  ["GET", "#2563eb"],
  ["POST", "#16a34a"],
  ["PUT", "#d97706"],
  ["PATCH", "#7c3aed"],
  ["DELETE", "#dc2626"]
];

export const CustomColors = {
  render: () => {
    const column = createColumn();
    for (const variant of VARIANTS) {
      const row = createRow();
      for (const [method, color] of HTTP_METHODS) {
        row.appendChild(createBadge(method, { color, variant, rounded: "sm", size: "sm" }));
      }
      column.appendChild(row);
    }
    return column;
  }
};

export const WithIcon = {
  render: () => {
    const row = createRow();
    for (const intent of ["success", "warning", "danger"]) {
      const badge = createBadge("", { intent });
      // Icone do usuario: qualquer SVG, sem biblioteca embutida.
      badge.innerHTML =
        '<svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="4" fill="currentColor"></circle></svg>';
      badge.appendChild(
        document.createTextNode(intent === "success" ? "Online" : intent === "warning" ? "Degradado" : "Offline")
      );
      row.appendChild(badge);
    }
    return row;
  }
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";
    const column = createColumn();
    for (const variant of VARIANTS) {
      const row = createRow();
      for (const intent of INTENTS) row.appendChild(createBadge(intent, { intent, variant, theme: "dark" }));
      column.appendChild(row);
    }
    wrap.appendChild(column);
    return wrap;
  }
};

export const HostIsTheBadge = {
  render: () => createBadge("Ativo", { intent: "success" }),
  // O host carrega as classes; um framework que reescreve `class` nao as apaga, e mudar o atributo troca a paleta.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const badge = canvasElement.querySelector<HTMLElement>("ark-badge")!;

    await expect(badge).toHaveAttribute("data-ark", "badge");
    await expect(badge).toHaveClass("ark:inline-flex");
    await expect(badge).toHaveClass("ark:bg-success-soft");
    await expect(badge.textContent).toBe("Ativo");

    badge.className = "custom";
    await waitFor(() => expect(badge).toHaveClass("custom"));
    await expect(badge).toHaveClass("ark:bg-success-soft");

    badge.setAttribute("variant", "solid");
    await expect(badge).toHaveClass("ark:bg-success");
    await expect(badge).not.toHaveClass("ark:bg-success-soft");

    badge.setAttribute("size", "xs");
    await expect(badge).toHaveClass("ark:px-1.5");
    await expect(badge).not.toHaveClass("ark:px-2.5");
  }
};

export const CustomColorUsesVariables = {
  render: () => createBadge("GET", { color: "#2563eb" }),
  // Com `color` as classes apontam para variaveis inline e o intent sai de cena; sem `color` tudo volta.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const badge = canvasElement.querySelector<HTMLElement>("ark-badge")!;

    await expect(badge).toHaveClass("ark:text-(--ark-badge-fg)");
    await expect(badge).not.toHaveClass("ark:bg-neutral-soft");
    await expect(badge.style.getPropertyValue("--ark-badge-fg")).toBe("#2563eb");
    await expect(badge.style.getPropertyValue("--ark-badge-bg")).toContain("color-mix");
    await expect(getComputedStyle(badge).color).toBe("rgb(37, 99, 235)");

    badge.setAttribute("variant", "solid");
    await expect(badge.style.getPropertyValue("--ark-badge-bg")).toBe("#2563eb");
    await expect(badge.style.getPropertyValue("--ark-badge-fg")).toBe("#fff");

    badge.removeAttribute("color");
    await expect(badge.style.getPropertyValue("--ark-badge-fg")).toBe("");
    await expect(badge).toHaveClass("ark:bg-neutral");
  }
};

export const TestHooks = {
  render: () => createBadge("Novo", { testid: "status-badge" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const badge = canvasElement.querySelector<HTMLElement>("ark-badge")!;
    await expect(badge).toHaveAttribute("data-ark", "badge");
    await expect(badge).toHaveAttribute("data-testid", "status-badge");
  }
};
