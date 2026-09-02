import "../styles/tailwind.css";
import { arkEnter, resolveLocale, type ArkDatepickerLocale } from "@tooark/core";
import type { ArkCalendarEvent, ArkCalendarEventDisplay, ArkDatepickerLang, ArkIntent, ArkThemeSelected } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

type ArkCalendarPalette = {
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
  focusRing: string;
};

type ArkCalendarView = "days" | "months" | "years";

// Cores dos marcadores de evento por intent (quando o evento não traz `color`).
const EVENT_INTENT_HEX: Record<ArkIntent, string> = {
  primary: "#0f172a",
  secondary: "#475569",
  success: "#059669",
  warning: "#f59e0b",
  danger: "#dc2626",
  info: "#0284c7",
  neutral: "#3f3f46"
};

/**
 * Grid de mês inline para seleção de data — equivalente ao DateCalendar do MUI.
 * Título clicável alterna as views dias → meses → anos. Suporta marcadores de
 * eventos por dia (`events` + `event-display`). O ark-datepicker embute este
 * componente (modo inline e no popup do modo input).
 */
export class ArkCalendar extends HTMLElement {
  static readonly tagName = "ark-calendar";

  private root: HTMLDivElement | null = null;
  private viewDate: Date = new Date();
  private selectedDate: Date | null = null;
  private locale: ArkDatepickerLocale | null = null;
  private syncingValue = false;
  private pendingFocusISO: string | null = null;
  private view: ArkCalendarView = "days";
  private eventsProp: ArkCalendarEvent[] | null = null;
  // Direção da navegação de mês por clique nas setas: dirige o slide do grid.
  private navDirection: "prev" | "next" | null = null;
  // Última seleção feita pelo usuário: recebe um "pop" de entrada.
  private justSelectedISO: string | null = null;

  static get observedAttributes(): string[] {
    return ["lang", "locale-json", "value", "min", "max", "theme", "intent", "accent-color", "events", "event-display", "testid"];
  }

  connectedCallback(): void {
    this.locale = this.getLocale();
    const parsed = this.parseDate(this.getAttribute("value"));
    if (parsed) {
      this.selectedDate = parsed;
      this.viewDate = new Date(parsed);
    }
    this.build();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    // Mudança de "value" originada de interação interna: o estado já está atualizado.
    if (this.syncingValue && name === "value") return;

    if (name === "lang" || name === "locale-json") {
      this.locale = this.getLocale();
    }
    if (name === "value") {
      const parsed = this.parseDate(newValue);
      if (parsed) {
        this.selectedDate = parsed;
        this.viewDate = new Date(parsed);
      } else {
        this.selectedDate = null;
      }
    }
    if (this.root) this.build();
  }

  /** Lista de eventos (propriedade JS; tem precedência sobre o atributo `events`). */
  get events(): ArkCalendarEvent[] {
    return this.eventsProp ?? this.parseEventsAttr();
  }

  set events(list: ArkCalendarEvent[]) {
    this.eventsProp = Array.isArray(list) ? list : null;
    if (this.root) this.build();
  }

