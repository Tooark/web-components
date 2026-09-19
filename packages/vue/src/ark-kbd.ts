import type { ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkKbd = defineComponent({
  name: "ArkKbd",
  inheritAttrs: false,
  props: {
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-kbd",
        {
          ...attrs,
          size: props.size,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});
