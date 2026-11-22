// Idioma padrão dos componentes sem `lang` próprio. Fica em globalThis sob um Symbol.for, e não no estado do módulo:
// as builds ESM e CJS de cada pacote (e uma segunda cópia na página) leem e gravam o mesmo valor. Mora no tokens
// porque o core e os pacotes laterais (o wysiwyg tem rótulos próprios e não depende do core) já dependem dele.

/** Idioma padrão de quem não tem `lang`, definido por `setArkLocale()`. */
export type ArkLocaleSetting = {
  /** Tag do idioma como foi dada (`pt-BR` continua `pt-BR`; cada componente reduz ao idioma das tabelas). */
  lang: string;
  /** Strings do app, já lidas do JSON, para o `lang` "custom" (mescladas sobre o inglês). */
  localeJson?: Record<string, unknown>;
};

/** Nome do evento em `window` a cada troca; quem precisa reagir usa `observeArkLocale()`. */
const CHANGE_EVENT = "ark-locale-change";

const STORE = Symbol.for("tooark.locale");

/** Sem `setArkLocale()`: inglês, como cada componente fazia sozinho. Um objeto só, para comparar por identidade. */
const DEFAULT: ArkLocaleSetting = Object.freeze({ lang: "en" });

type LocaleHolder = { [STORE]?: ArkLocaleSetting };

/** Idioma padrão em vigor: o de `setArkLocale()`, senão `{ lang: "en" }`. Sem DOM também funciona. */
export function getArkLocale(): ArkLocaleSetting {
  return (globalThis as unknown as LocaleHolder)[STORE] ?? DEFAULT;
}

function sameSetting(a: ArkLocaleSetting, b: ArkLocaleSetting): boolean {
  return a.lang === b.lang && JSON.stringify(a.localeJson ?? null) === JSON.stringify(b.localeJson ?? null);
}

/**
 * Define o idioma de todo componente sem `lang` próprio (o atributo do componente continua valendo sobre ele), e os
 * já montados se redesenham. `localeJson` (objeto ou JSON) acompanha o `lang` "custom"; um JSON inválido lança aqui,
 * e não depois em cada componente. `null` (ou vazio) volta ao inglês. Opt-in: sem a chamada nada muda, e o `lang` do
 * `<html>` nunca é lido.
 */
export function setArkLocale(lang: string | null | undefined, localeJson?: string | object | null): void {
  const tag = typeof lang === "string" ? lang.trim() : "";
  let strings: Record<string, unknown> | undefined;
  if (typeof localeJson === "string") {
    const parsed: unknown = localeJson.trim() ? JSON.parse(localeJson) : undefined;
    if (parsed !== undefined && (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))) {
      throw new TypeError("setArkLocale: localeJson precisa ser um objeto JSON");
    }
    strings = parsed as Record<string, unknown> | undefined;
  } else if (localeJson && typeof localeJson === "object") {
    // Cópia rasa: mudar o objeto do app depois da chamada não muda o padrão sem avisar os componentes.
    strings = { ...(localeJson as Record<string, unknown>) };
  }

  const next: ArkLocaleSetting = tag
    ? Object.freeze(strings ? { lang: tag, localeJson: strings } : { lang: tag })
    : DEFAULT;
  if (sameSetting(getArkLocale(), next)) return;
  const holder = globalThis as unknown as LocaleHolder;
  if (next === DEFAULT) {
    delete holder[STORE];
  } else {
    holder[STORE] = next;
  }
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent<ArkLocaleSetting>(CHANGE_EVENT, { detail: next }));
  }
}

/**
 * Chama `onChange` a cada troca feita por `setArkLocale()` (de qualquer cópia do pacote na página) e devolve a função
 * que para de observar. No-op sem DOM.
 */
export function observeArkLocale(onChange: (setting: ArkLocaleSetting) => void): () => void {
  if (typeof window === "undefined" || typeof window.addEventListener !== "function") return () => undefined;
  const listener = (): void => onChange(getArkLocale());
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}
