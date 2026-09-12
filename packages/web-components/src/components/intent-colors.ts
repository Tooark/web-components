import type { ArkIntent } from "@tooark/core";

const INTENTS: ArkIntent[] = ["primary", "secondary", "success", "warning", "danger", "info", "neutral"];

/** Devolve um ArkIntent válido a partir de um atributo, caindo no fallback quando não reconhece. */
export function normalizeIntent(value: string | null | undefined, fallback: ArkIntent = "primary"): ArkIntent {
  const intent = (value || "").toLowerCase() as ArkIntent;
  return INTENTS.includes(intent) ? intent : fallback;
}

/**
 * Cores de um item colorido por intent (eventos do calendário/agenda), como
 * valores CSS para uso em `style`. Apontam para os tokens semânticos, então
 * seguem o tema (light-dark) e a marca do consumidor. Uma `color` custom tem
 * precedência e recebe texto branco, como antes.
 */
export function intentColors(
  intent: string | null | undefined,
  customColor?: string | null,
  fallback: ArkIntent = "primary"
): { bg: string; fg: string } {
  if (customColor) return { bg: customColor, fg: "#fff" };
  const name = normalizeIntent(intent, fallback);
  return { bg: `var(--ark-color-${name})`, fg: `var(--ark-color-${name}-fg)` };
}
