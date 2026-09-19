import type { Editor } from "@tiptap/core";
import { type ArkThemeSelected, observeColorScheme } from "@tooark/tokens";
import { type ArkWysiwygInstance, createWysiwygEditor, DEFAULT_MAX_FILE_SIZE, HEADING_LEVELS } from "../engine";
import { resolveWysiwygLabels } from "../i18n";
import { type ArkWysiwygIcon, ICONS } from "../icons";
import { isSafeColor } from "../security";
import { ensureWysiwygStyles } from "../styles";
import {
  ARK_WYSIWYG_DEFAULT_TOOLBAR,
  ARK_WYSIWYG_TOOLBAR_GROUPS,
  type ArkWysiwygContent,
  type ArkWysiwygLabels,
  type ArkWysiwygTheme,
  type ArkWysiwygToolbarGroup,
  type ArkWysiwygToolbarItem,
  type ArkWysiwygUploadError,
  type ArkWysiwygUploader
} from "../types";

type ToolbarAction = {
  icon: ArkWysiwygIcon;
  label: keyof ArkWysiwygLabels;
  run: (editor: Editor) => void;
  active?: (editor: Editor) => boolean;
  can?: (editor: Editor) => boolean;
};

type ButtonItem = Exclude<ArkWysiwygToolbarItem, "heading" | "text-color" | "highlight" | "link" | "image" | "video">;

const headingAction = (level: 1 | 2 | 3 | 4): ToolbarAction => ({
  icon: "bold",
  label: "heading",
  run: (e) => e.chain().focus().toggleHeading({ level }).run(),
  active: (e) => e.isActive("heading", { level })
});

// Botões simples: um comando, um estado. Os itens com popover, select ou arquivo têm construção própria.
const ACTIONS: Record<ButtonItem, ToolbarAction> = {
  "heading-1": headingAction(1),
  "heading-2": headingAction(2),
  "heading-3": headingAction(3),
  "heading-4": headingAction(4),
  bold: {
    icon: "bold",
    label: "bold",
    run: (e) => e.chain().focus().toggleBold().run(),
    active: (e) => e.isActive("bold")
  },
  italic: {
    icon: "italic",
    label: "italic",
    run: (e) => e.chain().focus().toggleItalic().run(),
    active: (e) => e.isActive("italic")
  },
  underline: {
    icon: "underline",
    label: "underline",
    run: (e) => e.chain().focus().toggleUnderline().run(),
    active: (e) => e.isActive("underline")
  },
  strike: {
    icon: "strike",
    label: "strike",
    run: (e) => e.chain().focus().toggleStrike().run(),
    active: (e) => e.isActive("strike")
  },
  code: {
    icon: "code",
    label: "code",
    run: (e) => e.chain().focus().toggleCode().run(),
    active: (e) => e.isActive("code")
  },
  "align-left": {
    icon: "alignLeft",
    label: "alignLeft",
    run: (e) => e.chain().focus().setTextAlign("left").run(),
    active: (e) => e.isActive({ textAlign: "left" })
  },
  "align-center": {
    icon: "alignCenter",
    label: "alignCenter",
    run: (e) => e.chain().focus().setTextAlign("center").run(),
    active: (e) => e.isActive({ textAlign: "center" })
  },
  "align-right": {
    icon: "alignRight",
    label: "alignRight",
    run: (e) => e.chain().focus().setTextAlign("right").run(),
    active: (e) => e.isActive({ textAlign: "right" })
  },
  "align-justify": {
    icon: "alignJustify",
    label: "alignJustify",
    run: (e) => e.chain().focus().setTextAlign("justify").run(),
    active: (e) => e.isActive({ textAlign: "justify" })
  },
  "bullet-list": {
    icon: "bulletList",
    label: "bulletList",
    run: (e) => e.chain().focus().toggleBulletList().run(),
    active: (e) => e.isActive("bulletList")
  },
  "ordered-list": {
    icon: "orderedList",
    label: "orderedList",
    run: (e) => e.chain().focus().toggleOrderedList().run(),
    active: (e) => e.isActive("orderedList")
  },
  // Recuo só em listas (aninhar/desaninhar itens): recuo de parágrafo não tem semântica no documento.
  outdent: {
    icon: "outdent",
    label: "outdent",
    run: (e) => e.chain().focus().liftListItem("listItem").run(),
    can: (e) => e.can().liftListItem("listItem")
  },
  indent: {
    icon: "indent",
    label: "indent",
    run: (e) => e.chain().focus().sinkListItem("listItem").run(),
    can: (e) => e.can().sinkListItem("listItem")
  },
  blockquote: {
    icon: "blockquote",
    label: "blockquote",
    run: (e) => e.chain().focus().toggleBlockquote().run(),
    active: (e) => e.isActive("blockquote")
  },
  "horizontal-rule": {
    icon: "horizontalRule",
    label: "horizontalRule",
    run: (e) => e.chain().focus().setHorizontalRule().run()
  },
  "clear-format": {
    icon: "clearFormat",
    label: "clearFormat",
    run: (e) => e.chain().focus().unsetAllMarks().clearNodes().run()
  },
  undo: { icon: "undo", label: "undo", run: (e) => e.chain().focus().undo().run(), can: (e) => e.can().undo() },
  redo: { icon: "redo", label: "redo", run: (e) => e.chain().focus().redo().run(), can: (e) => e.can().redo() }
};

