import type { ArkAvatarShape, ArkSize } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

/** Glifo de pessoa para o avatar sem nome e sem imagem (chrome próprio). */
const PERSON_SVG = `
  <svg class="ark:h-[60%] ark:w-[60%]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z"></path>
  </svg>`;

type ArkAvatarSizing = {
  box: string;
  text: string;
};

/**
 * Avatar: o PRÓPRIO host é o círculo ou quadrado (`role="img"` nomeado por
 * `name`). Mostra a imagem de `src` e, sem ela ou quando ela falha ao
 * carregar, as iniciais de `name` (primeira letra, ou primeira mais última
 * quando há sobrenome); sem nome e sem imagem, um glifo de pessoa decorativo
 * (`aria-hidden`, a menos que o host tenha aria-label próprio). `color` troca
 * o tint primary por uma cor própria (texto na cor, fundo suave).
 */
export class ArkAvatar extends HTMLElement {
  static readonly tagName = "ark-avatar";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private imageEl: HTMLImageElement | null = null;
  private initialsEl: HTMLSpanElement | null = null;
  /** `src` que falhou ao carregar; volta a tentar quando o atributo muda. */
  private failedSrc: string | null = null;
  /** aria-label escrito pelo componente a partir de `name`, para o tirar quando o nome sai. */
  private ownLabel: string | null = null;

  static get observedAttributes(): string[] {
    return ["name", "src", "size", "shape", "color", "aria-label", "theme", "class", "testid"];
  }

  connectedCallback(): void {
    if (!this.initialsEl) this.render();
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.initialsEl || !this.isConnected) return;
    this.updateAppearance();
  }

  /** Iniciais derivadas de `name`: primeira letra, ou primeira mais última quando há sobrenome. */
  get initials(): string {
    const words = (this.getAttribute("name") || "").trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "";
    const first = words[0][0] ?? "";
    const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
    return `${first}${last}`.toUpperCase();
  }

  private getSizing(): ArkAvatarSizing {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, ArkAvatarSizing> = {
      xs: { box: "ark:h-6 ark:w-6", text: "ark:text-[0.625rem]" },
      sm: { box: "ark:h-8 ark:w-8", text: "ark:text-xs" },
      md: { box: "ark:h-10 ark:w-10", text: "ark:text-sm" },
      lg: { box: "ark:h-12 ark:w-12", text: "ark:text-base" },
      xl: { box: "ark:h-16 ark:w-16", text: "ark:text-xl" }
    };
    return sizes[size] ?? sizes.md;
  }

  private getShape(): ArkAvatarShape {
    return (this.getAttribute("shape") || "").toLowerCase() === "square" ? "square" : "circle";
  }

  private render(): void {
    const initials = document.createElement("span");
    initials.setAttribute("aria-hidden", "true");
    this.appendChild(initials);
    this.initialsEl = initials;
  }

  // A imagem só existe com `src`; em erro de carga sai da frente e as iniciais aparecem.
  private syncImage(): void {
    const src = this.getAttribute("src") || "";
    if (!src) {
      this.imageEl?.remove();
      this.imageEl = null;
      this.failedSrc = null;
      return;
    }
    if (!this.imageEl) {
      const image = document.createElement("img");
      image.setAttribute("data-ark-chrome", "image");
      image.addEventListener("error", () => {
        this.failedSrc = image.getAttribute("src");
        this.updateAppearance();
      });
      image.addEventListener("load", () => {
        this.failedSrc = null;
        this.updateAppearance();
      });
      this.prepend(image);
      this.imageEl = image;
    }
    if (this.imageEl.getAttribute("src") !== src) {
      this.failedSrc = null;
      this.imageEl.setAttribute("src", src);
    }
    this.imageEl.alt = this.getAttribute("name") || "";
    const failed = this.failedSrc === src;
    this.imageEl.hidden = failed;
    this.imageEl.className = failed ? "" : "ark:h-full ark:w-full ark:object-cover";
  }

  // Cor própria: texto na cor e fundo suave por color-mix, como o badge.
  private applyCustomColor(): void {
    const color = this.getAttribute("color")?.trim();
    if (!color) {
      this.style.removeProperty("--ark-avatar-bg");
      this.style.removeProperty("--ark-avatar-fg");
      return;
    }
    this.style.setProperty("--ark-avatar-bg", `color-mix(in oklab, ${color} 18%, transparent)`);
    this.style.setProperty("--ark-avatar-fg", color);
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
    if (!this.initialsEl) return;

    const name = (this.getAttribute("name") || "").trim();
    const sizing = this.getSizing();
    const initials = this.initials;

    this.syncImage();
    this.applyCustomColor();
    const showImage = this.imageEl !== null && !this.imageEl.hidden;

    // Sem imagem: iniciais, ou o glifo de pessoa quando não há nome.
    this.initialsEl.hidden = showImage;
    if (!showImage) {
      if (initials) {
        this.initialsEl.textContent = initials;
      } else if (!this.initialsEl.querySelector("svg")) {
        this.initialsEl.innerHTML = PERSON_SVG;
      }
      if (initials && this.initialsEl.querySelector("svg")) this.initialsEl.textContent = initials;
    }
    this.initialsEl.className = [
      "ark:inline-flex ark:h-full ark:w-full ark:items-center ark:justify-center",
      sizing.text
    ].join(" ");

    const colors = this.getAttribute("color")?.trim()
      ? "ark:bg-(--ark-avatar-bg) ark:text-(--ark-avatar-fg)"
      : "ark:bg-primary-soft ark:text-primary-soft-fg";
    this.applyOwnClasses(
      [
        "ark:inline-flex ark:shrink-0 ark:items-center ark:justify-center ark:overflow-hidden ark:align-middle ark:font-semibold ark:uppercase ark:leading-none ark:select-none",
        sizing.box,
        this.getShape() === "square" ? "ark:rounded-md" : "ark:rounded-full",
        colors
      ]
        .join(" ")
        .split(" ")
    );

    // Nome acessível: name, ou o aria-label próprio do usuário; sem os dois o avatar é decorativo.
    this.setAttribute("role", "img");
    if (name) {
      this.ownLabel = name;
      this.setAttribute("aria-label", name);
      this.removeAttribute("aria-hidden");
    } else {
      if (this.ownLabel && this.getAttribute("aria-label") === this.ownLabel) this.removeAttribute("aria-label");
      this.ownLabel = null;
      if (this.getAttribute("aria-label")) {
        this.removeAttribute("aria-hidden");
      } else {
        this.setAttribute("aria-hidden", "true");
      }
    }

    applyTestHooks(this, "avatar", this);
    applyTestHooks(this, "avatar", this.initialsEl, "initials");
    if (this.imageEl) applyTestHooks(this, "avatar", this.imageEl, "image");
  }
}

export default ArkAvatar;
