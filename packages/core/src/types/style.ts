// Exports types globais
export type ArkIntent = "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral";
export type ArkSize = "sm" | "md" | "lg" | "xl";
export type ArkStyleVariant = "solid" | "outline" | "ghost";
export type ArkTheme = "auto" | ArkThemeSelected;
export type ArkThemeSelected = "light" | "dark";
export type ArkCarouselSnap = "mandatory" | "proximity";
export type ArkToastType = "default" | "success" | "info" | "warning" | "error" | "loading";
export type ArkToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

// Exports types específicos do componente button
export type ArkButtonType = "button" | "submit" | "reset";
export type ArkButtonVariant = ArkIntent | ArkStyleVariant;

// Exports types específicos do componente datepicker
export type ArkDatepickerLang = "en" | "pt" | "es" | "custom";

export type ArkButtonStyleOptions = {
  variant?: ArkButtonVariant;
  intent?: ArkIntent;
  theme?: ArkTheme;
  size?: ArkSize;
  color?: string;
  textColor?: string;
};

export type ArkDatepickerStyleOptions = {
  theme?: ArkTheme;
  intent?: ArkIntent;
  accentColor?: string;
};

export type ArkCarouselStyleOptions = {
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
