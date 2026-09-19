import type {
  ArkWysiwygContent,
  ArkWysiwygEditor,
  ArkWysiwygUploadError,
  ArkWysiwygUploadResult,
  ArkWysiwygViewer
} from "@tooark/wysiwyg";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Wysiwyg/ArkWysiwyg",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Editor e viewer WYSIWYG (Custom Elements) baseados em Tiptap. O conteudo trafega como JSON (nao HTML cru) pela propriedade `content` e e sanitizado ao entrar: nos e marcas fora do schema caem, `href`/`src` so em http(s), mailto, tel ou caminho relativo, cores so em formato de cor. A toolbar e montada por grupos opt-in (`toolbar="style,marks,color,align,lists,link,media,blocks,clear,history"` ou `all`); `media` so aparece com a propriedade `uploadFile`, que recebe o arquivo e devolve a URL externa (nunca base64). O editor dispara `ark-wysiwyg-change` com o JSON e `ark-wysiwyg-upload-error` quando um arquivo e recusado; o viewer renderiza o mesmo JSON em modo somente-leitura.'
      }
    }
  },
  argTypes: {
    theme: { control: "select", options: ["auto", "light", "dark"] },
    lang: { control: "select", options: ["en", "pt", "es"] },
    toolbar: {
      control: "text",
      description:
        "Grupos e/ou itens separados por virgula, `all`, ou `none`. Padrao: style,marks,lists,link,blocks,clear,history"
    },
    placeholder: { control: "text" }
  },
  args: {
    theme: "light",
    lang: "pt",
    toolbar: "",
    placeholder: "Escreva alguma coisa..."
  }
};

export default meta;

type StoryArgs = {
  theme: "auto" | "light" | "dark";
  lang: "en" | "pt" | "es";
  toolbar: string;
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
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "underline" }], text: "sublinhado" },
        { type: "text", text: " e um " },
        { type: "text", marks: [{ type: "link", attrs: { href: "https://tooark.com" } }], text: "link" },
        { type: "text", text: "." }
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

// Uploader de exemplo: devolve uma URL estatica do Storybook, como um app devolveria a URL do seu storage.
const fakeUploader = async (file: File): Promise<ArkWysiwygUploadResult> => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return file.type.startsWith("image/")
    ? { src: "/sample-image.svg", alt: file.name }
    : { src: "/sample-video.mp4", title: file.name };
};

function makeEditor(args: Partial<StoryArgs>, content: ArkWysiwygContent | null = SAMPLE_CONTENT): ArkWysiwygEditor {
  const editor = document.createElement("ark-wysiwyg-editor") as ArkWysiwygEditor;
  if (args.theme) editor.setAttribute("theme", args.theme);
  if (args.lang) editor.setAttribute("lang", args.lang);
  if (args.toolbar) editor.setAttribute("toolbar", args.toolbar);
  if (args.placeholder) editor.setAttribute("placeholder", args.placeholder);
  editor.style.display = "block";
  editor.style.maxWidth = "720px";
  editor.content = content;
  return editor;
}

function makeViewer(args: Partial<StoryArgs>, content: ArkWysiwygContent | null = SAMPLE_CONTENT): ArkWysiwygViewer {
  const viewer = document.createElement("ark-wysiwyg-viewer") as ArkWysiwygViewer;
  if (args.theme) viewer.setAttribute("theme", args.theme);
  viewer.style.display = "block";
  viewer.style.maxWidth = "720px";
  viewer.content = content;
  return viewer;
}

function buttonsOf(editor: ArkWysiwygEditor): string[] {
  return Array.from(
    editor.querySelectorAll<HTMLElement>('[role="toolbar"] button[aria-label], [role="toolbar"] select')
  ).map((control) => control.getAttribute("aria-label") ?? "");
}

