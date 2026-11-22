// Entry point @tooark/vue/wysiwyg: os wrappers do ark-wysiwyg-editor e do ark-wysiwyg-viewer, fora da entrada
// principal para que o Tiptap (dependência do @tooark/wysiwyg) só entre no app que importa este caminho.
import type { ArkLang } from "@tooark/core";
import {
  type ArkWysiwygContent,
  type ArkWysiwygEditor as ArkWysiwygEditorElement,
  type ArkWysiwygUploadError,
  type ArkWysiwygUploader,
  type ArkWysiwygViewer as ArkWysiwygViewerElement,
  registerTooarkWysiwyg
} from "@tooark/wysiwyg";
import { defineComponent, h, onBeforeUnmount, onMounted, type PropType, ref, toRaw, watch } from "vue";

export const ArkWysiwygEditor = defineComponent({
  name: "ArkWysiwygEditor",
  inheritAttrs: false,
  emits: ["ark-wysiwyg-change", "ark-wysiwyg-upload-error"],
  props: {
    /** Propagado como data-testid às partes do editor. */
    testid: { type: String, default: undefined },
    /**
     * Conteúdo como JSON do Tiptap. Atribuído só quando a referência muda e fora do histórico de desfazer: o objeto
     * que o `ark-wysiwyg-change` entregou, repassado, não reescreve o editor.
     */
    content: { type: Object as PropType<ArkWysiwygContent | null>, default: undefined },
    /** Gancho de upload; sem ele não há botões de mídia e arquivos colados são recusados. */
    uploadFile: { type: Function as PropType<ArkWysiwygUploader | null>, default: undefined },
    toolbar: { type: String, default: undefined },
    theme: { type: String as PropType<"auto" | "light" | "dark">, default: undefined },
    placeholder: { type: String, default: undefined },
    /** false desabilita a edição. Padrão: true. */
    editable: { type: Boolean, default: undefined },
    lang: { type: String as PropType<ArkLang>, default: undefined },
    /** Rótulos próprios (objeto ou JSON), por cima do idioma. */
    localeJson: { type: [String, Object] as PropType<string | Record<string, string>>, default: undefined },
    colors: { type: Array as PropType<string[]>, default: undefined },
    highlights: { type: Array as PropType<string[]>, default: undefined },
    maxFileSize: { type: Number, default: undefined }
  },
  setup(props, { attrs, emit }) {
    registerTooarkWysiwyg();
    const elRef = ref<ArkWysiwygEditorElement | null>(null);
    // O último JSON emitido ou atribuído: o getter `content` monta um objeto novo a cada leitura.
    let known: ArkWysiwygContent | null | undefined;

    const syncContent = (): void => {
      const el = elRef.value;
      const next = props.content === undefined ? undefined : (toRaw(props.content) ?? null);
      if (!el || next === undefined || next === known) return;
      known = next;
      el.content = next;
    };
    const syncUploader = (): void => {
      const el = elRef.value;
      if (el && props.uploadFile !== undefined && el.uploadFile !== props.uploadFile) el.uploadFile = props.uploadFile;
    };
    watch(() => props.content, syncContent);
    watch(() => props.uploadFile, syncUploader);

    const changeHandler = (event: Event) => {
      known = (event as CustomEvent<ArkWysiwygContent>).detail;
      emit("ark-wysiwyg-change", event as CustomEvent<ArkWysiwygContent>);
    };
    const errorHandler = (event: Event) =>
      emit("ark-wysiwyg-upload-error", event as CustomEvent<ArkWysiwygUploadError>);
    onMounted(() => {
      syncUploader();
      syncContent();
      elRef.value?.addEventListener("ark-wysiwyg-change", changeHandler);
      elRef.value?.addEventListener("ark-wysiwyg-upload-error", errorHandler);
    });
    onBeforeUnmount(() => {
      elRef.value?.removeEventListener("ark-wysiwyg-change", changeHandler);
      elRef.value?.removeEventListener("ark-wysiwyg-upload-error", errorHandler);
    });

    return () =>
      h("ark-wysiwyg-editor", {
        ...attrs,
        ref: elRef,
        testid: props.testid,
        toolbar: props.toolbar,
        theme: props.theme,
        placeholder: props.placeholder,
        editable: props.editable === false ? "false" : undefined,
        lang: props.lang,
        "locale-json":
          props.localeJson === undefined || typeof props.localeJson === "string"
            ? props.localeJson
            : JSON.stringify(props.localeJson),
        colors: props.colors ? JSON.stringify(props.colors) : undefined,
        highlights: props.highlights ? JSON.stringify(props.highlights) : undefined,
        "max-file-size": props.maxFileSize
      });
  }
});

export const ArkWysiwygViewer = defineComponent({
  name: "ArkWysiwygViewer",
  inheritAttrs: false,
  props: {
    testid: { type: String, default: undefined },
    /** Conteúdo como JSON do Tiptap, sanitizado ao entrar. */
    content: { type: Object as PropType<ArkWysiwygContent | null>, default: undefined },
    theme: { type: String as PropType<"auto" | "light" | "dark">, default: undefined }
  },
  setup(props, { attrs }) {
    registerTooarkWysiwyg();
    const elRef = ref<ArkWysiwygViewerElement | null>(null);
    const syncContent = (): void => {
      const el = elRef.value;
      const next = props.content === undefined ? undefined : (toRaw(props.content) ?? null);
      if (el && next !== undefined && el.content !== next) el.content = next;
    };
    watch(() => props.content, syncContent);
    onMounted(syncContent);
    return () => h("ark-wysiwyg-viewer", { ...attrs, ref: elRef, testid: props.testid, theme: props.theme });
  }
});
