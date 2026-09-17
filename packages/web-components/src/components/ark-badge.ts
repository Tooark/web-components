import type { ArkBadgeSize, ArkBadgeVariant, ArkIntent, ArkRounded } from "@tooark/core";
import { normalizeIntent } from "./intent-colors";
import { applyTestHooks } from "./test-hooks";

type ArkBadgePalette = Record<ArkBadgeVariant, string>;

/**
 * Rótulo curto de status ou categoria. O PRÓPRIO host é o badge (classes e
 * hooks): os filhos do usuário, ícone e texto, ficam onde estão. Não é
 * interativo; um badge clicável é um ark-button pequeno.
 */
export class ArkBadge extends HTMLElement {
  static readonly tagName = "ark-badge";

  private ownClasses: string[] = [];
  private syncingClass = false;

  static get observedAttributes(): string[] {
    return ["intent", "variant", "size", "rounded", "color", "theme", "class", "testid"];
  }

  connectedCallback(): void {
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

  private getVariant(): ArkBadgeVariant {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    return variant === "solid" || variant === "outline" ? variant : "soft";
  }

  private getSize(): ArkBadgeSize {
    const size = (this.getAttribute("size") || "").toLowerCase();
    return size === "xs" || size === "sm" ? size : "md";
  }

  private getPalette(intent: ArkIntent): ArkBadgePalette {
    const palettes: Record<ArkIntent, ArkBadgePalette> = {
      primary: {
        soft: "ark:border-transparent ark:bg-primary-soft ark:text-primary-soft-fg",
        solid: "ark:border-transparent ark:bg-primary ark:text-primary-fg",
        outline: "ark:border-primary-border ark:bg-transparent ark:text-primary-soft-fg"
      },
      secondary: {
        soft: "ark:border-transparent ark:bg-secondary-soft ark:text-secondary-soft-fg",
        solid: "ark:border-transparent ark:bg-secondary ark:text-secondary-fg",
        outline: "ark:border-secondary-border ark:bg-transparent ark:text-secondary-soft-fg"
      },
      success: {
        soft: "ark:border-transparent ark:bg-success-soft ark:text-success-soft-fg",
        solid: "ark:border-transparent ark:bg-success ark:text-success-fg",
        outline: "ark:border-success-border ark:bg-transparent ark:text-success-soft-fg"
      },
      warning: {
        soft: "ark:border-transparent ark:bg-warning-soft ark:text-warning-soft-fg",
        solid: "ark:border-transparent ark:bg-warning ark:text-warning-fg",
        outline: "ark:border-warning-border ark:bg-transparent ark:text-warning-soft-fg"
      },
      danger: {
        soft: "ark:border-transparent ark:bg-danger-soft ark:text-danger-soft-fg",
        solid: "ark:border-transparent ark:bg-danger ark:text-danger-fg",
        outline: "ark:border-danger-border ark:bg-transparent ark:text-danger-soft-fg"
      },
      info: {
        soft: "ark:border-transparent ark:bg-info-soft ark:text-info-soft-fg",
        solid: "ark:border-transparent ark:bg-info ark:text-info-fg",
        outline: "ark:border-info-border ark:bg-transparent ark:text-info-soft-fg"
      },
      neutral: {
        soft: "ark:border-transparent ark:bg-neutral-soft ark:text-neutral-soft-fg",
        solid: "ark:border-transparent ark:bg-neutral ark:text-neutral-fg",
        outline: "ark:border-neutral-border ark:bg-transparent ark:text-neutral-soft-fg"
      }
    };

    return palettes[intent];
  }

  private computeClasses(): string[] {
    const base =
      "ark:inline-flex ark:items-center ark:justify-center ark:gap-1 ark:border ark:font-medium ark:whitespace-nowrap ark:align-middle";

    // Rótulo inline: a altura vem da fonte e do padding, não do token de controle.
    const sizes: Record<ArkBadgeSize, string> = {
      xs: "ark:px-1.5 ark:text-xs",
      sm: "ark:px-2 ark:py-0.5 ark:text-xs",
      md: "ark:px-2.5 ark:py-0.5 ark:text-sm"
    };

    const roundedMap: Record<ArkRounded, string> = {
      none: "ark:rounded-none",
      xs: "ark:rounded-xs",
      sm: "ark:rounded-sm",
      md: "ark:rounded-md",
      lg: "ark:rounded-lg",
      xl: "ark:rounded-xl",
      full: "ark:rounded-full"
    };
    const rounded = roundedMap[(this.getAttribute("rounded") || "full").toLowerCase() as ArkRounded] ?? roundedMap.full;

    // Com `color` as cores vêm das variáveis inline calculadas em applyCustomColor.
    const colors = this.getAttribute("color")?.trim()
      ? "ark:border-(--ark-badge-border) ark:bg-(--ark-badge-bg) ark:text-(--ark-badge-fg)"
      : this.getPalette(normalizeIntent(this.getAttribute("intent"), "neutral"))[this.getVariant()];

    return [base, sizes[this.getSize()], rounded, colors].join(" ").split(/\s+/).filter(Boolean);
  }

  // Cor própria do app (métodos HTTP, tags...): texto na cor; fundo suave e contorno por color-mix.
  private applyCustomColor(): void {
    const color = this.getAttribute("color")?.trim();
    if (!color) {
      this.style.removeProperty("--ark-badge-bg");
      this.style.removeProperty("--ark-badge-fg");
      this.style.removeProperty("--ark-badge-border");
      return;
    }

    const variant = this.getVariant();
    const soft = `color-mix(in oklab, ${color} 15%, transparent)`;
    const bg = variant === "solid" ? color : variant === "soft" ? soft : "transparent";
    const fg = variant === "solid" ? "#fff" : color;
    const border = variant === "outline" ? `color-mix(in oklab, ${color} 45%, transparent)` : "transparent";
    this.style.setProperty("--ark-badge-bg", bg);
    this.style.setProperty("--ark-badge-fg", fg);
    this.style.setProperty("--ark-badge-border", border);
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
    this.applyCustomColor();
    this.applyOwnClasses(this.computeClasses());
    applyTestHooks(this, "badge", this);
  }
}

export default ArkBadge;
