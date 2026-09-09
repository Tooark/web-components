import { resolveLocale } from "@tooark/core";
import type { ArkDatepickerLang, ArkIntent } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

type ArkClockColumn = "hours" | "minutes" | "seconds" | "meridiem";

type ArkClockPalette = {
  container: string;
  columnLabel: string;
  option: string;
  optionSelected: string;
  focusRing: string;
};

/**
 * Superfície de seleção de hora — colunas digitais roláveis de hora/minuto
 * (/segundo), no estilo DigitalClock do MUI. Valor sempre em 24h "HH:mm:ss";
 * `hours-format="12"` só muda a exibição (coluna AM/PM).
 */
export class ArkClock extends HTMLElement {
  static readonly tagName = "ark-clock";

  private root: HTMLDivElement | null = null;
  private columnEls = new Map<ArkClockColumn, HTMLDivElement>();
  private syncingValue = false;

  static get observedAttributes (): string[] {
    return ["value", "seconds", "step-minutes", "hours-format", "lang", "theme", "intent", "testid"];
  }

  connectedCallback (): void {
    this.build();
  }

  attributeChangedCallback (name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.root) return;
    if (this.syncingValue && name === "value") return;

    if (name === "value") {
      // Mudança externa: só re-seleciona, sem reconstruir colunas.
      this.updateSelection(true);
      return;
    }

