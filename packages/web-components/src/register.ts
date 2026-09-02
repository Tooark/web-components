import { ArkButton, ArkCalendar, ArkCarousel, ArkClock, ArkDatepicker, ArkInput, ArkScheduler, ArkSwitch, ArkToaster, ArkToggle, ArkToggleGroup } from "./components";

/**
 * Registra os componentes personalizados do Tooark no navegador.
 * Esta função deve ser chamada antes de usar os componentes em qualquer framework (React, Angular, Vue)
 * para garantir que eles estejam disponíveis como elementos personalizados.
 */
export function registerTooarkComponents(): void {
  if (!customElements.get(ArkButton.tagName)) {
    customElements.define(ArkButton.tagName, ArkButton);
  }

  if (!customElements.get(ArkInput.tagName)) {
    customElements.define(ArkInput.tagName, ArkInput);
  }

  if (!customElements.get(ArkCalendar.tagName)) {
    customElements.define(ArkCalendar.tagName, ArkCalendar);
  }

  if (!customElements.get(ArkClock.tagName)) {
    customElements.define(ArkClock.tagName, ArkClock);
  }

  if (!customElements.get(ArkDatepicker.tagName)) {
    customElements.define(ArkDatepicker.tagName, ArkDatepicker);
  }

  if (!customElements.get(ArkCarousel.tagName)) {
    customElements.define(ArkCarousel.tagName, ArkCarousel);
  }

  if (!customElements.get(ArkToaster.tagName)) {
    customElements.define(ArkToaster.tagName, ArkToaster);
  }

  if (!customElements.get(ArkSwitch.tagName)) {
    customElements.define(ArkSwitch.tagName, ArkSwitch);
  }

  if (!customElements.get(ArkToggle.tagName)) {
    customElements.define(ArkToggle.tagName, ArkToggle);
  }

  if (!customElements.get(ArkToggleGroup.tagName)) {
    customElements.define(ArkToggleGroup.tagName, ArkToggleGroup);
  }

  // Depois de toggle/toggle-group: o scheduler usa o segmented control no header.
  if (!customElements.get(ArkScheduler.tagName)) {
    customElements.define(ArkScheduler.tagName, ArkScheduler);
  }
}
