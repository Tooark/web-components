import { defineComponent, h, type PropType } from "vue";
import type { ArkSize, ArkButtonType, ArkButtonVariant, ArkIntent, ArkRounded, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkButton = defineComponent({
  name: "ArkButton",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<ArkButtonVariant>, default: "primary" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    rounded: { type: String as PropType<ArkRounded>, default: "md" },
    type: { type: String as PropType<ArkButtonType>, default: "button" },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    iconOnly: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: false },
    href: { type: String, default: undefined },
    target: { type: String, default: undefined },
    color: { type: String, default: undefined },
    textColor: { type: String, default: undefined }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-button",
        {
          ...attrs,
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
          "icon-only": props.iconOnly ? "" : undefined,
          "full-width": props.fullWidth ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
