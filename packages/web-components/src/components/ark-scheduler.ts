import "../styles/tailwind.css";
import { arkEnter, resolveLocale, type ArkDatepickerLocale } from "@tooark/core";
import type { ArkDatepickerLang, ArkIntent, ArkSchedulerEvent, ArkSchedulerView, ArkThemeSelected } from "@tooark/core";
import {
  addDays,
  addMonths,
  formatISODate,
  formatISODateTime,
  isSameDay,
  minutesSinceMidnight,
  pad2,
  parseLocalDate,
  parseLocalDateTime,
  startOfDay,
  startOfWeek
} from "./date-utils";
import { applyTestHooks } from "./test-hooks";

type ArkSchedulerPalette = {
  container: string;
  headerText: string;
  navButton: string;
  mutedText: string;
  gridLine: string;
  columnBorder: string;
  slotHover: string;
  todayColumn: string;
  monthCellBase: string;
  monthCellMuted: string;
  agendaRow: string;
};

type PlacedEvent = {
  event: ArkSchedulerEvent;
  start: Date;
  end: Date;
  column: number;
  columns: number;
};

// Cores dos eventos por intent (quando o evento não traz `color`).
const EVENT_INTENT_HEX: Record<ArkIntent, string> = {
  primary: "#0f172a",
  secondary: "#475569",
  success: "#059669",
  warning: "#f59e0b",
  danger: "#dc2626",
  info: "#0284c7",
  neutral: "#3f3f46"
};

const HOUR_HEIGHT_PX = 48;
const DEFAULT_EVENT_MINUTES = 60;

/**
 * Agenda/scheduler: exibe eventos em quatro views — `week` e `day` com timeline
 * por horário (eventos posicionados e sobreposições resolvidas em colunas),
 * `month` em grid com chips por dia e `agenda` como lista cronológica.
 *
 * Diferente do ark-calendar (que é uma superfície de SELEÇÃO de data), aqui os
 * eventos são o conteúdo: clicar num evento emite `ark-event-click` e clicar num
 * espaço livre emite `ark-slot-click` (útil para criar um evento).
 */
export class ArkScheduler extends HTMLElement {
  static readonly tagName = "ark-scheduler";

  private root: HTMLDivElement | null = null;
  private locale: ArkDatepickerLocale | null = null;
  private eventsProp: ArkSchedulerEvent[] | null = null;
  private refDate: Date = new Date();
  private nowTimer: number | null = null;
  private navDirection: "prev" | "next" | null = null;
  private syncingAttr = false;
  // Linhas de "agora" vivas na tela: reposicionadas sem rebuild a cada minuto.
  private nowLines: HTMLElement[] = [];
  private scrollerEl: HTMLDivElement | null = null;
  // Identifica view + período: se não mudou, o rebuild preserva o scroll do usuário.
  private lastRenderKey = "";
  private lastScrollTop = 0;

  static get observedAttributes(): string[] {
    return ["view", "date", "events", "lang", "locale-json", "theme", "intent", "hour-start", "hour-end", "slot-minutes", "hours-format", "views", "testid"];
  }

  connectedCallback(): void {
    this.locale = this.getLocale();
    this.refDate = parseLocalDate(this.getAttribute("date")) || new Date();
    this.build();
    // A linha de "agora" só precisa acompanhar o relógio de minuto em minuto.
    this.nowTimer = window.setInterval(() => this.updateNowIndicator(), 60_000);
  }

  disconnectedCallback(): void {
    if (this.nowTimer !== null) {
      window.clearInterval(this.nowTimer);
      this.nowTimer = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.root) return;
    if (this.syncingAttr) return;

    if (name === "lang" || name === "locale-json") {
      this.locale = this.getLocale();
    }
    if (name === "date") {
      this.refDate = parseLocalDate(newValue) || new Date();
    }
    this.build();
  }

  /** Lista de eventos (propriedade JS; tem precedência sobre o atributo `events`). */
  get events(): ArkSchedulerEvent[] {
    return this.eventsProp ?? this.parseEventsAttr();
  }

  set events(list: ArkSchedulerEvent[]) {
    this.eventsProp = Array.isArray(list) ? list : null;
    if (this.root) this.build();
  }

