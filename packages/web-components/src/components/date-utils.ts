// Helpers de data compartilhados pelos componentes de calendário/agenda.
//
// Regra central: strings ISO são interpretadas no fuso LOCAL. `new Date("2026-09-04")`
// usa meia-noite UTC, o que desloca a data em um dia em fusos negativos (UTC-3) —
// origem clássica de "clico no dia 4 e seleciona o 3".

/** Converte "YYYY-MM-DD" (ou data completa) em Date local; null se inválida. */
export function parseLocalDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  const parsed = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Converte "YYYY-MM-DDTHH:mm[:ss]" (T ou espaço) em Date local; null se inválida. */
export function parseLocalDateTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(value.trim());
  if (!match) return null;
  const parsed = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] || 0),
    Number(match[5] || 0),
    Number(match[6] || 0)
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Inteiro com dois dígitos, preenchido com zero à esquerda. */
export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Formata a data como "YYYY-MM-DD" no fuso local. */
export function formatISODate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Formata a hora como "HH:mm" (ou "HH:mm:ss") no fuso local. */
export function formatISOTime(date: Date, withSeconds = false): string {
  const base = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return withSeconds ? `${base}:${pad2(date.getSeconds())}` : base;
}

/** Formata data e hora como "YYYY-MM-DDTHH:mm[:ss]" no fuso local. */
export function formatISODateTime(date: Date, withSeconds = false): string {
  return `${formatISODate(date)}T${formatISOTime(date, withSeconds)}`;
}

/** Meia-noite local do dia informado. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Soma dias preservando a hora; amount negativo subtrai. */
export function addDays(date: Date, amount: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + amount,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
}

/** Soma meses preservando o dia quando possível (31 de janeiro + 1 mês = 28/29 de fevereiro). */
export function addMonths(date: Date, amount: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

/** Compara ano, mês e dia; ignora a hora. */
export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Início da semana que contém `date`, respeitando o primeiro dia da semana do locale. */
export function startOfWeek(date: Date, firstDayOfWeek: number): Date {
  let diff = date.getDay() - firstDayOfWeek;
  if (diff < 0) diff += 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
}

/** Minutos decorridos desde a meia-noite, usado para posicionar eventos na grade. */
export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}
