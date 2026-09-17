import type { ArkIntent, ArkRounded, ArkSelectOption, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor } from "storybook/test";

const LANGUAGES: ArkSelectOption[] = [
  { value: "pt", label: "Portugues" },
  { value: "en", label: "Ingles" },
  { value: "es", label: "Espanhol" },
  { value: "la", label: "Latim", disabled: true }
];

const GROUPED: ArkSelectOption[] = [
  { value: "sp", label: "Sao Paulo", group: "Sudeste" },
  { value: "rj", label: "Rio de Janeiro", group: "Sudeste" },
  { value: "pr", label: "Parana", group: "Sul" },
  { value: "rs", label: "Rio Grande do Sul", group: "Sul" },
  { value: "df", label: "Distrito Federal" }
];

const meta = {
  title: "Core/ArkSelect",
  parameters: {
    docs: {
      description: {
        component:
          "Campo de selecao padronizado: um <select> nativo estilizado (teclado, leitor de tela e mobile de graca) com a mesma grid label / campo / mensagem do ark-input e um chevron proprio. As opcoes vem do atributo `options` (JSON) ou da propriedade JS `options` ({ value, label, disabled?, group? }[]; `group` vira <optgroup>), nunca de filhos. `placeholder` vira uma opcao vazia desabilitada. Emite `change` com `detail: { value }` (o change nativo nao sobe duplicado) e `input`."
      }
    }
  },
  argTypes: {
    label: { control: "text", description: "Rotulo acessivel; vazio esconde o label" },
    placeholder: { control: "text", description: "Opcao vazia desabilitada mostrada enquanto nada foi escolhido" },
    value: { control: "text", description: "Valor selecionado (tambem disponivel como propriedade JS)" },
    name: { control: "text", description: "Nome do campo para envio em formulario" },
    helper: { control: "text", description: "Texto de ajuda abaixo do campo" },
    errorMessage: { control: "text", description: "Mensagem de erro; substitui o helper e liga o estado de erro" },
    error: { control: "boolean", description: "Estado de erro sem mensagem (borda + aria-invalid)" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
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
      description: "Propaga data-testid para o select e suas partes (<testid>-label, -chevron, -helper/-error)"
    }
  },
  args: {
    label: "Idioma",
    placeholder: "Escolha um idioma",
    value: "",
    name: "",
    helper: "",
    errorMessage: "",
    error: false,
    disabled: false,
    required: false,
    size: "md",
    intent: "primary",
    theme: "auto",
    rounded: "lg",
    testid: ""
  }
};

export default meta;

type StoryArgs = {
  label: string;
  placeholder: string;
  value: string;
  name: string;
  helper: string;
  errorMessage: string;
  error: boolean;
  disabled: boolean;
  required: boolean;
  size: ArkSize;
  intent: ArkIntent;
  theme: ArkTheme;
  rounded: ArkRounded;
  testid: string;
};

function createSelect(args: Partial<StoryArgs> & { options?: ArkSelectOption[] }): HTMLElement {
  const el = document.createElement("ark-select");
  el.setAttribute("size", args.size || "md");
  el.setAttribute("intent", args.intent || "primary");
  el.setAttribute("theme", args.theme || "auto");
  el.setAttribute("rounded", args.rounded || "lg");
  el.setAttribute("options", JSON.stringify(args.options ?? LANGUAGES));
  if (args.label) el.setAttribute("label", args.label);
  if (args.placeholder) el.setAttribute("placeholder", args.placeholder);
  if (args.value) el.setAttribute("value", args.value);
  if (args.name) el.setAttribute("name", args.name);
  if (args.helper) el.setAttribute("helper", args.helper);
  if (args.errorMessage) el.setAttribute("error-message", args.errorMessage);
  if (args.error) el.setAttribute("error", "");
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.required) el.setAttribute("required", "");
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

function createStack(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gap = "16px";
  wrap.style.maxWidth = "280px";
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createSelect(args)
};

export const States = {
  render: () => {
    const wrap = createStack();
    wrap.appendChild(createSelect({ label: "Com helper", placeholder: "Escolha", helper: "Texto de ajuda opcional" }));
    wrap.appendChild(createSelect({ label: "Com erro", value: "en", errorMessage: "Idioma nao disponivel" }));
    wrap.appendChild(createSelect({ label: "Desabilitado", value: "pt", disabled: true }));
    wrap.appendChild(createSelect({ label: "Obrigatorio", placeholder: "Escolha", required: true }));
    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = createStack();
    wrap.style.gap = "12px";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      wrap.appendChild(createSelect({ size, placeholder: size }));
    }
    return wrap;
  }
};

