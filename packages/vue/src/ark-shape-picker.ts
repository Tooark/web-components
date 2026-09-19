import type { ArkLang, ArkMarkShape, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkShapePicker = defineComponent({
  name: "ArkShapePicker",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    value: { type: String as PropType<ArkMarkShape>, default: undefined },
    color: { type: String, default: undefined },
    label: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-shape-picker", {
        ...attrs,
        value: props.value,
        color: props.color,
        label: props.label,
        disabled: props.disabled ? "" : undefined,
        size: props.size,
        theme: props.theme,
        lang: props.lang,
        "locale-json": props.localeJson,
        onChange: (event: CustomEvent<{ value: ArkMarkShape }>) => emit("change", event)
      });
  }
});
