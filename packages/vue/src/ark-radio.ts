import type { ArkIntent, ArkOrientation, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkRadio = defineComponent({
  name: "ArkRadio",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    name: { type: String, default: undefined },
    value: { type: String, default: undefined },
    label: { type: String, default: undefined },
    helper: { type: String, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-radio",
        {
          ...attrs,
          testid: props.testid,
          intent: props.intent,
          theme: props.theme,
          size: props.size,
          name: props.name,
          value: props.value,
          label: props.label,
          helper: props.helper,
          checked: props.checked ? "" : undefined,
          disabled: props.disabled ? "" : undefined,
          onChange: (event: CustomEvent<{ value: string }>) => emit("change", event)
        },
        slots.default ? slots.default() : []
      );
  }
});

export const ArkRadioGroup = defineComponent({
  name: "ArkRadioGroup",
  inheritAttrs: false,
  emits: ["change"],
  props: {
    /** Propagado como data-testid ao host e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    /** O `value` do rádio marcado; atribuído, marca o rádio desse valor, e vazio desmarca todos. */
    value: { type: String, default: undefined },
    /** `name` gravado em cada rádio, para o formulário. */
    name: { type: String, default: undefined },
    label: { type: String, default: undefined },
    helper: { type: String, default: undefined },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: undefined },
    /** Direção da lista. Padrão: "vertical". */
    orientation: { type: String as PropType<ArkOrientation>, default: undefined },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    // Sem padrão: só o que o app der ao grupo é gravado nos rádios.
    intent: { type: String as PropType<ArkIntent>, default: undefined },
    size: { type: String as PropType<ArkSize>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: undefined }
  },
  setup(props, { attrs, slots, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h(
        "ark-radio-group",
        {
          ...attrs,
          testid: props.testid,
          // Só quando o app dá um: o Vue regrava `value` a cada render, um `undefined` vira `""` e tirar o `value`
          // desmarca o grupo, o que apagaria a escolha do usuário num grupo que o app não controla.
          ...(props.value === undefined ? {} : { value: props.value }),
          name: props.name,
          label: props.label,
          helper: props.helper,
          orientation: props.orientation,
          intent: props.intent,
          size: props.size,
          theme: props.theme,
          "error-message": props.errorMessage,
          error: props.error ? "" : undefined,
          required: props.required ? "" : undefined,
          disabled: props.disabled ? "" : undefined,
          // O grupo para o `change` dos rádios e publica o próprio: só o dele (target no host) é reemitido.
          onChange: (event: CustomEvent<{ value: string }>) => {
            if (event.target === event.currentTarget) emit("change", event);
          }
        },
        slots.default ? slots.default() : []
      );
  }
});
