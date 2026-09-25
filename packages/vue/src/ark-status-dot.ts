import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkStatusDot = defineComponent({
  name: "ArkStatusDot",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    intent: { type: String as PropType<ArkIntent>, default: "neutral" },
    label: { type: String, default: undefined },
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-status-dot", {
        ...attrs,
        testid: props.testid,
        intent: props.intent,
        label: props.label,
        size: props.size,
        theme: props.theme
      });
  }
});
