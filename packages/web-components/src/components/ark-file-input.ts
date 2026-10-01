import {
  type ArkIntent,
  type ArkLocale,
  type ArkRounded,
  type ArkSize,
  announce,
  coerceBooleanAttr,
  resolveLocale
} from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { normalizeIntent } from "./intent-colors";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

let arkFileInputIdCounter = 0;

/** Ícone de enviar (seta para cima numa bandeja), chrome do botão de escolher. */
const UPLOAD_SVG = `
  <svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10 13V4M6 8l4-4 4 4"></path>
    <path d="M3 13v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"></path>
  </svg>`;

type ArkFileInputSizing = {
  button: string;
  zone: string;
  label: string;
  text: string;
};

type ArkFileInputPalette = {
  button: string;
  ring: string;
  dragover: string;
};

/**
 * Campo de arquivo: a grid do ark-input (label, campo, mensagem) em volta de
 * uma zona de soltar com o botão de escolher, a dica de arrastar e a lista
 * dos nomes escolhidos. Um <input type="file"> nativo oculto leva name,
 * accept, multiple, required e disabled ao formulário; o botão abre o
 * seletor nativo e soltar arquivos na zona alimenta o mesmo input. Toda
 * mudança emite `change` com os arquivos e anuncia os nomes ao leitor de
 * tela. O rótulo aponta para o input (associação nativa) e nomeia o botão
 * junto do próprio texto dele. Com `directory` o campo escolhe uma pasta: o
 * seletor abre em modo pasta, uma pasta solta é lida até o fim, a lista vira
 * um resumo e `change` leva também o caminho de cada arquivo. Sem ele, uma
 * pasta solta é recusada com aviso.
 */
export class ArkFileInput extends HTMLElementBase {
  static readonly tagName = "ark-file-input";

  private inputEl: HTMLInputElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private zoneEl: HTMLDivElement | null = null;
  private buttonEl: HTMLButtonElement | null = null;
  private hintEl: HTMLSpanElement | null = null;
  private listEl: HTMLUListElement | null = null;
  private messageEl: HTMLParagraphElement | null = null;
  /** Profundidade de dragenter/dragleave, porque eles disparam também nos filhos da zona. */
  private dragDepth = 0;
  /** O último drop trouxe uma pasta que o campo não aceita: a lista mostra o aviso até a próxima seleção. */
  private folderRejected = false;
  /** Caminho de cada arquivo vindo de um drop em modo pasta, na ordem de `files`; nulo quando veio do seletor. */
  private droppedPaths: string[] | null = null;
  /** Conta as seleções: a leitura assíncrona de uma pasta solta só é publicada se nada veio depois dela. */
  private selectionSeq = 0;

  static get observedAttributes(): string[] {
    return [
      "accept",
      "multiple",
      "directory",
      "label",
      "helper",
      "error",
      "error-message",
      "disabled",
      "required",
      "name",
      "intent",
      "size",
      "rounded",
      "lang",
      "locale-json",
      "theme",
      "testid"
    ];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    if (!this.inputEl) this.render();
    this.updateAppearance();
  }

  attributeChangedCallback(): void {
    if (!this.inputEl || !this.isConnected) return;
    this.updateAppearance();
  }

  /** O <input type="file"> nativo oculto, para composição e para `setInputFiles` em testes. */
  get inputElement(): HTMLInputElement | null {
    return this.inputEl;
  }

  /** Arquivos escolhidos. */
  get files(): File[] {
    return Array.from(this.inputEl?.files ?? []);
  }

  /**
   * Caminho de cada arquivo de `files`, na mesma ordem, a partir da pasta escolhida ou solta (`pasta/sub/a.txt`);
   * o nome do arquivo quando ele não veio de uma pasta.
   */
  get paths(): string[] {
    const dropped = this.droppedPaths;
    return this.files.map((file, index) => dropped?.[index] ?? (file.webkitRelativePath || file.name));
  }

  /** Escolhe uma pasta inteira: o seletor abre em modo pasta e a zona lê as pastas soltas. Padrão: desligado. */
  get directory(): boolean {
    return this.hasAttribute("directory");
  }

