import "../styles/tailwind.css";
import { resolveLocale, type ArkDatepickerLocale } from "../i18n";

export class ArkDatepicker extends HTMLElement {
  static readonly tagName = "ark-datepicker";

  private root: HTMLDivElement | null = null;
  private viewDate: Date = new Date();
  private selectedDate: Date | null = null;
  private locale: ArkDatepickerLocale | null = null;

  static get observedAttributes(): string[] {
    return ["lang", "locale-json", "value", "min", "max"];
  }

  connectedCallback(): void {
    this.locale = this.getLocale();
    if (this.hasAttribute("value")) {
      const parsed = new Date(this.getAttribute("value")!);
      if (!isNaN(parsed.getTime())) {
        this.selectedDate = parsed;
        this.viewDate = new Date(parsed);
      }
    }
    this.build();
  }

  attributeChangedCallback(name: string): void {
    if (name === "lang" || name === "locale-json") {
      this.locale = this.getLocale();
    }
    if (name === "value") {
      const v = this.getAttribute("value");
      if (v) {
        const d = new Date(v);
        if (!isNaN(d.getTime())) {
          this.selectedDate = d;
          this.viewDate = new Date(d);
        }
      } else {
        this.selectedDate = null;
      }
    }
    if (this.root) this.build();
  }

  private getLocale(): ArkDatepickerLocale {
    const lang = this.getAttribute("lang") || "en";
    const customJson = this.getAttribute("locale-json") || undefined;
    return resolveLocale(lang, customJson);
  }

  private getMinDate(): Date | null {
    const v = this.getAttribute("min");
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private getMaxDate(): Date | null {
    const v = this.getAttribute("max");
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private isDateDisabled(date: Date): boolean {
    const min = this.getMinDate();
    const max = this.getMaxDate();
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private isToday(d: Date): boolean {
    return this.isSameDay(d, new Date());
  }

  private formatISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  private build(): void {
    if (!this.locale) this.locale = this.getLocale();
    const loc = this.locale;

    if (this.root) {
      this.root.remove();
    }

    const container = document.createElement("div");
    container.setAttribute("part", "container");
    container.className = "inline-block select-none rounded-lg border border-slate-200 bg-white p-4 shadow-sm";

    // --- Header: prev / month-year / next ---
    const header = document.createElement("div");
    header.className = "mb-3 flex items-center justify-between";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", loc.previousMonth);
    prevBtn.className = "rounded p-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400";
    prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    prevBtn.addEventListener("click", () => {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
      this.build();
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", loc.nextMonth);
    nextBtn.className = "rounded p-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400";
    nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    nextBtn.addEventListener("click", () => {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
      this.build();
    });

    const title = document.createElement("span");
    title.className = "text-sm font-semibold text-slate-900";
    title.textContent = `${loc.months[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    container.appendChild(header);

    // --- Weekday header ---
    const weekRow = document.createElement("div");
    weekRow.className = "mb-1 grid grid-cols-7 gap-0";

    const fdow = loc.firstDayOfWeek;
    for (let i = 0; i < 7; i++) {
      const idx = (fdow + i) % 7;
      const cell = document.createElement("div");
      cell.className = "py-1 text-center text-xs font-medium text-slate-500";
      cell.textContent = loc.weekdaysMin[idx];
      weekRow.appendChild(cell);
    }
    container.appendChild(weekRow);

    // --- Day grid ---
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    let startDay = firstOfMonth.getDay() - fdow;
    if (startDay < 0) startDay += 7;

    const totalCells = startDay + lastOfMonth.getDate();
    const rows = Math.ceil(totalCells / 7);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-7 gap-0";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 7; c++) {
        const dayIndex = r * 7 + c - startDay + 1;
        const cell = document.createElement("button");
        cell.type = "button";

        if (dayIndex < 1 || dayIndex > lastOfMonth.getDate()) {
          cell.className = "h-9 w-9";
          cell.disabled = true;
          grid.appendChild(cell);
          continue;
        }

        const cellDate = new Date(year, month, dayIndex);
        const disabled = this.isDateDisabled(cellDate);
        const selected = this.selectedDate ? this.isSameDay(cellDate, this.selectedDate) : false;
        const today = this.isToday(cellDate);

        let cls = "h-9 w-9 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400";

        if (disabled) {
          cls += " cursor-not-allowed text-slate-300";
        } else if (selected) {
          cls += " bg-slate-900 font-semibold text-white hover:bg-slate-800";
        } else if (today) {
          cls += " font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100";
        } else {
          cls += " text-slate-700 hover:bg-slate-100";
        }

        cell.className = cls;
        cell.textContent = String(dayIndex);
        cell.disabled = disabled;

        if (!disabled) {
          cell.addEventListener("click", () => {
            this.selectedDate = cellDate;
            this.setAttribute("value", this.formatISO(cellDate));
            this.dispatchEvent(new CustomEvent("ark-change", { detail: { value: this.formatISO(cellDate), date: cellDate }, bubbles: true, composed: true }));
            this.build();
          });
        }

        grid.appendChild(cell);
      }
    }

    container.appendChild(grid);

    // --- Footer: Today / Clear ---
    const footer = document.createElement("div");
    footer.className = "mt-3 flex items-center justify-between gap-2";

    const todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.className = "rounded-md px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400";
    todayBtn.textContent = loc.today;
    todayBtn.addEventListener("click", () => {
      const now = new Date();
      this.selectedDate = now;
      this.viewDate = new Date(now);
      this.setAttribute("value", this.formatISO(now));
      this.dispatchEvent(new CustomEvent("ark-change", { detail: { value: this.formatISO(now), date: now }, bubbles: true, composed: true }));
      this.build();
    });

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400";
    clearBtn.textContent = loc.clear;
    clearBtn.addEventListener("click", () => {
      this.selectedDate = null;
      this.removeAttribute("value");
      this.dispatchEvent(new CustomEvent("ark-change", { detail: { value: null, date: null }, bubbles: true, composed: true }));
      this.build();
    });

    footer.appendChild(todayBtn);
    footer.appendChild(clearBtn);
    container.appendChild(footer);

    this.appendChild(container);
    this.root = container;
  }
}

export default ArkDatepicker;
