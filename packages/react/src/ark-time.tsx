import type { ArkTimeFormat, ArkTimeStyleOptions } from "@tooark/core";
import type { ArkTime as ArkTimeElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkTimeProps = ArkDomProps<
  ArkTimeStyleOptions & {
    /** Instante: ISO com ou sem fuso, só a data (`YYYY-MM-DD`), um `Date` ou ms. */
    datetime?: string | number | Date;
    /** relative ("há 3 minutos"), date, time ou datetime. Padrão: "relative". */
    format?: ArkTimeFormat;
    className?: string;
  }
>;

/** `Date` e número viram ISO: o atributo é texto. */
function isoOf(value: string | number | Date | undefined): string | undefined {
  if (value === undefined || typeof value === "string") return value || undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export const ArkTime = forwardRef<ArkTimeElement, ArkTimeProps>(
  function ArkTime(props, forwardedRef): React.JSX.Element {
    const { className, datetime, ...rest } = props;

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: forwardedRef,
      class: className,
      datetime: isoOf(datetime)
    };

    return createElement("ark-time", attrs);
  }
);
