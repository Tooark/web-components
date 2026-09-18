// Primitivas de design vêm de @tooark/tokens (reexportadas para compatibilidade).
import type { ArkIntent, ArkRounded, ArkSize, ArkStyleVariant, ArkTheme, ArkThemeSelected } from "@tooark/tokens";

// Reexporta tipos primitivos de design do pacote @tooark/tokens.
export type { ArkIntent, ArkRounded, ArkSize, ArkStyleVariant, ArkTheme, ArkThemeSelected };

// Exports types globais (específicos de comportamento de componente)

/** Rigidez do encaixe do carrossel: "mandatory" sempre encaixa, "proximity" só quando o slide está perto. */
export type ArkCarouselSnap = "mandatory" | "proximity";

/** Tipo do toast, que define o ícone e a cor do card. */
export type ArkToastType = "default" | "success" | "info" | "warning" | "error" | "loading";

/** Canto da tela onde a pilha de toasts é ancorada. */
export type ArkToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// Exports types específicos do componente button

/** Papel do botão no formulário, como o type do <button> nativo. */
export type ArkButtonType = "button" | "submit" | "reset";

/** Aparência do botão: uma variante de estilo ou um intent semântico. */
export type ArkButtonVariant = ArkIntent | ArkStyleVariant;

/** Feedback do resultado no botão: nada, check de sucesso ou alerta de erro. */
export type ArkButtonStatus = "idle" | "success" | "error";

// Exports types específicos do componente datepicker

/** Idioma dos rótulos dos componentes; "custom" usa as strings fornecidas em locale-json. */
export type ArkLang = "en" | "pt" | "es" | "custom";

/** Nome anterior de ArkLang, mantido por compatibilidade. */
export type ArkDatepickerLang = ArkLang;

// Exports types específicos do componente badge

/** Preenchimento do badge: fundo suave, sólido ou só contorno. */
export type ArkBadgeVariant = "soft" | "solid" | "outline";

/** Tamanho do badge; é um rótulo inline, por isso só os três menores. */
export type ArkBadgeSize = "xs" | "sm" | "md";

/** Props de estilo do ark-badge. */
export type ArkBadgeStyleOptions = {
  /** Propagado como data-testid ao host. */
  testid?: string;
  /** Intenção semântica de cor. Padrão: "neutral". */
  intent?: ArkIntent;
  /** Preenchimento. Padrão: "soft". */
  variant?: ArkBadgeVariant;
  /** Tamanho; a altura vem da fonte e do padding, não do token de controle. Padrão: "md". */
  size?: ArkBadgeSize;
  /** Raio dos cantos. Padrão: "full". */
  rounded?: ArkRounded;
  /** Cor própria (qualquer cor CSS) no lugar do intent: texto na cor, fundo suave e contorno por color-mix. */
  color?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
};

// Exports types específicos de estilo do componente button

/** Props de estilo e comportamento do ark-button. */
export type ArkButtonStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Aparência: variante de estilo ou intent. Padrão: "primary". */
  variant?: ArkButtonVariant;
  /** Intenção semântica de cor. Padrão: "primary". */
  intent?: ArkIntent;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Altura do controle via token --ark-size-*. Padrão: "md". */
  size?: ArkSize;
  /** Arredondamento da borda. Padrão: "md" ("full" com iconOnly gera um botão circular). */
  rounded?: ArkRounded;
  /** Mostra o spinner, marca aria-busy e bloqueia o clique. */
  loading?: boolean;
  /** Feedback do resultado: "success" ou "error" trocam o glifo (loading vence). Padrão: "idle". */
  status?: ArkButtonStatus;
  /** Texto anunciado ao leitor de tela (announce do core) quando status vira success ou error. */
  statusLabel?: string;
  /** Botão quadrado, com min-width igual ao token de tamanho. */
  iconOnly?: boolean;
  /** Ocupa toda a largura disponível. */
  fullWidth?: boolean;
  /** Vira link: um <a> esticado cobre o host e recebe o foco. */
  href?: string;
  /** Alvo do link; "_blank" ganha rel="noopener noreferrer" automaticamente. */
  target?: string;
  /** Cor de fundo CSS custom, com precedência sobre variant/intent. */
  color?: string;
  /** Cor do texto CSS custom, usada junto de color. */
  textColor?: string;
};

