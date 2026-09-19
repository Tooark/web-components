import type { ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTabsFill, ArkTabsVariant, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkTabs = defineComponent({
  name: "ArkTabs",
  inheritAttrs: false,
  emits: ["change", "ark-close"],
  props: {
    value: { type: String, default: undefined },
    variant: { type: String as PropType<ArkTabsVariant>, default: "underline" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    rounded: { type: String as PropType<ArkRounded>, default: undefined },
    fill: { type: String as PropType<ArkTabsFill>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    label: { type: String, default: undefined },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Evento customizado do DOM: ouvido no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const closeHandler = (event: Event) => emit("ark-close", event as CustomEvent<{ value: string }>);
    onMounted(() => elRef.value?.addEventListener("ark-close", closeHandler));
    onBeforeUnmount(() => elRef.value?.removeEventListener("ark-close", closeHandler));

    return () =>
      h(
        "ark-tabs",
        {
          ...attrs,
          ref: elRef,
          value: props.value,
          variant: props.variant,
          size: props.size,
          intent: props.intent,
          rounded: props.rounded,
          fill: props.fill,
          theme: props.theme,
          label: props.label,
          lang: props.lang,
          "locale-json": props.localeJson,
          onChange: (event: CustomEvent<{ value: string }>) => emit("change", event)
        },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkTab = defineComponent({
  name: "ArkTab",
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    controls: { type: String, default: undefined },
    closable: { type: Boolean, default: false },
    dirty: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-tab",
        {
          ...attrs,
          value: props.value,
          controls: props.controls,
          disabled: props.disabled ? "" : undefined,
          closable: props.closable ? "" : undefined,
          dirty: props.dirty ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
