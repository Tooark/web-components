import type { ArkKvBulkFormat, ArkKvRow, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkKvEditor",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Editor de pares chave/valor: linhas { id, key, value, enabled } com ativar, editar, remover e adicionar. Colunas opcionais: `types` (select do tipo do valor por linha: string, number, date, time, datetime, email, url; o campo de valor segue o tipo), `secret` (cadeado por linha: fechado, o valor vira campo de senha com o olho para revelar) e `description`. Modo em massa em `bulk-format` lines (`chave:valor` por linha, `#` desativa) ou json (array com todos os campos). Compoe ark-checkbox, ark-input, ark-select, ark-textarea e ark-button porque renderiza tudo a partir de `rows`. `change` publica as linhas a cada edicao; adicionar e remover anunciam a contagem. A celula de valor e um ark-input comum: autocomplete de variaveis fica no app."
      }
    }
  },
  argTypes: {
    keyPlaceholder: { control: "text" },
    valuePlaceholder: { control: "text" },
    descriptionPlaceholder: { control: "text" },
    description: { control: "boolean", description: "Coluna de descricao" },
    types: { control: "text", description: "Tipos de valor da coluna de tipo, separados por virgula; vazio esconde" },
    secret: { control: "boolean", description: "Cadeado por linha (valor mascarado quando fechado)" },
    readonly: { control: "boolean" },
    bulk: { control: "boolean" },
    bulkFormat: { control: "inline-radio", options: ["lines", "json"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    keyPlaceholder: "Chave",
    valuePlaceholder: "Valor",
    descriptionPlaceholder: "Descricao",
    description: false,
    types: "",
    secret: false,
    readonly: false,
    bulk: false,
    bulkFormat: "lines",
    size: "sm",
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  keyPlaceholder: string;
  valuePlaceholder: string;
  descriptionPlaceholder: string;
  description: boolean;
  types: string;
  secret: boolean;
  readonly: boolean;
  bulk: boolean;
  bulkFormat: ArkKvBulkFormat;
  size: ArkSize;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
};

type EditorEl = HTMLElement & {
  rows: ArkKvRow[];
  bulk: boolean;
  bulkFormat: ArkKvBulkFormat;
  bulkText: string;
  types: string[];
  description: boolean;
  secret: boolean;
  add: (row?: Partial<ArkKvRow>) => ArkKvRow;
  delete: (id: string) => void;
};

const HEADERS: ArkKvRow[] = [
  { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
  { id: "h2", key: "Authorization", value: "Bearer {{token}}", enabled: true },
  { id: "h3", key: "X-Debug", value: "1", enabled: false }
];

function createEditor(args: Partial<StoryArgs>, rows: ArkKvRow[] = HEADERS): EditorEl {
  const el = document.createElement("ark-kv-editor") as EditorEl;
  if (args.keyPlaceholder) el.setAttribute("key-placeholder", args.keyPlaceholder);
  if (args.valuePlaceholder) el.setAttribute("value-placeholder", args.valuePlaceholder);
  if (args.descriptionPlaceholder) el.setAttribute("description-placeholder", args.descriptionPlaceholder);
  if (args.description) el.setAttribute("description", "");
  if (args.types) el.setAttribute("types", args.types);
  if (args.secret) el.setAttribute("secret", "");
  if (args.readonly) el.setAttribute("readonly", "");
  if (args.bulk) el.setAttribute("bulk", "");
  if (args.bulkFormat) el.setAttribute("bulk-format", args.bulkFormat);
  if (args.size) el.setAttribute("size", args.size);
  if (args.lang) el.setAttribute("lang", args.lang);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  el.style.width = "40rem";
  el.rows = rows.map((row) => ({ ...row }));
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createEditor(args)
};

export const Empty = {
  render: () => createEditor({ lang: "pt", size: "sm", keyPlaceholder: "Chave", valuePlaceholder: "Valor" }, [])
};

export const Readonly = {
  render: () => createEditor({ lang: "pt", size: "sm", readonly: true })
};

export const BulkMode = {
  render: () => createEditor({ lang: "pt", size: "sm", bulk: true, keyPlaceholder: "Chave", valuePlaceholder: "Valor" })
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-6";
    for (const size of ["xs", "sm", "md", "lg"] as ArkSize[])
      wrap.appendChild(createEditor({ lang: "pt", size }, HEADERS.slice(0, 2)));
    return wrap;
  }
};

const ENV_ARGS: Partial<StoryArgs> = {
  lang: "pt",
  size: "sm",
  keyPlaceholder: "Variavel",
  valuePlaceholder: "Valor",
  descriptionPlaceholder: "Descricao",
  description: true,
  secret: true,
  types: "string,number,date,url"
};

const ENV_ROWS: ArkKvRow[] = [
  { id: "v1", key: "baseUrl", value: "https://api.local", enabled: true, type: "url", description: "Raiz da API" },
  { id: "v2", key: "token", value: "sk-live-9f2a", enabled: true, secret: true, description: "Nao commitar" },
  { id: "v3", key: "retries", value: "3", enabled: true, type: "number" },
  { id: "v4", key: "expiresAt", value: "2026-12-31", enabled: false, type: "date" }
];

// Cabecalhos com descricao (Postman-like): a coluna entra pelo atributo `description`.
export const WithDescription = {
  render: () =>
    createEditor(
      {
        lang: "pt",
        size: "sm",
        keyPlaceholder: "Chave",
        valuePlaceholder: "Valor",
        descriptionPlaceholder: "Descricao",
        description: true
      },
      [
        { id: "d1", key: "Content-Type", value: "application/json", enabled: true, description: "Corpo em JSON" },
        { id: "d2", key: "X-Request-Id", value: "{{uuid}}", enabled: true, description: "Correlacao no log" }
      ]
    )
};

// Variaveis de ambiente: `types` da o tipo do valor (o campo vira number, date, url...), o cadeado de `secret`
// mascara o token com o olho para revelar, e a descricao explica o uso.
export const WithTypesAndSecret = {
  render: () => {
    const el = createEditor(ENV_ARGS, ENV_ROWS);
    el.style.width = "56rem";
    return el;
  }
};

// So o cadeado, sem tipos nem descricao: o caso de uma lista de credenciais.
export const SecretOnly = {
  render: () =>
    createEditor({ lang: "pt", size: "sm", keyPlaceholder: "Chave", valuePlaceholder: "Valor", secret: true }, [
      { id: "s1", key: "apiKey", value: "AKIA-9f2a-77c1", enabled: true, secret: true },
      { id: "s2", key: "region", value: "sa-east-1", enabled: true }
    ])
};

// Modo em massa em JSON: todos os campos viajam; JSON invalido marca o campo e nao mexe nas linhas.
export const JsonBulk = {
  render: () => createEditor({ ...ENV_ARGS, bulk: true, bulkFormat: "json" }, ENV_ROWS.slice(0, 2))
};

// O app escuta change e mantem o proprio estado; aqui espelha as linhas num <pre>.
export const ControlledByApp = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";
    const editor = createEditor({ lang: "pt", size: "sm", keyPlaceholder: "Chave", valuePlaceholder: "Valor" });
    const pre = document.createElement("pre");
    pre.className = "rounded-lg p-3 text-xs";
    pre.style.background = "var(--ark-color-surface-muted)";
    const show = () => {
      pre.textContent = JSON.stringify(editor.rows, null, 2);
    };
    editor.addEventListener("change", show);
    show();
    wrap.append(editor, pre);
    return wrap;
  }
};

