import type { JSONContent } from "@tiptap/core";
import type { ArkThemeSelected } from "@tooark/tokens";

/** Tema do editor/viewer. "auto" segue o color-scheme do host, ou a preferência do sistema sem lado fixo. */
export type ArkWysiwygTheme = "auto" | ArkThemeSelected;

/**
 * Conteúdo armazenado: JSON do Tiptap/ProseMirror.
 *
 * Optamos por JSON (e não HTML cru) por segurança — é o formato nativo do
 * ProseMirror e evita a superfície de XSS associada a importar HTML arbitrário.
 * Ao entrar (propriedade `content`, `setContent`), o JSON passa por
 * `sanitizeWysiwygContent`: nós e marcas fora do schema caem, `href`/`src`
 * ficam restritos a http(s), mailto, tel e caminhos relativos, e cores só
 * entram em formato de cor.
 */
export type ArkWysiwygContent = JSONContent;

/** Idiomas dos rótulos da toolbar; "custom" usa `locale-json` sobre o inglês. */
export type ArkWysiwygLang = "en" | "pt" | "es" | "custom";

/** Rótulos da toolbar (tooltips, nomes acessíveis, formulário de link). */
export type ArkWysiwygLabels = {
  textStyle: string;
  paragraph: string;
  heading: string;
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  code: string;
  textColor: string;
  highlight: string;
  noColor: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  alignJustify: string;
  bulletList: string;
  orderedList: string;
  indent: string;
  outdent: string;
  link: string;
  linkUrl: string;
  apply: string;
  remove: string;
  invalidUrl: string;
  image: string;
  video: string;
  blockquote: string;
  horizontalRule: string;
  clearFormat: string;
  undo: string;
  redo: string;
  uploading: string;
};

/** Itens individuais da toolbar do editor. */
export type ArkWysiwygToolbarItem =
  | "heading"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "heading-4"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "text-color"
  | "highlight"
  | "align-left"
  | "align-center"
  | "align-right"
  | "align-justify"
  | "bullet-list"
  | "ordered-list"
  | "outdent"
  | "indent"
  | "link"
  | "image"
  | "video"
  | "blockquote"
  | "horizontal-rule"
  | "clear-format"
  | "undo"
  | "redo";

/** Grupos da toolbar: cada um liga ou desliga um conjunto de itens, separados visualmente. */
export type ArkWysiwygToolbarGroup =
  | "style"
  | "marks"
  | "color"
  | "align"
  | "lists"
  | "link"
  | "media"
  | "blocks"
  | "clear"
  | "history";

/** Itens de cada grupo, na ordem em que aparecem. */
export const ARK_WYSIWYG_TOOLBAR_GROUPS: Record<ArkWysiwygToolbarGroup, ArkWysiwygToolbarItem[]> = {
  style: ["heading"],
  marks: ["bold", "italic", "underline", "strike", "code"],
  color: ["text-color", "highlight"],
  align: ["align-left", "align-center", "align-right", "align-justify"],
  lists: ["bullet-list", "ordered-list", "outdent", "indent"],
  link: ["link"],
  media: ["image", "video"],
  blocks: ["blockquote", "horizontal-rule"],
  clear: ["clear-format"],
  history: ["undo", "redo"]
};

/** Grupos exibidos sem o atributo `toolbar`; cor, alinhamento e mídia são opt-in. */
export const ARK_WYSIWYG_DEFAULT_TOOLBAR: ArkWysiwygToolbarGroup[] = [
  "style",
  "marks",
  "lists",
  "link",
  "blocks",
  "clear",
  "history"
];

/** Tipo de arquivo que o editor envia ao gancho de upload. */
export type ArkWysiwygUploadKind = "image" | "video";

/**
 * O que o gancho de upload devolve: a URL final e metadados opcionais. A URL é http(s) ou relativa iniciada por `/`,
 * `#`, `?`, `./` ou `../`; base64, `blob:` ou caminho sem prefixo falham com "invalid-src".
 */
export type ArkWysiwygUploadResult = {
  /** URL onde o arquivo ficou. */
  src: string;
  /** Texto alternativo (imagem). */
  alt?: string;
  /** Título/legenda. */
  title?: string;
  /** Imagem de capa (vídeo). */
  poster?: string;
};

/**
 * Gancho de upload fornecido pelo app: recebe o arquivo, guarda onde quiser e devolve a URL. Sem ele o editor não
 * aceita arquivos (nem colados, nem arrastados) e a toolbar não mostra imagem/vídeo.
 */
export type ArkWysiwygUploader = (file: File, kind: ArkWysiwygUploadKind) => Promise<ArkWysiwygUploadResult>;

/** Motivo de um arquivo recusado ou de um upload que falhou. */
export type ArkWysiwygUploadErrorReason = "no-uploader" | "unsupported-type" | "too-large" | "invalid-src" | "failed";

/** Detalhe do evento `ark-wysiwyg-upload-error` e do callback `onUploadError`. */
export type ArkWysiwygUploadError = {
  reason: ArkWysiwygUploadErrorReason;
  file: File;
  /** Erro lançado pelo gancho, quando `reason` é "failed". */
  error?: unknown;
};

export type ArkWysiwygEditorOptions = {
  /** Conteúdo inicial (JSON do Tiptap), sanitizado ao entrar. */
  content?: ArkWysiwygContent | null;
  /** Tema visual. Padrão: "auto". */
  theme?: ArkWysiwygTheme;
  /** Texto exibido quando o editor está vazio. */
  placeholder?: string;
  /** Se o conteúdo é editável. Padrão: true. */
  editable?: boolean;
  /** Gancho de upload de imagem/vídeo; sem ele arquivos são recusados. */
  uploadFile?: ArkWysiwygUploader;
  /** Tamanho máximo de arquivo aceito, em bytes. Padrão: 10 MiB. */
  maxFileSize?: number;
  /** Chamado a cada edição do usuário (não em `setContent`). */
  onChange?: (content: ArkWysiwygContent) => void;
  /** Chamado quando um arquivo é recusado ou o upload falha. */
  onUploadError?: (error: ArkWysiwygUploadError) => void;
  /** Chamado quando o número de uploads em andamento muda. */
  onUploadingChange?: (count: number) => void;
};

export type ArkWysiwygViewerOptions = {
  /** Conteúdo a renderizar (JSON do Tiptap), sanitizado ao entrar. */
  content?: ArkWysiwygContent | null;
  /** Tema visual. Padrão: "auto". */
  theme?: ArkWysiwygTheme;
};

/** Re-export do tipo nativo do Tiptap para conveniência. */
export type { JSONContent };
