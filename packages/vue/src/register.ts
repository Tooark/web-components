import { registerTooarkComponents } from "@tooark/web-components";

let isRegistered = false;

/**
 * Registra os custom elements uma única vez. No servidor (SSR) não há `customElements`: a chamada é ignorada e o
 * registro acontece no cliente.
 */
export function ensureTooarkComponentsRegistered(): void {
  if (isRegistered) return;
  if (typeof customElements === "undefined") return;
  registerTooarkComponents();
  isRegistered = true;
}