// Exports types específicos do componente checkbox

/** Props de estilo e comportamento do ark-checkbox. */
export type ArkCheckboxStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Intenção semântica de cor da caixa marcada. Padrão: "primary". */
  intent?: ArkIntent;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Tamanho da caixa e do rótulo, na escala de espaçamento (a caixa é um glifo, não um controle de altura). Padrão: "md". */
  size?: ArkSize;
  /** Marcado. */
  checked?: boolean;
  /** Estado misto (aria-checked="mixed", traço no lugar do check); o próximo clique o limpa. */
  indeterminate?: boolean;
};

// Exports types específicos do componente radio

/** Props de estilo e comportamento do ark-radio. */
export type ArkRadioStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Intenção semântica de cor da opção marcada. Padrão: "primary". */
  intent?: ArkIntent;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Tamanho da opção e do rótulo, na escala de espaçamento. Padrão: "md". */
  size?: ArkSize;
  /** Marcado; marcar um desmarca os outros do mesmo `name`. */
  checked?: boolean;
};

// Exports types específicos do componente spinner

/** Props de estilo do ark-spinner. */
export type ArkSpinnerStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas partes internas. */
  testid?: string;
  /** Diâmetro na escala de espaçamento (0.75 a 2 rem). Padrão: "md" (1.25 rem). */
  size?: ArkSize;
  /** Cor pelo intent. Padrão: herda a cor do texto ao redor. */
  intent?: ArkIntent;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Idioma do rótulo padrão para leitores de tela (string `loading`). Padrão: "en". */
  lang?: ArkLang;
  /** JSON com strings próprias, mesclado sobre o inglês, quando lang é "custom". */
  localeJson?: string;
};

/** Props de estilo e comportamento do ark-switch. */
export type ArkSwitchStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Intenção semântica de cor do trilho ligado. Padrão: "primary". */
  intent?: ArkIntent;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Tamanho do switch, que tem tabela de proporções própria. Padrão: "md". */
  size?: ArkSize;
  /** Estado ligado. */
  checked?: boolean;
  /** Mostra os rótulos de estado dentro do trilho. */
  labels?: boolean;
  /** Texto do estado ligado quando labels está ativo. Padrão: "ON". */
  labelOn?: string;
  /** Texto do estado desligado quando labels está ativo. Padrão: "OFF". */
  labelOff?: string;
  /** Mostra os ícones de check/cruz no polegar. */
  icons?: boolean;
  /** Cor CSS custom do trilho ligado, com precedência sobre intent. */
  color?: string;
};

/** Props de estilo e comportamento do ark-toggle. */
export type ArkToggleStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Intenção semântica de cor. Padrão: "primary". */
  intent?: ArkIntent;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Altura do controle via token --ark-size-*. Padrão: "md". */
  size?: ArkSize;
  /** Estado pressionado (aria-pressed). */
  pressed?: boolean;
  /** Valor que identifica o item dentro de um ark-toggle-group. */
  value?: string;
};

/** Props de estilo e comportamento do ark-toggle-group. */
export type ArkToggleGroupStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Intenção semântica de cor, propagada aos itens. Padrão: "primary". */
  intent?: ArkIntent;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Altura dos itens via token --ark-size-*, propagada a eles. Padrão: "md". */
  size?: ArkSize;
  /** Valor selecionado; lista separada por vírgula quando multiple está ativo. */
  value?: string;
  /** Permite mais de um item selecionado. Padrão: seleção exclusiva. */
  multiple?: boolean;
};

/** Evento exibido como marcador num dia do ark-calendar. */
export type ArkCalendarEvent = {
  /** Data do evento em YYYY-MM-DD. */
  date: string;
  /** Texto do evento, mostrado no modo "list" e no title do marcador. */
  label?: string;
  /** Cor CSS custom do marcador; tem precedência sobre intent. */
  color?: string;
  /** Intenção semântica de cor do marcador. Padrão: "primary". */
  intent?: ArkIntent;
};

/** Forma de exibir os eventos de um dia na grade do calendário. */
export type ArkCalendarEventDisplay = "dots" | "count" | "list";

