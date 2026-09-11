import { registerTooarkComponents } from "@tooark/web-components";

let isRegistered = false;

/**
 * Registra os custom elements uma única vez. É chamado no construtor de cada
 * wrapper (e não no top-level do módulo) para que importar o pacote não tenha
 * efeito colateral e para funcionar em SSR: no servidor não há
 * `customElements`, então a chamada é ignorada e o registro acontece na
 * hidratação do cliente.
 */
export function ensureTooarkComponentsRegistered(): void {
  if (isRegistered) return;
  if (typeof window === "undefined" || typeof customElements === "undefined") return;
  registerTooarkComponents();
  isRegistered = true;
}