  set directory(value: boolean | string | null | undefined) {
    this.toggleAttribute("directory", coerceBooleanAttr(value));
  }

  get multiple(): boolean {
    return this.hasAttribute("multiple");
  }

  set multiple(value: boolean | string | null | undefined) {
    this.toggleAttribute("multiple", coerceBooleanAttr(value));
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Limpa a seleção sem emitir `change`. */
  clear(): void {
    if (!this.inputEl) return;
    this.inputEl.value = "";
    this.resetSelection();
    this.syncList();
  }

  focus(options?: FocusOptions): void {
    this.buttonEl?.focus(options);
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  // Cobre o atributo e o <fieldset disabled>, que desabilita o botão e o input nativamente.
  private isDisabled(): boolean {
    return this.buttonEl ? this.buttonEl.matches(":disabled") : this.disabled;
  }

  // --- Interação ---

  // O change nativo do input oculto não sobe ao host: quem escuta no host recebe só o CustomEvent com detail.
  private readonly handleChange = (event: Event): void => {
    event.stopPropagation();
    this.resetSelection();
    this.publish();
  };

  // Uma seleção nova (seletor, drop ou clear) descarta o aviso, os caminhos do drop anterior e a leitura em curso.
  private resetSelection(): void {
    this.folderRejected = false;
    this.droppedPaths = null;
    this.selectionSeq += 1;
  }

  // Lista, anúncio e `change` da seleção atual do input. Em modo pasta o anúncio é o resumo e `detail` leva os
  // caminhos; fora dele o detail é só `{ files }`, como sempre foi.
  private publish(): void {
    this.syncList();
    const files = this.files;
    const locale = this.getLocale();
    if (this.directory) {
      const summary = this.summarize(locale);
      announce(files.length ? [summary.folder, summary.count].filter(Boolean).join(", ") : locale.noFolder);
      const detail = { files, paths: this.paths };
      this.dispatchEvent(new CustomEvent("change", { detail, bubbles: true, composed: true }));
      return;
    }
    const selection = files.length ? files.map((file) => file.name).join(", ") : locale.noFile;
    announce(this.folderRejected ? `${selection}. ${locale.foldersNotAccepted}` : selection);
    this.dispatchEvent(new CustomEvent("change", { detail: { files }, bubbles: true, composed: true }));
  }

  // Resumo da seleção em modo pasta: o nome da pasta, quando todos os caminhos saem da mesma, a contagem e o tamanho.
  private summarize(locale: ArkLocale): { folder: string; count: string; size: number } {
    const files = this.files;
    const roots = new Set(this.paths.map((path) => (path.includes("/") ? path.slice(0, path.indexOf("/")) : "")));
    const [root = ""] = roots;
    return {
      folder: roots.size === 1 ? root : "",
      count: locale.fileCount.replace("{count}", String(files.length)),
      size: files.reduce((total, file) => total + file.size, 0)
    };
  }

  // Separa arquivos e pastas de um drop. A pasta só se distingue pela entrada (webkitGetAsEntry), que existe só
  // durante o evento; sem a API, ou num DataTransfer montado por código, tudo é arquivo.
  private static readDrop(transfer: DataTransfer): { files: File[]; folders: FileSystemDirectoryEntry[] } {
    const files: File[] = [];
    const folders: FileSystemDirectoryEntry[] = [];
    const items = Array.from(transfer.items ?? []);
    if (items.length === 0) return { files: Array.from(transfer.files ?? []), folders };
    for (const item of items) {
      if (item.kind !== "file") continue;
      const entry = typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
      if (entry?.isDirectory) {
        folders.push(entry as FileSystemDirectoryEntry);
        continue;
      }
      const file = item.getAsFile();
      if (file) files.push(file);
    }
    return { files, folders };
  }

  // Lê uma pasta solta até o fim, descendo nas subpastas. readEntries devolve lotes (100 no Chromium), então é
  // chamado até vir vazio; uma entrada que falha ao ler fica de fora sem derrubar o resto.
  private static async readFolder(
    folder: FileSystemDirectoryEntry,
    prefix: string,
    found: Array<{ file: File; path: string }>
  ): Promise<void> {
    const reader = folder.createReader();
    for (;;) {
      const batch = await new Promise<FileSystemEntry[]>((resolve) => {
        reader.readEntries(resolve, () => resolve([]));
      });
      if (batch.length === 0) return;
      for (const entry of batch) {
        const path = `${prefix}${entry.name}`;
        if (entry.isDirectory) {
          await ArkFileInput.readFolder(entry as FileSystemDirectoryEntry, `${path}/`, found);
        } else if (entry.isFile) {
          const file = await new Promise<File | null>((resolve) => {
            (entry as FileSystemFileEntry).file(resolve, () => resolve(null));
          });
          if (file) found.push({ file, path });
        }
      }
    }
  }

  // Drop em modo pasta: as pastas são lidas até o fim e tudo vai para o input, cada arquivo de pasta com o caminho a
  // partir do nome dela (como o webkitRelativePath do seletor) e os arquivos soltos junto com o próprio nome.
  private async selectDropped(files: File[], folders: FileSystemDirectoryEntry[]): Promise<void> {
    this.resetSelection();
    const seq = this.selectionSeq;
    const found = files.map((file) => ({ file, path: file.name }));
    for (const folder of folders) await ArkFileInput.readFolder(folder, `${folder.name}/`, found);
    // Outra seleção chegou enquanto a pasta era lida: esta não vale mais.
    if (seq !== this.selectionSeq || !this.inputEl) return;
    found.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    const transfer = new DataTransfer();
    for (const entry of found) transfer.items.add(entry.file);
    this.inputEl.files = transfer.files;
    this.droppedPaths = found.map((entry) => entry.path);
    this.publish();
  }

  private readonly handleDragEnter = (event: DragEvent): void => {
    if (this.isDisabled()) return;
    event.preventDefault();
    this.dragDepth += 1;
    this.setDragover(true);
  };

  private readonly handleDragOver = (event: DragEvent): void => {
    if (this.isDisabled()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  };

  private readonly handleDragLeave = (): void => {
    if (this.isDisabled()) return;
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) this.setDragover(false);
  };

  // Soltar alimenta o mesmo input (FileList é atribuível): só o primeiro arquivo sem `multiple`. Uma pasta não é um
  // arquivo (o navegador a entrega como um File vazio, que não dá para ler): sem `directory` fica de fora, com aviso
  // na lista e anúncio; com ele é lida até o fim.
  private readonly handleDrop = (event: DragEvent): void => {
    if (this.isDisabled()) return;
    event.preventDefault();
    this.dragDepth = 0;
    this.setDragover(false);
    if (!event.dataTransfer || !this.inputEl) return;
    const { files, folders } = ArkFileInput.readDrop(event.dataTransfer);
    if (files.length === 0 && folders.length === 0) return;
    if (this.directory) {
      void this.selectDropped(files, folders);
      return;
    }
    if (files.length === 0) {
      // Só pastas: a seleção fica como estava e não há `change`.
      this.folderRejected = true;
      this.syncList();
      announce(this.getLocale().foldersNotAccepted);
      return;
    }
    this.resetSelection();
    this.folderRejected = folders.length > 0;
    const transfer = new DataTransfer();
    const count = this.multiple ? files.length : 1;
    for (let index = 0; index < count; index += 1) transfer.items.add(files[index]);
    this.inputEl.files = transfer.files;
    this.publish();
  };

  private setDragover(active: boolean): void {
    if (this.hasAttribute("data-ark-dragover") === active) return;
    this.toggleAttribute("data-ark-dragover", active);
    this.updateAppearance();
  }

  // --- Aparência ---

  private getSizing(): ArkFileInputSizing {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, ArkFileInputSizing> = {
      xs: {
        button: "ark:min-h-(--ark-size-xs) ark:px-2 ark:text-xs",
        zone: "ark:gap-1.5 ark:p-3",
        label: "ark:text-2xs",
        text: "ark:text-xs"
      },
      sm: {
        button: "ark:min-h-(--ark-size-sm) ark:px-3 ark:text-xs",
        zone: "ark:gap-1.5 ark:p-3",
        label: "ark:text-2xs",
        text: "ark:text-xs"
      },
      md: {
        button: "ark:min-h-(--ark-size-md) ark:px-4 ark:text-sm",
        zone: "ark:gap-2 ark:p-4",
        label: "ark:text-xs",
        text: "ark:text-sm"
      },
      lg: {
        button: "ark:min-h-(--ark-size-lg) ark:px-5 ark:text-base",
        zone: "ark:gap-2 ark:p-5",
        label: "ark:text-sm",
        text: "ark:text-sm"
      },
      xl: {
        button: "ark:min-h-(--ark-size-xl) ark:px-6 ark:text-lg",
        zone: "ark:gap-3 ark:p-6",
        label: "ark:text-base",
        text: "ark:text-base"
      }
    };
    return sizes[size] ?? sizes.md;
  }

  private getPalette(intent: ArkIntent): ArkFileInputPalette {
    const palettes: Record<ArkIntent, ArkFileInputPalette> = {
      primary: {
        button: "ark:border-primary-border ark:text-primary-soft-fg ark:hover:bg-primary-soft",
        ring: "ark:focus-visible:ring-primary-ring",
        dragover: "ark:border-primary ark:bg-primary-soft"
      },
      secondary: {
        button: "ark:border-secondary-border ark:text-secondary-soft-fg ark:hover:bg-secondary-soft",
        ring: "ark:focus-visible:ring-secondary-ring",
        dragover: "ark:border-secondary ark:bg-secondary-soft"
      },
      success: {
        button: "ark:border-success-border ark:text-success-soft-fg ark:hover:bg-success-soft",
        ring: "ark:focus-visible:ring-success-ring",
        dragover: "ark:border-success ark:bg-success-soft"
      },
      warning: {
        button: "ark:border-warning-border ark:text-warning-soft-fg ark:hover:bg-warning-soft",
        ring: "ark:focus-visible:ring-warning-ring",
        dragover: "ark:border-warning ark:bg-warning-soft"
      },
      danger: {
        button: "ark:border-danger-border ark:text-danger-soft-fg ark:hover:bg-danger-soft",
        ring: "ark:focus-visible:ring-danger-ring",
        dragover: "ark:border-danger ark:bg-danger-soft"
      },
      info: {
        button: "ark:border-info-border ark:text-info-soft-fg ark:hover:bg-info-soft",
        ring: "ark:focus-visible:ring-info-ring",
        dragover: "ark:border-info ark:bg-info-soft"
      },
      neutral: {
        button: "ark:border-neutral-border ark:text-neutral-soft-fg ark:hover:bg-neutral-soft",
        ring: "ark:focus-visible:ring-neutral-ring",
        dragover: "ark:border-neutral ark:bg-neutral-soft"
      }
    };
    return palettes[intent];
  }

  private render(): void {
    const id = this.getAttribute("id")
      ? `${this.getAttribute("id")}-file`
      : `ark-file-input-${++arkFileInputIdCounter}`;

    const label = document.createElement("label");
    label.id = `${id}-label`;
    label.htmlFor = id;

    // Input nativo oculto: leva name/accept/multiple/required ao formulário e recebe o seletor e o drop.
    const input = document.createElement("input");
    input.type = "file";
    input.id = id;
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    input.addEventListener("change", this.handleChange);

    const zone = document.createElement("div");
    zone.setAttribute("data-ark-chrome", "zone");
    zone.addEventListener("dragenter", this.handleDragEnter);
    zone.addEventListener("dragover", this.handleDragOver);
    zone.addEventListener("dragleave", this.handleDragLeave);
    zone.addEventListener("drop", this.handleDrop);

    const button = document.createElement("button");
    button.type = "button";
    button.id = `${id}-button`;
    button.addEventListener("click", () => this.inputEl?.click());

    const hint = document.createElement("span");
    const list = document.createElement("ul");
    zone.append(button, hint, list);

    const message = document.createElement("p");
    message.id = `${id}-message`;

    // Ordem visual (label, zona, mensagem) vem das grid-areas em components.css.
    this.append(label, input, zone, message);

    this.inputEl = input;
    this.labelEl = label;
    this.zoneEl = zone;
    this.buttonEl = button;
    this.hintEl = hint;
    this.listEl = list;
    this.messageEl = message;
  }

  private static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Lista dos nomes (com o tamanho) ou a string noFile; por último, o aviso da pasta recusada. Em modo pasta a
  // seleção pode ter centenas de arquivos, então a lista é uma linha só: a pasta, a contagem e o tamanho total.
  private syncList(): void {
    if (!this.listEl) return;
    const files = this.files;
    const locale = this.getLocale();
    const directory = this.directory;
    const text = this.getSizing().text;
    this.listEl.textContent = "";
    // max-w-full: centrada na zona, a lista teria a largura do nome mais longo e o truncate dos itens nunca cortaria.
    this.listEl.className = [
      "ark:m-0 ark:flex ark:max-w-full ark:list-none ark:flex-col ark:items-center ark:gap-0.5 ark:p-0",
      text
    ].join(" ");
    if (files.length === 0) {
      const item = document.createElement("li");
      item.className = "ark:text-fg-muted";
      item.textContent = directory ? locale.noFolder : locale.noFile;
      this.listEl.appendChild(item);
    } else if (directory) {
      const summary = this.summarize(locale);
      const item = document.createElement("li");
      item.setAttribute("data-ark-chrome", "summary");
      item.className = "ark:inline-flex ark:max-w-full ark:items-baseline ark:gap-1.5 ark:text-fg";
      if (summary.folder) {
        const name = document.createElement("span");
        name.className = "ark:truncate";
        name.textContent = summary.folder;
        item.appendChild(name);
      }
      const total = document.createElement("span");
      total.className = summary.folder ? "ark:shrink-0 ark:text-xs ark:text-fg-muted" : "ark:shrink-0";
      total.textContent = `${summary.count} · ${ArkFileInput.formatSize(summary.size)}`;
      item.appendChild(total);
      applyTestHooks(this, "file-input", item, "summary");
      this.listEl.appendChild(item);
      return;
    }
    for (const file of files) {
      const item = document.createElement("li");
      item.setAttribute("data-ark-chrome", "item");
      item.className = "ark:inline-flex ark:max-w-full ark:items-baseline ark:gap-1.5 ark:text-fg";
      const name = document.createElement("span");
      name.className = "ark:truncate";
      name.textContent = file.name;
      const size = document.createElement("span");
      size.className = "ark:shrink-0 ark:text-xs ark:text-fg-muted";
      size.textContent = ArkFileInput.formatSize(file.size);
      item.append(name, size);
      applyTestHooks(this, "file-input", item, "item");
      this.listEl.appendChild(item);
    }
    if (this.folderRejected) {
      const item = document.createElement("li");
      item.className = "ark:text-danger-soft-fg";
      item.textContent = locale.foldersNotAccepted;
      applyTestHooks(this, "file-input", item, "rejected");
      this.listEl.appendChild(item);
    }
  }

  private updateAppearance(): void {
    if (
      !this.inputEl ||
      !this.labelEl ||
      !this.zoneEl ||
      !this.buttonEl ||
      !this.hintEl ||
      !this.listEl ||
      !this.messageEl
    ) {
      return;
    }

    const locale = this.getLocale();
    const intent = normalizeIntent(this.getAttribute("intent"), "primary");
    const palette = this.getPalette(intent);
    const sizing = this.getSizing();
    const disabled = this.disabled;
    const directory = this.directory;
    const error = this.hasAttribute("error") || this.hasAttribute("error-message");
    const dragover = this.hasAttribute("data-ark-dragover");

    this.inputEl.name = this.getAttribute("name") || "";
    // Com `directory` o seletor abre em modo pasta. Onde o navegador não tem esse modo (mobile mais antigo) o atributo
    // não faz nada e sobra o seletor de arquivos: `multiple` deixa escolher os arquivos da pasta de uma vez.
    this.inputEl.multiple = this.multiple || directory;
    this.inputEl.toggleAttribute("webkitdirectory", directory);
    this.inputEl.required = this.hasAttribute("required");
    this.inputEl.disabled = disabled;
    const accept = this.getAttribute("accept");
    if (accept) {
      this.inputEl.setAttribute("accept", accept);
    } else {
      this.inputEl.removeAttribute("accept");
    }

    const roundedMap: Record<ArkRounded, string> = {
      none: "ark:rounded-none",
      xs: "ark:rounded-xs",
      sm: "ark:rounded-sm",
      md: "ark:rounded-md",
      lg: "ark:rounded-lg",
      xl: "ark:rounded-xl",
      full: "ark:rounded-full"
    };
    const rounded = roundedMap[(this.getAttribute("rounded") || "lg").toLowerCase() as ArkRounded] ?? roundedMap.lg;

    this.zoneEl.className = [
      "ark:flex ark:flex-col ark:items-center ark:justify-center ark:border ark:border-dashed ark:text-center ark:transition-colors ark:duration-(--ark-duration-quick) ark:ease-(--ark-ease-out)",
      rounded,
      sizing.zone,
      dragover
        ? palette.dragover
        : error
          ? "ark:border-danger ark:bg-surface"
          : "ark:border-border-strong ark:bg-surface",
      disabled ? "ark:cursor-not-allowed ark:opacity-50" : ""
    ]
      .join(" ")
      .trim();

    this.buttonEl.className = [
      "ark:inline-flex ark:cursor-pointer ark:items-center ark:justify-center ark:gap-2 ark:rounded-md ark:border ark:bg-transparent ark:font-semibold ark:transition ark:outline-none ark:focus-visible:ring-2 ark:disabled:cursor-not-allowed ark:disabled:opacity-50",
      sizing.button,
      palette.button,
      palette.ring
    ].join(" ");
    this.buttonEl.disabled = disabled;
    const choose = directory ? locale.chooseFolder : locale.chooseFile;
    if (this.buttonEl.getAttribute("data-ark-label") !== choose) {
      this.buttonEl.innerHTML = `${UPLOAD_SVG}<span></span>`;
      (this.buttonEl.lastElementChild as HTMLSpanElement).textContent = choose;
      this.buttonEl.setAttribute("data-ark-label", choose);
    }

    this.hintEl.className = ["ark:text-fg-muted", sizing.text].join(" ");
    this.hintEl.textContent = directory ? locale.dropFolderHint : locale.dropHint;
    this.syncList();

    // Label: associação nativa com o input; o botão é nomeado pelo rótulo mais o próprio texto.
    const labelText = this.getAttribute("label") || "";
    this.labelEl.textContent = labelText;
    this.labelEl.hidden = !labelText;
    this.labelEl.className = ["ark:mb-1 ark:block ark:font-medium ark:text-fg-soft", sizing.label].join(" ");
    if (labelText) {
      this.buttonEl.setAttribute("aria-labelledby", `${this.labelEl.id} ${this.buttonEl.id}`);
    } else {
      this.buttonEl.removeAttribute("aria-labelledby");
    }

    // Mensagem (erro tem precedência sobre helper), descrevendo o botão, que é o controle focável.
    const errorMessage = this.getAttribute("error-message") || "";
    const helper = this.getAttribute("helper") || "";
    const message = errorMessage || helper;
    this.messageEl.textContent = message;
    this.messageEl.hidden = !message;
    this.messageEl.className = [
      "ark:mt-1 ark:text-xs",
      errorMessage ? "ark:text-danger-soft-fg" : "ark:text-fg-muted"
    ].join(" ");
    if (message) {
      this.buttonEl.setAttribute("aria-describedby", this.messageEl.id);
    } else {
      this.buttonEl.removeAttribute("aria-describedby");
    }
    this.buttonEl.setAttribute("aria-invalid", error ? "true" : "false");

    applyTestHooks(this, "file-input", this.inputEl);
    applyTestHooks(this, "file-input", this.labelEl, "label");
    applyTestHooks(this, "file-input", this.zoneEl, "zone");
    applyTestHooks(this, "file-input", this.buttonEl, "button");
    applyTestHooks(this, "file-input", this.hintEl, "hint");
    applyTestHooks(this, "file-input", this.listEl, "list");
    applyTestHooks(this, "file-input", this.messageEl, errorMessage ? "error" : "helper");
  }
}

export default ArkFileInput;