/** Props de estilo e comportamento do ark-calendar. */
export type ArkCalendarStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Intenção semântica de cor da seleção e do dia de hoje. Padrão: "primary". */
  intent?: ArkIntent;
  /** Cor CSS custom de destaque, com precedência sobre intent. */
  accentColor?: string;
  /** Eventos exibidos na grade; equivale ao atributo events em JSON. */
  events?: ArkCalendarEvent[];
  /** Forma de exibir os eventos do dia. Padrão: "dots". */
  eventDisplay?: ArkCalendarEventDisplay;
};

/** Partes editáveis do datepicker, que definem o formato do valor emitido. */
export type ArkDatepickerMode = "datetime" | "date" | "time";

/** Props de estilo e comportamento do ark-datepicker. */
export type ArkDatepickerStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Intenção semântica de cor, repassada aos painéis internos. Padrão: "primary". */
  intent?: ArkIntent;
  /** Cor CSS custom de destaque, com precedência sobre intent. */
  accentColor?: string;
  /** Partes editáveis. Padrão: "datetime", com valor YYYY-MM-DDTHH:mm:ss. */
  mode?: ArkDatepickerMode;
  /** Renderiza campo + popup; sem isso, os painéis ficam inline. */
  input?: boolean;
  /** Texto do campo vazio; só tem efeito com input. */
  placeholder?: string;
  /** Nome no formulário; o valor ISO é submetido por um input hidden. */
  name?: string;
  /**
   * Formato de exibição do campo, com os tokens YYYY MM DD HH mm ss (sensível a
   * maiúsculas). Padrão: "MM/DD/YYYY HH:mm" em en e "DD/MM/YYYY HH:mm" nos demais.
   */
  format?: string;
  /** Inclui segundos no valor e na coluna de tempo. */
  seconds?: boolean;
  /** Bloqueia a interação no campo e nos painéis. */
  disabled?: boolean;
  /** Eventos repassados ao ark-calendar interno. */
  events?: ArkCalendarEvent[];
  /** Forma de exibição dos eventos, repassada ao ark-calendar interno. Padrão: "dots". */
  eventDisplay?: ArkCalendarEventDisplay;
  /** Passo da coluna de minutos do ark-clock interno. Padrão: 1. */
  stepMinutes?: number;
  /** Exibição das horas no ark-clock interno; o valor continua em 24h. Padrão: "24". */
  hoursFormat?: "24" | "12";
};

/** Modo de visualização da agenda. */
export type ArkSchedulerView = "week" | "day" | "month" | "agenda";

/** Evento posicionado na grade do ark-scheduler. */
export type ArkSchedulerEvent = {
  /** Identificador devolvido em ark-event-click. */
  id?: string;
  /** Título mostrado no bloco do evento. */
  title: string;
  /** Início: "YYYY-MM-DDTHH:mm" (ou "YYYY-MM-DD" quando allDay). */
  start: string;
  /** Fim; ausente equivale a 1 hora após o início. */
  end?: string;
  /** Evento de dia inteiro: vai para a faixa acima da grade de horas. */
  allDay?: boolean;
  /** Local mostrado junto do título quando há espaço no bloco. */
  location?: string;
  /** Cor CSS custom; tem precedência sobre intent. */
  color?: string;
  /** Intenção semântica de cor do bloco. Padrão: "primary". */
  intent?: ArkIntent;
};

/** Props de estilo e comportamento do ark-scheduler. */
export type ArkSchedulerStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Intenção semântica de cor dos eventos e da linha de agora. Padrão: "primary". */
  intent?: ArkIntent;
  /** Visualização atual, sincronizada ao trocar pelo seletor. Padrão: "week". */
  view?: ArkSchedulerView;
  /** Data de referência em YYYY-MM-DD, sincronizada ao navegar. */
  date?: string;
  /** Eventos da agenda; equivale ao atributo events em JSON. */
  events?: ArkSchedulerEvent[];
  /** Primeira hora visível nas views de horário. Padrão: 0. */
  hourStart?: number;
  /** Última hora visível nas views de horário. Padrão: 24. */
  hourEnd?: number;
  /** Duração de cada faixa da grade em minutos, de 15 a 60. Padrão: 60. */
  slotMinutes?: number;
  /** Exibição das horas na régua. Padrão: "24". */
  hoursFormat?: "24" | "12";
  /** Limita o seletor de views, separadas por vírgula (ex.: "day,week"). */
  views?: string;
};