  private parseEventsAttr(): ArkCalendarEvent[] {
    const raw = this.getAttribute("events");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private getEventDisplay(): ArkCalendarEventDisplay {
    const display = (this.getAttribute("event-display") || "dots").toLowerCase();
    return display === "count" || display === "list" ? display : "dots";
  }

  private eventsByDay(): Map<string, ArkCalendarEvent[]> {
    const map = new Map<string, ArkCalendarEvent[]>();
    for (const event of this.events) {
      if (!event || typeof event.date !== "string") continue;
      const key = event.date.slice(0, 10);
      const list = map.get(key) || [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }

  private eventColor(event: ArkCalendarEvent): string {
    if (event.color) return event.color;
    const intent = (event.intent || "").toLowerCase() as ArkIntent;
    return EVENT_INTENT_HEX[intent] || EVENT_INTENT_HEX.primary;
  }

  /**
   * Parse seguro de datas: strings "YYYY-MM-DD" são interpretadas no fuso LOCAL.
   * `new Date("YYYY-MM-DD")` usa meia-noite UTC, o que desloca a data em um dia
   * em fusos negativos (ex.: UTC-3).
   */
  private parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    const parsed = match
      ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
      : new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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

  private getPalette(theme: ArkThemeSelected, intent: ArkIntent): ArkCalendarPalette {
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
            footerSecondary: "rounded-md px-3 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500",
            focusRing: "focus:ring-slate-500"
          }
        : {
            container: "inline-block select-none rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
            headerText: "text-sm font-semibold text-slate-900",
            navButton: "rounded p-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400",
            weekdayText: "py-1 text-center text-xs font-medium text-slate-500",
            dayBase: "h-9 w-9 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400",
            dayDisabled: "cursor-not-allowed text-slate-300",
            dayDefault: "text-slate-700 hover:bg-slate-100",
            footerSecondary: "rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400",
            focusRing: "focus:ring-slate-400"
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
      footerPrimary: `rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${intentStyles.footer} ${surface.focusRing}`,
      footerSecondary: surface.footerSecondary,
      focusRing: surface.focusRing
    };
  }

  private getMinDate(): Date | null {
    return this.parseDate(this.getAttribute("min"));
  }

  private getMaxDate(): Date | null {
    return this.parseDate(this.getAttribute("max"));
  }

  private isDateDisabled(date: Date): boolean {
    const day = this.startOfDay(date);
    const min = this.getMinDate();
    const max = this.getMaxDate();
    if (min && day < this.startOfDay(min)) return true;
    if (max && day > this.startOfDay(max)) return true;
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

  // Caminho único de seleção usado pelo clique no dia e pelo botão "Hoje".
  private selectDate(date: Date): void {
    const iso = this.formatISO(date);
    this.selectedDate = date;
    this.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);

    this.syncingValue = true;
    this.setAttribute("value", iso);
    this.syncingValue = false;

    const events = this.eventsByDay().get(iso) || [];
    this.dispatchEvent(new CustomEvent("ark-change", { detail: { value: iso, date, events }, bubbles: true, composed: true }));
    this.pendingFocusISO = iso;
    this.justSelectedISO = iso;
    this.build();
  }

  private addMonths(date: Date, delta: number): Date {
    const target = new Date(date.getFullYear(), date.getMonth() + delta, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
  }

  private focusDay(date: Date): void {
    const iso = this.formatISO(date);
    const sameMonth = date.getFullYear() === this.viewDate.getFullYear() && date.getMonth() === this.viewDate.getMonth();

    if (!sameMonth) {
      this.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
      this.pendingFocusISO = iso;
      // Troca de mês via teclado: sem animação, para não atrasar o foco.
      this.build();
      return;
    }

    this.root?.querySelector<HTMLElement>(`[data-date="${iso}"]`)?.focus();
  }

  // Navegação por teclado no grid (padrão WAI-ARIA de grade de datas).
  private readonly handleGridKeydown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;
    const current = this.parseDate(target?.getAttribute("data-date"));
    if (!current) return;

    const move = (days: number): Date => new Date(current.getFullYear(), current.getMonth(), current.getDate() + days);
    let next: Date;

    switch (event.key) {
      case "ArrowLeft": next = move(-1); break;
      case "ArrowRight": next = move(1); break;
      case "ArrowUp": next = move(-7); break;
      case "ArrowDown": next = move(7); break;
      case "Home": next = new Date(current.getFullYear(), current.getMonth(), 1); break;
      case "End": next = new Date(current.getFullYear(), current.getMonth() + 1, 0); break;
      case "PageUp": next = this.addMonths(current, -1); break;
      case "PageDown": next = this.addMonths(current, 1); break;
      default: return;
    }

    event.preventDefault();
    this.focusDay(next);
  };

  private yearsBlockStart(): number {
    const year = this.viewDate.getFullYear();
    return year - (year % 12);
  }

  private buildMonthsGrid(palette: ArkCalendarPalette, loc: ArkDatepickerLocale): HTMLDivElement {
    const grid = document.createElement("div");
    grid.className = "grid grid-cols-3 gap-1";
    applyTestHooks(this, "calendar", grid, "months");

    const year = this.viewDate.getFullYear();
    const now = new Date();

    for (let m = 0; m < 12; m++) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = loc.monthsShort[m];
      button.setAttribute("data-month", String(m));
      button.setAttribute("aria-label", `${loc.months[m]} ${year}`);
      applyTestHooks(this, "calendar", button, "month");

      const isSelected = this.selectedDate !== null && this.selectedDate.getFullYear() === year && this.selectedDate.getMonth() === m;
      const isCurrent = now.getFullYear() === year && now.getMonth() === m;
      const state = isSelected ? palette.daySelected : isCurrent ? palette.dayToday : palette.dayDefault;
      button.className = `rounded-md px-2 py-3 text-sm transition focus:outline-none focus:ring-2 ${palette.focusRing} ${state}`;

      button.addEventListener("click", () => {
        this.viewDate = new Date(year, m, 1);
        this.view = "days";
        this.build();
      });

      grid.appendChild(button);
    }

    return grid;
  }

  private buildYearsGrid(palette: ArkCalendarPalette): HTMLDivElement {
    const grid = document.createElement("div");
    grid.className = "grid grid-cols-3 gap-1";
    applyTestHooks(this, "calendar", grid, "years");

    const start = this.yearsBlockStart();
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const year = start + i;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(year);
      button.setAttribute("data-year", String(year));
      applyTestHooks(this, "calendar", button, "year");

      const isSelected = this.selectedDate !== null && this.selectedDate.getFullYear() === year;
      const isCurrent = now.getFullYear() === year;
      const state = isSelected ? palette.daySelected : isCurrent ? palette.dayToday : palette.dayDefault;
      button.className = `rounded-md px-2 py-3 text-sm transition focus:outline-none focus:ring-2 ${palette.focusRing} ${state}`;

      button.addEventListener("click", () => {
        this.viewDate = new Date(year, this.viewDate.getMonth(), 1);
        this.view = "months";
        this.build();
      });

      grid.appendChild(button);
    }

    return grid;
  }

