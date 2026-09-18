import type { ArkRounded, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkSkeleton = defineComponent({
  name: "ArkSkeleton",
  inheritAttrs: false,
  props: {
    rows: { type: Number, default: undefined },
    animated: { type: Boolean, default: false },
    rounded: { type: String as PropType<ArkRounded>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-skeleton",
        {
          ...attrs,
          rows: props.rows,
          animated: props.animated ? "" : undefined,
          rounded: props.rounded,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});
