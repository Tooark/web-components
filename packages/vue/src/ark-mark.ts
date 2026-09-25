import type { ArkMarkShape, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkMark = defineComponent({
  name: "ArkMark",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    shape: { type: String as PropType<ArkMarkShape>, default: "circle" },
    color: { type: String, default: undefined },
    size: { type: [Number, String], default: undefined },
    label: { type: String, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-mark", {
        ...attrs,
        testid: props.testid,
        shape: props.shape,
        color: props.color,
        size: props.size,
        label: props.label,
        theme: props.theme
      });
  }
});
