import type { ArkDialogCloseReason, ArkDialogStyleOptions } from "@tooark/core";
import type { ArkDialog as ArkDialogElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

export type ArkDialogProps = PropsWithChildren<
  ArkDomProps<
    ArkDialogStyleOptions & {
      /** Aberto; a saída anima antes de sair do top layer. */
      open?: boolean;
      /** Título (h2) e nome acessível. Sem ele, passe aria-label. */
      label?: string;
      /** Esconde o botão de fechar do cabeçalho. */
      noCloseButton?: boolean;
      /** Esc e clique no scrim não fecham. */
      persistent?: boolean;
      /** A página continua rolando com o diálogo aberto. */
      noScrollLock?: boolean;
      "aria-label"?: string;
      className?: string;
      onOpen?: (event: CustomEvent) => void;
      /** O fechamento começou; detail.reason diz por que (escape, backdrop, close-button, api). */
      onClose?: (event: CustomEvent<{ reason: ArkDialogCloseReason }>) => void;
    }
  >
>;

export const ArkDialog = forwardRef<ArkDialogElement, ArkDialogProps>(
  function ArkDialog(props, forwardedRef): React.JSX.Element {
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
    const [ref, setRef] = useForwardedRef<ArkDialogElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useIsomorphicLayoutEffect(() => {
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

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      open: open ? "" : undefined,
      // Número vira string aqui; o componente acrescenta px a números sem unidade.
      width: width === undefined ? undefined : String(width),
      height: height === undefined ? undefined : String(height),
      "no-close-button": noCloseButton ? "" : undefined,
      persistent: persistent ? "" : undefined,
      "no-scroll-lock": noScrollLock ? "" : undefined,
      "locale-json": localeJson
    };

    return createElement("ark-dialog", attrs, children);
  }
);