const ALL_ITEMS = new Set<string>(Object.values(ARK_WYSIWYG_TOOLBAR_GROUPS).flat());

function groupOf(item: ArkWysiwygToolbarItem): ArkWysiwygToolbarGroup {
  if (item.startsWith("heading")) return "style";
  for (const [group, items] of Object.entries(ARK_WYSIWYG_TOOLBAR_GROUPS)) {
    if (items.includes(item)) return group as ArkWysiwygToolbarGroup;
  }
  return "marks";
}

/** Cores oferecidas por padrão: tons médios, legíveis nos dois temas. */
const DEFAULT_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b"
];
/** Marca-texto por padrão: pastéis; o CSS força texto escuro dentro de `mark` para ler nos dois temas. */
const DEFAULT_HIGHLIGHTS = ["#fde047", "#fdba74", "#86efac", "#7dd3fc", "#c4b5fd", "#f9a8d4"];

let popoverSeq = 0;

type Segment = { group: ArkWysiwygToolbarGroup; items: ArkWysiwygToolbarItem[] };

/**
 * Editor WYSIWYG (Custom Element) baseado em Tiptap.
 *
 * O conteúdo é trocado pela propriedade `content` (JSON do Tiptap, sanitizado
 * ao entrar), não por atributo. Dispara `ark-wysiwyg-change` (bubbles/composed)
 * com `detail` = JSON a cada edição do usuário.
 *
 * Atributos: `theme`, `placeholder`, `editable` ("false" desabilita), `lang` e
 * `locale-json` (rótulos), `toolbar` (grupos e/ou itens separados por vírgula,
 * `all`, ou "none"/"false" para ocultar; padrão: style, marks, lists, link,
 * blocks, clear, history), `colors` e `highlights` (JSON com a paleta),
 * `max-file-size` (bytes). Propriedade `uploadFile`: sem ela, imagem e vídeo
 * não aparecem na toolbar e arquivos colados ou arrastados são recusados
 * (`ark-wysiwyg-upload-error`), nunca embutidos em base64.
 */
export class ArkWysiwygEditor extends HTMLElement {
  static readonly tagName = "ark-wysiwyg-editor";

