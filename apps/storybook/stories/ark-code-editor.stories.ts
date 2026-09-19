import type { ArkCodeEditor, ArkCodeLanguage, ArkCodeTheme } from "@tooark/code";
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
    wrap: { control: "boolean" }
  },
  args: {
    language: "json",
    theme: "auto",
    readonly: false,
    placeholder: "Cole o corpo da requisicao...",
    minHeight: "12rem",
    lineNumbers: true,
    fold: true,
    wrap: false
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
