// Primitivas de design do Tooark — o vocabulário base do design system.
// Compartilhado por todos os componentes e wrappers de framework.

/** Intenções semânticas de cor. */
export type ArkIntent = "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral";

/** Escala de tamanho dos controles (altura mínima via --size-*). */
export type ArkSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Variantes de estilo visual. */
export type ArkStyleVariant = "solid" | "outline" | "ghost";

/** Escala de arredondamento de borda ("full" transforma quadrados em círculos). */
export type ArkRounded = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";

/** Escala de duração de animações. */
export type ArkDuration = "none" | "instant" | "quick" | "default" | "moderate" | "gentle" | "slow" | "long";

/** Curvas de easing de animações. */
export type ArkEasing = "linear" | "standard" | "in" | "out" | "in-out" | "overshoot";

/** Tema resolvido (sem "auto"). */
export type ArkThemeSelected = "light" | "dark";

/** Tema; "auto" herda o color-scheme da página. */
export type ArkTheme = "auto" | ArkThemeSelected;
