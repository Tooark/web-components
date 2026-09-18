import type { ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkEmpty = defineComponent({
  name: "ArkEmpty",
  inheritAttrs: false,
  props: {
    heading: { type: String, default: undefined },
    description: { type: String, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-empty",
        {
          ...attrs,
          heading: props.heading,
          description: props.description,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});
