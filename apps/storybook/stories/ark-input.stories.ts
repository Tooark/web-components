import type { ArkIntent, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor } from "storybook/test";

const meta = {
  title: "Core/ArkInput",
  parameters: {
    docs: {
      description: {
        component:
          'Campo de texto padronizado da familia Ark. Serve como componente publico e como base visual de orquestradores (ark-datepicker), que colocam seus botoes na area de sufixo (`slot="suffix"`) e acessam o campo nativo via `inputElement`/`focus()`. O `label` vira um `<label for>` real e a mensagem de erro tem precedencia sobre o helper, refletida em `aria-invalid`/`aria-describedby`.'
      }
    }
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "tel", "url", "search"],
      description: "Tipo do input nativo; valores fora da lista caem para text"
    },
    label: { control: "text", description: "Rotulo acessivel; vazio esconde o label" },
    placeholder: { control: "text" },
    value: { control: "text", description: "Valor inicial do campo (tambem disponivel como propriedade JS)" },
    name: { control: "text", description: "Nome do campo para envio em formulario" },
    helper: { control: "text", description: "Texto de ajuda abaixo do campo" },
    errorMessage: { control: "text", description: "Mensagem de erro; substitui o helper e liga o estado de erro" },
    error: { control: "boolean", description: "Estado de erro sem mensagem (borda + aria-invalid)" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    readonly: { control: "boolean", description: "Campo somente leitura" },
    suffix: { control: "text", description: 'Conteudo do slot="suffix" (ex.: um icone); vazio nao renderiza sufixo' },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"],
      description: "Define a cor do anel de foco"
    },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    rounded: { control: "inline-radio", options: ["none", "xs", "sm", "md", "lg", "xl", "full"] },
    testid: {
      control: "text",
      description: "Propaga data-testid para o input e suas partes (<testid>-label, -suffix, -helper/-error)"
    }
  },
  args: {
    type: "text",
    label: "Nome",
    placeholder: "Digite seu nome",
    value: "",
    name: "",
    helper: "",
    errorMessage: "",
    error: false,
    disabled: false,
    required: false,
    readonly: false,
    suffix: "",
    size: "md",
    intent: "primary",
    theme: "auto",
    rounded: "lg",
    testid: ""
  }
};

export default meta;

type StoryArgs = {
  type: string;
  label: string;
  placeholder: string;
  value: string;
  name: string;
  helper: string;
  errorMessage: string;
  error: boolean;
  disabled: boolean;
  required: boolean;
  readonly: boolean;
  suffix: string;
  size: ArkSize;
  intent: ArkIntent;
  theme: ArkTheme;
  rounded: ArkRounded;
  testid: string;
};

function createInput(args: Partial<StoryArgs>): HTMLElement {
  const el = document.createElement("ark-input");
  el.setAttribute("type", args.type || "text");
  el.setAttribute("size", args.size || "md");
  el.setAttribute("intent", args.intent || "primary");
  el.setAttribute("theme", args.theme || "auto");
  el.setAttribute("rounded", args.rounded || "lg");
  if (args.label) el.setAttribute("label", args.label);
  if (args.placeholder) el.setAttribute("placeholder", args.placeholder);
  if (args.value) el.setAttribute("value", args.value);
  if (args.name) el.setAttribute("name", args.name);
  if (args.helper) el.setAttribute("helper", args.helper);
  if (args.errorMessage) el.setAttribute("error-message", args.errorMessage);
  if (args.error) el.setAttribute("error", "");
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.required) el.setAttribute("required", "");
  if (args.readonly) el.setAttribute("readonly", "");
  if (args.testid) el.setAttribute("testid", args.testid);

  if (args.suffix) {
    // O sufixo precisa existir antes do primeiro render (light DOM).
    const suffix = document.createElement("span");
    suffix.setAttribute("slot", "suffix");
    suffix.textContent = args.suffix;
    el.appendChild(suffix);
  }

  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createInput(args)
};

export const States = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";
    wrap.style.maxWidth = "280px";

    const normal = document.createElement("ark-input");
    normal.setAttribute("label", "Com helper");
    normal.setAttribute("placeholder", "Digite algo");
    normal.setAttribute("helper", "Texto de ajuda opcional");
    wrap.appendChild(normal);

    const error = document.createElement("ark-input");
    error.setAttribute("label", "Com erro");
    error.setAttribute("value", "valor inválido");
    error.setAttribute("error-message", "Este campo está inválido");
    wrap.appendChild(error);

    const disabled = document.createElement("ark-input");
    disabled.setAttribute("label", "Desabilitado");
    disabled.setAttribute("value", "Não editável");
    disabled.setAttribute("disabled", "");
    wrap.appendChild(disabled);

    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "12px";
    wrap.style.maxWidth = "280px";

    ["xs", "sm", "md", "lg", "xl"].forEach((size) => {
      const el = document.createElement("ark-input");
      el.setAttribute("size", size);
      el.setAttribute("placeholder", size);
      wrap.appendChild(el);
    });

    return wrap;
  }
};

export const WithSuffix = {
  args: { label: "Buscar", placeholder: "Pesquisar...", suffix: "🔍" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("ark-input")!;
    const suffix = host.querySelector<HTMLElement>('[slot="suffix"]')!;
    const input = host.querySelector<HTMLInputElement>('[data-ark="input"]')!;

    // O sufixo do usuário continua filho direto do host e é posicionado por
    // CSS sobre a ponta direita do campo.
    await expect(suffix.parentElement).toBe(host);
    await expect(suffix).toHaveAttribute("data-ark", "input-suffix");

    const inputRect = input.getBoundingClientRect();
    const suffixRect = suffix.getBoundingClientRect();
    await expect(suffixRect.right).toBeLessThanOrEqual(inputRect.right);
    await expect(suffixRect.left).toBeGreaterThan(inputRect.left + inputRect.width / 2);
    await expect(suffixRect.top).toBeGreaterThanOrEqual(inputRect.top - 1);
    await expect(suffixRect.bottom).toBeLessThanOrEqual(inputRect.bottom + 1);

    // Sufixo removido depois da montagem: o padding extra do campo some.
    const paddedRight = getComputedStyle(input).paddingRight;
    suffix.remove();
    await waitFor(() => expect(getComputedStyle(input).paddingRight).not.toBe(paddedRight));
  }
};

export const ReadOnly = {
  args: { label: "Protocolo", value: "2026-000123", readonly: true, helper: "Gerado automaticamente" },
  render: Playground.render
};

export const TypingUpdatesValue = {
  args: { label: "Nome", placeholder: "", testid: "campo-nome" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('[data-ark="input"]')!;

    await expect(input).toHaveAttribute("data-testid", "campo-nome");
    await userEvent.type(input, "Tooark");

    const host = canvasElement.querySelector("ark-input") as HTMLElement & { value: string };
    await expect(host.value).toBe("Tooark");
  }
};
