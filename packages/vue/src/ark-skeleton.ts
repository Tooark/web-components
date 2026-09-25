import type { ArkRounded, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkSkeleton = defineComponent({
  name: "ArkSkeleton",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    rows: { type: Number, default: undefined },
    animated: { type: Boolean, default: false },
    rounded: { type: String as PropType<ArkRounded>, default: undefined },
    color: { type: String, default: undefined },
    ratio: { type: String, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-skeleton",
        {
          ...attrs,
          testid: props.testid,
          rows: props.rows,
          animated: props.animated ? "" : undefined,
          rounded: props.rounded,
          color: props.color,
          ratio: props.ratio,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});
