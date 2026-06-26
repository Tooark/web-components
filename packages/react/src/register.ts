import { registerTooarkComponents } from "@tooark/web-components";

let isRegistered = false;

export function ensureTooarkComponentsRegistered(): void {
  if (isRegistered) return;
  registerTooarkComponents();
  isRegistered = true;
}
