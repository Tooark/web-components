import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkProgress = defineComponent({
  name: "ArkProgress",
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    indeterminate: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    showValue: { type: Boolean, default: false },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-progress", {
        ...attrs,
        value: props.value,
        max: props.max,
        indeterminate: props.indeterminate ? "" : undefined,
        label: props.label,
        "show-value": props.showValue ? "" : undefined,
        intent: props.intent,
        size: props.size,
        theme: props.theme
      });
  }
});
