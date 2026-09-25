import type { ArkCardPadding, ArkRounded } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";

/**
 * Cartão: o PRÓPRIO host é o container (fundo surface, borda, cantos), uma
 * grid de components.css com a linha de cabeçalho, o corpo e o rodapé. Os
 * filhos do usuário ficam onde estão: `slot="header"` e `slot="actions"` na
 * linha de cima (título à esquerda, ações à direita), `slot="footer"` na
 * última linha, com divisor, e os demais são o corpo, na largura toda e na
 * ordem do DOM. `heading` cria um h2 próprio no início do host; com ele, o
 * `slot="header"` do usuário vira a linha seguinte do cabeçalho. `padding`
 * escala o espaçamento interno (padding do host e gap entre as linhas) e
 * `rounded` os cantos. Não é interativo e não tem role próprio.
 */
export class ArkCard extends HTMLElementBase {
  static readonly tagName = "ark-card";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private observer: MutationObserver | null = null;
  private headingEl: HTMLHeadingElement | null = null;

  static get observedAttributes(): string[] {
    return ["heading", "padding", "rounded", "theme", "class", "testid"];
  }

  connectedCallback(): void {
    if (!this.observer) {
      // Slots que chegam depois (frameworks) recebem o hook.
      this.observer = new MutationObserver(() => this.syncSlots());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;
    this.updateAppearance();
  }

  private getPadding(): ArkCardPadding {
    const padding = (this.getAttribute("padding") || "").toLowerCase();
    return padding === "none" || padding === "sm" || padding === "lg" ? padding : "md";
  }

  // Título próprio: h2 no início do host (ordem de leitura), só enquanto `heading` existir.
  private syncHeading(): void {
    const heading = this.getAttribute("heading");
    if (!heading) {
      this.headingEl?.remove();
      this.headingEl = null;
      return;
    }
    if (!this.headingEl) {
      const el = document.createElement("h2");
      el.setAttribute("data-ark-chrome", "heading");
      this.prepend(el);
      this.headingEl = el;
    }
    this.headingEl.textContent = heading;
    this.headingEl.className = "ark:text-base ark:font-semibold ark:leading-snug ark:text-fg";
  }

  // Só os slots recebem hook: o corpo é conteúdo livre do usuário (pode ser outro ark-*, com os próprios hooks).
  private syncSlots(): void {
    for (const child of Array.from(this.children)) {
      const slot = child.getAttribute("slot");
      if (slot === "header" || slot === "actions" || slot === "footer") applyTestHooks(this, "card", child, slot);
    }
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
    this.syncHeading();

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

    // display, padding e gap ficam em components.css (dependem do atributo padding e alcançam os filhos).
    this.applyOwnClasses(["ark:border", "ark:border-border", "ark:bg-surface", "ark:text-fg", rounded]);
    this.setAttribute("data-ark-padding", this.getPadding());

    applyTestHooks(this, "card", this);
    if (this.headingEl) applyTestHooks(this, "card", this.headingEl, "heading");
    this.syncSlots();
  }
}

export default ArkCard;
