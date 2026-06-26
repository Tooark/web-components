// Primitivas de design do Tooark — o vocabulário base do design system.
// Compartilhado por todos os componentes e wrappers de framework.

/** Intenções semânticas de cor. */
export type ArkIntent =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

/** Escala de tamanho. */
export type ArkSize = "sm" | "md" | "lg" | "xl";

/** Variantes de estilo visual. */
export type ArkStyleVariant = "solid" | "outline" | "ghost";

/** Tema resolvido (sem "auto"). */
export type ArkThemeSelected = "light" | "dark";

/** Tema, incluindo resolução automática via preferência do sistema. */
export type ArkTheme = "auto" | ArkThemeSelected;
