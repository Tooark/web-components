import type { ArkKvBulkFormat, ArkKvRow, ArkLang, ArkSize, ArkTheme } from "@tooark/core";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref, watch } from "vue";
import { ensureTooarkComponentsRegistered } from "./register.js";

export const ArkKvEditor = defineComponent({
  name: "ArkKvEditor",
  inheritAttrs: false,
  emits: ["change", "ark-add", "ark-delete"],
  props: {
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
    size: { type: String as PropType<ArkSize>, default: "md" },
    theme: { type: String as PropType<ArkTheme>, default: "auto" },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    localeJson: { type: String, default: undefined }
  },
  setup(props, { attrs, emit }) {
    ensureTooarkComponentsRegistered();
    const elRef = ref<(HTMLElement & { rows: ArkKvRow[] }) | null>(null);

    // `rows` e propriedade (objetos), nao atributo.
    const syncRows = () => {
      if (elRef.value && props.rows) elRef.value.rows = props.rows;
    };
    watch(() => props.rows, syncRows, { deep: true });

    // Eventos customizados do DOM: ouvidos no elemento, nao pelo h(), que nao mapeia nomes com hifen.
    const addHandler = (event: Event) => emit("ark-add", event as CustomEvent<{ id: string }>);
    const deleteHandler = (event: Event) => emit("ark-delete", event as CustomEvent<{ id: string }>);
    onMounted(() => {
      syncRows();
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
