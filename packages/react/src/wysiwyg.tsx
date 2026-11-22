// Entry point @tooark/react/wysiwyg: os wrappers do ark-wysiwyg-editor e do ark-wysiwyg-viewer, fora da entrada
// principal para que o Tiptap (dependência do @tooark/wysiwyg) só entre no app que importa este caminho. Também tipa
// as tags cruas com as propriedades JS.
import type { ArkLang } from "@tooark/core";
import {
  type ArkWysiwygContent,
  type ArkWysiwygEditor as ArkWysiwygEditorElement,
  type ArkWysiwygUploadError,
  type ArkWysiwygUploader,
  type ArkWysiwygViewer as ArkWysiwygViewerElement,
  registerTooarkWysiwyg
} from "@tooark/wysiwyg";
import type React from "react";
import { createElement, forwardRef, useEffect, useRef } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { useForwardedRef } from "./use-forwarded-ref.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

/** Atributos da tag `ark-wysiwyg-editor`, os mesmos da entrada principal, mais as propriedades JS. */
type ArkWysiwygEditorTagProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  testid?: string;
  theme?: "auto" | "light" | "dark";
  placeholder?: string;
  editable?: boolean | "false";
  toolbar?: string;
  lang?: ArkLang;
  "locale-json"?: string;
  colors?: string;
  highlights?: string;
  "max-file-size"?: number;
  /** Gancho de upload de imagem e vídeo (propriedade JS). */
  uploadFile?: ArkWysiwygUploader | null;
};

// O `content` (JSON) fica só nos wrappers: o React já tipa `content` como texto em todo elemento (o atributo da tag
// <meta>), e uma redeclaração só pode estreitar o tipo herdado, então na tag crua ele sairia `string & JSONContent`.
// Na tag crua, o conteúdo vai pela ref (`el.content = doc`).

// A tag crua do editor ganha o gancho de upload no JSX; redeclarar com um tipo mais estreito é aceito pela herança.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ark-wysiwyg-editor": ArkWysiwygEditorTagProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ark-wysiwyg-editor": ArkWysiwygEditorTagProps;
    }
  }
}

export type ArkWysiwygEditorProps = ArkDomProps<{
  /**
   * Conteúdo como JSON do Tiptap. Atribuído só quando a referência muda e fora do histórico de desfazer: o objeto que
   * o `onChange` devolve, repassado, não reescreve o editor.
   */
  content?: ArkWysiwygContent | null;
  /** Gancho de upload; sem ele não há botões de mídia e arquivos colados são recusados. */
  uploadFile?: ArkWysiwygUploader | null;
  /** Grupos e itens da toolbar (`style,marks,...`, `all`, `none`). */
  toolbar?: string;
  theme?: "auto" | "light" | "dark";
  placeholder?: string;
  /** false desabilita a edição. Padrão: true. */
  editable?: boolean;
  lang?: ArkLang;
  /** Rótulos próprios (objeto ou JSON), por cima do idioma. */
  localeJson?: string | Record<string, string>;
  /** Paleta da cor do texto (cores CSS). */
  colors?: string[];
  /** Paleta do marca-texto (cores CSS). */
  highlights?: string[];
  /** Tamanho máximo de arquivo em bytes. Padrão: 10 MiB. */
  maxFileSize?: number;
  testid?: string;
  className?: string;
  /** Cada edição, com o JSON do Tiptap em `detail`. */
  onChange?: (event: CustomEvent<ArkWysiwygContent>) => void;
  /** Arquivo recusado ou upload que falhou, com o motivo em `detail`. */
  onUploadError?: (event: CustomEvent<ArkWysiwygUploadError>) => void;
}>;

export const ArkWysiwygEditor = forwardRef<ArkWysiwygEditorElement, ArkWysiwygEditorProps>(
  function ArkWysiwygEditor(props, forwardedRef): React.JSX.Element {
    const {
      className,
      content,
      uploadFile,
      editable,
      localeJson,
      colors,
      highlights,
      maxFileSize,
      onChange,
      onUploadError,
      ...rest
    } = props;
    const [ref, setRef] = useForwardedRef<ArkWysiwygEditorElement>(forwardedRef);
    // O último JSON que o editor emitiu e o último atribuído: o getter `content` monta um objeto novo a cada leitura,
    // então a comparação é com o que passou por aqui.
    const known = useRef<ArkWysiwygContent | null | undefined>(undefined);

    useEffect(() => {
      registerTooarkWysiwyg();
    }, []);

    // Conteúdo e gancho pela propriedade, só com referência nova: setContent troca o documento fora do histórico, e
    // o objeto que o onChange acabou de entregar, repassado pelo app, não reescreve o editor nem move o cursor.
    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (!el || content === undefined || content === known.current) return;
      known.current = content;
      el.content = content;
    }, [ref, content]);

    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (el && uploadFile !== undefined && el.uploadFile !== uploadFile) el.uploadFile = uploadFile;
    }, [ref, uploadFile]);

    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      const handleChange = (event: Event): void => {
        known.current = (event as CustomEvent<ArkWysiwygContent>).detail;
        onChange?.(event as CustomEvent<ArkWysiwygContent>);
      };
      const handleError = (event: Event): void => onUploadError?.(event as CustomEvent<ArkWysiwygUploadError>);
      el.addEventListener("ark-wysiwyg-change", handleChange);
      el.addEventListener("ark-wysiwyg-upload-error", handleError);
      return () => {
        el.removeEventListener("ark-wysiwyg-change", handleChange);
        el.removeEventListener("ark-wysiwyg-upload-error", handleError);
      };
    }, [ref, onChange, onUploadError]);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      editable: editable === false ? "false" : undefined,
      "locale-json":
        localeJson === undefined || typeof localeJson === "string" ? localeJson : JSON.stringify(localeJson),
      colors: colors ? JSON.stringify(colors) : undefined,
      highlights: highlights ? JSON.stringify(highlights) : undefined,
      "max-file-size": maxFileSize
    };

    return createElement("ark-wysiwyg-editor", attrs);
  }
);

export type ArkWysiwygViewerProps = ArkDomProps<{
  /** Conteúdo como JSON do Tiptap, sanitizado ao entrar. */
  content?: ArkWysiwygContent | null;
  theme?: "auto" | "light" | "dark";
  testid?: string;
  className?: string;
}>;

export const ArkWysiwygViewer = forwardRef<ArkWysiwygViewerElement, ArkWysiwygViewerProps>(
  function ArkWysiwygViewer(props, forwardedRef): React.JSX.Element {
    const { className, content, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkWysiwygViewerElement>(forwardedRef);

    useEffect(() => {
      registerTooarkWysiwyg();
    }, []);

    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (el && content !== undefined && el.content !== content) el.content = content;
    }, [ref, content]);

    return createElement("ark-wysiwyg-viewer", { ...rest, ref: setRef, class: className });
  }
);