  /** View atual. */
  get view(): ArkSchedulerView {
    const view = (this.getAttribute("view") || "week").toLowerCase();
    return view === "day" || view === "month" || view === "agenda" ? view : "week";
  }

  set view(next: ArkSchedulerView) {
    this.setAttribute("view", next);
  }

  /** Data de referência da view atual (ISO YYYY-MM-DD). */
  get date(): string {
    return formatISODate(this.refDate);
  }

  private parseEventsAttr(): ArkSchedulerEvent[] {
    const raw = this.getAttribute("events");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
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

  private getHourRange(): { start: number; end: number } {
    const rawStart = Number(this.getAttribute("hour-start") ?? "0");
    const rawEnd = Number(this.getAttribute("hour-end") ?? "24");
    const start = Number.isFinite(rawStart) ? Math.min(23, Math.max(0, Math.floor(rawStart))) : 0;
    const end = Number.isFinite(rawEnd) ? Math.min(24, Math.max(start + 1, Math.floor(rawEnd))) : 24;
    return { start, end };
  }

  private getSlotMinutes(): number {
    const parsed = Number(this.getAttribute("slot-minutes") ?? "60");
    if (!Number.isFinite(parsed)) return 60;
    return Math.min(60, Math.max(15, Math.floor(parsed)));
  }

  private getAvailableViews(): ArkSchedulerView[] {
    const raw = this.getAttribute("views");
    if (!raw) return ["day", "week", "month", "agenda"];
    const parsed = raw
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter((value): value is ArkSchedulerView => value === "day" || value === "week" || value === "month" || value === "agenda");
    return parsed.length > 0 ? parsed : ["day", "week", "month", "agenda"];
  }

  private formatHour(hour: number, minute = 0): string {
    if (this.getAttribute("hours-format") === "12") {
      const suffix = hour < 12 ? "AM" : "PM";
      const base = hour % 12 === 0 ? 12 : hour % 12;
      return minute === 0 ? `${base} ${suffix}` : `${base}:${pad2(minute)} ${suffix}`;
    }
    return `${pad2(hour)}:${pad2(minute)}`;
  }

  private eventColor(event: ArkSchedulerEvent): string {
    if (event.color) return event.color;
    const intent = (event.intent || "").toLowerCase() as ArkIntent;
    return EVENT_INTENT_HEX[intent] || EVENT_INTENT_HEX[this.getIntent()];
  }

  private eventStart(event: ArkSchedulerEvent): Date | null {
    return event.allDay ? parseLocalDate(event.start) : parseLocalDateTime(event.start);
  }

  private eventEnd(event: ArkSchedulerEvent, start: Date): Date {
    const parsed = event.allDay ? parseLocalDate(event.end) : parseLocalDateTime(event.end);
    if (!parsed || parsed <= start) {
      return event.allDay ? start : new Date(start.getTime() + DEFAULT_EVENT_MINUTES * 60_000);
    }
    return parsed;
  }

  private eventsForDay(day: Date, allDay: boolean): ArkSchedulerEvent[] {
    return this.events
      .filter((event) => {
        if (!event || typeof event.start !== "string") return false;
        if (Boolean(event.allDay) !== allDay) return false;
        const start = this.eventStart(event);
        if (!start) return false;
        if (!allDay) return isSameDay(start, day);
        // Eventos de dia inteiro podem cobrir um intervalo de dias.
        const end = this.eventEnd(event, start);
        return startOfDay(day) >= startOfDay(start) && startOfDay(day) <= startOfDay(end);
      })
      .sort((a, b) => (this.eventStart(a)!.getTime() - this.eventStart(b)!.getTime()));
  }

  /**
   * Resolve sobreposições: agrupa eventos que se cruzam em clusters e distribui
   * cada cluster em colunas lado a lado (padrão de agenda do Google/MUI).
   */
  private placeEvents(events: ArkSchedulerEvent[]): PlacedEvent[] {
    const placed: PlacedEvent[] = [];
    let cluster: PlacedEvent[] = [];
    let clusterEnd: number | null = null;

    const flush = (): void => {
      const columns = cluster.reduce((max, item) => Math.max(max, item.column + 1), 0);
      for (const item of cluster) {
        item.columns = columns;
      }
      placed.push(...cluster);
      cluster = [];
      clusterEnd = null;
    };

    // Fim da última ocorrência em cada coluna do cluster corrente.
    let columnEnds: number[] = [];

    for (const event of events) {
      const start = this.eventStart(event);
      if (!start) continue;
      const end = this.eventEnd(event, start);

      if (clusterEnd !== null && start.getTime() >= clusterEnd) {
        flush();
        columnEnds = [];
      }

      let column = columnEnds.findIndex((columnEnd) => columnEnd <= start.getTime());
      if (column === -1) {
        column = columnEnds.length;
      }
      columnEnds[column] = end.getTime();

      cluster.push({ event, start, end, column, columns: 1 });
      clusterEnd = Math.max(clusterEnd ?? 0, end.getTime());
    }

    if (cluster.length > 0) flush();
    return placed;
  }

  private getPalette(theme: ArkThemeSelected): ArkSchedulerPalette {
    if (theme === "dark") {
      return {
        container: "flex w-full flex-col rounded-lg border border-slate-700 bg-slate-900 text-slate-100 shadow-sm",
        headerText: "text-sm font-semibold text-slate-100",
        navButton: "rounded-md border border-slate-600 p-1 text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500",
        mutedText: "text-slate-400",
        gridLine: "border-slate-800",
        columnBorder: "border-slate-800",
        slotHover: "hover:bg-slate-800/60",
        todayColumn: "bg-slate-800/40",
        monthCellBase: "bg-slate-900 text-slate-200",
        monthCellMuted: "bg-slate-950/40 text-slate-600",
        agendaRow: "border-slate-800"
      };
    }

    return {
      container: "flex w-full flex-col rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm",
      headerText: "text-sm font-semibold text-slate-900",
      navButton: "rounded-md border border-slate-300 p-1 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400",
      mutedText: "text-slate-500",
      gridLine: "border-slate-200",
      columnBorder: "border-slate-200",
      slotHover: "hover:bg-slate-50",
      todayColumn: "bg-slate-50",
      monthCellBase: "bg-white text-slate-700",
      monthCellMuted: "bg-slate-50 text-slate-400",
      agendaRow: "border-slate-200"
    };
  }

  // --- Período visível conforme a view ---

  private getRange(): { start: Date; end: Date; days: Date[] } {
    const loc = this.locale ?? this.getLocale();
    const view = this.view;

    if (view === "day") {
      const start = startOfDay(this.refDate);
      return { start, end: start, days: [start] };
    }

    if (view === "week") {
      const start = startOfWeek(this.refDate, loc.firstDayOfWeek);
      const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      return { start, end: days[6], days };
    }

    // month e agenda operam sobre o mês inteiro.
    const start = new Date(this.refDate.getFullYear(), this.refDate.getMonth(), 1);
    const end = new Date(this.refDate.getFullYear(), this.refDate.getMonth() + 1, 0);
    const days = Array.from({ length: end.getDate() }, (_, i) => new Date(start.getFullYear(), start.getMonth(), i + 1));
    return { start, end, days };
  }

  private getTitle(): string {
    const loc = this.locale ?? this.getLocale();
    const view = this.view;
    const { start, end } = this.getRange();

    if (view === "day") {
      return `${loc.weekdays[start.getDay()]}, ${start.getDate()} ${loc.months[start.getMonth()]} ${start.getFullYear()}`;
    }

    if (view === "week") {
      const sameMonth = start.getMonth() === end.getMonth();
      const left = sameMonth ? `${start.getDate()}` : `${start.getDate()} ${loc.monthsShort[start.getMonth()]}`;
      return `${left} – ${end.getDate()} ${loc.months[end.getMonth()]} ${end.getFullYear()}`;
    }

    return `${loc.months[this.refDate.getMonth()]} ${this.refDate.getFullYear()}`;
  }

  private navigate(direction: -1 | 1): void {
    const view = this.view;
    if (view === "day") {
      this.refDate = addDays(this.refDate, direction);
    } else if (view === "week") {
      this.refDate = addDays(this.refDate, direction * 7);
    } else {
      this.refDate = addMonths(new Date(this.refDate.getFullYear(), this.refDate.getMonth(), 1), direction);
    }

    this.navDirection = direction === 1 ? "next" : "prev";
    this.syncDateAttr();
    this.build();
    this.emitRangeChange();
  }

  private goToToday(): void {
    this.refDate = new Date();
    this.syncDateAttr();
    this.build();
    this.emitRangeChange();
  }

  private syncDateAttr(): void {
    this.syncingAttr = true;
    this.setAttribute("date", formatISODate(this.refDate));
    this.syncingAttr = false;
  }

  private emitRangeChange(): void {
    const { start, end } = this.getRange();
    this.dispatchEvent(new CustomEvent("ark-range-change", {
      detail: { start: formatISODate(start), end: formatISODate(end), view: this.view },
      bubbles: true,
      composed: true
    }));
  }

  private emitEventClick(event: ArkSchedulerEvent): void {
    this.dispatchEvent(new CustomEvent("ark-event-click", {
      detail: { event, id: event.id ?? null },
      bubbles: true,
      composed: true
    }));
  }

  private emitSlotClick(start: Date, end: Date, allDay = false): void {
    this.dispatchEvent(new CustomEvent("ark-slot-click", {
      detail: {
        start: allDay ? formatISODate(start) : formatISODateTime(start),
        end: allDay ? formatISODate(end) : formatISODateTime(end),
        allDay
      },
      bubbles: true,
      composed: true
    }));
  }

  // --- Blocos de UI ---

  private buildHeader(palette: ArkSchedulerPalette, loc: ArkDatepickerLocale): HTMLDivElement {
    const header = document.createElement("div");
    header.className = `flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ${palette.gridLine}`;
    applyTestHooks(this, "scheduler", header, "header");

    const left = document.createElement("div");
    left.className = "flex items-center gap-2";

    const todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.className = `${palette.navButton} px-3 text-xs font-medium`;
    todayBtn.textContent = loc.today;
    todayBtn.addEventListener("click", () => this.goToToday());
    applyTestHooks(this, "scheduler", todayBtn, "today");

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = palette.navButton;
    prevBtn.setAttribute("aria-label", loc.previousMonth);
    prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    prevBtn.addEventListener("click", () => this.navigate(-1));
    applyTestHooks(this, "scheduler", prevBtn, "prev");

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = palette.navButton;
    nextBtn.setAttribute("aria-label", loc.nextMonth);
    nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    nextBtn.addEventListener("click", () => this.navigate(1));
    applyTestHooks(this, "scheduler", nextBtn, "next");

    const title = document.createElement("h2");
    title.className = `${palette.headerText} ml-1`;
    title.setAttribute("aria-live", "polite");
    title.textContent = this.getTitle();
    applyTestHooks(this, "scheduler", title, "title");

    left.appendChild(todayBtn);
    left.appendChild(prevBtn);
    left.appendChild(nextBtn);
    left.appendChild(title);

    // Seletor de views reaproveitando o segmented control da própria família.
    const views = this.getAvailableViews();
    const group = document.createElement("ark-toggle-group");
    group.setAttribute("value", this.view);
    group.setAttribute("size", "sm");
    if (this.hasAttribute("theme")) group.setAttribute("theme", this.getAttribute("theme")!);
    applyTestHooks(this, "scheduler", group, "views");

    const labels: Record<ArkSchedulerView, string> = {
      day: loc.day,
      week: loc.week,
      month: loc.month,
      agenda: loc.agenda
    };

    for (const view of views) {
      const toggle = document.createElement("ark-toggle");
      toggle.setAttribute("value", view);
      toggle.textContent = labels[view];
      applyTestHooks(this, "scheduler", toggle, `view-${view}`);
      group.appendChild(toggle);
    }

    group.addEventListener("change", (event) => {
      event.stopPropagation();
      const detail = (event as CustomEvent<{ value?: string }>).detail;
      if (!detail?.value || detail.value === this.view) return;
      this.setAttribute("view", detail.value);
      this.dispatchEvent(new CustomEvent("ark-view-change", { detail: { view: detail.value }, bubbles: true, composed: true }));
    });

    header.appendChild(left);
    header.appendChild(group);
    return header;
  }

  private buildEventButton(event: ArkSchedulerEvent, timeLabel: string, compact: boolean): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.style.backgroundColor = this.eventColor(event);
    button.className = compact
      ? "flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1"
      : "flex h-full w-full flex-col overflow-hidden rounded-md px-1.5 py-1 text-left text-[11px] leading-tight text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1";

    const title = document.createElement("span");
    title.className = "truncate font-semibold";
    title.textContent = event.title;
    button.appendChild(title);

    if (!compact) {
      const time = document.createElement("span");
      time.className = "truncate opacity-90";
      time.textContent = event.location ? `${timeLabel} · ${event.location}` : timeLabel;
      button.appendChild(time);
    }

    button.setAttribute("aria-label", `${event.title}, ${timeLabel}`);
    if (event.id) button.setAttribute("data-event-id", event.id);
    applyTestHooks(this, "scheduler", button, "event");
    button.addEventListener("click", (domEvent) => {
      domEvent.stopPropagation();
      this.emitEventClick(event);
    });

    return button;
  }

