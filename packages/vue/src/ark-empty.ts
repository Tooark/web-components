import type { ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkEmpty = defineComponent({
  name: "ArkEmpty",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
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
          testid: props.testid,
          heading: props.heading,
          description: props.description,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});
