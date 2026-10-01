import type { ArkMenuAlign, ArkMenuDirection, ArkMenuItemStyleOptions, ArkMenuStyleOptions } from "@tooark/core";
import type { ArkMenu as ArkMenuElement, ArkMenuItem as ArkMenuItemElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

export type ArkMenuProps = PropsWithChildren<
  ArkDomProps<
    ArkMenuStyleOptions & {
      /** id do gatilho (vira o atributo for): o menu escreve aria-* nele e escuta clique e setas. */
      htmlFor?: string;
      /** Aberto; refletido do estado do popover. */
      open?: boolean;
      /** Alinhamento em relacao ao gatilho. Padrao: "start". */
      align?: ArkMenuAlign;
      /** Lado do gatilho; vira quando nao cabe. Padrao: "down". */
      direction?: ArkMenuDirection;
      "aria-label"?: string;
      className?: string;
      /** Um item foi escolhido; o menu fecha em seguida. */
      onSelect?: (event: CustomEvent<{ value: string }>) => void;
      onOpen?: (event: CustomEvent) => void;
      onClose?: (event: CustomEvent) => void;
    }
  >
>;

export const ArkMenu = forwardRef<ArkMenuElement, ArkMenuProps>(
  function ArkMenu(props, forwardedRef): React.JSX.Element {
    const { children, className, htmlFor, open, onSelect, onOpen, onClose, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkMenuElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;

      const handleSelect = (event: Event): void => onSelect?.(event as CustomEvent<{ value: string }>);
      const handleOpen = (event: Event): void => onOpen?.(event as CustomEvent);
      const handleClose = (event: Event): void => onClose?.(event as CustomEvent);
      el.addEventListener("ark-select", handleSelect);
      el.addEventListener("ark-open", handleOpen);
      el.addEventListener("ark-close", handleClose);
      return () => {
        el.removeEventListener("ark-select", handleSelect);
        el.removeEventListener("ark-open", handleOpen);
        el.removeEventListener("ark-close", handleClose);
      };
    }, [onSelect, onOpen, onClose]);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: setRef,
      class: className,
      for: htmlFor,
      open: open ? "" : undefined
    };

    return createElement("ark-menu", attrs, children);
  }
);

export type ArkMenuItemProps = PropsWithChildren<
  ArkDomProps<
    ArkMenuItemStyleOptions & {
      value?: string;
      disabled?: boolean;
      /** Item checkbox: true marcado, false desmarcado; omitido e um item comum. */
      checked?: boolean;
      /** Linha separadora (role separator). */
      divider?: boolean;
      /** Conteudo nao interativo (nome e e-mail), sem role de item. */
      static?: boolean;
      className?: string;
    }
  >
>;

export const ArkMenuItem = forwardRef<ArkMenuItemElement, ArkMenuItemProps>(
  function ArkMenuItem(props, forwardedRef): React.JSX.Element {
    const { children, className, disabled, checked, divider, static: isStatic, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      disabled: disabled ? "" : undefined,
      checked: checked === undefined ? undefined : checked ? "" : "false",
      divider: divider ? "" : undefined,
      static: isStatic ? "" : undefined
    };

    return createElement("ark-menu-item", attrs, children);
  }
);