export const Groups = {
  args: { label: "Estado", placeholder: "Escolha um estado" },
  render: (args: StoryArgs) => createSelect({ ...args, options: GROUPED })
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";
    wrap.appendChild(createSelect({ label: "Idioma", value: "pt", theme: "dark", helper: "Tema escuro forcado" }));
    return wrap;
  }
};

export const SelectingEmitsChange = {
  args: { label: "Idioma", placeholder: "Escolha um idioma", testid: "campo-idioma" },
  render: Playground.render,
  // Um unico `change` chega ao consumidor, com detail.value, e o nativo do <select> nao sobe duplicado.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("ark-select") as HTMLElement & { value: string };
    const select = canvasElement.querySelector<HTMLSelectElement>('[data-ark="select"]')!;
    const received: Array<{ value: string } | undefined> = [];
    host.addEventListener("change", (event) => received.push((event as CustomEvent<{ value: string }>).detail));

    await expect(select).toHaveAttribute("data-testid", "campo-idioma");
    await expect(host.value).toBe("");
    await expect(select).toHaveClass("ark:text-fg-placeholder");

    await userEvent.selectOptions(select, "en");

    await expect(received).toHaveLength(1);
    await expect(received[0]?.value).toBe("en");
    await expect(host.value).toBe("en");
    await expect(select).not.toHaveClass("ark:text-fg-placeholder");
    await expect(select).toHaveClass("ark:text-fg");
  }
};

export const OptionsPropertyAndValue = {
  render: () => createSelect({ label: "Estado", placeholder: "Escolha" }),
  // A propriedade `options` vence o atributo, `group` vira <optgroup>, e `value` (atributo ou propriedade) seleciona.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("ark-select") as HTMLElement & {
      value: string;
      options: ArkSelectOption[];
    };
    const select = canvasElement.querySelector<HTMLSelectElement>('[data-ark="select"]')!;

    host.options = GROUPED;
    await waitFor(() => expect(select.querySelectorAll("optgroup")).toHaveLength(2));
    await expect(select.querySelector("optgroup")?.label).toBe("Sudeste");
    await expect(select.querySelectorAll("option")).toHaveLength(GROUPED.length + 1);
    await expect(select.querySelector<HTMLOptionElement>('option[value=""]')?.disabled).toBe(true);
    await expect(select.querySelector<HTMLOptionElement>('option[value=""]')?.hidden).toBe(true);

    host.setAttribute("value", "pr");
    await expect(select.value).toBe("pr");
    await expect(host.value).toBe("pr");

    host.value = "df";
    await expect(select.value).toBe("df");

    // Opcoes iguais nao reconstroem o <select> (a selecao do usuario sobrevive a um rerender de atributos).
    host.setAttribute("size", "sm");
    await expect(select.value).toBe("df");
  }
};

export const TestHooks = {
  args: { label: "Idioma", helper: "Ajuda", testid: "idioma" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("ark-select")!;
    const select = host.querySelector('[data-ark="select"]')!;
    const label = host.querySelector('[data-ark="select-label"]')!;
    const chevron = host.querySelector('[data-ark="select-chevron"]')!;
    const helper = host.querySelector('[data-ark="select-helper"]')!;

    await expect(select).toHaveAttribute("data-testid", "idioma");
    await expect(label).toHaveAttribute("data-testid", "idioma-label");
    await expect(chevron).toHaveAttribute("data-testid", "idioma-chevron");
    await expect(helper).toHaveAttribute("data-testid", "idioma-helper");
    await expect(select).toHaveAttribute("aria-describedby", helper.id);

    // O chevron fica sobre a ponta direita do campo e nao rouba o clique.
    const selectRect = select.getBoundingClientRect();
    const chevronRect = chevron.getBoundingClientRect();
    await expect(chevronRect.right).toBeLessThanOrEqual(selectRect.right);
    await expect(chevronRect.left).toBeGreaterThan(selectRect.left + selectRect.width / 2);
    await expect(getComputedStyle(chevron).pointerEvents).toBe("none");

    host.setAttribute("error-message", "Invalido");
    await expect(host.querySelector('[data-ark="select-error"]')).toHaveAttribute("data-testid", "idioma-error");
    await expect(select).toHaveAttribute("aria-invalid", "true");
  }
};
