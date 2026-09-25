import type { ArkTheme, ArkTooltipSide } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkTooltip = defineComponent({
  name: "ArkTooltip",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    content: { type: String, default: undefined },
    side: { type: String as PropType<ArkTooltipSide>, default: "top" },
    delay: { type: Number, default: undefined },
    open: { type: Boolean, default: false },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-tooltip",
        {
          ...attrs,
          testid: props.testid,
          content: props.content,
          side: props.side,
          delay: props.delay,
          open: props.open ? "" : undefined,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});
