import { applyTestHooks } from "./test-hooks";

/**
 * Estado vazio: caixa de borda tracejada com ícone apagado, título, descrição
 * e ação opcional. O PRÓPRIO host é a caixa: os filhos do usuário
 * (`slot="icon"` e `slot="action"`, um ark-button) ficam onde estão e são
 * ordenados por CSS; título e descrição vêm dos atributos `heading` e
 * `description`, em nós do componente ao fim do host. Filhos sem slot entram
 * entre a descrição e a ação. Não é interativo e não tem role próprio.
 */
export class ArkEmpty extends HTMLElement {
  static readonly tagName = "ark-empty";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private observer: MutationObserver | null = null;
  private headingEl: HTMLHeadingElement | null = null;
  private descriptionEl: HTMLParagraphElement | null = null;

  static get observedAttributes(): string[] {
    return ["heading", "description", "theme", "class", "testid"];
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

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;
    this.updateAppearance();
  }

  // Título e descrição: nós próprios ao fim do host, ordenados por CSS (ícone, título, descrição, resto, ação).
  private syncText(): void {
    const heading = this.getAttribute("heading");
    if (heading) {
      if (!this.headingEl) {
        const el = document.createElement("h3");
        el.setAttribute("data-ark-chrome", "heading");
        this.appendChild(el);
        this.headingEl = el;
      }
      this.headingEl.textContent = heading;
      this.headingEl.className = "ark:-order-2 ark:text-base ark:font-semibold ark:text-fg";
    } else {
      this.headingEl?.remove();
      this.headingEl = null;
    }

    const description = this.getAttribute("description");
    if (description) {
      if (!this.descriptionEl) {
        const el = document.createElement("p");
        el.setAttribute("data-ark-chrome", "description");
        // Depois do título, quando ele existir.
        this.insertBefore(el, this.headingEl?.nextSibling ?? null);
        this.descriptionEl = el;
      }
      this.descriptionEl.textContent = description;
      this.descriptionEl.className = "ark:-order-1 ark:max-w-sm ark:text-sm ark:text-fg-muted";
    } else {
      this.descriptionEl?.remove();
      this.descriptionEl = null;
    }
  }

  private syncSlots(): void {
    const icon = this.querySelector<HTMLElement>(':scope > [slot="icon"]');
    if (icon) applyTestHooks(this, "empty", icon, "icon");
    const action = this.querySelector<HTMLElement>(':scope > [slot="action"]');
    if (action) applyTestHooks(this, "empty", action, "action");
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
    this.syncText();

    this.applyOwnClasses(
      "ark:flex ark:flex-col ark:items-center ark:justify-center ark:gap-2 ark:rounded-xl ark:border ark:border-dashed ark:border-border ark:px-6 ark:py-10 ark:text-center ark:text-fg".split(
        " "
      )
    );

    applyTestHooks(this, "empty", this);
    if (this.headingEl) applyTestHooks(this, "empty", this.headingEl, "heading");
    if (this.descriptionEl) applyTestHooks(this, "empty", this.descriptionEl, "description");
    this.syncSlots();
  }
}

export default ArkEmpty;
