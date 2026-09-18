import type { ArkLang, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register";

export const ArkCommandPalette = defineComponent({
  name: "ArkCommandPalette",
  inheritAttrs: false,
  emits: ["ark-select", "ark-query", "ark-open", "ark-close"],
  props: {
    open: { type: Boolean, default: false },
    placeholder: { type: String, default: undefined },
    hotkey: { type: String, default: undefined },
    filter: { type: Boolean, default: false },
    queryDelay: { type: Number, default: undefined },
    label: { type: String, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Eventos customizados do DOM: ouvidos no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const handlers: Array<[string, (event: Event) => void]> = [
      ["ark-select", (event) => emit("ark-select", event as CustomEvent<{ value: string }>)],
      ["ark-query", (event) => emit("ark-query", event as CustomEvent<{ query: string }>)],
      ["ark-open", (event) => emit("ark-open", event as CustomEvent)],
      ["ark-close", (event) => emit("ark-close", event as CustomEvent)]
    ];
    onMounted(() => {
      for (const [name, handler] of handlers) elRef.value?.addEventListener(name, handler);
    });
    onBeforeUnmount(() => {
      for (const [name, handler] of handlers) elRef.value?.removeEventListener(name, handler);
    });

    return () =>
      h(
        "ark-command-palette",
        {
          ...attrs,
          ref: elRef,
          open: props.open ? "" : undefined,
          placeholder: props.placeholder,
          hotkey: props.hotkey,
          filter: props.filter ? "" : undefined,
          "query-delay": props.queryDelay,
          label: props.label,
          theme: props.theme,
          lang: props.lang,
          "locale-json": props.localeJson
        },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkCommandItem = defineComponent({
  name: "ArkCommandItem",
  inheritAttrs: false,
  props: {
    value: { type: String, required: true },
    group: { type: String, default: undefined },
    label: { type: String, default: undefined },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-command-item",
        {
          ...attrs,
          value: props.value,
          group: props.group,
          label: props.label,
          disabled: props.disabled ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
