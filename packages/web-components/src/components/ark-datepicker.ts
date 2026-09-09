import { arkEnter, arkExit, resolveLocale, type ArkDatepickerLocale } from "@tooark/core";
import type { ArkDatepickerLang, ArkDatepickerMode } from "@tooark/core";
import type { ArkCalendar } from "./ark-calendar";
import type { ArkClock } from "./ark-clock";
import type { ArkInput } from "./ark-input";
import { applyTestHooks } from "./test-hooks";

// Atributos repassados aos componentes internos.
const CALENDAR_ATTRS = ["lang", "locale-json", "theme", "intent", "accent-color", "min", "max", "events", "event-display"];
const CLOCK_ATTRS = ["lang", "theme", "intent", "seconds", "step-minutes", "hours-format"];

const CALENDAR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
const CLOCK_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

/**
 * Seletor de data/hora que compõe ark-input + ark-calendar + ark-clock.
 *
 * - `mode`: "datetime" (padrão, data + hora), "date" (só calendário) ou "time"
 *   (só relógio). O valor é ISO por modo: "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DD"
 *   ou "HH:mm:ss".
 * - Sem o atributo `input`, renderiza o(s) painel(is) inline.
 * - Com `input`, renderiza um ark-input com botão no sufixo e popup com o
 *   painel; suporta digitação com parse (`format` com tokens YYYY MM DD HH mm ss,
 *   sensível a maiúsculas), Esc/clique fora e formulário via input hidden.
 */
export class ArkDatepicker extends HTMLElement {
  static readonly tagName = "ark-datepicker";

  private calendarEl: ArkCalendar | null = null;
  private clockEl: ArkClock | null = null;
  private inputComp: ArkInput | null = null;
  private toggleEl: HTMLButtonElement | null = null;
  private popupEl: HTMLDivElement | null = null;
  private hiddenInputEl: HTMLInputElement | null = null;
  private popupOpen = false;
  private syncingValue = false;
  private syncingChild = false;

  private dateISO: string | null = null;
  private timeISO: string | null = null;

  static get observedAttributes(): string[] {
    return ["mode", "input", "value", "placeholder", "name", "format", "seconds", "disabled", "testid", ...CALENDAR_ATTRS.filter((a) => a !== "events" && a !== "event-display"), "events", "event-display", "step-minutes", "hours-format"];
  }

  connectedCallback(): void {
    if (!this.hasRendered()) {
      this.syncFromValue();
      this.render();
    }
    this.syncField();
  }