    this.build();
  }

  get value (): string {
    return this.getAttribute("value") || "";
  }

  private getIntent (): ArkIntent {
    const intent = (this.getAttribute("intent") || "").toLowerCase();
    if (intent === "primary" || intent === "secondary" || intent === "success" || intent === "warning" || intent === "danger" || intent === "info" || intent === "neutral") {
      return intent;
    }
    return "primary";
  }

  private showSeconds (): boolean {
    return this.hasAttribute("seconds");
  }

  private is12h (): boolean {
    return this.getAttribute("hours-format") === "12";
  }

  private getStepMinutes (): number {
    const parsed = Number(this.getAttribute("step-minutes") || "1");
    if (!Number.isFinite(parsed)) return 1;
    return Math.min(30, Math.max(1, Math.floor(parsed)));
  }

  private parseValue (): { h: number; m: number; s: number } | null {
    const value = this.getAttribute("value");
    if (!value) return null;
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    const s = Number(match[3] || "0");
    if (h > 23 || m > 59 || s > 59) return null;
    return { h, m, s };
  }

  private getPalette (intent: ArkIntent): ArkClockPalette {
    const selectedByIntent: Record<ArkIntent, string> = {
      primary: "ark:bg-primary ark:text-primary-fg",
      secondary: "ark:bg-secondary ark:text-secondary-fg",
      success: "ark:bg-success ark:text-success-fg",
      warning: "ark:bg-warning ark:text-warning-fg",
      danger: "ark:bg-danger ark:text-danger-fg",
      info: "ark:bg-info ark:text-info-fg",
      neutral: "ark:bg-neutral ark:text-neutral-fg"
    };

    return {
      container: "ark:inline-flex ark:flex-col ark:gap-1 ark:rounded-lg ark:border ark:border-border ark:bg-surface ark:p-2 ark:shadow-sm",
      columnLabel: "ark:px-1 ark:pb-1 ark:text-center ark:text-[10px] ark:font-medium ark:uppercase ark:tracking-wide ark:text-fg-muted",
      option: "ark:text-fg-soft ark:hover:bg-surface-muted",
      optionSelected: `${selectedByIntent[intent]} ark:font-semibold`,
      focusRing: "ark:focus:ring-ring"
    };
  }

  private selectPart (column: ArkClockColumn, optionValue: number): void {
    const current = this.parseValue() || { h: 0, m: 0, s: 0 };

    if (column === "hours") {
      current.h = this.is12h() ? (current.h >= 12 ? (optionValue % 12) + 12 : optionValue % 12) : optionValue;
    } else if (column === "minutes") {
      current.m = optionValue;
    } else if (column === "seconds") {
      current.s = optionValue;
    } else {
      // meridiem: 0 = AM, 1 = PM
      current.h = optionValue === 1 ? (current.h % 12) + 12 : current.h % 12;
    }

    const pad = (n: number): string => String(n).padStart(2, "0");
    const value = `${pad(current.h)}:${pad(current.m)}${this.showSeconds() ? `:${pad(current.s)}` : ":00"}`;

    this.syncingValue = true;
    this.setAttribute("value", value);
    this.syncingValue = false;

    this.updateSelection(false);
    this.dispatchEvent(new CustomEvent("ark-change", { detail: { value }, bubbles: true, composed: true }));
  }

  private selectedValueFor (column: ArkClockColumn): number | null {
    const parsed = this.parseValue();
    if (!parsed) return null;
    if (column === "hours") return this.is12h() ? parsed.h % 12 : parsed.h;
    if (column === "minutes") return parsed.m;
    if (column === "seconds") return parsed.s;
    return parsed.h >= 12 ? 1 : 0;
  }

  // Atualiza classes/aria das opções sem reconstruir (evita saltos de scroll).
  private updateSelection (scrollIntoView: boolean): void {
    const palette = this.getPalette(this.getIntent());
    const base = `ark:w-12 ark:shrink-0 ark:rounded-md ark:px-1 ark:py-1.5 ark:text-center ark:text-sm ark:transition ark:focus:outline-none ark:focus:ring-2 ${palette.focusRing}`;

    for (const [column, columnEl] of this.columnEls) {
      const selected = this.selectedValueFor(column);
      const options = columnEl.querySelectorAll<HTMLButtonElement>("button");
      for (const option of options) {
        const optionValue = Number(option.dataset.value);
        const isSelected = selected !== null && optionValue === selected;
        option.className = `${base} ${isSelected ? palette.optionSelected : palette.option}`;
        option.setAttribute("aria-selected", isSelected ? "true" : "false");
        option.tabIndex = isSelected || (selected === null && optionValue === 0) ? 0 : -1;
        if (isSelected && scrollIntoView) {
          this.centerOption(columnEl, option);
        }
      }
    }
  }

  private centerOption (columnEl: HTMLElement, option: HTMLElement): void {
    columnEl.scrollTop = option.offsetTop - columnEl.clientHeight / 2 + option.clientHeight / 2;
  }

  private readonly handleColumnKeydown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target || target.tagName !== "BUTTON") return;

    let next: Element | null = null;
    if (event.key === "ArrowDown") next = target.nextElementSibling;
    else if (event.key === "ArrowUp") next = target.previousElementSibling;
    else if (event.key === "Home") next = target.parentElement?.firstElementChild ?? null;
    else if (event.key === "End") next = target.parentElement?.lastElementChild ?? null;
    else return;

    event.preventDefault();
    (next as HTMLElement | null)?.focus();
  };

  private build (): void {
    const palette = this.getPalette(this.getIntent());
    const loc = resolveLocale((this.getAttribute("lang") || "en") as ArkDatepickerLang, undefined);

    this.root?.remove();
    this.columnEls.clear();

    const container = document.createElement("div");
    container.className = palette.container;
    applyTestHooks(this, "clock", container);

    const columnsRow = document.createElement("div");
    columnsRow.className = "ark:flex ark:gap-1";

    const columns: Array<{ column: ArkClockColumn; label: string; options: Array<{ value: number; text: string }> }> = [];

    if (this.is12h()) {
      columns.push({
        column: "hours",
        label: loc.hours,
        options: Array.from({ length: 12 }, (_, i) => ({ value: i, text: i === 0 ? "12" : String(i).padStart(2, "0") }))
      });
    } else {
      columns.push({
        column: "hours",
        label: loc.hours,
        options: Array.from({ length: 24 }, (_, i) => ({ value: i, text: String(i).padStart(2, "0") }))
      });
    }

    const step = this.getStepMinutes();
    columns.push({
      column: "minutes",
      label: loc.minutes,
      options: Array.from({ length: Math.ceil(60 / step) }, (_, i) => ({ value: i * step, text: String(i * step).padStart(2, "0") }))
    });

    if (this.showSeconds()) {
      columns.push({
        column: "seconds",
        label: loc.seconds,
        options: Array.from({ length: 60 }, (_, i) => ({ value: i, text: String(i).padStart(2, "0") }))
      });
    }

    if (this.is12h()) {
      columns.push({
        column: "meridiem",
        label: "AM/PM",
        options: [{ value: 0, text: "AM" }, { value: 1, text: "PM" }]
      });
    }

    for (const { column, label, options } of columns) {
      const wrap = document.createElement("div");
      wrap.className = "ark:flex ark:flex-col";

      const labelEl = document.createElement("div");
      labelEl.className = palette.columnLabel;
      labelEl.textContent = label;
      labelEl.setAttribute("aria-hidden", "true");

      const list = document.createElement("div");
      list.setAttribute("role", "listbox");
      list.setAttribute("aria-label", label);
      list.className = "ark:flex ark:h-56 ark:flex-col ark:gap-0.5 ark:overflow-y-auto";
      list.addEventListener("keydown", this.handleColumnKeydown);
      applyTestHooks(this, "clock", list, column);

      for (const option of options) {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "option");
        button.dataset.value = String(option.value);
        button.textContent = option.text;
        button.addEventListener("click", () => this.selectPart(column, option.value));
        list.appendChild(button);
      }

      wrap.appendChild(labelEl);
      wrap.appendChild(list);
      columnsRow.appendChild(wrap);
      this.columnEls.set(column, list);
    }

    container.appendChild(columnsRow);
    this.appendChild(container);
    this.root = container;

    this.updateSelection(false);

    // Centraliza as seleções após o layout estar disponível.
    requestAnimationFrame(() => this.updateSelection(true));
  }
}

export default ArkClock;
