import type { ArkIntent, ArkLang, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkSpinner = defineComponent({
  name: "ArkSpinner",
  inheritAttrs: false,
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    size: { type: String as PropType<ArkSize>, default: "md" },
    intent: { type: String as PropType<ArkIntent>, default: undefined },
    label: { type: String, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-spinner", {
        ...attrs,
        testid: props.testid,
        size: props.size,
        intent: props.intent,
        label: props.label,
        theme: props.theme,
        lang: props.lang,
        "locale-json": props.localeJson
      });
  }
});
