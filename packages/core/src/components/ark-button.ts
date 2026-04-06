import "../styles/tailwind.css";

export class ArkButton extends HTMLElement {
  static readonly tagName = "ark-button";

  private buttonEl: HTMLButtonElement | null = null;

  static get observedAttributes(): string[] {
    return ["disabled", "type", "variant", "size", "class"];
  }

  connectedCallback(): void {
    if (!this.buttonEl) {
      this.render();
    }

    this.syncDisabled();
    this.syncType();
    this.updateClasses();
  }

  attributeChangedCallback(name: string): void {
    if (name === "disabled") {
      this.syncDisabled();
      return;
    }

    if (name === "type") {
      this.syncType();
      return;
    }

    if (name === "variant" || name === "size" || name === "class") {
      this.updateClasses();
    }
  }

  private syncDisabled(): void {
    if (!this.buttonEl) return;
    this.buttonEl.disabled = this.hasAttribute("disabled");
  }

  private syncType(): void {
    if (!this.buttonEl) return;
    const type = this.getAttribute("type") || "button";
    this.buttonEl.type = type === "submit" || type === "reset" ? type : "button";
  }

  private computeClasses(): string {
    const base =
      "inline-flex items-center justify-center rounded-md border font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50";

    const variant = (this.getAttribute("variant") || "primary").toLowerCase();
    const size = (this.getAttribute("size") || "md").toLowerCase();

    const variants: Record<string, string> = {
      primary: "bg-slate-900 text-white border-transparent hover:bg-slate-800",
      secondary: "bg-white text-slate-900 border-slate-300 hover:bg-slate-50",
      outline: "bg-transparent text-slate-900 border-slate-300 hover:bg-slate-50",
      ghost: "bg-transparent text-slate-900 border-transparent hover:bg-slate-50"
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-3 text-base"
    };

    const custom = this.getAttribute("class") || "";

    return [base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.md, custom]
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
  }

  private render(): void {
    const button = document.createElement("button");
    button.setAttribute("part", "button");
    button.className = this.computeClasses();

    while (this.firstChild) {
      button.appendChild(this.firstChild);
    }

    this.appendChild(button);
    this.buttonEl = button;
  }

  private updateClasses(): void {
    if (!this.buttonEl) return;
    this.buttonEl.className = this.computeClasses();
  }
}

export default ArkButton;
