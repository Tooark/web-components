/** Urgência do anúncio: "polite" espera o leitor de tela terminar a fala atual; "assertive" interrompe. */
export type ArkAnnouncePoliteness = "polite" | "assertive";

// Um container oculto em document.body com uma região por urgência, criados sob demanda.
let container: HTMLElement | null = null;
const regions: Partial<Record<ArkAnnouncePoliteness, HTMLElement>> = {};
const pending: Partial<Record<ArkAnnouncePoliteness, ReturnType<typeof setTimeout>>> = {};

function getRegion(politeness: ArkAnnouncePoliteness): HTMLElement | null {
  if (typeof document === "undefined") return null;

  if (!container?.isConnected) {
    container = document.createElement("div");
    container.setAttribute("data-ark", "announcer");
    // Visualmente oculto sem display:none, que faria o leitor de tela ignorar a região.
    container.style.cssText =
      "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;";
    document.body.appendChild(container);
  }

  let region = regions[politeness];
  if (!region || region.parentNode !== container) {
    region = document.createElement("div");
    region.setAttribute("role", politeness === "assertive" ? "alert" : "status");
    region.setAttribute("aria-live", politeness);
    region.setAttribute("aria-atomic", "true");
    region.setAttribute("data-ark", `announcer-${politeness}`);
    container.appendChild(region);
    regions[politeness] = region;
  }

  return region;
}

/**
 * Anuncia um texto para leitores de tela por uma live region única em document.body, sem tocar no DOM do componente
 * nem no nome acessível do controle que pediu. Esvazia a região antes de escrever, para o mesmo texto ser anunciado de
 * novo. No-op sem DOM.
 */
export function announce(text: string, politeness: ArkAnnouncePoliteness = "polite"): void {
  const region = getRegion(politeness);
  if (!region) return;

  region.textContent = "";
  const timer = pending[politeness];
  if (timer !== undefined) clearTimeout(timer);

  // O leitor só percebe a mudança se o texto entrar depois de um ciclo com a região vazia.
  pending[politeness] = setTimeout(() => {
    region.textContent = text;
    delete pending[politeness];
  }, 50);
}
