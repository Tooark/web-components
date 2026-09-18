import {
  type ArkAlertLive,
  type ArkAlertVariant,
  type ArkIntent,
  type ArkLocale,
  arkExit,
  resolveLocale
} from "@tooark/core";
import { normalizeIntent } from "./intent-colors";
import { applyTestHooks } from "./test-hooks";

/** Ícone do botão de dispensar (chrome próprio do componente). */
const CLOSE_SVG = `
  <svg class="ark:h-full ark:w-full" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
    <path d="M6 6l8 8M14 6l-8 8"></path>
  </svg>`;

type ArkAlertPalette = {
  box: string;
  ring: string;
};

/**
 * Alerta ou banner: o PRÓPRIO host é a caixa (cor suave do intent) e os
 * filhos do usuário são a mensagem, texto solto ou elementos, que fluem
 * normalmente. `slot="icon"` fica à esquerda e `slot="action"` à direita,
 * posicionados por components.css sem sair do lugar (o ícone e o botão de
 * dispensar por posição absoluta na área reservada pelo padding; a ação por
 * float, então o texto contorna). `heading` cria um título próprio no início
 * do host; `dismissible` põe o botão de dispensar no fim (chrome). `variant`
 * box (caixa arredondada) ou banner (largura toda, só borda inferior). `live`
 * define a live region: polite (role="status") ou assertive (role="alert"),
 * por padrão pelo intent (warning e danger são assertive), ou off. Dispensar
 * anima a saída (slide-down, quick), emite `ark-dismiss` e esconde o host com
 * `hidden`; remover é do app, que também pode tirar o `hidden` para reexibir.
 */
export class ArkAlert extends HTMLElement {
  static readonly tagName = "ark-alert";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private headingEl: HTMLParagraphElement | null = null;
  private dismissEl: HTMLButtonElement | null = null;
  private observer: MutationObserver | null = null;
  private dismissing = false;

  static get observedAttributes(): string[] {
    return [
      "intent",
      "variant",
      "heading",
      "dismissible",
      "live",
      "hidden",
      "lang",
      "locale-json",
      "theme",
      "class",
      "testid"
    ];
  }

