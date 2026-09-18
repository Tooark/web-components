import {
  ArkBadge,
  ArkButton,
  ArkCalendar,
  ArkCarousel,
  ArkClock,
  ArkDatepicker,
  ArkDialog,
  ArkEmpty,
  ArkInput,
  ArkMenu,
  ArkMenuItem,
  ArkScheduler,
  ArkSelect,
  ArkSwitch,
  ArkTab,
  ArkTabs,
  ArkTextarea,
  ArkToaster,
  ArkToggle,
  ArkToggleGroup,
  ArkTooltip
} from "./components";

/**
 * Registra os componentes personalizados do Tooark no navegador.
 * Esta função deve ser chamada antes de usar os componentes em qualquer framework (React, Angular, Vue)
 * para garantir que eles estejam disponíveis como elementos personalizados.
 */
export function registerTooarkComponents(): void {
  if (!customElements.get(ArkBadge.tagName)) {
    customElements.define(ArkBadge.tagName, ArkBadge);
  }

  if (!customElements.get(ArkButton.tagName)) {
    customElements.define(ArkButton.tagName, ArkButton);
  }

  if (!customElements.get(ArkInput.tagName)) {
    customElements.define(ArkInput.tagName, ArkInput);
  }

  if (!customElements.get(ArkSelect.tagName)) {
    customElements.define(ArkSelect.tagName, ArkSelect);
  }

  if (!customElements.get(ArkTextarea.tagName)) {
    customElements.define(ArkTextarea.tagName, ArkTextarea);
  }

  // A aba antes da faixa: o ark-tabs coordena abas já upgraded.
  if (!customElements.get(ArkTab.tagName)) {
    customElements.define(ArkTab.tagName, ArkTab);
  }

  if (!customElements.get(ArkTabs.tagName)) {
    customElements.define(ArkTabs.tagName, ArkTabs);
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

  if (!customElements.get(ArkDialog.tagName)) {
    customElements.define(ArkDialog.tagName, ArkDialog);
  }

  if (!customElements.get(ArkEmpty.tagName)) {
    customElements.define(ArkEmpty.tagName, ArkEmpty);
  }

  // O item antes do menu: o ark-menu coordena itens já upgraded.
  if (!customElements.get(ArkMenuItem.tagName)) {
    customElements.define(ArkMenuItem.tagName, ArkMenuItem);
  }

  if (!customElements.get(ArkMenu.tagName)) {
    customElements.define(ArkMenu.tagName, ArkMenu);
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

  if (!customElements.get(ArkTooltip.tagName)) {
    customElements.define(ArkTooltip.tagName, ArkTooltip);
  }
}
