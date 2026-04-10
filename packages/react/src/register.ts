import { registerTooarkComponents } from "@tooark/core";

let isRegistered = false;

export function ensureTooarkComponentsRegistered(): void {
  if (isRegistered) return;
  registerTooarkComponents();
  isRegistered = true;
}
