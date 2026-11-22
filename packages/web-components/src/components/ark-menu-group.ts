import type { ArkSize } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Contador para o id do rótulo, referenciado pelo `aria-labelledby` do grupo. */
let groupSeq = 0;

/**
 * Grupo nomeado de itens dentro de um ark-menu. O PRÓPRIO host é o grupo
 * (`role="group"`): os `ark-menu-item` do usuário ficam onde estão, e as setas,
 * Home e End do menu os atravessam como se estivessem soltos. `label` cria o
 * rótulo visível no início do host, que nomeia o grupo por `aria-labelledby`;
 * sem ele, um `aria-label` no host nomeia. `size` e `theme` chegam propagados
 * do ark-menu.
 */
export class ArkMenuGroup extends HTMLElementBase {
  static readonly tagName = "ark-menu-group";

  private ownClasses: string[] = [];
  private syncingClass = false;
  /** Rótulo visível (nó próprio), presente só com `label`. */
  private labelEl: HTMLDivElement | null = null;
  /** O `aria-labelledby` do host foi escrito pelo componente (aponta para o rótulo próprio). */
  private ownLabelledBy = false;

  static get observedAttributes(): string[] {
    return ["label", "size", "theme", "class", "testid"];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;
    this.updateAppearance();
  }

  /** Rótulo visível do grupo, que também o nomeia. Padrão: nenhum. */
  get label(): string {
    return this.getAttribute("label") || "";
  }

  set label(value: string | null | undefined) {
    reflectAttr(this, "label", value);
  }

  private labelClasses(): string {
    // Mesmo respiro do conteúdo estático do item, um passo de fonte abaixo do texto dos itens do mesmo size.
    const sizes: Record<ArkSize, string> = {
      xs: "ark:px-2 ark:py-1 ark:text-2xs",
      sm: "ark:px-2.5 ark:py-1 ark:text-2xs",
      md: "ark:px-3 ark:py-1.5 ark:text-xs",
      lg: "ark:px-3.5 ark:py-2 ark:text-sm",
      xl: "ark:px-4 ark:py-2 ark:text-base"
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;
    return `ark:block ark:cursor-default ark:select-none ark:font-semibold ark:text-fg-muted ${size}`;
  }

  // Rótulo próprio no início do host: o nome do grupo vem dele por aria-labelledby, então ele sai da árvore de
  // acessibilidade (aria-hidden), onde seria um nó de texto solto dentro do menu.
  private syncLabel(text: string): void {
    if (!text) {
      this.labelEl?.remove();
      this.labelEl = null;
      if (this.ownLabelledBy) this.removeAttribute("aria-labelledby");
      this.ownLabelledBy = false;
      return;
    }

    if (!this.labelEl) {
      const label = document.createElement("div");
      label.id = `ark-menu-group-${++groupSeq}-label`;
      label.setAttribute("data-ark-chrome", "label");
      label.setAttribute("aria-hidden", "true");
      this.labelEl = label;
    }
    if (this.firstChild !== this.labelEl) this.prepend(this.labelEl);
    if (this.labelEl.textContent !== text) this.labelEl.textContent = text;
    this.labelEl.className = this.labelClasses();
    // Um aria-labelledby do próprio app no host vence: só o do componente é reescrito.
    if (this.ownLabelledBy || !this.hasAttribute("aria-labelledby")) {
      this.setAttribute("aria-labelledby", this.labelEl.id);
      this.ownLabelledBy = true;
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
    this.setAttribute("role", "group");
    this.syncLabel(this.label.trim());
    // Coluna como o painel do menu; shrink-0 para o grupo não encolher quando o menu rola.
    this.applyOwnClasses("ark:flex ark:w-full ark:shrink-0 ark:flex-col".split(" "));

    applyTestHooks(this, "menu-group", this);
    if (this.labelEl) applyTestHooks(this, "menu-group", this.labelEl, "label");
  }
}

export default ArkMenuGroup;
