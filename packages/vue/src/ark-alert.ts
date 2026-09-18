import type { ArkAlertLive, ArkAlertVariant, ArkIntent, ArkLang, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkAlert = defineComponent({
  name: "ArkAlert",
  inheritAttrs: false,
  emits: ["ark-dismiss"],
  props: {
    intent: { type: String as PropType<ArkIntent>, default: "info" },
    variant: { type: String as PropType<ArkAlertVariant>, default: "box" },
    heading: { type: String, default: undefined },
    dismissible: { type: Boolean, default: false },
    live: { type: String as PropType<ArkAlertLive>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Evento customizado do DOM: ouvido no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const dismissHandler = (event: Event) => emit("ark-dismiss", event as CustomEvent);
    onMounted(() => elRef.value?.addEventListener("ark-dismiss", dismissHandler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-dismiss", dismissHandler));

    return () =>
      h(
        "ark-alert",
        {
          ...attrs,
          ref: elRef,
          intent: props.intent,
          variant: props.variant,
          heading: props.heading,
          dismissible: props.dismissible ? "" : undefined,
          live: props.live,
          theme: props.theme,
          lang: props.lang,
          "locale-json": props.localeJson
        },
        slots.default ? slots.default() : []
      );
  }
});