function selectAll(editor: ArkWysiwygEditor): void {
  editor.editor?.chain().focus().selectAll().run();
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

export const AllGroups = {
  args: { toolbar: "all" },
  parameters: {
    docs: {
      description: {
        story:
          '`toolbar="all"` com o gancho `uploadFile` configurado: estilo (select), marcas, cor e marca-texto (paletas em popover), alinhamento, listas com recuo, link (popover com URL), imagem e video (upload pelo app), blocos, limpar formatacao e historico.'
      }
    }
  },
  render: (args: StoryArgs): HTMLElement => {
    const editor = makeEditor(args);
    editor.uploadFile = fakeUploader;
    return editor;
  }
};

export const ToolbarGroups = {
  args: { toolbar: "marks,history" },
  parameters: {
    docs: {
      description: {
        story:
          "Cada grupo liga ou desliga um conjunto de botoes; itens soltos tambem valem (`bold,italic,undo`). `media` so entra quando `uploadFile` existe, mesmo com `all`."
      }
    }
  },
  render: (args: StoryArgs): HTMLElement => makeEditor(args),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-wysiwyg-editor") as ArkWysiwygEditor;
    expect(buttonsOf(editor)).toEqual(["Negrito", "Itálico", "Sublinhado", "Tachado", "Código", "Desfazer", "Refazer"]);
    expect(editor.querySelectorAll('[role="separator"]').length).toBe(1);

    // Itens soltos, na ordem pedida; `all` sem uploader nao mostra imagem/video.
    editor.setAttribute("toolbar", "undo,bold");
    expect(buttonsOf(editor)).toEqual(["Desfazer", "Negrito"]);
    editor.setAttribute("toolbar", "all");
    const all = buttonsOf(editor);
    expect(all).not.toContain("Imagem");
    expect(all).toContain("Cor do texto");
    expect(all).toContain("Alinhar à esquerda");
    expect(all[0]).toBe("Estilo do texto");

    editor.uploadFile = fakeUploader;
    expect(buttonsOf(editor)).toContain("Imagem");
    expect(buttonsOf(editor)).toContain("Vídeo");
    editor.uploadFile = null;
    expect(buttonsOf(editor)).not.toContain("Imagem");

    editor.setAttribute("toolbar", "none");
    expect(editor.querySelector('[role="toolbar"]')).toBeNull();

    // Rotulos em ingles por padrao e por JSON.
    editor.removeAttribute("toolbar");
    editor.setAttribute("lang", "en");
    expect(buttonsOf(editor)[1]).toBe("Bold");
    editor.setAttribute("locale-json", JSON.stringify({ bold: "Strong" }));
    expect(buttonsOf(editor)[1]).toBe("Strong");
  }
};

