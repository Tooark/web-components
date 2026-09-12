import { en } from "./en";
import { es } from "./es";
import { pt } from "./pt";
import type { ArkDatepickerLocale } from "./types";

export { en } from "./en";
export { es } from "./es";
export { pt } from "./pt";
export type { ArkDatepickerLocale } from "./types";

const builtinLocales: Record<string, ArkDatepickerLocale> = { en, pt, es };

/**
 * Resolve as strings de um idioma: "custom" mescla o JSON informado sobre o en,
 * e um lang desconhecido também cai no en.
 */
export function resolveLocale(
  lang: string | undefined,
  customJson: string | Partial<ArkDatepickerLocale> | undefined
): ArkDatepickerLocale {
  // Se o idioma for "custom" e houver JSON personalizado, mescla com o en.
  if (lang === "custom" && customJson) {
    const partial: Partial<ArkDatepickerLocale> = typeof customJson === "string" ? JSON.parse(customJson) : customJson;
    return { ...en, ...partial };
  }

  return builtinLocales[lang ?? "en"] ?? en;
}
