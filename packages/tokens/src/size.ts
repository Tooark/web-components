// Valores canônicos da escala de tamanho (espelham tokens.css).
// Servem de fallback em JS quando as custom properties --ark-size-* não
// estão na página (ex.: CSS de tokens não importado).

import type { ArkSize } from "./types";

/** Altura mínima dos controles por tamanho — espelho de --ark-size-*. */
export const ARK_SIZE_CSS: Record<ArkSize, string> = {
  xs: "1.5rem",
  sm: "1.75rem",
  md: "2.25rem",
  lg: "2.75rem",
  xl: "3.25rem"
};
