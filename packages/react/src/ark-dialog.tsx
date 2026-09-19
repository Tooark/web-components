import type { ArkDialogCloseReason, ArkDialogStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkDialogProps = PropsWithChildren<
  ArkDialogStyleOptions & {
    /** Aberto; a saida anima antes de sair do top layer. */
    open?: boolean;
    /** Titulo (h2) e nome acessivel. Sem ele, passe aria-label. */
    label?: string;
    /** Esconde o botao de fechar do cabecalho. */
    noCloseButton?: boolean;
    /** Esc e clique no scrim nao fecham. */
    persistent?: boolean;
    /** A pagina continua rolando com o dialogo aberto. */
    noScrollLock?: boolean;
    "aria-label"?: string;
    className?: string;
    onOpen?: (event: CustomEvent) => void;
    /** O fechamento comecou; detail.reason diz por que (escape, backdrop, close-button, api). */
    onClose?: (event: CustomEvent<{ reason: ArkDialogCloseReason }>) => void;
  }
>;

export function ArkDialog(props: ArkDialogProps): React.JSX.Element {
  const {
    children,
    className,
    open,
    width,
    height,
    noCloseButton,
    persistent,
    noScrollLock,
    localeJson,
    onOpen,
    onClose,
    ...rest
  } = props;
  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleOpen = (event: Event): void => onOpen?.(event as CustomEvent);
    const handleClose = (event: Event): void => onClose?.(event as CustomEvent<{ reason: ArkDialogCloseReason }>);
    el.addEventListener("ark-open", handleOpen);
    el.addEventListener("ark-close", handleClose);
    return () => {
      el.removeEventListener("ark-open", handleOpen);
      el.removeEventListener("ark-close", handleClose);
    };
  }, [onOpen, onClose]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    open: open ? "" : undefined,
    // Numero vira string aqui; o componente acrescenta px a numeros sem unidade.
    width: width === undefined ? undefined : String(width),
    height: height === undefined ? undefined : String(height),
    "no-close-button": noCloseButton ? "" : undefined,
    persistent: persistent ? "" : undefined,
    "no-scroll-lock": noScrollLock ? "" : undefined,
    "locale-json": localeJson
  };

  return createElement("ark-dialog", attrs, children);
}
