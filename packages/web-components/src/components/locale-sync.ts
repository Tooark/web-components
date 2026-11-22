// Componentes sem `lang` próprio seguem o idioma padrão de setArkLocale() (core). Um listener só, em window, avisa os
// hosts conectados; cada um refaz o que uma troca do atributo `lang` refaz, pelo próprio attributeChangedCallback, com
// as mesmas guardas. Um host com `lang` próprio não muda.
import { type ArkLocaleSetting, getArkLocale, observeArkLocale } from "@tooark/core";

/** Elemento com `lang` observado: a troca do padrão chega a ele como uma troca do atributo. */
type LocaleHost = HTMLElement & {
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
};

/** Hosts conectados, avisados a cada troca. */
const hosts = new Set<LocaleHost>();
/** Padrão com que cada host desenhou por último; lembra também de quem saiu do DOM (KeepAlive, nó movido). */
const applied = new WeakMap<LocaleHost, ArkLocaleSetting>();
let stopObserving: (() => void) | null = null;

function stringsOf(setting: ArkLocaleSetting): string {
  return JSON.stringify(setting.localeJson ?? null);
}

function refresh(host: LocaleHost, next: ArkLocaleSetting): void {
  const previous = applied.get(host);
  applied.set(host, next);
  // Primeira conexão (o render já usa o padrão em vigor), padrão igual ou `lang` próprio: nada a refazer.
  if (!previous || host.hasAttribute("lang")) return;
  if (previous.lang !== next.lang) {
    host.attributeChangedCallback("lang", previous.lang, next.lang);
  } else if (stringsOf(previous) !== stringsOf(next)) {
    // Mesmo lang ("custom") com outras strings: a troca chega como a do `locale-json`.
    host.attributeChangedCallback("locale-json", stringsOf(previous), stringsOf(next));
  }
}

/**
 * Chamado no `connectedCallback`: passa a seguir `setArkLocale()` enquanto conectado e, se o padrão mudou enquanto o
 * host estava fora do DOM, redesenha agora.
 */
export function followArkLocale(host: LocaleHost): void {
  refresh(host, getArkLocale());
  hosts.add(host);
  stopObserving ??= observeArkLocale((next) => {
    // Cópia: um redesenho pode conectar ou desconectar hosts no meio da volta; quem saiu reaplica ao voltar ao DOM.
    for (const item of Array.from(hosts)) {
      if (hosts.has(item)) refresh(item, next);
    }
  });
}

/** Chamado no `disconnectedCallback`. */
export function unfollowArkLocale(host: LocaleHost): void {
  hosts.delete(host);
  if (hosts.size === 0) {
    stopObserving?.();
    stopObserving = null;
  }
}
