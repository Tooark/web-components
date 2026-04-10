import { ArkButton, ArkCarousel, ArkDatepicker, ArkToaster } from "./components";

/**
 * Registra os componentes personalizados do Tooark no navegador.
 * Esta função deve ser chamada antes de usar os componentes em qualquer framework (React, Angular, Vue)
 * para garantir que eles estejam disponíveis como elementos personalizados.
 */
export function registerTooarkComponents(): void {
  // Verifica se o componente button já está registrado para evitar erros de redefinição
  if (!customElements.get(ArkButton.tagName)) {
    customElements.define(ArkButton.tagName, ArkButton);
  }

  // Verifica se o componente datepicker já está registrado para evitar erros de redefinição
  if (!customElements.get(ArkDatepicker.tagName)) {
    customElements.define(ArkDatepicker.tagName, ArkDatepicker);
  }

  if (!customElements.get(ArkCarousel.tagName)) {
    customElements.define(ArkCarousel.tagName, ArkCarousel);
  }

  if (!customElements.get(ArkToaster.tagName)) {
    customElements.define(ArkToaster.tagName, ArkToaster);
  }
}
