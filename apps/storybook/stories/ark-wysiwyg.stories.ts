import type { ArkWysiwygContent, ArkWysiwygEditor, ArkWysiwygViewer } from "@tooark/wysiwyg";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Wysiwyg/ArkWysiwyg",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Editor e viewer WYSIWYG (Custom Elements) baseados em Tiptap. O conteudo trafega como JSON (nao HTML cru) pela propriedade `content`. O editor dispara `ark-wysiwyg-change` com o JSON; o viewer renderiza o mesmo JSON em modo somente-leitura."
      }
    }
  },
  argTypes: {
    theme: { control: "select", options: ["auto", "light", "dark"] },
    placeholder: { control: "text" }
  },
  args: {
    theme: "light",
    placeholder: "Escreva alguma coisa..."
  }
};

export default meta;

type StoryArgs = {
  theme: "auto" | "light" | "dark";
  placeholder: string;
};

const SAMPLE_CONTENT: ArkWysiwygContent = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Bem-vindo ao ArkWysiwyg" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Edite este texto: " },
        { type: "text", marks: [{ type: "bold" }], text: "negrito" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "italic" }], text: "italico" },
        { type: "text", text: " e listas." }
      ]
    },
    {
      type: "bulletList",
      content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Conteudo em JSON" }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Seguro contra XSS" }] }] }
      ]
    }
  ]
};

function makeEditor(args: StoryArgs): ArkWysiwygEditor {
  const editor = document.createElement("ark-wysiwyg-editor") as ArkWysiwygEditor;
  editor.setAttribute("theme", args.theme);
  editor.setAttribute("placeholder", args.placeholder);
  editor.style.display = "block";
  editor.style.maxWidth = "720px";
  editor.content = SAMPLE_CONTENT;
  return editor;
}

export const Editor = {
  render: (args: StoryArgs): HTMLElement => {
    const editor = makeEditor(args);
    editor.addEventListener("ark-wysiwyg-change", (event) => {
      console.log("ark-wysiwyg-change", (event as CustomEvent).detail);
    });
    return editor;
  }
};

export const Viewer = {
  render: (args: StoryArgs): HTMLElement => {
    const viewer = document.createElement("ark-wysiwyg-viewer") as ArkWysiwygViewer;
    viewer.setAttribute("theme", args.theme);
    viewer.style.display = "block";
    viewer.style.maxWidth = "720px";
    viewer.content = SAMPLE_CONTENT;
    return viewer;
  }
};

export const FollowsPageTheme = {
  args: {
    theme: "auto"
  },
  parameters: {
    docs: {
      description: {
        story:
          'Em `theme="auto"` editor e viewer resolvem o color-scheme da pagina e acompanham a troca em tempo de execucao (`observeColorScheme` de @tooark/tokens). `resolvedTheme` expoe o lado aplicado; o wrapper leva `data-ark-theme`.'
      }
    }
  },
  render: (args: StoryArgs): HTMLElement => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";
    wrap.style.maxWidth = "720px";
    const editor = makeEditor(args);
    const viewer = document.createElement("ark-wysiwyg-viewer") as ArkWysiwygViewer;
    viewer.setAttribute("theme", args.theme);
    viewer.style.display = "block";
    viewer.content = SAMPLE_CONTENT;
    wrap.append(editor, viewer);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-wysiwyg-editor") as ArkWysiwygEditor;
    const viewer = canvasElement.querySelector("ark-wysiwyg-viewer") as ArkWysiwygViewer;
    const root = document.documentElement;
    const before = root.style.colorScheme;
    try {
      root.style.colorScheme = "light";
      await waitFor(() => expect(editor.resolvedTheme).toBe("light"));
      root.style.colorScheme = "dark";
      await waitFor(() => expect(editor.resolvedTheme).toBe("dark"));
      await waitFor(() => expect(viewer.resolvedTheme).toBe("dark"));
      expect(editor.querySelector(".ark-wysiwyg")).toHaveAttribute("data-ark-theme", "dark");
      root.style.colorScheme = "light";
      await waitFor(() => expect(viewer.querySelector(".ark-wysiwyg")).toHaveAttribute("data-ark-theme", "light"));
    } finally {
      root.style.colorScheme = before;
    }
  }
};

export const EditorAndViewer = {
  render: (args: StoryArgs): HTMLElement => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "24px";
    wrap.style.maxWidth = "720px";

    const editorLabel = document.createElement("strong");
    editorLabel.textContent = "Editor (usuario cria/formata)";
    const viewerLabel = document.createElement("strong");
    viewerLabel.textContent = "Viewer (renderiza o que foi criado)";

    const editor = makeEditor(args);

    const viewer = document.createElement("ark-wysiwyg-viewer") as ArkWysiwygViewer;
    viewer.setAttribute("theme", args.theme);
    viewer.style.display = "block";
    viewer.content = SAMPLE_CONTENT;

    // Edicao no editor atualiza o viewer ao vivo, via JSON.
    editor.addEventListener("ark-wysiwyg-change", (event) => {
      viewer.content = (event as CustomEvent<ArkWysiwygContent>).detail;
    });

    wrap.append(editorLabel, editor, viewerLabel, viewer);
    return wrap;
  }
};
