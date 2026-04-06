import { ArkButton } from "./components/ark-button";
import { ArkDatepicker } from "./components/ark-datepicker";

export function registerTooarkComponents(): void {
  if (!customElements.get(ArkButton.tagName)) {
    customElements.define(ArkButton.tagName, ArkButton);
  }

  if (!customElements.get(ArkDatepicker.tagName)) {
    customElements.define(ArkDatepicker.tagName, ArkDatepicker);
  }
}
