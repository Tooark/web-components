// Valores canônicos dos motion tokens (espelham tokens.css).
// Servem de fallback em JS/WAAPI quando as custom properties --ark-* não
// estão disponíveis no elemento (ex.: CSS de tokens não importado).

import type { ArkDuration, ArkEasing } from "./types";

/** Durações em milissegundos — espelho de --ark-duration-*. */
export const ARK_DURATION_MS: Record<ArkDuration, number> = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600
};

/** Easings como strings CSS — espelho de --ark-ease-*. */
export const ARK_EASING_CSS: Record<ArkEasing, string> = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
};

/** Deslocamento padrão de slides — espelho de --ark-motion-distance. */
export const ARK_MOTION_DISTANCE = "0.75rem";
