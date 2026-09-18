import type { ArkDialogCloseReason, ArkDialogSize, ArkLang, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkDialog = defineComponent({
  name: "ArkDialog",
  inheritAttrs: false,
  emits: ["ark-open", "ark-close"],
  props: {
    open: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    noCloseButton: { type: Boolean, default: false },
    persistent: { type: Boolean, default: false },
    size: { type: String as PropType<ArkDialogSize>, default: "md" },
    width: { type: [String, Number], default: undefined },
    height: { type: [String, Number], default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Eventos customizados do DOM: ouvidos no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const openHandler = (event: Event) => emit("ark-open", event as CustomEvent);
    const closeHandler = (event: Event) => emit("ark-close", event as CustomEvent<{ reason: ArkDialogCloseReason }>);
    onMounted(() => {
      elRef.value?.addEventListener("ark-open", openHandler);
      elRef.value?.addEventListener("ark-close", closeHandler);
    });
    onBeforeUnmount(() => {
      elRef.value?.removeEventListener("ark-open", openHandler);
      elRef.value?.removeEventListener("ark-close", closeHandler);
    });

    return () =>
      h(
        "ark-dialog",
        {
          ...attrs,
          ref: elRef,
          open: props.open ? "" : undefined,
          label: props.label,
          "no-close-button": props.noCloseButton ? "" : undefined,
          persistent: props.persistent ? "" : undefined,
          size: props.size,
          width: props.width,
          height: props.height,
          theme: props.theme,
          lang: props.lang,
          "locale-json": props.localeJson
        },
        slots.default ? slots.default() : []
      );
  }
});