  connectedCallback(): void {
    if (!this.observer) {
      // Ícone ou ação que chegam depois (frameworks) recebem o hook.
      this.observer = new MutationObserver(() => this.syncSlots());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (name === "hidden") {
      // Reexibido pelo app: descarta a animação de saída, que fica preenchida em opacidade 0 (fill forwards).
      if (newValue === null && !this.dismissing) for (const animation of this.getAnimations()) animation.cancel();
      return;
    }
    if (!this.isConnected) return;
    this.updateAppearance();
  }

  get dismissible(): boolean {
    return this.hasAttribute("dismissible");
  }

  set dismissible(value: boolean | string | null | undefined) {
    this.toggleAttribute(
      "dismissible",
      value === "" || (value !== null && value !== undefined && value !== false && value !== "false")
    );
  }

  /** Dispensa o alerta: anima a saída, emite `ark-dismiss` e esconde o host (`hidden`); remover é do app. */
  dismiss(): void {
    if (this.dismissing || this.hidden) return;
    this.dismissing = true;
    arkExit(this, "slide-down", { duration: "quick" }).then(() => {
      this.hidden = true;
      this.dismissing = false;
      this.dispatchEvent(new CustomEvent("ark-dismiss", { bubbles: true, composed: true }));
    });
  }

  private getVariant(): ArkAlertVariant {
    return (this.getAttribute("variant") || "").toLowerCase() === "banner" ? "banner" : "box";
  }

  // Padrão pelo intent: aviso e perigo interrompem (assertive), o resto espera (polite).
  private getLive(intent: ArkIntent): ArkAlertLive {
    const live = (this.getAttribute("live") || "").toLowerCase();
    if (live === "polite" || live === "assertive" || live === "off") return live;
    return intent === "warning" || intent === "danger" ? "assertive" : "polite";
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  private getPalette(intent: ArkIntent): ArkAlertPalette {
    const palettes: Record<ArkIntent, ArkAlertPalette> = {
      primary: {
        box: "ark:border-primary-border ark:bg-primary-soft ark:text-primary-soft-fg",
        ring: "ark:focus-visible:ring-primary-ring"
      },
      secondary: {
        box: "ark:border-secondary-border ark:bg-secondary-soft ark:text-secondary-soft-fg",
        ring: "ark:focus-visible:ring-secondary-ring"
      },
      success: {
        box: "ark:border-success-border ark:bg-success-soft ark:text-success-soft-fg",
        ring: "ark:focus-visible:ring-success-ring"
      },
      warning: {
        box: "ark:border-warning-border ark:bg-warning-soft ark:text-warning-soft-fg",
        ring: "ark:focus-visible:ring-warning-ring"
      },
      danger: {
        box: "ark:border-danger-border ark:bg-danger-soft ark:text-danger-soft-fg",
        ring: "ark:focus-visible:ring-danger-ring"
      },
      info: {
        box: "ark:border-info-border ark:bg-info-soft ark:text-info-soft-fg",
        ring: "ark:focus-visible:ring-info-ring"
      },
      neutral: {
        box: "ark:border-neutral-border ark:bg-neutral-soft ark:text-neutral-soft-fg",
        ring: "ark:focus-visible:ring-neutral-ring"
      }
    };
    return palettes[intent];
  }

  // Título próprio no início do host (ordem de leitura), só enquanto `heading` existir.
  private syncHeading(): void {
    const heading = this.getAttribute("heading");
    if (!heading) {
      this.headingEl?.remove();
      this.headingEl = null;
      return;
    }
    if (!this.headingEl) {
      const el = document.createElement("p");
      el.setAttribute("data-ark-chrome", "heading");
      this.prepend(el);
      this.headingEl = el;
    }
    this.headingEl.textContent = heading;
    this.headingEl.className = "ark:font-semibold";
  }

  // Botão de dispensar no fim do host (chrome), só enquanto `dismissible` existir.
  private syncDismiss(palette: ArkAlertPalette): void {
    if (!this.dismissible) {
      this.dismissEl?.remove();
      this.dismissEl = null;
      return;
    }
    if (!this.dismissEl) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-ark-chrome", "dismiss");
      button.innerHTML = CLOSE_SVG;
      button.addEventListener("click", () => this.dismiss());
      this.appendChild(button);
      this.dismissEl = button;
    }
    this.dismissEl.setAttribute("aria-label", this.getLocale().dismiss);
    this.dismissEl.className = [
      "ark:inline-flex ark:h-6 ark:w-6 ark:cursor-pointer ark:items-center ark:justify-center ark:rounded-md ark:p-1 ark:opacity-70 ark:transition-opacity ark:outline-none ark:hover:opacity-100 ark:focus-visible:opacity-100 ark:focus-visible:ring-2",
      palette.ring
    ].join(" ");
  }

  private syncSlots(): void {
    const icon = this.querySelector<HTMLElement>(':scope > [slot="icon"]');
    if (icon) applyTestHooks(this, "alert", icon, "icon");
    const action = this.querySelector<HTMLElement>(':scope > [slot="action"]');
    if (action) applyTestHooks(this, "alert", action, "action");
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
    const intent = normalizeIntent(this.getAttribute("intent"), "info");
    const palette = this.getPalette(intent);
    const variant = this.getVariant();
    const live = this.getLive(intent);

    this.syncHeading();
    this.syncDismiss(palette);

    // display, padding e o lugar de ícone, ação e dispensar ficam em components.css (alcançam os filhos).
    this.applyOwnClasses(
      ["ark:text-sm", palette.box, variant === "banner" ? "ark:border-b ark:rounded-none" : "ark:rounded-lg ark:border"]
        .join(" ")
        .split(" ")
    );

    if (live === "off") {
      this.removeAttribute("role");
    } else {
      this.setAttribute("role", live === "assertive" ? "alert" : "status");
    }

    applyTestHooks(this, "alert", this);
    if (this.headingEl) applyTestHooks(this, "alert", this.headingEl, "heading");
    if (this.dismissEl) applyTestHooks(this, "alert", this.dismissEl, "dismiss");
    this.syncSlots();
  }
}

export default ArkAlert;