/** Props de estilo do ark-input. */
export type ArkInputStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Intenção semântica de cor do foco e da borda. Padrão: "primary". */
  intent?: ArkIntent;
  /** Altura do campo via token --ark-size-*. Padrão: "md". */
  size?: ArkSize;
  /** Arredondamento da borda do campo. Padrão: "lg". */
  rounded?: ArkRounded;
};

// Exports types específicos do componente dialog

/** Largura máxima do painel do diálogo. */
export type ArkDialogSize = "sm" | "md" | "lg" | "xl" | "full";

/** Origem de um fechamento do diálogo, publicada em `ark-close`. */
export type ArkDialogCloseReason = "escape" | "backdrop" | "close-button" | "api";

/** Props de estilo do ark-dialog. */
export type ArkDialogStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas partes internas. */
  testid?: string;
  /** Largura máxima do painel; "full" ocupa a viewport inteira, sem cantos. Padrão: "md". */
  size?: ArkDialogSize;
  /** Largura própria (comprimento CSS; número vira px): sobrescreve o preset no eixo, limitada à viewport. */
  width?: string | number;
  /** Altura própria (comprimento CSS; número vira px), limitada à viewport. Padrão: a altura do conteúdo. */
  height?: string | number;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Idioma do rótulo do botão de fechar. Padrão: "en". */
  lang?: ArkLang;
  /** Strings customizadas (JSON) quando lang é "custom". */
  localeJson?: string;
};

// Exports types específicos do componente menu

/** Alinhamento do menu em relação ao gatilho. */
export type ArkMenuAlign = "start" | "end";

/** Lado do gatilho onde o menu abre; vira para o outro quando não cabe. */
export type ArkMenuDirection = "down" | "up";

/** Props de estilo do ark-menu, propagadas a cada ark-menu-item. */
export type ArkMenuStyleOptions = {
  /** Propagado como data-testid ao host. */
  testid?: string;
  /** Altura dos itens via token --ark-size-*. Padrão: "md". */
  size?: ArkSize;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
};

/** Props de estilo do ark-menu-item; size e theme chegam propagados do ark-menu. */
export type ArkMenuItemStyleOptions = {
  /** Propagado como data-testid ao host. */
  testid?: string;
  /** Cor do texto e do hover; "danger" para ações destrutivas. Padrão: cor de texto e hover neutro. */
  intent?: ArkIntent;
};

// Exports types específicos do componente tooltip

/** Lado do gatilho onde a dica abre; vira para o oposto quando não cabe. */
export type ArkTooltipSide = "top" | "bottom" | "left" | "right";

/** Props de estilo do ark-tooltip. */
export type ArkTooltipStyleOptions = {
  /** Propagado como data-testid ao host e sufixado no balão. */
  testid?: string;
  /** Lado do gatilho. Padrão: "top". */
  side?: ArkTooltipSide;
  /** Atraso em ms antes de abrir no hover; o foco abre na hora. Padrão: 200. */
  delay?: number;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
};

// Exports types específicos do componente alert

/** Forma do ark-alert: caixa arredondada ou banner de largura toda com borda inferior. */
export type ArkAlertVariant = "box" | "banner";

/** Live region do ark-alert: role="status" (polite), role="alert" (assertive) ou nenhuma (off). */
export type ArkAlertLive = "polite" | "assertive" | "off";

/** Props de estilo do ark-alert. */
export type ArkAlertStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas partes internas. */
  testid?: string;
  /** Intenção semântica de cor (fundo e borda suaves). Padrão: "info". */
  intent?: ArkIntent;
  /** Caixa arredondada ou banner de largura toda. Padrão: "box". */
  variant?: ArkAlertVariant;
  /** Live region. Padrão: "assertive" em warning e danger, "polite" nos demais. */
  live?: ArkAlertLive;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Idioma do rótulo do botão de dispensar. Padrão: "en". */
  lang?: ArkLang;
  /** JSON com strings próprias, mesclado sobre o inglês, quando lang é "custom". */
  localeJson?: string;
};

