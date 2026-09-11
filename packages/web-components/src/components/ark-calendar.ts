import type { ArkCalendarEvent, ArkCalendarEventDisplay, ArkDatepickerLang, ArkIntent } from "@tooark/core";
import { type ArkDatepickerLocale, arkEnter, resolveLocale } from "@tooark/core";
import { intentColors } from "./intent-colors";
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
    return [
      "lang",
      "locale-json",
      "value",
      "min",
      "max",
      "theme",
      "intent",
      "accent-color",
      "events",
      "event-display",
      "testid"
    ];
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

  private eventColors(event: ArkCalendarEvent): { bg: string; fg: string } {
    return intentColors(event.intent, event.color);
  }

  /**
   * Parse seguro de datas: strings "YYYY-MM-DD" são interpretadas no fuso LOCAL.
   * `new Date("YYYY-MM-DD")` usa meia-noite UTC, o que desloca a data em um dia
   * em fusos negativos (ex.: UTC-3).
   */
  private parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    const parsed = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private getLocale(): ArkDatepickerLocale {
    const lang = (this.getAttribute("lang") || "en") as ArkDatepickerLang;
    const customJson = this.getAttribute("locale-json") || undefined;
    return resolveLocale(lang, customJson);
  }

  private getIntent(): ArkIntent {
    const intent = (this.getAttribute("intent") || "primary").toLowerCase();
    if (
      intent === "primary" ||
      intent === "secondary" ||
      intent === "success" ||
      intent === "warning" ||
      intent === "danger" ||
      intent === "info" ||
      intent === "neutral"
    ) {
      return intent;
    }
    return "primary";
  }

  private getAccentColor(): string | null {
    const accent = this.getAttribute("accent-color")?.trim();
    return accent || null;
  }

  private getPalette(intent: ArkIntent): ArkCalendarPalette {
    // Tokens semânticos (light-dark nos tokens): uma paleta única serve claro e escuro.
    const byIntent: Record<ArkIntent, { selected: string; today: string; footer: string }> = {
      primary: {
        selected: "ark:bg-primary ark:font-semibold ark:text-primary-fg ark:hover:bg-primary-hover",
        today:
          "ark:font-semibold ark:text-primary-soft-fg ark:ring-1 ark:ring-primary-border ark:hover:bg-primary-soft",
        footer: "ark:text-primary-soft-fg ark:hover:bg-primary-soft"
      },
      secondary: {
        selected: "ark:bg-secondary ark:font-semibold ark:text-secondary-fg ark:hover:bg-secondary-hover",
        today:
          "ark:font-semibold ark:text-secondary-soft-fg ark:ring-1 ark:ring-secondary-border ark:hover:bg-secondary-soft",
        footer: "ark:text-secondary-soft-fg ark:hover:bg-secondary-soft"
      },
      success: {
        selected: "ark:bg-success ark:font-semibold ark:text-success-fg ark:hover:bg-success-hover",
        today:
          "ark:font-semibold ark:text-success-soft-fg ark:ring-1 ark:ring-success-border ark:hover:bg-success-soft",
        footer: "ark:text-success-soft-fg ark:hover:bg-success-soft"
      },
      warning: {
        selected: "ark:bg-warning ark:font-semibold ark:text-warning-fg ark:hover:bg-warning-hover",
        today:
          "ark:font-semibold ark:text-warning-soft-fg ark:ring-1 ark:ring-warning-border ark:hover:bg-warning-soft",
        footer: "ark:text-warning-soft-fg ark:hover:bg-warning-soft"
      },
      danger: {
        selected: "ark:bg-danger ark:font-semibold ark:text-danger-fg ark:hover:bg-danger-hover",
        today: "ark:font-semibold ark:text-danger-soft-fg ark:ring-1 ark:ring-danger-border ark:hover:bg-danger-soft",
        footer: "ark:text-danger-soft-fg ark:hover:bg-danger-soft"
      },
      info: {
        selected: "ark:bg-info ark:font-semibold ark:text-info-fg ark:hover:bg-info-hover",
        today: "ark:font-semibold ark:text-info-soft-fg ark:ring-1 ark:ring-info-border ark:hover:bg-info-soft",
        footer: "ark:text-info-soft-fg ark:hover:bg-info-soft"
      },
      neutral: {
        selected: "ark:bg-neutral ark:font-semibold ark:text-neutral-fg ark:hover:bg-neutral-hover",
        today:
          "ark:font-semibold ark:text-neutral-soft-fg ark:ring-1 ark:ring-neutral-border ark:hover:bg-neutral-soft",
        footer: "ark:text-neutral-soft-fg ark:hover:bg-neutral-soft"
      }
    };

    const focusRing = "ark:focus:ring-ring";
    const intentStyles = byIntent[intent];

    return {
      container:
        "ark:inline-block ark:select-none ark:rounded-lg ark:border ark:border-border ark:bg-surface ark:p-4 ark:shadow-sm",
      headerText: "ark:text-sm ark:font-semibold ark:text-fg",
      navButton: `ark:rounded ark:p-1 ark:text-fg-soft ark:hover:bg-surface-muted ark:focus:outline-none ark:focus:ring-2 ${focusRing}`,
      weekdayText: "ark:py-1 ark:text-center ark:text-xs ark:font-medium ark:text-fg-muted",
      dayBase: `ark:h-9 ark:w-9 ark:rounded-md ark:text-sm ark:transition ark:focus:outline-none ark:focus:ring-2 ${focusRing}`,
      dayDisabled: "ark:cursor-not-allowed ark:text-fg-faint",
      dayDefault: "ark:text-fg-soft ark:hover:bg-surface-muted",
      dayToday: intentStyles.today,
      daySelected: intentStyles.selected,
      footerPrimary: `ark:rounded-md ark:px-3 ark:py-1 ark:text-xs ark:font-medium ark:focus:outline-none ark:focus:ring-2 ark:disabled:cursor-not-allowed ark:disabled:opacity-50 ${intentStyles.footer} ${focusRing}`,
      footerSecondary: `ark:rounded-md ark:px-3 ark:py-1 ark:text-xs ark:font-medium ark:text-fg-muted ark:hover:bg-surface-muted ark:focus:outline-none ark:focus:ring-2 ${focusRing}`,
      focusRing
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
    this.dispatchEvent(
      new CustomEvent("ark-change", { detail: { value: iso, date, events }, bubbles: true, composed: true })
    );
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
    const sameMonth =
      date.getFullYear() === this.viewDate.getFullYear() && date.getMonth() === this.viewDate.getMonth();

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
      case "ArrowLeft":
        next = move(-1);
        break;
      case "ArrowRight":
        next = move(1);
        break;
      case "ArrowUp":
        next = move(-7);
        break;
      case "ArrowDown":
        next = move(7);
        break;
      case "Home":
        next = new Date(current.getFullYear(), current.getMonth(), 1);
        break;
      case "End":
        next = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        break;
      case "PageUp":
        next = this.addMonths(current, -1);
        break;
      case "PageDown":
        next = this.addMonths(current, 1);
        break;
      default:
        return;
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
    grid.className = "ark:grid ark:grid-cols-3 ark:gap-1";
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

      const isSelected =
        this.selectedDate !== null && this.selectedDate.getFullYear() === year && this.selectedDate.getMonth() === m;
      const isCurrent = now.getFullYear() === year && now.getMonth() === m;
      const state = isSelected ? palette.daySelected : isCurrent ? palette.dayToday : palette.dayDefault;
      button.className = `ark:rounded-md ark:px-2 ark:py-3 ark:text-sm ark:transition ark:focus:outline-none ark:focus:ring-2 ${palette.focusRing} ${state}`;

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
    grid.className = "ark:grid ark:grid-cols-3 ark:gap-1";
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
      button.className = `ark:rounded-md ark:px-2 ark:py-3 ark:text-sm ark:transition ark:focus:outline-none ark:focus:ring-2 ${palette.focusRing} ${state}`;

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
    const intent = this.getIntent();
    const accentColor = this.getAccentColor();
    const palette = this.getPalette(intent);
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
    container.className =
      eventDisplay === "list" ? `${palette.container} ark:w-full ark:min-w-[30rem]` : palette.container;
    applyTestHooks(this, "calendar", container);

    // --- Header: prev / título (alterna view) / next ---
    const header = document.createElement("div");
    header.className = "ark:mb-3 ark:flex ark:items-center ark:justify-between";

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
    title.className = `${palette.headerText} ark:rounded ark:px-2 ark:py-0.5 ark:transition ark:hover:opacity-75 ark:focus:outline-none ark:focus:ring-2 ${palette.focusRing}`;
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
    weekRow.className = "ark:mb-1 ark:grid ark:grid-cols-7 ark:gap-0";

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
    grid.className =
      eventDisplay === "list" ? "ark:grid ark:grid-cols-7 ark:gap-1" : "ark:grid ark:grid-cols-7 ark:gap-0";
    applyTestHooks(this, "calendar", grid, "grid");
    grid.addEventListener("keydown", this.handleGridKeydown);

    // Roving tabindex: só um dia participa da ordem de Tab; setas movem o foco.
    const selectedInView =
      this.selectedDate && this.selectedDate.getFullYear() === year && this.selectedDate.getMonth() === month
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
          filler.className = eventDisplay === "list" ? "ark:min-h-16 ark:w-full" : "ark:h-9 ark:w-9";
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
          cell.className = `ark:relative ark:flex ark:min-h-16 ark:w-full ark:flex-col ark:items-stretch ark:gap-0.5 ark:rounded-md ark:p-1 ark:text-left ark:text-xs ark:transition ark:focus:outline-none ark:focus:ring-2 ${palette.focusRing} ${stateCls}`;

          const number = document.createElement("span");
          number.className = "ark:px-0.5 ark:font-medium";
          number.textContent = String(dayIndex);
          cell.appendChild(number);

          const maxChips = 2;
          for (const event of dayEvents.slice(0, maxChips)) {
            const chip = document.createElement("span");
            chip.className = "ark:truncate ark:rounded ark:px-1 ark:py-0.5 ark:text-[10px] ark:font-medium";
            const chipColors = this.eventColors(event);
            chip.style.backgroundColor = chipColors.bg;
            chip.style.color = chipColors.fg;
            chip.textContent = event.label || "•";
            applyTestHooks(this, "calendar", chip, "event");
            cell.appendChild(chip);
          }
          if (dayEvents.length > maxChips) {
            const more = document.createElement("span");
            more.className = "ark:px-0.5 ark:text-[10px] ark:text-fg-muted";
            more.textContent = `+${dayEvents.length - maxChips}`;
            applyTestHooks(this, "calendar", more, "event-more");
            cell.appendChild(more);
          }
        } else {
          cell.className = `ark:relative ${palette.dayBase} ${stateCls}`;
          cell.textContent = String(dayIndex);

          if (dayEvents.length > 0 && eventDisplay === "dots") {
            const dots = document.createElement("span");
            dots.className =
              "ark:pointer-events-none ark:absolute ark:bottom-0.5 ark:left-1/2 ark:flex ark:-translate-x-1/2 ark:gap-0.5";
            applyTestHooks(this, "calendar", dots, "event");
            for (const event of dayEvents.slice(0, 3)) {
              const dot = document.createElement("span");
              dot.className = "ark:h-1 ark:w-1 ark:rounded-full";
              dot.style.backgroundColor = this.eventColors(event).bg;
              dots.appendChild(dot);
            }
            cell.appendChild(dots);
          }

          if (dayEvents.length > 0 && eventDisplay === "count") {
            const badge = document.createElement("span");
            badge.className =
              "ark:pointer-events-none ark:absolute ark:-right-1 ark:-top-1 ark:flex ark:h-3.5 ark:min-w-3.5 ark:items-center ark:justify-center ark:rounded-full ark:px-0.5 ark:text-[9px] ark:font-semibold";
            const badgeColors = this.eventColors(dayEvents[0]);
            badge.style.backgroundColor = badgeColors.bg;
            badge.style.color = badgeColors.fg;
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
    footer.className = "ark:mt-3 ark:flex ark:items-center ark:justify-between ark:gap-2";

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
      this.dispatchEvent(
        new CustomEvent("ark-change", {
          detail: { value: null, date: null, events: [] },
          bubbles: true,
          composed: true
        })
      );
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
