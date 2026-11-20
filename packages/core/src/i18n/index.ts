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
 * Reduz uma tag de idioma ao idioma das tabelas: minúsculas, sem região nem script (`pt-BR` e `pt_br` viram `pt`,
 * `es-419` vira `es`).
 */
function baseLanguage(lang: string): string {
  return lang.trim().toLowerCase().split(/[-_]/)[0];
}

/**
 * Resolve as strings de um idioma: "custom" mescla o JSON informado sobre o en, uma tag com região usa o idioma
 * base (`pt-BR` usa o pt) e um lang desconhecido cai no en.
 */
export function resolveLocale(lang: string | undefined, customJson?: string | Partial<ArkLocale>): ArkLocale {
  // Se o idioma for "custom" e houver JSON personalizado, mescla com o en.
  if (lang === "custom" && customJson) {
    const partial: Partial<ArkLocale> = typeof customJson === "string" ? JSON.parse(customJson) : customJson;
    return { ...en, ...partial };
  }

  // A busca é por chave própria: um lang como "constructor" não pode achar um membro do protótipo.
  const base = baseLanguage(lang ?? "en");
  return Object.getOwnPropertyDescriptor(builtinLocales, base)?.value ?? en;
}