// Linhas renderizadas do modelo; editar chave/valor, ativar, remover e adicionar emitem change com as linhas
// e anunciam a contagem; Enter no ultimo valor adiciona; o modo em massa reflete o texto e, ao sair,
// reconstroi as linhas (ids por posicao, # desativa); readonly bloqueia.
export const Editing = {
  render: () => createEditor({ lang: "pt", size: "sm", keyPlaceholder: "Chave", valuePlaceholder: "Valor" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const editor = canvasElement.querySelector("ark-kv-editor") as EditorEl;
    const events: string[] = [];
    editor.addEventListener("change", () => events.push("change"));
    editor.addEventListener("ark-add", (event) =>
      events.push(`add:${(event as CustomEvent<{ id: string }>).detail.id}`)
    );
    editor.addEventListener("ark-delete", (event) =>
      events.push(`delete:${(event as CustomEvent<{ id: string }>).detail.id}`)
    );
    const rows = () => Array.from(editor.querySelectorAll('[data-ark="kv-editor-row"]')) as HTMLElement[];
    const keyInputOf = (row: HTMLElement) => row.querySelector('[data-ark="kv-editor-key"] input') as HTMLInputElement;
    const valueInputOf = (row: HTMLElement) =>
      row.querySelector('[data-ark="kv-editor-value"] input') as HTMLInputElement;
    const announcer = () => document.querySelector('[data-ark="announcer"]')?.textContent ?? "";

    await expect(rows()).toHaveLength(3);
    await expect(canvas.getByText("3 entradas")).toBeVisible();
    await expect(keyInputOf(rows()[0]).value).toBe("Content-Type");
    await expect(valueInputOf(rows()[1]).value).toBe("Bearer {{token}}");
    await expect(canvas.getAllByRole("checkbox")[2]).toHaveAttribute("aria-checked", "false");
    await expect(rows()[2].classList.contains("ark:opacity-60")).toBe(true);

    // Editar o valor e desativar a linha.
    await userEvent.clear(valueInputOf(rows()[0]));
    await userEvent.type(valueInputOf(rows()[0]), "text/plain");
    await expect(editor.rows[0].value).toBe("text/plain");
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await expect(editor.rows[0].enabled).toBe(false);
    await expect(events.filter((e) => e === "change").length).toBeGreaterThan(10);

    // Remover: evento, contagem, anuncio, foco na linha seguinte.
    await userEvent.click(canvas.getAllByRole("button", { name: "Excluir linha" })[1]);
    await expect(editor.rows.map((row) => row.id)).toEqual(["h1", "h3"]);
    await expect(events).toContain("delete:h2");
    await expect(canvas.getByText("2 entradas")).toBeVisible();
    await waitFor(() => expect(announcer()).toContain("2 entradas"));
    await expect(keyInputOf(rows()[1])).toHaveFocus();

    // Adicionar pelo botao: linha vazia focada, ark-add, contagem.
    await userEvent.click(canvas.getByRole("button", { name: "Adicionar" }));
    await expect(rows()).toHaveLength(3);
    await expect(keyInputOf(rows()[2])).toHaveFocus();
    // ark-add antes do change.
    await expect(events.at(-2)).toMatch(/^add:kv-/);
    await expect(events.at(-1)).toBe("change");
    await userEvent.type(keyInputOf(rows()[2]), "Accept");
    await userEvent.type(valueInputOf(rows()[2]), "*/*{Enter}");
    await expect(rows()).toHaveLength(4);
    await expect(keyInputOf(rows()[3])).toHaveFocus();
    await expect(editor.rows[2]).toMatchObject({ key: "Accept", value: "*/*", enabled: true });

    // Modo em massa: texto com # nas desativadas; editar e sair reconstroi as linhas.
    await userEvent.click(canvas.getByRole("button", { name: "Editar em massa" }));
    await expect(editor.bulk).toBe(true);
    const textarea = canvas.getByRole("textbox", { name: "Editar em massa" }) as HTMLTextAreaElement;
    await expect(textarea).toHaveFocus();
    await expect(textarea.value).toBe("#Content-Type:text/plain\n#X-Debug:1\nAccept:*/*\n:");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Host: api.local{Enter}# Trace:on{Enter}Semvalor");
    await expect(editor.rows).toEqual([
      { id: "h1", key: "Host", value: "api.local", enabled: true },
      { id: "h3", key: "Trace", value: "on", enabled: false },
      { id: editor.rows[2].id, key: "Semvalor", value: "", enabled: true }
    ]);
    await userEvent.click(canvas.getByRole("button", { name: "Editar em tabela" }));
    await expect(editor.bulk).toBe(false);
    await expect(rows()).toHaveLength(3);
    await expect(keyInputOf(rows()[0]).value).toBe("Host");
    await expect(canvas.getAllByRole("checkbox")[1]).toHaveAttribute("aria-checked", "false");
    await expect(events.at(-1)).toBe("change");

    // Readonly: nada editavel.
    editor.setAttribute("readonly", "");
    await expect(keyInputOf(rows()[0])).toHaveAttribute("readonly");
    await expect(canvas.getAllByRole("checkbox")[0]).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Adicionar" })).toHaveAttribute("aria-disabled", "true");

    // Substituir as linhas pela propriedade renderiza de novo; vazio mostra a mensagem.
    editor.removeAttribute("readonly");
    editor.rows = [];
    await expect(rows()).toHaveLength(0);
    await expect(canvas.getAllByText("Nenhuma entrada")).toHaveLength(2);
  }
};

const JSON_ROW = '[{ "key": "k", "value": "v", "enabled": true, "type": "string", "description": "d" }]';

// Colunas opcionais: description e types entram por atributo, com os campos no modelo; o modo em massa em
// lines preserva tipo e descricao por posicao, e em json edita tudo, sinalizando JSON invalido sem mexer.
export const ColumnsAndJsonBulk = {
  render: () =>
    createEditor({ ...ENV_ARGS, keyPlaceholder: "Chave", types: "string,number,date" }, [
      { id: "v1", key: "baseUrl", value: "https://api.local", enabled: true, type: "string", description: "Raiz" },
      { id: "v2", key: "token", value: "abc", enabled: true, type: "number" }
    ]),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const editor = canvasElement.querySelector("ark-kv-editor") as EditorEl;
    const rows = () => Array.from(editor.querySelectorAll('[data-ark="kv-editor-row"]')) as HTMLElement[];
    const changes: ArkKvRow[][] = [];
    editor.addEventListener("change", (event) =>
      changes.push((event as CustomEvent<{ rows: ArkKvRow[] }>).detail.rows)
    );

    // Colunas presentes, com valor do modelo; o campo de valor segue o tipo da linha.
    const descriptions = canvas.getAllByRole("textbox", { name: "Descricao" }) as HTMLInputElement[];
    await expect(descriptions).toHaveLength(2);
    await expect(descriptions[0].value).toBe("Raiz");
    const types = canvas.getAllByRole("combobox", { name: "Tipo" }) as HTMLSelectElement[];
    await expect(types.map((select) => select.value)).toEqual(["string", "number"]);
    const valueInputs = () =>
      rows().map((row) => row.querySelector('[data-ark="kv-editor-value"] input') as HTMLInputElement);
    await expect(valueInputs().map((input) => input.type)).toEqual(["text", "number"]);
    await expect(rows()[0].querySelector('[data-ark="kv-editor-type"]')).not.toBeNull();
    await expect(rows()[0].querySelector('[data-ark="kv-editor-description"]')).not.toBeNull();

    await userEvent.type(descriptions[1], "Bearer");
    await expect(editor.rows[1].description).toBe("Bearer");
    await userEvent.selectOptions(types[0], "date");
    await expect(editor.rows[0].type).toBe("date");
    await expect(valueInputs()[0].type).toBe("date");
    await expect(changes.at(-1)?.[0].type).toBe("date");

    // Cadeado: fechado, o valor vira senha com o olho; o olho revela; aberto de novo, volta ao tipo.
    const locks = canvas.getAllByRole("button", { name: "Segredo" });
    await expect(locks).toHaveLength(2);
    await expect(locks[1]).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(locks[1]);
    await expect(editor.rows[1].secret).toBe(true);
    await expect(locks[1]).toHaveAttribute("aria-pressed", "true");
    await expect(valueInputs()[1].type).toBe("password");
    const eye = rows()[1].querySelector('[data-ark="input-reveal"]') as HTMLButtonElement;
    await expect(eye).not.toBeNull();
    await userEvent.click(eye);
    await expect(valueInputs()[1].type).toBe("text");
    await userEvent.click(locks[1]);
    await expect(editor.rows[1].secret).toBeUndefined();
    await expect(valueInputs()[1].type).toBe("number");
    await expect(rows()[1].querySelector('[data-ark="input-reveal"]')).toBeNull();
    await userEvent.click(locks[1]);

    // Linha nova ganha o primeiro tipo.
    editor.add({ key: "novo" });
    await expect(editor.rows[2].type).toBe("string");

    // Lines preserva tipo, segredo e descricao por posicao.
    editor.bulk = true;
    const textarea = canvas.getByRole("textbox", { name: "Editar em massa" }) as HTMLTextAreaElement;
    await expect(textarea.value).toBe("baseUrl:https://api.local\ntoken:abc\nnovo:");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "base:x{Enter}#tok:y");
    await expect(editor.rows).toEqual([
      { id: "v1", key: "base", value: "x", enabled: true, type: "date", description: "Raiz" },
      { id: "v2", key: "tok", value: "y", enabled: false, type: "number", description: "Bearer", secret: true }
    ]);
    editor.bulk = false;

    // JSON: todos os campos; invalido marca erro e nao mexe.
    editor.bulkFormat = "json";
    editor.bulk = true;
    await expect(JSON.parse(textarea.value)).toEqual([
      { key: "base", value: "x", enabled: true, description: "Raiz", type: "date" },
      { key: "tok", value: "y", enabled: false, description: "Bearer", type: "number", secret: true }
    ]);
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "[[");
    await expect(textarea.closest("ark-textarea")).toHaveAttribute("error");
    await expect(editor.rows).toHaveLength(2);
    await userEvent.clear(textarea);
    await userEvent.paste(JSON_ROW);
    await expect(textarea.closest("ark-textarea")).not.toHaveAttribute("error");
    await expect(editor.rows).toEqual([
      { id: "v1", key: "k", value: "v", enabled: true, description: "d", type: "string" }
    ]);
    editor.bulk = false;
    await expect(rows()).toHaveLength(1);
    await expect((canvas.getByRole("textbox", { name: "Descricao" }) as HTMLInputElement).value).toBe("d");

    // Sem os atributos as colunas somem e os campos ficam no modelo.
    editor.removeAttribute("types");
    editor.removeAttribute("description");
    editor.removeAttribute("secret");
    await expect(canvas.queryByRole("combobox", { name: "Tipo" })).toBeNull();
    await expect(canvas.queryByRole("textbox", { name: "Descricao" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Segredo" })).toBeNull();
    await expect(editor.rows[0].description).toBe("d");
  }
};

export const TestHooks = {
  render: () =>
    createEditor(
      { lang: "pt", testid: "cabecalhos", description: true, secret: true, types: "string,number" },
      HEADERS.slice(0, 1)
    ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="kv-editor"]')).toHaveAttribute("data-testid", "cabecalhos");
    const parts = [
      "row",
      "enabled",
      "key",
      "value",
      "secret",
      "type",
      "description",
      "delete",
      "add",
      "bulk",
      "bulk-toggle",
      "list",
      "empty"
    ];
    for (const part of parts) {
      await expect(canvasElement.querySelector(`[data-ark="kv-editor-${part}"]`)).toHaveAttribute(
        "data-testid",
        `cabecalhos-${part}`
      );
    }
  }
};