export const Formatting = {
  args: { toolbar: "all" },
  render: (args: StoryArgs): HTMLElement => makeEditor(args, null),
  // Estilo pelo select, sublinhado e tachado, cores pela paleta, alinhamento, listas com recuo e limpar formatacao.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const editor = canvasElement.querySelector("ark-wysiwyg-editor") as ArkWysiwygEditor;
    const changes: ArkWysiwygContent[] = [];
    editor.addEventListener("ark-wysiwyg-change", (event) => changes.push((event as CustomEvent).detail));

    const content = editor.querySelector<HTMLElement>(".ProseMirror")!;
    await userEvent.click(content);
    await userEvent.keyboard("Titulo");
    const select = canvas.getByRole("combobox", { name: "Estilo do texto" }) as HTMLSelectElement;
    expect(select.value).toBe("paragraph");
    await userEvent.selectOptions(select, "2");
    expect(editor.editor?.isActive("heading", { level: 2 })).toBe(true);
    expect(select.value).toBe("2");
    expect(editor.content?.content?.[0]).toMatchObject({ type: "heading", attrs: { level: 2 } });

    // Marcas: sublinhado e tachado sao independentes.
    selectAll(editor);
    await userEvent.click(canvas.getByRole("button", { name: "Sublinhado" }));
    await userEvent.click(canvas.getByRole("button", { name: "Tachado" }));
    expect(canvas.getByRole("button", { name: "Sublinhado" })).toHaveAttribute("aria-pressed", "true");
    expect(content.querySelector("u")).not.toBeNull();
    expect(content.querySelector("s")).not.toBeNull();

    // Cor do texto pela paleta: o botao mostra a cor na barra; "Sem cor" limpa.
    await userEvent.click(canvas.getByRole("button", { name: "Cor do texto" }));
    const palette = await waitFor(() => canvas.getByRole("group", { name: "Cor do texto" }));
    await userEvent.click(within(palette).getByRole("button", { name: "#3b82f6" }));
    expect(editor.editor?.getAttributes("textStyle").color).toBe("#3b82f6");
    expect(canvas.getByRole("button", { name: "Cor do texto" }).style.getPropertyValue("--ark-wysiwyg-swatch")).toBe(
      "#3b82f6"
    );
    await userEvent.click(canvas.getByRole("button", { name: "Marca-texto" }));
    const highlights = await waitFor(() => canvas.getByRole("group", { name: "Marca-texto" }));
    await userEvent.click(within(highlights).getByRole("button", { name: "#fde047" }));
    expect(content.querySelector("mark")).not.toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Cor do texto" }));
    await userEvent.click(
      within(canvas.getByRole("group", { name: "Cor do texto" })).getByRole("button", { name: "Sem cor" })
    );
    expect(editor.editor?.getAttributes("textStyle").color ?? null).toBeNull();

    // Alinhamento.
    await userEvent.click(canvas.getByRole("button", { name: "Centralizar" }));
    expect(editor.editor?.isActive({ textAlign: "center" })).toBe(true);
    expect(canvas.getByRole("button", { name: "Centralizar" })).toHaveAttribute("aria-pressed", "true");

    // Listas: recuo so entra depois do segundo item; sair de lista desabilita de novo.
    editor.editor?.chain().focus("end").setParagraph().insertContent("\nUm").run();
    await userEvent.click(canvas.getByRole("button", { name: "Lista com marcadores" }));
    expect(canvas.getByRole("button", { name: "Aumentar recuo" })).toBeDisabled();
    await userEvent.keyboard("{Enter}Dois");
    expect(canvas.getByRole("button", { name: "Aumentar recuo" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Aumentar recuo" }));
    expect(content.querySelectorAll("ul ul").length).toBe(1);
    await userEvent.click(canvas.getByRole("button", { name: "Diminuir recuo" }));
    expect(content.querySelectorAll("ul ul").length).toBe(0);

    // Limpar formatacao tira marcas e volta os blocos a paragrafo.
    selectAll(editor);
    await userEvent.click(canvas.getByRole("button", { name: "Limpar formatação" }));
    expect(content.querySelector("h2, u, s, mark, ul")).toBeNull();
    expect(changes.length).toBeGreaterThan(0);
  }
};

export const Links = {
  args: { toolbar: "marks,link" },
  parameters: {
    docs: {
      description: {
        story:
          "O popover de link aplica a URL a selecao (ou insere a URL como texto linkado); um host sem esquema ganha `https://`; `javascript:`/`data:` sao recusados com mensagem. Links renderizam com `target=_blank` e `rel=noopener noreferrer nofollow`."
      }
    }
  },
  render: (args: StoryArgs): HTMLElement => makeEditor(args, null),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const editor = canvasElement.querySelector("ark-wysiwyg-editor") as ArkWysiwygEditor;
    const content = editor.querySelector<HTMLElement>(".ProseMirror")!;

    await userEvent.click(content);
    await userEvent.keyboard("Tooark");
    selectAll(editor);
    await userEvent.click(canvas.getByRole("button", { name: "Link" }));
    const url = await waitFor(() => canvas.getByRole("textbox", { name: "URL" }));
    await waitFor(() => expect(document.activeElement).toBe(url));

    // Esquema perigoso: recusado, o popover fica aberto com a mensagem.
    await userEvent.type(url, "javascript:alert(1){Enter}");
    await expect(url).toHaveAttribute("aria-invalid", "true");
    expect(canvas.getByText("Informe um endereço http(s), mailto ou tel válido")).toBeVisible();
    expect(content.querySelector("a")).toBeNull();

    // Host sem esquema ganha https e vira link.
    await userEvent.clear(url);
    await userEvent.type(url, "tooark.com{Enter}");
    const anchor = await waitFor(() => content.querySelector("a")!);
    expect(anchor).toHaveAttribute("href", "https://tooark.com");
    expect(anchor).toHaveAttribute("target", "_blank");
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer nofollow");
    expect(canvas.getByRole("button", { name: "Link" })).toHaveAttribute("aria-pressed", "true");

    // Reabrir mostra a URL atual; Remover tira o link.
    await userEvent.click(canvas.getByRole("button", { name: "Link" }));
    await waitFor(() =>
      expect((canvas.getByRole("textbox", { name: "URL" }) as HTMLInputElement).value).toBe("https://tooark.com")
    );
    await userEvent.click(canvas.getByRole("button", { name: "Remover" }));
    await waitFor(() => expect(content.querySelector("a")).toBeNull());

    // Sem selecao, a URL e inserida como texto linkado.
    editor.editor?.chain().focus("end").run();
    await userEvent.click(canvas.getByRole("button", { name: "Link" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "URL" }), "https://example.org/docs{Enter}");
    await waitFor(() => expect(content.querySelector("a")?.textContent).toBe("https://example.org/docs"));
  }
};

export const Media = {
  args: { toolbar: "media,history" },
  parameters: {
    docs: {
      description: {
        story:
          "Imagem e video entram pelo gancho `uploadFile(file, kind)`: o app envia o arquivo para onde quiser e devolve `{ src }`; o JSON guarda so a URL. Sem gancho o botao nao existe e arquivos colados/arrastados sao recusados (`ark-wysiwyg-upload-error`). URLs `data:`/`blob:` devolvidas pelo gancho tambem sao recusadas."
      }
    }
  },
  render: (args: StoryArgs): HTMLElement => {
    const editor = makeEditor(args, null);
    editor.uploadFile = fakeUploader;
    return editor;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const editor = canvasElement.querySelector("ark-wysiwyg-editor") as ArkWysiwygEditor;
    const content = editor.querySelector<HTMLElement>(".ProseMirror")!;
    const errors: ArkWysiwygUploadError[] = [];
    editor.addEventListener("ark-wysiwyg-upload-error", (event) => errors.push((event as CustomEvent).detail));

    const png = new File([new Uint8Array([137, 80, 78, 71])], "foto.png", { type: "image/png" });
    await expect(editor.insertFile(png)).resolves.toBe(true);
    const image = await waitFor(() => content.querySelector("img")!);
    expect(image).toHaveAttribute("src", "/sample-image.svg");
    expect(image).toHaveAttribute("alt", "foto.png");
    expect(JSON.stringify(editor.content)).not.toContain("data:");

    const mp4 = new File([new Uint8Array([0, 0, 0, 24])], "clipe.mp4", { type: "video/mp4" });
    await expect(editor.insertFile(mp4)).resolves.toBe(true);
    await waitFor(() => expect(content.querySelector("video")).toHaveAttribute("src", "/sample-video.mp4"));
    expect(content.querySelector("video")).toHaveAttribute("controls");

    // Tipo fora de imagem/video e tamanho acima do limite sao recusados com motivo.
    await expect(editor.insertFile(new File(["x"], "nota.txt", { type: "text/plain" }))).resolves.toBe(false);
    editor.setAttribute("max-file-size", "2");
    await expect(editor.insertFile(png)).resolves.toBe(false);
    expect(errors.map((error) => error.reason)).toEqual(["unsupported-type", "too-large"]);

    // Gancho que devolve base64: o no nao entra.
    editor.removeAttribute("max-file-size");
    editor.uploadFile = async () => ({ src: "data:image/png;base64,AAAA" });
    await expect(editor.insertFile(png)).resolves.toBe(false);
    expect(errors.at(-1)?.reason).toBe("invalid-src");
    expect(content.querySelectorAll("img").length).toBe(1);

    // Sem gancho: botoes somem e o arquivo e recusado.
    editor.uploadFile = null;
    expect(canvas.queryByRole("button", { name: "Imagem" })).toBeNull();
    await expect(editor.insertFile(png)).resolves.toBe(false);
    expect(errors.at(-1)?.reason).toBe("no-uploader");
  }
};

export const SanitizedContent = {
  args: { toolbar: "marks" },
  parameters: {
    docs: {
      description: {
        story:
          "O JSON que entra pela propriedade `content` (editor e viewer) e sanitizado: link `javascript:` cai, imagem `data:` cai, cor com `;` cai, alinhamento invalido cai e no desconhecido cai sem derrubar o resto."
      }
    }
  },
  render: (args: StoryArgs): HTMLElement => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";
    const hostile: ArkWysiwygContent = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: { textAlign: "expression(1)" },
          content: [
            { type: "text", text: "Seguro: " },
            { type: "text", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }], text: "link perigoso" },
            { type: "text", text: ", " },
            { type: "text", marks: [{ type: "link", attrs: { href: "https://tooark.com" } }], text: "link bom" },
            { type: "text", text: ", " },
            {
              type: "text",
              marks: [{ type: "textStyle", attrs: { color: "red; background: url(https://x)" } }],
              text: "cor injetada"
            },
            { type: "text", text: " e " },
            { type: "text", marks: [{ type: "highlight", attrs: { color: "#fde047" } }], text: "marca boa" }
          ]
        },
        { type: "image", attrs: { src: "data:image/svg+xml,<svg onload=alert(1)>" } },
        { type: "image", attrs: { src: "/sample-image.svg", alt: "boa" } },
        { type: "script", content: [{ type: "text", text: "alert(1)" }] } as ArkWysiwygContent
      ]
    };
    wrap.append(makeEditor(args, hostile), makeViewer(args, hostile));
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const editor = canvasElement.querySelector("ark-wysiwyg-editor") as ArkWysiwygEditor;
    const viewer = canvasElement.querySelector("ark-wysiwyg-viewer") as ArkWysiwygViewer;
    for (const host of [editor, viewer]) {
      const content = host.querySelector<HTMLElement>(".ProseMirror")!;
      const anchors = Array.from(content.querySelectorAll("a")).map((a) => a.getAttribute("href"));
      expect(anchors).toEqual(["https://tooark.com"]);
      expect(content.textContent).toContain("link perigoso");
      const images = Array.from(content.querySelectorAll("img")).map((img) => img.getAttribute("src"));
      expect(images).toEqual(["/sample-image.svg"]);
      expect(content.querySelector("span[style]")).toBeNull();
      expect(content.querySelector("[style*='url(']")).toBeNull();
      expect(content.querySelector("[style*='text-align']")).toBeNull();
      expect(content.querySelector("mark")).not.toBeNull();
      expect(content.textContent).not.toContain("alert(1)");
    }
    expect(JSON.stringify(editor.content)).not.toContain("javascript:");
    expect(JSON.stringify(editor.content)).not.toContain("data:");
  }
};