  private eventTimeLabel(event: ArkSchedulerEvent, loc: ArkDatepickerLocale): string {
    const start = this.eventStart(event);
    if (!start) return "";
    if (event.allDay) return loc.allDay;
    const end = this.eventEnd(event, start);
    return `${this.formatHour(start.getHours(), start.getMinutes())} – ${this.formatHour(end.getHours(), end.getMinutes())}`;
  }

  private buildTimeGrid(palette: ArkSchedulerPalette, loc: ArkDatepickerLocale, days: Date[]): HTMLDivElement {
    const { start: hourStart, end: hourEnd } = this.getHourRange();
    const totalMinutes = (hourEnd - hourStart) * 60;
    const bodyHeight = (hourEnd - hourStart) * HOUR_HEIGHT_PX;
    const slotMinutes = this.getSlotMinutes();
    const today = new Date();

    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col";

    // Cabeçalho dos dias + faixa de eventos de dia inteiro.
    const daysHeader = document.createElement("div");
    daysHeader.className = `flex border-b ${palette.gridLine}`;

    const headerGutter = document.createElement("div");
    headerGutter.className = "w-14 shrink-0";
    daysHeader.appendChild(headerGutter);

    let hasAllDay = false;
    for (const day of days) {
      const isToday = isSameDay(day, today);
      const column = document.createElement("div");
      column.className = `flex-1 border-l px-2 py-2 ${palette.columnBorder} ${isToday ? palette.todayColumn : ""}`;

      const label = document.createElement("div");
      label.className = `text-center text-xs font-medium ${isToday ? "" : palette.mutedText}`;
      label.textContent = `${loc.weekdaysShort[day.getDay()]} ${day.getDate()}`;
      column.appendChild(label);

      const allDayEvents = this.eventsForDay(day, true);
      if (allDayEvents.length > 0) hasAllDay = true;
      const allDayWrap = document.createElement("div");
      allDayWrap.className = "mt-1 flex flex-col gap-0.5";
      applyTestHooks(this, "scheduler", allDayWrap, "allday");
      for (const event of allDayEvents) {
        allDayWrap.appendChild(this.buildEventButton(event, loc.allDay, true));
      }
      column.appendChild(allDayWrap);

      daysHeader.appendChild(column);
    }

    if (hasAllDay) {
      const gutterLabel = document.createElement("span");
      gutterLabel.className = `block pt-8 text-center text-[10px] ${palette.mutedText}`;
      gutterLabel.textContent = loc.allDay;
      headerGutter.appendChild(gutterLabel);
    }

    wrapper.appendChild(daysHeader);

    // Corpo rolável com a régua de horas e as colunas de dia.
    const scroller = document.createElement("div");
    scroller.className = "relative flex max-h-[32rem] overflow-y-auto";
    applyTestHooks(this, "scheduler", scroller, "scroller");

    const gutter = document.createElement("div");
    gutter.className = "w-14 shrink-0";
    gutter.style.height = `${bodyHeight}px`;

    for (let hour = hourStart; hour < hourEnd; hour++) {
      const slot = document.createElement("div");
      slot.className = `relative ${palette.mutedText}`;
      slot.style.height = `${HOUR_HEIGHT_PX}px`;

      const label = document.createElement("span");
      label.className = "absolute -top-2 right-2 text-[10px]";
      label.textContent = this.formatHour(hour);
      slot.appendChild(label);
      gutter.appendChild(slot);
    }
    scroller.appendChild(gutter);

    for (const day of days) {
      const isToday = isSameDay(day, today);
      const column = document.createElement("div");
      column.className = `relative flex-1 border-l ${palette.columnBorder} ${isToday ? palette.todayColumn : ""}`;
      column.style.height = `${bodyHeight}px`;
      column.setAttribute("data-date", formatISODate(day));
      applyTestHooks(this, "scheduler", column, "day");

      // Linhas de slot (clicáveis para criar evento).
      for (let minute = 0; minute < totalMinutes; minute += slotMinutes) {
        const slot = document.createElement("div");
        const isHourLine = (hourStart * 60 + minute) % 60 === 0;
        slot.className = `border-t ${isHourLine ? palette.gridLine : "border-transparent"} ${palette.slotHover} cursor-pointer`;
        slot.style.height = `${(slotMinutes / 60) * HOUR_HEIGHT_PX}px`;

        const slotStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hourStart, minute);
        const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60_000);
        slot.setAttribute("data-start", formatISODateTime(slotStart));
        applyTestHooks(this, "scheduler", slot, "slot");
        slot.addEventListener("click", () => this.emitSlotClick(slotStart, slotEnd));
        column.appendChild(slot);
      }

