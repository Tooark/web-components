import type { ArkCodeEditor, ArkCodeIndentStyle, ArkCodeLanguage, ArkCodeLineEnding, ArkCodeTheme } from "@tooark/code";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Code/ArkCodeEditor",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Editor de codigo baseado em CodeMirror 6 exposto como Custom Element <ark-code-editor> (pacote lateral `@tooark/code`, CodeMirror como peer dependency). O texto vai pela propriedade `value` e volta em `change` com `detail: { value }`. Atributos: `language` (json | javascript | yaml | text), `readonly`, `placeholder`, `min-height`, `line-numbers`/`fold` ("false" desliga), `wrap`, `theme`. A propriedade `variableKeys` oferece completions depois de `{{` inserindo `{{chave}}`. O tema `auto` segue o color-scheme da pagina e acompanha a troca em tempo de execucao; o chrome usa os tokens `--ark-color-*` com fallback.'
      }
    }
  },
  argTypes: {
    language: { control: "select", options: ["json", "javascript", "yaml", "text"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    readonly: { control: "boolean" },
    placeholder: { control: "text" },
    minHeight: { control: "text", description: "Altura minima (comprimento CSS). Padrao: 8rem" },
    lineNumbers: { control: "boolean" },
    fold: { control: "boolean" },
    wrap: { control: "boolean" },
    indentStyle: { control: "inline-radio", options: ["space", "tab"], description: "Recuo com espacos ou tabulacao" },
    indentSize: { control: "number", description: "Espacos por nivel ou largura da tabulacao. Padrao: 2" },
    lineEnding: { control: "inline-radio", options: ["auto", "lf", "crlf"], description: "Fim de linha do valor" },
    tabIndent: { control: "boolean", description: "Tab recua; Esc+Tab sai do editor" },
    autocomplete: { control: "boolean" }
  },
  args: {
    language: "json",
    theme: "auto",
    readonly: false,
    placeholder: "Cole o corpo da requisicao...",
    minHeight: "12rem",
    lineNumbers: true,
    fold: true,
    wrap: false,
    indentStyle: "space",
    indentSize: 2,
    lineEnding: "auto",
    tabIndent: true,
    autocomplete: true
  }
};

export default meta;

type StoryArgs = {
  language: ArkCodeLanguage;
  theme: ArkCodeTheme;
  readonly: boolean;
  placeholder: string;
  minHeight: string;
  lineNumbers: boolean;
  fold: boolean;
  wrap: boolean;
  indentStyle: ArkCodeIndentStyle;
  indentSize: number;
  lineEnding: ArkCodeLineEnding;
  tabIndent: boolean;
  autocomplete: boolean;
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

function createEditor(args: Partial<StoryArgs>, value?: string): ArkCodeEditor {
  const el = document.createElement("ark-code-editor") as ArkCodeEditor;
  if (args.language) el.setAttribute("language", args.language);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.readonly) el.setAttribute("readonly", "");
  if (args.placeholder) el.setAttribute("placeholder", args.placeholder);
  if (args.minHeight) el.setAttribute("min-height", args.minHeight);
  if (args.lineNumbers === false) el.setAttribute("line-numbers", "false");
  if (args.fold === false) el.setAttribute("fold", "false");
  if (args.wrap) el.setAttribute("wrap", "");
  if (args.indentStyle && args.indentStyle !== "space") el.setAttribute("indent-style", args.indentStyle);
  if (args.indentSize && args.indentSize !== 2) el.setAttribute("indent-size", String(args.indentSize));
  if (args.lineEnding && args.lineEnding !== "auto") el.setAttribute("line-ending", args.lineEnding);
  if (args.tabIndent === false) el.setAttribute("tab-indent", "false");
  if (args.autocomplete === false) el.setAttribute("autocomplete", "false");
  if (args.testid) el.setAttribute("testid", args.testid);
  el.style.maxWidth = "720px";
  el.value = value ?? SAMPLES[args.language ?? "text"];
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createEditor(args)
};

export const JavaScript = {
  args: { language: "javascript" },
  render: (args: StoryArgs) => createEditor(args)
};

export const Yaml = {
  args: { language: "yaml" },
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
  args: { language: "json" },
  render: (args: StoryArgs) => createEditor(args, "")
};

export const WrapWithoutGutters = {
  args: { language: "text", wrap: true, lineNumbers: false, fold: false, minHeight: "6rem" },
  render: (args: StoryArgs) =>
    createEditor(
      args,
      "Uma linha longa o bastante para passar da largura do editor e mostrar a quebra visual em vez da rolagem horizontal, como num campo de notas ou num corpo de resposta em texto puro.\n"
    )
};

export const DarkTheme = {
  args: { language: "javascript", theme: "dark" },
  render: (args: StoryArgs) => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl p-4";
    wrap.style.background = "oklch(20.8% 0.042 265.755)";
    wrap.appendChild(createEditor(args));
    return wrap;
  }
};

