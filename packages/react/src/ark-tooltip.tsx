import type { ArkTooltipStyleOptions } from "@tooark/core";
import React, { createElement, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register";

export type ArkTooltipProps = PropsWithChildren<
  ArkTooltipStyleOptions & {
    /** Texto do balao; para conteudo rico, passe um filho com slot="content". */
    content?: string;
    /** Aberto; refletido do estado do balao. */
    open?: boolean;
    className?: string;
  }
>;

export function ArkTooltip(props: ArkTooltipProps): React.JSX.Element {
  const { children, className, open, delay, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const attrs: Record<string, string | undefined> = {
    ...rest,
    class: className,
    open: open ? "" : undefined,
    delay: delay === undefined ? undefined : String(delay)
  };

  return createElement("ark-tooltip", attrs, children);
}
