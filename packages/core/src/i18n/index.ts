export type { ArkDatepickerLocale } from "./types";
export { en } from "./en";
export { pt } from "./pt";
export { es } from "./es";

import type { ArkDatepickerLocale } from "./types";
import { en } from "./en";
import { pt } from "./pt";
import { es } from "./es";

const builtinLocales: Record<string, ArkDatepickerLocale> = { en, pt, es };

export function resolveLocale(
  lang: string | undefined,
  customJson: string | Partial<ArkDatepickerLocale> | undefined
): ArkDatepickerLocale {
  if (lang === "custom" && customJson) {
    const partial: Partial<ArkDatepickerLocale> =
      typeof customJson === "string" ? JSON.parse(customJson) : customJson;
    return { ...en, ...partial };
  }

  return builtinLocales[lang ?? "en"] ?? en;
}
