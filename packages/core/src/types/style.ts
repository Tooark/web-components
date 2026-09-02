// Primitivas de design vêm de @tooark/tokens (reexportadas para compatibilidade).
import type { ArkIntent, ArkRounded, ArkSize, ArkStyleVariant, ArkTheme, ArkThemeSelected } from "@tooark/tokens";
export type { ArkIntent, ArkRounded, ArkSize, ArkStyleVariant, ArkTheme, ArkThemeSelected };

// Exports types globais (específicos de comportamento de componente)
export type ArkCarouselSnap = "mandatory" | "proximity";
export type ArkToastType = "default" | "success" | "info" | "warning" | "error" | "loading";
export type ArkToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

// Exports types específicos do componente button
export type ArkButtonType = "button" | "submit" | "reset";
export type ArkButtonVariant = ArkIntent | ArkStyleVariant;

// Exports types específicos do componente datepicker
export type ArkDatepickerLang = "en" | "pt" | "es" | "custom";

export type ArkButtonStyleOptions = {
  testid?: string;
  variant?: ArkButtonVariant;
  intent?: ArkIntent;
  theme?: ArkTheme;
  size?: ArkSize;
  rounded?: ArkRounded;
  loading?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  color?: string;
  textColor?: string;
};

export type ArkSwitchStyleOptions = {
  testid?: string;
  intent?: ArkIntent;
  theme?: ArkTheme;
  size?: ArkSize;
  checked?: boolean;
  labels?: boolean;
  labelOn?: string;
  labelOff?: string;
  icons?: boolean;
  color?: string;
};

export type ArkToggleStyleOptions = {
  testid?: string;
  intent?: ArkIntent;
  theme?: ArkTheme;
  size?: ArkSize;
  pressed?: boolean;
  value?: string;
};

export type ArkToggleGroupStyleOptions = {
  testid?: string;
  intent?: ArkIntent;
  theme?: ArkTheme;
  size?: ArkSize;
  value?: string;
  multiple?: boolean;
};

export type ArkCalendarEvent = {
  /** Data do evento em YYYY-MM-DD. */
  date: string;
  label?: string;
  /** Cor CSS custom do marcador; tem precedência sobre intent. */
  color?: string;
  intent?: ArkIntent;
};

export type ArkCalendarEventDisplay = "dots" | "count" | "list";

export type ArkCalendarStyleOptions = {
  testid?: string;
  theme?: ArkTheme;
  intent?: ArkIntent;
  accentColor?: string;
  events?: ArkCalendarEvent[];
  eventDisplay?: ArkCalendarEventDisplay;
};

export type ArkDatepickerMode = "datetime" | "date" | "time";

export type ArkDatepickerStyleOptions = {
  testid?: string;
  theme?: ArkTheme;
  intent?: ArkIntent;
  accentColor?: string;
  mode?: ArkDatepickerMode;
  input?: boolean;
  placeholder?: string;
  name?: string;
  format?: string;
  seconds?: boolean;
  disabled?: boolean;
  /** Repassados ao ark-calendar interno. */
  events?: ArkCalendarEvent[];
  eventDisplay?: ArkCalendarEventDisplay;
  /** Repassados ao ark-clock interno. */
  stepMinutes?: number;
  hoursFormat?: "24" | "12";
};

export type ArkSchedulerView = "week" | "day" | "month" | "agenda";

export type ArkSchedulerEvent = {
  id?: string;
  title: string;
  /** Início: "YYYY-MM-DDTHH:mm" (ou "YYYY-MM-DD" quando allDay). */
  start: string;
  /** Fim; ausente equivale a 1 hora após o início. */
  end?: string;
  allDay?: boolean;
  location?: string;
  /** Cor CSS custom; tem precedência sobre intent. */
  color?: string;
  intent?: ArkIntent;
};

export type ArkSchedulerStyleOptions = {
  testid?: string;
  theme?: ArkTheme;
  intent?: ArkIntent;
  view?: ArkSchedulerView;
  date?: string;
  events?: ArkSchedulerEvent[];
  hourStart?: number;
  hourEnd?: number;
  slotMinutes?: number;
  hoursFormat?: "24" | "12";
  views?: string;
};

export type ArkInputStyleOptions = {
  testid?: string;
  theme?: ArkTheme;
  intent?: ArkIntent;
  size?: ArkSize;
  rounded?: ArkRounded;
};

export type ArkClockStyleOptions = {
  testid?: string;
  theme?: ArkTheme;
  intent?: ArkIntent;
  seconds?: boolean;
  stepMinutes?: number;
  hoursFormat?: "24" | "12";
};

export type ArkCarouselStyleOptions = {
  testid?: string;
  theme?: ArkTheme;
  intent?: ArkIntent;
  accentColor?: string;
  slidesPerView?: number;
  gap?: number;
  startIndex?: number;
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  showDots?: boolean;
  showArrows?: boolean;
  dragFree?: boolean;
  snap?: ArkCarouselSnap;
};

export type ArkToasterStyleOptions = {
  testid?: string;
  theme?: ArkTheme;
  position?: ArkToastPosition;
  richColors?: boolean;
  closeButton?: boolean;
  maxVisible?: number;
  duration?: number;
};

export type ArkToastOptions = {
  id?: string;
  title: string;
  description?: string;
  type?: ArkToastType;
  duration?: number;
  actionLabel?: string;
  actionId?: string;
  cancelLabel?: string;
};
