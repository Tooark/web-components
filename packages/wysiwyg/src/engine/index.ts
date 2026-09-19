import type { Extensions, JSONContent } from "@tiptap/core";
import { Editor, mergeAttributes, Node } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { type ArkThemeSelected, resolveColorScheme } from "@tooark/tokens";
import { isSafeUrl, looksLikeHostname, sanitizeWysiwygContent } from "../security";
import type {
  ArkWysiwygEditorOptions,
  ArkWysiwygTheme,
  ArkWysiwygUploadError,
  ArkWysiwygUploadKind,
  ArkWysiwygViewerOptions
} from "../types";

/** Documento vazio do ProseMirror (um parágrafo). */
export const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

/** Tamanho máximo de arquivo aceito por padrão (10 MiB). */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Níveis de título disponíveis no editor. */
export const HEADING_LEVELS = [1, 2, 3, 4] as const;

export type ArkWysiwygInstance = {
  /** Instância nativa do Tiptap (uso avançado: comandos, eventos, etc.). */
  readonly editor: Editor;
  /** Conteúdo atual como JSON do Tiptap. */
  getJSON(): JSONContent;
  /** Substitui o conteúdo (sanitizado) sem disparar `onChange`. `null` limpa para um documento vazio. */
  setContent(content: JSONContent | null): void;
  /** Indica se uma mark/node está ativo na seleção (ex.: "bold", "heading"). */
  isActive(name: string, attrs?: Record<string, unknown>): boolean;
  /** Habilita/desabilita a edição. */
  setEditable(editable: boolean): void;
  /** Troca o tema (aplica data-attribute no elemento host). */
  setTheme(theme: ArkWysiwygTheme): void;
  /** Tema efetivamente aplicado (após resolver "auto"). */
  resolvedTheme(): ArkThemeSelected;
  /** Envia um arquivo pelo gancho de upload e insere a imagem/vídeo na posição dada (padrão: seleção). */
  insertFile(file: File, position?: number): Promise<boolean>;
  /** Uploads em andamento. */
  uploading(): number;
  /** Aplica um link à seleção (ou insere a URL como texto linkado); `false` se a URL é recusada. */
  setLink(href: string): boolean;
  /** Remove o link da seleção. */
  unsetLink(): void;
  /** Libera a instância do Tiptap. */
  destroy(): void;
};

/** Resolve "auto" para "light"/"dark" pelo color-scheme computado de `element`, ou pela preferência do sistema. */
export function resolveWysiwygTheme(theme: ArkWysiwygTheme | undefined, element?: Element | null): ArkThemeSelected {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return resolveColorScheme(element);
}

function applyTheme(element: HTMLElement, theme: ArkThemeSelected): void {
  element.setAttribute("data-ark-theme", theme);
}

// --- Nó de vídeo ---

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      /** Insere um vídeo externo (`<video controls>`). */
      setVideo: (attrs: { src: string; poster?: string | null; title?: string | null }) => ReturnType;
    };
  }
}

/** Vídeo externo como bloco atômico: `src` (e `poster`) apontam para fora, nunca para base64. */
export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      title: { default: null }
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes({ controls: "true", preload: "metadata" }, HTMLAttributes)];
  },

  addCommands() {
    return {
      setVideo:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs })
    };
  }
});

// --- Extensões compartilhadas ---

/**
 * Extensões do editor e do viewer (o mesmo schema nos dois, senão o conteúdo salvo não renderiza): StarterKit
 * (títulos 1-4, sublinhado e link com URL validada), cor de texto, marca-texto, alinhamento, imagem sem base64
 * e vídeo externo. Em `editable` o link não abre no clique (o clique edita); no viewer abre em nova aba.
 */
export function createWysiwygExtensions(options: { editable: boolean; placeholder?: string }): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      heading: { levels: [...HEADING_LEVELS] },
      link: {
        openOnClick: !options.editable,
        autolink: true,
        linkOnPaste: true,
        // A lista de permissão do pacote vale para o que o usuário digita, cola ou autolinka; um host sem
        // esquema ("exemplo.com") passa aqui porque o autolink grava o href já com http.
        isAllowedUri: (url) => isSafeUrl(url) || looksLikeHostname(url),
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" }
      }
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right", "justify"] }),
    Image.configure({ allowBase64: false, inline: false }),
    Video
  ];
  if (options.placeholder) {
    extensions.push(Placeholder.configure({ placeholder: options.placeholder }));
  }
  return extensions;
}

// --- Instância ---

type InternalOptions = {
  content?: JSONContent | null;
  theme?: ArkWysiwygTheme;
  placeholder?: string;
  editable: boolean;
  uploadFile?: ArkWysiwygEditorOptions["uploadFile"];
  maxFileSize?: number;
  onChange?: (content: JSONContent) => void;
  onUploadError?: (error: ArkWysiwygUploadError) => void;
  onUploadingChange?: (count: number) => void;
};

function kindOf(file: File): ArkWysiwygUploadKind | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function mediaFiles(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((file) => kindOf(file) !== null);
}

