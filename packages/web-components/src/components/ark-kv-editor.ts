import {
  type ArkKvBulkFormat,
  type ArkKvRow,
  type ArkLocale,
  type ArkSize,
  announce,
  coerceBooleanAttr,
  resolveLocale
} from "@tooark/core";
import type { ArkButton } from "./ark-button";
import type { ArkCheckbox } from "./ark-checkbox";
import type { ArkInput } from "./ark-input";
import type { ArkSelect } from "./ark-select";
import type { ArkTextarea } from "./ark-textarea";
import { applyTestHooks } from "./test-hooks";

/** Ícone do botão de remover linha (chrome próprio). */
const TRASH_SVG = `
  <svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 6h12M8 6V4h4v2M6 6l.8 10h6.4L14 6M8.5 9v5M11.5 9v5"></path>
  </svg>`;

/** Cadeado aberto (valor visível) e fechado (segredo), chrome do botão de segredo. */
const LOCK_OPEN_SVG = `
  <svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="4" y="9" width="12" height="8" rx="1.5"></rect>
    <path d="M7 9V6a3 3 0 0 1 5.8-1"></path>
  </svg>`;
const LOCK_CLOSED_SVG = `
  <svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="4" y="9" width="12" height="8" rx="1.5"></rect>
    <path d="M7 9V6a3 3 0 0 1 6 0v3"></path>
  </svg>`;

/** Tipo de valor de uma linha → `type` do <input> do campo de valor; o resto é texto. */
const VALUE_INPUT_TYPES: Record<string, string> = {
  number: "number",
  date: "date",
  time: "time",
  datetime: "datetime-local",
  "datetime-local": "datetime-local",
  email: "email",
  url: "url",
  tel: "tel"
};

let rowSeq = 0;

/** Id novo para uma linha criada pelo componente. */
function nextRowId(): string {
  rowSeq += 1;
  return `kv-${Date.now().toString(36)}-${rowSeq}`;
}

/** Cópia defensiva de uma linha, com os campos garantidos e os opcionais só quando são texto. */
function cloneRow(row: Partial<ArkKvRow>): ArkKvRow {
  const next: ArkKvRow = {
    id: typeof row.id === "string" && row.id ? row.id : nextRowId(),
    key: typeof row.key === "string" ? row.key : "",
    value: typeof row.value === "string" ? row.value : "",
    enabled: row.enabled !== false
  };
  if (typeof row.description === "string") next.description = row.description;
  if (typeof row.type === "string" && row.type) next.type = row.type;
  if (row.secret === true) next.secret = true;
  return next;
}

/** Nós de uma linha renderizada. */
type RowParts = {
  enabled: ArkCheckbox;
  key: ArkInput;
  value: ArkInput;
  secret: ArkButton | null;
  type: ArkSelect | null;
  description: ArkInput | null;
  remove: ArkButton;
};

/**
 * Editor de pares chave/valor: linhas `{ id, key, value, enabled }` com
 * ativar, editar, remover e adicionar, e um modo de edição em massa. Colunas
 * opcionais: `types` acrescenta um seletor do tipo do valor por linha (que
 * define o `type` do campo de valor: number, date, time...), `secret` um
 * cadeado por linha (fechado, o valor vira campo de senha com o olho para
 * revelar) e `description` um campo de descrição. Compõe ark-checkbox, ark-input, ark-select,
 * ark-textarea e ark-button, porque renderiza tudo a partir de `rows` (não há
 * filhos do usuário). O modo em massa é uma textarea em `bulk-format`
 * "lines" (`chave:valor` por linha, `#` desativa; tipo e descrição
 * preservados por posição) ou "json" (array com todos os campos). `change`
 * publica as linhas a cada edição, inclusive ao sair do modo em massa;
 * adicionar e remover anunciam a contagem ao leitor de tela. A célula de
 * valor é um ark-input comum: autocomplete de variáveis fica no app.
 */
export class ArkKvEditor extends HTMLElement {
  static readonly tagName = "ark-kv-editor";

