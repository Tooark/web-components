import { type ArkLocale, announce, resolveLocale } from "@tooark/core";
import { ArkButton } from "./ark-button";
import { applyTestHooks } from "./test-hooks";

/** Ícone de copiar (duas folhas) e o check do feedback, chrome próprio do componente. */
const COPY_SVG = `
  <svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="7" y="7" width="10" height="10" rx="2"></rect>
    <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
  </svg>`;
const CHECK_SVG = `
  <svg class="ark:h-[1em] ark:w-[1em] ark-animate-fade-in" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9"></path>
  </svg>`;

/**
 * Botão de copiar: herda do ark-button (o host é o próprio botão, com
 * variantes, tamanhos, `icon-only`, formulário e teclado) e acrescenta o
 * chrome de copiar: um ícone no início do host e, quando o usuário não dá
 * filhos, um rótulo próprio com a string `copy`. Copia `value` ou o texto do
 * elemento de `for`; durante `feedback-ms` o ícone vira check, rótulo,
 * `title` e (com icon-only) `aria-label` viram `copied`, que também é
 * anunciado ao leitor de tela. Os filhos do usuário ficam onde estão e nada
 * é aninhado.
 */
export class ArkCopyButton extends ArkButton {
  static readonly tagName: string = "ark-copy-button";

  private iconEl: HTMLSpanElement | null = null;
  private textEl: HTMLSpanElement | null = null;
  private iconState: "copy" | "copied" | null = null;
  private copied = false;
  private feedbackTimer: number | null = null;
  private childObserver: MutationObserver | null = null;
  /** aria-label escrito pelo componente (icon-only), para não apagar um do usuário. */
  private ownAriaLabel: string | null = null;

  static get observedAttributes(): string[] {
    return [...ArkButton.observedAttributes, "value", "for", "feedback-ms", "lang", "locale-json"];
  }

  constructor() {
    super();
    this.addEventListener("click", this.handleCopyClick);
  }

  connectedCallback(): void {
    if (!this.childObserver) {
      // Rótulo do usuário que chega ou sai depois decide se o rótulo próprio aparece.
      this.childObserver = new MutationObserver(() => this.updateAppearance());
      this.childObserver.observe(this, { childList: true });
    }
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    this.childObserver?.disconnect();
    this.childObserver = null;
    if (this.feedbackTimer !== null) window.clearTimeout(this.feedbackTimer);
    this.feedbackTimer = null;
  }

  /** Texto a copiar: `value`, ou o `value`/`textContent` do elemento apontado por `for`. */
  get value(): string {
    const value = this.getAttribute("value");
    if (value !== null) return value;
    const id = this.getAttribute("for");
    if (!id) return "";
    const root = this.getRootNode() as Document | ShadowRoot;
    const target = typeof root.getElementById === "function" ? root.getElementById(id) : null;
    if (!target) return "";
    if ("value" in target && typeof (target as HTMLInputElement).value === "string") {
      return (target as HTMLInputElement).value;
    }
    return target.textContent ?? "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  /** Duração do feedback "copiado" em ms. Padrão: 1500. */
  get feedbackMs(): number {
    const raw = Number(this.getAttribute("feedback-ms"));
    return Number.isFinite(raw) && raw >= 0 && this.hasAttribute("feedback-ms") ? raw : 1500;
  }

  set feedbackMs(value: number) {
    this.setAttribute("feedback-ms", String(value));
  }

  /** Copia o texto para a área de transferência; resolve com o sucesso. Emite `ark-copy` e anuncia `copied`. */
  async copy(): Promise<boolean> {
    if (this.isDisabled()) return false;
    const text = this.value;
    const ok = await ArkCopyButton.writeClipboard(text);
    if (!ok) return false;

    this.copied = true;
    if (this.feedbackTimer !== null) window.clearTimeout(this.feedbackTimer);
    this.feedbackTimer = window.setTimeout(() => {
      this.feedbackTimer = null;
      this.copied = false;
      this.updateAppearance();
    }, this.feedbackMs);
    this.updateAppearance();

    announce(this.getLocale().copied);
    this.dispatchEvent(new CustomEvent("ark-copy", { detail: { value: text }, bubbles: true, composed: true }));
    return true;
  }

  // Clipboard API primeiro; em contexto inseguro (http) cai no execCommand com um textarea temporário.
  private static async writeClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // segue para o fallback
      }
    }
    if (typeof document === "undefined") return false;
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    area.style.pointerEvents = "none";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }

  private readonly handleCopyClick = (): void => {
    // Clique desabilitado/carregando já foi barrado na captura pelo ark-button.
    void this.copy();
  };

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  // Filhos que não são chrome (do componente ou do ark-button): o usuário deu o próprio rótulo.
  private hasUserContent(): boolean {
    return Array.from(this.childNodes).some((node) => {
      if (node.nodeType === Node.TEXT_NODE) return (node.textContent || "").trim() !== "";
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node as Element;
      const ark = el.getAttribute("data-ark");
      return !el.hasAttribute("data-ark-chrome") && !ark?.startsWith("button-");
    });
  }

  private syncCopyChrome(): void {
    const locale = this.getLocale();
    const label = this.copied ? locale.copied : locale.copy;
    const iconOnly = this.hasAttribute("icon-only");
    const userContent = this.hasUserContent();

    // Ícone no início do host; o spinner do loading o substitui.
    if (!this.iconEl) {
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.setAttribute("data-ark-chrome", "icon");
      icon.className = "ark:inline-flex ark:items-center";
      this.prepend(icon);
      this.iconEl = icon;
    } else if (this.iconEl !== this.firstElementChild && !this.hasAttribute("loading")) {
      this.prepend(this.iconEl);
    }
    const state = this.copied ? "copied" : "copy";
    if (state !== this.iconState) {
      this.iconEl.innerHTML = state === "copied" ? CHECK_SVG : COPY_SVG;
      this.iconState = state;
    }
    this.iconEl.hidden = this.hasAttribute("loading");

    // Rótulo próprio só sem filhos do usuário e fora do icon-only.
    if (!userContent && !iconOnly) {
      if (!this.textEl) {
        const text = document.createElement("span");
        text.setAttribute("data-ark-chrome", "text");
        this.iconEl.after(text);
        this.textEl = text;
      }
      this.textEl.textContent = label;
    } else {
      this.textEl?.remove();
      this.textEl = null;
    }

    this.title = label;
    this.toggleAttribute("data-ark-copied", this.copied);

    // Sem texto visível o nome vem do aria-label; um aria-label do usuário fica.
    if (iconOnly && !userContent) {
      if (!this.getAttribute("aria-label") || this.getAttribute("aria-label") === this.ownAriaLabel) {
        this.setAttribute("aria-label", label);
        this.ownAriaLabel = label;
      }
    } else if (this.ownAriaLabel && this.getAttribute("aria-label") === this.ownAriaLabel) {
      this.removeAttribute("aria-label");
      this.ownAriaLabel = null;
    }

    applyTestHooks(this, "copy-button", this.iconEl, "icon");
    if (this.textEl) applyTestHooks(this, "copy-button", this.textEl, "text");
  }

  protected updateAppearance(): void {
    // Antes do super: o hook principal do host é `copy-button` (o do ark-button só entra se não houver).
    applyTestHooks(this, "copy-button", this);
    super.updateAppearance();
    this.syncCopyChrome();
  }
}

export default ArkCopyButton;
