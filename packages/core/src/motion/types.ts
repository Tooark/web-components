import type { ArkDuration, ArkEasing } from "@tooark/tokens";

/** Presets de transição de entrada/saída. */
export type ArkMotionPreset = "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale";

/** Opções de uma animação de entrada/saída. */
export type ArkMotionOptions = {
  /** Token de duração ou valor em ms. Padrão: "default" em arkEnter e "quick" em arkExit. */
  duration?: ArkDuration | number;
  /** Token de easing ou string CSS (ex.: "ease-in-out"). Padrão: "out" em arkEnter e "in" em arkExit. */
  easing?: ArkEasing | string;
  /** Deslocamento dos presets de slide (ex.: "1rem"). Padrão: --ark-motion-distance. */
  distance?: string;
};
