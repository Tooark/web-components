import type { ArkIntent, ArkMenuAlign, ArkMenuDirection, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkMenu = defineComponent({
  name: "ArkMenu",
  inheritAttrs: false,
  emits: ["ark-select", "ark-open", "ark-close"],
  props: {
    for: { type: String, default: undefined },
    open: { type: Boolean, default: false },
    align: { type: String as PropType<ArkMenuAlign>, default: "start" },
    direction: { type: String as PropType<ArkMenuDirection>, default: "down" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<HTMLElement | null>(null);

    // Eventos customizados do DOM: ouvidos no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const selectHandler = (event: Event) => emit("ark-select", event as CustomEvent<{ value: string }>);
    const openHandler = (event: Event) => emit("ark-open", event as CustomEvent);
    const closeHandler = (event: Event) => emit("ark-close", event as CustomEvent);
    onMounted(() => {
      elRef.value?.addEventListener("ark-select", selectHandler);
      elRef.value?.addEventListener("ark-open", openHandler);
      elRef.value?.addEventListener("ark-close", closeHandler);
    });
    onBeforeUnmount(() => {
      elRef.value?.removeEventListener("ark-select", selectHandler);
      elRef.value?.removeEventListener("ark-open", openHandler);
      elRef.value?.removeEventListener("ark-close", closeHandler);
    });

    return () =>
      h(
        "ark-menu",
        {
          ...attrs,
          ref: elRef,
          for: props.for,
          open: props.open ? "" : undefined,
          align: props.align,
          direction: props.direction,
          size: props.size,
          theme: props.theme
        },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkMenuItem = defineComponent({
  name: "ArkMenuItem",
  inheritAttrs: false,
  props: {
    value: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    intent: { type: String as PropType<ArkIntent>, default: undefined },
    // true/"true" marca e false/"false" desmarca um item checkbox; ausente (undefined) e um item comum, como no React.
    checked: { type: [Boolean, String] as PropType<boolean | "true" | "false">, default: undefined },
    divider: { type: Boolean, default: false },
    static: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-menu-item",
        {
          ...attrs,
          value: props.value,
          intent: props.intent,
          disabled: props.disabled ? "" : undefined,
          // "^" grava como atributo: pela propriedade o Vue converteria o undefined em false (checkbox desmarcado).
          "^checked":
            props.checked === true || props.checked === "true"
              ? ""
              : props.checked === false || props.checked === "false"
                ? "false"
                : undefined,
          divider: props.divider ? "" : undefined,
          static: props.static ? "" : undefined
        },
        slots.default ? slots.default() : []
      );
  }
});