// Exports types específicos do componente card

/** Escala do espaçamento interno do ark-card (padding do host e gap entre as linhas). */
export type ArkCardPadding = "none" | "sm" | "md" | "lg";

/** Props de estilo do ark-card. */
export type ArkCardStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas partes internas. */
  testid?: string;
  /** Espaçamento interno: padding do host e gap entre as linhas (0 / 0.75 / 1 / 1.5 rem). Padrão: "md". */
  padding?: ArkCardPadding;
  /** Raio dos cantos. Padrão: "lg". */
  rounded?: ArkRounded;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
};

// Exports types específicos do componente empty

/** Props de estilo do ark-empty. */
export type ArkEmptyStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
};

// Exports types específicos do componente skeleton

/** Props de estilo do ark-skeleton. */
export type ArkSkeletonStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas barras. */
  testid?: string;
  /** Raio dos cantos. Padrão: o do preset .ark-skeleton (lg). */
  rounded?: ArkRounded;
  /** Cor base própria (qualquer cor CSS) no lugar de muted, para skeletons sobre superfícies coloridas. */
  color?: string;
  /** Proporção do bloco ("16/9", "9/16", "1/1", "16:9" ou número): a altura vem da largura. Ignorado com rows. */
  ratio?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
};

// Exports types específicos do componente progress

/** Props de estilo do ark-progress. */
export type ArkProgressStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas partes internas. */
  testid?: string;
  /** Intenção semântica de cor da barra. Padrão: "primary". */
  intent?: ArkIntent;
  /** Altura do trilho (0.25 a 1 rem) e tamanho do texto do valor. Padrão: "md". */
  size?: ArkSize;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
};

// Exports types específicos do componente select

/** Opção do ark-select; `group` agrupa em um <optgroup> com esse rótulo. */
export type ArkSelectOption = {
  /** Valor enviado no formulário e devolvido em `change`. */
  value: string;
  /** Texto exibido. */
  label: string;
  /** Opção presente mas não selecionável. */
  disabled?: boolean;
  /** Rótulo do <optgroup> que agrupa esta opção. */
  group?: string;
};

/** Props de estilo do ark-select. */
export type ArkSelectStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Intenção semântica de cor do foco e da borda. Padrão: "primary". */
  intent?: ArkIntent;
  /** Altura do campo via token --ark-size-*. Padrão: "md". */
  size?: ArkSize;
  /** Arredondamento da borda do campo. Padrão: "lg". */
  rounded?: ArkRounded;
};

// Exports types específicos do componente tabs

/** Estilo da faixa de abas: sublinhado, chips de filtro ou abas de editor (fecháveis). */
export type ArkTabsVariant = "underline" | "chips" | "editor";

/** Pintura da aba ativa: nenhuma, a versão suave do intent ou o intent sólido com texto de contraste. */
export type ArkTabsFill = "none" | "soft" | "solid";

/** Props de estilo do ark-tabs, propagadas a cada ark-tab. */
export type ArkTabsStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas partes internas. */
  testid?: string;
  /** Estilo da faixa. Padrão: "underline". */
  variant?: ArkTabsVariant;
  /** Altura das abas via token --ark-size-*. Padrão: "md". */
  size?: ArkSize;
  /** Intenção semântica de cor da aba ativa e do anel de foco. Padrão: "primary". */
  intent?: ArkIntent;
  /** Cantos das abas; em editor só o topo. Padrão: "full" em chips, "none" nas outras variantes. */
  rounded?: ArkRounded;
  /** Pintura da aba ativa. Padrão: "soft" em chips, "none" nas outras variantes. */
  fill?: ArkTabsFill;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Idioma dos rótulos internos (fechar aba, não salvo). Padrão: "en". */
  lang?: ArkLang;
  /** Strings customizadas (JSON) quando lang é "custom". */
  localeJson?: string;
};

/** Props de estilo do ark-tab; estilo, tamanho e idioma chegam propagados do ark-tabs. */
export type ArkTabStyleOptions = {
  /** Propagado como data-testid ao host e sufixado nas partes internas (close, dirty). */
  testid?: string;
};