  private model: ArkKvRow[] = [];
  private toolbarEl: HTMLDivElement | null = null;
  private countEl: HTMLSpanElement | null = null;
  private bulkToggleEl: ArkButton | null = null;
  private listEl: HTMLDivElement | null = null;
  private emptyEl: HTMLParagraphElement | null = null;
  private bulkEl: ArkTextarea | null = null;
  private footerEl: HTMLDivElement | null = null;
  private addEl: ArkButton | null = null;
  private rowEls = new Map<string, HTMLDivElement>();
  private ownClasses: string[] = [];
  private syncingClass = false;
  /** Foco pedido para a próxima renderização (chave da linha nova, ou a linha vizinha após remover). */
  private focusRowId: string | null = null;
  /** Linhas de quando o modo em massa abriu: ids (e tipo/descrição no formato lines) reaproveitados por posição. */
  private bulkBase: ArkKvRow[] | null = null;
  /** Último texto em massa que o próprio componente escreveu, para não sobrescrever o que o usuário digita. */
  private bulkWritten = "";

  static get observedAttributes(): string[] {
    return [
      "rows",
      "bulk",
      "bulk-format",
      "types",
      "description",
      "secret",
      "key-placeholder",
      "value-placeholder",
      "description-placeholder",
      "readonly",
      "size",
      "lang",
      "locale-json",
      "theme",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    // Os `change` dos controles compostos (inputs, select, textarea, checkbox) não saem do host: quem escuta
    // `change` nele recebe só o CustomEvent com `detail.rows`, emitido pelo próprio host. Imediata porque
    // outros listeners no host correriam mesmo com stopPropagation.
    this.addEventListener("change", (event) => {
      if (event.target !== this) event.stopImmediatePropagation();
    });
  }

  connectedCallback(): void {
    if (!this.listEl) this.render();
    this.updateAppearance();
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (name === "rows") {
      // Atributo JSON: só o valor inicial; a propriedade é a fonte a partir daí.
      try {
        const parsed = JSON.parse(newValue || "[]") as unknown;
        this.model = Array.isArray(parsed) ? parsed.map((row) => cloneRow(row as Partial<ArkKvRow>)) : [];
      } catch {
        this.model = [];
      }
      this.resetRows();
    }
    // Colunas trocadas: as linhas são recriadas com a grid nova.
    if (name === "types" || name === "description" || name === "secret") this.resetRows();
    if (!this.listEl || !this.isConnected) return;
    this.updateAppearance();
  }

  /** As linhas atuais (cópia); atribuir substitui tudo e renderiza de novo. */
  get rows(): ArkKvRow[] {
    return this.model.map((row) => ({ ...row }));
  }

  set rows(value: ArkKvRow[] | null | undefined) {
    this.model = Array.isArray(value) ? value.map(cloneRow) : [];
    this.resetRows();
    if (this.isConnected) this.updateAppearance();
  }

  /** Modo de edição em massa (textarea). */
  get bulk(): boolean {
    return this.hasAttribute("bulk");
  }

  set bulk(value: boolean | string | null | undefined) {
    this.toggleAttribute("bulk", coerceBooleanAttr(value));
  }

  /** Formato do modo em massa. Padrão: "lines". */
  get bulkFormat(): ArkKvBulkFormat {
    return (this.getAttribute("bulk-format") || "").toLowerCase() === "json" ? "json" : "lines";
  }

  set bulkFormat(value: ArkKvBulkFormat) {
    this.setAttribute("bulk-format", value);
  }

  /** Tipos oferecidos na coluna de tipo (atributo `types`, separado por vírgula); vazio esconde a coluna. */
  get types(): string[] {
    return (this.getAttribute("types") || "")
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean);
  }

  set types(value: string[] | string | null | undefined) {
    const list = Array.isArray(value) ? value.join(",") : value || "";
    if (list) {
      this.setAttribute("types", list);
    } else {
      this.removeAttribute("types");
    }
  }

  /** Coluna de descrição visível (atributo `description`). */
  get description(): boolean {
    return this.hasAttribute("description");
  }

  set description(value: boolean | string | null | undefined) {
    this.toggleAttribute("description", coerceBooleanAttr(value));
  }

  /** Cadeado de segredo por linha visível (atributo `secret`). */
  get secret(): boolean {
    return this.hasAttribute("secret");
  }

