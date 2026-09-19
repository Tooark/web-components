import type { ArkSwitchStyleOptions } from "@tooark/core";
import React, { createElement, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkSwitchProps = ArkSwitchStyleOptions & {
  disabled?: boolean;
  name?: string;
  value?: string;
  label?: string;
  className?: string;
  onChange?: (event: CustomEvent<{ checked: boolean }>) => void;
};

export function ArkSwitch(props: ArkSwitchProps): React.JSX.Element {
  const { className, checked, labels, labelOn, labelOff, icons, disabled, onChange, ...rest } = props;

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  const ref = React.useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;

    const handler = (event: Event) => onChange(event as CustomEvent<{ checked: boolean }>);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [onChange]);

  const attrs: Record<string, string | boolean | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    checked: checked ? "" : undefined,
    disabled: disabled ? "" : undefined,
    labels: labels ? "" : undefined,
    icons: icons ? "" : undefined,
    "label-on": labelOn,
    "label-off": labelOff
  };

  return createElement("ark-switch", attrs);
}
