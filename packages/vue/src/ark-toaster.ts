import type { ArkLang, ArkTheme, ArkToastPosition } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkToaster = defineComponent({
  name: "ArkToaster",
  inheritAttrs: false,
  emits: ["ark-toast-action"],
  props: {
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    position: { type: String as PropType<ArkToastPosition>, default: "bottom-right" },
    richColors: { type: Boolean, default: false },
    closeButton: { type: Boolean, default: true },
    maxVisible: { type: Number, default: 4 },
    duration: { type: Number, default: 4000 },
    lang: { type: String as PropType<ArkLang>, default: undefined }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();

    return () =>
      h("ark-toaster", {
        ...attrs,
        theme: props.theme,
        position: props.position,
        "max-visible": props.maxVisible,
        duration: props.duration,
        "rich-colors": props.richColors ? "" : undefined,
        "close-button": props.closeButton ? undefined : "false",
        lang: props.lang,
        onArkToastAction: (event: CustomEvent<{ id: string; actionId: string | null }>) =>
          emit("ark-toast-action", event)
      });
  }
});