  set secret(value: boolean | string | null | undefined) {
    this.toggleAttribute("secret", coerceBooleanAttr(value));
  }

  get readonly(): boolean {
    return this.hasAttribute("readonly");
  }

  set readonly(value: boolean | string | null | undefined) {
    this.toggleAttribute("readonly", coerceBooleanAttr(value));
  }

  /** Acrescenta uma linha vazia (ou com os campos dados), foca a chave, emite `ark-add` e `change`, anuncia. */
  add(row: Partial<ArkKvRow> = {}): ArkKvRow {
    const next = cloneRow(row);
    const types = this.types;
    if (types.length > 0 && !next.type) next.type = types[0];
    this.model.push(next);
    this.focusRowId = next.id;
    this.updateAppearance();
    this.dispatchEvent(new CustomEvent("ark-add", { detail: { id: next.id }, bubbles: true, composed: true }));
    this.emitChange();
    this.announceCount();
    return next;
  }

  /** Remove a linha pelo id, emite `ark-delete` e `change`, anuncia; o foco vai para a linha seguinte. */
  delete(id: string): void {
    const index = this.model.findIndex((row) => row.id === id);
    if (index < 0) return;
    this.model.splice(index, 1);
    // A linha seguinte (ou a anterior) recebe o foco; sem nenhuma, o botão de adicionar.
    const nextFocus = this.model[index]?.id ?? this.model[index - 1]?.id ?? null;
    this.focusRowId = nextFocus;
    this.rowEls.get(id)?.remove();
    this.rowEls.delete(id);
    this.updateAppearance();
    if (!nextFocus) this.addEl?.focus();
    this.dispatchEvent(new CustomEvent("ark-delete", { detail: { id }, bubbles: true, composed: true }));
    this.emitChange();
    this.announceCount();
  }

