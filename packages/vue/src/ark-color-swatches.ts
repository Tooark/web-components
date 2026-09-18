import type { ArkColorSwatch, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkColorSwatches = defineComponent({
  name: "ArkColorSwatches",
  inheritAttrs: false,
  emits: ["change"],
  props: {
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
