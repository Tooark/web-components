import type { ArkDrawerCloseReason, ArkDrawerStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, type PropsWithChildren, useEffect, useRef } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkDrawerProps = PropsWithChildren<
  ArkDrawerStyleOptions & {
    /** Aberta; a saida anima antes de esconder. */
    open?: boolean;
    /** Titulo (h2) e nome acessivel. Sem ele, passe aria-label. */
    label?: string;
    /** Esconde o botao de fechar do cabecalho. */
    noCloseButton?: boolean;
    /** Esc e clique no scrim nao fecham (so no overlay). */
    persistent?: boolean;
    /** A pagina continua rolando com a gaveta aberta em overlay. */
    noScrollLock?: boolean;
    "aria-label"?: string;
    className?: string;
    onOpen?: (event: CustomEvent) => void;
    /** O fechamento comecou; detail.reason diz por que (escape, backdrop, close-button, api). */
    onClose?: (event: CustomEvent<{ reason: ArkDrawerCloseReason }>) => void;
  }
>;

export function ArkDrawer(props: ArkDrawerProps): React.JSX.Element {
  const {
    children,
    className,
    open,
    size,
    noCloseButton,
    persistent,
    noScrollLock,
    localeJson,
    onOpen,
    onClose,
    ...rest
  } = props;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleOpen = (event: Event): void => onOpen?.(event as CustomEvent);
    const handleClose = (event: Event): void => onClose?.(event as CustomEvent<{ reason: ArkDrawerCloseReason }>);
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
    size: size === undefined ? undefined : String(size),
    "no-close-button": noCloseButton ? "" : undefined,
    persistent: persistent ? "" : undefined,
    "no-scroll-lock": noScrollLock ? "" : undefined,
    "locale-json": localeJson
  };

  return createElement("ark-drawer", attrs, children);
}