  /** Texto do modo em massa no formato atual: `chave:valor` por linha (`#` nas desativadas) ou JSON. */
  get bulkText(): string {
    if (this.bulkFormat === "json") {
      return JSON.stringify(
        this.model.map(({ id: _id, ...fields }) => fields),
        null,
        2
      );
    }
    return this.model.map((row) => `${row.enabled ? "" : "#"}${row.key}:${row.value}`).join("\n");
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  private getSize(): ArkSize {
    const size = (this.getAttribute("size") || "").toLowerCase();
    return size === "xs" || size === "sm" || size === "lg" || size === "xl" ? size : "md";
  }

  // Descarta os nós das linhas: a próxima renderização recria tudo (colunas ou modelo trocados).
  private resetRows(): void {
    this.rowEls.clear();
    if (this.listEl) this.listEl.textContent = "";
  }

  private emitChange(): void {
    this.dispatchEvent(new CustomEvent("change", { detail: { rows: this.rows }, bubbles: true, composed: true }));
  }

  private announceCount(): void {
    const locale = this.getLocale();
    announce(this.model.length === 0 ? locale.noEntries : `${this.model.length} ${locale.entries}`);
  }

  // Texto em massa → linhas. Lines: linhas vazias fora, `#` desativa, sem `:` vira chave sem valor; tipo e
  // descrição vêm da linha de mesma posição de quando o modo abriu. JSON: array com os campos; inválido
  // devolve null. Ids sempre reaproveitados por posição.
  private parseBulk(text: string): ArkKvRow[] | null {
    const base = this.bulkBase ?? this.model;
    if (this.bulkFormat === "json") {
      try {
        const parsed = JSON.parse(text) as unknown;
        if (!Array.isArray(parsed)) return null;
        return parsed.map((item, index) => {
          const row = typeof item === "object" && item !== null ? (item as Partial<ArkKvRow>) : {};
          return cloneRow({ ...row, id: base[index]?.id });
        });
      } catch {
        return null;
      }
    }
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .map((line, index) => {
        const enabled = !line.startsWith("#");
        const body = enabled ? line : line.slice(1).trim();
        const colon = body.indexOf(":");
        const key = (colon < 0 ? body : body.slice(0, colon)).trim();
        const value = colon < 0 ? "" : body.slice(colon + 1).trim();
        const previous = base[index];
        return cloneRow({
          id: previous?.id,
          key,
          value,
          enabled,
          description: previous?.description,
          type: previous?.type,
          secret: previous?.secret
        });
      });
  }

  // --- Interação ---

  private readonly handleBulkInput = (): void => {
    if (!this.bulkEl) return;
    const parsed = this.parseBulk(this.bulkEl.value);
    // JSON inválido no meio da digitação: o modelo fica como está e o campo sinaliza o erro.
    this.bulkEl.toggleAttribute("error", parsed === null);
    if (parsed === null) return;
    this.model = parsed;
    this.updateCount();
    this.emitChange();
  };

  private toggleBulk(): void {
    const leaving = this.bulk;
    this.bulk = !leaving;
    if (leaving) {
      // Saiu do modo em massa: a tabela é reconstruída a partir do texto e o app recebe as linhas de novo.
      this.resetRows();
      this.updateAppearance();
      this.emitChange();
      this.addEl?.focus();
    } else {
      this.updateAppearance();
      this.bulkEl?.focus();
    }
  }

  // --- Renderização ---

  private render(): void {
    const toolbar = document.createElement("div");
    toolbar.setAttribute("data-ark-chrome", "toolbar");
    const count = document.createElement("span");
    const bulkToggle = document.createElement("ark-button") as ArkButton;
    bulkToggle.setAttribute("variant", "ghost");
    bulkToggle.setAttribute("intent", "neutral");
    bulkToggle.addEventListener("click", () => this.toggleBulk());
    toolbar.append(count, bulkToggle);

    const list = document.createElement("div");
    list.setAttribute("role", "group");
    const empty = document.createElement("p");
    empty.hidden = true;

    const bulk = document.createElement("ark-textarea") as ArkTextarea;
    bulk.setAttribute("monospace", "");
    bulk.setAttribute("autosize", "");
    bulk.setAttribute("rows", "4");
    bulk.setAttribute("resize", "vertical");
    bulk.hidden = true;
    bulk.addEventListener("input", this.handleBulkInput);

    const footer = document.createElement("div");
    footer.setAttribute("data-ark-chrome", "footer");
    const add = document.createElement("ark-button") as ArkButton;
    add.setAttribute("variant", "outline");
    add.addEventListener("click", () => this.add());
    footer.appendChild(add);

    this.append(toolbar, list, empty, bulk, footer);

    this.toolbarEl = toolbar;
    this.countEl = count;
    this.bulkToggleEl = bulkToggle;
    this.listEl = list;
    this.emptyEl = empty;
    this.bulkEl = bulk;
    this.footerEl = footer;
    this.addEl = add;
  }

  // Um campo de texto de uma linha: atualiza o campo do modelo a cada input.
  private createField(rowId: string, field: "key" | "value" | "description", size: ArkSize): ArkInput {
    const input = document.createElement("ark-input") as ArkInput;
    input.setAttribute("size", size);
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("data-ark-field", field);
    input.addEventListener("input", (event) => {
      event.stopPropagation();
      const current = this.model.find((item) => item.id === rowId);
      if (!current) return;
      current[field] = input.value;
      this.emitChange();
    });
    return input;
  }

  private createRowEl(row: ArkKvRow, size: ArkSize, locale: ArkLocale): HTMLDivElement {
    const el = document.createElement("div");
    el.setAttribute("data-ark-chrome", "row");
    el.dataset.rowId = row.id;

    const enabled = document.createElement("ark-checkbox") as ArkCheckbox;
    enabled.setAttribute("size", size);
    enabled.addEventListener("change", () => {
      const current = this.model.find((item) => item.id === row.id);
      if (!current) return;
      current.enabled = enabled.checked;
      el.classList.toggle("ark:opacity-60", !current.enabled);
      this.emitChange();
    });

    const key = this.createField(row.id, "key", size);
    const value = this.createField(row.id, "value", size);
    // Enter no valor da última linha acrescenta a próxima, como numa tabela.
    value.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || this.readonly) return;
      if (this.model[this.model.length - 1]?.id !== row.id) return;
      event.preventDefault();
      this.add();
    });

    const remove = document.createElement("ark-button") as ArkButton;
    remove.setAttribute("variant", "ghost");
    remove.setAttribute("intent", "neutral");
    remove.setAttribute("icon-only", "");
    remove.setAttribute("size", size);
    remove.setAttribute("aria-label", locale.deleteRow);
    remove.title = locale.deleteRow;
    remove.innerHTML = TRASH_SVG;
    remove.addEventListener("click", () => this.delete(row.id));

    // Colunas ausentes ficam fora do DOM: a grid só conhece as visíveis.
    el.append(enabled, key, value);
    if (this.secret) {
      const secret = document.createElement("ark-button") as ArkButton;
      secret.setAttribute("variant", "ghost");
      secret.setAttribute("intent", "neutral");
      secret.setAttribute("icon-only", "");
      secret.setAttribute("size", size);
      secret.addEventListener("click", () => {
        const current = this.model.find((item) => item.id === row.id);
        if (!current) return;
        current.secret = !current.secret;
        if (!current.secret) delete current.secret;
        this.updateAppearance();
        this.emitChange();
      });
      el.appendChild(secret);
    }
    if (this.types.length > 0) {
      const type = document.createElement("ark-select") as ArkSelect;
      type.setAttribute("size", size);
      type.addEventListener("change", () => {
        const current = this.model.find((item) => item.id === row.id);
        if (!current) return;
        current.type = type.value;
        // O campo de valor segue o tipo (number, date...).
        this.updateAppearance();
        this.emitChange();
      });
      el.appendChild(type);
    }
    if (this.description) el.appendChild(this.createField(row.id, "description", size));
    el.appendChild(remove);
    return el;
  }

  private rowParts(el: HTMLDivElement): RowParts {
    return {
      enabled: el.querySelector("ark-checkbox") as ArkCheckbox,
      key: el.querySelector('ark-input[data-ark-field="key"]') as ArkInput,
      value: el.querySelector('ark-input[data-ark-field="value"]') as ArkInput,
      secret: this.secret ? (el.querySelector("ark-button") as ArkButton) : null,
      type: el.querySelector("ark-select"),
      description: el.querySelector('ark-input[data-ark-field="description"]'),
      remove: el.querySelector("ark-button:last-of-type") as ArkButton
    };
  }

  // Classes de grid por combinação de colunas (segredo, tipo, descrição): literais completas, para o Tailwind
  // gerar todas. Ordem das colunas: ativo, chave, valor, cadeado, tipo, descrição, remover.
  private gridClass(secret: boolean, types: boolean, description: boolean): string {
    const grids: Record<string, string> = {
      "": "ark:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto]",
      s: "ark:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto]",
      t: "ark:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto]",
      d: "ark:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]",
      st: "ark:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]",
      sd: "ark:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)_auto]",
      td: "ark:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)_auto]",
      std: "ark:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto_minmax(0,1fr)_auto]"
    };
    return grids[`${secret ? "s" : ""}${types ? "t" : ""}${description ? "d" : ""}`];
  }

  // Sincroniza cada linha do modelo com o seu nó, criando, atualizando e ordenando sem recriar o que existe.
  private syncRows(size: ArkSize, locale: ArkLocale): void {
    if (!this.listEl) return;
    const readonly = this.readonly;
    const types = this.types;
    const withDescription = this.description;
    const keyPlaceholder = this.getAttribute("key-placeholder") || "";
    const valuePlaceholder = this.getAttribute("value-placeholder") || "";
    const descriptionPlaceholder = this.getAttribute("description-placeholder") || "";
    const withSecret = this.secret;
    const grid = this.gridClass(withSecret, types.length > 0, withDescription);
    const seen = new Set<string>();
    let previous: HTMLDivElement | null = null;

    for (const row of this.model) {
      seen.add(row.id);
      let el = this.rowEls.get(row.id);
      if (!el) {
        el = this.createRowEl(row, size, locale);
        this.rowEls.set(row.id, el);
      }
      // Ordem do modelo: insere depois da anterior.
      const anchor: ChildNode | null = previous ? previous.nextSibling : this.listEl.firstChild;
      if (el !== anchor) this.listEl.insertBefore(el, anchor);
      previous = el;

      const parts = this.rowParts(el);
      el.className = [
        "ark:grid ark:items-center ark:gap-2 ark:px-3 ark:py-1.5",
        grid,
        row.enabled ? "" : "ark:opacity-60"
      ]
        .join(" ")
        .trim();
      parts.enabled.setAttribute("aria-label", `${row.key || keyPlaceholder || row.id}`);
      parts.enabled.checked = row.enabled;
      parts.enabled.disabled = readonly;
      parts.enabled.setAttribute("size", size);

      const fields: Array<[ArkInput | null, string, string, string]> = [
        [parts.key, row.key, keyPlaceholder, "key"],
        [parts.value, row.value, valuePlaceholder, "value"],
        [parts.description, row.description ?? "", descriptionPlaceholder, "description"]
      ];
      for (const [input, text, placeholder, name] of fields) {
        if (!input) continue;
        if (input.value !== text) input.value = text;
        input.setAttribute("placeholder", placeholder);
        input.setAttribute("aria-label", placeholder || name);
        input.setAttribute("size", size);
        input.toggleAttribute("readonly", readonly);
        applyTestHooks(this, "kv-editor", input, name);
      }

      // Campo de valor: senha com o olho quando é segredo; senão o tipo da linha (number, date...) ou texto.
      const isSecret = withSecret && row.secret === true;
      parts.value.setAttribute("type", isSecret ? "password" : (VALUE_INPUT_TYPES[row.type ?? ""] ?? "text"));
      parts.value.toggleAttribute("reveal", isSecret);

      if (parts.secret) {
        parts.secret.setAttribute("aria-label", locale.secret);
        parts.secret.title = locale.secret;
        parts.secret.setAttribute("aria-pressed", isSecret ? "true" : "false");
        // Fechado ganha a cor primary, para o estado ser visível sem depender só do glifo.
        parts.secret.setAttribute("intent", isSecret ? "primary" : "neutral");
        parts.secret.setAttribute("size", size);
        parts.secret.toggleAttribute("disabled", readonly);
        if (parts.secret.getAttribute("data-ark-locked") !== String(isSecret)) {
          parts.secret.innerHTML = isSecret ? LOCK_CLOSED_SVG : LOCK_OPEN_SVG;
          parts.secret.setAttribute("data-ark-locked", String(isSecret));
        }
        applyTestHooks(this, "kv-editor", parts.secret, "secret");
      }

      if (parts.type) {
        parts.type.options = types.map((type) => ({ value: type, label: type }));
        const current = row.type && types.includes(row.type) ? row.type : types[0];
        if (parts.type.value !== current) parts.type.value = current;
        parts.type.setAttribute("aria-label", locale.type);
        parts.type.setAttribute("size", size);
        parts.type.toggleAttribute("disabled", readonly);
        applyTestHooks(this, "kv-editor", parts.type, "type");
      }

      parts.remove.setAttribute("size", size);
      parts.remove.toggleAttribute("disabled", readonly);
      parts.remove.setAttribute("aria-label", locale.deleteRow);
      parts.remove.title = locale.deleteRow;

      applyTestHooks(this, "kv-editor", el, "row");
      applyTestHooks(this, "kv-editor", parts.enabled, "enabled");
      applyTestHooks(this, "kv-editor", parts.remove, "delete");
    }

    for (const [id, el] of this.rowEls) {
      if (!seen.has(id)) {
        el.remove();
        this.rowEls.delete(id);
      }
    }

    if (this.focusRowId) {
      const target = this.rowEls.get(this.focusRowId);
      this.focusRowId = null;
      if (target) this.rowParts(target).key?.focus();
    }
  }

  private updateCount(): void {
    if (!this.countEl) return;
    const locale = this.getLocale();
    this.countEl.textContent = this.model.length === 0 ? locale.noEntries : `${this.model.length} ${locale.entries}`;
  }

  private applyOwnClasses(next: string[]): void {
    this.syncingClass = true;
    for (const cls of this.ownClasses) {
      if (!next.includes(cls)) this.classList.remove(cls);
    }
    for (const cls of next) {
      if (!this.classList.contains(cls)) this.classList.add(cls);
    }
    this.ownClasses = next;
    this.syncingClass = false;
  }

  private updateAppearance(): void {
    if (
      !this.toolbarEl ||
      !this.countEl ||
      !this.bulkToggleEl ||
      !this.listEl ||
      !this.emptyEl ||
      !this.bulkEl ||
      !this.footerEl ||
      !this.addEl
    ) {
      return;
    }

    const locale = this.getLocale();
    const size = this.getSize();
    const bulk = this.bulk;
    const readonly = this.readonly;
    const textSize = size === "xs" || size === "sm" ? "ark:text-xs" : "ark:text-sm";
    const smallButton = size === "xl" ? "md" : size === "lg" ? "sm" : "xs";

    this.applyOwnClasses(
      "ark:block ark:overflow-hidden ark:rounded-lg ark:border ark:border-border ark:bg-surface ark:text-fg".split(" ")
    );

    this.toolbarEl.className =
      "ark:flex ark:items-center ark:justify-between ark:gap-2 ark:border-b ark:border-border ark:px-3 ark:py-1.5";
    this.countEl.className = [textSize, "ark:text-fg-muted"].join(" ");
    this.updateCount();
    this.bulkToggleEl.textContent = bulk ? locale.tableEdit : locale.bulkEdit;
    this.bulkToggleEl.setAttribute("aria-pressed", bulk ? "true" : "false");
    this.bulkToggleEl.setAttribute("size", smallButton);
    this.bulkToggleEl.toggleAttribute("disabled", readonly);

    // Ao abrir o modo em massa, guarda as linhas de referência; ao fechar, solta.
    if (bulk && !this.bulkBase) {
      this.bulkBase = this.rows;
      this.bulkWritten = "";
    }
    if (!bulk) this.bulkBase = null;

    this.listEl.hidden = bulk;
    this.listEl.setAttribute("aria-label", locale.entries);
    this.listEl.className = "ark:divide-y ark:divide-border";
    if (!bulk) this.syncRows(size, locale);

    this.emptyEl.hidden = bulk || this.model.length > 0;
    this.emptyEl.textContent = locale.noEntries;
    this.emptyEl.className = ["ark:m-0 ark:px-3 ark:py-4 ark:text-center ark:text-fg-muted", textSize].join(" ");

    this.bulkEl.hidden = !bulk;
    this.bulkEl.className = "ark:block ark:p-3";
    this.bulkEl.setAttribute("size", size);
    this.bulkEl.setAttribute("aria-label", locale.bulkEdit);
    this.bulkEl.setAttribute(
      "placeholder",
      this.bulkFormat === "json"
        ? '[{ "key": "", "value": "", "enabled": true }]'
        : `${this.getAttribute("key-placeholder") || "key"}:${this.getAttribute("value-placeholder") || "value"}`
    );
    this.bulkEl.toggleAttribute("readonly", readonly);
    for (const attr of ["theme", "lang", "locale-json"]) {
      const value = this.getAttribute(attr);
      if (value) {
        this.bulkEl.setAttribute(attr, value);
      } else {
        this.bulkEl.removeAttribute(attr);
      }
    }
    // Só escreve o texto quando o próprio componente mudou o modelo (abrir o modo, `rows` novo, formato
    // trocado); o que o usuário digita fica como está.
    if (bulk) {
      const text = this.bulkText;
      if (text !== this.bulkWritten && this.bulkEl.value !== text) {
        this.bulkEl.value = text;
        this.bulkEl.removeAttribute("error");
      }
      this.bulkWritten = text;
    }

    this.footerEl.hidden = bulk;
    this.footerEl.className = "ark:border-t ark:border-border ark:px-3 ark:py-1.5";
    this.addEl.textContent = locale.add;
    this.addEl.setAttribute("size", smallButton);
    this.addEl.toggleAttribute("disabled", readonly);

    applyTestHooks(this, "kv-editor", this);
    applyTestHooks(this, "kv-editor", this.listEl, "list");
    applyTestHooks(this, "kv-editor", this.emptyEl, "empty");
    applyTestHooks(this, "kv-editor", this.bulkEl, "bulk");
    applyTestHooks(this, "kv-editor", this.bulkToggleEl, "bulk-toggle");
    applyTestHooks(this, "kv-editor", this.addEl, "add");
  }
}

export default ArkKvEditor;
