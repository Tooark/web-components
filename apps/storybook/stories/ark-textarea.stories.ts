import type { ArkIntent, ArkRounded, ArkSize, ArkTextareaResize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor } from "storybook/test";

const meta = {
  title: "Core/ArkTextarea",
  parameters: {
    docs: {
      description: {
        component:
          "Area de texto padronizada: a mesma grid label / campo / mensagem do ark-input e os mesmos atributos de label, helper e erro. `rows` da a altura inicial, `autosize` cresce com o conteudo (field-sizing nativo, com fallback por JS), `monospace` usa fonte mono (edicao em massa, codigo) e `resize` limita o redimensionamento. Atributos nativos como maxlength e spellcheck sao espelhados no <textarea>. Emite `input` e `change` nativos."
      }
    }
  },
  argTypes: {
    label: { control: "text", description: "Rotulo acessivel; vazio esconde o label" },
    placeholder: { control: "text" },
    value: { control: "text", description: "Valor inicial (tambem disponivel como propriedade JS)" },
    name: { control: "text" },
    rows: { control: "number", description: "Linhas visiveis iniciais. Padrao: 3" },
    autosize: { control: "boolean", description: "Cresce com o conteudo" },
    monospace: { control: "boolean", description: "Fonte monoespacada" },
    resize: { control: "inline-radio", options: ["vertical", "none"] },
    helper: { control: "text" },
    errorMessage: { control: "text", description: "Mensagem de erro; substitui o helper e liga o estado de erro" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    readonly: { control: "boolean" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"],
      description: "Define a cor do anel de foco"
    },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    rounded: { control: "inline-radio", options: ["none", "xs", "sm", "md", "lg", "xl", "full"] },
    testid: { control: "text" }
  },
  args: {
    label: "Descricao",
    placeholder: "Escreva aqui",
    value: "",
    name: "",
    rows: 3,
    autosize: false,
    monospace: false,
    resize: "vertical",
    helper: "",
    errorMessage: "",
    error: false,
    disabled: false,
    required: false,
    readonly: false,
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
  rows: number;
  autosize: boolean;
  monospace: boolean;
  resize: ArkTextareaResize;
  helper: string;
  errorMessage: string;
  error: boolean;
  disabled: boolean;
  required: boolean;
  readonly: boolean;
  size: ArkSize;
  intent: ArkIntent;
  theme: ArkTheme;
  rounded: ArkRounded;
  testid: string;
};

function createTextarea(args: Partial<StoryArgs>): HTMLElement {
  const el = document.createElement("ark-textarea");
  el.setAttribute("size", args.size || "md");
  el.setAttribute("intent", args.intent || "primary");
  el.setAttribute("theme", args.theme || "auto");
  el.setAttribute("rounded", args.rounded || "lg");
  el.setAttribute("resize", args.resize || "vertical");
  if (args.label) el.setAttribute("label", args.label);
  if (args.placeholder) el.setAttribute("placeholder", args.placeholder);
  if (args.value) el.setAttribute("value", args.value);
  if (args.name) el.setAttribute("name", args.name);
  if (args.rows) el.setAttribute("rows", String(args.rows));
  if (args.autosize) el.setAttribute("autosize", "");
  if (args.monospace) el.setAttribute("monospace", "");
  if (args.helper) el.setAttribute("helper", args.helper);
  if (args.errorMessage) el.setAttribute("error-message", args.errorMessage);
  if (args.error) el.setAttribute("error", "");
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.required) el.setAttribute("required", "");
  if (args.readonly) el.setAttribute("readonly", "");
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

function createStack(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gap = "16px";
  wrap.style.maxWidth = "360px";
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createTextarea(args)
};

export const States = {
  render: () => {
    const wrap = createStack();
    wrap.appendChild(createTextarea({ label: "Com helper", placeholder: "Escreva", helper: "Ate 500 caracteres" }));
    wrap.appendChild(createTextarea({ label: "Com erro", value: "texto", errorMessage: "Descricao obrigatoria" }));
    wrap.appendChild(createTextarea({ label: "Desabilitada", value: "Nao editavel", disabled: true }));
    wrap.appendChild(createTextarea({ label: "Somente leitura", value: "Gerado pelo sistema", readonly: true }));
    return wrap;
  }
};

export const Sizes = {
  render: () => {
    const wrap = createStack();
    wrap.style.gap = "12px";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      wrap.appendChild(createTextarea({ size, placeholder: size, rows: 2 }));
    }
    return wrap;
  }
};

export const Monospace = {
  args: {
    label: "Cabecalhos",
    monospace: true,
    rows: 4,
    value: "Content-Type: application/json\nAuthorization: Bearer {{token}}",
    helper: "Uma chave:valor por linha"
  },
  render: Playground.render
};

export const NoResize = {
  args: { label: "Observacoes", resize: "none", rows: 2 },
  render: Playground.render
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";
    wrap.appendChild(createTextarea({ label: "Descricao", theme: "dark", value: "Tema escuro forcado" }));
    return wrap;
  }
};

export const Autosize = {
  args: { label: "Corpo", autosize: true, rows: 1, placeholder: "Cresce enquanto voce digita" },
  render: Playground.render,
  // A altura acompanha o conteudo: field-sizing nativo onde existe, senao a medicao por JS.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const textarea = canvasElement.querySelector<HTMLTextAreaElement>('[data-ark="textarea"]')!;
    const before = textarea.getBoundingClientRect().height;

    await userEvent.type(textarea, "linha 1{enter}linha 2{enter}linha 3{enter}linha 4");

    await waitFor(() => expect(textarea.getBoundingClientRect().height).toBeGreaterThan(before + 30));
    await expect(textarea.scrollHeight).toBeLessThanOrEqual(textarea.clientHeight + 1);
  }
};

export const TypingUpdatesValue = {
  render: () => {
    const el = createTextarea({ label: "Nota", testid: "campo-nota" });
    el.setAttribute("maxlength", "20");
    el.setAttribute("spellcheck", "false");
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const textarea = canvasElement.querySelector<HTMLTextAreaElement>('[data-ark="textarea"]')!;

    await expect(textarea).toHaveAttribute("data-testid", "campo-nota");
    await expect(textarea).toHaveAttribute("maxlength", "20");
    await expect(textarea).toHaveAttribute("spellcheck", "false");
    await expect(textarea.rows).toBe(3);

    await userEvent.type(textarea, "Tooark");

    const host = canvasElement.querySelector("ark-textarea") as HTMLElement & { value: string };
    await expect(host.value).toBe("Tooark");

    host.value = "Editado";
    await expect(textarea.value).toBe("Editado");
  }
};

export const TestHooks = {
  args: { label: "Descricao", helper: "Ajuda", testid: "descricao" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const host = canvasElement.querySelector("ark-textarea")!;
    const textarea = host.querySelector('[data-ark="textarea"]')!;
    const label = host.querySelector('[data-ark="textarea-label"]')!;
    const helper = host.querySelector('[data-ark="textarea-helper"]')!;

    await expect(textarea).toHaveAttribute("data-testid", "descricao");
    await expect(label).toHaveAttribute("data-testid", "descricao-label");
    await expect(helper).toHaveAttribute("data-testid", "descricao-helper");
    await expect(textarea).toHaveAttribute("aria-describedby", helper.id);

    host.setAttribute("error-message", "Invalido");
    await expect(host.querySelector('[data-ark="textarea-error"]')).toHaveAttribute("data-testid", "descricao-error");
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
  }
};
