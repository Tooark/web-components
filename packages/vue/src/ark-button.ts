import type {
  ArkButtonStatus,
  ArkButtonType,
  ArkButtonVariant,
  ArkIntent,
  ArkRounded,
  ArkSize,
  ArkTheme
} from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkButton = defineComponent({
  name: "ArkButton",
  inheritAttrs: false,
  emits: {
    // Tipa o @click; o bloqueio de disabled/loading do host impede que o listener dispare.
    click: (_event: MouseEvent) => true
  },
  props: {
    variant: { type: String as PropType<ArkButtonVariant>, default: "primary" },
    // Sem padrão: um intent fixo venceria o de `variant="danger"` (o elemento usa intent || variant).
    intent: { type: String as PropType<ArkIntent>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    rounded: { type: String as PropType<ArkRounded>, default: "md" },
    type: { type: String as PropType<ArkButtonType>, default: "button" },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    status: { type: String as PropType<ArkButtonStatus>, default: undefined },
    statusLabel: { type: String, default: undefined },
    iconOnly: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: false },
    href: { type: String, default: undefined },
    target: { type: String, default: undefined },
    color: { type: String, default: undefined },
    textColor: { type: String, default: undefined }
  },
  setup(props, { attrs, emit, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-button",
        {
          ...attrs,
          onClick: (event: MouseEvent) => emit("click", event),
          variant: props.variant,
          intent: props.intent,
          theme: props.theme,
          size: props.size,
          rounded: props.rounded,
          type: props.type,
          href: props.href,
          target: props.target,
          color: props.color,
          "text-color": props.textColor,
          disabled: props.disabled ? "" : undefined,
          loading: props.loading ? "" : undefined,
          status: props.status,
          "status-label": props.statusLabel,
          "icon-only": props.iconOnly ? "" : undefined,
          "full-width": props.fullWidth ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
