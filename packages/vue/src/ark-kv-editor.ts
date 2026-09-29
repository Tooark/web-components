import type { ArkKvBulkFormat, ArkKvRow, ArkKvValueField, ArkLang, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref, watch } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkKvEditor = defineComponent({
  name: "ArkKvEditor",
  inheritAttrs: false,
  emits: ["change", "ark-add", "ark-delete"],
  props: {
    /** Propagado como data-testid ao elemento principal e sufixado nas partes internas. */
    testid: { type: String, default: undefined },
    rows: { type: Array as PropType<ArkKvRow[]>, default: undefined },
    bulk: { type: Boolean, default: false },
    bulkFormat: { type: String as PropType<ArkKvBulkFormat>, default: undefined },
    types: { type: Array as PropType<string[]>, default: undefined },
    description: { type: Boolean, default: false },
    secret: { type: Boolean, default: false },
    keyPlaceholder: { type: String, default: undefined },
    valuePlaceholder: { type: String, default: undefined },
    descriptionPlaceholder: { type: String, default: undefined },
    readonly: { type: Boolean, default: false },
    /** Cria a celula de valor de cada linha no lugar do ark-input; linhas secretas mantem o campo de senha. */
    valueField: { type: Function as PropType<ArkKvValueField>, default: undefined },
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<(HTMLElement & { rows: ArkKvRow[]; valueField: ArkKvValueField | null }) | null>(null);

    // `rows` e propriedade (objetos), nao atributo.
    const syncRows = () => {
      if (elRef.value && props.rows) elRef.value.rows = props.rows;
    };
    watch(() => props.rows, syncRows, { deep: true });

    // `valueField` e funcao, entao propriedade; so e gravada quando o app da uma, para o editor sem ela nao recriar
    // as linhas na montagem. Uma funcao nova recria as celulas de valor.
    const syncValueField = () => {
      const el = elRef.value;
      if (el && (props.valueField || el.valueField)) el.valueField = props.valueField ?? null;
    };
    watch(() => props.valueField, syncValueField);

    // Eventos customizados do DOM: ouvidos no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const addHandler = (event: Event) => emit("ark-add", event as CustomEvent<{ id: string }>);
    const deleteHandler = (event: Event) => emit("ark-delete", event as CustomEvent<{ id: string }>);
    onMounted(() => {
      syncRows();
      syncValueField();
      elRef.value?.addEventListener("ark-add", addHandler);
      elRef.value?.addEventListener("ark-delete", deleteHandler);
    });
    onBeforeUnmount(() => {
      elRef.value?.removeEventListener("ark-add", addHandler);
      elRef.value?.removeEventListener("ark-delete", deleteHandler);
    });

    return () =>
      h("ark-kv-editor", {
        ...attrs,
        testid: props.testid,
        ref: elRef,
        bulk: props.bulk ? "" : undefined,
        "bulk-format": props.bulkFormat,
        types: props.types && props.types.length > 0 ? props.types.join(",") : undefined,
        description: props.description ? "" : undefined,
        secret: props.secret ? "" : undefined,
        "key-placeholder": props.keyPlaceholder,
        "value-placeholder": props.valuePlaceholder,
        "description-placeholder": props.descriptionPlaceholder,
        readonly: props.readonly ? "" : undefined,
        size: props.size,
        theme: props.theme,
        lang: props.lang,
        "locale-json": props.localeJson,
        onChange: (event: CustomEvent<{ rows: ArkKvRow[] }>) => emit("change", event)
      });
  }
});