      // Eventos posicionados por horário.
      const placed = this.placeEvents(this.eventsForDay(day, false));
      for (const item of placed) {
        const startMinutes = minutesSinceMidnight(item.start);
        const endMinutes = isSameDay(item.end, day) ? minutesSinceMidnight(item.end) : hourEnd * 60;
        const top = ((Math.max(startMinutes, hourStart * 60) - hourStart * 60) / totalMinutes) * bodyHeight;
        const rawHeight = ((Math.min(endMinutes, hourEnd * 60) - Math.max(startMinutes, hourStart * 60)) / totalMinutes) * bodyHeight;
        if (rawHeight <= 0) continue;

        const holder = document.createElement("div");
        holder.className = "absolute px-0.5";
        holder.style.top = `${top}px`;
        holder.style.height = `${Math.max(rawHeight, 18)}px`;
        holder.style.left = `${(item.column / item.columns) * 100}%`;
        holder.style.width = `${(1 / item.columns) * 100}%`;
        holder.appendChild(this.buildEventButton(item.event, this.eventTimeLabel(item.event, loc), false));
        column.appendChild(holder);
      }

      // Indicador de "agora" no dia corrente.
      if (isToday) {
        const nowMinutes = minutesSinceMidnight(today);
        if (nowMinutes >= hourStart * 60 && nowMinutes <= hourEnd * 60) {
          const line = document.createElement("div");
          line.className = "pointer-events-none absolute left-0 right-0 z-10 flex items-center";
          line.style.top = `${((nowMinutes - hourStart * 60) / totalMinutes) * bodyHeight}px`;
          applyTestHooks(this, "scheduler", line, "now");

          const dot = document.createElement("span");
          dot.className = "-ml-1 h-2 w-2 rounded-full bg-red-500";
          const rule = document.createElement("span");
          rule.className = "h-px flex-1 bg-red-500";
          line.appendChild(dot);
          line.appendChild(rule);
          column.appendChild(line);
          this.nowLines.push(line);
        }
      }

