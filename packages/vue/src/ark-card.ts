import type { ArkCardPadding, ArkRounded, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkCard = defineComponent({
  name: "ArkCard",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    heading: { type: String, default: undefined },
    padding: { type: String as PropType<ArkCardPadding>, default: undefined },
    rounded: { type: String as PropType<ArkRounded>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-card",
        {
          ...attrs,
          testid: props.testid,
          heading: props.heading,
          padding: props.padding,
          rounded: props.rounded,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});
