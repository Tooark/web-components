import type { ArkFileRejectDetail, ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, type PropType } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkFileInput = defineComponent({
  name: "ArkFileInput",
  inheritAttrs: false,
  emits: ["change", "ark-reject"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    accept: { type: String, default: undefined },
    multiple: { type: Boolean, default: false },
    /** Escolhe uma pasta inteira: o seletor abre em modo pasta e a zona lê as pastas soltas. */
    directory: { type: Boolean, default: false },
    label: { type: String, default: undefined },
    helper: { type: String, default: undefined },
    errorMessage: { type: String, default: undefined },
    error: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    name: { type: String, default: undefined },
    intent: { type: String as PropType<ArkIntent>, default: "primary" },
    size: { type: String as PropType<ArkSize>, default: "md" },
    rounded: { type: String as PropType<ArkRounded>, default: undefined },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined },
    /** O `accept` vale também para os arquivos soltos. */
    strictAccept: { type: Boolean, default: false },
    /** Tamanho máximo de cada arquivo, em bytes. */
    maxSize: { type: Number, default: undefined },
    /** Entrega os arquivos no `change` e volta vazio, sem lista própria. */
    transient: { type: Boolean, default: false }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    return () =>
      h("ark-file-input", {
        ...attrs,
        testid: props.testid,
        accept: props.accept,
        multiple: props.multiple ? "" : undefined,
        directory: props.directory ? "" : undefined,
        label: props.label,
        helper: props.helper,
        "error-message": props.errorMessage,
        error: props.error ? "" : undefined,
        disabled: props.disabled ? "" : undefined,
        required: props.required ? "" : undefined,
        name: props.name,
        intent: props.intent,
        size: props.size,
        rounded: props.rounded,
        theme: props.theme,
        lang: props.lang,
        "locale-json": props.localeJson,
        "strict-accept": props.strictAccept ? "" : undefined,
        "max-size": props.maxSize,
        transient: props.transient ? "" : undefined,
        onChange: (event: CustomEvent<{ files: File[]; paths?: string[] }>) => emit("change", event),
        "onArk-reject": (event: CustomEvent<ArkFileRejectDetail>) => emit("ark-reject", event)
      });
  }
});
