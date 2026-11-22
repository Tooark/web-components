// Entry point @tooark/vue/code: o wrapper do ark-code-editor, fora da entrada principal para que o CodeMirror (peers do
// @tooark/code) só entre no app que importa este caminho.
import {
  type ArkCodeCompletion,
  type ArkCodeCompletionSource,
  type ArkCodeEditor as ArkCodeEditorElement,
  type ArkCodeExtension,
  type ArkCodeFormatter,
  type ArkCodeIndentStyle,
  type ArkCodeLanguage,
  type ArkCodeLineEnding,
  type ArkCodeVariable,
  registerTooarkCode
} from "@tooark/code";
import type { ArkSize } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref, toRaw, watch } from "vue";

/** Propriedades JS do editor, atribuídas pela ref e só quando a referência muda. */
const PROPERTY_KEYS = [
  "variableKeys",
  "variables",
  "completions",
  "completionSource",
  "formatter",
  "extensions"
] as const;

export const ArkCodeEditor = defineComponent({
  name: "ArkCodeEditor",
  inheritAttrs: false,
  emits: ["change", "ark-submit", "ark-format-error"],
  props: {
    /** Propagado como data-testid à raiz do CodeMirror. */
    testid: { type: String, default: undefined },
    /** Texto do editor; o `change` devolve o texto, e o valor repassado não move o cursor. */
    value: { type: String, default: undefined },
    language: { type: String as PropType<ArkCodeLanguage>, default: undefined },
    theme: { type: String as PropType<"auto" | "light" | "dark">, default: undefined },
    readonly: { type: Boolean, default: false },
    placeholder: { type: String, default: undefined },
    minHeight: { type: String, default: undefined },
    maxHeight: { type: String, default: undefined },
    /** false tira a numeração. Padrão: true. */
    lineNumbers: { type: Boolean, default: undefined },
    /** false tira a calha de dobra. Padrão: true. */
    fold: { type: Boolean, default: undefined },
    wrap: { type: Boolean, default: false },
    indentStyle: { type: String as PropType<ArkCodeIndentStyle>, default: undefined },
    indentSize: { type: Number, default: undefined },
    lineEnding: { type: String as PropType<ArkCodeLineEnding>, default: undefined },
    /** false deixa Tab como navegação. Padrão: true. */
    tabIndent: { type: Boolean, default: undefined },
    /** false desliga as completions. Padrão: true. */
    autocomplete: { type: Boolean, default: undefined },
    markUnknownVariables: { type: Boolean, default: false },
    singleLine: { type: Boolean, default: false },
    size: { type: String as PropType<ArkSize>, default: undefined },
    variableKeys: { type: Array as PropType<string[]>, default: undefined },
    variables: { type: Array as PropType<ArkCodeVariable[]>, default: undefined },
    completions: { type: Array as PropType<ArkCodeCompletion[]>, default: undefined },
    completionSource: { type: Function as PropType<ArkCodeCompletionSource>, default: undefined },
    formatter: { type: Function as PropType<ArkCodeFormatter>, default: undefined },
    /** Extensões do CodeMirror do app; mantenha a referência estável (markRaw), uma nova reconfigura o editor. */
    extensions: { type: [Object, Array] as PropType<ArkCodeExtension>, default: undefined }
  },
  setup(props, { attrs, emit }) {
    registerTooarkCode();
    const elRef = ref<ArkCodeEditorElement | null>(null);

    const syncValue = (): void => {
      const el = elRef.value;
      if (el && props.value !== undefined && el.value !== props.value) el.value = props.value;
    };
    // Sem o proxy do Vue (toRaw): o CodeMirror compara extensões por identidade.
    const syncProperties = (): void => {
      const el = elRef.value as unknown as Record<string, unknown> | null;
      if (!el) return;
      for (const key of PROPERTY_KEYS) {
        const next = props[key] === undefined ? undefined : toRaw(props[key]);
        if (next !== undefined && el[key] !== next) el[key] = next;
      }
    };
    watch(() => props.value, syncValue);
    watch(() => PROPERTY_KEYS.map((key) => props[key]), syncProperties);

    const changeHandler = (event: Event) => emit("change", event as CustomEvent<{ value: string }>);
    const submitHandler = (event: Event) => emit("ark-submit", event as CustomEvent<{ value: string }>);
    const errorHandler = (event: Event) => emit("ark-format-error", event as CustomEvent<{ error: unknown }>);
    onMounted(() => {
      syncValue();
      syncProperties();
      elRef.value?.addEventListener("change", changeHandler);
      elRef.value?.addEventListener("ark-submit", submitHandler);
      elRef.value?.addEventListener("ark-format-error", errorHandler);
    });
    onBeforeUnmount(() => {
      elRef.value?.removeEventListener("change", changeHandler);
      elRef.value?.removeEventListener("ark-submit", submitHandler);
      elRef.value?.removeEventListener("ark-format-error", errorHandler);
    });

    const off = (on: boolean | undefined): string | undefined => (on === false ? "false" : undefined);
    return () =>
      h("ark-code-editor", {
        ...attrs,
        ref: elRef,
        testid: props.testid,
        language: props.language,
        theme: props.theme,
        readonly: props.readonly ? "" : undefined,
        placeholder: props.placeholder,
        "min-height": props.minHeight,
        "max-height": props.maxHeight,
        "line-numbers": off(props.lineNumbers),
        fold: off(props.fold),
        wrap: props.wrap ? "" : undefined,
        "indent-style": props.indentStyle,
        "indent-size": props.indentSize,
        "line-ending": props.lineEnding,
        "tab-indent": off(props.tabIndent),
        autocomplete: off(props.autocomplete),
        "mark-unknown-variables": props.markUnknownVariables ? "" : undefined,
        "single-line": props.singleLine ? "" : undefined,
        size: props.size
      });
  }
});
