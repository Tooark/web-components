import type {
  ArkCodeCompletion,
  ArkCodeCompletionSource,
  ArkCodeEditor,
  ArkCodeFormatter,
  ArkCodeIndentStyle,
  ArkCodeLanguage,
  ArkCodeLineEnding,
  ArkCodeTheme,
  ArkCodeVariable
} from "@tooark/code";
import type { ArkSize } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

type StoryArgs = {
  value?: string;
  language: ArkCodeLanguage;
  theme: ArkCodeTheme;
  readonly: boolean;
  placeholder: string;
  ariaLabel?: string;
  minHeight: string;
  lineNumbers: boolean;
  fold: boolean;
  wrap: boolean;
  size: ArkSize;
  indentStyle: ArkCodeIndentStyle;
  indentSize: number;
  lineEnding: ArkCodeLineEnding;
  tabIndent: boolean;
  autocomplete: boolean;
  variableKeys: string[];
  completions: ArkCodeCompletion[];
  completionSource: boolean;
  variables: ArkCodeVariable[];
  markUnknownVariables: boolean;
  singleLine: boolean;
  formatter: boolean;
  testid?: string;
};

const SAMPLES: Record<ArkCodeLanguage, string> = {
  json: `{
  "name": "tooark",
  "version": "1.0.0",
  "private": false,
  "tags": ["web-components", "design-system"],
  "owner": {
    "id": 42,
    "email": "{{user.email}}"
  }
}`,
  javascript: `// Script pre-request: assina a chamada com o token do ambiente.
const token = pm.environment.get("token");
if (!token) {
  throw new Error("token ausente");
}
pm.request.headers.add({ key: "Authorization", value: \`Bearer \${token}\` });
`,
  yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: api
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/tooark/api:1.4.0
          ports:
            - containerPort: 8080
`,
  text: "Texto puro, sem realce.\nSegunda linha.\n"
};

// Exemplos das propriedades que recebem funcao. O texto de cada um vai igual para o "Show code".
const FORMATTER_CODE = `(value) => value.split("\\n").map((line) => line.trimEnd()).join("\\n").trimEnd() + "\\n"`;
const exampleFormatter: ArkCodeFormatter = (value) =>
  `${value
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd()}\n`;

const COMPLETION_SOURCE_CODE = `(context) => {
  const match = context.matchBefore(/Content-Type"?\\s*:\\s*"?[\\w/+.-]*$/i);
  if (!match) return null;
  const typed = match.text.match(/[\\w/+.-]*$/)?.[0] ?? "";
  const types = ["application/json", "application/xml", "text/plain", "multipart/form-data"];
  return { from: match.to - typed.length, options: types.map((label) => ({ label, type: "constant" })) };
}`;
const exampleCompletionSource: ArkCodeCompletionSource = (context) => {
  const match = context.matchBefore(/Content-Type"?\s*:\s*"?[\w/+.-]*$/i);
  if (!match) return null;
  const typed = match.text.match(/[\w/+.-]*$/)?.[0] ?? "";
  const types = ["application/json", "application/xml", "text/plain", "multipart/form-data"];
  return { from: match.to - typed.length, options: types.map((label) => ({ label, type: "constant" })) };
};

// Atributos que os args ligam, fora dos padroes do elemento: a mesma lista monta o elemento e o "Show code".
function attributesOf(args: Partial<StoryArgs>): Array<[string, string]> {
  const attributes: Array<[string, string]> = [];
  if (args.language && args.language !== "text") attributes.push(["language", args.language]);
  if (args.theme && args.theme !== "auto") attributes.push(["theme", args.theme]);
  if (args.readonly) attributes.push(["readonly", ""]);
  if (args.placeholder) attributes.push(["placeholder", args.placeholder]);
  if (args.ariaLabel) attributes.push(["aria-label", args.ariaLabel]);
  if (args.minHeight && args.minHeight !== "8rem") attributes.push(["min-height", args.minHeight]);
  if (args.lineNumbers === false) attributes.push(["line-numbers", "false"]);
  if (args.fold === false) attributes.push(["fold", "false"]);
  if (args.wrap) attributes.push(["wrap", ""]);
  if (args.size && args.size !== "md") attributes.push(["size", args.size]);
  if (args.indentStyle && args.indentStyle !== "space") attributes.push(["indent-style", args.indentStyle]);
  if (args.indentSize && args.indentSize !== 2) attributes.push(["indent-size", String(args.indentSize)]);
  if (args.lineEnding && args.lineEnding !== "auto") attributes.push(["line-ending", args.lineEnding]);
  if (args.tabIndent === false) attributes.push(["tab-indent", "false"]);
  if (args.autocomplete === false) attributes.push(["autocomplete", "false"]);
  if (args.markUnknownVariables) attributes.push(["mark-unknown-variables", ""]);
  if (args.singleLine) attributes.push(["single-line", ""]);
  if (args.testid) attributes.push(["testid", args.testid]);
  return attributes;
}

// Sem `value` nos args, o texto e o exemplo da linguagem.
function textOf(args: Partial<StoryArgs>): string {
  return args.value ?? SAMPLES[args.language ?? "text"];
}

function createEditor(args: Partial<StoryArgs>): ArkCodeEditor {
  const el = document.createElement("ark-code-editor");
  for (const [name, value] of attributesOf(args)) el.setAttribute(name, value);
  if (args.variableKeys?.length) el.variableKeys = args.variableKeys;
  if (args.variables?.length) el.variables = args.variables;
  if (args.completions?.length) el.completions = args.completions;
  if (args.completionSource) el.completionSource = exampleCompletionSource;
  if (args.formatter) el.formatter = exampleFormatter;
  el.style.maxWidth = "720px";
  el.value = textOf(args);
  return el;
}

// Literal JS enxuto para o "Show code": chaves sem aspas, lista de objetos com um item por linha.
function literal(data: unknown): string {
  if (Array.isArray(data)) {
    const items = data.map((item) => literal(item));
    return data.some((item) => item !== null && typeof item === "object")
      ? `[\n${items.map((item) => `  ${item}`).join(",\n")}\n]`
      : `[${items.join(", ")}]`;
  }
  if (data !== null && typeof data === "object") {
    const entries = Object.entries(data).map(
      ([key, value]) => `${/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)}: ${literal(value)}`
    );
    return `{ ${entries.join(", ")} }`;
  }
  return JSON.stringify(data);
}

// "Show code": o HTML e o JS que reproduzem os args da story, no lugar do DOM que o CodeMirror monta.
function snippet(args: Partial<StoryArgs>): string {
  const escapeAttribute = (text: string): string =>
    text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const attributes = attributesOf(args).map(([name, value]) => (value ? `${name}="${escapeAttribute(value)}"` : name));
  const tag =
    attributes.length > 3
      ? `<ark-code-editor\n${attributes.map((attribute) => `  ${attribute}`).join("\n")}\n></ark-code-editor>`
      : `<ark-code-editor${attributes.map((attribute) => ` ${attribute}`).join("")}></ark-code-editor>`;
  const script = [
    'import { registerTooarkCode } from "@tooark/code";',
    "",
    "registerTooarkCode();",
    'const editor = document.querySelector("ark-code-editor");',
    `editor.value = ${JSON.stringify(textOf(args))};`
  ];
  if (args.variableKeys?.length) script.push(`editor.variableKeys = ${literal(args.variableKeys)};`);
  if (args.variables?.length) script.push(`editor.variables = ${literal(args.variables)};`);
  if (args.completions?.length) script.push(`editor.completions = ${literal(args.completions)};`);
  if (args.completionSource) script.push(`editor.completionSource = ${COMPLETION_SOURCE_CODE};`);
  if (args.formatter) script.push(`editor.formatter = ${FORMATTER_CODE};`);
  script.push('editor.addEventListener("change", (event) => console.log("change", event.detail.value));');
  if (args.singleLine) {
    script.push('editor.addEventListener("ark-submit", (event) => console.log("ark-submit", event.detail.value));');
  }
  const body = script.join("\n").replace(/^(?=.)/gm, "  ");
  return `${tag}\n\n<script type="module">\n${body}\n</script>`;
}

// Tipo, padrao e grupo de cada linha da tabela de parametros.
function row(category: string, type: string, defaultValue?: string): Record<string, unknown> {
  return {
    category,
    type: { summary: type },
    ...(defaultValue === undefined ? {} : { defaultValue: { summary: defaultValue } })
  };
}

const CONTENT = "Conteudo e aparencia";
const INDENT = "Recuo e fim de linha";
const COMPLETION = "Completions";
const VARIABLES = "Variaveis (opcional)";
const SINGLE_LINE = "Campo de uma linha (opcional)";
const FORMAT = "Formatacao";
const EVENTS = "Eventos";
const READ = "Leitura e metodos";

const meta = {
  title: "Code/ArkCodeEditor",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Editor de codigo CodeMirror 6 como Custom Element `<ark-code-editor>` (pacote lateral `@tooark/code`, CodeMirror como peer dependency).",
          "",
          "- **Conteudo**: `value` (propriedade; o atributo so da o texto inicial) volta em `change` com `detail: { value }` a cada edicao do usuario.",
          "- **Linguagens**: `json`, `javascript`, `yaml` e `text`, com realce, dobra, busca (Ctrl+F), pares e linha ativa.",
          "- **Completions**: as da linguagem, `variableKeys` depois de `{{`, `completions` em qualquer linguagem e `completionSource` com contexto.",
          "- **Formatacao**: `format()` e Shift+Alt+F; JSON de fabrica, outras linguagens pelo `formatter` do app.",
          "- **Opcionais**, desligados ate o app pedir: `variables` pinta cada `{{chave}}` pelo intent da variavel (escopo livre, com tooltip), `mark-unknown-variables` marca a chave desconhecida e `single-line` vira um campo de uma linha na altura dos controles (`size`), com Enter emitindo `ark-submit`.",
          "- **Tema**: `auto` segue o color-scheme da pagina e acompanha a troca em tempo de execucao; o chrome usa os tokens `--ark-color-*` com fallback.",
          "",
          'O **Playground** tem todos os parametros nos controles, agrupados como na tabela (as propriedades JS `variableKeys`, `variables` e `completions` se editam em JSON; `completionSource` e `formatter` ligam um exemplo). Abaixo do editor ficam os botoes de `format()` e `focus()` e o registro dos eventos; "Show code" de cada story mostra o HTML e o JS equivalentes.'
        ].join("\n")
      },
      source: {
        transform: (_code: string, context: { args: Partial<StoryArgs> }) => snippet(context.args)
      }
    }
  },
  argTypes: {
    value: {
      control: "text",
      description:
        "Texto do editor (propriedade JS; o atributo `value` so da o texto inicial). Atribuir nao emite `change`. Sem valor, a story usa o exemplo da linguagem.",
      table: row(CONTENT, "string", '""')
    },
    language: {
      control: "select",
      options: ["json", "javascript", "yaml", "text"],
      description: "Linguagem do realce e da dobra.",
      table: row(CONTENT, '"json" | "javascript" | "yaml" | "text"', '"text"')
    },
    theme: {
      control: "select",
      options: ["auto", "light", "dark"],
      description: "`auto` segue o color-scheme da pagina e acompanha a troca em tempo de execucao.",
      table: row(CONTENT, '"auto" | "light" | "dark"', '"auto"')
    },
    readonly: {
      control: "boolean",
      description: "Somente leitura: sem cursor de edicao nem realce da linha ativa.",
      table: row(CONTENT, "boolean", "false")
    },
    placeholder: {
      control: "text",
      description: "Texto exibido com o documento vazio.",
      table: row(CONTENT, "string")
    },
    ariaLabel: {
      name: "aria-label",
      control: "text",
      description:
        'Nome acessivel do conteudo editavel (o `role="textbox"` do CodeMirror), para um editor sem `<label>` visivel.',
      table: row(CONTENT, "string")
    },
    minHeight: {
      name: "min-height",
      control: "text",
      description: "Altura minima do editor (comprimento CSS); em `single-line` quem manda e `size`.",
      table: row(CONTENT, "string", '"8rem"')
    },
    lineNumbers: {
      name: "line-numbers",
      control: "boolean",
      description: 'Numeracao das linhas; `"false"` desliga.',
      table: row(CONTENT, "boolean", "true")
    },
    fold: {
      control: "boolean",
      description: 'Calha de dobra por bloco da linguagem; `"false"` desliga.',
      table: row(CONTENT, "boolean", "true")
    },
    wrap: {
      control: "boolean",
      description: "Quebra de linha visual em vez de rolagem horizontal.",
      table: row(CONTENT, "boolean", "false")
    },
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
      description:
        "Fonte e recuo lateral, na escala do `ark-input`; em `single-line`, tambem a altura. `md` e o editor de sempre.",
      table: row(CONTENT, '"xs" | "sm" | "md" | "lg" | "xl"', '"md"')
    },
    testid: {
      control: "text",
      description: 'Vai como `data-testid` no no raiz do CodeMirror (que ja leva `data-ark="code-editor"`).',
      table: row(CONTENT, "string")
    },
    indentStyle: {
      name: "indent-style",
      control: "inline-radio",
      options: ["space", "tab"],
      description: "Recuo com espacos ou tabulacao.",
      table: row(INDENT, '"space" | "tab"', '"space"')
    },
    indentSize: {
      name: "indent-size",
      control: { type: "number", min: 1, max: 16 },
      description: "Espacos por nivel, ou largura visual da tabulacao (1 a 16).",
      table: row(INDENT, "number", "2")
    },
    lineEnding: {
      name: "line-ending",
      control: "inline-radio",
      options: ["auto", "lf", "crlf"],
      description:
        "Fim de linha de `value` e `change`; por dentro o documento e sempre LF. `auto` segue o ultimo valor.",
      table: row(INDENT, '"auto" | "lf" | "crlf"', '"auto"')
    },
    tabIndent: {
      name: "tab-indent",
      control: "boolean",
      description: 'Tab recua e Shift+Tab desfaz; Esc e depois Tab sai do editor. `"false"` deixa o Tab so navegar.',
      table: row(INDENT, "boolean", "true")
    },
    autocomplete: {
      control: "boolean",
      description: 'Completions ao digitar e por Ctrl+Espaco; `"false"` desliga todas.',
      table: row(COMPLETION, "boolean", "true")
    },
    variableKeys: {
      control: "object",
      description:
        "Propriedade JS: chaves oferecidas depois de `{{`; a escolha insere `{{chave}}`. So completam, nao pintam.",
      table: row(COMPLETION, "string[]", "[]")
    },
    completions: {
      control: "object",
      description:
        "Propriedade JS: palavras oferecidas em qualquer linguagem, no formato do CodeMirror (`label`, `type`, `detail`...).",
      table: row(COMPLETION, "ArkCodeCompletion[]", "[]")
    },
    completionSource: {
      control: "boolean",
      description:
        "Propriedade JS com uma fonte propria (`(context) => CompletionResult | null`). O controle liga o exemplo: depois de `Content-Type:` sugere tipos de midia.",
      table: row(COMPLETION, "ArkCodeCompletionSource", "undefined")
    },
    variables: {
      control: "object",
      description:
        "Propriedade JS: `{ key, scope?, intent?, value? }` por chave. Pinta cada `{{chave}}` pelo intent (padrao `primary`), com tooltip do escopo e do valor, e completa como `variableKeys`. Escopo livre; a precedencia entre escopos e do app.",
      table: row(VARIABLES, "ArkCodeVariable[]", "[]")
    },
    markUnknownVariables: {
      name: "mark-unknown-variables",
      control: "boolean",
      description: "Pinta em `danger`, sublinhado, o `{{chave}}` que nao esta em `variables` nem em `variableKeys`.",
      table: row(VARIABLES, "boolean", "false")
    },
    singleLine: {
      name: "single-line",
      control: "boolean",
      description:
        "Campo de uma linha na altura dos controles do mesmo `size`: sem calhas, Enter emite `ark-submit`, quebras coladas somem, Tab sai e Ctrl+F fica com o navegador.",
      table: row(SINGLE_LINE, "boolean", "false")
    },
    formatter: {
      control: "boolean",
      description:
        "Propriedade JS `(value, language) => string | Promise<string>` usada por `format()`; com ela o JSON tambem passa por ela. O controle liga o exemplo: tira os espacos do fim das linhas.",
      table: row(FORMAT, "ArkCodeFormatter", "undefined")
    },
    "format()": {
      control: false,
      description:
        "Formata o documento (tambem Shift+Alt+F): `false` sem formatador ou quando falha, com `ark-format-error`.",
      table: row(FORMAT, "() => Promise<boolean>")
    },
    canFormat: {
      control: false,
      description: "Leitura: se a linguagem atual tem como ser formatada (JSON ou `formatter`).",
      table: row(FORMAT, "boolean")
    },
    change: {
      control: false,
      description: "A cada edicao do usuario (nao em atribuicoes a `value`), com o fim de linha configurado.",
      table: row(EVENTS, "CustomEvent<{ value: string }>")
    },
    "ark-submit": {
      control: false,
      description: "Enter em `single-line` (fora da lista de completions aberta).",
      table: row(EVENTS, "CustomEvent<{ value: string }>")
    },
    "ark-format-error": {
      control: false,
      description: "`format()` falhou: JSON invalido ou formatador que lancou.",
      table: row(EVENTS, "CustomEvent<{ error: unknown }>")
    },
    "focus()": {
      control: false,
      description: "Foca o CodeMirror.",
      table: row(READ, "() => void")
    },
    resolvedTheme: {
      control: false,
      description: "Leitura: o tema aplicado depois de resolver `auto`; `null` antes de montar.",
      table: row(READ, '"light" | "dark" | null')
    },
    resolvedLineEnding: {
      control: false,
      description: "Leitura: o fim de linha em vigor depois de resolver `auto`.",
      table: row(READ, '"lf" | "crlf"')
    },
    view: {
      control: false,
      description: "Leitura: o `EditorView` do CodeMirror (uso avancado); `null` antes de montar.",
      table: row(READ, "EditorView | null")
    }
  },
  // A ordem dos args e a ordem das linhas na tabela; `value` sem valor usa o exemplo da linguagem.
  args: {
    value: undefined,
    language: "json",
    theme: "auto",
    readonly: false,
    placeholder: "Cole o corpo da requisicao...",
    ariaLabel: "",
    minHeight: "12rem",
    lineNumbers: true,
    fold: true,
    wrap: false,
    size: "md",
    testid: "",
    indentStyle: "space",
    indentSize: 2,
    lineEnding: "auto",
    tabIndent: true,
    autocomplete: true,
    variableKeys: [],
    completions: [],
    completionSource: false,
    variables: [],
    markUnknownVariables: false,
    singleLine: false,
    formatter: false
  }
};

export default meta;

// Bancada do Playground: botoes dos metodos e o registro dos eventos, para testar pela pagina de docs.
function withBench(editor: ArkCodeEditor): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col gap-2";
  const bar = document.createElement("div");
  bar.className = "flex flex-wrap items-center gap-2";
  const log = document.createElement("pre");
  log.className = "m-0 max-h-40 overflow-auto rounded border border-slate-300 p-2 text-xs";
  log.setAttribute("aria-label", "Eventos do editor");
  log.textContent = "Os eventos aparecem aqui (o mais recente no topo).";
  const entries: string[] = [];
  // Texto numa linha so, com as quebras visiveis e cortado no fim, com o tamanho total.
  const record = (name: string, detail: unknown): void => {
    const text = typeof detail === "string" ? detail.replace(/\r?\n/g, "↵") : String(detail);
    entries.unshift(`${name}: ${text.length > 90 ? `${text.slice(0, 90)}... (${text.length} caracteres)` : text}`);
    log.textContent = entries.slice(0, 8).join("\n");
  };

  const button = (label: string, onClick: () => void): HTMLButtonElement => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "rounded border border-slate-300 px-3 py-1 text-sm";
    el.textContent = label;
    el.addEventListener("click", onClick);
    return el;
  };
  bar.append(
    button("format()", () => void editor.format().then((ok) => record("format()", ok))),
    button("focus()", () => editor.focus()),
    button("value", () => record("value", editor.value))
  );

  editor.addEventListener("change", (event) =>
    record("change", (event as CustomEvent<{ value: string }>).detail.value)
  );
  editor.addEventListener("ark-submit", (event) =>
    record("ark-submit", (event as CustomEvent<{ value: string }>).detail.value)
  );
  editor.addEventListener("ark-format-error", (event) =>
    record("ark-format-error", String((event as CustomEvent<{ error: unknown }>).detail.error))
  );
  wrap.append(editor, bar, log);
  return wrap;
}

export const Playground = {
  // Variaveis de exemplo para o controle ja mostrar o formato; os padroes do elemento estao na tabela.
  args: {
    variableKeys: ["token"],
    variables: [
      { key: "user.email", scope: "collection", intent: "warning", value: "dev@tooark.com" },
      { key: "baseUrl", scope: "global", intent: "info", value: "https://api.tooark.com" }
    ]
  },
  parameters: {
    docs: {
      description: {
        story:
          "Todos os parametros nos controles abaixo. `variables` e `variableKeys` vem com um exemplo (o `{{user.email}}` do texto fica pintado; digite `{{` para as completions); esvazie as listas para ver o editor sem o recurso. `format()` e `focus()` pelos botoes, `value` le a propriedade, e `change`, `ark-submit` e `ark-format-error` entram no registro."
      }
    }
  },
  render: (args: StoryArgs) => withBench(createEditor(args))
};

export const JavaScript = {
  args: { language: "javascript" },
  parameters: {
    docs: {
      description: {
        story:
          '`language="javascript"`: realce, dobra de blocos e as completions da propria linguagem (palavras-chave e variaveis locais).'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args)
};

export const Yaml = {
  args: { language: "yaml" },
  parameters: {
    docs: {
      description: {
        story: '`language="yaml"`: realce e dobra por recuo. Sem `formatter` do app, YAML nao formata.'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args)
};

export const Readonly = {
  args: { language: "json", readonly: true, minHeight: "0" },
  parameters: {
    docs: {
      description: {
        story: "Somente leitura: sem cursor de edicao nem realce da linha ativa; a busca (Ctrl+F) e a dobra continuam."
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args)
};

export const Empty = {
  args: { language: "json", value: "" },
  parameters: {
    docs: {
      description: {
        story: "Documento vazio: o `placeholder` aparece ate a primeira edicao."
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args)
};

export const WrapWithoutGutters = {
  args: {
    language: "text",
    wrap: true,
    lineNumbers: false,
    fold: false,
    minHeight: "6rem",
    value:
      "Uma linha longa o bastante para passar da largura do editor e mostrar a quebra visual em vez da rolagem horizontal, como num campo de notas ou num corpo de resposta em texto puro.\n"
  },
  parameters: {
    docs: {
      description: {
        story:
          '`wrap` quebra as linhas longas na largura do editor; `line-numbers="false"` e `fold="false"` tiram as calhas.'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args)
};

export const DarkTheme = {
  args: { language: "javascript", theme: "dark" },
  parameters: {
    docs: {
      description: {
        story:
          '`theme="dark"` fixa o lado escuro independentemente da pagina; o chrome continua nos tokens `--ark-color-*`.'
      }
    }
  },
  render: (args: StoryArgs) => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl p-4";
    wrap.style.background = "oklch(20.8% 0.042 265.755)";
    wrap.appendChild(createEditor(args));
    return wrap;
  }
};

export const VariableCompletion = {
  args: { language: "json", minHeight: "8rem", value: "", variableKeys: ["baseUrl", "token", "user.email", "user.id"] },
  parameters: {
    docs: {
      description: {
        story:
          "`variableKeys` (propriedade JS) lista as chaves oferecidas depois de `{{`: a escolha insere `{{chave}}` e, se o `}}` ja foi fechado pelo par automatico, so a chave entra e o cursor pula o fechamento."
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const content = editor.querySelector<HTMLElement>(".cm-content")!;

    await userEvent.click(content);
    // No user-event "{{" e um "{" literal; closeBrackets fecha cada par conforme digita.
    await userEvent.keyboard("{{{{us");
    // closeBrackets fecha os pares: o texto e "{{us}}" com o cursor antes do fechamento.
    await expect(editor.value).toBe("{{us}}");
    const list = await waitFor(() => {
      const ul = document.querySelector<HTMLElement>(".cm-tooltip-autocomplete ul");
      expect(ul).not.toBeNull();
      return ul!;
    });
    const labels = Array.from(list.querySelectorAll("li")).map((li) => li.textContent?.trim());
    expect(labels).toEqual(["user.email", "user.id"]);

    // O CodeMirror ignora Enter nos primeiros 75 ms da lista aberta (interactionDelay).
    await new Promise((resolve) => setTimeout(resolve, 120));
    await userEvent.keyboard("{Enter}");
    await expect(editor.value).toBe("{{user.email}}");
    // O cursor pulou o "}}" fechado: continuar digitando fica depois da variavel.
    await userEvent.keyboard(" ok");
    await expect(editor.value).toBe("{{user.email}} ok");
    // So `variableKeys`: completa, mas nada e pintado (a pintura e opt-in por `variables`).
    expect(editor.querySelector(".cm-ark-variable")).toBeNull();
  }
};

// Escopos de um cliente HTTP; a lib nao conhece nenhum, so recebe o nome, o intent e o valor de cada chave.
const SCOPED_VARIABLES: ArkCodeVariable[] = [
  { key: "baseUrl", scope: "global", intent: "info", value: "https://api.tooark.com" },
  { key: "token", scope: "environment", intent: "success" },
  { key: "user.email", scope: "collection", intent: "warning", value: "dev@tooark.com" },
  { key: "requestId", scope: "local", intent: "primary", value: "42" }
];

const SCOPED_BODY = `{
  "url": "{{baseUrl}}/users",
  "auth": "Bearer {{token}}",
  "email": "{{user.email}}",
  "id": "{{ requestId }}",
  "legacy": "{{legacy}}",
  "typo": "{{tokn}}"
}`;

function variableMark(editor: HTMLElement, key: string): HTMLElement | null {
  return editor.querySelector<HTMLElement>(`[data-ark="code-editor-variable"][data-key="${key}"]`);
}

export const ScopedVariables = {
  args: {
    language: "json",
    minHeight: "10rem",
    value: SCOPED_BODY,
    variableKeys: ["legacy"],
    variables: SCOPED_VARIABLES,
    markUnknownVariables: true
  },
  parameters: {
    docs: {
      description: {
        story:
          "`variables` (propriedade JS) recebe `{ key, scope?, intent?, value? }` por chave: cada `{{chave}}` e pintado com o fundo e o texto suaves do intent (padrao `primary`), inclusive dentro de uma string JSON, e o span leva `data-key`, `data-scope` e `data-intent` para o app sobrescrever a cor por CSS. O escopo e livre (a lib nao conhece nenhum) e a precedencia entre escopos e do app: ele manda uma entrada por chave. `mark-unknown-variables` pinta em `danger`, com sublinhado ondulado, a chave que nao esta em `variables` nem em `variableKeys` (estas completam mas nao pintam). Sem `variables` e sem o atributo, nada muda."
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;

    const base = await waitFor(() => {
      const mark = variableMark(editor, "baseUrl");
      expect(mark).not.toBeNull();
      return mark!;
    });
    expect(base).toHaveAttribute("data-scope", "global");
    expect(base).toHaveAttribute("data-intent", "info");
    expect(base.classList.contains("cm-ark-variable-info")).toBe(true);
    expect(base.textContent).toBe("{{baseUrl}}");
    // Espacos dentro das chaves nao mudam a chave.
    expect(variableMark(editor, "requestId")).toHaveAttribute("data-scope", "local");
    expect(variableMark(editor, "token")).toHaveAttribute("data-intent", "success");

    // Dentro da string JSON a cor e a da variavel: o span dela fica por fora e o realce da string, dentro, herda.
    const inner = base.firstElementChild as HTMLElement;
    expect(inner).not.toBeNull();
    expect(getComputedStyle(inner).color).toBe(getComputedStyle(base).color);
    const stringColor = getComputedStyle(base.nextElementSibling!).color;
    expect(getComputedStyle(base).color).not.toBe(stringColor);
    expect(getComputedStyle(base).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

    // Desconhecida marcada; a de `variableKeys` e conhecida e fica sem pintura.
    const typo = variableMark(editor, "tokn");
    expect(typo).toHaveAttribute("data-unknown", "");
    expect(typo).toHaveAttribute("data-intent", "danger");
    expect(getComputedStyle(typo!).textDecorationLine).toBe("underline");
    expect(variableMark(editor, "legacy")).toBeNull();

    // Sem o atributo, a desconhecida volta a ser texto comum; as conhecidas continuam pintadas.
    editor.removeAttribute("mark-unknown-variables");
    await waitFor(() => expect(variableMark(editor, "tokn")).toBeNull());
    expect(variableMark(editor, "baseUrl")).not.toBeNull();

    // Digitar uma variavel conhecida pinta na hora.
    editor.value = "";
    await userEvent.click(editor.querySelector<HTMLElement>(".cm-content")!);
    await userEvent.keyboard("{{{{token");
    await waitFor(() => expect(variableMark(editor, "token")).not.toBeNull());

    // Sem intent valido vale primary; sem escopo, nao ha data-scope.
    editor.value = SCOPED_BODY;
    editor.variables = [{ key: "baseUrl", intent: "rosa" as never }];
    await waitFor(() => expect(variableMark(editor, "baseUrl")).toHaveAttribute("data-intent", "primary"));
    expect(variableMark(editor, "baseUrl")?.hasAttribute("data-scope")).toBe(false);

    // Lista vazia: nenhuma extensao, nenhuma pintura.
    editor.variables = [];
    await waitFor(() => expect(editor.querySelector(".cm-ark-variable")).toBeNull());
  }
};

export const VariableHints = {
  args: { language: "json", minHeight: "8rem", value: '{ "url": "{{baseUrl}}/users" }\n', variables: SCOPED_VARIABLES },
  parameters: {
    docs: {
      description: {
        story:
          "Passar o mouse sobre uma variavel com `scope` ou `value` mostra um tooltip com o escopo (na cor do intent) e o valor; a completion depois de `{{` traz o escopo como detalhe e o valor como info. Todo o texto e do app: quem nao deve expor um valor (um token, uma senha) so nao manda `value`. O tooltip complementa a cor, que sozinha nao informa o escopo a quem nao distingue cores."
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const base = await waitFor(() => {
      const mark = variableMark(editor, "baseUrl");
      expect(mark).not.toBeNull();
      return mark!;
    });

    // O hover do CodeMirror le as coordenadas do mousemove; o user-event nao as preenche, entao o evento vai a mao.
    const rect = base.getBoundingClientRect();
    base.dispatchEvent(
      new MouseEvent("mousemove", {
        bubbles: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      })
    );
    const tooltip = await waitFor(() => {
      const node = editor.querySelector<HTMLElement>('[data-ark="code-editor-variable-tooltip"]');
      expect(node).not.toBeNull();
      return node!;
    });
    expect(tooltip.querySelector(".cm-ark-variable-tooltip-scope")).toHaveTextContent("global");
    expect(tooltip.querySelector(".cm-ark-variable-tooltip-scope")?.classList.contains("cm-ark-variable-info")).toBe(
      true
    );
    expect(tooltip.querySelector(".cm-ark-variable-tooltip-value")).toHaveTextContent("https://api.tooark.com");

    // Completion: o escopo aparece como detalhe ao lado da chave.
    await userEvent.click(editor.querySelector<HTMLElement>(".cm-content")!);
    await userEvent.keyboard("{Control>}{End}{/Control}{{{{to");
    const option = await waitFor(() => {
      const li = document.querySelector<HTMLElement>(".cm-tooltip-autocomplete li");
      expect(li).not.toBeNull();
      return li!;
    });
    expect(option.querySelector(".cm-completionLabel")).toHaveTextContent("token");
    expect(option.querySelector(".cm-completionDetail")).toHaveTextContent("environment");
    await userEvent.keyboard("{Escape}");
  }
};

const URL_VARIABLES: ArkCodeVariable[] = [
  { key: "baseUrl", scope: "global", intent: "info", value: "https://api.tooark.com" },
  { key: "userId", scope: "local", intent: "primary", value: "42" }
];

export const SingleLine = {
  args: {
    language: "text",
    minHeight: "8rem",
    singleLine: true,
    placeholder: "{{baseUrl}}/caminho",
    value: "{{baseUrl}}/users/{{userId}}?q={{query}}",
    variables: URL_VARIABLES,
    markUnknownVariables: true
  },
  parameters: {
    docs: {
      description: {
        story:
          "`single-line` faz do editor um campo de endereco: uma linha na altura dos controles do mesmo `size` (alinha com `ark-button` e `ark-input`), sem calhas nem linha ativa. Enter emite `ark-submit` com `detail: { value }` (com a lista de completions aberta, o Enter e dela), quebras coladas sao removidas como num `<input>`, Tab sai do campo e Ctrl+F fica com o navegador. Variaveis, completions e `mark-unknown-variables` valem igual."
      }
    }
  },
  render: (args: StoryArgs) => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2";
    const editor = createEditor(args);
    editor.style.flex = "1";
    const send = document.createElement("ark-button");
    send.textContent = "Enviar";
    row.append(editor, send);
    return row;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const send = canvasElement.querySelector<HTMLElement>("ark-button")!;
    const content = editor.querySelector<HTMLElement>(".cm-content")!;
    const root = editor.view!.dom;
    const submits: string[] = [];
    const changes: string[] = [];
    editor.addEventListener("ark-submit", (event) =>
      submits.push((event as CustomEvent<{ value: string }>).detail.value)
    );
    editor.addEventListener("change", (event) => changes.push((event as CustomEvent<{ value: string }>).detail.value));

    // Sem calhas, uma linha, na altura do botao do mesmo size.
    expect(root.classList.contains("cm-ark-single-line")).toBe(true);
    expect(editor.querySelector(".cm-gutters")).toBeNull();
    expect(content).toHaveAttribute("aria-multiline", "false");
    expect(Math.round(root.getBoundingClientRect().height)).toBe(36);
    expect(Math.round(root.getBoundingClientRect().height)).toBe(Math.round(send.getBoundingClientRect().height));
    expect(variableMark(editor, "query")).toHaveAttribute("data-unknown", "");

    // Enter envia e nao quebra a linha.
    await userEvent.click(content);
    await userEvent.keyboard("{End}{Enter}");
    expect(submits).toEqual(["{{baseUrl}}/users/{{userId}}?q={{query}}"]);
    await expect(editor.value).toBe("{{baseUrl}}/users/{{userId}}?q={{query}}");

    // Com a lista aberta, o Enter aceita a completion; o seguinte envia.
    editor.value = "";
    await userEvent.click(content);
    await userEvent.keyboard("{{{{base");
    await waitFor(() => expect(document.querySelector(".cm-tooltip-autocomplete li")).not.toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 120));
    await userEvent.keyboard("{Enter}");
    await expect(editor.value).toBe("{{baseUrl}}");
    expect(submits.length).toBe(1);
    // Com o cursor encostado no "}}" o par de colchetes fica realcado, e a variavel continua num span so.
    await waitFor(() => expect(editor.querySelector(".cm-matchingBracket")).not.toBeNull());
    expect(editor.querySelectorAll('[data-ark="code-editor-variable"][data-key="baseUrl"]').length).toBe(1);
    await userEvent.keyboard("{Enter}");
    expect(submits[submits.length - 1]).toBe("{{baseUrl}}");

    // Colar texto com quebras junta tudo numa linha, e o change sai ja sem elas.
    editor.view!.dispatch({
      changes: { from: editor.view!.state.doc.length, insert: "/a\n/b\r\n/c" },
      userEvent: "input.paste"
    });
    await expect(editor.value).toBe("{{baseUrl}}/a/b/c");
    expect(changes[changes.length - 1]).toBe("{{baseUrl}}/a/b/c");

    // Tab e Ctrl+F (Cmd+F no macOS) nao sao do campo: o keydown nao e consumido.
    const press = (init: KeyboardEventInit): boolean =>
      content.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
    const mod = /Mac/.test(navigator.platform) ? { metaKey: true } : { ctrlKey: true };
    expect(press({ key: "Tab", keyCode: 9 })).toBe(true);
    expect(press({ key: "f", keyCode: 70, ...mod })).toBe(true);
    expect(editor.querySelector(".cm-search")).toBeNull();

    // Desligar devolve o editor de sempre; ligar sobre um texto de varias linhas junta sem emitir change.
    editor.removeAttribute("single-line");
    expect(editor.querySelector(".cm-lineNumbers")).not.toBeNull();
    expect(content).toHaveAttribute("aria-multiline", "true");
    editor.value = "a\nb";
    const before = changes.length;
    editor.setAttribute("single-line", "");
    await expect(editor.value).toBe("ab");
    expect(changes.length).toBe(before);
    expect(editor.querySelector(".cm-lineNumbers")).toBeNull();
  }
};

export const SingleLineSizes = {
  args: {
    language: "text",
    minHeight: "8rem",
    placeholder: "{{baseUrl}}/caminho",
    singleLine: true,
    value: "{{baseUrl}}/users/{{userId}}",
    variables: URL_VARIABLES
  },
  parameters: {
    docs: {
      description: {
        story:
          "`size` no campo de uma linha: a altura vem de `--ark-size-*` (24/28/36/44/52 px de xs a xl) e a fonte e o recuo seguem o `ark-input`, entao editor, input e botao do mesmo `size` alinham lado a lado."
      }
    }
  },
  render: (args: StoryArgs) => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      const row = document.createElement("div");
      row.className = "flex items-center gap-2";
      row.dataset.size = size;
      const editor = createEditor({ ...args, size });
      editor.style.flex = "1";
      const input = document.createElement("ark-input");
      input.setAttribute("size", size);
      input.setAttribute("placeholder", `ark-input ${size}`);
      input.style.width = "10rem";
      const button = document.createElement("ark-button");
      button.setAttribute("size", size);
      button.textContent = "Enviar";
      row.append(editor, input, button);
      wrap.appendChild(row);
    }
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const heights: Record<ArkSize, number> = { xs: 24, sm: 28, md: 36, lg: 44, xl: 52 };
    for (const [size, height] of Object.entries(heights) as [ArkSize, number][]) {
      const row = canvasElement.querySelector<HTMLElement>(`[data-size="${size}"]`)!;
      const editor = row.querySelector("ark-code-editor") as ArkCodeEditor;
      const measure = (el: Element | null | undefined): number => Math.round(el!.getBoundingClientRect().height);
      expect(measure(editor.view?.dom)).toBe(height);
      expect(measure(row.querySelector("ark-input input"))).toBe(height);
      expect(measure(row.querySelector("ark-button"))).toBe(height);
    }
  }
};

export const IndentationAndLineEndings = {
  args: { language: "json", minHeight: "6rem", value: "{}" },
  parameters: {
    docs: {
      description: {
        story:
          "Tab recua e Shift+Tab desfaz (Esc e depois Tab sai do editor; Ctrl+M alterna o modo de vez). `indent-style` escolhe espacos ou tabulacao e `indent-size` o tamanho; `line-ending` (auto, lf, crlf) vale so na fronteira do valor: por dentro o documento e sempre LF, `value`/`change` saem com o fim de linha configurado, e `auto` segue o ultimo valor atribuido."
      }
    }
  },
  render: (args: StoryArgs) => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-3";
    const after = document.createElement("button");
    after.type = "button";
    after.className = "self-start rounded border border-slate-300 px-3 py-1 text-sm";
    after.textContent = "Proximo campo";
    wrap.append(createEditor(args), after);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const content = editor.querySelector<HTMLElement>(".cm-content")!;
    const after = canvasElement.querySelector<HTMLButtonElement>("button")!;

    // Tab recua com o tamanho configurado (2 espacos por padrao).
    editor.value = "a";
    await userEvent.click(content);
    await userEvent.keyboard("{Home}{Tab}");
    await expect(editor.value).toBe("  a");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect(editor.value).toBe("a");

    editor.setAttribute("indent-size", "4");
    await userEvent.keyboard("{Tab}");
    await expect(editor.value).toBe("    a");

    editor.setAttribute("indent-style", "tab");
    editor.value = "b";
    await userEvent.click(content);
    await userEvent.keyboard("{Home}{Tab}");
    await expect(editor.value).toBe("\tb");

    // Esc e depois Tab deixam o editor em vez de recuar. O user-event nao envia keyCode, que o tab-focus mode do
    // CodeMirror le: os eventos vao a mao, e a prova de que o Tab escapou e o keydown nao ter sido consumido (no
    // navegador o foco segue entao para o proximo campo, o botao abaixo).
    const press = (key: string, keyCode: number): boolean =>
      content.dispatchEvent(new KeyboardEvent("keydown", { key, keyCode, bubbles: true, cancelable: true }));
    expect(press("Tab", 9)).toBe(false);
    await expect(editor.value).toBe("\t\tb");
    press("Escape", 27);
    expect(press("Tab", 9)).toBe(true);
    await expect(editor.value).toBe("\t\tb");
    expect(after).toBeInTheDocument();

    // tab-indent="false": Tab e navegacao pura.
    editor.setAttribute("tab-indent", "false");
    expect(press("Tab", 9)).toBe(true);
    await expect(editor.value).toBe("\t\tb");
    editor.removeAttribute("tab-indent");

    // Fim de linha: auto detecta CRLF do valor; lf/crlf forcam; por dentro o documento fica em LF.
    editor.value = "x\r\ny";
    expect(editor.resolvedLineEnding).toBe("crlf");
    await expect(editor.value).toBe("x\r\ny");
    expect(editor.view?.state.doc.toString()).toBe("x\ny");
    editor.setAttribute("line-ending", "lf");
    await expect(editor.value).toBe("x\ny");
    editor.setAttribute("line-ending", "crlf");
    editor.value = "p\nq";
    await expect(editor.value).toBe("p\r\nq");
    const changes: string[] = [];
    editor.addEventListener("change", (event) => changes.push((event as CustomEvent<{ value: string }>).detail.value));
    await userEvent.click(content);
    await userEvent.keyboard("{Control>}{End}{/Control}{Enter}r");
    await expect(changes.at(-1)).toBe("p\r\nq\r\nr");
  }
};

export const Formatting = {
  args: { language: "json", minHeight: "8rem", value: '{"a":1,"b":[1,2,{"c":true}]}' },
  parameters: {
    docs: {
      description: {
        story:
          "`format()` (tambem Shift+Alt+F) formata o documento: JSON de fabrica, com o recuo configurado; outras linguagens so com a propriedade `formatter(value, language)` do app (Prettier, js-yaml...). JSON invalido ou formatador que lanca disparam `ark-format-error` e devolvem `false`; a formatacao entra no historico e emite `change`."
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const errors: unknown[] = [];
    const changes: string[] = [];
    editor.addEventListener("ark-format-error", (event) => errors.push((event as CustomEvent).detail.error));
    editor.addEventListener("change", (event) => changes.push((event as CustomEvent<{ value: string }>).detail.value));

    expect(editor.canFormat).toBe(true);
    await expect(editor.format()).resolves.toBe(true);
    await expect(editor.value).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2,\n    {\n      "c": true\n    }\n  ]\n}');
    expect(changes.length).toBe(1);

    // Recuo por tabulacao vale para o JSON formatado; o atalho faz o mesmo que format().
    editor.setAttribute("indent-style", "tab");
    editor.value = '{"k":[1]}';
    await userEvent.click(editor.querySelector<HTMLElement>(".cm-content")!);
    await userEvent.keyboard("{Shift>}{Alt>}f{/Alt}{/Shift}");
    await waitFor(() => expect(editor.value).toBe('{\n\t"k": [\n\t\t1\n\t]\n}'));

    // JSON invalido: erro reportado, documento intacto.
    editor.value = "{oops";
    await expect(editor.format()).resolves.toBe(false);
    expect(errors.length).toBe(1);
    await expect(editor.value).toBe("{oops");

    // Sem formatador, YAML nao formata; com o formatador do app, formata o que ele devolver.
    editor.setAttribute("language", "yaml");
    expect(editor.canFormat).toBe(false);
    await expect(editor.format()).resolves.toBe(false);
    editor.formatter = (value, language) => `# ${language}\n${value.trim()}\n`;
    expect(editor.canFormat).toBe(true);
    editor.value = "  a: 1  ";
    await expect(editor.format()).resolves.toBe(true);
    await expect(editor.value).toBe("# yaml\na: 1\n");
  }
};

export const Completions = {
  args: {
    language: "yaml",
    minHeight: "8rem",
    value: "",
    completions: [
      { label: "apiVersion", type: "keyword", detail: "string" },
      { label: "kind", type: "keyword", detail: "string" },
      { label: "metadata", type: "property" },
      { label: "spec", type: "property" }
    ]
  },
  parameters: {
    docs: {
      description: {
        story:
          'Alem das completions da propria linguagem (JavaScript traz palavras-chave e variaveis locais), `completions` oferece palavras do app em qualquer linguagem (chaves de um schema, por exemplo) e `completionSource` uma fonte com contexto; `autocomplete="false"` desliga tudo. Ctrl+Espaco abre a lista a qualquer momento.'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const content = editor.querySelector<HTMLElement>(".cm-content")!;

    await userEvent.click(content);
    await userEvent.keyboard("ap");
    const list = await waitFor(() => {
      const ul = document.querySelector<HTMLElement>(".cm-tooltip-autocomplete ul");
      expect(ul).not.toBeNull();
      return ul!;
    });
    expect(Array.from(list.querySelectorAll("li")).map((li) => li.textContent?.trim())).toEqual(["apiVersionstring"]);
    await new Promise((resolve) => setTimeout(resolve, 120));
    await userEvent.keyboard("{Enter}");
    await expect(editor.value).toBe("apiVersion");

    // Fonte propria com contexto: depois de "kind: " sugere os tipos.
    editor.completionSource = (context) => {
      const match = context.matchBefore(/kind:\s*\w*/);
      if (!match) return null;
      const typed = match.text.match(/\w*$/)?.[0] ?? "";
      return { from: match.to - typed.length, options: [{ label: "Deployment" }, { label: "Service" }] };
    };
    editor.value = "kind: ";
    await userEvent.click(content);
    await userEvent.keyboard("{End}D");
    await waitFor(() => expect(document.querySelector(".cm-tooltip-autocomplete li")?.textContent).toBe("Deployment"));
    await userEvent.keyboard("{Escape}");

    // autocomplete="false" desliga tudo, inclusive Ctrl+Espaco.
    editor.setAttribute("autocomplete", "false");
    editor.value = "";
    await userEvent.click(content);
    await userEvent.keyboard("ap");
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(document.querySelector(".cm-tooltip-autocomplete")).toBeNull();
  }
};

export const FollowsPageTheme = {
  args: { language: "json", theme: "auto", minHeight: "6rem", value: '{ "theme": "auto" }' },
  parameters: {
    docs: {
      description: {
        story:
          'Em `theme="auto"` o editor resolve o color-scheme da pagina e acompanha a troca em tempo de execucao (`observeColorScheme` de @tooark/tokens); `resolvedTheme` expoe o lado aplicado e o CodeMirror recebe `color-scheme` para os tokens `light-dark()` seguirem.'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const root = document.documentElement;
    const before = root.style.colorScheme;
    try {
      root.style.colorScheme = "light";
      await waitFor(() => expect(editor.resolvedTheme).toBe("light"));
      root.style.colorScheme = "dark";
      await waitFor(() => expect(editor.resolvedTheme).toBe("dark"));
      expect(editor.view?.dom.classList.contains("cm-editor")).toBe(true);
      expect(getComputedStyle(editor.view!.dom).colorScheme).toBe("dark");
      editor.setAttribute("theme", "light");
      await waitFor(() => expect(editor.resolvedTheme).toBe("light"));
    } finally {
      root.style.colorScheme = before;
    }
  }
};

export const Editing = {
  args: { language: "json", minHeight: "6rem", value: '{ "a": 1 }' },
  parameters: {
    docs: {
      description: {
        story:
          "Atribuir `value` nao emite `change`; digitar emite com `detail.value`. `readonly` bloqueia a edicao e os atributos trocam extensoes sem recriar o editor."
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  // value por propriedade nao emite change; digitar emite change com detail.value; readonly bloqueia.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const changes: string[] = [];
    editor.addEventListener("change", (event) => changes.push((event as CustomEvent<{ value: string }>).detail.value));

    editor.value = "[]";
    await expect(editor.value).toBe("[]");
    expect(changes).toEqual([]);

    const content = editor.querySelector<HTMLElement>(".cm-content")!;
    await userEvent.click(content);
    await userEvent.keyboard("{End}");
    await userEvent.keyboard(" ");
    await expect(editor.value).toBe("[] ");
    expect(changes).toEqual(["[] "]);

    editor.setAttribute("readonly", "");
    await userEvent.keyboard("x");
    await expect(editor.value).toBe("[] ");
    expect(content.getAttribute("contenteditable")).toBe("false");

    editor.removeAttribute("readonly");
    expect(content.getAttribute("contenteditable")).toBe("true");

    // Atributos trocam extensoes sem recriar o editor.
    editor.setAttribute("line-numbers", "false");
    expect(editor.querySelector(".cm-lineNumbers")).toBeNull();
    editor.setAttribute("line-numbers", "true");
    expect(editor.querySelector(".cm-lineNumbers")).not.toBeNull();
    editor.setAttribute("wrap", "");
    expect(content.classList.contains("cm-lineWrapping")).toBe(true);
    editor.setAttribute("placeholder", "Vazio");
    editor.value = "";
    await expect(editor.querySelector(".cm-placeholder")).toHaveTextContent("Vazio");
  }
};

export const TestHooks = {
  args: { language: "json", minHeight: "4rem", testid: "body", value: "{}" },
  parameters: {
    docs: {
      description: {
        story:
          'Hooks de E2E: a raiz do CodeMirror leva `data-ark="code-editor"` e o `testid` como `data-testid`; cada variavel pintada leva `data-ark="code-editor-variable"` com `data-key`, e o tooltip dela `data-ark="code-editor-variable-tooltip"`.'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const root = canvas.getByTestId("body");
    expect(root).toBe(editor.view?.dom);
    await expect(root).toHaveAttribute("data-ark", "code-editor");
    expect(root.classList.contains("cm-editor")).toBe(true);

    editor.setAttribute("testid", "resposta");
    await expect(root).toHaveAttribute("data-testid", "resposta");
    editor.removeAttribute("testid");
    expect(root.hasAttribute("data-testid")).toBe(false);

    // Cada variavel pintada leva o hook e a chave.
    editor.variables = [{ key: "id", scope: "local" }];
    editor.value = '{ "a": "{{id}}" }';
    await waitFor(() =>
      expect(root.querySelector('[data-ark="code-editor-variable"]')).toHaveAttribute("data-key", "id")
    );
  }
};

export const Properties = {
  args: { language: "json", minHeight: "6rem", value: "{}" },
  parameters: {
    docs: {
      description: {
        story:
          'Cada propriedade JS reflete no atributo correspondente e le de volta com validacao (valor fora da faixa cai no padrao); booleanos seguem a regra dos wrappers ("" e true ligam, false, "false", null e undefined desligam). `variableKeys`, `completions`, `completionSource` e `formatter` tambem valem depois de montado, e `focus()` foca o CodeMirror.'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const content = editor.querySelector<HTMLElement>(".cm-content")!;
    const root = editor.view!.dom;

    // Padroes (os argumentos da story deixam placeholder e theme nos valores do meta).
    expect(editor.indentStyle).toBe("space");
    expect(editor.indentSize).toBe(2);
    expect(editor.lineEnding).toBe("auto");
    expect(editor.tabIndent).toBe(true);
    expect(editor.autocomplete).toBe(true);
    expect(editor.language).toBe("json");
    expect(editor.readonly).toBe(false);
    expect(editor.wrap).toBe(false);
    expect(editor.lineNumbers).toBe(true);
    expect(editor.fold).toBe(true);
    expect(editor.minHeight).toBe("6rem");
    expect(editor.theme).toBe("auto");
    expect(editor.markUnknownVariables).toBe(false);
    expect(editor.singleLine).toBe(false);
    expect(editor.size).toBe("md");
    expect(editor.variables).toEqual([]);
    expect(root.classList.contains("cm-ark-single-line")).toBe(false);

    // Recuo e fim de linha: setter reflete, getter valida.
    editor.indentStyle = "tab";
    await expect(editor).toHaveAttribute("indent-style", "tab");
    editor.indentSize = 4;
    await expect(editor).toHaveAttribute("indent-size", "4");
    expect(editor.indentSize).toBe(4);
    editor.indentSize = 99;
    expect(editor.indentSize).toBe(2);
    editor.lineEnding = "crlf";
    await expect(editor).toHaveAttribute("line-ending", "crlf");
    expect(editor.lineEnding).toBe("crlf");
    editor.setAttribute("line-ending", "cr");
    expect(editor.lineEnding).toBe("auto");

    // Booleanos com a regra dos wrappers.
    editor.tabIndent = false;
    await expect(editor).toHaveAttribute("tab-indent", "false");
    expect(editor.tabIndent).toBe(false);
    editor.tabIndent = "";
    expect(editor.tabIndent).toBe(true);
    editor.autocomplete = "false";
    expect(editor.autocomplete).toBe(false);
    editor.autocomplete = true;
    await expect(editor).toHaveAttribute("autocomplete", "true");
    editor.readonly = true;
    await expect(editor).toHaveAttribute("readonly", "");
    expect(content.getAttribute("contenteditable")).toBe("false");
    editor.readonly = null;
    expect(editor.readonly).toBe(false);
    expect(content.getAttribute("contenteditable")).toBe("true");
    editor.wrap = "";
    expect(editor.wrap).toBe(true);
    expect(content.classList.contains("cm-lineWrapping")).toBe(true);
    editor.wrap = "false";
    expect(editor.wrap).toBe(false);
    editor.lineNumbers = false;
    expect(editor.querySelector(".cm-lineNumbers")).toBeNull();
    editor.lineNumbers = undefined;
    expect(editor.lineNumbers).toBe(false);
    editor.lineNumbers = true;
    expect(editor.querySelector(".cm-lineNumbers")).not.toBeNull();
    editor.fold = false;
    await expect(editor).toHaveAttribute("fold", "false");
    expect(editor.querySelector(".cm-foldGutter")).toBeNull();
    editor.fold = "";
    expect(editor.querySelector(".cm-foldGutter")).not.toBeNull();
    editor.markUnknownVariables = "";
    await expect(editor).toHaveAttribute("mark-unknown-variables", "");
    editor.markUnknownVariables = "false";
    expect(editor.markUnknownVariables).toBe(false);
    editor.singleLine = true;
    await expect(editor).toHaveAttribute("single-line", "");
    expect(root.classList.contains("cm-ark-single-line")).toBe(true);
    expect(editor.querySelector(".cm-lineNumbers")).toBeNull();
    editor.singleLine = null;
    expect(editor.singleLine).toBe(false);
    expect(root.classList.contains("cm-ark-single-line")).toBe(false);
    expect(editor.querySelector(".cm-lineNumbers")).not.toBeNull();

    // Tamanho: reflete, valida e escala a fonte ("md" e o editor de sempre).
    expect(getComputedStyle(root).fontSize).toBe("14px");
    editor.size = "lg";
    await expect(editor).toHaveAttribute("size", "lg");
    expect(getComputedStyle(root).fontSize).toBe("16px");
    editor.setAttribute("size", "huge");
    expect(editor.size).toBe("md");
    expect(getComputedStyle(root).fontSize).toBe("14px");
    editor.removeAttribute("size");

    // Linguagem, placeholder, altura minima e tema.
    editor.language = "yaml";
    await expect(editor).toHaveAttribute("language", "yaml");
    expect(editor.language).toBe("yaml");
    editor.setAttribute("language", "rust");
    expect(editor.language).toBe("text");
    editor.placeholder = "Vazio";
    await expect(editor).toHaveAttribute("placeholder", "Vazio");
    editor.value = "";
    await expect(editor.querySelector(".cm-placeholder")).toHaveTextContent("Vazio");
    editor.placeholder = null;
    expect(editor.hasAttribute("placeholder")).toBe(false);
    expect(editor.placeholder).toBe("");
    expect(editor.querySelector(".cm-placeholder")).toBeNull();
    editor.minHeight = "10rem";
    await expect(editor).toHaveAttribute("min-height", "10rem");
    expect(root.style.getPropertyValue("--ark-code-min-height")).toBe("10rem");
    editor.minHeight = "";
    expect(editor.hasAttribute("min-height")).toBe(false);
    expect(editor.minHeight).toBe("8rem");
    expect(root.style.getPropertyValue("--ark-code-min-height")).toBe("8rem");
    editor.theme = "dark";
    await expect(editor).toHaveAttribute("theme", "dark");
    await waitFor(() => expect(editor.resolvedTheme).toBe("dark"));
    editor.setAttribute("theme", "sepia");
    expect(editor.theme).toBe("auto");

    // Propriedades JS depois de montado: entradas invalidas sao filtradas.
    editor.variableKeys = ["baseUrl", "", 3 as never];
    expect(editor.variableKeys).toEqual(["baseUrl"]);
    editor.variableKeys = null;
    expect(editor.variableKeys).toEqual([]);
    editor.variables = [{ key: "baseUrl", scope: "global", intent: "info" }, { key: "" }, null as never, {} as never];
    expect(editor.variables).toEqual([{ key: "baseUrl", scope: "global", intent: "info" }]);
    editor.variables = null;
    expect(editor.variables).toEqual([]);
    editor.completions = [{ label: "tooark" }, { detail: "sem label" } as never];
    expect(editor.completions).toEqual([{ label: "tooark" }]);
    editor.completions = undefined;
    expect(editor.completions).toEqual([]);
    // O instrumentador do Storybook embrulha funcoes passadas ao expect: a identidade e comparada fora dele.
    const source = (): null => null;
    editor.completionSource = source;
    expect(editor.completionSource === source).toBe(true);
    editor.completionSource = null;
    expect(editor.completionSource).toBeUndefined();
    const formatter = (value: string): string => value.trim();
    editor.formatter = formatter;
    expect(editor.formatter === formatter).toBe(true);
    expect(editor.canFormat).toBe(true);
    editor.formatter = null;
    expect(editor.formatter).toBeUndefined();
    expect(editor.canFormat).toBe(false);

    // focus() entrega o foco ao CodeMirror.
    editor.focus();
    await waitFor(() => expect(editor.view!.hasFocus).toBe(true));
  }
};

// `aria-label` no host vira o nome do conteudo editavel, que e o `role="textbox"`; sem ele nada muda.
export const AccessibleName = {
  args: { language: "json", minHeight: "4rem", ariaLabel: "Corpo da requisicao", value: "{}" },
  render: (args: StoryArgs) => createEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const editor = canvasElement.querySelector("ark-code-editor") as ArkCodeEditor;
    const content = editor.view?.contentDOM as HTMLElement;
    await expect(canvas.getByRole("textbox", { name: "Corpo da requisicao" })).toBe(content);

    editor.setAttribute("aria-label", "Resposta");
    await expect(content).toHaveAttribute("aria-label", "Resposta");
    editor.removeAttribute("aria-label");
    await expect(content.hasAttribute("aria-label")).toBe(false);
  }
};
