import type { ArkBadgeSize, ArkBadgeVariant, ArkIntent, ArkRounded, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkBadge = defineComponent({
  name: "ArkBadge",
  inheritAttrs: false,
  props: {
    intent: { type: String as PropType<ArkIntent>, default: "neutral" },
    variant: { type: String as PropType<ArkBadgeVariant>, default: "soft" },
    size: { type: String as PropType<ArkBadgeSize>, default: "md" },
    rounded: { type: String as PropType<ArkRounded>, default: "full" },
    color: { type: String, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-badge",
        {
          ...attrs,
          intent: props.intent,
          variant: props.variant,
          size: props.size,
          rounded: props.rounded,
          color: props.color,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});
