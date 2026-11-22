import { type ArkTimeFormat, getArkLocale } from "@tooark/core";
import { parseLocalDateTime } from "./date-utils";
import { HTMLElementBase } from "./html-element-base";
import { followArkLocale, unfollowArkLocale } from "./locale-sync";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Unidades do formato relativo, da maior para a menor, com a duração de cada uma. */
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * DAY],
  ["month", 30 * DAY],
  ["week", 7 * DAY],
  ["day", DAY],
  ["hour", HOUR],
  ["minute", MINUTE],
  ["second", SECOND]
];

const FORMATS: ArkTimeFormat[] = ["relative", "date", "time", "datetime"];

/** Só data (`YYYY-MM-DD`): o relativo conta dias de calendário, e os formatos com hora mostram só a data. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
/** Sem fuso (`YYYY-MM-DD[THH:mm[:ss]]`): hora local, como em todo o resto da biblioteca. */
const LOCAL = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/;

type ParsedTime = { date: Date; dateOnly: boolean };

function parseTime(value: string | null): ParsedTime | null {
  const text = value?.trim();
  if (!text) return null;
  // Com fuso (`Z`, `-03:00`) a string já diz o instante; sem fuso é hora local, nunca UTC.
  const date = LOCAL.test(text) ? parseLocalDateTime(text) : new Date(text);
  if (!date || Number.isNaN(date.getTime())) return null;
  return { date, dateOnly: DATE_ONLY.test(text) };
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Data e hora formatadas pelo idioma (`Intl`), relativas a agora ("há 3 minutos", "ontem") ou absolutas. O
 * conteúdo é um `<time datetime>` próprio, com a data completa no `title`; no formato relativo o texto se atualiza
 * sozinho no próximo ponto em que muda (cada segundo no primeiro minuto, cada minuto na primeira hora...), e para
 * fora do documento ou com a aba oculta. O idioma é o `lang` próprio, senão o de `setArkLocale()`, senão "en", com a
 * tag inteira (`pt-BR`) indo para o `Intl`.
 */
export class ArkTime extends HTMLElementBase {
  static readonly tagName = "ark-time";

  private timeEl: HTMLTimeElement | null = null;
  private timer: number | null = null;

  static get observedAttributes(): string[] {
    return ["datetime", "format", "lang", "testid"];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    followArkLocale(this);
    if (!this.timeEl) {
      const time = document.createElement("time");
      this.appendChild(time);
      this.timeEl = time;
    }
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.update();
  }

  disconnectedCallback(): void {
    unfollowArkLocale(this);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.clearTimer();
  }

  attributeChangedCallback(): void {
    if (!this.timeEl || !this.isConnected) return;
    this.update();
  }

  /**
   * Instante mostrado: ISO com fuso (`2026-09-15T13:00:00Z`), hora local sem fuso (`2026-09-15T10:00`) ou só a data
   * (`2026-09-15`). Atribuir um `Date` ou um número (ms) grava o ISO. Padrão: nenhum (nada é mostrado).
   */
  get datetime(): string {
    return this.getAttribute("datetime") || "";
  }

  set datetime(value: string | number | Date | null | undefined) {
    if (value instanceof Date || typeof value === "number") {
      const date = new Date(value);
      reflectAttr(this, "datetime", Number.isNaN(date.getTime()) ? null : date.toISOString());
      return;
    }
    reflectAttr(this, "datetime", value || null);
  }

  /** relative ("há 3 minutos"), date, time ou datetime. Padrão: "relative". */
  get format(): ArkTimeFormat {
    const value = (this.getAttribute("format") || "").toLowerCase() as ArkTimeFormat;
    return FORMATS.includes(value) ? value : "relative";
  }

  set format(value: string | null | undefined) {
    reflectAttr(this, "format", value || null);
  }

  /** O instante como `Date`, ou `null` sem um `datetime` válido. */
  get date(): Date | null {
    const parsed = parseTime(this.getAttribute("datetime"));
    return parsed ? new Date(parsed.date.getTime()) : null;
  }

  /** Tag de idioma para o Intl: o `lang` próprio, senão o de setArkLocale(); uma que o Intl não conheça vira "en". */
  private locale(): string {
    const tag = this.getAttribute("lang") || getArkLocale().lang;
    try {
      return Intl.DateTimeFormat.supportedLocalesOf(tag).length > 0 ? tag : "en";
    } catch {
      return "en";
    }
  }

  private readonly handleVisibility = (): void => {
    if (!this.isConnected) return;
    if (document.hidden) {
      this.clearTimer();
    } else {
      this.update();
    }
  };

  private clearTimer(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
  }

  // Texto relativo e quando ele muda: o valor é truncado na unidade, então muda na próxima fronteira dela.
  private relative(parsed: ParsedTime, locale: string): { text: string; next: number } {
    const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const now = Date.now();
    if (parsed.dateOnly) {
      const days = Math.round((startOfDay(parsed.date) - startOfDay(new Date(now))) / DAY);
      const abs = Math.abs(days);
      const [unit, size] = abs < 7 ? ["day", 1] : abs < 30 ? ["week", 7] : abs < 365 ? ["month", 30] : ["year", 365];
      const midnight = startOfDay(new Date(now)) + DAY;
      return {
        text: format.format(Math.trunc(days / size), unit as Intl.RelativeTimeFormatUnit),
        next: midnight - now
      };
    }
    const diff = parsed.date.getTime() - now;
    const abs = Math.abs(diff);
    const [unit, size] = UNITS.find(([, ms]) => abs >= ms) ?? ["second", SECOND];
    // Passado: o valor cresce na próxima múltipla da unidade; futuro: decresce quando a distância cruza a anterior.
    const next = diff <= 0 ? size - (abs % size) : (abs % size) + 1;
    return { text: format.format(Math.trunc(diff / size), unit), next };
  }

  private update(): void {
    const time = this.timeEl;
    if (!time) return;
    this.clearTimer();
    const parsed = parseTime(this.getAttribute("datetime"));
    const locale = this.locale();

    applyTestHooks(this, "time", this);
    applyTestHooks(this, "time", time, "value");

    if (!parsed) {
      time.textContent = "";
      time.removeAttribute("datetime");
      time.removeAttribute("title");
      return;
    }

    const raw = this.getAttribute("datetime")?.trim() || "";
    time.setAttribute("datetime", parsed.dateOnly ? raw : parsed.date.toISOString());
    const full = new Intl.DateTimeFormat(
      locale,
      parsed.dateOnly ? { dateStyle: "full" } : { dateStyle: "full", timeStyle: "short" }
    ).format(parsed.date);
    // O title do próprio host vence: o da data completa só entra sem ele.
    if (this.hasAttribute("title")) {
      time.removeAttribute("title");
    } else {
      time.setAttribute("title", full);
    }

    const format = this.format;
    if (format !== "relative") {
      const options: Intl.DateTimeFormatOptions =
        format === "date" || parsed.dateOnly
          ? { dateStyle: "medium" }
          : format === "time"
            ? { timeStyle: "short" }
            : { dateStyle: "medium", timeStyle: "short" };
      time.textContent = new Intl.DateTimeFormat(locale, options).format(parsed.date);
      return;
    }

    const { text, next } = this.relative(parsed, locale);
    time.textContent = text;
    // Fora do documento ou com a aba oculta não agenda: a volta (connectedCallback, visibilitychange) atualiza.
    if (!this.isConnected || document.hidden) return;
    this.timer = window.setTimeout(() => this.update(), Math.min(Math.max(next, SECOND), HOUR));
  }
}

export default ArkTime;