function createInstance(element: HTMLElement, options: InternalOptions): ArkWysiwygInstance {
  let resolved = resolveWysiwygTheme(options.theme, element);
  let applying = false;
  let uploading = 0;

  const maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
  const fail = (reason: ArkWysiwygUploadError["reason"], file: File, error?: unknown): false => {
    options.onUploadError?.({ reason, file, error });
    return false;
  };

  // Arquivos colados ou arrastados só entram pelo gancho; sem ele são consumidos (nada de base64 no JSON).
  const handleFiles = (files: File[], position?: number): boolean => {
    if (files.length === 0) return false;
    for (const file of files) void insertFile(file, position);
    return true;
  };

  const editor = new Editor({
    element,
    editable: options.editable,
    extensions: createWysiwygExtensions({ editable: options.editable, placeholder: options.placeholder }),
    content: EMPTY_DOC,
    editorProps: {
      handlePaste: (_view, event) => handleFiles(mediaFiles(event.clipboardData?.files)),
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
        return handleFiles(mediaFiles(event.dataTransfer?.files), at?.pos);
      },
      // HTML colado com <img>/<video> só vira nó quando há gancho: sem ele, seria um hotlink que o app não controla.
      transformPastedHTML: (html) => (options.uploadFile ? html : html.replace(/<(img|video|source)\b[^>]*>/gi, ""))
    }
  });

  const setContent = (content: JSONContent | null): void => {
    applying = true;
    try {
      // Fora do historico: Ctrl+Z depois de o app trocar o conteudo nao pode voltar ao documento anterior.
      editor
        .chain()
        .setMeta("addToHistory", false)
        .setContent(sanitizeWysiwygContent(content, editor.schema) ?? EMPTY_DOC, { emitUpdate: false })
        .run();
    } finally {
      applying = false;
    }
  };
  if (options.content) setContent(options.content);

  if (options.onChange) {
    editor.on("update", () => {
      if (!applying) options.onChange?.(editor.getJSON());
    });
  }

  const setUploading = (next: number): void => {
    uploading = next;
    options.onUploadingChange?.(next);
  };

  const insertFile = async (file: File, position?: number): Promise<boolean> => {
    const kind = kindOf(file);
    if (!kind) return fail("unsupported-type", file);
    if (!options.uploadFile) return fail("no-uploader", file);
    if (file.size > maxFileSize) return fail("too-large", file);

    const at = position ?? editor.state.selection.to;
    setUploading(uploading + 1);
    try {
      const result = await options.uploadFile(file, kind);
      if (!result || !isSafeUrl(result.src)) return fail("invalid-src", file);
      if (editor.isDestroyed) return false;
      const pos = Math.min(at, editor.state.doc.content.size);
      const attrs =
        kind === "image"
          ? { src: result.src, alt: result.alt ?? file.name, title: result.title ?? null }
          : { src: result.src, poster: isSafeUrl(result.poster) ? result.poster : null, title: result.title ?? null };
      editor.chain().focus().insertContentAt(pos, { type: kind, attrs }).run();
      return true;
    } catch (error) {
      return fail("failed", file, error);
    } finally {
      setUploading(uploading - 1);
    }
  };

  applyTheme(element, resolved);

  return {
    editor,
    getJSON: () => editor.getJSON(),
    setContent,
    isActive: (name, attrs) => editor.isActive(name, attrs),
    setEditable: (editable) => editor.setEditable(editable),
    setTheme: (theme) => {
      resolved = resolveWysiwygTheme(theme, element);
      applyTheme(element, resolved);
    },
    resolvedTheme: () => resolved,
    insertFile,
    uploading: () => uploading,
    setLink: (raw) => {
      const trimmed = raw.trim();
      const href = looksLikeHostname(trimmed) && !/^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? `https://${trimmed}` : trimmed;
      if (!isSafeUrl(href)) return false;
      const chain = editor.chain().focus().extendMarkRange("link");
      if (editor.state.selection.empty && !editor.isActive("link")) {
        chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
      } else {
        chain.setLink({ href }).run();
      }
      return true;
    },
    unsetLink: () => {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    },
    destroy: () => editor.destroy()
  };
}

/** Cria um editor WYSIWYG (editável) dentro de `element`. */
export function createWysiwygEditor(element: HTMLElement, options: ArkWysiwygEditorOptions = {}): ArkWysiwygInstance {
  return createInstance(element, {
    content: options.content,
    theme: options.theme,
    placeholder: options.placeholder,
    editable: options.editable ?? true,
    uploadFile: options.uploadFile,
    maxFileSize: options.maxFileSize,
    onChange: options.onChange,
    onUploadError: options.onUploadError,
    onUploadingChange: options.onUploadingChange
  });
}

/** Cria um viewer (somente leitura) que renderiza o mesmo JSON do editor. */
export function createWysiwygViewer(element: HTMLElement, options: ArkWysiwygViewerOptions = {}): ArkWysiwygInstance {
  return createInstance(element, {
    content: options.content,
    theme: options.theme,
    editable: false
  });
}