      scroller.appendChild(column);
    }

    wrapper.appendChild(scroller);
    this.scrollerEl = scroller;
    scroller.addEventListener("scroll", () => {
      this.lastScrollTop = scroller.scrollTop;
    });

    const renderKey = `${this.view}:${formatISODate(days[0])}`;
    const keepScroll = renderKey === this.lastRenderKey;
    this.lastRenderKey = renderKey;

    requestAnimationFrame(() => {
      if (keepScroll) {
        // Mesmo período: devolve o scroll onde o usuário estava.
        scroller.scrollTop = this.lastScrollTop;
        return;
      }
      // Período novo: abre perto do primeiro evento (ou 8h) em vez da madrugada.
      const firstEvent = days
        .flatMap((day) => this.eventsForDay(day, false))
        .map((event) => this.eventStart(event))
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime())[0];
      const targetHour = firstEvent ? firstEvent.getHours() : 8;
      scroller.scrollTop = Math.max(0, (targetHour - hourStart - 0.5) * HOUR_HEIGHT_PX);
      this.lastScrollTop = scroller.scrollTop;
    });

    return wrapper;
  }

  private buildMonthGrid(palette: ArkSchedulerPalette, loc: ArkDatepickerLocale): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col";

    const weekRow = document.createElement("div");
    weekRow.className = `grid grid-cols-7 border-b ${palette.gridLine}`;
    for (let i = 0; i < 7; i++) {
      const idx = (loc.firstDayOfWeek + i) % 7;
      const cell = document.createElement("div");
      cell.className = `py-2 text-center text-xs font-medium ${palette.mutedText}`;
      cell.setAttribute("title", loc.weekdays[idx]);
      cell.textContent = loc.weekdaysShort[idx];
      weekRow.appendChild(cell);
    }
    wrapper.appendChild(weekRow);

    const year = this.refDate.getFullYear();
    const month = this.refDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    let startOffset = firstOfMonth.getDay() - loc.firstDayOfWeek;
    if (startOffset < 0) startOffset += 7;
    const totalCells = Math.ceil((startOffset + lastOfMonth.getDate()) / 7) * 7;

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-7";
    applyTestHooks(this, "scheduler", grid, "grid");

    const today = new Date();

    for (let index = 0; index < totalCells; index++) {
      const dayNumber = index - startOffset + 1;
      const cellDate = new Date(year, month, dayNumber);
      const inMonth = dayNumber >= 1 && dayNumber <= lastOfMonth.getDate();
      const isToday = isSameDay(cellDate, today);

      const cell = document.createElement("div");
      cell.className = `min-h-24 border-b border-r p-1 ${palette.columnBorder} ${inMonth ? palette.monthCellBase : palette.monthCellMuted}`;
      cell.setAttribute("data-date", formatISODate(cellDate));
      applyTestHooks(this, "scheduler", cell, "day");

      const dayButton = document.createElement("button");
      dayButton.type = "button";
      dayButton.className = isToday
        ? "mb-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white"
        : `mb-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs transition hover:bg-black/5 ${inMonth ? "" : palette.mutedText}`;
      dayButton.textContent = String(cellDate.getDate());
      dayButton.setAttribute("aria-label", `${cellDate.getDate()} ${loc.months[cellDate.getMonth()]} ${cellDate.getFullYear()}`);
      dayButton.addEventListener("click", () => this.emitSlotClick(startOfDay(cellDate), startOfDay(cellDate), true));
      cell.appendChild(dayButton);

      const dayEvents = [...this.eventsForDay(cellDate, true), ...this.eventsForDay(cellDate, false)];
      const maxChips = 3;
      for (const event of dayEvents.slice(0, maxChips)) {
        cell.appendChild(this.buildEventButton(event, this.eventTimeLabel(event, loc), true));
      }
      if (dayEvents.length > maxChips) {
        const more = document.createElement("button");
        more.type = "button";
        more.className = `mt-0.5 block w-full px-1 text-left text-[10px] ${palette.mutedText} hover:underline`;
        more.textContent = `+${dayEvents.length - maxChips}`;
        applyTestHooks(this, "scheduler", more, "event-more");
        // Ver todos: abre o dia clicado na view "day".
        more.addEventListener("click", () => {
          this.refDate = cellDate;
          this.syncDateAttr();
          this.setAttribute("view", "day");
          this.dispatchEvent(new CustomEvent("ark-view-change", { detail: { view: "day" }, bubbles: true, composed: true }));
        });
        cell.appendChild(more);
      }

      grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
    return wrapper;
  }

  private buildAgenda(palette: ArkSchedulerPalette, loc: ArkDatepickerLocale): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = "flex max-h-[32rem] flex-col overflow-y-auto";
    applyTestHooks(this, "scheduler", wrapper, "scroller");

    const { days } = this.getRange();
    const today = new Date();
    let rendered = 0;

    for (const day of days) {
      const dayEvents = [...this.eventsForDay(day, true), ...this.eventsForDay(day, false)];
      if (dayEvents.length === 0) continue;
      rendered++;

      const row = document.createElement("div");
      row.className = `flex gap-4 border-b px-4 py-3 ${palette.agendaRow}`;
      row.setAttribute("data-date", formatISODate(day));
      applyTestHooks(this, "scheduler", row, "day");

      const dayLabel = document.createElement("div");
      dayLabel.className = "w-24 shrink-0";
      const dayNumber = document.createElement("div");
      dayNumber.className = isSameDay(day, today) ? "text-lg font-semibold text-red-500" : "text-lg font-semibold";
      dayNumber.textContent = String(day.getDate());
      const dayName = document.createElement("div");
      dayName.className = `text-xs ${palette.mutedText}`;
      dayName.textContent = `${loc.weekdaysShort[day.getDay()]} · ${loc.monthsShort[day.getMonth()]}`;
      dayLabel.appendChild(dayNumber);
      dayLabel.appendChild(dayName);

      const list = document.createElement("div");
      list.className = "flex flex-1 flex-col gap-1";

      for (const event of dayEvents) {
        const item = document.createElement("button");
        item.type = "button";
        item.className = `flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${palette.slotHover} focus:outline-none focus:ring-2 focus:ring-offset-1`;
        if (event.id) item.setAttribute("data-event-id", event.id);
        applyTestHooks(this, "scheduler", item, "event");

        const dot = document.createElement("span");
        dot.className = "h-2.5 w-2.5 shrink-0 rounded-full";
        dot.style.backgroundColor = this.eventColor(event);

        const time = document.createElement("span");
        time.className = `w-28 shrink-0 text-xs ${palette.mutedText}`;
        time.textContent = this.eventTimeLabel(event, loc);

        const title = document.createElement("span");
        title.className = "truncate font-medium";
        title.textContent = event.title;

        item.setAttribute("aria-label", `${event.title}, ${this.eventTimeLabel(event, loc)}`);
        item.appendChild(dot);
        item.appendChild(time);
        item.appendChild(title);
        item.addEventListener("click", () => this.emitEventClick(event));
        list.appendChild(item);
      }

      row.appendChild(dayLabel);
      row.appendChild(list);
      wrapper.appendChild(row);
    }

    if (rendered === 0) {
      const empty = document.createElement("p");
      empty.className = `px-4 py-10 text-center text-sm ${palette.mutedText}`;
      empty.textContent = loc.noEvents;
      applyTestHooks(this, "scheduler", empty, "empty");
      wrapper.appendChild(empty);
    }

    return wrapper;
  }

  // Move só a linha de "agora"; rebuildar a cada minuto custaria o scroll e o foco.
  private updateNowIndicator(): void {
    if (this.nowLines.length === 0) return;

    const { start: hourStart, end: hourEnd } = this.getHourRange();
    const totalMinutes = (hourEnd - hourStart) * 60;
    const bodyHeight = (hourEnd - hourStart) * HOUR_HEIGHT_PX;
    const nowMinutes = minutesSinceMidnight(new Date());

    for (const line of this.nowLines) {
      if (nowMinutes < hourStart * 60 || nowMinutes > hourEnd * 60) {
        line.hidden = true;
        continue;
      }
      line.hidden = false;
      line.style.top = `${((nowMinutes - hourStart * 60) / totalMinutes) * bodyHeight}px`;
    }
  }

  private build(): void {
    if (!this.locale) this.locale = this.getLocale();
    const loc = this.locale;
    const theme = this.getTheme();
    const palette = this.getPalette(theme);
    const view = this.view;

    this.root?.remove();
    this.nowLines = [];
    this.scrollerEl = null;

    const container = document.createElement("div");
    container.className = palette.container;
    applyTestHooks(this, "scheduler", container);

    container.appendChild(this.buildHeader(palette, loc));

    const body = document.createElement("div");
    body.className = "flex flex-col";
    applyTestHooks(this, "scheduler", body, "body");

    const { days } = this.getRange();
    if (view === "week") {
      body.appendChild(this.buildTimeGrid(palette, loc, days));
    } else if (view === "day") {
      body.appendChild(this.buildTimeGrid(palette, loc, [startOfDay(this.refDate)]));
    } else if (view === "month") {
      body.appendChild(this.buildMonthGrid(palette, loc));
    } else {
      body.appendChild(this.buildAgenda(palette, loc));
    }

    container.appendChild(body);
    this.appendChild(container);
    this.root = container;

    // Motion: slide direcional ao navegar no período (tokens zeram a duração
    // quando o usuário pede movimento reduzido).
    if (this.navDirection) {
      arkEnter(body, this.navDirection === "next" ? "slide-left" : "slide-right", { duration: "fast" });
      this.navDirection = null;
    }
  }
}

export default ArkScheduler;
