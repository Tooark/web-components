import type { ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkFileInput = defineComponent({
  name: "ArkFileInput",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    accept: { type: String, default: undefined },
    multiple: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    helper: { type: String, default: undefined },
    errorMessage: { type: String, default: undefined },
    error: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    name: { type: String, default: undefined },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    rounded: { type: String as PropType<ArkRounded>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-file-input", {
        ...attrs,
        accept: props.accept,
        multiple: props.multiple ? "" : undefined,
        label: props.label,
        helper: props.helper,
        "error-message": props.errorMessage,
        error: props.error ? "" : undefined,
        disabled: props.disabled ? "" : undefined,
        required: props.required ? "" : undefined,
        name: props.name,
        intent: props.intent,
        size: props.size,
        rounded: props.rounded,
        theme: props.theme,
        lang: props.lang,
        "locale-json": props.localeJson,
        onChange: (event: CustomEvent<{ files: File[] }>) => emit("change", event)
      });
  }
});
