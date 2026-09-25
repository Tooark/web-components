import { en } from "./en";
import { es } from "./es";
import { pt } from "./pt";
import type { ArkLocale } from "./types";

export { en } from "./en";
export { es } from "./es";
export { pt } from "./pt";
export type { ArkDatepickerLocale, ArkLocale } from "./types";

const builtinLocales: Record<string, ArkLocale> = { en, pt, es };

/**
 * Resolve as strings de um idioma: "custom" mescla o JSON informado sobre o en,
 * e um lang desconhecido também cai no en.
 */
export function resolveLocale(lang: string | undefined, customJson?: string | Partial<ArkLocale>): ArkLocale {
  // Se o idioma for "custom" e houver JSON personalizado, mescla com o en.
  if (lang === "custom" && customJson) {
    const partial: Partial<ArkLocale> = typeof customJson === "string" ? JSON.parse(customJson) : customJson;
    return { ...en, ...partial };
  }

  return builtinLocales[lang ?? "en"] ?? en;
}