export const ToolbarKeyboard = {
  args: { toolbar: "marks,history" },
  render: (args: StoryArgs): HTMLElement => makeEditor(args),
  // Um tab stop na toolbar: setas circulam entre os botoes habilitados, Home/End vao as pontas.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Negrito" });
    const code = canvas.getByRole("button", { name: "Código" });
    expect(canvas.getByRole("toolbar")).not.toBeNull();
    expect(bold).toHaveAttribute("tabindex", "0");
    expect(code).toHaveAttribute("tabindex", "-1");

    bold.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(canvas.getByRole("button", { name: "Itálico" }));
    await userEvent.keyboard("{End}");
    // Desfazer e refazer estao desabilitados sem historico: End para no ultimo habilitado.
    expect(document.activeElement).toBe(code);
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(bold);
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(bold);
    expect(code).toHaveAttribute("tabindex", "-1");
  }
};

export const Viewer = {
  render: (args: StoryArgs): HTMLElement => makeViewer(args)
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
    wrap.append(makeEditor(args), makeViewer(args));
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

    const editor = makeEditor({ ...args, toolbar: "all" });
    editor.uploadFile = fakeUploader;
    const viewer = makeViewer(args);
    editor.addEventListener("ark-wysiwyg-change", (event) => {
      viewer.content = (event as CustomEvent<ArkWysiwygContent>).detail;
    });

    wrap.append(editorLabel, editor, viewerLabel, viewer);
    return wrap;
  }
};
