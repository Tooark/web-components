import type { ArkColorSwatch, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkColorSwatches = defineComponent({
  name: "ArkColorSwatches",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    value: { type: String, default: undefined },
    colors: { type: Array as PropType<ArkColorSwatch[]>, default: undefined },
    label: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-color-swatches", {
        ...attrs,
        testid: props.testid,
        value: props.value,
        colors: props.colors ? JSON.stringify(props.colors) : undefined,
        label: props.label,
        disabled: props.disabled ? "" : undefined,
        size: props.size,
        theme: props.theme,
        onChange: (event: CustomEvent<{ value: string }>) => emit("change", event)
      });
  }
});
