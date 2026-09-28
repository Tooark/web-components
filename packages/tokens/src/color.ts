// Cores suaves de cada intent (espelham tokens.css), como `light-dark()`: resolvem
// pelo color-scheme do elemento que as usa. Servem de fallback em JS quando as
// custom properties --ark-color-* não estão na página (ex.: CSS de tokens não importado).

import type { ArkIntent } from "./types";

/** Fundo (`soft`) e texto (`softFg`) suaves de cada intent — espelho de --ark-color-<intent>-soft e -soft-fg. */
export const ARK_INTENT_SOFT_CSS: Record<ArkIntent, { soft: string; softFg: string }> = {
  primary: {
    soft: "light-dark(#fffbeb, color-mix(in oklab, #78350f 40%, transparent))",
    softFg: "light-dark(#b45309, #fbbf24)"
  },
  secondary: {
    soft: "light-dark(oklch(98.4% 0.003 247.858), oklch(27.9% 0.041 260.031))",
    softFg: "light-dark(oklch(20.8% 0.042 265.755), oklch(96.8% 0.007 247.896))"
  },
  success: {
    soft: "light-dark(oklch(97.9% 0.021 166.113), color-mix(in oklab, oklch(26.2% 0.051 172.552) 40%, transparent))",
    softFg: "light-dark(oklch(50.8% 0.118 165.612), oklch(84.5% 0.143 164.978))"
  },
  warning: {
    soft: "light-dark(oklch(98.7% 0.026 102.212), color-mix(in oklab, oklch(42.1% 0.095 57.708) 40%, transparent))",
    softFg: "light-dark(oklch(55.4% 0.135 66.442), oklch(90.5% 0.182 98.111))"
  },
  danger: {
    soft: "light-dark(oklch(97.1% 0.013 17.38), color-mix(in oklab, oklch(25.8% 0.092 26.042) 40%, transparent))",
    softFg: "light-dark(oklch(50.5% 0.213 27.518), oklch(80.8% 0.114 19.571))"
  },
  info: {
    soft: "light-dark(oklch(97.7% 0.013 236.62), color-mix(in oklab, oklch(29.3% 0.066 243.157) 40%, transparent))",
    softFg: "light-dark(oklch(50% 0.134 242.749), oklch(82.8% 0.111 230.318))"
  },
  neutral: {
    soft: "light-dark(oklch(98.5% 0 none), oklch(27.4% 0.006 286.033))",
    softFg: "light-dark(oklch(37% 0.013 285.805), oklch(92% 0.004 286.32))"
  }
};
