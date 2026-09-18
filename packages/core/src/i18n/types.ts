/** Strings de interface e convenções de calendário de um idioma, compartilhadas por todos os componentes. */
export interface ArkLocale {
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
  /** Rótulo acessível dos botões de fechar (toaster, dialog, drawer). */
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
  /** Rótulo acessível do botão que dispensa um alerta. */
  dismiss: string;
  /** Rótulo do botão de copiar. */
  copy: string;
  /** Texto de confirmação depois de copiar. */
  copied: string;
  /** Texto exibido quando uma busca não encontra nada. */
  noResults: string;
  /** Placeholder e rótulo do campo de busca. */
  search: string;
  /** Rótulo do botão que abre o seletor de arquivos. */
  chooseFile: string;
  /** Dica da área de soltar arquivos. */
  dropHint: string;
  /** Texto exibido quando nenhum arquivo foi escolhido. */
  noFile: string;
  /** Rótulo acessível do botão que revela a senha. */
  showPassword: string;
  /** Rótulo acessível do botão que oculta a senha. */
  hidePassword: string;
  /** Rótulo acessível do spinner e de estados de carregamento. */
  loading: string;
  /** Rótulo do botão de adicionar. */
  add: string;
  /** Rótulo do modo de edição em massa do editor chave/valor. */
  bulkEdit: string;
  /** Rótulo do modo de edição em tabela do editor chave/valor. */
  tableEdit: string;
  /** Palavra "entradas", usada depois da contagem. */
  entries: string;
  /** Texto exibido quando o editor chave/valor está vazio. */
  noEntries: string;
  /** Rótulo acessível do botão que remove uma linha. */
  deleteRow: string;
  /** Rótulo acessível do indicador de alterações não salvas. */
  unsaved: string;
  /** Rótulo acessível do botão que fecha uma aba. */
  closeTab: string;
  /** Nome da forma círculo (ark-shape-picker). */
  shapeCircle: string;
  /** Nome da forma quadrado. */
  shapeSquare: string;
  /** Nome da forma triângulo. */
  shapeTriangle: string;
  /** Nome da forma losango. */
  shapeDiamond: string;
  /** Nome da forma estrela. */
  shapeStar: string;
  /** Nome da forma hexágono. */
  shapeHexagon: string;
  /** Rótulo acessível da alça que redimensiona painéis. */
  resize: string;
  /** Rótulo acessível da coluna de tipo do editor chave/valor. */
  type: string;
  /** Rótulo acessível do cadeado que marca uma linha do editor chave/valor como segredo. */
  secret: string;
}

/** Nome anterior de ArkLocale, mantido por compatibilidade. */
export type ArkDatepickerLocale = ArkLocale;
