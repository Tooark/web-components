import type { ArkTooltipStyleOptions } from "@tooark/core";
import type { ArkTooltip as ArkTooltipElement } from "@tooark/web-components";
import React, { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import type { ArkDomProps } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkTooltipProps = PropsWithChildren<
  ArkDomProps<
    ArkTooltipStyleOptions & {
      /** Texto do balao; para conteudo rico, passe um filho com slot="content". */
      content?: string;
      /** Aberto; refletido do estado do balao. */
      open?: boolean;
      className?: string;
    }
  >
>;

export const ArkTooltip = forwardRef<ArkTooltipElement, ArkTooltipProps>(
  function ArkTooltip(props, forwardedRef): React.JSX.Element {
    const { children, className, open, delay, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...rest,
      ref: forwardedRef,
      class: className,
      open: open ? "" : undefined,
      delay: delay === undefined ? undefined : String(delay)
    };

    return createElement("ark-tooltip", attrs, children);
  }
);