export const VariableCompletion = {
  args: { language: "json", minHeight: "8rem" },
  parameters: {
    docs: {
      description: {
        story:
          "`variableKeys` (propriedade JS) lista as chaves oferecidas depois de `{{`: a escolha insere `{{chave}}` e, se o `}}` ja foi fechado pelo par automatico, so a chave entra e o cursor pula o fechamento."
      }
    }
  },
  render: (args: StoryArgs) => {
    const el = createEditor(args, "");
    el.variableKeys = ["baseUrl", "token", "user.email", "user.id"];
    return el;
  },
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
  }
};

export const IndentationAndLineEndings = {
  args: { language: "json", minHeight: "6rem" },
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
    wrap.append(createEditor(args, "{}"), after);
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
  args: { language: "json", minHeight: "8rem" },
  parameters: {
    docs: {
      description: {
        story:
          "`format()` (tambem Shift+Alt+F) formata o documento: JSON de fabrica, com o recuo configurado; outras linguagens so com a propriedade `formatter(value, language)` do app (Prettier, js-yaml...). JSON invalido ou formatador que lanca disparam `ark-format-error` e devolvem `false`; a formatacao entra no historico e emite `change`."
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args, '{"a":1,"b":[1,2,{"c":true}]}'),
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
  args: { language: "yaml", minHeight: "8rem" },
  parameters: {
    docs: {
      description: {
        story:
          'Alem das completions da propria linguagem (JavaScript traz palavras-chave e variaveis locais), `completions` oferece palavras do app em qualquer linguagem (chaves de um schema, por exemplo) e `completionSource` uma fonte com contexto; `autocomplete="false"` desliga tudo. Ctrl+Espaco abre a lista a qualquer momento.'
      }
    }
  },
  render: (args: StoryArgs) => {
    const el = createEditor(args, "");
    el.completions = [
      { label: "apiVersion", type: "keyword", detail: "string" },
      { label: "kind", type: "keyword", detail: "string" },
      { label: "metadata", type: "property" },
      { label: "spec", type: "property" }
    ];
    return el;
  },
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
  args: { language: "json", theme: "auto", minHeight: "6rem" },
  parameters: {
    docs: {
      description: {
        story:
          'Em `theme="auto"` o editor resolve o color-scheme da pagina e acompanha a troca em tempo de execucao (`observeColorScheme` de @tooark/tokens); `resolvedTheme` expoe o lado aplicado e o CodeMirror recebe `color-scheme` para os tokens `light-dark()` seguirem.'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args, '{ "theme": "auto" }'),
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
  args: { language: "json", minHeight: "6rem" },
  render: (args: StoryArgs) => createEditor(args, '{ "a": 1 }'),
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
  args: { language: "json", minHeight: "4rem", testid: "body" },
  render: (args: StoryArgs) => createEditor(args, "{}"),
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
  }
};

export const Properties = {
  args: { language: "json", minHeight: "6rem" },
  parameters: {
    docs: {
      description: {
        story:
          'Cada propriedade JS reflete no atributo correspondente e le de volta com validacao (valor fora da faixa cai no padrao); booleanos seguem a regra dos wrappers ("" e true ligam, false, "false", null e undefined desligam). `variableKeys`, `completions`, `completionSource` e `formatter` tambem valem depois de montado, e `focus()` foca o CodeMirror.'
      }
    }
  },
  render: (args: StoryArgs) => createEditor(args, "{}"),
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
