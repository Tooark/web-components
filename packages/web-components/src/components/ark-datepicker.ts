import "../styles/tailwind.css";
import { resolveLocale, type ArkDatepickerLocale } from "@tooark/core";
import type { ArkDatepickerLang, ArkIntent, ArkThemeSelected } from "@tooark/core";

type ArkDatepickerPalette = {
  container: string;
  headerText: string;
  navButton: string;
  weekdayText: string;
  dayBase: string;
  dayDisabled: string;
  dayDefault: string;
  dayToday: string;
  daySelected: string;
  footerPrimary: string;
  footerSecondary: string;
};

export class ArkDatepicker extends HTMLElement {
  static readonly tagName = "ark-datepicker";

  private root: HTMLDivElement | null = null;
  private viewDate: Date = new Date();
  private selectedDate: Date | null = null;
  private locale: ArkDatepickerLocale | null = null;

  static get observedAttributes(): string[] {
    return ["lang", "locale-json", "value", "min", "max", "theme", "intent", "accent-color"];
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
    const lang = (this.getAttribute("lang") || "en") as ArkDatepickerLang;
    const customJson = this.getAttribute("locale-json") || undefined;
    return resolveLocale(lang, customJson);
  }

  private getTheme(): ArkThemeSelected {
    const theme = (this.getAttribute("theme") || "auto").toLowerCase();
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  private getIntent(): ArkIntent {
    const intent = (this.getAttribute("intent") || "primary").toLowerCase();
    if (intent === "primary" || intent === "secondary" || intent === "success" || intent === "warning" || intent === "danger" || intent === "info" || intent === "neutral") {
      return intent;
    }
    return "primary";
  }

  private getAccentColor(): string | null {
    const accent = this.getAttribute("accent-color")?.trim();
    return accent || null;
  }

  private getPalette(theme: ArkThemeSelected, intent: ArkIntent): ArkDatepickerPalette {
    const lightIntent: Record<ArkIntent, { selected: string; today: string; footer: string }> = {
      primary: {
        selected: "bg-slate-900 font-semibold text-white hover:bg-slate-800",
        today: "font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100",
        footer: "text-slate-700 hover:bg-slate-100"
      },
      secondary: {
        selected: "bg-slate-700 font-semibold text-white hover:bg-slate-600",
        today: "font-semibold text-slate-800 ring-1 ring-slate-300 hover:bg-slate-100",
        footer: "text-slate-700 hover:bg-slate-100"
      },
      success: {
        selected: "bg-emerald-600 font-semibold text-white hover:bg-emerald-500",
        today: "font-semibold text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50",
        footer: "text-emerald-700 hover:bg-emerald-50"
      },
      warning: {
        selected: "bg-amber-500 font-semibold text-slate-900 hover:bg-amber-400",
        today: "font-semibold text-amber-700 ring-1 ring-amber-300 hover:bg-amber-50",
        footer: "text-amber-700 hover:bg-amber-50"
      },
      danger: {
        selected: "bg-red-600 font-semibold text-white hover:bg-red-500",
        today: "font-semibold text-red-700 ring-1 ring-red-300 hover:bg-red-50",
        footer: "text-red-700 hover:bg-red-50"
      },
      info: {
        selected: "bg-sky-600 font-semibold text-white hover:bg-sky-500",
        today: "font-semibold text-sky-700 ring-1 ring-sky-300 hover:bg-sky-50",
        footer: "text-sky-700 hover:bg-sky-50"
      },
      neutral: {
        selected: "bg-zinc-700 font-semibold text-white hover:bg-zinc-600",
        today: "font-semibold text-zinc-700 ring-1 ring-zinc-300 hover:bg-zinc-50",
        footer: "text-zinc-700 hover:bg-zinc-50"
      }
    };

    const darkIntent: Record<ArkIntent, { selected: string; today: string; footer: string }> = {
      primary: {
        selected: "bg-slate-100 font-semibold text-slate-900 hover:bg-white",
        today: "font-semibold text-slate-100 ring-1 ring-slate-500 hover:bg-slate-800",
        footer: "text-slate-200 hover:bg-slate-800"
      },
      secondary: {
        selected: "bg-slate-300 font-semibold text-slate-900 hover:bg-slate-200",
        today: "font-semibold text-slate-100 ring-1 ring-slate-500 hover:bg-slate-800",
        footer: "text-slate-200 hover:bg-slate-800"
      },
      success: {
        selected: "bg-emerald-500 font-semibold text-slate-950 hover:bg-emerald-400",
        today: "font-semibold text-emerald-300 ring-1 ring-emerald-600 hover:bg-emerald-950/40",
        footer: "text-emerald-300 hover:bg-emerald-950/40"
      },
      warning: {
        selected: "bg-amber-400 font-semibold text-slate-950 hover:bg-amber-300",
        today: "font-semibold text-amber-300 ring-1 ring-amber-600 hover:bg-amber-950/40",
        footer: "text-amber-300 hover:bg-amber-950/40"
      },
      danger: {
        selected: "bg-red-500 font-semibold text-white hover:bg-red-400",
        today: "font-semibold text-red-300 ring-1 ring-red-600 hover:bg-red-950/40",
        footer: "text-red-300 hover:bg-red-950/40"
      },
      info: {
        selected: "bg-sky-500 font-semibold text-slate-950 hover:bg-sky-400",
        today: "font-semibold text-sky-300 ring-1 ring-sky-600 hover:bg-sky-950/40",
        footer: "text-sky-300 hover:bg-sky-950/40"
      },
      neutral: {
        selected: "bg-zinc-200 font-semibold text-zinc-900 hover:bg-zinc-100",
        today: "font-semibold text-zinc-200 ring-1 ring-zinc-600 hover:bg-zinc-800",
        footer: "text-zinc-200 hover:bg-zinc-800"
      }
    };

    const surface =
      theme === "dark"
        ? {
            container: "inline-block select-none rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-sm",
            headerText: "text-sm font-semibold text-slate-100",
            navButton: "rounded p-1 text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500",
            weekdayText: "py-1 text-center text-xs font-medium text-slate-400",
            dayBase: "h-9 w-9 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-500",
            dayDisabled: "cursor-not-allowed text-slate-700",
            dayDefault: "text-slate-200 hover:bg-slate-800",
            footerSecondary: "rounded-md px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
          }
        : {
            container: "inline-block select-none rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
            headerText: "text-sm font-semibold text-slate-900",
            navButton: "rounded p-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400",
            weekdayText: "py-1 text-center text-xs font-medium text-slate-500",
            dayBase: "h-9 w-9 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400",
            dayDisabled: "cursor-not-allowed text-slate-300",
            dayDefault: "text-slate-700 hover:bg-slate-100",
            footerSecondary: "rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
          };

    const intentStyles = (theme === "dark" ? darkIntent : lightIntent)[intent];

    return {
      container: surface.container,
      headerText: surface.headerText,
      navButton: surface.navButton,
      weekdayText: surface.weekdayText,
      dayBase: surface.dayBase,
      dayDisabled: surface.dayDisabled,
      dayDefault: surface.dayDefault,
      dayToday: intentStyles.today,
      daySelected: intentStyles.selected,
      footerPrimary: `rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 ${intentStyles.footer} ${theme === "dark" ? "focus:ring-slate-500" : "focus:ring-slate-400"}`,
      footerSecondary: surface.footerSecondary
    };
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
    const theme = this.getTheme();
    const intent = this.getIntent();
    const accentColor = this.getAccentColor();
    const palette = this.getPalette(theme, intent);

    if (this.root) {
      this.root.remove();
    }

    const container = document.createElement("div");
    container.setAttribute("part", "container");
    container.className = palette.container;

    // --- Header: prev / month-year / next ---
    const header = document.createElement("div");
    header.className = "mb-3 flex items-center justify-between";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", loc.previousMonth);
    prevBtn.className = palette.navButton;
    prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    prevBtn.addEventListener("click", () => {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
      this.build();
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", loc.nextMonth);
    nextBtn.className = palette.navButton;
    nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    nextBtn.addEventListener("click", () => {
      this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
      this.build();
    });

    const title = document.createElement("span");
    title.className = palette.headerText;
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
      cell.className = palette.weekdayText;
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

        let cls = palette.dayBase;

        if (disabled) {
          cls += ` ${palette.dayDisabled}`;
        } else if (selected) {
          cls += ` ${palette.daySelected}`;
        } else if (today) {
          cls += ` ${palette.dayToday}`;
        } else {
          cls += ` ${palette.dayDefault}`;
        }

        cell.className = cls;
        if (accentColor && !disabled) {
          if (selected) {
            cell.style.backgroundColor = accentColor;
            cell.style.borderColor = accentColor;
            cell.style.color = "#ffffff";
          } else if (today) {
            cell.style.color = accentColor;
            cell.style.borderColor = accentColor;
            cell.style.borderStyle = "solid";
            cell.style.borderWidth = "1px";
          }
        }
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
    todayBtn.className = palette.footerPrimary;
    if (accentColor) {
      todayBtn.style.color = accentColor;
    }
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
    clearBtn.className = palette.footerSecondary;
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