// Exports types específicos do componente textarea

/** Direções em que o usuário pode redimensionar a área de texto. */
export type ArkTextareaResize = "none" | "vertical";

/** Props de estilo do ark-textarea. */
export type ArkTextareaStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Intenção semântica de cor do foco e da borda. Padrão: "primary". */
  intent?: ArkIntent;
  /** Fonte, padding e altura mínima (uma linha alinha com o ark-input) via token --ark-size-*. Padrão: "md". */
  size?: ArkSize;
  /** Arredondamento da borda do campo. Padrão: "lg". */
  rounded?: ArkRounded;
};

/** Props de estilo e comportamento do ark-clock. */
export type ArkClockStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Intenção semântica de cor da opção selecionada. Padrão: "primary". */
  intent?: ArkIntent;
  /** Mostra a coluna de segundos. */
  seconds?: boolean;
  /** Passo da coluna de minutos. Padrão: 1. */
  stepMinutes?: number;
  /** "12" adiciona a coluna AM/PM; o valor continua em 24h. Padrão: "24". */
  hoursFormat?: "24" | "12";
};

/** Props de estilo e comportamento do ark-carousel. */
export type ArkCarouselStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Intenção semântica de cor das setas e dos dots. Padrão: "primary". */
  intent?: ArkIntent;
  /** Cor CSS custom de destaque, com precedência sobre intent. */
  accentColor?: string;
  /** Slides visíveis por vez. Padrão: 1. */
  slidesPerView?: number;
  /** Espaço entre slides em px. Padrão: 12. */
  gap?: number;
  /** Slide mostrado na montagem. Padrão: 0. */
  startIndex?: number;
  /** Volta ao primeiro slide ao passar do último. */
  loop?: boolean;
  /** Avança sozinho; pausa em hover/foco e desliga com prefers-reduced-motion. */
  autoplay?: boolean;
  /** Intervalo do autoplay em ms. Padrão: 4200. */
  autoplayDelay?: number;
  /** Mostra os indicadores de slide. Padrão: true. */
  showDots?: boolean;
  /** Mostra as setas de navegação. Padrão: true. */
  showArrows?: boolean;
  /** Arrasto livre, sem encaixar no slide mais próximo ao soltar. */
  dragFree?: boolean;
  /** Rigidez do encaixe da rolagem. Padrão: "mandatory". */
  snap?: ArkCarouselSnap;
};

/** Props de estilo e comportamento do ark-toaster. */
export type ArkToasterStyleOptions = {
  /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
  testid?: string;
  /** Força claro/escuro neste elemento e nos descendentes. Padrão: herda o color-scheme da página. */
  theme?: ArkTheme;
  /** Canto da tela onde a pilha é ancorada. Padrão: "bottom-right". */
  position?: ArkToastPosition;
  /** Colore o card inteiro conforme o tipo, em vez de só o ícone. */
  richColors?: boolean;
  /** Mostra o botão de fechar em cada toast. Padrão: true. */
  closeButton?: boolean;
  /** Toasts visíveis ao mesmo tempo; o excedente espera na fila. Padrão: 4. */
  maxVisible?: number;
  /** Tempo em tela em ms; 0 mantém o toast até ser fechado. Padrão: 4000. */
  duration?: number;
};

/** Conteúdo e comportamento de um toast disparado pelo serviço toast. */
export type ArkToastOptions = {
  /** Identificador para dispensar depois; gerado automaticamente quando ausente. */
  id?: string;
  /** Texto principal do toast. */
  title: string;
  /** Texto secundário, abaixo do título. */
  description?: string;
  /** Tipo, que define o ícone e a cor. Padrão: "default". */
  type?: ArkToastType;
  /** Sobrescreve a duração do toaster em ms; 0 mantém até ser fechado. */
  duration?: number;
  /** Rótulo do botão de ação; sem ele o botão não aparece. */
  actionLabel?: string;
  /** Devolvido em ark-toast-action ao clicar na ação. */
  actionId?: string;
  /** Rótulo do botão de cancelar, que apenas dispensa o toast. */
  cancelLabel?: string;
};
