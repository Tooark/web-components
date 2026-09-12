/** Strings e convenções de calendário de um idioma, usadas por calendar, clock, datepicker e scheduler. */
export interface ArkDatepickerLocale {
  /** Nomes dos 12 meses por extenso, de janeiro a dezembro. */
  months: string[];
  /** Abreviações dos 12 meses, na mesma ordem. */
  monthsShort: string[];
  /** Formas mínimas dos 12 meses, na mesma ordem. */
  monthsMin: string[];
  /** Nomes dos 7 dias da semana por extenso, começando no domingo. */
  weekdays: string[];
  /** Abreviações dos 7 dias da semana, na mesma ordem. */
  weekdaysShort: string[];
  /** Formas mínimas dos 7 dias, usadas no cabeçalho da grade. */
  weekdaysMin: string[];
  /** Rótulo do botão que volta para a data de hoje. */
  today: string;
  /** Rótulo do botão que limpa o valor. */
  clear: string;
  /** Rótulo acessível do botão de fechar do ark-toaster. */
  close: string;
  /** Primeiro dia da semana, de 0 (domingo) a 6 (sábado). */
  firstDayOfWeek: number;
  /** Rótulo acessível da seta que volta um mês. */
  previousMonth: string;
  /** Rótulo acessível da seta que avança um mês. */
  nextMonth: string;
  /** Rótulo acessível do botão que abre o calendário e do popup do datepicker. */
  openCalendar: string;
  /** Título da coluna de horas. */
  hours: string;
  /** Título da coluna de minutos. */
  minutes: string;
  /** Título da coluna de segundos. */
  seconds: string;
  /** Palavra "eventos", usada depois da contagem no rótulo acessível do dia. */
  events: string;
  /** Rótulo da view de semana da agenda. */
  week: string;
  /** Rótulo da view de dia da agenda. */
  day: string;
  /** Rótulo da view de mês da agenda. */
  month: string;
  /** Rótulo da view de lista da agenda. */
  agenda: string;
  /** Rótulo da faixa de eventos de feriado. */
  holiday: string;
  /** Rótulo da faixa de eventos de dia inteiro. */
  allDay: string;
  /** Texto exibido quando o período não tem nenhum evento. */
  noEvents: string;
}