  private instance: ArkWysiwygInstance | null = null;
  private root: HTMLDivElement | null = null;
  private toolbarEl: HTMLDivElement | null = null;
  private pendingContent: ArkWysiwygContent | null = null;
  private uploader: ArkWysiwygUploader | null = null;
  private labels: ArkWysiwygLabels = resolveWysiwygLabels("en");
  /** Controles da toolbar na ordem visual, para o tabindex circulante. */
  private controls: HTMLElement[] = [];
  /** Sincronizadores por controle (estado ativo, habilitado, cor atual), rodados a cada mudança de seleção. */
  private syncers: Array<() => void> = [];
  /** Para de observar o tema da página; só existe com `theme="auto"`. */
  private disposeTheme: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return [
      "theme",
      "placeholder",
      "editable",
      "toolbar",
      "lang",
      "locale-json",
      "colors",
      "highlights",
      "max-file-size"
    ];
  }

  /** Conteúdo do editor como JSON do Tiptap. Atribuir substitui (sanitizado) sem disparar `ark-wysiwyg-change`. */
  get content(): ArkWysiwygContent | null {
    return this.instance ? this.instance.getJSON() : this.pendingContent;
  }

  set content(value: ArkWysiwygContent | null) {
    this.pendingContent = value;
    this.instance?.setContent(value);
  }

  /** Gancho de upload de imagem/vídeo (propriedade JS). Sem ele o grupo `media` não aparece e arquivos são recusados. */
  get uploadFile(): ArkWysiwygUploader | null {
    return this.uploader;
  }

  set uploadFile(value: ArkWysiwygUploader | null | undefined) {
    this.uploader = typeof value === "function" ? value : null;
    if (this.instance) this.build();
  }

  /** Paleta da cor do texto (atributo `colors` em JSON ou propriedade). */
  get colors(): string[] {
    return this.readPalette("colors", DEFAULT_COLORS);
  }

  set colors(value: string[] | null | undefined) {
    this.writePalette("colors", value);
  }

  /** Paleta do marca-texto (atributo `highlights` em JSON ou propriedade). */
  get highlights(): string[] {
    return this.readPalette("highlights", DEFAULT_HIGHLIGHTS);
  }

  set highlights(value: string[] | null | undefined) {
    this.writePalette("highlights", value);
  }

  /** Tema efetivamente aplicado (depois de resolver `auto`); `null` antes de renderizar. */
  get resolvedTheme(): ArkThemeSelected | null {
    return this.instance?.resolvedTheme() ?? null;
  }

  /** Instância nativa do Tiptap (uso avançado); `null` antes de renderizar. */
  get editor(): Editor | null {
    return this.instance?.editor ?? null;
  }

  connectedCallback(): void {
    ensureWysiwygStyles();
    this.build();
  }

  disconnectedCallback(): void {
    this.teardown();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.instance) return;

    if (name === "theme") {
      this.applyTheme(this.getTheme());
      this.syncThemeObserver();
      return;
    }
    if (name === "editable") {
      this.instance.setEditable(this.isEditable());
      this.syncToolbar();
      return;
    }
    // placeholder, toolbar, rótulos, paletas e limite exigem reconstrução.
    this.build();
  }

  /** Envia um arquivo pelo gancho e insere a mídia na seleção; `false` se recusado (o evento diz por quê). */
  insertFile(file: File): Promise<boolean> {
    return this.instance ? this.instance.insertFile(file) : Promise.resolve(false);
  }

  private getTheme(): ArkWysiwygTheme {
    const value = (this.getAttribute("theme") || "auto").toLowerCase();
    if (value === "light" || value === "dark") return value;
    return "auto";
  }

  private isEditable(): boolean {
    return this.getAttribute("editable") !== "false";
  }

  private readPalette(name: "colors" | "highlights", fallback: string[]): string[] {
    const raw = this.getAttribute(name);
    if (raw === null) return [...fallback];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isSafeColor) : [...fallback];
    } catch {
      return [...fallback];
    }
  }

  private writePalette(name: "colors" | "highlights", value: string[] | null | undefined): void {
    if (Array.isArray(value)) {
      this.setAttribute(name, JSON.stringify(value.filter(isSafeColor)));
    } else {
      this.removeAttribute(name);
    }
  }

  private getMaxFileSize(): number {
    const raw = Number(this.getAttribute("max-file-size"));
    return this.hasAttribute("max-file-size") && Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_FILE_SIZE;
  }

  // Grupos e itens viram segmentos (um por grupo, na ordem pedida); `media` só entra com o gancho de upload.
  private getToolbar(): Segment[] | false {
    const raw = this.getAttribute("toolbar");
    let tokens: string[];
    if (raw === null) {
      tokens = [...ARK_WYSIWYG_DEFAULT_TOOLBAR];
    } else if (raw === "none" || raw === "false" || raw.trim() === "") {
      return false;
    } else if (raw.trim() === "all") {
      tokens = Object.keys(ARK_WYSIWYG_TOOLBAR_GROUPS);
    } else {
      tokens = raw.split(",").map((token) => token.trim());
    }

    const segments: Segment[] = [];
    const push = (group: ArkWysiwygToolbarGroup, items: ArkWysiwygToolbarItem[]): void => {
      const last = segments[segments.length - 1];
      if (last && last.group === group) {
        last.items.push(...items);
      } else {
        segments.push({ group, items: [...items] });
      }
    };
    for (const token of tokens) {
      if (token in ARK_WYSIWYG_TOOLBAR_GROUPS) {
        const group = token as ArkWysiwygToolbarGroup;
        push(group, ARK_WYSIWYG_TOOLBAR_GROUPS[group]);
      } else if (ALL_ITEMS.has(token) || token in ACTIONS) {
        const item = token as ArkWysiwygToolbarItem;
        push(groupOf(item), [item]);
      }
    }

    const result = segments
      .map((segment) => ({
        group: segment.group,
        items: segment.items.filter((item) => (item === "image" || item === "video" ? this.uploader !== null : true))
      }))
      .filter((segment) => segment.items.length > 0);
    return result.length > 0 ? result : false;
  }

  private build(): void {
    this.teardown();

    if (this.pendingContent === null) {
      this.pendingContent = this.content;
    }
    this.labels = resolveWysiwygLabels(this.getAttribute("lang"), this.getAttribute("locale-json"));

    const root = document.createElement("div");
    root.className = "ark-wysiwyg";

    const segments = this.getToolbar();
    if (segments) {
      this.toolbarEl = this.buildToolbar(segments);
      root.appendChild(this.toolbarEl);
    }

    const mount = document.createElement("div");
    mount.className = "ark-wysiwyg__content";
    root.appendChild(mount);

    this.appendChild(root);
    this.root = root;

    this.instance = createWysiwygEditor(mount, {
      content: this.pendingContent,
      theme: this.getTheme(),
      placeholder: this.getAttribute("placeholder") || undefined,
      editable: this.isEditable(),
      uploadFile: this.uploader ?? undefined,
      maxFileSize: this.getMaxFileSize(),
      onChange: (content) => {
        this.dispatchEvent(
          new CustomEvent("ark-wysiwyg-change", {
            detail: content,
            bubbles: true,
            composed: true
          })
        );
        this.syncToolbar();
      },
      onUploadError: (error: ArkWysiwygUploadError) => {
        this.dispatchEvent(
          new CustomEvent("ark-wysiwyg-upload-error", { detail: error, bubbles: true, composed: true })
        );
      },
      onUploadingChange: (count) => {
        this.root?.toggleAttribute("aria-busy", count > 0);
        this.root?.setAttribute("data-uploading", String(count));
        this.syncToolbar();
      }
    });

    this.instance.editor.on("selectionUpdate", this.syncToolbar);
    this.instance.editor.on("transaction", this.syncToolbar);
    this.syncToolbar();
    this.root.setAttribute("data-ark-theme", this.instance.resolvedTheme());
    this.syncThemeObserver();
  }

  // Em `auto`, a troca de tema da página re-resolve o tema do editor; com tema fixo não há o que observar.
  private syncThemeObserver(): void {
    this.disposeTheme?.();
    this.disposeTheme = null;
    if (this.getTheme() !== "auto") return;
    this.disposeTheme = observeColorScheme(this, () => this.applyTheme("auto"));
  }

  // O engine marca o mount com data-ark-theme; o CSS do tema lê a raiz .ark-wysiwyg, então ela recebe o mesmo.
  private applyTheme(theme: ArkWysiwygTheme): void {
    if (!this.instance) return;
    this.instance.setTheme(theme);
    this.root?.setAttribute("data-ark-theme", this.instance.resolvedTheme());
  }

  // --- Toolbar ---

  private buildToolbar(segments: Segment[]): HTMLDivElement {
    const toolbar = document.createElement("div");
    toolbar.className = "ark-wysiwyg__toolbar";
    toolbar.setAttribute("part", "toolbar");
    toolbar.setAttribute("role", "toolbar");
    toolbar.addEventListener("keydown", this.handleToolbarKeydown);
    toolbar.addEventListener("focusin", this.handleToolbarFocus);
    this.controls = [];
    this.syncers = [];

    segments.forEach((segment, index) => {
      if (index > 0) {
        const separator = document.createElement("span");
        separator.className = "ark-wysiwyg__separator";
        separator.setAttribute("role", "separator");
        separator.setAttribute("aria-orientation", "vertical");
        toolbar.appendChild(separator);
      }
      const group = document.createElement("div");
      group.className = "ark-wysiwyg__group";
      group.setAttribute("data-group", segment.group);
      for (const item of segment.items) group.appendChild(this.buildItem(item));
      toolbar.appendChild(group);
    });

    if (this.controls.length > 0) this.controls[0].tabIndex = 0;
    return toolbar;
  }

  private buildItem(item: ArkWysiwygToolbarItem): HTMLElement {
    if (item === "heading") return this.buildHeadingSelect();
    if (item === "text-color") return this.buildPalette("text-color");
    if (item === "highlight") return this.buildPalette("highlight");
    if (item === "link") return this.buildLink();
    if (item === "image" || item === "video") return this.buildFilePicker(item);

    const action = ACTIONS[item];
    const level = item.startsWith("heading-") ? item.slice(-1) : "";
    const label = level ? `${this.labels.heading} ${level}` : this.labels[action.label];
    const button = this.createButton(label, action.icon);
    if (level) {
      button.textContent = `H${level}`;
      button.classList.add("ark-wysiwyg__btn--text");
    }
    button.addEventListener("click", () => {
      if (!this.instance) return;
      action.run(this.instance.editor);
      this.syncToolbar();
    });
    this.syncers.push(() => {
      if (!this.instance) return;
      const editor = this.instance.editor;
      if (action.active) button.setAttribute("aria-pressed", String(action.active(editor)));
      button.disabled = !editor.isEditable || (action.can ? !action.can(editor) : false);
    });
    return button;
  }

  private createButton(label: string, icon: ArkWysiwygIcon): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ark-wysiwyg__btn";
    button.innerHTML = ICONS[icon];
    button.title = label;
    button.setAttribute("aria-label", label);
    button.tabIndex = -1;
    this.controls.push(button);
    return button;
  }

  // Estilo do bloco: um <select> nativo (teclado e leitor de tela de graça) mostrando o estilo atual.
  private buildHeadingSelect(): HTMLSelectElement {
    const select = document.createElement("select");
    select.className = "ark-wysiwyg__select";
    select.setAttribute("aria-label", this.labels.textStyle);
    select.title = this.labels.textStyle;
    select.tabIndex = -1;
    const normal = document.createElement("option");
    normal.value = "paragraph";
    normal.textContent = this.labels.paragraph;
    select.appendChild(normal);
    for (const level of HEADING_LEVELS) {
      const option = document.createElement("option");
      option.value = String(level);
      option.textContent = `${this.labels.heading} ${level}`;
      select.appendChild(option);
    }
    select.addEventListener("change", () => {
      if (!this.instance) return;
      const chain = this.instance.editor.chain().focus();
      if (select.value === "paragraph") {
        chain.setParagraph().run();
      } else {
        chain.setHeading({ level: Number(select.value) as 1 | 2 | 3 | 4 }).run();
      }
      this.syncToolbar();
    });
    this.controls.push(select);
    this.syncers.push(() => {
      if (!this.instance) return;
      const editor = this.instance.editor;
      const level = HEADING_LEVELS.find((candidate) => editor.isActive("heading", { level: candidate }));
      const value = level ? String(level) : "paragraph";
      if (select.value !== value) select.value = value;
      select.disabled = !editor.isEditable;
    });
    return select;
  }

  // Cor do texto e marca-texto: botão com a cor atual na barra e uma paleta em popover (light dismiss nativo).
  private buildPalette(item: "text-color" | "highlight"): HTMLElement {
    const isText = item === "text-color";
    const wrap = document.createElement("span");
    wrap.className = "ark-wysiwyg__item";
    const button = this.createButton(
      isText ? this.labels.textColor : this.labels.highlight,
      isText ? "textColor" : "highlight"
    );
    button.classList.add("ark-wysiwyg__btn--swatch");
    const popover = this.createPopover();
    button.setAttribute("popovertarget", popover.id);
    button.setAttribute("aria-haspopup", "true");

    const grid = document.createElement("div");
    grid.className = "ark-wysiwyg__swatches";
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", button.title);
    const apply = (color: string | null): void => {
      if (!this.instance) return;
      const chain = this.instance.editor.chain().focus();
      if (isText) {
        (color ? chain.setColor(color) : chain.unsetColor()).run();
      } else {
        (color ? chain.setHighlight({ color }) : chain.unsetHighlight()).run();
      }
      popover.hidePopover();
      this.syncToolbar();
    };
    for (const color of isText ? this.colors : this.highlights) {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "ark-wysiwyg__swatch";
      swatch.style.backgroundColor = color;
      swatch.title = color;
      swatch.setAttribute("aria-label", color);
      swatch.addEventListener("click", () => apply(color));
      grid.appendChild(swatch);
    }
    const none = document.createElement("button");
    none.type = "button";
    none.className = "ark-wysiwyg__swatch ark-wysiwyg__swatch--none";
    none.innerHTML = ICONS.none;
    none.title = this.labels.noColor;
    none.setAttribute("aria-label", this.labels.noColor);
    none.addEventListener("click", () => apply(null));
    grid.appendChild(none);
    popover.appendChild(grid);

    wrap.append(button, popover);
    this.syncers.push(() => {
      if (!this.instance) return;
      const editor = this.instance.editor;
      const current = isText ? editor.getAttributes("textStyle").color : editor.getAttributes("highlight").color;
      button.style.setProperty("--ark-wysiwyg-swatch", isSafeColor(current) ? current : "transparent");
      button.setAttribute("aria-pressed", String(isSafeColor(current)));
      button.disabled = !editor.isEditable;
    });
    return wrap;
  }

  // Link: popover com campo de URL; aplica na seleção (ou insere a URL) e recusa esquemas fora da lista.
  private buildLink(): HTMLElement {
    const wrap = document.createElement("span");
    wrap.className = "ark-wysiwyg__item";
    const button = this.createButton(this.labels.link, "link");
    const popover = this.createPopover();
    popover.classList.add("ark-wysiwyg__popover--link");
    button.setAttribute("popovertarget", popover.id);
    button.setAttribute("aria-haspopup", "dialog");

    const form = document.createElement("form");
    form.className = "ark-wysiwyg__link";
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "url";
    input.setAttribute("autocomplete", "url");
    input.className = "ark-wysiwyg__input";
    input.placeholder = "https://";
    input.setAttribute("aria-label", this.labels.linkUrl);
    const error = document.createElement("p");
    error.className = "ark-wysiwyg__error";
    error.id = `${popover.id}-error`;
    error.hidden = true;
    error.textContent = this.labels.invalidUrl;
    const applyBtn = document.createElement("button");
    applyBtn.type = "submit";
    applyBtn.className = "ark-wysiwyg__btn ark-wysiwyg__btn--text";
    applyBtn.textContent = this.labels.apply;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "ark-wysiwyg__btn ark-wysiwyg__btn--text";
    removeBtn.textContent = this.labels.remove;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!this.instance) return;
      const ok = this.instance.setLink(input.value);
      error.hidden = ok;
      input.setAttribute("aria-invalid", ok ? "false" : "true");
      if (ok) {
        input.removeAttribute("aria-describedby");
        popover.hidePopover();
        this.syncToolbar();
      } else {
        input.setAttribute("aria-describedby", error.id);
        input.focus();
      }
    });
    removeBtn.addEventListener("click", () => {
      this.instance?.unsetLink();
      popover.hidePopover();
      this.syncToolbar();
    });
    popover.addEventListener("toggle", (event) => {
      if ((event as ToggleEvent).newState !== "open" || !this.instance) return;
      const href = this.instance.editor.getAttributes("link").href;
      input.value = typeof href === "string" ? href : "";
      error.hidden = true;
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      removeBtn.hidden = !this.instance.editor.isActive("link");
      input.focus();
      input.select();
    });

    form.append(input, applyBtn, removeBtn);
    popover.append(form, error);
    wrap.append(button, popover);
    this.syncers.push(() => {
      if (!this.instance) return;
      const editor = this.instance.editor;
      button.setAttribute("aria-pressed", String(editor.isActive("link")));
      button.disabled = !editor.isEditable;
    });
    return wrap;
  }

  // Imagem e vídeo: input de arquivo oculto; o envio é do gancho `uploadFile`, o editor só insere a URL.
  private buildFilePicker(item: "image" | "video"): HTMLElement {
    const wrap = document.createElement("span");
    wrap.className = "ark-wysiwyg__item";
    const label = item === "image" ? this.labels.image : this.labels.video;
    const button = this.createButton(label, item === "image" ? "image" : "video");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = `${item}/*`;
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      input.value = "";
      if (file) void this.insertFile(file);
    });
    button.addEventListener("click", () => input.click());
    wrap.append(button, input);
    this.syncers.push(() => {
      if (!this.instance) return;
      const busy = this.instance.uploading() > 0;
      button.disabled = !this.instance.editor.isEditable || busy;
      button.title = busy ? `${this.labels.uploading}…` : label;
    });
    return wrap;
  }

  // `popover="auto"` + popovertarget abrem e fecham sem JS (light dismiss nativo); só a posição é calculada aqui.
  private createPopover(): HTMLDivElement {
    const popover = document.createElement("div");
    popover.id = `ark-wysiwyg-popover-${++popoverSeq}`;
    popover.className = "ark-wysiwyg__popover";
    popover.setAttribute("popover", "auto");
    popover.addEventListener("toggle", (event) => {
      if ((event as ToggleEvent).newState !== "open") return;
      const anchor = this.toolbarEl?.querySelector<HTMLElement>(`[popovertarget="${popover.id}"]`);
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const width = popover.offsetWidth;
      const height = popover.offsetHeight;
      const maxLeft = Math.max(8, document.documentElement.clientWidth - width - 8);
      const below = rect.bottom + 4;
      const top =
        below + height > document.documentElement.clientHeight - 8 ? Math.max(8, rect.top - height - 4) : below;
      popover.style.left = `${Math.round(Math.min(Math.max(8, rect.left), maxLeft))}px`;
      popover.style.top = `${Math.round(top)}px`;
    });
    return popover;
  }

  // Um tab stop por toolbar: setas movem entre os controles habilitados, Home/End vão às pontas.
  private readonly handleToolbarKeydown = (event: KeyboardEvent): void => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const target = event.target as HTMLElement;
    const enabled = this.controls.filter((control) => !(control as HTMLButtonElement).disabled);
    const index = enabled.indexOf(target);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowLeft") next = (index - 1 + enabled.length) % enabled.length;
    if (event.key === "ArrowRight") next = (index + 1) % enabled.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = enabled.length - 1;
    this.setCurrent(enabled[next]);
    enabled[next].focus();
  };

  private readonly handleToolbarFocus = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    if (this.controls.includes(target)) this.setCurrent(target);
  };

  private setCurrent(control: HTMLElement): void {
    for (const candidate of this.controls) candidate.tabIndex = candidate === control ? 0 : -1;
  }

  private readonly syncToolbar = (): void => {
    if (!this.instance) return;
    for (const sync of this.syncers) sync();
    // O controle corrente do tabindex não pode ser um desabilitado, senão a toolbar some da ordem do Tab.
    const current = this.controls.find((control) => control.tabIndex === 0);
    if (current && (current as HTMLButtonElement).disabled) {
      const first = this.controls.find((control) => !(control as HTMLButtonElement).disabled);
      if (first) this.setCurrent(first);
    }
  };

  private teardown(): void {
    this.disposeTheme?.();
    this.disposeTheme = null;
    if (this.instance) {
      this.instance.editor.off("selectionUpdate", this.syncToolbar);
      this.instance.editor.off("transaction", this.syncToolbar);
      this.instance.destroy();
      this.instance = null;
    }
    this.controls = [];
    this.syncers = [];
    this.toolbarEl = null;
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
  }
}

export default ArkWysiwygEditor;