  private build(): void {
    if (!this.locale) this.locale = this.getLocale();
    const loc = this.locale;
    const theme = this.getTheme();
    const intent = this.getIntent();
    const accentColor = this.getAccentColor();
    const palette = this.getPalette(theme, intent);
    const eventDisplay = this.getEventDisplay();
    const eventsMap = this.eventsByDay();

    // O rebuild destrói o DOM: guarda onde o foco estava para restaurá-lo depois.
    const active = typeof document !== "undefined" ? document.activeElement : null;
    let restoreSelector: string | null = null;
    if (this.pendingFocusISO) {
      restoreSelector = `[data-date="${this.pendingFocusISO}"]`;
      this.pendingFocusISO = null;
    } else if (active instanceof HTMLElement && this.contains(active)) {
      const activeDate = active.getAttribute("data-date");
      const activeArk = active.getAttribute("data-ark");
      restoreSelector = activeDate ? `[data-date="${activeDate}"]` : activeArk ? `[data-ark="${activeArk}"]` : null;
    }

    if (this.root) {
      this.root.remove();
    }

    const container = document.createElement("div");
    container.setAttribute("part", "container");
    container.className = eventDisplay === "list" ? `${palette.container} w-full min-w-[30rem]` : palette.container;
    applyTestHooks(this, "calendar", container);

    // --- Header: prev / título (alterna view) / next ---
    const header = document.createElement("div");
    header.className = "mb-3 flex items-center justify-between";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    applyTestHooks(this, "calendar", prevBtn, "prev");
    prevBtn.setAttribute("aria-label", loc.previousMonth);
    prevBtn.className = palette.navButton;
    prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    prevBtn.addEventListener("click", () => {
      if (this.view === "days") {
        this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
        this.navDirection = "prev";
      } else if (this.view === "months") {
        this.viewDate = new Date(this.viewDate.getFullYear() - 1, this.viewDate.getMonth(), 1);
      } else {
        this.viewDate = new Date(this.viewDate.getFullYear() - 12, this.viewDate.getMonth(), 1);
      }
      this.build();
    });

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    applyTestHooks(this, "calendar", nextBtn, "next");
    nextBtn.setAttribute("aria-label", loc.nextMonth);
    nextBtn.className = palette.navButton;
    nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    nextBtn.addEventListener("click", () => {
      if (this.view === "days") {
        this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
        this.navDirection = "next";
      } else if (this.view === "months") {
        this.viewDate = new Date(this.viewDate.getFullYear() + 1, this.viewDate.getMonth(), 1);
      } else {
        this.viewDate = new Date(this.viewDate.getFullYear() + 12, this.viewDate.getMonth(), 1);
      }
      this.build();
    });

    // Título clicável: dias → meses → anos → dias.
    const title = document.createElement("button");
    title.type = "button";
    title.className = `${palette.headerText} rounded px-2 py-0.5 transition hover:opacity-75 focus:outline-none focus:ring-2 ${palette.focusRing}`;
    applyTestHooks(this, "calendar", title, "title");
    title.setAttribute("aria-live", "polite");
    if (this.view === "days") {
      title.textContent = `${loc.months[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
    } else if (this.view === "months") {
      title.textContent = String(this.viewDate.getFullYear());
    } else {
      const start = this.yearsBlockStart();
      title.textContent = `${start}–${start + 11}`;
    }
    title.addEventListener("click", () => {
      this.view = this.view === "days" ? "months" : this.view === "months" ? "years" : "days";
      this.build();
    });

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    container.appendChild(header);

    // --- Views de meses/anos ---
    if (this.view === "months") {
      container.appendChild(this.buildMonthsGrid(palette, loc));
      this.appendChild(container);
      this.root = container;
      return;
    }

    if (this.view === "years") {
      container.appendChild(this.buildYearsGrid(palette));
      this.appendChild(container);
      this.root = container;
      return;
    }

    // --- Weekday header ---
    const weekRow = document.createElement("div");
    weekRow.className = "mb-1 grid grid-cols-7 gap-0";

    const fdow = loc.firstDayOfWeek;
    for (let i = 0; i < 7; i++) {
      const idx = (fdow + i) % 7;
      const cell = document.createElement("div");
      cell.className = palette.weekdayText;
      cell.setAttribute("title", loc.weekdays[idx]);
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
    grid.className = eventDisplay === "list" ? "grid grid-cols-7 gap-1" : "grid grid-cols-7 gap-0";
    applyTestHooks(this, "calendar", grid, "grid");
    grid.addEventListener("keydown", this.handleGridKeydown);

    // Roving tabindex: só um dia participa da ordem de Tab; setas movem o foco.
    const selectedInView = this.selectedDate && this.selectedDate.getFullYear() === year && this.selectedDate.getMonth() === month
      ? this.selectedDate
      : null;
    const now = new Date();
    const todayInView = now.getFullYear() === year && now.getMonth() === month ? now : null;
    const tabStopISO = this.formatISO(selectedInView || todayInView || firstOfMonth);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 7; c++) {
        const dayIndex = r * 7 + c - startDay + 1;

        if (dayIndex < 1 || dayIndex > lastOfMonth.getDate()) {
          const filler = document.createElement("div");
          filler.className = eventDisplay === "list" ? "min-h-16 w-full" : "h-9 w-9";
          filler.setAttribute("aria-hidden", "true");
          grid.appendChild(filler);
          continue;
        }

        const cell = document.createElement("button");
        cell.type = "button";

        const cellDate = new Date(year, month, dayIndex);
        const iso = this.formatISO(cellDate);
        const dayEvents = eventsMap.get(iso) || [];
        const disabled = this.isDateDisabled(cellDate);
        const selected = this.selectedDate ? this.isSameDay(cellDate, this.selectedDate) : false;
        const today = this.isToday(cellDate);

        const stateCls = disabled
          ? palette.dayDisabled
          : selected
            ? palette.daySelected
            : today
              ? palette.dayToday
              : palette.dayDefault;

        if (eventDisplay === "list") {
          cell.className = `relative flex min-h-16 w-full flex-col items-stretch gap-0.5 rounded-md p-1 text-left text-xs transition focus:outline-none focus:ring-2 ${palette.focusRing} ${stateCls}`;

          const number = document.createElement("span");
          number.className = "px-0.5 font-medium";
          number.textContent = String(dayIndex);
          cell.appendChild(number);

          const maxChips = 2;
          for (const event of dayEvents.slice(0, maxChips)) {
            const chip = document.createElement("span");
            chip.className = "truncate rounded px-1 py-0.5 text-[10px] font-medium text-white";
            chip.style.backgroundColor = this.eventColor(event);
            chip.textContent = event.label || "•";
            applyTestHooks(this, "calendar", chip, "event");
            cell.appendChild(chip);
          }
          if (dayEvents.length > maxChips) {
            const more = document.createElement("span");
            more.className = `px-0.5 text-[10px] ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`;
            more.textContent = `+${dayEvents.length - maxChips}`;
            applyTestHooks(this, "calendar", more, "event-more");
            cell.appendChild(more);
          }
        } else {
          cell.className = `relative ${palette.dayBase} ${stateCls}`;
          cell.textContent = String(dayIndex);

          if (dayEvents.length > 0 && eventDisplay === "dots") {
            const dots = document.createElement("span");
            dots.className = "pointer-events-none absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5";
            applyTestHooks(this, "calendar", dots, "event");
            for (const event of dayEvents.slice(0, 3)) {
              const dot = document.createElement("span");
              dot.className = "h-1 w-1 rounded-full";
              dot.style.backgroundColor = this.eventColor(event);
              dots.appendChild(dot);
            }
            cell.appendChild(dots);
          }

          if (dayEvents.length > 0 && eventDisplay === "count") {
            const badge = document.createElement("span");
            badge.className = "pointer-events-none absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[9px] font-semibold text-white";
            badge.style.backgroundColor = this.eventColor(dayEvents[0]);
            badge.textContent = String(dayEvents.length);
            applyTestHooks(this, "calendar", badge, "event");
            cell.appendChild(badge);
          }
        }

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
        cell.disabled = disabled;
        cell.tabIndex = iso === tabStopISO ? 0 : -1;
        const eventsSuffix = dayEvents.length > 0 ? `, ${dayEvents.length} ${loc.events}` : "";
        cell.setAttribute("aria-label", `${dayIndex} ${loc.months[month]} ${year}${eventsSuffix}`);
        cell.setAttribute("aria-pressed", selected ? "true" : "false");
        if (today) cell.setAttribute("aria-current", "date");
        // data-date permite selecionar um dia específico no e2e sem depender do texto.
        applyTestHooks(this, "calendar", cell, "day");
        cell.setAttribute("data-date", iso);

        if (!disabled) {
          cell.addEventListener("click", () => this.selectDate(cellDate));
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
    applyTestHooks(this, "calendar", todayBtn, "today");
    if (accentColor) {
      todayBtn.style.color = accentColor;
    }
    todayBtn.textContent = loc.today;
    todayBtn.disabled = this.isDateDisabled(new Date());
    todayBtn.addEventListener("click", () => this.selectDate(this.startOfDay(new Date())));

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = palette.footerSecondary;
    applyTestHooks(this, "calendar", clearBtn, "clear");
    clearBtn.textContent = loc.clear;
    clearBtn.addEventListener("click", () => {
      this.selectedDate = null;
      this.syncingValue = true;
      this.removeAttribute("value");
      this.syncingValue = false;
      this.dispatchEvent(new CustomEvent("ark-change", { detail: { value: null, date: null, events: [] }, bubbles: true, composed: true }));
      this.build();
    });

    footer.appendChild(todayBtn);
    footer.appendChild(clearBtn);
    container.appendChild(footer);

    this.appendChild(container);
    this.root = container;

    if (restoreSelector) {
      container.querySelector<HTMLElement>(restoreSelector)?.focus();
    }

    // Motion (respeita prefers-reduced-motion via tokens: duração cai a zero).
    // Slide direcional do grid só na navegação por clique nas setas — a troca de
    // mês via teclado é instantânea para não atrasar o movimento do foco.
    if (this.navDirection) {
      arkEnter(grid, this.navDirection === "next" ? "slide-left" : "slide-right", { duration: "fast" });
      this.navDirection = null;
    }

    // "Pop" sutil no dia que o usuário acabou de selecionar.
    if (this.justSelectedISO) {
      const selectedCell = container.querySelector<HTMLElement>(`[data-date="${this.justSelectedISO}"]`);
      if (selectedCell) {
        arkEnter(selectedCell, "scale", { duration: "fast" });
      }
      this.justSelectedISO = null;
    }
  }
}

export default ArkCalendar;
