// Consulta de elementos focáveis por Tab, compartilhada pelo focus trap e por
// quem precisa do primeiro focável de um painel (dialog, drawer, palette).

/** Candidatos a foco por Tab; a lista é filtrada depois por tabindex negativo, `disabled`, `inert` e visibilidade. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "iframe",
  "summary",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]"
].join(",");

function isTabbable(el: HTMLElement): boolean {
  // tabIndex já reflete o padrão de cada elemento (-1 em <a> sem href, 0 em button, o atributo em custom elements).
  if (el.tabIndex < 0) return false;
  if (el.hasAttribute("disabled")) return false;
  if (el instanceof HTMLInputElement && el.type === "hidden") return false;
  if (el.closest("[inert]")) return false;
  // Sem caixas (display: none, desconectado) ou invisível não recebe foco.
  if (el.getClientRects().length === 0) return false;
  return window.getComputedStyle(el).visibility !== "hidden";
}

/**
 * Elementos que entram na ordem de Tab dentro de `root`, na ordem do DOM: com tabindex não negativo, sem
 * `disabled` nem `inert`, visíveis. `root` não entra na lista. Não reordena por tabindex positivo, que a lib
 * não usa.
 */
export function focusableElements(root: Element): HTMLElement[] {
  if (typeof window === "undefined") return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isTabbable);
}
