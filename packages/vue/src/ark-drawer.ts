import type { ArkDrawerCloseReason, ArkDrawerMode, ArkDrawerSide, ArkLang, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkDrawer = defineComponent({
  name: "ArkDrawer",
  inheritAttrs: false,
  emits: ["ark-open", "ark-close"],
  props: {
    open: { type: Boolean, default: false },
    side: { type: String as PropType<ArkDrawerSide>, default: "right" },
    mode: { type: String as PropType<ArkDrawerMode>, default: "overlay" },
    size: { type: [String, Number], default: undefined },
    label: { type: String, default: undefined },
    noCloseButton: { type: Boolean, default: false },
    persistent: { type: Boolean, default: false },
    noScrollLock: { type: Boolean, default: false },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Eventos customizados do DOM: ouvidos no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const openHandler = (event: Event) => emit("ark-open", event as CustomEvent);
    const closeHandler = (event: Event) => emit("ark-close", event as CustomEvent<{ reason: ArkDrawerCloseReason }>);
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
        "ark-drawer",
        {
          ...attrs,
          ref: elRef,
          open: props.open ? "" : undefined,
          side: props.side,
          mode: props.mode,
          size: props.size,
          label: props.label,
          "no-close-button": props.noCloseButton ? "" : undefined,
          persistent: props.persistent ? "" : undefined,
          "no-scroll-lock": props.noScrollLock ? "" : undefined,
          theme: props.theme,
          lang: props.lang,
          "locale-json": props.localeJson
        },
        slots.default ? slots.default() : []
      );
  }
});