  disconnectedCallback(): void {
    document.removeEventListener("pointerdown", this.handleOutsidePointer, true);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (!this.hasRendered()) return;

    if (name === "mode" || name === "input") {
      // Troca de modo: reconstrói a estrutura inteira.
      this.teardown();
      this.syncFromValue();
      this.render();
      this.syncField();
      return;
    }

    if (name === "value") {
      if (this.syncingValue) return;
      this.syncFromValue();
      this.pushValueToChildren();
      this.syncField();
      return;
    }

    if (name === "testid") {
      this.applyHooks();
      return;
    }

    if (CALENDAR_ATTRS.includes(name) && this.calendarEl) {
      this.forwardAttr(this.calendarEl, name);
    }
    if (CLOCK_ATTRS.includes(name) && this.clockEl) {
      this.forwardAttr(this.clockEl, name);
    }
    this.syncField();
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  private hasRendered(): boolean {
    return this.calendarEl !== null || this.clockEl !== null;
  }

  private getMode(): ArkDatepickerMode {
    const mode = (this.getAttribute("mode") || "datetime").toLowerCase();
    return mode === "date" || mode === "time" ? mode : "datetime";
  }

  private isInputMode(): boolean {
    return this.hasAttribute("input");
  }

  private hasDatePanel(): boolean {
    return this.getMode() !== "time";
  }

  private hasTimePanel(): boolean {
    return this.getMode() !== "date";
  }

  private getLocale(): ArkDatepickerLocale {
    const lang = (this.getAttribute("lang") || "en") as ArkDatepickerLang;
    const customJson = this.getAttribute("locale-json") || undefined;
    return resolveLocale(lang, customJson);
  }

  // --- Valor: parse/compose por modo ---

  private normalizeTime(time: string | null | undefined): string | null {
    if (!time) return null;
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim());
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    const s = Number(match[3] || "0");
    if (h > 23 || m > 59 || s > 59) return null;
    const pad = (n: number): string => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  private syncFromValue(): void {
    const value = (this.getAttribute("value") || "").trim();
    const mode = this.getMode();
    this.dateISO = null;
    this.timeISO = null;
    if (!value) return;

    if (mode === "time") {
      this.timeISO = this.normalizeTime(value);
      return;
    }

    const match = /^(\d{4}-\d{2}-\d{2})(?:[T ](.+))?$/.exec(value);
    if (!match) return;
    this.dateISO = match[1];
    if (mode === "datetime") {
      this.timeISO = this.normalizeTime(match[2]) || null;
    }
  }

  private composeValue(): string {
    const mode = this.getMode();
    if (mode === "date") return this.dateISO || "";
    if (mode === "time") return this.timeISO || "";
    if (!this.dateISO) return "";
    return `${this.dateISO}T${this.timeISO || "00:00:00"}`;
  }

  private toDate(): Date | null {
    const mode = this.getMode();
    const pad = this.dateISO ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(this.dateISO) : null;
    const time = this.timeISO ? /^(\d{2}):(\d{2}):(\d{2})$/.exec(this.timeISO) : null;

    if (mode === "time") {
      if (!time) return null;
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(time[1]), Number(time[2]), Number(time[3]));
    }

    if (!pad) return null;
    return new Date(
      Number(pad[1]),
      Number(pad[2]) - 1,
      Number(pad[3]),
      time ? Number(time[1]) : 0,
      time ? Number(time[2]) : 0,
      time ? Number(time[3]) : 0
    );
  }

  // --- Formato de exibição do campo (tokens YYYY MM DD HH mm ss, case-sensitive) ---

  private getFormat(): string {
    const custom = this.getAttribute("format");
    if (custom) return custom;

    const lang = (this.getAttribute("lang") || "en").toLowerCase();
    const datePart = lang === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY";
    const timePart = this.hasAttribute("seconds") ? "HH:mm:ss" : "HH:mm";

    const mode = this.getMode();
    if (mode === "date") return datePart;
    if (mode === "time") return timePart;
    return `${datePart} ${timePart}`;
  }

  private formatDisplay(): string {
    const value = this.composeValue();
    if (!value) return "";

    const date = this.dateISO ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(this.dateISO) : null;
    const time = this.timeISO ? /^(\d{2}):(\d{2}):(\d{2})$/.exec(this.timeISO) : null;

    return this.getFormat()
      .replace("YYYY", date ? date[1] : "")
      .replace("MM", date ? date[2] : "")
      .replace("DD", date ? date[3] : "")
      .replace("HH", time ? time[1] : "00")
      .replace("mm", time ? time[2] : "00")
      .replace("ss", time ? time[3] : "00");
  }

  private parseDisplay(text: string): { dateISO: string | null; timeISO: string | null } | null {
    const format = this.getFormat();
    const allTokens = ["YYYY", "MM", "DD", "HH", "mm", "ss"];
    const tokens = allTokens
      .filter((token) => format.includes(token))
      .sort((a, b) => format.indexOf(a) - format.indexOf(b));

    let pattern = format.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const token of allTokens) {
      pattern = pattern.replace(token, token === "YYYY" ? "(\\d{4})" : "(\\d{1,2})");
    }

    const match = new RegExp(`^${pattern}$`).exec(text.trim());
    if (!match) return null;

    const parts: Record<string, number> = {};
    tokens.forEach((token, i) => {
      parts[token] = Number(match[i + 1]);
    });

    const pad = (n: number): string => String(n).padStart(2, "0");
    let dateISO: string | null = null;
    let timeISO: string | null = null;

