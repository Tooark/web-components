import type { ArkButtonVariant, ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkCopyButton = defineComponent({
  name: "ArkCopyButton",
  inheritAttrs: false,
  emits: ["ark-copy"],
  props: {
    value: { type: String, default: undefined },
    for: { type: String, default: undefined },
    feedbackMs: { type: Number, default: undefined },
    variant: { type: String as PropType<ArkButtonVariant>, default: "primary" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    rounded: { type: String as PropType<ArkRounded>, default: "md" },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    iconOnly: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: false },
    color: { type: String, default: undefined },
    textColor: { type: String, default: undefined },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Evento customizado do DOM: ouvido no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const copyHandler = (event: Event) => emit("ark-copy", event as CustomEvent<{ value: string }>);
    onMounted(() => elRef.value?.addEventListener("ark-copy", copyHandler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-copy", copyHandler));

    return () =>
      h(
        "ark-copy-button",
        {
          ...attrs,
          ref: elRef,
          value: props.value,
          for: props.for,
          "feedback-ms": props.feedbackMs,
          variant: props.variant,
          intent: props.intent,
          theme: props.theme,
          size: props.size,
          rounded: props.rounded,
          disabled: props.disabled ? "" : undefined,
          loading: props.loading ? "" : undefined,
          "icon-only": props.iconOnly ? "" : undefined,
          "full-width": props.fullWidth ? "" : undefined,
          color: props.color,
          "text-color": props.textColor,
          lang: props.lang,
          "locale-json": props.localeJson
        },
        slots.default ? slots.default() : []
      );
  }
});