    if (tokens.includes("YYYY")) {
      const candidate = new Date(parts.YYYY, (parts.MM || 1) - 1, parts.DD || 1);
      const valid = candidate.getFullYear() === parts.YYYY && candidate.getMonth() === (parts.MM || 1) - 1 && candidate.getDate() === (parts.DD || 1);
      if (!valid) return null;
      dateISO = `${parts.YYYY}-${pad(parts.MM || 1)}-${pad(parts.DD || 1)}`;
    }

    if (tokens.includes("HH")) {
      const h = parts.HH ?? 0;
      const m = parts.mm ?? 0;
      const s = parts.ss ?? 0;
      if (h > 23 || m > 59 || s > 59) return null;
      timeISO = `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    return { dateISO, timeISO };
  }

  // --- Estrutura ---

  private teardown(): void {
    document.removeEventListener("pointerdown", this.handleOutsidePointer, true);
    this.popupOpen = false;
    this.replaceChildren();
    this.calendarEl = null;
    this.clockEl = null;
    this.inputComp = null;
    this.toggleEl = null;
    this.popupEl = null;
    this.hiddenInputEl = null;
  }

  private forwardAttr(target: HTMLElement, name: string): void {
    const value = this.getAttribute(name);
    if (value !== null) {
      target.setAttribute(name, value);
    } else {
      target.removeAttribute(name);
    }
  }

  private buildPanel(): HTMLDivElement {
    const panel = document.createElement("div");
    panel.className = "ark:flex ark:flex-wrap ark:items-start ark:gap-3";

    if (this.hasDatePanel()) {
      const calendar = document.createElement("ark-calendar") as ArkCalendar;
      for (const attr of CALENDAR_ATTRS) {
        if (this.hasAttribute(attr)) calendar.setAttribute(attr, this.getAttribute(attr)!);
      }
      if (this.dateISO) calendar.setAttribute("value", this.dateISO);
      calendar.addEventListener("ark-change", this.handleCalendarChange);
      panel.appendChild(calendar);
      this.calendarEl = calendar;
    }

    if (this.hasTimePanel()) {
      const clock = document.createElement("ark-clock") as ArkClock;
      for (const attr of CLOCK_ATTRS) {
        if (this.hasAttribute(attr)) clock.setAttribute(attr, this.getAttribute(attr)!);
      }
      if (this.timeISO) clock.setAttribute("value", this.timeISO);
      clock.addEventListener("ark-change", this.handleClockChange);
      panel.appendChild(clock);
      this.clockEl = clock;
    }

    return panel;
  }

  private render(): void {
    const panel = this.buildPanel();

    if (!this.isInputMode()) {
      this.appendChild(panel);
      this.applyHooks();
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "ark:relative ark:inline-block";
    wrapper.addEventListener("keydown", this.handleKeydown);

    const inputComp = document.createElement("ark-input") as ArkInput;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.tabIndex = -1;
    toggle.innerHTML = this.getMode() === "time" ? CLOCK_ICON_SVG : CALENDAR_ICON_SVG;
    toggle.addEventListener("click", () => {
      if (this.popupOpen) {
        this.closePopup(true);
      } else {
        this.openPopup();
        this.focusPanel();
      }
    });

    const suffix = document.createElement("span");
    suffix.setAttribute("slot", "suffix");
    suffix.appendChild(toggle);
    inputComp.appendChild(suffix);

    // Abre por clique, ArrowDown ou pelo botão — nunca por focus, para que
    // devolver o foco ao campo (após selecionar/Esc) não reabra o popup.
    inputComp.addEventListener("click", (event) => {
      if ((event.target as HTMLElement | null)?.tagName === "INPUT") this.openPopup();
    });
    inputComp.addEventListener("focusout", () => this.commitTyped());
    inputComp.addEventListener("keydown", (event) => {
      if ((event.target as HTMLElement | null)?.tagName !== "INPUT") return;
      if (event.key === "Enter") {
        event.preventDefault();
        this.commitTyped();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.openPopup();
        this.focusPanel();
      }
    });

    const popup = document.createElement("div");
    popup.className = "ark:absolute ark:left-0 ark:top-full ark:z-50 ark:mt-2";
    popup.setAttribute("role", "dialog");
    popup.hidden = true;
    popup.appendChild(panel);

    const hidden = document.createElement("input");
    hidden.type = "hidden";

    wrapper.appendChild(inputComp);
    wrapper.appendChild(popup);
    this.appendChild(wrapper);
    this.appendChild(hidden);

    this.inputComp = inputComp;
    this.toggleEl = toggle;
    this.popupEl = popup;
    this.hiddenInputEl = hidden;
    this.applyHooks();
  }

  private applyHooks(): void {
    const testid = this.getAttribute("testid");
    const inputMode = this.isInputMode();

    if (this.calendarEl) {
      const calendarTestid = testid ? (inputMode ? `${testid}-calendar` : testid) : null;
      if (calendarTestid) {
        this.calendarEl.setAttribute("testid", calendarTestid);
      } else {
        this.calendarEl.removeAttribute("testid");
      }
    }

    if (this.clockEl) {
      if (testid) {
        this.clockEl.setAttribute("testid", `${testid}-clock`);
      } else {
        this.clockEl.removeAttribute("testid");
      }
    }

    if (inputMode) {
      if (this.inputComp) {
        if (testid) {
          this.inputComp.setAttribute("testid", testid);
        } else {
          this.inputComp.removeAttribute("testid");
        }
      }
      if (this.toggleEl) applyTestHooks(this, "datepicker", this.toggleEl, "toggle");
      if (this.popupEl) applyTestHooks(this, "datepicker", this.popupEl, "popup");
    }
  }

  private pushValueToChildren(): void {
    this.syncingChild = true;
    if (this.calendarEl) {
      if (this.dateISO) {
        this.calendarEl.setAttribute("value", this.dateISO);
      } else {
        this.calendarEl.removeAttribute("value");
      }
    }
    if (this.clockEl) {
      if (this.timeISO) {
        this.clockEl.setAttribute("value", this.timeISO);
      } else {
        this.clockEl.removeAttribute("value");
      }
    }
    this.syncingChild = false;
  }

  // Sincroniza aparência/estado do campo com os atributos atuais.
  private syncField(): void {
    if (!this.isInputMode() || !this.inputComp || !this.toggleEl || !this.hiddenInputEl || !this.popupEl) return;

    const loc = this.getLocale();
    const disabled = this.hasAttribute("disabled");

    this.forwardAttr(this.inputComp, "theme");
    this.inputComp.setAttribute("placeholder", this.getAttribute("placeholder") || this.getFormat().toLowerCase());
    if (disabled) {
      this.inputComp.setAttribute("disabled", "");
    } else {
      this.inputComp.removeAttribute("disabled");
    }

    this.toggleEl.disabled = disabled;
    this.toggleEl.setAttribute("aria-label", loc.openCalendar);
    this.toggleEl.className = "ark:rounded ark:p-0.5 ark:text-fg-muted ark:transition ark:hover:text-fg-soft ark:disabled:cursor-not-allowed ark:disabled:opacity-50";

    this.popupEl.setAttribute("aria-label", loc.openCalendar);
    this.inputComp.inputElement?.setAttribute("aria-haspopup", "dialog");
    this.inputComp.inputElement?.setAttribute("aria-expanded", this.popupOpen ? "true" : "false");

    this.hiddenInputEl.name = this.getAttribute("name") || "";
    this.hiddenInputEl.value = this.getAttribute("value") || "";
    this.hiddenInputEl.disabled = disabled;

    this.updateInputDisplay();
  }

  private updateInputDisplay(): void {
    if (!this.inputComp) return;
    this.inputComp.value = this.formatDisplay();
  }

  private emitChange(): void {
    const value = this.composeValue();

    this.syncingValue = true;
    if (value) {
      this.setAttribute("value", value);
    } else {
      this.removeAttribute("value");
    }
    this.syncingValue = false;

    if (this.hiddenInputEl) this.hiddenInputEl.value = value;
    this.updateInputDisplay();

    this.dispatchEvent(new CustomEvent("ark-change", {
      detail: { value: value || null, date: this.toDate() },
      bubbles: true,
      composed: true
    }));
  }

  private readonly handleCalendarChange = (event: Event): void => {
    // Consumidores recebem o ark-change consolidado do datepicker, não o interno.
    event.stopPropagation();
    if (this.syncingChild) return;

    const detail = (event as CustomEvent<{ value: string | null }>).detail;
    this.dateISO = detail.value;
    if (this.getMode() === "datetime" && this.dateISO && !this.timeISO) {
      this.timeISO = "00:00:00";
      this.pushValueToChildren();
    }
    this.emitChange();

    // Só data: selecionar fecha. Com hora junto, o popup fica aberto.
    if (this.popupOpen && this.getMode() === "date" && detail.value) {
      this.closePopup(true);
    }
  };

  private readonly handleClockChange = (event: Event): void => {
    event.stopPropagation();
    if (this.syncingChild) return;

    const detail = (event as CustomEvent<{ value: string }>).detail;
    this.timeISO = this.normalizeTime(detail.value);
    if (this.getMode() === "datetime" && !this.dateISO) {
      const now = new Date();
      const pad = (n: number): string => String(n).padStart(2, "0");
      this.dateISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      this.pushValueToChildren();
    }
    this.emitChange();
  };

  private commitTyped(): void {
    const input = this.inputComp?.inputElement;
    if (!input) return;

    const text = input.value.trim();
    const currentValue = this.getAttribute("value") || "";

    if (!text) {
      if (currentValue) {
        this.dateISO = null;
        this.timeISO = null;
        this.pushValueToChildren();
        this.emitChange();
      }
      return;
    }

    const parsed = this.parseDisplay(text);
    if (!parsed) {
      // Entrada inválida: reverte para o último valor válido.
      this.updateInputDisplay();
      return;
    }

    this.dateISO = parsed.dateISO ?? this.dateISO;
    this.timeISO = parsed.timeISO ?? this.timeISO;
    if (this.composeValue() === currentValue) {
      this.updateInputDisplay();
      return;
    }

    this.pushValueToChildren();
    this.emitChange();
  }

  // --- Popup ---

  private focusPanel(): void {
    if (!this.popupEl) return;
    const target = this.getMode() === "time"
      ? this.popupEl.querySelector<HTMLElement>('[data-ark="clock-hours"] button[tabindex="0"]')
      : this.popupEl.querySelector<HTMLElement>('[data-ark="calendar-day"][tabindex="0"]');
    target?.focus();
  }

  private openPopup(): void {
    if (!this.popupEl || this.popupOpen || this.hasAttribute("disabled")) return;
    this.popupOpen = true;

    // Cancela animações anteriores (o fill "forwards" do exit deixaria opacity 0).
    this.popupEl.getAnimations().forEach((animation) => animation.cancel());
    this.popupEl.hidden = false;
    this.inputComp?.inputElement?.setAttribute("aria-expanded", "true");
    document.addEventListener("pointerdown", this.handleOutsidePointer, true);
    arkEnter(this.popupEl, "slide-down", { duration: "fast", distance: "0.5rem" });
  }

  private closePopup(focusInput = false): void {
    if (!this.popupEl || !this.popupOpen) return;
    this.popupOpen = false;
    this.inputComp?.inputElement?.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", this.handleOutsidePointer, true);

    const popup = this.popupEl;
    arkExit(popup, "fade", { duration: "fast" }).then(() => {
      if (!this.popupOpen) popup.hidden = true;
    });

    if (focusInput) this.inputComp?.focus();
  }

  private readonly handleOutsidePointer = (event: Event): void => {
    if (!this.contains(event.target as Node)) {
      this.closePopup();
    }
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.popupOpen) {
      event.stopPropagation();
      this.closePopup(true);
    }
  };
}

export default ArkDatepicker;
